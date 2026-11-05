import test from 'node:test';
import assert from 'node:assert/strict';
import { createInquiryHandler } from '../server/inquiry.js';
import { build } from 'esbuild';
const bundle = await build({ entryPoints: ['src/data/products.ts'], bundle: true, write: false, platform: 'node', format: 'esm' });
const { products: catalog } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const env = { CLOUDFLARE_EMAIL_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_EMAIL_API_TOKEN: 'server-secret', INQUIRY_NOTIFICATION_EMAIL: 'owner@example.com', INQUIRY_FROM_EMAIL: 'notifications@example.com' };
const input = { kind: 'artwork', requestId: 'a6938432-7a4c-4d03-985d-6fccd5eb683e', firstName: ' Jane ', lastName: 'Doe', address: '', contactEmail: 'buyer@example.com', productId: 'swirls', productName: 'FORGED TITLE', to: 'attacker@example.com', website: '' };
function req(data = input, options = {}) {
  return new Request('https://somedaysinmay.com/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://somedaysinmay.com', ...options.headers }, body: JSON.stringify(data) });
}
function accepted() { return Response.json({ success: true, result: { queued: [env.INQUIRY_NOTIFICATION_EMAIL], delivered: [], permanent_bounces: [], suppressed_recipients: [] } }); }

test('uses server recipient, catalog title and customer Reply-To without leaking settings', async () => {
  let payload;
  const handle = createInquiryHandler({ catalog, fetchImpl: async (url, request) => {
    assert.match(url, /\/accounts\/a{32}\/email\/sending\/send$/);
    assert.equal(request.headers.Authorization, 'Bearer server-secret');
    payload = JSON.parse(request.body);
    return accepted();
  } });
  const response = await handle(req(), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { sent: true });
  assert.deepEqual(payload.to, ['owner@example.com']);
  assert.equal(payload.reply_to, 'buyer@example.com');
  assert.match(payload.subject, /Swirls/);
  assert.doesNotMatch(payload.subject, /FORGED/);
  assert.match(payload.text, /First name: Jane/);
  assert.equal(payload.html, undefined);
});

test('invalid email, unknown artwork, oversized fields, honeypot and cross-origin requests never send', async () => {
  const handle = createInquiryHandler({ catalog, fetchImpl: () => { throw new Error('Must not send'); } });
  for (const patch of [{ contactEmail: 'bad\r\nBcc: other@example.com' }, { productId: 'missing' }, { firstName: ' ' }, { address: 'x'.repeat(501) }, { website: 'bot' }]) {
    assert.equal((await handle(req({ ...input, ...patch }), env)).status, 400);
  }
  assert.equal((await handle(req(input, { headers: { Origin: 'https://attacker.example' } }), env)).status, 403);
  assert.equal((await handle(req({ ...input, ignored: 'x'.repeat(17000) }), env)).status, 400);
  const invalidJson = new Request('https://somedaysinmay.com/api/inquiry', { method: 'POST', headers: { Origin: 'https://somedaysinmay.com', 'Content-Type': 'application/json' }, body: '{' });
  assert.equal((await handle(invalidJson, env)).status, 400);
});

test('missing config, provider failure and suppressed destinations never report success', async () => {
  const handle = createInquiryHandler({ catalog, fetchImpl: async () => Response.json({ success: false }, { status: 403 }) });
  assert.equal((await handle(req(), {})).status, 503);
  assert.equal((await handle(req(), env)).status, 502);
  const suppressed = createInquiryHandler({ catalog, fetchImpl: async () => Response.json({ success: true, result: { suppressed_recipients: ['owner@example.com'] } }) });
  assert.equal((await suppressed(req(), env)).status, 502);
});

test('concurrent retries deduplicate within an isolate and failed sends can retry', async () => {
  let calls = 0;
  const handle = createInquiryHandler({ catalog, fetchImpl: async () => { calls++; return accepted(); } });
  const results = await Promise.all([handle(req(), env), handle(req(), env)]);
  assert.deepEqual(results.map(r => r.status), [200, 200]);
  assert.equal(calls, 1);
  assert.equal((await handle(req({ ...input, firstName: 'Changed' }), env)).status, 409);
  let fail = true;
  const retry = createInquiryHandler({ catalog, fetchImpl: async () => { if (fail) throw new Error('offline'); return accepted(); } });
  assert.equal((await retry(req(), env)).status, 502);
  fail = false;
  assert.equal((await retry(req(), env)).status, 200);
});

test('commission, contact and purchase messages include their submitted details', async () => {
  const messages = [];
  const handle = createInquiryHandler({ catalog, fetchImpl: async (_url, request) => { messages.push(JSON.parse(request.body)); return accepted(); } });
  for (const kind of ['commission', 'contact']) {
    const response = await handle(req({ kind, requestId: kind.padEnd(20, 'x'), contactEmail: 'buyer@example.com', name: 'Collector', location: 'Paris', size: 'Large', budget: '', message: 'I would like a painting.' }), env);
    assert.equal(response.status, 200);
  }
  const shipping = { name: 'Collector', address: '1 Main Street', city: 'Paris', postcode: '75001', phone: '' };
  const purchase = { kind: 'purchase', requestId: 'purchase'.padEnd(20, 'x'), contactEmail: 'buyer@example.com', shipping, items: [{ id: 'swirls', quantity: 2 }], message: '' };
  assert.equal((await handle(req(purchase), env)).status, 200);
  assert.match(messages[0].subject, /Request for commission/);
  assert.match(messages[1].text, /Country \/ city: Paris/);
  assert.match(messages[2].text, /Swirls × 2/);
  assert.equal((await handle(req({ ...purchase, items: [{ id: 'swirls', quantity: 100 }] }), env)).status, 400);
});

test('best-effort throttle expires and non-POST methods are refused', async () => {
  let time = 0;
  const handle = createInquiryHandler({ catalog, now: () => time, fetchImpl: async () => accepted() });
  for (let i = 0; i < 10; i++) assert.equal((await handle(req({ ...input, requestId: String(i).padEnd(20, 'x') }), env)).status, 200);
  assert.equal((await handle(req({ ...input, requestId: 'last'.padEnd(20, 'x') }), env)).status, 429);
  time = 600001;
  assert.equal((await handle(req({ ...input, requestId: 'last'.padEnd(20, 'x') }), env)).status, 200);
  assert.equal((await handle(new Request('https://somedaysinmay.com/api/inquiry'), env)).status, 405);
});
