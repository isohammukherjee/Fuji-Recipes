// Runs outside the UI thread. No photo bytes are uploaded by this worker.
let classifier;
self.onmessage=async ({data})=>{
 try{
  if(!classifier){
   self.postMessage({type:'progress',message:'Loading vision engine…'});
   const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js');
   env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;env.backends.onnx.wasm.proxy=false;
   classifier=await pipeline('zero-shot-image-classification','Xenova/clip-vit-base-patch32',{dtype:'q8',device:'wasm',revision:'4c1807b705b1d015fb032789cc4d221b23025a6f',progress_callback:p=>{if(p.status==='progress')self.postMessage({type:'progress',message:`Downloading vision model${p.progress?': '+Math.round(p.progress)+'%':''}…`});}});
  }
  self.postMessage({type:'progress',message:'Recognizing subjects and lighting…'});
  const subjects=await classifier(data.image,Object.values(data.subjects),{hypothesis_template:'This is a photo of {}.'});
  const lights=await classifier(data.image,Object.values(data.lights),{hypothesis_template:'This is {}.'});
  self.postMessage({type:'result',subjects,lights});
 }catch(e){classifier=null;self.postMessage({type:'error',message:'The vision engine could not run. Check your connection and free memory, then retry. No AI recommendations have been generated.'});}
};
