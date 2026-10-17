# Fuji Recipes

A mobile-first, private React field companion for Soham’s Fujifilm recipe collection. Built with React 19, TypeScript, Vinext, Cloudflare D1 and R2.

## First collection

19 recipes and 39 verified square sample photographs, from **Fuji Recipes Batch 1.zip**, the user-cropped replacement ZIP and five explicitly paired Scotland recipe screenshots. All former bundled images have been removed. The replacement media are genuinely square, at most 1080 × 1080, and use immutable content-hashed filenames. The old unlabelled Mount Fuji samples are withheld from Reggie’s Portra; the recipe remains available without an unverified cover. One duplicate title card and one unusable text-covered frame are excluded. Food collages are split into separate photographs. Dote’s available title cards allow only a small text-free photo crop; its note records this limit. Instagram controls, caption areas and recipe titles are excluded from the reference images. Crops are recorded in `data/recipes.json` with screenshot filenames and creator credits. Two recipes without published names use descriptive catalog names (Fall City and Warm Table). Reggie’s Portra has no assigned samples until their association is confirmed. Winter Season uses the creator’s corrected name rather than the old Kodak Portra 800 label. Missing settings remain unspecified; they are never replaced with guessed defaults.

## Features

- Simple recipe detail dedicates roughly 60% of its available content area to a square, fixed photo stage and 40% to independently scrolling recipe settings; landscape uses side-by-side panes. Compact title bar and bottom navigation keep essential controls available.
- Native swipe/trackpad horizontal scrolling and mouse dragging in both the recipe gallery and enlarged viewer; thumbnails and mood strips also support mouse drag. Gallery dimensions are reserved before images load. List entrance/hover transforms are disabled, server ordering is deterministic, and returning from a recipe restores the list position.
- `data/image-audit.json` records every source file, numbered recipe association, crop, output dimensions and checksum. `scripts/import-curated-media.py` rebuilds references without color changes. `python scripts/verify-media.py` checks encoded dimensions, hashes, associations and database migration correctness.

- Two switchable interfaces: **Simple** uses a one-column photo list, large controls, collapsible filters and bottom navigation; **Full** retains the editorial collection and desktop sidebar. The opening chooser preselects Simple below 768px, Full on larger screens, or your saved device preference. Both layouts are available at any size. Change layouts from the header or Simple's bottom navigation without losing the active recipe, search, filters or photo.
- Short CSS page, card, dialog and filter entrance animations, press feedback and reduced-motion support. Gallery resizing preserves the selected photo. Explicit device viewport metadata prevents mobile browsers from squeezing the desktop layout into a phone screen.

- Responsive recipe grid, mood and film simulation filters, search and synced favorites.
- Recipe detail with swipe carousel and every setting on the same page. Thumbnail navigation, keyboard arrows and full-size viewer.
- Outdoor Field view with larger settings and a larger photo-first Simple detail layout on phones. Daylight and dark appearance, reduced-motion support.
- Upload your own JPEG/PNG/WebP samples with a square crop preview and horizontal/vertical crop controls. Images are normalized to square JPEG at up to 1080 × 1080 without upscaling; the API rejects rectangular or larger encodings before storage. They are saved to R2, associated with the recipe in D1, and available on your other signed-in devices. Your own samples can be removed.
- Hosted private access through ChatGPT authentication. All personal reads/writes check identity. Upload and favorite operations check same-origin requests. Server validates upload size, type, signatures and ownership.
- Install metadata for browser Add to Home Screen. Native Android/iOS packaging and offline caching are future work; this version requires connectivity for syncing and uploads.

## Development

Use Node 22.13+ and pnpm. `pnpm install`, then `pnpm dev`. Set the execution profile using the Sites helper when running outside the hosted development environment. `pnpm build` builds the production Worker. `pnpm exec tsc --noEmit` checks types. `node scripts/test-api.cjs` runs authorization, upload validation and recipe integrity tests.

Apply local migrations using `pnpm exec wrangler d1 migrations apply site-creator-d1 --local --config dist/server/wrangler.json`. Hosted migrations are applied during publication. The versioned `0001_curated_square_references.sql` migration replaces all stored curated recipe/image records and adds the Scotland variants while preserving user favorites and uploads. The hosting manifest declares `DB` and `BUCKET` bindings. Recipes are seeded by the authenticated collection endpoint with `INSERT OR IGNORE`; future corrected batches must update the relevant stored rows through a deliberate data update, not by editing an applied migration.

## Adding future screenshot batches

Read screenshots in chronological order, identify settings and samples from the same post, record creator/source and uncertain associations, crop only image areas, and add seed records in `data/recipes.json` and images in `public/samples/`. Include all original setting values as shown. `scripts/import-batch-01.py` documents the first import; invoke with the original screenshot folder and an output project folder. Do not commit screenshot archives or personal upload data.

## Architecture and portability

`app/page.tsx` is the React interface. `app/api/collection` stores recipes/favorites; `app/api/samples` stores user images. D1 stores structured records and R2 stores personal image bytes. Bundled references are versioned with the source. The frontend talks to HTTP APIs, so it can later be packaged in an Android/iOS shell or share data and UI logic with native clients. There is no native build in this release.

## Validation

TypeScript, production compilation, API unit tests and SQLite migration/seed checks are run before publication. Browser visual and end-to-end QA is not available in this session. Physical-device responsiveness, swipe gestures, hosted authentication and cloud upload round trips still need user verification.
