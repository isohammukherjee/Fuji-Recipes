import {env} from 'cloudflare:workers';
import seed from '../../../data/recipes.json';
export async function POST(req:Request){
 const owner=req.headers.get('oai-authenticated-user-id');if(!owner)return new Response('Sign in required',{status:401});
 if(req.headers.get('origin')!==new URL(req.url).origin)return new Response('Forbidden',{status:403});
 if(Number(req.headers.get('content-length')||0)>6*1024*1024)return new Response('Image too large',{status:413});
 const form=await req.formData();const file=form.get('image');const recipeId=String(form.get('recipeId'));
 if(!(file instanceof File)||!seed.some(r=>r.id===recipeId)||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)return new Response('Choose a JPEG, PNG or WebP under 5 MB.',{status:400});
 const bytes=new Uint8Array(await file.arrayBuffer());
 const valid=(file.type==='image/jpeg'&&bytes[0]===255&&bytes[1]===216)||(file.type==='image/png'&&bytes[0]===137&&bytes[1]===80)||(file.type==='image/webp'&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP');
 if(!valid)return new Response('Invalid image file',{status:400});
 const id=crypto.randomUUID();await env.BUCKET!.put(id,bytes,{httpMetadata:{contentType:file.type}});
 try{await env.DB!.prepare('INSERT INTO samples (id,recipe_id,owner,created_at) VALUES (?,?,?,?)').bind(id,recipeId,owner,Date.now()).run();}catch(e){await env.BUCKET!.delete(id);throw e;}
 return Response.json({id,recipe_id:recipeId},{status:201});
}
