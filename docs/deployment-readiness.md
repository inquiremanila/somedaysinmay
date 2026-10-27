# Deployment readiness — 23 October 2026

The bio uses its original text heading again. No logo image is referenced there.

## Verified live, without changing cloud data

- Production-mode Firebase environment values are present.
- No private-key markers were found in web environment values or built static output.
- Firebase Authentication project configuration returns HTTP 200.
- The web app's project number matches the Authentication project number.
- Authorized domains include localhost, somedaysinmay.firebaseapp.com, and somedaysinmay.web.app.
- Firestore responds successfully to an unauthenticated public collection read.
- Unauthenticated reads of profiles, inquiries, and orders return HTTP 403.
- In application code, Authentication and Firestore both use the same initialized Firebase app.

These checks do not prove email-link delivery, successful sign-in, or successful authenticated Firestore writes. The user confirmed those have not been tested yet. The public Auth configuration endpoint does not report whether the email-link provider is enabled. Signed-out denials do not prove every rule matches the local rules file.

## Local hosting preparation

`firebase.json` now serves `dist/public` and rewrites application routes to `/index.html`. `.firebaserc` selects the existing `somedaysinmay` project. No hosting content or Firestore rules were deployed during this check.

On a deployment build machine, use Node 24.12 or newer to meet the installed Firebase Auth/Firestore packages' declared engine requirements. The current local Node 18 environment builds successfully but is outside those declared requirements.

## Before a production sales launch

1. Complete an email-link sign-in at `/account`, then send one artwork inquiry. Verify it appears in the account history and in Firestore at `users/{uid}/inquiries/{id}`. Verify a purchase request at `users/{uid}/orders/{id}` as well.
2. Restore the missing images listed below, or deliberately retire the associated example products/pages. Do not silently substitute another artwork's photo.
3. Confirm the provisional USD artwork prices and availability.
4. Connect and test the chosen payment processor if immediate online payments are required. Currently checkout saves a purchase request; it does not collect payment.
5. Replace remaining demo statements in FAQs and policies with the studio's actual operating terms. Contact currently opens an email draft; it is not server-side email delivery or a Firestore message form.
6. Put the VITE_FIREBASE_* web configuration in the deployment build environment if building outside this Mac. The local .env.local is ignored by Git.

## Missing assets

- `under-tow.jpg` — product and editorial references
- `room-blue.jpg` — product and editorial references
- `room-tide.jpg` — product and editorial references
- `auction-quiet-tides.png` — auction preview
- `auction-between-the-lines.png` — auction preview
- `auction-a-gentle-becoming.png` — auction preview
- `mail-club-coming-soon.png` — mail club page

## References

- [Firebase Hosting configuration and SPA rewrites](https://firebase.google.com/docs/hosting/full-config)
- [Firebase email-link authentication](https://firebase.google.com/docs/auth/web/email-link-auth)
