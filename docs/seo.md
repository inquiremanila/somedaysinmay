# Search visibility

The production URL is currently https://somedaysinmay.com, matching the existing canonical. Confirm ownership and that this is the final public domain before deployment; update `SITE_URL` in `src/lib/seo.ts` and `index.html` if needed.

`npm run build` generates individual HTML documents for the gallery, biography, contact and seven artworks, plus `/sitemap.xml` and `/robots.txt`. The initial HTML provides real artwork content and links before JavaScript runs. React replaces it with the interactive site. Shared route metadata keeps canonical URLs and social previews consistent after navigation. Only these completed routes are indexable; account, checkout, empty catalog sections and unknown routes receive `noindex` after the app loads. Firebase's SPA fallback may initially return the homepage for unknown routes; a server-side 404 response needs hosting-specific handling.

Artwork descriptions identify visible colors, texture and collections without guessing medium, dimensions or year. VisualArtwork JSON-LD identifies the work and Philippine studio; it does not claim paid orders, overseas offices, reviews or guaranteed international delivery. English is the primary search content. The language dropdown does not create separate translated URLs, so no unsupported hreflang alternatives are advertised.

After publishing:

1. Verify the production domain in Google Search Console using the DNS record supplied by Google.
2. Submit `https://somedaysinmay.com/sitemap.xml` and inspect the homepage and an artwork URL.
3. Check Google's Rich Results Test / Schema Markup Validator and social sharing previews.
4. Monitor actual impressions for textured art, textured abstract paintings and artwork names, with country filters for Europe, the Americas and Australia.

Search inclusion and rankings are not guaranteed. Regional visibility depends on relevant content, indexing and links from real collectors, galleries and publications. Do not add fabricated local addresses or repetitive country-keyword pages. No Search Console submission or live deployment has been performed by this change.
