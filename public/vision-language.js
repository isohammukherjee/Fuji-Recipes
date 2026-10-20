export const VISION_MODEL={id:'onnx-community/Florence-2-base-ft',revision:'e88a44eaf3791a35eae0c5a47b3dbcd36e67eb6f',dtype:{embed_tokens:'q8',vision_encoder:'q8',encoder_model:'q8',decoder_model_merged:'q4'},downloadBytes:241181940};
// A specialized caption task generates visible-scene context, not private reasoning.
export const OBSERVATION_PROMPT='<MORE_DETAILED_CAPTION>';
export async function describeScene(runtime,image,{onProgress=()=>{},device='wasm'}={}){
 const {AutoProcessor,Florence2ForConditionalGeneration,RawImage}=runtime;let model;
 try{
  const options={revision:VISION_MODEL.revision,progress_callback:onProgress};
  const processor=await AutoProcessor.from_pretrained(VISION_MODEL.id,options);
  model=await Florence2ForConditionalGeneration.from_pretrained(VISION_MODEL.id,{...options,dtype:VISION_MODEL.dtype,device});
  const inputImage=typeof image==='string'?await RawImage.read(image):image;
  const inputs=await processor(inputImage,OBSERVATION_PROMPT);
  const output=await model.generate({...inputs,max_new_tokens:100,do_sample:false,repetition_penalty:1.1});
  const decoded=processor.batch_decode(output,{skip_special_tokens:false})[0];
  const description=processor.post_process_generation(decoded,OBSERVATION_PROMPT,inputImage.size)[OBSERVATION_PROMPT]?.trim();
  if(!description||description.length<15)throw new Error('No usable visual description was produced.');
  return {description:description.slice(0,1400),model:VISION_MODEL.id,revision:VISION_MODEL.revision,device};
 }finally{if(model)await model.dispose();}
}
