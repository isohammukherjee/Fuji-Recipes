# Neural analysis and live evidence map

## What is real

Version 1.4 / scene engine 3.0 uses pretrained neural image recognition, object detection, image-to-text interpretation and cross-modal recipe-intent matching. The animated tree is a live application evidence graph: its nodes report actual completed operations, not internal neuron activations or private chain-of-thought. No timer marks a stage complete. Running nodes pulse; completed data remains inspectable; cancelled, failed and unavailable stages remain distinct. Reduced motion disables animation.

The same graph follows recipe emulation from temporary source pixels through the actual color/tone and texture operations to canvas display. All 19 low-resolution recipe tests emit results individually. Candidate branches expose subject, palette, light, mood, approximate render, contextual neural fit and personal preference contributions. Generated text cannot invent recipe IDs or change source settings.

## Pipeline

1. **Measure** palette, linear-light tonal range and a 3×3 spatial brightness grid. Regional brightness does not prove where the physical light source is.
2. **Describe** visible context with pinned `onnx-community/Florence-2-base-ft`, a specialized generative caption model, not a general expert reasoning model. Quantization: q8 vision encoder/text encoder/token embeddings and q4 merged decoder. Roughly 245 MB including tokenizer/config overhead in addition to recognition models/runtime. Generate at most 100 tokens; dispose the model before loading recognition sessions to reduce memory pressure.
3. **Recognize and cross-check** with pinned CLIP scene/light classification and YOLOS objects. A generated description must achieve at least 0.65 of the strongest competing scene description’s CLIP relative score. This conservative heuristic rejects some mismatches; it is not fact verification and accepted details can still be false. Rejected descriptions are shown as excluded and do not enter ranking context.
4. **Match recipe intent neurally** by comparing the image to short descriptions generated from each reviewed profile’s subjects, palette, mood and preferred light. Normalize within this analysis, preserve ties, and limit contribution to 1.25 fit points. Similarity is neither beauty nor confidence. Profiles with similar prompts need not separate neurally.
5. **Assess photographically**: preserve key color relationships, balance warm/cool groups, protect readable people, preserve shadow separation, and disclose already-clipped highlights or fixed-WB risks. These decisions are explicit photographic heuristics, not model-authored private reasoning. Optional caption terms contribute at most 0.6 points only when also supported by recognized subject context and that recipe’s reviewed references.
6. **Render every stored recipe** at measured resolution and inspect clipping, dark pixels, saturation and shift. Tests remain approximate, with an explicit default daylight illuminant. They do not calibrate a Fuji RAW/JPEG pipeline.
7. **Select three directions**, disclose relative fit, render before/after images and wait for explicit choice feedback. New recipes extend the same reviewed profile and participate automatically; no closed list of 19 prompt strings is embedded in the worker.

## Honest fallback and privacy

The generative step is enabled by default with a visible first-use download disclosure and can be switched off for quicker neural recognition. The browser worker has a ten-minute budget for the larger mode, four minutes for quick mode; cancel terminates the worker. Model/network/memory errors are not replaced with invented descriptions. Photos and captions remain temporary. Only existing bounded scene descriptors and explicit choices persist locally; model weights are not retrained. The renderer and collection work without generative AI downloads.

No cloud inference is configured. This is a practical local model ensemble with an evidence-based decision layer, not a claim to match a frontier vision-language reasoning system or a professional photographer’s judgment. Phone WebView speed, memory and WASM execution require device testing.

## Evidence and validation

A real pinned SmolVLM-256M CPU trial on the supplied desk screenshot incorrectly described a cooking app. A second cropped sample also had hallucinated detail. It was rejected as the default model. Independent CLIP gave that first false description 0.2223 relative score against 0.5435 for still-life objects; the conservative agreement gate excludes it. A regression test preserves this failure case. A pinned Florence-2-base CPU trial on the same supplied screenshot identified a phone screenshot, phones and a wooden surface, but incorrectly described the hand as holding a phone. This confirms real generation and demonstrates remaining factual error; it is not a quality benchmark or proof of expert judgment.

Primary references:

- https://huggingface.co/onnx-community/Florence-2-base-ft
- https://huggingface.co/microsoft/Florence-2-base-ft
- https://huggingface.co/docs/transformers.js/v3.8.1/en/index
- https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct (rejected candidate; not the shipped default)

The models are downloaded from their pinned repositories; FLORENCE and CLIP conversions use their model-card licensing and attribution. Existing reference photo credits and exact recipe settings remain unchanged.

Final cropped-desk CPU validation: Florence generated a description of a hand, silver phone and overlaid words in approximately 3.48 seconds after cached loading. Independent CLIP agreement accepted the broad scene (0.7621 vs strongest generic anchor 0.2199). The hand was still misidentified as holding a phone rather than a mouse: this demonstrates that agreement does not verify individual relations. The UI warning and bounded context contribution remain essential. This is a two-image engineering check, not a broad quality benchmark; browser WASM and physical phone performance are unverified.
