import {env} from 'cloudflare:workers';
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
 const owner=req.headers.get('oai-authenticated-user-id');if(!owner)return new Response('Sign in required',{status:401});
 const {id}=await params;const row=await env.DB!.prepare('SELECT id FROM samples WHERE id=? AND owner=?').bind(id,owner).first();
 if(!row)return new Response('Not found',{status:404});
 const image=await env.BUCKET!.get(id);if(!image)return new Response('Not found',{status:404});
 return new Response(image.body,{headers:{'Content-Type':image.httpMetadata?.contentType||'image/jpeg','Cache-Control':'private, max-age=86400','X-Content-Type-Options':'nosniff'}});
}
export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){
 const owner=req.headers.get('oai-authenticated-user-id');if(!owner)return new Response('Sign in required',{status:401});
 if(req.headers.get('origin')!==new URL(req.url).origin)return new Response('Forbidden',{status:403});
 const {id}=await params;const row=await env.DB!.prepare('SELECT id FROM samples WHERE id=? AND owner=?').bind(id,owner).first();if(!row)return new Response('Not found',{status:404});
 await env.DB!.prepare('DELETE FROM samples WHERE id=? AND owner=?').bind(id,owner).run();await env.BUCKET!.delete(id);return Response.json({ok:true});
}
