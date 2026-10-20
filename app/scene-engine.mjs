// All scores are relative ranking signals, never calibrated probabilities.
export const ENGINE_VERSION='scene-2.1';
export const SUBJECTS={portrait:'a portrait of a person or people',street:'a street with people and everyday activity',architecture:'buildings and architectural details',landscape:'mountains and open countryside',forest:'trees and green forest foliage',coast:'a beach, ocean, river or lake',food:'food, coffee or a meal on a table',flowers:'flowers and colorful plants',animals:'an animal, bird or pet',night:'a city at night with neon lights',interior:'an indoor room or cafe',snow:'a snowy winter landscape',festival:'a colorful festival or celebration', 'still-life':'a still life of objects and products'};
export const LIGHTS={daylight:'a scene in bright daylight with hard sunlight',overcast:'a scene under soft overcast light',golden:'a scene in warm golden hour sunlight',night:'a scene in low light at night',artificial:'a scene with indoor artificial lighting',backlit:'a backlit scene with bright highlights and dark shadows',fog:'a scene in mist or fog',mixed:'a scene under mixed cool daylight and warm artificial lighting'};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const value=s=>parseFloat(String(s).replaceAll('−','-'))||0;
export function measurePixels(data){
 const bins=Array.from({length:9},()=>({count:0,r:0,g:0,b:0}));const names=['red','orange','yellow','green','cyan','blue','purple','red','neutral'];
 const lum=[],sat=[];let shadow=0,highlight=0;
 for(let i=0;i<data.length;i+=4){if(data[i+3]<128)continue;const r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;const s=max?d/max:0;let h=d===0?0:max===r?((g-b)/d+6)%6:max===g?(b-r)/d+2:(r-g)/d+4;h*=60;const j=s<.16||max<.08?8:h<15||h>=345?0:h<45?1:h<70?2:h<165?3:h<195?4:h<255?5:6;const z=bins[j];z.count++;z.r+=data[i];z.g+=data[i+1];z.b+=data[i+2];
 const linear=c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4;const l=.2126*linear(r)+.7152*linear(g)+.0722*linear(b);lum.push(l);sat.push(s);if(l<.035)shadow++;if(l>.85)highlight++;
 }
 if(!lum.length)throw new Error('This image has no visible pixels.');lum.sort((a,b)=>a-b);const n=lum.length;const palette=bins.map((b,i)=>({name:names[i],share:b.count/n,hex:'#'+[b.r,b.g,b.b].map(v=>Math.round(v/(b.count||1)).toString(16).padStart(2,'0')).join('')})).filter(b=>b.share>.035).sort((a,b)=>b.share-a.share).slice(0,5);
 const hues={red:0,orange:30,yellow:60,green:125,cyan:180,blue:225,purple:285};const colored=palette.filter(p=>p.name!=='neutral');let harmony='a restrained palette';if(colored.length>1){const diff=Math.abs(hues[colored[0].name]-hues[colored[1].name]);const dist=Math.min(diff,360-diff);harmony=dist>145?'complementary color contrast':dist<75?'neighboring, harmonious colors':'a varied color palette';}
 return {palette,brightness:lum[Math.floor(n*.5)],contrast:lum[Math.floor(n*.95)]-lum[Math.floor(n*.05)],saturation:sat.reduce((a,b)=>a+b,0)/n,shadow:shadow/n,highlight:highlight/n,harmony};
}
export function sceneContext(scene){return {subjects:scene.subjects.slice(0,3),light:scene.light,palette:scene.palette.map(p=>p.name),contrast:scene.contrast,brightness:scene.brightness};}
function similarity(a,b){const shared=a.subjects.some(s=>b.subjects.includes(s))?1:0;const palette=a.palette.filter(s=>b.palette.includes(s)).length/Math.max(1,a.palette.length);return .55*shared+.2*(a.light===b.light?1:0)+.15*palette+.1*(1-Math.abs(a.contrast-b.contrast));}
export function personIsSalient(o){if(o.label!=='person'||o.score<.45)return false;if(!o.box)return true;const b=o.box,area=Math.max(0,b.xmax-b.xmin)*Math.max(0,b.ymax-b.ymin),cy=(b.ymin+b.ymax)/2;return area>.12&&cy>.2&&cy<.85;}
export function evaluateRecipes(recipes,profiles,scene,mood='auto',memory=[]){
 const people=scene.subjects[0]==='portrait'||(scene.objects||[]).some(personIsSalient);
 const scoreObjects=scene.objects||[];
 return recipes.filter(r=>profiles[r.id]).map(r=>{
  const p=profiles[r.id],s=r.settings,mono=/Acros|Monochrome/.test(s['Film simulation']);const evidence=[],warnings=[p.caution];
  const parts={subject:0,palette:0,light:0,intent:0,render:0,preference:0};
  scene.subjects.slice(0,3).forEach((name,i)=>{if(p.subjects.includes(name))parts.subject+=[4,1.5,.65][i];});
  if(people&&p.subjects.includes('portrait'))parts.subject+=1.8;
  if(parts.subject) evidence.push(`The ${scene.subjects[0]||'main subject'} context${people?' with people present':''} fits this recipe’s intended subjects.`);
  const colors=scene.palette.filter(c=>c.name!=='neutral'&&p.palette.includes(c.name));parts.palette=Math.min(1.5,colors.reduce((a,b)=>a+b.share*3,0));
  if(colors.length)evidence.push(`${colors.slice(0,2).map(c=>c.name).join(' / ')} are present; ${scene.harmony} can support this palette.`);
  const color=settingValue(s.Color),shadow=settingValue(s.Shadow),hi=settingValue(s.Highlight),wb=s['White balance'];
  if(p.preferredLighting?.includes(scene.light)){parts.light+=.65;evidence.push(`The ${scene.light} light fits the reviewed recipe knowledge map.`);}
  const mixed=['artificial','night','mixed'].includes(scene.light);
  if(mixed){parts.light+=wb==='Auto'?1.5:-2.3;if(wb!=='Auto')warnings.push('Fixed WB may exaggerate the mixed/artificial-light cast.');}
  if(scene.contrast>.6){parts.light+=hi<0?.8:-hi*.25;if(shadow>1)parts.light-=.7;if(s['Dynamic range']==='DR400')parts.light+=.5;}
  if(['overcast','fog'].includes(scene.light)&&p.moods.includes('soft'))parts.light+=.4;
  if(people&&mood!=='vivid'&&mood!=='mono'){if(/Velvia/.test(s['Film simulation']))parts.intent-=2.5;if(color>=4)parts.intent-=1.2;if(p.moods.includes('natural')||s['Film simulation']==='Pro Neg. Hi')parts.intent+=1;}
  if(mood==='auto'){if(p.moods.includes('natural'))parts.intent+=.6;if(mono)parts.intent-=1.2;}
  else{parts.intent+=p.moods.includes(mood)?3.5:-1;if(mood==='mono')parts.intent+=mono?9:-9;else if(mono)parts.intent-=7;}
  if(scene.saturation>.5&&color>=3&&mood!=='vivid')parts.intent-=.8;
  const impact=scene.impacts?.[r.id];
  if(impact){const base=scene.previewBase||{clipped:scene.highlight||0,dark:scene.shadow||0};const extraClip=Math.max(0,impact.clipped-base.clipped),extraDark=Math.max(0,impact.dark-base.dark);parts.render-=Math.min(2.2,extraClip*12+extraDark*5);
   if(extraClip>.015)warnings.push('The approximate render increases clipping; protect bright detail in camera.');
   if(extraDark>.035)warnings.push('The approximate render deepens already dark areas; check faces and shadow separation.');
   if(people&&impact.saturation>scene.saturation+.1&&mood!=='vivid'){parts.render-=.8;warnings.push('Added saturation may be less forgiving on people and bright clothing.');}
   if(impact.shift>.16&&['natural','auto'].includes(mood)){parts.render-=.7;warnings.push('This is a stronger color reinterpretation than the more restrained alternatives.');}
   evidence.push(`Preview check: ${extraClip>.015?'some added highlight clipping':extraDark>.035?'deeper dark tones':'no large additional clipping in this approximation'}.`);
  }
  let examples=0;for(const m of memory){if(!m.context||!Array.isArray(m.context.subjects))continue;const sim=similarity(sceneContext(scene),m.context);if(sim<.65)continue;if(m.recipeId===r.id){parts.preference+=sim*.25;examples++;}if(m.reason&&p.moods.includes(m.reason))parts.preference+=sim*.1;}
  parts.preference=clamp(parts.preference,0,1);if(examples)evidence.push(`Your choices in ${examples} similar scenes add a small preference adjustment.`);
  if(wb!=='Auto')warnings.push(`WB ${wb} is illuminant-dependent; compare under the actual light.`);
  if(scene.highlight>.03)warnings.push('Existing clipped JPEG highlights cannot be recovered by changing recipes.');
  const score=Object.values(parts).reduce((a,b)=>a+b,0);
  return {recipeId:r.id,score,parts,reasons:[p.intent,...evidence].slice(0,5),warnings:warnings.filter(Boolean),learned:examples>0,profile:p,impact,people,objects:scoreObjects};
 }).sort((a,b)=>b.score-a.score||a.recipeId.localeCompare(b.recipeId));
}
const settingValue=s=>value(s);
export function chooseDirections(ranked,recipes,variant=0){
 if(ranked.length<=3)return ranked;
 const chosen=[ranked[0]];const sim=id=>recipes.find(r=>r.id===id)?.settings['Film simulation'];
 const pool=ranked.slice(1).filter(r=>r.score>=ranked[0].score-3);
 const second=pool.find(r=>r.profile.moods.includes('cinematic')&&r.recipeId!==chosen[0].recipeId)||ranked[1];chosen.push(second);
 const remaining=ranked.filter(r=>!chosen.some(c=>c.recipeId===r.recipeId));const distinct=remaining.filter(r=>!chosen.some(c=>sim(c.recipeId)===sim(r.recipeId))&&r.score>=remaining[0].score-1.5);const options=distinct.length?distinct:remaining.slice(0,Math.min(4,remaining.length));chosen.push(options[variant%options.length]);return chosen;
}
export function rankRecipes(recipes,profiles,scene,mood='auto',memory=[],variant=0){return chooseDirections(evaluateRecipes(recipes,profiles,scene,mood,memory),recipes,variant);}
export function rememberChoice(memory,scene,recipeId,reason,id){const prior=memory.filter(m=>m.id!==id);return [...prior,{id,recipeId,reason,context:sceneContext(scene),version:ENGINE_VERSION,time:Date.now()}].slice(-200);}
