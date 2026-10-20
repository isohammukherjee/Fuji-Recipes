import {recipeImpact,pixelMetrics} from './recipe-renderer.js';
let classifier,detector,pipeline,env;
self.onmessage=async ({data})=>{
 let phase='runtime';
 const send=value=>self.postMessage({...value,id:data.id});
 const progress=p=>{if(p.status==='progress')send({type:'progress',message:`Downloading ${phase} model${p.progress?': '+Math.round(p.progress)+'%':''}…`});};
 try{
  if(!pipeline){send({type:'progress',message:'Loading local vision runtime…'});({pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js'));env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;env.backends.onnx.wasm.proxy=false;}
  phase='scene';if(!classifier){send({type:'progress',message:'Loading scene model…'});classifier=await pipeline('zero-shot-image-classification','Xenova/clip-vit-base-patch32',{dtype:'q8',device:'wasm',revision:'4c1807b705b1d015fb032789cc4d221b23025a6f',progress_callback:progress});}
  send({type:'progress',message:'Reading subject and lighting cues…'});
  const subjects=await classifier(data.image,Object.values(data.subjects),{hypothesis_template:'This is a photo of {}.'});
  const lights=await classifier(data.image,Object.values(data.lights),{hypothesis_template:'This is {}.'});
  phase='object';let objects=[],objectWarning='';
  try{
   if(!detector){send({type:'progress',message:'Loading object awareness…'});detector=await pipeline('object-detection','Xenova/yolos-tiny',{dtype:'q8',device:'wasm',revision:'e2f9c7673f0fa61849efe2b56a0d7774779ebb9d',progress_callback:progress});detector.processor.image_processor.size={shortest_edge:384,longest_edge:640};}
   send({type:'progress',message:'Checking people and objects…'});objects=(await detector(data.image,{threshold:.45,percentage:true})).slice(0,20);
  }catch{detector=null;objectWarning='Object detection was unavailable. Scene and color analysis completed; verify the subject tags.';}
  phase='recipe';send({type:'progress',message:`Comparing all ${data.recipes.length} recipes against this scene…`});
  const pixels=new Uint8ClampedArray(data.pixels),impacts={};for(const r of data.recipes)impacts[r.id]=recipeImpact(pixels,data.width,data.height,r.settings);
  send({type:'result',subjects,lights,objects,objectWarning,impacts,previewBase:pixelMetrics(pixels)});
 }catch(e){send({type:'error',message:`${phase==='runtime'?'Vision runtime could not start':phase==='scene'?'Scene model could not load or analyze this image':'Recipe comparison could not finish'}. Check your connection and available memory, then retry.`,phase,detail:String(e?.message||e).slice(0,180)});}
};
