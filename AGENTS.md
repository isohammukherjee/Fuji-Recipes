# Fuji Recipes — approved design and development protocol

## User-approved baseline

On 18 October 2026, Soham approved the delivered design and behavior after testing the Android app and sharing screen recording `1000464279.mp4`:

> Keep this intact and save this design language and protocols preserved. We will follow this from henceforth and if we add anything else then we can add on top of this.

The reference source is commit `224340110cadf12abeb299ca969e4185f8414214`, the delivered Android APK is `Fuji-Recipes-1.0.0.apk`, and the web publication is version 4 at https://fuji-recipes.theenigma0605.chatgpt.site. These identify the baseline, not a requirement to freeze future fixes.

Future work must extend this design and preserve existing functionality. Do not replace or broadly restyle the interface unless the user explicitly asks for a redesign. A focused bug fix should preserve the approved appearance and interactions.

## Visual language

- Photography leads the interface. Keep the calm editorial feel, generous photos, restrained borders, rounded cards and controls, and consistent camera/photography iconography.
- Reuse the existing CSS variables and styles in `app/globals.css`. Dark appearance uses near-black/forest surfaces, light text, and warm gold accents. Daylight appearance uses warm ivory surfaces, dark green text, and muted brass/gold accents. Keep both themes readable.
- Simple view fills available width with exactly two square-photo recipe cards per row. Preserve readable titles, simulation labels, creator credits, photo counts, and clearly reachable heart buttons.
- Preserve the large, bold, high-contrast Simple-view typography for outdoor use without zooming. Do not shrink text or controls merely to fit a new feature.
- Preserve the Full layout's existing editorial collection and sidebar. Keep the Simple/Full chooser, remembered device preference, and ability to change layouts without losing collection state.
- Reuse established spacing, radii, type weights, accents, and component patterns for additions. Avoid adding a competing visual system.

## Interaction and layout

- Simple recipe detail reserves roughly 60% of available content space for the photo stage and 40% for independently scrolling settings. Keep square photos correctly proportioned; preserve side-by-side panes in short landscape screens.
- Keep compact recipe navigation and persistent bottom navigation usable within device safe areas. Added content must not displace essential navigation or hide settings.
- All photo carousels, including the enlarged viewer, support touch swipe, horizontal scrolling, and mouse dragging. Preserve arrow, thumbnail, and keyboard navigation where present.
- Reserve photo dimensions before loading. Keep deterministic collection order, stable card positions, and restoration of the collection scroll position after returning from a recipe.
- Avoid bouncing photos, entrance transforms that shift list items, hover transforms on recipe cards, and delayed list reflow. Keep feedback subtle and honor reduced-motion preferences.
- Preserve search, filters, favorites, photo enlargement, copy settings, import/crop, own-sample removal, themes, and field-view behavior. New actions must use clear labels and established feedback patterns.
- Preserve focus handling, keyboard access, visible focus states, and touch-friendly controls.

## Recipe and photo integrity

- Preserve confirmed recipe settings, creator/source credit, and correct image associations. Leave missing settings explicitly unspecified; do not invent values.
- Reference photos and imported samples use square crops at up to 1080 × 1080 without upscaling. Do not alter sample colors. Preserve crop and association audit records.
- Keep the approved Reggie's Portra settings and six confirmed Sydney references. Do not reintroduce ambiguously associated images.

## Platform behavior

- Preserve the offline Android bundle, including recipes and reference photos, and native import/clipboard integration.
- Android favorites and imported photos currently live on the device; web favorites and uploads use the signed-in cloud collection. Preserve this distinction and its accurate user messaging unless sync is intentionally implemented.
- Preserve existing authentication, ownership checks, validation, and data storage behavior when adding features.

## Change protocol

1. Read this file and inspect the affected existing components before editing.
2. Build additions on the existing components and tokens; limit changes to the requested scope.
3. Verify the affected flows in Simple and Full views, both themes, and phone/desktop or landscape layouts as applicable. Check scrolling and carousel stability when touching layout or media.
4. Run relevant existing type, build, API, and media checks for code/data changes. For Android changes, build and check signing/alignment. Report any checks or physical-device behavior that remain unverified.
5. Keep progress and source changes in Git. Share the updated app link and APK when a new build is requested. Never claim a device test was completed unless it actually was.

This document records the user's approved product direction. Later explicit user instructions take precedence.


## Scene suggestion knowledge protocol

Every new recipe needs a reviewed entry in `data/recipe-profiles.json` before recommendation participation. Study all settings and correctly paired references; document intent, subject/palette fit, cautions and provenance. Read `docs/recipe-research.md` and `docs/scene-engine.md`. Distinguish creator evidence from settings-based inference. Do not infer intent from recipe names alone or treat votes as verified photographic outcomes. Retain on-device image privacy, explicit feedback, reset, bounded contextual learning and three database-only recommendations. Do not label a failed semantic-model run as successful AI analysis.

## Recipe knowledge updates

Retain creator text when the user permits it. Prefer wide context-preserving square crops to text-free tight crops; never recolor reference pixels. For every recipe, extend `data/recipe-profiles.json` with observed appearance, preferred lighting, related alternatives, preview assumptions and explicit evidence limits. Run `python scripts/build-recipe-mind-map.py` to keep the browsable map and saved Markdown aligned. Never infer a calibrated LUT from unpaired recipe screenshots or their overlaid title colors.

## Live analysis integrity

Emit graph events from actual model/measurement/render/selection completions. Never simulate completion or call the graph private model reasoning or actual neural activations. Keep model observations, measured evidence, artistic heuristics and user preference separate. Reject uncorroborated generated context; maintain quick mode and visible failure states. Read `docs/neural-analysis.md` before changing this pipeline.
