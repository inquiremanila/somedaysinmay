# Cloudflare Pages — Git deployment

In the Pages project's build settings:

- Framework: React (Vite), or None with the settings below.
- Root directory: repository root.
- Build command: `npm run build`.
- Build output directory: `dist/public` (this project overrides Vite's default `dist`).
- Build environment: `NODE_VERSION=22`.
- Add the web app's `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_APP_ID` and `VITE_FIREBASE_PROJECT_ID` as build variables. These are Firebase web configuration values, not service-account/private keys. Variables must be present before building; redeploy after changes.

The repository's `wrangler.jsonc` identifies the Pages asset output directory. Commit and push the changes, then deploy the latest commit. Do not publish the repository root or the source `public` folder. The deployed HTML must load `/assets/...js`, never `/src/main.tsx`. Changing a MIME header cannot compile TSX into runnable JavaScript.

The Firebase notification backend lives in `firebase-functions/` so Cloudflare does not mistake it for its reserved `/functions` Pages Functions directory. Cloudflare hosts the frontend only; deploy Firestore rules and Firebase notification functions separately. The email service API key stays in Firebase Secret Manager, not Cloudflare's VITE variables.

Pages provides SPA fallback automatically when no top-level `404.html` exists. Generated artwork HTML files remain available for direct requests. Add your production hostname (and any preview hostname used for sign-in testing) in Firebase Authentication → Settings → Authorized domains. Confirm the SEO canonical production domain before launch.

`ERR_BLOCKED_BY_CLIENT` usually indicates a browser extension or privacy filter blocking a separate resource. Check the resource URL; this error alone does not identify a broken app bundle. First fix the source TSX deployment error, then compare in a browser profile without extensions if that warning remains.

Sources:
https://developers.cloudflare.com/pages/configuration/build-configuration/
https://developers.cloudflare.com/pages/configuration/serving-pages/
