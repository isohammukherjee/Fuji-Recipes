export const ANALYSIS_STAGES=[['pixels','Color & light'],['vision','Visual description'],['subjects','Scene & objects'],['interpretation','Photographic assessment'],['emulation','Test every recipe'],['selection','Choose directions'],['preview','Render previews'],['feedback','Your choice']];
export const PREVIEW_STAGES=[['pixels','Read source'],['transform','Color & tone'],['texture','Texture & grain'],['preview','Display result']];
export function recordStage(events,event){
 if(![...ANALYSIS_STAGES,...PREVIEW_STAGES].some(([id])=>id===event.stage))return events;
 const next={...event,time:Date.now()};return [...events.filter(x=>x.stage!==event.stage),next];
}
export function interruptStages(events,status='cancelled'){return events.map(e=>e.status==='running'?{...e,status,summary:status==='cancelled'?'Stopped before completion.':e.summary}:e);}
