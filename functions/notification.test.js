import test from 'node:test';
import assert from 'node:assert/strict';
import { notificationPayload, deliverNotification } from './notification.js';
const config = { from: 'Studio <studio@example.com>', to: 'owner@example.com' };
const data = { productId: 'swirls', contactEmail: 'buyer@example.com', message: 'Is this available? <script>' };
const snapshot = { ref: { path: 'users/user1/inquiries/inquiry1' }, data: () => data };
function database(initial) {
  let saved = initial;
  return { db: { collection: () => ({ doc: () => ({ get: async () => ({ data: () => saved }), set: async (value) => { saved = value; } }) }) }, state: () => saved };
}
test('emails fixed studio recipient with buyer reply-to and plain-text message', () => {
  const payload = notificationPayload('inquiries', data, snapshot.ref.path, config);
  assert.deepEqual(payload.to, ['owner@example.com']);
  assert.equal(payload.reply_to, 'buyer@example.com');
  assert.match(payload.subject, /swirls/);
  assert.match(payload.text, /Is this available\? <script>/);
  assert.equal(payload.html, undefined);
  assert.throws(() => notificationPayload('inquiries', { ...data, contactEmail: 'bad\r\nBcc: victim@example.com' }, '', config));
});
test('saved sent record prevents a later duplicate event', async () => {
  const { db, state } = database();
  let calls = 0;
  const fetchImpl = async (_url, request) => {
    calls++;
    assert.match(request.headers['Idempotency-Key'], /^inquiry\/[a-f0-9]{64}$/);
    return { ok: true, json: async () => ({ id: 'email1' }) };
  };
  const args = { db, snapshot, kind: 'inquiries', ...config, apiKey: 'test', fetchImpl };
  await deliverNotification(args);
  await deliverNotification(args);
  assert.equal(calls, 1);
  assert.equal(state().status, 'sent');
});
test('provider failure remains failed and can be retried without reporting sent', async () => {
  const { db, state } = database();
  await assert.rejects(deliverNotification({ db, snapshot, kind: 'inquiries', ...config, apiKey: 'test', fetchImpl: async () => ({ ok: false, status: 503 }) }));
  assert.equal(state().status, 'failed');
});
test('contact and purchase requests include the submitted fields', () => {
  assert.match(notificationPayload('contactInquiries', { ...data, name: 'Collector', location: 'Paris' }, 'contact/path', config).text, /location: Paris/);
  assert.match(notificationPayload('orders', { ...data, items: [{ productId: 'swirls', quantity: 1 }] }, 'orders/path', config).text, /"productId":"swirls"/);
});
