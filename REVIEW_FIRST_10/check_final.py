from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
import json,subprocess,math,hashlib,sys
from PIL import Image,ImageChops,ImageOps
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent;TOOL=ROOT.parent/'RotateLevelDesigner';data=json.loads((ROOT/'review.json').read_text());rows=data['rows']
assert len(rows)==20 and len({r['candidate'] for r in rows})==20
assert [(r['position'],r['rings'],r['target_rings']) for r in rows if r['rings']!=r['target_rings']]==[(10,3,6),(13,6,7)]
assert data['exact_r_positions']==18 and not data['revision_preferences_pending']
assert [r['position'] for r in rows if r['type']=='Special']==[3,10,13,20]
assert [r['position'] for r in rows if r['type']=='Symmetrical']==[6,16]
files=[str(ROOT/r['pack']) for r in rows]
validated=subprocess.run(['node',str(TOOL/'rr-cli.js'),'validate',*files],text=True,capture_output=True)
(ROOT/'validation/final_all.validate.log').write_text(validated.stdout+validated.stderr);assert validated.returncode==0

def solve(row):
 args=['node',str(TOOL/'rr-cli.js'),'solve',str(ROOT/row['pack']),'--time','25','--nodes','5000','--json']
 if row['status']=='NEW_QUALIFIED':args.append('--no-bombs')
 result=subprocess.run(args,text=True,capture_output=True)
 (ROOT/f'validation/final_{row["position"]:03d}.solve.json').write_text(result.stdout)
 assert result.returncode==0,(row['position'],result.stdout,result.stderr)
 parsed=json.loads(result.stdout);assert parsed['found'] and parsed['route'][-1]['remaining']==0
 return row['position'],parsed['drags']
requested=set(map(int,sys.argv[sys.argv.index('--positions')+1:])) if '--positions' in sys.argv else set()
if '--browser-only' not in sys.argv:
 with ThreadPoolExecutor(max_workers=3) as pool:
  for f in as_completed([pool.submit(solve,r) for r in rows if not requested or r['position'] in requested]):print('CLI FOUND',*f.result(),flush=True)
for row in rows:
 cached=json.loads((ROOT/f'validation/final_{row["position"]:03d}.solve.json').read_text());assert cached['found'] and cached['route'][-1]['remaining']==0

symmetry=[]
for pos in [6,16]:
 row=rows[pos-1];pack=json.loads((ROOT/row['pack']).read_text());rings=pack['design']['rings'];byid={r['id']:r for r in rings};mirror={}
 for r in rings:
  matches=[s for s in rings if abs(s['x']+r['x'])<1e-5 and abs(s['y']-r['y'])<1e-5 and abs(s.get('radius',1.75)-r.get('radius',1.75))<1e-6];assert len(matches)==1
  mirror[r['id']]=matches[0]['id']
 for r in rings:
  s=byid[mirror[r['id']]];assert r.get('color')==s.get('color') and r.get('collect',False)==s.get('collect',False) and r.get('gap',90)==s.get('gap',90)
  if r.get('gap',90):assert abs(math.remainder(s.get('gapDir',0)-(180-r.get('gapDir',0)),360))<1e-4
  for pin in r.get('pins',[]):
   assert any(abs(math.remainder(other['angle']-(180-pin['angle']),360))<1e-4 and abs(other['length']-pin['length'])<1e-5 and set(other.get('targets',[]))=={mirror[t] for t in pin.get('targets',[])} for other in s.get('pins',[]))
 image=Image.open(ROOT/row['preview_png']).convert('RGB');background=Image.new('RGB',image.size,(251,241,224));delta=ImageChops.difference(image,background).convert('L').point(lambda x:255 if x>20 else 0);flipped=ImageOps.mirror(delta)
 overlap=ImageChops.multiply(delta,flipped).histogram()[255];union=ImageChops.lighter(delta,flipped).histogram()[255];iou=overlap/union
 assert iou>.94,(pos,iou)
 symmetry.append({'position':pos,'ringAndGapAndPinAndColorAndFishReflection':True,'renderMaskMirrorIoU':round(iou,5)})
print('Symmetry',symmetry,flush=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page(java_script_enabled=False,viewport={'width':1600,'height':1100});page.set_content((ROOT/'index.html').read_text(),wait_until='networkidle');assert page.locator('.card').count()==20 and page.locator('.card img').count()==20
 page=browser.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:8765/');page.wait_for_load_state('networkidle');assert page.locator('img').evaluate_all('(images)=>images.every(i=>i.complete&&i.naturalWidth>0)');assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth');page.wait_for_function("document.querySelector('#live').textContent.includes('Đang theo dõi')",timeout=5000);assert not errors
 browser.close()
summary={'positions':20,'exactR':18,'curveExceptions':data['curve_exceptions'],'CLIValidateOK':20,'CLISolveFound':20,'newDesigns':6,'newPinAblationChecks':data['new_pin_check_count'],'newRoleChecks':data['new_role_check_count'],'symmetry':symmetry,'browserEmbeddedImages':20,'mobileAndStaticAndLiveChecks':True,'nativeUnity':'not run','golden':'blocked by missing referenced Assets Level91001','warnings':'#11 source fish-corridor retained; #13 and #20 use corridor fish only because no clear candidates exist; recorded explicitly'}
(ROOT/'validation/FINAL_SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n');print('PASS final checks',flush=True)
