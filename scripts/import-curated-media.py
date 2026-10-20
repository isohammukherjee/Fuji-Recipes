"""Rebuild audited square media from the user's ZIP extraction + Scotland screenshots.
Usage: python scripts/import-curated-media.py /path/to/reference/files
No source pixels are invented, sharpened, recolored or upscaled.
"""
from pathlib import Path
from PIL import Image,ImageOps
import hashlib,io,json,sys
root=Path(__file__).resolve().parent.parent
source=Path(sys.argv[1]);audit=json.loads((root/'data/image-audit.json').read_text())
for row in audit['images']:
 matches=list(source.rglob(row['source']))
 if len(matches)!=1:raise ValueError(f"Expected one source {row['source']}, found {len(matches)}")
 im=ImageOps.exif_transpose(Image.open(matches[0])).convert('RGB').crop(row['crop']);side=min(im.size);x=(im.width-side)//2;y=(im.height-side)//2;im=im.crop((x,y,x+side,y+side));im.thumbnail((1080,1080),Image.Resampling.LANCZOS)
 buffer=io.BytesIO()
 if row.get('processing','').startswith('Lossless'):im.save(buffer,'WEBP',lossless=True,method=6)
 else:im.save(buffer,'WEBP',quality=92,method=6)
 raw=buffer.getvalue()
 if hashlib.sha256(raw).hexdigest()!=row['sha256']:raise ValueError('Output differs from audit: '+row['source'])
 (root/'public'/row['output'].lstrip('/')).write_bytes(raw)
print('Rebuilt',len(audit['images']),'verified square references')
