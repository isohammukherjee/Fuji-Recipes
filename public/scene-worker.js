import {recipeImpact,pixelMetrics} from './recipe-renderer.js';
import {describeScene} from './vision-language.js';
import {descriptionAgreement} from './artistic-assessment.js';
let classifier,detector,runtime;
self.onmessage=async ({data})=>{
 let phase='runtime';const send=value=>self.postMessage({...value,id:data.id});
 const stage=(name,status,summary,extra={})=>send({type:'stage',stage:name,status,summary,...extra});
 const progress=p=>{if(p.status==='progress')send({type:'progress',message:`Downloading ${phase} model${p.progress?': '+Math.round(p.progress)+'%':''}…`});};
 try{
  if(!runtime){send({type:'progress',message:'Loading local vision runtime…'});runtime=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js');runtime.env.allowLocalModels=false;runtime.env.backends.onnx.wasm.numThreads=1;runtime.env.backends.onnx.wasm.proxy=false;}
  let visionDescription='',visionWarning='',visionModel='',visionVerification=null;
  if(data.deepVision){phase='visual language';stage('vision','running','Loading a generative vision-language model and inspecting the scene.');
   // Release cached recognition sessions before the larger generative model.
   if(classifier){await classifier.dispose();classifier=null;}if(detector){await detector.dispose();detector=null;}
   try{const v=await describeScene(runtime,data.image,{onProgress:progress});visionDescription=v.description;visionModel=v.model;stage('vision','running','Visual description generated. Waiting for independent neural scene agreement.');}
   catch(e){visionWarning='Visual-language analysis was unavailable; no generated observation is being claimed.';stage('vision','skipped',visionWarning,{details:[String(e?.message||e).slice(0,200)]});}
  }else stage('vision','skipped','Quick mode: generative visual description was not requested.');
  phase='scene';stage('subjects','running','Recognizing likely subjects, lighting and objects.');
  if(!classifier)classifier=await runtime.pipeline('zero-shot-image-classification','Xenova/clip-vit-base-patch32',{dtype:'q8',device:'wasm',revision:'4c1807b705b1d015fb032789cc4d221b23025a6f',progress_callback:progress});
  const subjects=await classifier(data.image,Object.values(data.subjects),{hypothesis_template:'This is a photo of {}.'});
  const lights=await classifier(data.image,Object.values(data.lights),{hypothesis_template:'This is {}.'});
  if(visionDescription){const comparisons=await classifier(data.image,[visionDescription,...subjects.slice(0,3).map(s=>s.label)],{hypothesis_template:'{}.'});visionVerification=descriptionAgreement(visionDescription,comparisons);if(visionVerification.accepted)stage('vision','done','Visual description passed a conservative neural agreement check.',{details:[visionDescription,'Agreement is not fact verification; individual details can still be wrong.']});else{stage('vision','skipped','Generated description did not agree sufficiently with independent scene recognition and was excluded.',{details:['Rejected draft: '+visionDescription]});visionDescription='';visionWarning='The generated description could not be corroborated and was excluded. Neural scene, object, color and recipe comparisons remain available.';}}
  const prompts=data.recipes.map(r=>r.visualPrompt);const intentResult=await classifier(data.image,prompts,{hypothesis_template:'{}.'});const neuralIntent={};
  // Preserve ties instead of manufacturing recipe distinctions from equal scores.
  const scores=intentResult.map(r=>r.score),min=Math.min(...scores),max=Math.max(...scores);
  for(const r of data.recipes){const score=intentResult.find(x=>x.label===r.visualPrompt)?.score||0;neuralIntent[r.id]=max-min>1e-7?(score-min)/(max-min):0;}
  phase='object';let objects=[],objectWarning='';
  try{
   if(!detector){detector=await runtime.pipeline('object-detection','Xenova/yolos-tiny',{dtype:'q8',device:'wasm',revision:'e2f9c7673f0fa61849efe2b56a0d7774779ebb9d',progress_callback:progress});detector.processor.image_processor.size={shortest_edge:384,longest_edge:640};}
   objects=(await detector(data.image,{threshold:.45,percentage:true})).slice(0,20);
  }catch{detector=null;objectWarning='Object detection was unavailable. Verify the subject tags.';}
  stage('subjects','done','Scene, light and recipe-intent neural matching completed.',{details:[subjects[0]?.label||'Uncertain subject',lights[0]?.label||'Uncertain light',objects.length?objects.map(o=>o.label).join(', '):objectWarning||'No confident object detections.']});
  phase='recipe';stage('emulation','running','Rendering low-resolution tests to measure clipping, shadow loss, saturation and color shift.',{completed:0,total:data.recipes.length});
  const pixels=new Uint8ClampedArray(data.pixels),impacts={};let done=0;
  for(const r of data.recipes){impacts[r.id]=recipeImpact(pixels,data.width,data.height,r.settings);stage('emulation','running',`Tested ${r.name}.`,{completed:++done,total:data.recipes.length,recipeId:r.id,impact:impacts[r.id]});}
  stage('emulation','done',`All ${done} stored recipes were rendered and checked. These are approximate sRGB tests, not calibrated camera predictions.`,{completed:done,total:done});
  send({type:'result',subjects,lights,objects,objectWarning,visionDescription,visionWarning,visionModel,visionVerification,neuralIntent,impacts,previewBase:pixelMetrics(pixels)});
 }catch(e){stage(phase==='recipe'?'emulation':'subjects','error','Analysis could not finish.');send({type:'error',message:'Vision analysis could not finish. Check your connection and available memory, then retry.',phase,detail:String(e?.message||e).slice(0,180)});}
};
