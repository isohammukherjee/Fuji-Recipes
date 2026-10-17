# Fuji Recipes

A mobile-first, private React field companion for Soham’s Fujifilm recipe collection. Built with React 19, TypeScript, Vinext, Cloudflare D1 and R2.

## First collection

14 recipes and 40 square sample photographs, transcribed and grouped chronologically from the 53 screenshots in **Fuji Recipes Batch 1.zip**. Instagram controls, caption areas and recipe titles are excluded from the reference images. Crops are recorded in `data/recipes.json` with screenshot filenames and creator credits. Two recipes without published names use descriptive catalog names (Fall City and Warm Table). Reggie’s Portra sample association is explicitly marked inferred. Winter Season uses the creator’s corrected name rather than the old Kodak Portra 800 label. Missing settings remain unspecified; they are never replaced with guessed defaults.

## Features

- Responsive recipe grid, mood and film simulation filters, search and synced favorites.
- Recipe detail with swipe carousel and every setting on the same page. Thumbnail navigation, keyboard arrows and full-size viewer.
- Outdoor Field view with larger settings and a compact sticky photo carousel on phones. Daylight and dark appearance, reduced-motion support.
- Upload your own JPEG/PNG/WebP samples with a square crop preview and horizontal/vertical crop controls. Images are normalized to 1600px JPEG, saved to R2, associated with the recipe in D1, and available on your other signed-in devices. Your own samples can be removed.
- Hosted private access through ChatGPT authentication. All personal reads/writes check identity. Upload and favorite operations check same-origin requests. Server validates upload size, type, signatures and ownership.
- Install metadata for browser Add to Home Screen. Native Android/iOS packaging and offline caching are future work; this version requires connectivity for syncing and uploads.

## Development

Use Node 22.13+ and pnpm. `pnpm install`, then `pnpm dev`. Set the execution profile using the Sites helper when running outside the hosted development environment. `pnpm build` builds the production Worker. `pnpm exec tsc --noEmit` checks types. `node scripts/test-api.cjs` runs authorization, upload validation and recipe integrity tests.

Apply local migrations using `pnpm exec wrangler d1 migrations apply site-creator-d1 --local --config dist/server/wrangler.json`. Hosted migrations are applied during publication. The hosting manifest declares `DB` and `BUCKET` bindings. Recipes are seeded by the authenticated collection endpoint with `INSERT OR IGNORE`; future corrected batches must update the relevant stored rows through a deliberate data update, not by editing an applied migration.

## Adding future screenshot batches

Read screenshots in chronological order, identify settings and samples from the same post, record creator/source and uncertain associations, crop only image areas, and add seed records in `data/recipes.json` and images in `public/samples/`. Include all original setting values as shown. `scripts/import-batch-01.py` documents the first import; invoke with the original screenshot folder and an output project folder. Do not commit screenshot archives or personal upload data.

## Architecture and portability

`app/page.tsx` is the React interface. `app/api/collection` stores recipes/favorites; `app/api/samples` stores user images. D1 stores structured records and R2 stores personal image bytes. Bundled references are versioned with the source. The frontend talks to HTTP APIs, so it can later be packaged in an Android/iOS shell or share data and UI logic with native clients. There is no native build in this release.

## Validation

TypeScript, production compilation, API unit tests and SQLite migration/seed checks are run before publication. Browser visual and end-to-end QA is not available in this session. Physical-device responsiveness, swipe gestures, hosted authentication and cloud upload round trips still need user verification.
