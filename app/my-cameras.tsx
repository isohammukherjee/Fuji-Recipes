'use client';
import {useEffect,useMemo,useState} from 'react';
import cameras from '../data/camera-capabilities.json';
import seed from '../data/recipes.json';
type Saved={camera:string;firmware:string;slots:Record<string,{recipe:string;status:'planned'|'on-camera'}>;own:{id:string;name:string;creator:string;settings:Record<string,string>}[]};
const KEY='fuji-my-cameras-v1';
const initial:Saved={camera:'x-s20',firmware:'',slots:{C1:{recipe:'reggies-portra',status:'planned'},C2:{recipe:'fall-city',status:'planned'},C3:{recipe:'cool-air-scotland',status:'planned'},C4:{recipe:'',status:'planned'}},own:[]};
export default function MyCameras({onClose}:{onClose:()=>void}){
 const [state,setState]=useState<Saved>(initial),[loaded,setLoaded]=useState(false),[draftName,setDraftName]=useState(''),[draftSettings,setDraftSettings]=useState('');
 useEffect(()=>{try{const v=localStorage.getItem(KEY);if(v){const p=JSON.parse(v);setState({...initial,...p,slots:p.slots||initial.slots,own:p.own||[]});}}catch{}setLoaded(true);},[]);
 useEffect(()=>{if(loaded)try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}},[state,loaded]);
 const camera=cameras.models.find(c=>c.id===state.camera)||cameras.models[0];
 const recipes=[...seed.map(r=>({id:r.id,name:r.name,settings:r.settings})),...state.own];
 const slots=typeof camera.customSlots==='number'?Array.from({length:camera.customSlots},(_,i)=>'C'+(i+1)):[];
 const selected=useMemo(()=>recipes.filter(r=>Object.values(state.slots).some(s=>s.recipe===r.id)),[recipes,state.slots]);
 const update=(patch:Partial<Saved>)=>setState(v=>({...v,...patch}));
 const compare=(r:typeof recipes[number])=>{const missing:string[]=[];const f=camera.features;if(!f)return ['Camera capabilities not fully verified: manual review required'];const settings=r.settings as Record<string,string>;for(const [field,key] of [['Grain effect','grain'],['Color Chrome','colorChrome'],['Color Chrome FX Blue','colorChromeBlue'],['Clarity','clarity']] as const){if(!f[key]&&settings[field]&&!/^(off|0|not specified)$/i.test(settings[field]))missing.push(field+' unsupported');}if(!f.nostalgicNegative&&/nostalgic/i.test(settings['Film simulation']||''))missing.push('Nostalgic Negative unavailable');if(!f.realaAce&&/reala/i.test(settings['Film simulation']||''))missing.push('REALA ACE unavailable');if(camera.id==='x-s20'&&/reala/i.test(settings['Film simulation']||'')&&state.firmware&&Number(state.firmware)<3)missing.push('REALA ACE requires firmware 3.00+');return missing;};
 return <section style={{maxWidth:980,margin:'0 auto',padding:'16px 12px 48px',color:'inherit'}}>
 <button className="pill" onClick={onClose}>← Recipes</button><h1 style={{fontSize:'clamp(28px,5vw,42px)',margin:'18px 0 4px'}}>My Cameras</h1><p style={{opacity:.75}}>Your Fujifilm bodies, firmware, recipe compatibility and physical custom-slot tracker.</p>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:14,marginTop:24}}>
 <label>Camera model<select aria-label="Camera model" value={state.camera} onChange={e=>update({camera:e.target.value})} style={{display:'block',width:'100%',padding:13,borderRadius:12,background:'#272a29',color:'white',fontSize:16}}>{cameras.models.map(c=><option key={c.id} value={c.id}>{c.model}</option>)}</select></label>
 <label>Installed firmware (enter from camera)<input value={state.firmware} onChange={e=>update({firmware:e.target.value})} placeholder="e.g. 3.30" style={{display:'block',width:'100%',padding:13,borderRadius:12,fontSize:16}}/></label>
 </div>
 <p style={{marginTop:16}}>Latest listed firmware: <strong>{camera.latestFirmware||'Not verified'}</strong> · Custom banks: <strong>{camera.customSlots===null?'Not verified':camera.customSlots}</strong> · <a href={camera.firmwareUrl} target="_blank" rel="noreferrer">Official firmware page ↗</a></p>
 {camera.id==='x-s20'&&<p>Firmware 3.00 added REALA ACE, bringing the X-S20 from 19 to 20 film simulations. C1–C4 are shared between STILL and MOVIE; these are not separate sets of four.</p>}
 {camera.customSlots===null&&<p role="status">Slot support has not been manually verified for this model. The app will not invent a count.</p>}
 {camera.customSlots===0&&<p role="status">This camera has no recipe custom banks. You can still keep recipes in your library and manually apply supported settings.</p>}
 <h2 style={{fontSize:25,marginTop:28}}>Camera recipe slots</h2>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
 {slots.map(slot=>{const assigned=state.slots[slot]||{recipe:'',status:'planned' as const};const chosen=recipes.find(r=>r.id===assigned.recipe);const issues=chosen?compare(chosen):[];return <article key={slot} style={{border:'1px solid #7776',borderRadius:16,padding:16}}><strong style={{fontSize:25}}>{slot}</strong><div style={{marginTop:8}}><select aria-label={slot+' recipe'} value={assigned.recipe} onChange={e=>update({slots:{...state.slots,[slot]:{...assigned,recipe:e.target.value,status:'planned'}}})} style={{width:'100%',padding:12,borderRadius:10,background:'#272a29',color:'white',fontSize:16}}><option value="">Not assigned</option>{recipes.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></div><label style={{display:'block',marginTop:12}}><input type="checkbox" checked={assigned.status==='on-camera'} onChange={e=>update({slots:{...state.slots,[slot]:{...assigned,status:e.target.checked?'on-camera':'planned'}}})}/> Actually saved on camera</label><p style={{opacity:.7,fontSize:13}}>{assigned.status==='on-camera'?'Confirmed manually by you':'Planned in app only'}</p>{issues.map(s=><p key={s} style={{color:'#efb06e',fontSize:13}}>⚠ {s}</p>)}</article>})}
 </div>
 <h2 style={{fontSize:25,marginTop:30}}>My own recipes</h2><p>Creator: <strong>sohamsphotography</strong>. These remain editable in your local collection; C4 stays reserved until you provide the settings.</p>
 <label>Recipe name<input value={draftName} onChange={e=>setDraftName(e.target.value)} placeholder="Soham's Portraits" style={{display:'block',width:'100%',padding:12,borderRadius:10,marginBottom:12,fontSize:16}}/></label>
 <label>Settings (one setting: value per line)<textarea value={draftSettings} onChange={e=>setDraftSettings(e.target.value)} rows={6} placeholder={'Film simulation: Eterna\nWhite balance: Auto'} style={{display:'block',width:'100%',padding:12,borderRadius:10,fontSize:16}}/></label>
 <button className="pill" style={{marginTop:12}} disabled={!draftName.trim()} onClick={()=>{const settings=Object.fromEntries(draftSettings.split('\n').map(x=>x.split(/:(.*)/s).slice(0,2).map(y=>y.trim())).filter(x=>x[0]&&x[1]));update({own:[...state.own,{id:'personal-'+Date.now(),name:draftName.trim(),creator:'sohamsphotography',settings}]});setDraftName('');setDraftSettings('');}}>Save personal recipe</button>
 {state.own.map(r=><p key={r.id}><strong>{r.name}</strong> · {Object.keys(r.settings).length} settings · <button onClick={()=>update({own:state.own.filter(x=>x.id!==r.id)})}>Remove</button></p>)}
 <h2 style={{fontSize:25,marginTop:30}}>Connected recipe intelligence</h2><p>{selected.length} assigned recipes. Compatibility checks use model and firmware capabilities where verified; unsupported settings are flagged rather than silently discarded. Recommendations and previews remain approximations, not camera-exact simulations.</p>
 <p style={{fontSize:13,opacity:.65}}>Camera collection is saved in this device's browser storage. It is not yet synchronized with your signed-in web account or offline Android installation. The app does not read the physical camera's settings automatically.</p>
 </section>;
}
