# Cloudflare Pages — Git deployment

In the Pages project's build settings:

- Framework: React (Vite), or None with the settings below.
- Root directory: leave the field empty. Do not type `Repository root` or `src`.
- Build command: `npm run build`.
- Build output directory: `dist/public` (this project overrides Vite's default `dist`).
- Build environment: use a current Node version supported by the Firebase SDK. This runs on Cloudflare; the Mac can keep Node 18.
- `.env.production` supplies the public Firebase web configuration for production builds. Cloudflare build variables can override it; remove empty or outdated `VITE_FIREBASE_*` overrides. These values identify the public web app and are included in the browser bundle; never add service-account/private keys. Redeploy after configuration changes.

The repository's `wrangler.jsonc` identifies the Pages asset output directory. Commit and push the changes, then deploy the latest commit. Do not publish the repository root or the source `public` folder. The deployed HTML must load `/assets/...js`, never `/src/main.tsx`. Changing a MIME header cannot compile TSX into runnable JavaScript.

The Firebase notification backend lives in `firebase-functions/` so Cloudflare does not mistake it for its reserved `/functions` Pages Functions directory. Cloudflare hosts the frontend only; deploy Firestore rules and Firebase notification functions separately. The email service API key stays in Firebase Secret Manager, not Cloudflare's VITE variables.

Pages provides SPA fallback automatically when no top-level `404.html` exists. Generated artwork HTML files remain available for direct requests. Add your production hostname (and any preview hostname used for sign-in testing) in Firebase Authentication → Settings → Authorized domains. Confirm the SEO canonical production domain before launch.

`ERR_BLOCKED_BY_CLIENT` usually indicates a browser extension or privacy filter blocking a separate resource. Check the resource URL; this error alone does not identify a broken app bundle. First fix the source TSX deployment error, then compare in a browser profile without extensions if that warning remains.

Sources:
https://developers.cloudflare.com/pages/configuration/build-configuration/
https://developers.cloudflare.com/pages/configuration/serving-pages/

## Live sign-in and checkout verification

In Firebase Console for `somedaysinmay`:

1. Authentication → Sign-in method → Email/Password: enable Email/Password and Email link (passwordless sign-in), then save.
2. Authentication → Settings → Authorized domains: add `somedaysinmay.com`, `www.somedaysinmay.com` if used, and `somedaysinmay.pages.dev`. Keep the existing Firebase auth domain. Add any specific preview hostname only if testing sign-in there.
3. Create the default Cloud Firestore database if absent, and publish the repository's `firestore.rules` in the Rules tab. These rules restrict carts, profiles, inquiries and orders to their owner. Deploy notification functions separately if studio email delivery is required (see `inquiry-email-setup.md`).
4. After deploying, add an available artwork to the cart and reload: it should remain. Sign in from checkout using the emailed link in the same browser. The account should be created on first sign-in and checkout should reopen with the cart intact. For a link opened in a different browser, confirm the same email address; the original browser's cart is local and does not transfer.
5. Submit a test purchase request. Confirm it appears under Account and in `users/{uid}/orders` in Firestore, and that the cart clears only after a successful write. Sign out and confirm private account data is hidden. Checkout records a request; it does not charge a card or reserve inventory.

Dashboard settings and authenticated email/Firestore flows cannot be verified by a local build alone. An account holder must complete the live checks above.
