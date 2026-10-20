"""Import user-approved Dote screenshots without retouching. Usage: script SOURCE_DIR."""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import json,hashlib,io,sys
root=Path(__file__).resolve().parent.parent
source=Path(sys.argv[1]);recipes=json.loads((root/'data/recipes.json').read_text());audit=json.loads((root/'data/image-audit.json').read_text())
r=next(r for r in recipes if r['id']=='dote-classic-chrome')
for p in r['images']:(root/'public'/p['url'].lstrip('/')).unlink(missing_ok=True)
audit['images']=[a for a in audit['images'] if a['recipe_id']!=r['id']]
r['images']=[]
# Full original width: retain text and scene context; only shift vertical framing.
tops=[360,350,410,400,480,600,430]
scenes=['Framed art, wood slats and cream wall','Desk objects, plant and hard window light','Hand, keyboard, phone and felt desk mat','Pale phone, mouse, felt and warm wood','Warm skin and transmitter against a sunlit room','City buildings and pale sky through a window','Orange drive, gray surface, plant and deep shadow']
board=Image.new('RGB',(4*240,2*270),'#121719');draw=ImageDraw.Draw(board)
for i,(top,scene) in enumerate(zip(tops,scenes),1):
 name=f'{i:02d}-100046609{i-1}.jpg';file=source/name;im=ImageOps.exif_transpose(Image.open(file)).convert('RGB');assert im.size==(691,1536)
 box=[0,top,691,top+691];crop=im.crop(box);buf=io.BytesIO();crop.save(buf,'WEBP',lossless=True,method=6);raw=buf.getvalue();sha=hashlib.sha256(raw).hexdigest();url=f'/samples/dote-classic-chrome-{sha[:12]}.webp';(root/'public'/url.lstrip('/')).write_bytes(raw)
 r['images'].append(dict(url=url,source=name,crop=box,kind='reference',width=691,height=691,sha256=sha))
 audit['images'].append(dict(recipe_id=r['id'],recipe_name=r['name'],source=name,source_sha256=hashlib.sha256(file.read_bytes()).hexdigest(),crop=box,output=url,dimensions=[691,691],sha256=sha,association='User supplied and approved Vincent Dote Classic Chrome sample; creator title and credit retained.',scene=scene,processing='Lossless WebP crop only; full source width, no color change, no upscaling.'))
 thumb=crop.resize((240,240));x=(i-1)%4*240;y=(i-1)//4*270;board.paste(thumb,(x,y));draw.text((x+6,y+246),f'{i:02d}  '+scene[:28],fill='white')
r['description']='Warm everyday scenes: cream light, earthy shadows and tactile detail.'
r['note']='Seven user-approved Vincent Dote Classic Chrome screenshots. Wide square crops retain creator text, scene context and original colors. Warm wood, cream highlights, skin, gray gear, orange accents and a city view document this batch; lighting and screenshot processing also affect the appearance. Missing grain size, FX Blue and Clarity remain unspecified.'
r['sourceScreenshots']=list(dict.fromkeys(r.get('sourceScreenshots',[])+[p['source'] for p in r['images']]))
(root/'data/recipes.json').write_text(json.dumps(recipes,ensure_ascii=False,indent=2)+'\n');(root/'data/image-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
(root/'public/dote-reference-crops.webp').parent.mkdir(exist_ok=True);board.save(root/'public/dote-reference-crops.webp',quality=92)
sql="-- Replace only Dote's built-in references; preserve favorites and user photos.\nUPDATE recipes SET data='"+json.dumps(r,ensure_ascii=False,separators=(',',':')).replace("'","''")+"' WHERE id='dote-classic-chrome';\n"
(root/'drizzle/0003_dote_scene_references.sql').write_text(sql)
print('Imported seven lossless 691px squares; 51 reference images total.')
