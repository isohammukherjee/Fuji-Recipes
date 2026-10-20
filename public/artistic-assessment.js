// Measured evidence and concise photographic decisions; no private reasoning transcript.
export const ASSESSMENT_VERSION='artistic-1.0';
export function measureComposition(pixels,width,height){
 const cells=Array.from({length:9},()=>({sum:0,count:0}));let edges=0,n=0;
 const luma=i=>(.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2])/255;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;if(pixels[i+3]<128)continue;const z=cells[Math.min(2,Math.floor(y/height*3))*3+Math.min(2,Math.floor(x/width*3))];z.sum+=luma(i);z.count++;if(x){edges+=Math.abs(luma(i)-luma(i-4));n++;}}
 const grid=cells.map(c=>c.sum/Math.max(1,c.count));const mean=ids=>ids.reduce((s,i)=>s+grid[i],0)/ids.length;const horizontal=mean([2,5,8])-mean([0,3,6]),vertical=mean([6,7,8])-mean([0,1,2]);
 return {grid,horizontal,vertical,edgeContrast:edges/Math.max(1,n),lightPlacement:Math.abs(horizontal)>.07?(horizontal>0?'Brighter tones on the right':'Brighter tones on the left'):Math.abs(vertical)>.07?(vertical>0?'Brighter tones toward the bottom':'Brighter tones toward the top'):'Broadly balanced regional brightness'};
}
export function artisticAssessment(scene,mood='auto'){
 const observations=[],decisions=[],cautions=[];const colors=scene.palette||[];const warm=colors.filter(p=>['orange','yellow','red'].includes(p.name)).reduce((s,p)=>s+p.share,0),cool=colors.filter(p=>['blue','cyan','green'].includes(p.name)).reduce((s,p)=>s+p.share,0);
 if(warm>.12&&cool>.12){observations.push('Warm and cool color groups both occupy meaningful parts of the image.');decisions.push('Consider warm/cool separation without overpowering either group.');}
 else if(warm>.3){observations.push('Warm colors carry much of the visible palette.');decisions.push('Keep warm colors coherent; compare a restrained look against an amber interpretation.');}
 else{decisions.push(scene.saturation<.2?'Let luminance, texture and restrained color carry the image.':'Preserve the scene’s key color relationships before adding stronger style.');}
 if(scene.composition)observations.push(scene.composition.lightPlacement+'. This describes pixel brightness, not a proven light-source position.');
 if(scene.subjects?.includes('portrait')||(scene.objects||[]).some(o=>o.label==='person'&&o.score>.45)){decisions.push('Give skin and readable faces priority over stronger saturation.');cautions.push('A detected person does not establish skin tone or correct skin color.');}
 if(scene.shadow>.2){decisions.push('Keep separation in existing deep shadows.');cautions.push('Dense-shadow recipes may hide important dark detail.');}
 if(scene.highlight>.01){decisions.push('Protect bright detail and compare preview clipping.');cautions.push('Clipped source-JPEG highlights cannot be recovered.');}
 if(['artificial','mixed','night'].includes(scene.light))cautions.push('Fixed white balance can amplify mixed or artificial light casts.');
 if(scene.uncertain)cautions.push('Subject or light estimates are ambiguous; correct tags before trusting the ranking.');
 if(mood!=='auto')decisions.unshift('Your chosen artistic direction: '+mood+'.');
 return {observations,decisions,cautions,version:ASSESSMENT_VERSION};
}
export function visualIntentPrompt(recipe,profile){return `a ${profile.moods.slice(0,2).join(' and ')} photograph of ${profile.subjects.slice(0,3).join(', ')} with ${profile.palette.slice(0,3).join(', ')} colors, ${profile.preferredLighting.slice(0,2).join(' or ')} light`;}
export const CONTEXT_TERMS=['wood','desk','coffee','food','plant','foliage','sky','cloud','mountain','water','building','street','flower','snow','mist','skin','portrait','interior'];
export function corroboratedContext(scene,profile){
 const text=String(scene.visionDescription||'').toLowerCase(),reference=String(profile.referenceObservation||'').toLowerCase();const objects=(scene.objects||[]).map(o=>o.label).join(' ');
 const supports={wood:['still-life','interior'],desk:['still-life','interior'],coffee:['food','still-life'],food:['food'],plant:['forest','interior','flowers'],foliage:['forest'],sky:['landscape','coast','architecture'],cloud:['landscape','coast'],mountain:['landscape'],water:['coast'],building:['architecture','street'],street:['street'],flower:['flowers'],snow:['snow'],mist:['landscape'],skin:['portrait'],portrait:['portrait'],interior:['interior']};
 return CONTEXT_TERMS.filter(t=>new RegExp('\\b'+t+'(?:s)?\\b').test(text)&&new RegExp('\\b'+t+'(?:s)?\\b').test(reference)&&(supports[t].some(s=>scene.subjects?.includes(s))||objects.includes(t)));
}
export function descriptionAgreement(description,comparisons){
 const candidate=comparisons.find(c=>c.label===description)?.score||0;const anchors=comparisons.filter(c=>c.label!==description).map(c=>c.score);const best=Math.max(0,...anchors);
 return {accepted:description.length>=15&&candidate>=best*.65,relativeScore:candidate,anchorScore:best};
}
