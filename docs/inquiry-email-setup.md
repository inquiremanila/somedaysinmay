# Cloudflare inquiry emails

The artwork, commission, contact and checkout forms post to `/api/inquiry`. A Cloudflare Pages Function validates the request and calls Cloudflare Email Service. The receiving inbox and API token remain server-side. Reply-To is the customer's submitted email address, so the studio replies using its normal inbox. There is no website chat or incoming-email synchronization.

The form reports success only when Cloudflare reports the fixed recipient as delivered or queued. Queued is not proof of inbox delivery. Suppressed/bounced requests and API failures remain errors. Artwork success markers persist per artwork in the same browser/origin until storage is cleared; commission confirmations persist per account in that browser. These simple inquiries are emailed, not saved as account chat records. Checkout still saves the signed-in user's purchase request in Firestore before emailing it; a failed email leaves the cart and form available for retry.

## One-time Cloudflare setup

1. In **Email Service → Email Routing → Destination Addresses**, add your receiving inbox and confirm the verification email. Sending to verified destination addresses is free on Workers Free and Paid; normal Pages Functions request limits still apply.
2. Configure your sending domain in **Email Service → Email Sending → Onboard Domain**. Use the domain you control in Cloudflare DNS and review its required SPF/DKIM/bounce records. Use a plain sender email such as `notifications@somedaysinmay.com` below. Existing mailbox DNS should not be replaced blindly; follow the domain-specific onboarding instructions.
3. Create a Cloudflare API token scoped to this account with **Email Sending: Edit**. Do not use a Global API key.
4. In **Workers & Pages → somedaysinmay → Settings → Variables and Secrets**, add these server-side settings to Production (and Preview only if intentionally testing real email there):

   | Setting | Value |
   | --- | --- |
   | `CLOUDFLARE_EMAIL_ACCOUNT_ID` | Your Cloudflare account ID, 32 hexadecimal characters |
   | `CLOUDFLARE_EMAIL_API_TOKEN` | Sending API token; store as a secret |
   | `INQUIRY_FROM_EMAIL` | Plain sender address on your onboarded domain |
   | `INQUIRY_NOTIFICATION_EMAIL` | Your verified receiving inbox; store as a secret to keep it private |

   Do not prefix these settings with `VITE_`, put them in `.env.production`, or commit real credentials. No `send_email` binding is needed: Pages Functions use the REST API because Pages does not support all Worker binding types.
5. Commit and push the project changes to GitHub. Cloudflare's Git build deploys both `dist/public` and the repository's `functions/` endpoint. Keep **Root directory blank**, **Build command `npm run build`**, **Build output `dist/public`**. `public/_routes.json` limits function execution to `/api/*`; artwork pages and other static requests remain static. Redeploy after changing server settings.

No Firebase Cloud Functions, Blaze email backend, Resend account or extra Worker project is required. Firebase still provides existing authentication, account data and purchase records.

## Local preview

Run `npm run dev`, then open `http://localhost:5173`. Vite serves the same request handler locally. Put the four private server settings in ignored `.env.local` and restart Vite to test real email. Existing private sender/recipient settings were preserved there when the old backend was removed. Without complete settings, Send returns an unavailable error and does not falsely show success. Local tests use mocked Cloudflare responses and never send real emails.

## Verify live

Send an artwork request, reload and confirm the thank-you remains. Check the studio inbox for the artwork/name/address/email, then use Reply and confirm the destination is the customer. Test a commission/contact message and a purchase request if checkout is used. Confirm failure leaves the form retryable. Use Cloudflare email activity to investigate queued mail and bounces. Do not put full email contents, customer addresses or API tokens in application logs.

The endpoint checks origin, JSON/body limits, catalog IDs, field lengths, email headers and a honeypot. A bounded per-isolate throttle and repeat-request cache reduce basic abuse and duplicate clicks; they are best-effort, not durable/global limits or exactly-once delivery. A timeout or worker restart can still produce a duplicate. Enable appropriate Cloudflare edge protections for `/api/inquiry` if traffic requires them. No old inquiries are sent retroactively. Removing local Firebase function code does not delete any previously deployed functions; if they were deployed earlier, disable the old notification triggers before using the new purchase flow to avoid duplicate notifications.

References:
- https://developers.cloudflare.com/email-service/api/send-emails/rest-api/
- https://developers.cloudflare.com/email-service/get-started/send-emails/
- https://developers.cloudflare.com/email-service/platform/pricing/
- https://developers.cloudflare.com/pages/functions/bindings/

## Troubleshooting sending

The form preserves safe server errors instead of replacing every failure with a generic message. In the browser Network panel, inspect the `/api/inquiry` response and its `code`. In Pages Functions logs, `inquiry-email` events record categories and numeric provider codes without token values or customer content.

- `EMAIL_NOT_CONFIGURED`: one or more of the four server settings is missing or malformed. Set them in Production and redeploy; local files do not configure the live function.
- `EMAIL_AUTH_FAILED`: the live token is invalid, revoked, scoped to a different account or missing Email Sending permission.
- `EMAIL_RECIPIENT_REJECTED`: review the verified destination inbox and its suppression/bounce status.
- `EMAIL_RATE_LIMITED`: wait before retrying.
- `EMAIL_SEND_FAILED`: review numeric provider codes and sending-domain onboarding in Cloudflare.
- `ENDPOINT_MISSING`: redeploy the repository including `functions/`; a static-only upload cannot run the endpoint.

Firebase Auth is explicitly configured with IndexedDB/local persistence. The app has no automatic sign-out timer and waits for stored account restoration before showing sign-in. Sessions stay on the same browser/origin until logout while Firebase credentials remain valid; browser data deletion, private browsing, provider revocation or disabled accounts can still end a session. Localhost and production have separate sessions.
