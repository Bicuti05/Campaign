from pathlib import Path
import json,hashlib,subprocess
from playwright.sync_api import sync_playwright
root=Path('/workspace/Campaign');package=root/'IMPORTS/R7_20261111/TURP_UNITY_R7';rows=json.loads((package/'NEW_CAMPAIGN_500_MAPPING.json').read_text());manifest=json.loads((package/'CAMPAIGN_IMPORT_MANIFEST.json').read_text());valid=0
for entry in manifest['entries']:
 f=package/entry['file'];assert hashlib.sha256(f.read_bytes()).hexdigest()==entry['sha256'];valid+=1
print('Manifest SHA256 checked:',valid)
positions=[23,80,180,53,130,263,236,256,266,276,336,476,496,37]
records=[]
for pos in positions:
 row=rows[pos-1];file=package/row['pack_file'];records.append({'label':f'R7 #{pos} · R{row["rings"]} · {row["theme"] or row["role"]}','file':str(file)})
render="const RR=require('/workspace/Campaign/RotateLevelDesigner/rr-core.js'),fs=require('fs'),records=JSON.parse(process.argv[1]);let html='<body style=\"display:grid;grid-template-columns:repeat(4,280px);gap:12px;font-family:Arial\">';for(const r of records){const pack=JSON.parse(fs.readFileSync(r.file)),level=pack.runtime;const svg=RR.Render.render({world:RR.World.build(level,{lenient:true}),level,labels:false,width:700}).replace(/ filter=\"[^\"]*\"/g,'').replace('<svg ','<svg style=\"width:270px;height:260px\" ');html+='<div><h3>'+r.label+'</h3>'+svg+'</div>';}fs.writeFileSync('/tmp/r7-pool-gallery.html',html);"
subprocess.run(['node','-e',render,json.dumps(records)],check=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1200,'height':1000});page.set_content(Path('/tmp/r7-pool-gallery.html').read_text());page.screenshot(path='/tmp/r7-pool-gallery.png',full_page=True);b.close()
