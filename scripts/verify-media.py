"""Verify encoded media, explicit associations and the non-destructive data migration."""
from pathlib import Path
from PIL import Image
import hashlib,json,sqlite3
root=Path(__file__).resolve().parent.parent
recipes=json.loads((root/'data/recipes.json').read_text());audit=json.loads((root/'data/image-audit.json').read_text())
photos=[(r,p) for r in recipes for p in r['images']]
assert len(recipes)==19 and len(photos)==45
assert len(audit['images'])==len(photos)
urls=set()
for recipe,p in photos:
 file=root/'public'/p['url'].lstrip('/');im=Image.open(file);im.load()
 assert im.width==im.height and 0<im.width<=1080,(recipe['id'],im.size)
 assert [im.width,im.height]==[p['width'],p['height']]
 assert hashlib.sha256(file.read_bytes()).hexdigest()==p['sha256']
 proof=[a for a in audit['images'] if a['output']==p['url']]
 assert len(proof)==1 and proof[0]['recipe_id']==recipe['id'] and proof[0]['source']==p['source']
 urls.add(file.name)
assert urls=={p.name for p in (root/'public/samples').glob('*.webp')},'Unreferenced or stale sample remains'
db=sqlite3.connect(':memory:');db.executescript((root/'drizzle/0000_magical_wild_child.sql').read_text())
db.execute('INSERT INTO recipes VALUES (?,?)',('winter-season','{"id":"winter-season","images":[{"url":"/samples/old.webp"}]}'))
db.execute('INSERT INTO favorites VALUES (?,?,?)',('alice:winter-season','alice','winter-season'))
db.execute('INSERT INTO samples VALUES (?,?,?,?)',('own-shot','winter-season','alice',1))
db.executescript((root/'drizzle/0001_curated_square_references.sql').read_text())
db.executescript((root/'drizzle/0002_confirm_reggies_portra.sql').read_text())
actual={r[0]:json.loads(r[1]) for r in db.execute('SELECT id,data FROM recipes')}
assert actual=={r['id']:r for r in recipes}
assert db.execute('SELECT COUNT(*) FROM favorites').fetchone()[0]==1
assert db.execute('SELECT COUNT(*) FROM samples').fetchone()[0]==1
print(f'PASS: {len(recipes)} recipes / {len(photos)} square images; checksums, associations, no stale assets, migration and saved data verified.')
