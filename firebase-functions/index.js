import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineSecret, defineString } from 'firebase-functions/params';
import { deliverNotification } from './notification.js';

initializeApp();
const apiKey = defineSecret('RESEND_API_KEY');
const recipient = defineString('INQUIRY_NOTIFICATION_EMAIL');
const sender = defineString('INQUIRY_FROM_EMAIL');

export const notifyStudio = onDocumentCreated({
  document: 'users/{userId}/{kind}/{inquiryId}',
  secrets: [apiKey],
  retry: true,
  maxInstances: 2,
}, async (event) => {
  if (!event.data || !['inquiries', 'contactInquiries', 'orders'].includes(event.params.kind)) return;
  await deliverNotification({ db: getFirestore(), snapshot: event.data, kind: event.params.kind,
    from: sender.value(), to: recipient.value(), apiKey: apiKey.value() });
});
