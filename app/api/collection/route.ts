import { env } from 'cloudflare:workers';
import seed from '../../../data/recipes.json';
function user(req: Request) { return req.headers.get('oai-authenticated-user-id'); }
export async function GET(req: Request) {
 const owner=user(req); if(!owner) return Response.json({error:'Please sign in to load your collection.'},{status:401});
 const db=env.DB!;
 await db.batch(seed.map(r=>db.prepare('INSERT OR IGNORE INTO recipes (id,data) VALUES (?,?)').bind(r.id,JSON.stringify(r))));
 const [rows,photos,favs]=await Promise.all([db.prepare('SELECT data FROM recipes').all<{data:string}>(),db.prepare('SELECT id,recipe_id FROM samples WHERE owner=? ORDER BY created_at').bind(owner).all<{id:string,recipe_id:string}>(),db.prepare('SELECT recipe_id FROM favorites WHERE owner=?').bind(owner).all<{recipe_id:string}>()]);
 return Response.json({recipes:seed.map(reference=>{const stored=rows.results.find(row=>JSON.parse(row.data).id===reference.id);return stored?JSON.parse(stored.data):reference;}),samples:photos.results,favorites:favs.results.map(f=>f.recipe_id)},{headers:{'Cache-Control':'private, no-store'}});
}
export async function POST(req: Request) {
 const owner=user(req);if(!owner)return Response.json({error:'Sign in required'},{status:401});
 if(req.headers.get('origin')!==new URL(req.url).origin)return new Response('Forbidden',{status:403});
 const data=await req.json() as {recipeId:string;favorite:boolean};
 if(typeof data.favorite!=='boolean'||!seed.some(r=>r.id===data.recipeId))return new Response('Invalid recipe',{status:400});
 const id=owner+':'+data.recipeId;
 if(data.favorite)await env.DB!.prepare('INSERT OR IGNORE INTO favorites (id,owner,recipe_id) VALUES (?,?,?)').bind(id,owner,data.recipeId).run();
 else await env.DB!.prepare('DELETE FROM favorites WHERE id=? AND owner=?').bind(id,owner).run();
 return Response.json({ok:true});
}
