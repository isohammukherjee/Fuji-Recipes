import {env} from 'cloudflare:workers';
import seed from '../../../data/recipes.json';
export async function POST(req:Request){
 const owner=req.headers.get('oai-authenticated-user-id');if(!owner)return new Response('Sign in required',{status:401});
 if(req.headers.get('origin')!==new URL(req.url).origin)return new Response('Forbidden',{status:403});
 if(Number(req.headers.get('content-length')||0)>6*1024*1024)return new Response('Image too large',{status:413});
 const form=await req.formData();const file=form.get('image');const recipeId=String(form.get('recipeId'));
 if(!(file instanceof File)||!seed.some(r=>r.id===recipeId)||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)return new Response('Choose a JPEG, PNG or WebP under 5 MB.',{status:400});
 const bytes=new Uint8Array(await file.arrayBuffer());
 const dimensions=jpegDimensions(bytes);
 if(file.type!=='image/jpeg'||!dimensions||dimensions.width!==dimensions.height||dimensions.width>1080||dimensions.width<1)return new Response('Upload a square JPEG no larger than 1080 × 1080. Use the app crop tool.',{status:400});
 const id=crypto.randomUUID();await env.BUCKET!.put(id,bytes,{httpMetadata:{contentType:file.type}});
 try{await env.DB!.prepare('INSERT INTO samples (id,recipe_id,owner,created_at) VALUES (?,?,?,?)').bind(id,recipeId,owner,Date.now()).run();}catch(e){await env.BUCKET!.delete(id);throw e;}
 return Response.json({id,recipe_id:recipeId},{status:201});
}

// Canvas exports normalized JPEG. Validate encoded dimensions before accepting bytes.
function jpegDimensions(bytes:Uint8Array):{width:number;height:number}|null{
 if(bytes.length<16||bytes[0]!==255||bytes[1]!==216||bytes[bytes.length-2]!==255||bytes[bytes.length-1]!==217)return null;
 let p=2;
 while(p+3<bytes.length){
  if(bytes[p++]!==255)return null;while(bytes[p]===255)p++;const marker=bytes[p++];
  if(marker===218||marker===217)return null;
  if(marker===1||(marker>=208&&marker<=215))continue;
  if(p+2>bytes.length)return null;const size=(bytes[p]<<8)|bytes[p+1];if(size<2||p+size>bytes.length)return null;
  if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){
   if(size<8)return null;return {height:(bytes[p+3]<<8)|bytes[p+4],width:(bytes[p+5]<<8)|bytes[p+6]};
  }
  p+=size;
 }
 return null;
}
