import { createHash } from 'node:crypto';

export function notificationPayload(kind, data, path, { from, to }) {
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.contactEmail || '')) throw new Error('Invalid reply email');
  const heading = kind === 'inquiries' ? `Artwork inquiry: ${data.productId}` : kind === 'orders' ? 'Purchase request' : 'Contact inquiry';
  const fields = kind === 'contactInquiries'
    ? ['name', 'location', 'size', 'budget'] : kind === 'orders' ? ['intent', 'shipping', 'items'] : ['productId'];
  const details = fields.map((key) => `${key}: ${typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key] || '—'}`).join('\n');
  return {
    from, to: [to], reply_to: data.contactEmail,
    subject: `${heading} — Somedays in May`.replace(/[\r\n]/g, ' ').slice(0, 200),
    text: `${heading}\n\nReply email: ${data.contactEmail}\n${details}\n\n${data.message || ''}\n\nSaved in Firestore: ${path}\nThis is an inquiry, not a payment confirmation.`,
  };
}

export async function deliverNotification({ db, snapshot, kind, from, to, apiKey, fetchImpl = fetch }) {
  // Only the server can read or write this delivery ledger.
  const key = createHash('sha256').update(snapshot.ref.path).digest('hex');
  const delivery = db.collection('_emailNotifications').doc(key);
  if ((await delivery.get()).data()?.status === 'sent') return;
  const payload = notificationPayload(kind, snapshot.data(), snapshot.ref.path, { from, to });
  // A fixed key prevents concurrent/retried events sending duplicate emails within
  // Resend's 24-hour idempotency window. Firestore records completed sends longer-term.
  const response = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(20000),
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `inquiry/${key}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    await delivery.set({ status: 'failed', sourcePath: snapshot.ref.path, httpStatus: response.status });
    throw new Error(`Email provider returned HTTP ${response.status}`);
  }
  const result = await response.json();
  await delivery.set({ status: 'sent', sourcePath: snapshot.ref.path, providerId: result.id, sentAt: new Date() });
}
