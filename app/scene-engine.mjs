// All scores are relative ranking signals, never calibrated probabilities.
export const ENGINE_VERSION='scene-1.0';
export const SUBJECTS={portrait:'a portrait of a person or people',street:'a street with people and everyday activity',architecture:'buildings and architectural details',landscape:'mountains and open countryside',forest:'trees and green forest foliage',coast:'a beach, ocean, river or lake',food:'food, coffee or a meal on a table',flowers:'flowers and colorful plants',animals:'an animal, bird or pet',night:'a city at night with neon lights',interior:'an indoor room or cafe',snow:'a snowy winter landscape',festival:'a colorful festival or celebration', 'still-life':'a still life of objects and products'};
export const LIGHTS={daylight:'a scene in bright daylight with hard sunlight',overcast:'a scene under soft overcast light',golden:'a scene in warm golden hour sunlight',night:'a scene in low light at night',artificial:'a scene with indoor artificial lighting',backlit:'a backlit scene with bright highlights and dark shadows',fog:'a scene in mist or fog'};
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
export function rankRecipes(recipes,profiles,scene,mood='auto',memory=[]){
 const ranked=recipes.filter(r=>profiles[r.id]).map(r=>{const p=profiles[r.id],s=r.settings;let score=0;const reasons=[];const subject=scene.subjects.find(x=>p.subjects.includes(x));if(subject){score+=[4,2.2,1.1][scene.subjects.indexOf(subject)]||1;reasons.push(`A ${subject.replace('-',' ')} match: ${p.intent}`);}else reasons.push(p.intent);
 const colors=scene.palette.filter(c=>c.name!=='neutral'&&p.palette.includes(c.name));score+=Math.min(2,colors.reduce((a,b)=>a+b.share*4,0));if(colors.length)reasons.push(`Your ${colors.slice(0,2).map(c=>c.name).join(' and ')} tones support this recipe’s color direction (${scene.harmony}).`);
 const mono=/Acros|Monochrome/i.test(s['Film simulation']);if(mood!=='auto')score+=p.moods.includes(mood)?3.5:-1;if(mood==='mono')score+=mono?8:-8;else if(mono)score-=mood==='auto'?1:6;
 if(['artificial','night'].includes(scene.light)){if(s['White balance']==='Auto'){score+=1.5;reasons.push('Auto white balance adapts more readily to changing light.');}else score-=1.8;}
 if(['golden','daylight'].includes(scene.light)&&p.moods.includes('warm'))score+=.6;
 if(['overcast','fog'].includes(scene.light)&&p.moods.includes('soft'))score+=.7;
 if(scene.contrast>.65){if(s['Dynamic range']==='DR400'){score+=1;reasons.push('DR400 is a useful starting point for a wide tonal range; expose for the highlights.');}if(value(s.Highlight)<0)score+=.6;if(value(s.Shadow)>1)score-=.8;}
 if(scene.subjects.includes('portrait')&&(/Velvia/.test(s['Film simulation'])||value(s.Color)>=4)&&mood!=='vivid')score-=1.7;
 if(scene.saturation>.5&&value(s.Color)>=3&&mood!=='vivid')score-=.6;
 if(scene.palette[0]?.name==='neutral'&&mono)score+=.8;
 let learned=0,examples=0;for(const m of memory){if(!m.context||!Array.isArray(m.context.subjects))continue;const sim=similarity(sceneContext(scene),m.context);if(sim<.65)continue;if(m.recipeId===r.id){learned+=sim*.3;examples++;}if(m.reason&&p.moods.includes(m.reason))learned+=sim*.12;}
 learned=clamp(learned,0,1.2);score+=learned;if(examples)reasons.push(`Informed by ${examples} of your choices in similar scenes.`);
 const warnings=[p.caution];if(s['White balance']!=='Auto')warnings.push(`Fixed/preset WB (${s['White balance']}) can shift under a different light source; check the camera preview.`);if(scene.highlight>.03)warnings.push('Bright areas are already near clipping in this reference; no recipe can recover clipped JPEG detail.');
 return {recipeId:r.id,score,reasons:reasons.slice(0,4),warnings:warnings.filter(Boolean),learned:examples>0,profile:p};
 }).sort((a,b)=>b.score-a.score||a.recipeId.localeCompare(b.recipeId));
 // Prefer a distinct third interpretation when it is still close to the best alternatives.
 const result=ranked.slice(0,2);const sims=result.map(x=>recipes.find(r=>r.id===x.recipeId).settings['Film simulation']);const alt=ranked.slice(2).find(x=>!sims.includes(recipes.find(r=>r.id===x.recipeId).settings['Film simulation'])&&x.score>=(ranked[2]?.score??0)-1.2);if(ranked[2])result.push(alt||ranked[2]);return result;
}
export function rememberChoice(memory,scene,recipeId,reason,id){const prior=memory.filter(m=>m.id!==id);return [...prior,{id,recipeId,reason,context:sceneContext(scene),version:ENGINE_VERSION,time:Date.now()}].slice(-200);}
