# Scene analysis and temporary recipe previews — 1.2

## Scene recognition and recommendation

The original 1.1 ranking relied on broad CLIP scene categories and palette tags. This could underweight a person and overvalue a matching hue. Version 1.2 retains CLIP and adds a pinned YOLOS-tiny object detector, scene-level lighting hypotheses (including mixed light), salience checks for people, and a full 19-recipe comparison. Detected objects are observations, not proof of all objects present. Relative model scores and fit scores are not calibrated probabilities or objective beauty scores.

Models run in a module Worker with Transformers.js 3.8.1 and single-thread WASM. CLIP: `Xenova/clip-vit-base-patch32`, revision `4c1807b705b1d015fb032789cc4d221b23025a6f`, q8. Objects: `Xenova/yolos-tiny`, revision `e2f9c7673f0fa61849efe2b56a0d7774779ebb9d`, q8; processor resized to shortest edge 384 / longest 640 for device efficiency. First use downloads roughly 170 MB plus runtime. Browser cache may be evicted. A completed analysis keeps its Worker warm while the panel is open; closing/cancelling releases it. Object-model failure is disclosed separately and does not masquerade as completed object detection. Scene-model failure produces no new semantic recommendations.

Input pixels are measured over the complete aspect ratio: hue-family proportions, saturation, linear-luminance percentiles and bright/dark fractions. All catalog recipes are evaluated against subject, palette, light, explicit mood, fixed/auto WB, tonal controls, saturation risk, and bounded preferences. Each recipe is also rendered at small resolution by the preview approximation; additional clipped channels, dark pixels and excessive color changes are soft caution signals. These heuristics cannot establish how a camera RAW will render. DR400 can be a camera starting point for wide contrast, never a claim to recover missing JPEG stops.

The first recommendation remains the best relative scene fit. A close cinematic interpretation is selected when suitable, followed by a nearby different color direction. Regenerate explores other suitable alternatives without randomizing away a stable best match. Reanalyze reruns recognition on the same current scene. Correcting subject/light/mood recalculates the comparison. The audit view exposes every stored recipe's relative fit, including recipes outside the three recommendations.

Preference adaptation remains explicit: My choice, optional reason, Save my choice. Up to 200 descriptor-only events in local browser storage; one replaceable event per analysis; capped influence; reset available. It does not infer an unspoken reason, retrain model weights, or synchronize personal history between devices.

## Shared temporary scene

A single in-memory image in Home is shared between analysis, suggestion cards and any recipe's Try look dialog. Gallery decoding and camera capture preserve aspect ratio and bound the working image to 1280px. A changed scene invalidates old analysis results. A scene carried from suggestions is immediately available in the chosen recipe preview without selecting the file again.

No analysis/preview image is posted to collection/upload endpoints, D1, R2, localStorage or IndexedDB. Clear removes the in-memory scene and its analysis. Reloading/closing the app discards it. Existing Add your shot remains a separate explicit persistent gallery action. Android camera capture delegates to the installed camera with a private temporary URI; the file is deleted after decoding or Activity destruction. Preview images are not saved, exported or added as recipe references.

## Preview mathematics and accuracy limits

`public/recipe-renderer.js` implements an original heuristic sRGB pipeline, not official Fujifilm LUT data:

- Per-simulation saturation/contrast, hue-selective response and tonal color separation form an editorial base interpretation.
- Kelvin ratios and R/B shifts apply approximate channel gains. Fixed/preset WB is evaluated relative to the user's assumed illuminant (Daylight/Shade/Warm/Tungsten); Auto WB applies shifts without pretending to recover original scene temperature.
- Highlight/shadow controls alter smooth tone-curve regions. Color and Color Chrome/FX Blue approximate saturation and saturated-color density.
- A generated 17³ color cube and trilinear interpolation apply the color transform. Local detail and deterministic monochromatic grain are separate passes. Unspecified controls remain omitted; unspecified grain size is not guessed.
- Strength zero is byte-identical to input; full strength is the recipe approximation. Strength is a comparison tool, not a new camera setting. Before/after uses one source and one rendered canvas with a responsive split control.

The coefficients are not calibrated against paired RAW/JPEG camera measurements. Lens/diffusion, ISO, sensor spectral response, DR/RAW recovery and proprietary Fuji processing are not recreated. JPEG WB and tone mapping are already baked in, and an already graded source stacks looks. Noise reduction is not simulated as Fujifilm's ISO-dependent algorithm. The UI must keep “approximate recipe preview” visible and must not call it a camera-identical LUT or final SOOC prediction. A closer emulation would require controlled paired captures and quantitative validation; photographs from different scenes cannot supply that calibration.

## Validation and remaining limits

18 focused API, scene/ranking and renderer tests cover authorization, media integrity, all-profile coverage, actual pixel metrics, all-recipes ranking, contextual feedback, bounded/idempotent memory, zero-strength identity, unmodified source data, alpha/range safety, monochrome behavior, setting differences, WB assumptions, cube interpolation and render-risk penalties. Existing 19 recipes / 45 curated samples remain unchanged.

The pinned CLIP model was executed in Node CPU mode on food, street/portrait and landscape references. The pinned object detector was executed at the configured preview resolution: it detected a person and potted plant in Sunny Day; person/sandwich objects in Warm Table. A rendered contact sheet was visually inspected for gross artifacts; this is not a color-accuracy benchmark. Browser WASM, touch gestures and physical Android camera/memory/performance require device verification.

## Research and future recipes

Read `recipe-research.md` before altering intent profiles. Exact creator evidence is distinguished from settings-based inference. Every future recipe needs its own reviewed profile and supported renderer interpretation; never infer intent from its name alone. Dote's extra references remain separately pending exact-source evidence and the user's explicit selection (`dote-example-review.md`).

## Version 2.1 knowledge map (Android 1.3)

`data/recipe-profiles.json` is the single reviewed knowledge record for all 19 recipes, extended with source-reference observations, preferred lighting, related alternatives and preview assumptions. `scripts/build-recipe-mind-map.py` generates `public/recipe-mind-map.html` and `docs/recipe-mind-map.md`. Scene ranking reads the same fields and applies a bounded +0.65 lighting fit alongside subject, palette, mood, clipping and preference checks. Dote now supports still-life/interior intent from the seven user-approved references. The map links nearby looks with specific differences rather than merging similar variants. No added LUT calibration or vision training is claimed. The renderer still uses exact saved settings and documented approximate film responses; screenshot colors do not adjust its coefficients. New evidence should refine the interpretation before any calibrated transform is introduced.
