const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const MAX_BODY = 16384;
class InvalidRequest extends Error {}
class EmailFailure extends Error {
  constructor(code, message, status) { super(message); this.code = code; this.status = status; }
}
function emailFailure(response, result, accepted, recipient) {
  const status = response.status;
  const codes = (result.errors || []).map((error) => Number(error.code)).filter(Number.isFinite);
  // Logs contain diagnostic categories and numeric provider codes, never tokens,
  // recipients, email bodies, or raw upstream error text.
  if (status === 401 || status === 403) {
    console.error('inquiry-email', { category: 'EMAIL_AUTH_FAILED', status, providerCodes: codes });
    return new EmailFailure('EMAIL_AUTH_FAILED', 'The studio’s email service is temporarily unavailable. Please contact the studio by email.', 503);
  }
  if (status === 429) return new EmailFailure('EMAIL_RATE_LIMITED', 'Email delivery is busy. Please wait a few minutes and try again.', 503);
  if (result.result?.suppressed_recipients?.includes(recipient) || result.result?.permanent_bounces?.includes(recipient)) {
    console.error('inquiry-email', { category: 'EMAIL_RECIPIENT_REJECTED', status, providerCodes: codes });
    return new EmailFailure('EMAIL_RECIPIENT_REJECTED', 'The studio’s inbox is temporarily unavailable. Please try again later.', 503);
  }
  console.error('inquiry-email', { category: 'EMAIL_SEND_FAILED', status, providerCodes: codes });
  return new EmailFailure('EMAIL_SEND_FAILED', 'Your request could not be emailed. Please try again shortly.', 502);
}
function failureResponse(error) {
  return json({ error: error instanceof EmailFailure ? error.message : 'Unable to reach the email service. Please try again shortly.',
    code: error instanceof EmailFailure ? error.code : 'EMAIL_CONNECTION_FAILED' }, error instanceof EmailFailure ? error.status : 502);
}
function field(input, key, max, required = true) {
  const value = input[key];
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) throw new InvalidRequest('Please check your contact details.');
  return value.trim();
}
export function inquiryPayload(input, catalog, env) {
  if (!input || typeof input !== 'object' || input.website) throw new InvalidRequest('Invalid request.');
  const email = field(input, 'contactEmail', 254);
  if (!EMAIL.test(email)) throw new InvalidRequest('Please enter a valid email address.');
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(input.requestId || '')) throw new InvalidRequest('Invalid request identifier.');
  let heading, lines;
  if (input.kind === 'artwork') {
    const product = catalog.find((p) => p.id === input.productId);
    if (!product) throw new InvalidRequest('Artwork not found.');
    heading = `Availability & price request: ${product.name}`;
    lines = [`Artwork: ${product.name}`, `Artwork link: https://somedaysinmay.com/product/${product.id}`,
      `First name: ${field(input, 'firstName', 120)}`, `Last name: ${field(input, 'lastName', 120)}`, `Address: ${field(input, 'address', 500, false) || 'Not supplied'}`];
  } else if (input.kind === 'contact' || input.kind === 'commission') {
    heading = input.kind === 'commission' ? 'Request for commission' : 'Contact inquiry';
    lines = [`Name: ${field(input, 'name', 120)}`, `Country / city: ${field(input, 'location', 150, false)}`,
      `Preferred size: ${field(input, 'size', 150, false)}`, `Budget: ${field(input, 'budget', 150, false)}`, '', field(input, 'message', 4000)];
  } else if (input.kind === 'purchase') {
    heading = 'Purchase request';
    const shipping = input.shipping;
    if (!shipping || typeof shipping !== 'object' || !Array.isArray(input.items) || !input.items.length || input.items.length > 50) throw new InvalidRequest('Invalid purchase request.');
    lines = [`Name: ${field(shipping, 'name', 120)}`, `Address: ${field(shipping, 'address', 300)}`, `City: ${field(shipping, 'city', 120)}`,
      `Postcode: ${field(shipping, 'postcode', 32)}`, `Phone: ${field(shipping, 'phone', 40, false)}`, ''];
    for (const item of input.items) {
      const product = catalog.find((p) => p.id === item?.id && p.availability === 'Available');
      if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new InvalidRequest('Invalid purchase item.');
      lines.push(`${product.name} × ${item.quantity}`);
    }
    lines.push('', field(input, 'message', 4000, false), '', 'This is a purchase request, not a payment confirmation.');
  } else throw new InvalidRequest('Unknown request type.');
  return { to: [env.INQUIRY_NOTIFICATION_EMAIL], from: env.INQUIRY_FROM_EMAIL, reply_to: email,
    subject: `${heading} — Somedays in May`, text: `${heading}\n\nReply email: ${email}\n${lines.join('\n')}` };
}
function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
async function readBody(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new InvalidRequest('Expected JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new InvalidRequest('Empty request.');
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) { await reader.cancel(); throw new InvalidRequest('Request is too large.'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new InvalidRequest('Invalid JSON.'); }
}

export function createInquiryHandler({ catalog, fetchImpl = fetch, now = Date.now } = {}) {
  // These bounded caches reduce repeat clicks and basic abuse within an isolate.
  // They are not a durable, global rate limit or exactly-once delivery ledger.
  const recent = new Map();
  const attempts = new Map();
  return async function handle(request, env) {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Request origin is not allowed.' }, 403);
    let input, payload;
    try { input = await readBody(request); payload = inquiryPayload(input, catalog, env); }
    catch (error) { return json({ error: error instanceof InvalidRequest ? error.message : 'Invalid request.' }, 400); }
    if (!/^[a-f0-9]{32}$/i.test(env.CLOUDFLARE_EMAIL_ACCOUNT_ID || '') || !env.CLOUDFLARE_EMAIL_API_TOKEN || !EMAIL.test(env.INQUIRY_NOTIFICATION_EMAIL || '') || !EMAIL.test(env.INQUIRY_FROM_EMAIL || '')) {
      console.error('inquiry-email', { category: 'EMAIL_NOT_CONFIGURED' });
      return json({ error: 'Requests are temporarily unavailable. Please contact the studio by email.', code: 'EMAIL_NOT_CONFIGURED' }, 503);
    }
    const time = now();
    for (const [key, record] of recent) if (time - record.time > 600000) recent.delete(key);
    for (const [key, record] of attempts) if (time - record.time > 600000) attempts.delete(key);
    const signature = JSON.stringify(payload);
    const previous = recent.get(input.requestId);
    if (previous) return previous.signature === signature ? previous.promise.then(() => json({ sent: true }), (error) => failureResponse(error)) : json({ error: 'Please start a new request.' }, 409);
    const ip = request.headers.get('CF-Connecting-IP') || 'local';
    const rate = attempts.get(ip) || { time, count: 0 };
    if (rate.count >= 10) return json({ error: 'Please wait before sending another request.' }, 429);
    if (attempts.size >= 1000 && !attempts.has(ip)) attempts.delete(attempts.keys().next().value);
    attempts.set(ip, { ...rate, count: rate.count + 1 });
    if (recent.size >= 500) recent.delete(recent.keys().next().value);
    const promise = (async () => {
      const response = await fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_EMAIL_ACCOUNT_ID}/email/sending/send`, {
        method: 'POST', signal: AbortSignal.timeout(20000),
        headers: { Authorization: `Bearer ${env.CLOUDFLARE_EMAIL_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      const accepted = [...(result.result?.delivered || []), ...(result.result?.queued || [])];
      if (!response.ok || result.success !== true || !accepted.includes(env.INQUIRY_NOTIFICATION_EMAIL)) throw emailFailure(response, result, accepted, env.INQUIRY_NOTIFICATION_EMAIL);
    })();
    recent.set(input.requestId, { time, signature, promise });
    try { await promise; return json({ sent: true }); }
    catch (error) { recent.delete(input.requestId); return failureResponse(error); }
  };
}
