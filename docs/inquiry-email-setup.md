# Inquiry email setup

Prepared locally; not deployed or live-tested. New artwork inquiries, contact inquiries and purchase requests are saved first, then trigger `notifyStudio`. The Contact form now requires the same email-link sign-in used for artwork inquiries, and keeps its draft in session storage. Its reply email is the signed-in email. Existing messages are not sent retroactively.

## Configure sending

1. Create a Resend account, verify a domain you control with the DNS records Resend provides, and create a sending API key. Use a verified sender such as `Somedays in May <notifications@somedaysinmay.com>`. The recipient can be your personal mailbox; it need not match the sending domain.
2. Ensure the Firebase project has the Blaze billing plan needed to deploy Cloud Functions. Do not enable billing without reviewing it yourself.
3. Use Node 22 in a supported environment (cloud development or CI works if the old Mac cannot run it). Run `npm ci --prefix firebase-functions`.
4. Set the server secret with `firebase functions:secrets:set RESEND_API_KEY`. Enter the key in that terminal prompt. Never put it in a VITE variable, browser code, or chat.
5. Set `INQUIRY_NOTIFICATION_EMAIL` and `INQUIRY_FROM_EMAIL` when Firebase prompts at deployment, or in ignored `firebase-functions/.env.somedaysinmay`. The notification recipient is configured locally in that ignored file. Keep the Gmail recipient out of browser code; the public contact address remains `inquire@somedaysinmay.com`.
6. Deploy reviewed changes with `firebase deploy --only firestore:rules,functions:notifyStudio,hosting` after running `npm run build`.

## Verify live

Sign in as a buyer, submit one artwork inquiry and one Contact form inquiry. Confirm records at `users/{uid}/inquiries/{id}` and `users/{uid}/contactInquiries/{id}`, then check the destination inbox. Reply should address the buyer. Confirm delivery ledger `_emailNotifications/{hash}` has `status: sent` and inspect Resend delivery status. `sent` means provider acceptance, not inbox delivery. Purchase requests at `users/{uid}/orders/{id}` also notify the studio.

Failures preserve the original inquiry. The server retries failed delivery; inspect Firebase Functions logs and the server-only ledger for failures. Payloads use plain text to avoid rendering user-supplied HTML. The recipient and sender are server configuration, never browser inputs. The delivery ledger suppresses already completed events; Resend idempotency keys suppress concurrent/retried sends for 24 hours. A provider-accepted send followed by a ledger-write failure can still duplicate if retried after that window. Monitor failures promptly. No exactly-once claim is made.

Firestore rules deny clients access to `_emailNotifications` by default and restrict contact inquiries to their signed-in owner. A successful frontend response confirms database save, not email delivery. Existing artwork messages remain viewable in buyer accounts; Contact messages are currently viewable through the Firebase console.

References: https://firebase.google.com/docs/functions/firestore-events and https://resend.com/docs/dashboard/emails/idempotency-keys

Local verification: site production build, TypeScript checks, 15 existing site tests, four mocked email delivery tests and function import check passed. Live Firebase rules/emulator submission and real email delivery are not yet verified. The installed Firebase SDK dependency tree reports eight moderate advisories through older transitive `uuid`; no high/critical findings. An automatic forced fix proposes downgrading Firebase Admin, so that incompatible downgrade was not applied. Review SDK updates before deployment.
