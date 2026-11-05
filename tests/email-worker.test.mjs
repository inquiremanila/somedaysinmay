import test from 'node:test';
import assert from 'node:assert/strict';
import { emailMime } from '../cloudflare/email-worker/mime.js';
import { onRequest } from '../functions/api/inquiry.js';

test('MIME preserves customer Reply-To and Unicode without header injection', () => {
  const payload = { from: 'notifications@example.com', to: ['studio@example.com'], reply_to: 'buyer@example.com', subject: 'Artwork — Somedays in May', text: 'Swirls × 2\nName: José' };
  const mime = emailMime(payload);
  assert.match(mime, /Reply-To: buyer@example.com\r\n/);
  const body = mime.split('\r\n\r\n')[1].replace(/\s/g, '');
  assert.equal(Buffer.from(body, 'base64').toString('utf8'), payload.text);
  assert.throws(() => emailMime({ ...payload, reply_to: 'buyer@example.com\r\nBcc: other@example.com' }));
});

test('Pages forwards only same-origin POST requests through its private service binding', async () => {
  let calls = 0;
  const env = { INQUIRY_MAILER: { fetch: async (request) => { calls++; assert.equal(request.url, 'https://somedaysinmay.com/api/inquiry'); return Response.json({ sent: true }); } } };
  const request = new Request('https://somedaysinmay.com/api/inquiry', { method: 'POST', headers: { Origin: 'https://somedaysinmay.com' }, body: '{}' });
  const response = await onRequest({ request, env });
  assert.equal(response.status, 200);
  assert.equal(calls, 1);
  assert.equal((await onRequest({ request, env: {} })).status, 503);
  const otherOrigin = new Request(request.url, { method: 'POST', headers: { Origin: 'https://other.example' } });
  assert.equal((await onRequest({ request: otherOrigin, env })).status, 403);
  assert.equal(calls, 1);
});
