'use client';
import {useEffect,useLayoutEffect,useRef} from 'react';
import type {PointerEvent,MouseEvent,WheelEvent} from 'react';

type Photo={url:string;id?:string;mine?:boolean};
/** Touch/trackpad use native scrolling. Mouse drag suppresses the click after a drag. */
export function useDragScroll(){
 const ref=useRef<HTMLDivElement>(null);
 const drag=useRef({id:-1,startX:0,startY:0,left:0,moved:false});
 const suppress=useRef(false);
 function finish(e:PointerEvent<HTMLDivElement>){const el=ref.current,d=drag.current;if(!el||d.id!==e.pointerId)return;drag.current.id=-1;delete el.dataset.dragging;if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);if(d.moved){suppress.current=true;const w=el.clientWidth;if(el.dataset.gallery==='true')el.scrollTo({left:Math.round(el.scrollLeft/w)*w,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}
 return {ref,onPointerDown:(e:PointerEvent<HTMLDivElement>)=>{if(e.pointerType!=='mouse'||e.button!==0)return;const el=ref.current!;suppress.current=false;drag.current={id:e.pointerId,startX:e.clientX,startY:e.clientY,left:el.scrollLeft,moved:false};},onPointerMove:(e:PointerEvent<HTMLDivElement>)=>{const el=ref.current,d=drag.current;if(!el||d.id!==e.pointerId)return;const dx=e.clientX-d.startX;if(!d.moved&&Math.abs(dx)>6&&Math.abs(dx)>Math.abs(e.clientY-d.startY)){d.moved=true;el.dataset.dragging='true';el.setPointerCapture(e.pointerId);}if(d.moved){e.preventDefault();el.scrollLeft=d.left-dx;}},onPointerUp:finish,onPointerCancel:finish,onLostPointerCapture:()=>{drag.current.id=-1;if(ref.current)delete ref.current.dataset.dragging;},onClickCapture:(e:MouseEvent<HTMLDivElement>)=>{if(suppress.current){e.preventDefault();e.stopPropagation();suppress.current=false;}},onDragStart:(e:React.DragEvent<HTMLDivElement>)=>e.preventDefault(),onWheel:(e:WheelEvent<HTMLDivElement>)=>{if(e.shiftKey&&Math.abs(e.deltaY)>Math.abs(e.deltaX)&&ref.current){ref.current.scrollLeft+=e.deltaY;}}};
}
export function PhotoGallery({photos,index,onIndex,onEnlarge,label}:{photos:Photo[];index:number;onIndex:(n:number)=>void;onEnlarge?:(n:number)=>void;label:string}){
 const drag=useDragScroll(),current=useRef(index),callback=useRef(onIndex),timer=useRef<ReturnType<typeof setTimeout>|null>(null),initial=useRef(true);
 current.current=index;callback.current=onIndex;
 useLayoutEffect(()=>{const el=drag.ref.current;if(!el)return;const target=index*el.clientWidth;if(Math.abs(el.scrollLeft-target)>2)el.scrollTo({left:target,behavior:initial.current||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});initial.current=false;},[index,drag.ref]);
 useEffect(()=>{const el=drag.ref.current;if(!el)return;let width=el.clientWidth;el.scrollLeft=current.current*width;const resize=new ResizeObserver(()=>{const next=el.clientWidth;if(next!==width&&next>0){width=next;el.scrollTo({left:current.current*width,behavior:'instant'});}});resize.observe(el);return()=>{resize.disconnect();if(timer.current)clearTimeout(timer.current);};},[drag.ref]);
 return <div {...drag} className="carousel" data-gallery="true" aria-label={label} role="region" aria-roledescription="carousel" onScroll={()=>{if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{const el=drag.ref.current;if(el&&el.clientWidth>0)callback.current(Math.max(0,Math.min(photos.length-1,Math.round(el.scrollLeft/el.clientWidth))));},120);}}>{photos.map((p,i)=>onEnlarge?<button type="button" className="slide" key={p.url} onClick={()=>onEnlarge(i)} aria-label={'Enlarge '+label+' '+(i+1)}><img src={p.url} width={1080} height={1080} draggable={false} alt={label+' '+(i+1)} loading={Math.abs(i-index)<=1?'eager':'lazy'}/></button>:<div className="slide" key={p.url} role="group" aria-label={(i+1)+' of '+photos.length}><img src={p.url} width={1080} height={1080} draggable={false} alt={label+' '+(i+1)} loading={Math.abs(i-index)<=1?'eager':'lazy'}/></div>)}</div>;
}
