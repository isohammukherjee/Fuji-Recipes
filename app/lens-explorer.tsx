'use client';
import {useEffect,useMemo,useState} from 'react';
import {ArrowLeft,ExternalLink,Heart,RefreshCw,Search} from 'lucide-react';
type Lens={brand:string;name:string;kind:'Prime'|'Zoom';af:boolean;url:string};
const initial:Lens[]=[
{brand:'Fujifilm',name:'XF 23mm f/2 R WR',kind:'Prime',af:true,url:'https://fujifilm-x.com/global/products/lenses/'},
{brand:'Fujifilm',name:'XF 35mm f/2 R WR',kind:'Prime',af:true,url:'https://fujifilm-x.com/global/products/lenses/'},
{brand:'Sigma',name:'18-50mm F2.8 DC DN Contemporary',kind:'Zoom',af:true,url:'https://www.sigma-global.com/en/lenses/'},
{brand:'Sigma',name:'30mm F1.4 DC DN Contemporary',kind:'Prime',af:true,url:'https://www.sigma-global.com/en/lenses/'},
{brand:'Viltrox',name:'AF 15mm F1.7',kind:'Prime',af:true,url:'https://viltrox.com/collections/camera-lens'},
{brand:'Viltrox',name:'AF 27mm F1.2 Pro',kind:'Prime',af:true,url:'https://viltrox.com/collections/camera-lens'},
{brand:'Samyang',name:'AF 75mm F1.8 X',kind:'Prime',af:true,url:'https://www.samyanglens.com/'},
{brand:'Tamron',name:'17-70mm F/2.8 Di III-A VC RXD',kind:'Zoom',af:true,url:'https://www.tamron.com/global/consumer/lenses/'},
{brand:'TTArtisan',name:'27mm F2.8 AF',kind:'Prime',af:true,url:'https://www.ttartisan.com/'},
{brand:'7Artisans',name:'35mm F1.2',kind:'Prime',af:false,url:'https://7artisans.store/'},
{brand:'Sirui',name:'Sniper 23mm F1.2 AF',kind:'Prime',af:true,url:'https://store.sirui.com/'},
{brand:'Meike',name:'33mm F1.4 AF',kind:'Prime',af:true,url:'https://meikeglobal.com/'}
];
export default function LensExplorer({onClose}:{onClose:()=>void}){
const [q,setQ]=useState(''),[brand,setBrand]=useState('All'),[type,setType]=useState('All'),[savedOnly,setSavedOnly]=useState(false),[saved,setSaved]=useState<string[]>([]),[checked,setChecked]=useState('');
useEffect(()=>{try{setSaved(JSON.parse(localStorage.getItem('fuji-lens-favorites')||'[]'));}catch{}setChecked(new Date().toLocaleString('en-IN'));},[]);
const filtered=useMemo(()=>initial.filter(l=>(brand==='All'||l.brand===brand)&&(type==='All'||l.kind===type)&&( !savedOnly||saved.includes(l.brand+l.name))&& (l.brand+' '+l.name).toLowerCase().includes(q.toLowerCase())),[q,brand,type,savedOnly,saved]);
function toggle(l:Lens){const key=l.brand+l.name;setSaved(s=>{const next=s.includes(key)?s.filter(x=>x!==key):[...s,key];try{localStorage.setItem('fuji-lens-favorites',JSON.stringify(next));}catch{}return next;});}
return <section className="lens-explorer" style={{padding:'20px',maxWidth:1100,margin:'auto',minHeight:'75vh'}}>
<header style={{display:'flex',alignItems:'center',gap:16,marginBottom:18}}><button className="pill" onClick={onClose}><ArrowLeft size={19}/> Recipes</button><h1 style={{fontSize:'clamp(24px,5vw,40px)',fontWeight:800}}>X-Mount Lens Explorer</h1></header>
<p style={{marginBottom:16}}>Explore Fujifilm X-mount lenses. Starter catalogue; not a complete inventory. Prices and availability require verified retailer integrations.</p>
<label className="search" style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}><Search size={20}/><input aria-label="Search X-mount lenses" placeholder="Brand, focal length, aperture…" value={q} onChange={e=>setQ(e.target.value)}/></label>
<div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:16}}><select aria-label="Brand" value={brand} onChange={e=>setBrand(e.target.value)}><option>All</option>{[...new Set(initial.map(l=>l.brand))].sort().map(b=><option key={b}>{b}</option>)}</select><select aria-label="Lens type" value={type} onChange={e=>setType(e.target.value)}><option>All</option><option>Prime</option><option>Zoom</option></select><button className="pill" aria-pressed={savedOnly} onClick={()=>setSavedOnly(v=>!v)}><Heart size={17}/> {savedOnly?'Saved only':'Favorites'}</button></div>
<p style={{marginBottom:14}}>{filtered.length} lenses · Catalogue loaded {checked}. <RefreshCw size={13} style={{display:'inline'}}/> Live retailer refresh not yet connected.</p>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,240px),1fr))',gap:12}}>{filtered.map(l=><article key={l.brand+l.name} style={{padding:18,border:'1px solid currentColor',borderRadius:14,display:'grid',gap:10}}><span style={{fontSize:13,opacity:.75}}>{l.brand} · {l.kind} · {l.af?'Autofocus':'Manual focus'}</span><h2 style={{fontSize:21,fontWeight:750}}>{l.name}</h2><p style={{fontSize:13}}>Indian price: not verified · Stock: not verified</p><div style={{display:'flex',gap:10,alignItems:'center'}}><a href={l.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'underline'}}>Brand catalogue <ExternalLink size={14} style={{display:'inline'}}/></a><button onClick={()=>toggle(l)} aria-label={saved.includes(l.brand+l.name)?'Remove favorite':'Add favorite'} aria-pressed={saved.includes(l.brand+l.name)}><Heart size={23} fill={saved.includes(l.brand+l.name)?'currentColor':'none'}/></button></div></article>)}</div>{!filtered.length&&<p>No matching lenses in the starter catalogue.</p>}
</section>;
}