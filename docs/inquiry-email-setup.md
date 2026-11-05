# Free Email Routing notifications

The form posts to the site's `/api/inquiry` Pages Function, which calls the private `somedaysinmay-inquiries` Worker through a service binding. The Worker uses Cloudflare's `send_email` binding to notify the studio's verified Email Routing destination. It does not call the Email Sending REST API. No Email Sending API token, Firebase Functions or Resend account is required.

Only the studio's verified destination receives these notifications. The customer's email is placed in Reply-To, so the studio replies normally from its inbox. There is no chat or customer-email automation. Sending to verified Email Routing destinations is free; the Worker and Pages requests remain subject to their Free plan limits.

## 1. Email Routing

Enable Email Routing for `somedaysinmay.com` and verify the actual receiving inbox under Destination Addresses. Use a sender on that Email Routing domain, such as `inquire@somedaysinmay.com`. The `INQUIRY_NOTIFICATION_EMAIL` value below must be the verified destination inbox rather than an unverified forwarding alias. Keep the domain's routing DNS records in place.

## 2. Deploy the email Worker

The Worker config is `cloudflare/email-worker/wrangler.jsonc`. It declares the `EMAIL` send_email binding. Workers.dev and public preview URLs are disabled; Pages accesses the Worker privately.

From a supported cloud terminal or CI environment with current Node and Wrangler:

```sh
npm ci
npx wrangler login
npx wrangler deploy --config cloudflare/email-worker/wrangler.jsonc
npx wrangler secret put INQUIRY_FROM_EMAIL --config cloudflare/email-worker/wrangler.jsonc
npx wrangler secret put INQUIRY_NOTIFICATION_EMAIL --config cloudflare/email-worker/wrangler.jsonc
```

Enter the plain sender address and verified recipient inbox at the respective secret prompts. Do not paste credentials in chat or commit the receiving address. These two settings belong to the email Worker, not the Pages project. The old Mac can keep Node 18; use cloud development/CI for Wrangler.

Alternatively, use a separate **Workers** Git project connected to this repository, with repository root as its root and deploy command `npx wrangler deploy --config cloudflare/email-worker/wrangler.jsonc`. Set a supported Node version in that build environment. Add the two secrets to **somedaysinmay-inquiries → Settings → Variables and Secrets**, then redeploy it. Do not convert the existing Pages website into a Worker project.

`npm run build:email-worker` can also produce `dist/email-worker/index.js` for inspection or the Worker editor. Pasting code alone does not configure the `EMAIL` binding; deployment must use the included Wrangler config (or equivalent binding configuration).

## 3. Deploy Pages after the Worker exists

The root `wrangler.jsonc` declares the `INQUIRY_MAILER` service binding to `somedaysinmay-inquiries`. Commit/push the updates and deploy the latest Pages commit after the email Worker exists. If a Pages deployment starts before the Worker has been created, retry it after Worker deployment. Keep root directory empty, build command `npm run build`, output `dist/public`.

Remove obsolete `CLOUDFLARE_EMAIL_API_TOKEN` and `CLOUDFLARE_EMAIL_ACCOUNT_ID` from Pages settings; revoke the unused sending token. The Worker uses Cloudflare's native binding, not those credentials. Firebase web configuration remains unchanged for login/account data.

## Behavior and verification

The Worker validates catalog artwork IDs, contact details, body size, request origin and a honeypot. The fixed recipient is server configuration, not a browser input. It sends plain-text MIME with customer Reply-To and Unicode-safe content. Bounded per-isolate throttling and repeat-request caching reduce basic abuse/duplicates, but are not global rate limits or exactly-once delivery. A timeout/restart can still duplicate a notification.

Success is shown only after the email binding accepts the message, which is not proof of inbox delivery. On failure, the form remains retryable. Artwork success markers persist per artwork in the same browser/origin, and commission success markers persist per account in that browser. The site does not save these inquiries as account chats. Checkout still saves a purchase request in Firestore before emailing it; a failed email leaves the cart and form available for retry.

Test the deployed artwork form, check the receiving inbox and Reply address, then reload and verify the thank-you remains. Also test commissions/contact and checkout if used. Check email activity and Worker logs if delivery fails. Logs record safe diagnostic categories, not tokens/customer content. Previously deployed Firebase notification functions must be disabled if present to avoid duplicate old purchase notifications; removing local code does not delete remote functions.

`npm run dev` previews the forms on the old Mac. It cannot supply a native Cloudflare email binding, so local sends return `EMAIL_NOT_CONFIGURED` rather than pretending to succeed. Test actual sending on the deployed site, or use Wrangler in a supported development environment with the appropriate remote email binding. Automated tests mock the binding and never send mail.

## Troubleshooting

- `EMAIL_NOT_CONFIGURED`: create/deploy the email Worker, check Pages service binding `INQUIRY_MAILER`, the Worker's `EMAIL` binding and its two private address settings.
- `EMAIL_BINDING_FAILED`: confirm Email Routing is enabled on the sender domain, the receiving inbox is verified, and check Cloudflare email activity/Worker logs.
- `EMAIL_CONNECTION_FAILED`: check whether the target Worker exists and is accessible through its service binding.
- `ENDPOINT_MISSING`: deploy the repository including `functions/`; static-only uploads do not run this bridge.

Firebase Auth uses persistent IndexedDB/local storage, with no application sign-out timer. Browser data deletion, private browsing or credential revocation can still end a session; localhost and production have separate sessions.

References:
- https://developers.cloudflare.com/workers/wrangler/configuration/#email-bindings
- https://developers.cloudflare.com/email-service/platform/pricing/
- https://developers.cloudflare.com/pages/functions/bindings/#service-bindings
