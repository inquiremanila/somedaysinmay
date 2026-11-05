export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return Response.json({ error: 'Request origin is not allowed.' }, { status: 403 });
  }
  if (!env.INQUIRY_MAILER?.fetch) {
    return Response.json({ error: 'Requests are temporarily unavailable. Please contact the studio by email.', code: 'EMAIL_NOT_CONFIGURED' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    // A private service binding preserves the URL and origin for validation.
    return await env.INQUIRY_MAILER.fetch(request);
  } catch {
    return Response.json({ error: 'Unable to reach the email service. Please try again shortly.', code: 'EMAIL_CONNECTION_FAILED' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
