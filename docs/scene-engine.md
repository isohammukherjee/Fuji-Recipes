# Scene suggestions — version 1.0

## Implemented pipeline

1. Gallery input or camera capture; the browser uses a rear-camera live preview where available, Android delegates capture to the installed camera app with a temporary content URI. Image decoding preserves aspect ratio and bounds the working image to 1280px. Analysis photos are not uploaded or added to the collection. Native temporary capture is deleted after decoding and on Activity destruction.
2. A dedicated module Worker dynamically imports pinned Transformers.js 3.8.1 and runs quantized CLIP ViT-B/32 (`Xenova/clip-vit-base-patch32`, revision `4c1807b705b1d015fb032789cc4d221b23025a6f`) on WASM with one thread. The approximately 154MB model, tokenizer/config files and runtime are downloaded on demand, with browser cache where available. A first run requires connectivity, space and sufficient RAM. Cached/offline execution depends on browser retention; do not promise permanent offline AI.
3. Zero-shot image/text matching evaluates 14 subject descriptions and seven light descriptions. Relative softmax scores are candidate-dependent, not reliable confidence percentages. This is scene-level recognition, not object localization, skin segmentation or proof of every object present. Ambiguity is surfaced; users can correct subjects/light.
4. Canvas measurements sample the full aspect-ratio image: linear-luminance percentiles, near-black/near-white fractions, saturation and hue-family proportions with mean-color swatches. Palette relationships use circular hue separation; warm/cool or analogous relationships inform explanation. JPEG measurements cannot reveal sensor dynamic range, actual color temperature, camera WB or RAW recoverability.
5. `app/scene-engine.mjs` ranks database IDs only using reviewed per-recipe intent, subject relevance, palette compatibility, selected mood, fixed/auto WB, DR/highlight/shadow interactions and saturation/portrait cautions. The third result favors a nearby alternative simulation when appropriate. Results explain direction and limitations. References are original catalog images, not generated previews of the uploaded photograph.
6. Explicit "My choice" plus optional reason and "Save my choice" records a scene descriptor and recipe ID in browser-local storage. Up to 200 events; one event per analysis is replaceable so repeated clicks do not count twice. Similar subject/light/palette/contrast contexts softly boost a chosen recipe; explicit aesthetic reasons can softly boost matching recipe moods. The learning contribution is capped. Simply viewing a recipe or running analysis never invents a positive choice. Reset removes the local history. Device/browser histories are independent.

The vision weights are not fine-tuned by choices. This is personal preference adaptation, not autonomous model retraining or an ability to know unspoken artistic reasons. It does not scrape or train on social-media images. Recipe knowledge is a reviewed, versioned evidence layer (see `recipe-research.md`).

## Failure and resource behavior

Inference and model downloads run off the UI thread. Progress is visible, analysis can be cancelled by terminating the Worker, and a four-minute timeout leaves a retryable error. Closing the panel stops analysis and camera tracks. File/analysis generations reject stale results. No color-only fallback is presented as semantic AI. A new analysis clears previous recommendations before starting; failure cannot display stale results as fresh.

No API key or inference server is required. Android remote subresources are narrowly permitted for the pinned library/model delivery hosts; all other remote resources remain blocked. The existing web sign-in and collection endpoints are unchanged. Learning/image data are not sent to D1, R2 or a third-party inference service.

## Validation

Run `node scripts/test-scene.mjs` for profile coverage, actual pixel measurements, distinct context-dependent database-only top-three results, monochrome intent, fixed-WB cautions, feedback idempotency, bounded storage and contextual learning. Existing API/media checks remain mandatory for releases. Typecheck and build both web and APK. Model inference in Node can validate the pinned model/labels but does not prove browser WASM performance or physical Android camera behavior. Record actual test outcomes in the release handoff.

## Future recipe intake

Add exact settings and audited references first, then a specific intent profile. Review white balance/shift, tone/DR, base simulation, grain, Clarity, Color Chrome and intended lighting together. Name ambiguity, diffusion filters, missing settings and variants must remain explicit. `test-scene.mjs` fails when catalog/profile coverage diverges. Improve the evidence register when exact creator material becomes accessible; do not silently claim comprehensive Fuji-image research.

## Release verification (20 October 2026)

The pinned q8 CLIP model executed with Transformers.js 3.8.1 under Node CPU inference against the existing, credited catalog references. Warm Table ranked food first and interior second; Sunny Day ranked street first and portrait second, with daylight as the leading light label; Summer Sauce ranked landscape first, with overcast/fog as leading light hypotheses. This checks real model loading and meaningful scene-dependent outputs. The web Worker uses browser WASM instead of Node CPU; browser model initialization, camera permission UX and physical Android performance remain unverified in this environment. Tests use measured-pixel fixtures and explicit scene contexts separately from this live-model check. Neither constitutes aesthetic accuracy benchmarking.
