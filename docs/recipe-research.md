# Recipe knowledge and evidence register

Research date: 20 October 2026 (Asia/Kolkata). Scope: the 19 existing catalog entries, their settings, supplied creator notes, publicly retrievable creator pages and manufacturer documentation. No recipe source settings or sample associations were changed.

## What the profiles mean

`data/recipe-profiles.json` is a reviewed photographic interpretation layer keyed by the immutable recipe ID. Each profile contains an intent, candidate subjects, relevant palette families, mood choices, a caution, provenance and an evidence label. Candidate subjects/palettes are recommendations inferred from the complete combination of settings; they are not creator endorsements or proof that a recipe is exclusive to one genre. The input photograph's objects, illumination and existing processing still determine suitability.

- `creator`: recipe-specific creator explanation was independently retrieved. It does not mean every inferred subject/palette tag was stated by the creator.
- `settings-inference`: the interpretation comes from this catalog's confirmed settings and supplied notes. The exact creator post could not be independently verified online in this pass. Do not present these entries as newly verified creator claims.
- `data/recipes.json` in sources means the supplied source settings and notes already preserved by the project. It is local provenance, not an external web citation.

The two independently evidenced entries are Reggie’s Portra and Mono Soul. The remaining 17 are explicitly marked settings-inference. This is an initial editorial knowledge base, not a model trained on social-media photographs or a comprehensive corpus of Fuji imagery.

## Primary sources retrieved

1. [Reggie Ballesteros — Reggie’s Portra](https://reggiebphotography.com/blog/the-most-versatile-fujifilm-x-trans-iv-film-simulation-recipe-reggies-portra). Creator explanation and exact settings. His goal combines family skin rendering with daily versatility; examples include night photography and optical diffusion. The current creator list does not mandate an exposure-compensation range. Preserve the approved catalog while advising scene-specific metering. A visible source reprint reports his later request to remove generic compensation guidance; the creator source itself is authoritative for our profile.
2. [Fujifilm — ACROS FS Recipe x Thomas Phoon](https://www.fujifilm-x.com/en-ph/stories/acros-fs-recipe-x-thomas-phoon/). Manufacturer-hosted creator account explains Mono Soul’s expressive monochrome intent, everyday subjects and high tonal contrast. **Provenance discrepancy:** its text identifies ACROS+G, whereas this catalog’s saved simulation is plain Acros. That finding is a review flag, not authorization to silently rewrite the user-approved recipe. The profile explicitly discloses it.
3. [Fujifilm X-S20 image quality manual](https://fujifilm-dsc.com/en/manual/x-s20/menu_shooting/image_quality_setting/). Basis for interpreting the base simulations, tonal controls, dynamic range, white balance, grain and clarity. Recipe effects are combinations: a soft base does not cancel positive shadow contrast, and a name such as Cool Air does not establish a cool white balance. DR200 requires at least ISO 320 and DR400 ISO 640 on X-S20. Nonzero Clarity can delay image saving.
4. [Daniel J. Schwarz](https://danieljschwarz.com/). Search indexed the creator’s own portfolio and contact identity. Fetch timed out; no exact recipe explanation could be retrieved. Portfolio identity is not evidence for settings or suitability.
5. [Henry’s recipe index](https://henryhuyns.com/category/work/recipes/) and [creator homepage](https://henryhuyns.com/). Search identified the creator’s own photographic/recipe site; opening the recipe index returned a country-block message. No exact Autumn Ember recipe could be verified there.

## Public social and creator search coverage

Both available search engines were used with quoted handles, recipe names, photography/Fujifilm terms and Instagram-restricted queries. Searches covered `kwg.st`, `onedayonelife.album`, `danieljschwarz`, `shadi.3001`, `henryhuyns`, `tummyammy_`, `maurenzetti`, `vincent.dote`, Reggie Ballesteros and Thomas Phoon / `fujifilmcameravn`. Exact-name searches included Winter Season, Summer Rain, Calm Sea and Mono Soul.

Accessible search indexing was sparse. Instagram results sometimes resolved only to a generic homepage, and third-party mirrors mixed recipe snippets, unrelated posts and commercial identity data. Those mirrors were not used as recipe evidence. Creator identity and unrelated recipe titles are insufficient to verify the exact post in our collection. For example, a search result for Shadi’s different Classic Chrome recipe must not overwrite Fall City’s Classic Negative settings. We did not log in, bypass access controls, scrape restricted accounts, import new third-party photographs or claim social-platform training.

## Distinct interpretations in the catalog

| Recipe | Reason to exist / key interaction | Evidence |
|---|---|---|
| Winter Season | Grainy Classic Negative everyday color; fixed WB and +3 Color favor an earthy interpretation. Supplied notes record a rename and Black Mist use. | Settings and supplied note |
| Reggie’s Portra | Classic Chrome, adaptive WB and softened tones make a versatile portrait/everyday alternative without nonzero Clarity. | Retrieved creator |
| Sunny Day | Grain-free Astia with DR400 and reduced highlights, but +2 shadows and +3 Color retain punch. Fixed 4600K must be evaluated against actual lighting. | Settings |
| Summer Sauce | Warm Classic Chrome with both ends of the tone curve softened and Clarity -4. Optional Shadow 0 is recorded, not silently applied. | Settings and supplied note |
| Dreamy Color | Velvia +4 Color and strong Chrome effects create expressive color despite soft local definition. | Settings |
| Soft Rust | Warm Classic Negative, strong color/shadows and DR100 for dense earthy contrast. | Settings |
| Calm Sea | Astia, Shade WB and soft detail, but +2 highlights mean bright clouds can remain abrupt. | Settings |
| Neutral One | Eterna foundation with warm WB, +4 Color and +2 shadows: cinematic rather than literally neutral. | Settings |
| Fall City | Grain-free fall/street option; highlight softness with stronger shadows. Descriptive catalog name. | Settings and supplied note |
| Autumn Ember | Strong warm fixed WB, maximum color and soft Clarity for vivid foliage; recorded ND/Black Mist context matters. | Settings and supplied note |
| Mono Soul | Tonal rather than chromatic composition, with high highlight/shadow contrast; plain-Acros versus +G discrepancy disclosed. | Retrieved creator, catalog settings retained |
| Warm Table | Astia food palette, warm Kelvin range and moderate texture; no invented grain/Chrome values. Descriptive catalog name. | Settings and supplied note |
| Summer Rain | Overcast portrait note with less red-biased Daylight shift and softened highlights. Shadow +0.5 is added contrast, not lifted shadows. | Settings and supplied note |
| Dote’s Classic Chrome | Warm daylight Classic Chrome with softened tones; limited small catalog sample crops constrain visual evidence. | Settings and supplied note |
| Calm Sea · Scotland | Preserve separate exposure -1/3 to 0 and ISO text even though most controls match the earlier recipe. | Settings and paired-slide note |
| Classic Autumn · Scotland | Color 0 and gentler shadows make a calmer autumn alternative; large grain remains conspicuous in haze. | Settings and paired-slide note |
| Soft Rust · Scotland | DR400, NR 0 and -2/3 to 0 guidance differ materially from DR100/NR -4 original. | Settings and paired-slide note |
| Cool Air · Scotland | Nostalgic Negative, hard highlights/shadows and strong color create dramatic hills; its name does not negate warm highlight behavior. | Settings and paired-slide note |
| Plain Light · Scotland | Small WB shift, modest color, grain off and Pro Neg. Hi make a restrained, skin-friendly alternative. | Settings and paired-slide note |

## Colorist reasoning and limits

Look at **relationships**, not just dominant hue: warm/cool separation can distinguish skin from vegetation or orange land from blue sky; analogous warm colors can unify food and wood; monochrome can clarify shape when distracting colors contribute little. None of these is an objective guarantee of beauty. Protect the subject’s skin, highlight detail, narrative color and desired mood first. Highly saturated recipes can harm already vivid skin/flowers; strong positive shadows can lose dark faces/foliage; fixed Kelvin can be inconsistent under mixed artificial light. A phone JPEG already has its own white balance and tone mapping, so it is scene evidence rather than a calibrated Fuji RAW preview.

The profiles do not transform the uploaded image into an exact Fuji render. Real output depends on camera, exposure, illuminant, lens, filters and firmware. Aesthetic suggestions should explain a plausible direction, offer three alternatives and make uncertainty visible.

## Adding recipes and improving knowledge

A newly added recipe needs a matching reviewed profile before it participates in recommendations. Read every actual setting and note; inspect correctly paired samples; locate the exact creator post where publicly accessible; distinguish catalog names from creator titles; record deviations, variants, missing values and external diffusion. Do not infer intent from the title or copy the nearest recipe profile. If evidence is limited, label it settings-inference and request/retain better exact-source material for a later review.

A user choosing a recipe is evidence of preference, not proof of why they chose it or how the eventual Fuji photograph looked. Store explicit reasons separately from inferred preference signals; if no reason is given, describe the update as preference adaptation rather than understood artistic intent. Compare choices against all three candidates and their scene context, allow correction/reset, and do not permanently penalize unchosen alternatives after one selection. New evidence or new recipes should trigger a reviewed profile update. No automatic model retraining or universal photographic expertise should be claimed merely from recommendation clicks.

## Knowledge review — 20 October 2026

All 19 saved profiles have been reviewed against exact settings, catalog notes and existing reference compositions. The linked mind map is generated from those same profiles. The seven new Dote examples are explicitly user-approved references; other entries retain their prior creator vs settings-inference evidence labels. Lighting suitability is an interpretation, not inferred EXIF or certainty about creator intent. See `recipe-mind-map.md` and each profile’s evidence limits.
