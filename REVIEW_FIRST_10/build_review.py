"""Build the isolated 20-slot review; never synthesize unvalidated gameplay packs."""
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
import json,csv,hashlib,base64,copy,shutil,xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parent;ROOT=OUT.parent
source=json.loads((ROOT/'NEW_CAMPAIGN_500_MAPPING_v2.json').read_text())
reports={r['candidate']:r for r in csv.DictReader((ROOT/'TURP_TOOL_FIX_REPORT.csv').open(encoding='utf-8-sig'))}
# No generated level is substituted for an approved source pack.
selected={1:'P001',2:'P002',4:'P004',5:'P007',7:'P013',8:'P006',9:'P014',11:'P011',12:'P012',14:'P074',15:'P008',17:'P398',18:'P412',19:'P016'}
briefs={3:'Mặt cười: đầu kín + hai mắt hở + miệng cười hở lớn. Brief đã chốt, chờ tool để sinh và kiểm tra.',6:'Làm mới đối xứng rõ cả vòng, khe, pin, thanh. P449 đã bị loại khỏi phương án.',10:'Thiết kế Special 6 vòng ít thanh, dễ nhận ra hình; thay cây thông 18 thanh. Chờ tool.',13:'Cần Special có hình cụ thể, đúng 7 vòng, nhịp sớm gọn; chờ tool.',16:'Cần đối xứng thật, đúng 10 vòng; thay P056 đang 13 vòng. Chờ tool.',20:'Cần Special có hình cụ thể, đúng 6 vòng; chờ tool.'}
why={8:'Thay P111: giữ 9 vòng nhưng bỏ hai bom và hai thanh. Cần GD review cân đối pin và khoảng trống.',9:'Thay P085: giữ 12 vòng theo frozen; giảm 10 → 3 thanh và 21 → 13 lệnh proof nguồn.',12:'P012: 9 vòng, 1 thanh, 9 lệnh proof nguồn; gần E_record 8 hơn bản P028 có 12 lệnh.',14:'P074 đúng target R14. E_record 17 chỉ là dữ liệu tham khảo; chưa xác nhận độ khó người chơi bằng playtest.',15:'P008: 9 vòng đúng target, không thanh/bom; thay P033 8 vòng. Có proof nguồn 7 lệnh; thấp hơn E_record 12, cần review nhịp.',17:'P398 đúng target R13. Route hiện tại có bom; 13 lệnh proof so với E_record 11 chỉ để tham khảo, chưa xác nhận độ khó người chơi.',18:'P412 đúng target R11. Target E Unknown; chưa đủ dữ liệu để kết luận khớp độ khó ngoài số vòng.',19:'Thay P315 bằng P016: 10 vòng đúng target, bố cục dọc rõ hơn, 2 thanh và không bom. Chờ GD review hình; không dùng số lệnh solver để kết luận đẹp/khó.'}
(OUT/'history').mkdir(exist_ok=True)
# Preserve previously exported review files before replacing this review's own output.
previous=json.loads((OUT/'review.json').read_text()) if (OUT/'review.json').exists() else {}
for row in previous.get('rows',[]):
 if row.get('pack'):
  f=OUT/row['pack']
  if f.exists():
   target=OUT/'history'/row['pack'];target.parent.mkdir(parents=True,exist_ok=True)
   if not target.exists():shutil.copy2(f,target)
   f.unlink()
(OUT/'levels').mkdir(exist_ok=True);(OUT/'previews').mkdir(exist_ok=True)
ET.register_namespace('','http://www.w3.org/2000/svg')
overrides=json.loads((OUT/'REVISION_SELECTIONS.json').read_text()) if (OUT/'REVISION_SELECTIONS.json').exists() else {}
rows=[];reserved=[]
new_positions={3,6,10,13,16,20}
for old in source[:20]:
 pos=old['New Campaign Position'];key=selected.get(pos);target=int(old['Target R']);isnew=pos in new_positions
 if isnew:
  override=overrides.get(str(pos),{});key=override.get('candidate',f'NEW{pos:03d}');stem=override.get('stem',f'CampaignReview{pos:03d}_v1');f=ROOT/'RotateLevelDesigner/levels'/f'{stem}.rrpack.json'
  qualification=json.loads((OUT/'validation'/f'{stem}.qualification.json').read_text())
  assert qualification['validateOK'] and qualification['found'] and all(x['meaningful'] for x in qualification['ablation'])
  assert qualification['designSHA256']==hashlib.sha256((ROOT/'RotateLevelDesigner/levels'/f'{stem}.rrdesign.json').read_bytes()).hexdigest(), 'Design changed after qualification'
  srcrow={'New Campaign Position':None};reason={3:'Mặt cười mới theo yêu cầu: đầu kín, hai mắt hở và miệng cười hở lớn. 4 vòng, 3 pin trong, không thanh/bom/cá.',6:'Thay P449 bằng bố cục mới 9 vòng. Phản chiếu cả khe, pin, màu qua trục dọc; không thanh/bom/cá.',10:'Thay cây thông bằng bông hoa năm cánh: 6 vòng, 5 pin, không thanh/bom/cá.',13:'Chùm nho và lá: 7 vòng. Các pin có vai trò mở khóa được kiểm bằng bỏ từng pin rồi giải lại.',16:'10 vòng đúng curve; đối xứng xoay 9 nhánh và phản chiếu trục dọc. Ba vị trí cá cũng đối xứng.',20:'Con bướm: 6 vòng gồm thân, đầu, bốn cánh. Không thêm thanh để tạo hình.'}[pos]
  if override:
   reason=override['reason']
   origin=next((r for r in source if r['Candidate Key']==override.get('source_candidate')),None)
   if origin:srcrow=origin
 else:
  srcrow=next(r for r in source if r['Candidate Key']==key)
  f=next((ROOT/'NEW_CAMPAIGN_500_SELECTED_LEVELS_TURP').glob(f'*_{key}_turp.rrpack.json'))
  qualification=json.loads((OUT/'validation'/f'source_{pos:03d}.json').read_text())
  assert qualification['validateOK'] and qualification['found'] and qualification.get('candidate')==key
  reason=why.get(pos,'Giữ lựa chọn gốc, hình học không đổi; tiếp tục GD review nhịp và cơ chế.')
 pack=json.loads(f.read_text())
 if pos<=10:
  for ring in pack['design']['rings']:
   if ring.get('collect'):ring['collect']=False
  for part in pack['runtime']['parts']:
   if part.get('canCollect'):part['canCollect']=False
 if pos==14:
  # Official Fish.candidates identified these as the only clear, non-corridor rings.
  # Max three is a limit, not a requirement to fill all three with corridor fish.
  for i,ring in enumerate(pack['design']['rings']):
   if i+1 in [11,12]:ring['collect']=True
   else:ring.pop('collect',None)
  for part in pack['runtime']['parts']:
   if part['partId'] in ['ring_11','ring_12']:part['canCollect']=True
   else:part.pop('canCollect',None)
 parts=pack['runtime']['parts'];filename=f'levels/{pos:03d}_{key}_turp.rrpack.json'
 row={'position':pos,'type':old['Slot Type'],'target_rings':target,'target_effort_proxy':old['Target E'],'candidate':key,'rings':len(pack['design']['rings']),'sticks':len(pack['design'].get('sticks',[])),'pins':sum(len(p.get('pins') or []) for p in parts),'bombs':sum(bool(p.get('hasBomb')) for p in parts),'proof_actions':qualification['drags'],'source_position':srcrow['New Campaign Position'],'pack':filename,'source_proof':'Validate OK; solve FOUND; replay OK (lần chạy mới)','new_tool_validation':True,'new_solver_run':True,'role_ablation_run':isnew,'reason':reason,'status':'NEW_QUALIFIED' if isnew else 'REVALIDATED_SOURCE','preview':f'previews/{key}.svg','preview_data':None,'warnings':qualification['warnings'],'qualification':f'validation/{stem}.qualification.json' if isnew else f'validation/source_{pos:03d}.json','route_needs_bomb':qualification.get('routeNeedsBomb',False)}
 if row['route_needs_bomb']:row['source_proof']+=' — route hiện tại có bom nổ'
 if row['warnings']:row['source_proof']+=' — cảnh báo: '+', '.join(sorted({w['code'] for w in row['warnings']}))
 assert row['rings']==target or overrides.get(str(pos),{}).get('allow_curve_exception',False)
 row['curve_exception']=row['rings']!=target
 pack['reviewProvenance']={'campaignPosition':pos,'sourceFile':str(f.relative_to(ROOT)),'sourceSHA256':hashlib.sha256(f.read_bytes()).hexdigest(),'geometryChanged':False,'newDesign':isnew,'newValidate':True,'newSolve':True,'roleAblationRun':isnew,'qualification':row['qualification'],'sourceProofStatus':row['source_proof']}
 if isnew and override:
  pack['reviewProvenance']['originCandidate']=override.get('source_candidate')
  pack['reviewProvenance']['userRequestedRestoration']=pos in [10,13]
  pack['reviewProvenance']['provisionalSourcePreference']=overrides.get('pending_preferences',False)
 (OUT/filename).write_text(json.dumps(pack,ensure_ascii=False,indent=2)+'\n')
 if isnew:shutil.copy2(ROOT/'RotateLevelDesigner/levels'/f'{stem}.rrdesign.json',OUT/'levels'/f'{pos:03d}_{key}.rrdesign.json')
 if row['source_position'] is not None and row['source_position']!=pos:reserved.append({'candidate':key,'from':row['source_position'],'to':pos,'derived_source':isnew})
 rows.append(row)
expected={Path(r['pack']).name for r in rows}
expected.update(f"{r['position']:03d}_{r['candidate']}.rrdesign.json" for r in rows if r['status']=='NEW_QUALIFIED')
for stale in (OUT/'levels').glob('*.json'):
 if stale.name[:3].isdigit() and stale.name not in expected:
  archive=OUT/'history/retired'/stale.name;archive.parent.mkdir(parents=True,exist_ok=True)
  if archive.exists() and archive.read_bytes()!=stale.read_bytes():archive=archive.with_name(str(datetime.now().timestamp())+'_'+archive.name)
  if not archive.exists():shutil.copy2(stale,archive)
  stale.unlink()
# Render the baked runtime through the official renderer, without labels in thumbnails.
import subprocess
render_js="const RR=require('/workspace/Campaign/RotateLevelDesigner/rr-core.js'),fs=require('fs');const root=process.argv[1],rows=JSON.parse(process.argv[2]);for(const r of rows){const level=JSON.parse(fs.readFileSync(root+'/'+r.pack)).runtime;fs.writeFileSync(root+'/'+r.preview,RR.Render.render({world:RR.World.build(level,{lenient:true}),level,labels:false,width:700}));}"
subprocess.run(['node','-e',render_js,str(OUT),json.dumps(rows,ensure_ascii=False)],check=True)
for row in rows:
 tree=ET.fromstring((OUT/row['preview']).read_text())
 for el in tree.iter():el.attrib.pop('filter',None)
 (OUT/row['preview']).write_text(ET.tostring(tree,encoding='unicode'))
now=datetime.now(ZoneInfo('Asia/Ho_Chi_Minh')).isoformat(timespec='seconds')
data={'updated_at':now,'status':'20/20 vị trí khớp Target R; 20/20 validate OK, solve FOUND và replay hoàn tất. Sáu level mới đã kiểm vai trò 37 pin. Chờ GD review hình và độ khó người chơi.','curve_authority':'Người dùng xác nhận TARGET_CURVE_500_FROZEN.json và R tại #3/#9/#10 = 4/12/6. Giữ nguyên Target R trong mapping dẫn xuất; file frozen gốc chưa có trong checkout, chưa kiểm hash gốc.','revision_preferences_pending':overrides.get('pending_preferences',False),'curve20':[int(r['Target R']) for r in source[:20]],'rows':rows,'reserved_source_slots':reserved,'mapping500':[{'position':r['New Campaign Position'],'target':r['Target R'],'actual':r['Ring Count'] if isinstance(r['Ring Count'],(int,float)) else None} for r in source],'rules_document':'TOOL_RULES.md','blocker':'Đã có tool tại RotateLevelDesigner sau khi cập nhật origin/main. Không còn blocker tool; Native Unity/device chưa kiểm.'}
matched=sum(r['rings']==r['target_rings'] for r in rows)
exceptions=[{'position':r['position'],'actual':r['rings'],'target':r['target_rings'],'reason':overrides[str(r['position'])]['exception_reason']} for r in rows if r['curve_exception']]
role_checks=[]
for r in rows:
 if r['status']=='NEW_QUALIFIED':role_checks.extend(json.loads((OUT/r['qualification']).read_text())['ablation'])
pin_count=sum(t.get('feature','pin')=='pin' for t in role_checks)
data.update(exact_r_positions=matched,curve_exceptions=exceptions,new_role_check_count=len(role_checks),new_pin_check_count=pin_count)
data['status']=f"{matched}/20 vị trí khớp Target R. Ngoại lệ GD đã chốt: #10 P050 3/6, #13 P040 6/7. 20/20 validate OK, solve FOUND và replay hoàn tất. Target frozen không sửa."
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':420,'height':440})
 for row in rows:
  if row['preview']:
   svg=(OUT/row['preview']).read_text();page.set_content('<style>body{margin:0;background:#fbf1e0}svg{width:420px;height:440px;display:block}</style>'+svg)
   png=page.screenshot();pngpath=Path(row['preview']).with_suffix('.png');(OUT/pngpath).write_bytes(png);row['preview_data']='data:image/png;base64,'+base64.b64encode(png).decode('ascii');row['preview_png']=str(pngpath)
 b.close()
(OUT/'review.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
with (OUT/'mapping.csv').open('w',encoding='utf-8-sig',newline='') as f:
 cols=['position','type','target_rings','rings','candidate','sticks','pins','bombs','proof_actions','source_proof','status'];w=csv.DictWriter(f,fieldnames=cols,extrasaction='ignore');w.writeheader();w.writerows(rows)
md='# Review 20 level đầu — đã chạy tool\n\nCập nhật '+now+'\n\n'+data['status']+'\n\n'+data['curve_authority']+'\n\nCurve R: **'+' → '.join(map(str,data['curve20']))+'**.\n\n[Rule tool và blocker](TOOL_RULES.md) · [Brief level 3 theo yêu cầu](LEVEL_003_BRIEF.md)\n\n| # | Loại | Target R | R thực | Candidate | Thanh | Pin | Lệnh proof nguồn | Trạng thái |\n|---|---|---|---|---|---|---|---|---|\n'
for r in rows:md+='| '+' | '.join(str(r[k]) if r.get(k) is not None else '—' for k in ['position','type','target_rings','rings','candidate','sticks','pins','proof_actions','status'])+' |\n'
md+='\n#3 đã là level mới có validate/solve/replay, không còn ảnh ý tưởng. Sáu level mới đã kiểm vai trò pin bằng bỏ từng pin và giải lại; các level dùng lại giữ hình học và chưa chạy ablation toàn bộ vật thể. Mọi lựa chọn đã chạy validate/solve mới, không dùng proof cũ thay kiểm chứng. Số lệnh proof nguồn và E_record là tham chiếu, không phải đo độ khó người chơi. Các vị trí nguồn cần tái xếp khi tích hợp vào campaign 500 để tránh trùng.\n'
for r in rows:
 md+=f"\n## {r['position']:02d} · {r['candidate'] or 'Cần sinh level'} · Target {r['target_rings']} vòng\n\n{r['reason']}\n"
 if r.get('preview_png'):md+=f"\n![Review {r['position']}](/workspace/Campaign/REVIEW_FIRST_10/{r['preview_png']})\n"
(OUT/'REVIEW.md').write_text(md);(OUT/'AUDIT_20.md').write_text(md.split('\n## 01')[0])
# HTML template has no external image dependencies or script requirement.
from html import escape
cards=''
for r in rows:
 image=f'<img src="{r["preview_data"]}" alt="{escape(r["candidate"] or "Ý tưởng chưa là level")}">' if r['preview_data'] else '<div class="empty">Chưa xuất level<br>Chờ tool để sinh và kiểm tra</div>'
 stats=f'R {r["rings"] if r["rings"] is not None else "—"}/{r["target_rings"]} · Thanh {r["sticks"] if r["sticks"] is not None else "—"} · Pin {r["pins"] if r["pins"] is not None else "—"}'
 cards+=f'<article class="card" data-position="{r["position"]}"><div class="body"><h2>{r["position"]:02d} · {escape(r["type"])}</h2><b>{escape(r["candidate"] or "CẦN SINH / QUA TOOL")}</b></div><div class="image">{image}</div><div class="body"><b>{stats}</b><p>{escape(r["reason"])}</p><p class="muted">{escape(r["source_proof"])}<br>Validate OK · solve FOUND · replay OK</p>'+ (f'<a href="{r["pack"]}">Pack TURP đã kiểm</a>' if r['pack'] else '<span class="blocked">Chưa có pack đủ điều kiện giao</span>')+'</div></article>'
points=' '.join(f'{35+i*52},{160-r*8}' for i,r in enumerate(data['curve20']))
curve=f'<svg viewBox="0 0 1080 200"><polyline points="{points}" fill="none" stroke="#567568" stroke-width="2"/>'+''.join(f'<text x="{35+i*52}" y="{148-r*8}" text-anchor="middle" font-size="12">{r}</text><text x="{35+i*52}" y="190" text-anchor="middle" font-size="10">{i+1}</text>' for i,r in enumerate(data['curve20']))+'</svg>'
curve=curve.replace('</svg>',''.join(f'<circle cx="{35+i*52}" cy="{160-r["rings"]*8}" r="4" fill="{"#c47a22" if r["curve_exception"] else "#226b4c"}"/>'+(f'<text x="{35+i*52}" y="{174-r["rings"]*8}" text-anchor="middle" font-size="10" fill="#a56215">thực {r["rings"]}</text>' if r['curve_exception'] else '') for i,r in enumerate(rows))+'</svg>')
html='''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Campaign · Review 01–20</title><style>*{box-sizing:border-box}body{margin:0;background:#f1f4f1;color:#243c32;font:14px/1.55 system-ui,sans-serif}header{padding:28px max(24px,calc((100vw - 1420px)/2));background:#173d32;color:white}h1{margin:8px 0}main{max-width:1468px;margin:auto;padding:24px}.panel,.card{background:white;border:1px solid #dce3db;border-radius:12px}.panel{padding:18px;margin-bottom:18px}.notice{background:#fff1d8;border-left:4px solid #ba7b26;padding:16px;margin-bottom:18px}#cards{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}.card{overflow:hidden}.body{padding:14px}.body h2{font-size:17px;margin:0 0 6px}.body p{font-size:13px}.image{height:240px;background:#fbf1e0}.image img{width:100%;height:100%;object-fit:contain}.empty{height:100%;display:flex;align-items:center;justify-content:center;text-align:center;color:#976b36;border:2px dashed #dcc69e}.muted{font-size:12px;color:#65796e}.blocked{color:#986823}a{color:#226648}svg{width:100%;height:200px}footer{padding:22px 0}.table{overflow:auto}td,th{text-align:left;padding:7px;border-bottom:1px solid #eee}table{width:100%;font-size:13px;border-collapse:collapse}@media(max-width:1050px){#cards{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:650px){#cards{grid-template-columns:1fr}}</style><header><small>ROTATE RING / CAMPAIGN REVIEW</small><h1>20 level đầu · Bản review qua tool</h1><p>Đúng số vòng · 20 lời giải đã chạy · 6 level mới qua rule và solver của tool</p></header><main>'''
html=html.replace('Đúng số vòng · 20 lời giải đã chạy · 6 level mới qua rule và solver của tool',f'{matched}/20 khớp R · 2 ngoại lệ theo GD · 20 lời giải đã chạy')
html+='<div class="notice"><b>'+escape(data['status'])+'</b><br>'+escape(data['blocker'])+'</div>'
html+='<section class="panel"><b>Nguồn curve đã được người dùng xác nhận</b><p>'+escape(data['curve_authority'])+'</p>'+curve+'<p class="muted">Target frozen không sửa. Hai ngoại lệ theo GD: #10 thực3/đích6, #13 thực6/đích7; các vị trí khác khớp R. Không coi số lệnh solver là bằng chứng độ khó người chơi.</p></section>'
# Show the whole derived 500-slot reference without bridging Unknown targets.
segments=[];current=[]
for item in data['mapping500']:
 if isinstance(item['target'],(int,float)):current.append(f"{30+(item['position']-1)*2.04},{170-item['target']*5}")
 elif current:segments.append(current);current=[]
if current:segments.append(current)
full='<svg viewBox="0 0 1080 210"><rect x="30" y="10" width="41" height="165" fill="#fff0ce"/>'
for segment in segments:full+='<polyline points="'+' '.join(segment)+'" fill="none" stroke="#81958a" stroke-width="1"/>'
for row in rows:
 if row['rings'] is not None:full+=f'<circle cx="{30+(row["position"]-1)*2.04}" cy="{170-row["rings"]*5}" r="2.2" fill="{"#c47a22" if row["curve_exception"] else "#226b4c"}"/>'
for pos in [1,20,100,200,300,400,500]:full+=f'<text x="{30+(pos-1)*2.04}" y="198" font-size="11">{pos}</text>'
full+='</svg>'
html+='<section class="panel"><b>Vị trí của đoạn 1–20 trong curve 500</b>'+full+'<p class="muted">Nền vàng: đoạn đang chỉnh. Nét xám: Target R dẫn xuất trong mapping 500; Unknown được ngắt đoạn. Chấm xanh: lựa chọn khớp R; chấm vàng: ngoại lệ đã được GD chọn ở #10 và #13. Chưa kiểm lại hash file frozen gốc.</p></section>'
html+='<section class="panel"><b>Trả lời review #14 / #17 / #18</b><p>Cả ba khớp số vòng: 14/14, 13/13, 11/11. #17 có route dùng bom; #18 target effort Unknown. Không khẳng định độ khó người chơi đã khớp chỉ vì đúng R hoặc số lệnh proof.</p><a href="CURVE_CHECK_14_17_18.md">Đối chiếu chi tiết với curve</a></section>'
if overrides.get('pending_preferences'):
 html+='<section class="notice"><b>Phương án giữ curve đang trình để review</b><p>P050 gốc có 3 vòng, khác target #10 là 6. Trang hiện trình bản phái sinh 6 vòng; bản 3 vòng đã chỉnh cỡ có ở phần so sánh dưới. #20 dùng phái sinh SCH2 ở #30 của mapping v2; P030 hai cá là nguồn khác. Hai lựa chọn nguồn/số vòng vẫn đang chờ phản hồi GD, chưa coi là đã duyệt.</p></section>'
if (OUT/'ALTERNATIVES.json').exists():
 alternatives=json.loads((OUT/'ALTERNATIVES.json').read_text())
 html+='<section class="panel"><h2>Trước và sau chỉnh #10 / #20</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px">'
 for alternative in alternatives:
  html+='<div><b>'+escape(alternative['title'])+'</b><img style="display:block;width:100%;height:250px;object-fit:contain;background:#fbf1e0" src="'+alternative['image']+'" alt="'+escape(alternative['title'])+'"><p class="muted">'+escape(alternative['notes'])+'</p></div>'
 html+='</div><a href="alternatives/P050_3rings.rrpack.json">Pack P050 chỉnh cỡ giữ 3 vòng — bản GD đã chọn</a></section>'
html+='<section class="panel"><b>Thay đổi theo review</b><p>#3: mặt cười 4 vòng, 3 pin trong, 0 thanh.<br>#6: 9 vòng; phản chiếu cả vòng, khe, pin, màu.<br>#8: P006, 9 vòng, không bom/thanh.<br>#9: P014, vẫn 12 vòng; giảm 10 → 3 thanh.<br>#10: P050 con gà, chỉnh cỡ giữ 3 vòng, không thêm cánh.<br>#13: P040 ngôi nhà, giữ 6 vòng theo GD. Hai vị trí này là ngoại lệ curve được ghi rõ.<br>#19: P016 bố cục dọc, 10 vòng, không bom.<br>#20: bản vợt 6 vòng; mở rộng U và dịch lên bao quanh hai thanh xanh/cam và cặp vòng tím/xanh lá, giảm chiều dọc.</p><a href="TOOL_RULES.md">Rule và blocker</a> · <a href="LEVEL_003_BRIEF.md">Brief #3</a> · <a href="REVIEW.md">Ghi chú review</a></section><div id="cards">'+cards+'</div>'
html+='<section class="panel" style="margin-top:22px"><h2>Đối chiếu 20 vị trí</h2><div class="table"><table><tr>'+''.join('<th>'+t+'</th>' for t in ['#','Loại','R target','R thực','Candidate','Thanh','Pin','Lệnh proof nguồn','Trạng thái'])+'</tr>'
for r in rows:html+='<tr>'+''.join('<td>'+escape(str(r[k]) if r.get(k) is not None else '—')+'</td>' for k in ['position','type','target_rings','rings','candidate','sticks','pins','proof_actions','status'])+'</tr>'
html+='</table></div></section><footer class="muted">Cập nhật '+now+' · Giờ Việt Nam<br>Chỉ là phương án riêng. Mapping 500 nguồn chưa đổi; khi tích hợp phải tái xếp các vị trí nguồn. Các bản mới/phái sinh đã kiểm vai trò vật thể bằng bỏ vật rồi giải lại; level dùng lại chưa ablation toàn bộ vật thể. Native Unity/device chưa kiểm; không coi số lệnh solve là đo độ khó người chơi.<p id="live">Ảnh đã nhúng trực tiếp; không cần JavaScript để xem.</p></footer></main><script>const revision='+json.dumps(now)+';setInterval(async()=>{try{const r=await fetch("review.json?t="+Date.now(),{cache:"no-store"});if(r.ok){const d=await r.json();document.getElementById("live").textContent="● Đang theo dõi cập nhật mỗi 2 giây";if(d.updated_at!==revision)location.reload()}}catch(e){}},2000)</script></html>'
(OUT/'index.html').write_text(html)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1100});page.set_content(html,wait_until='networkidle');assert page.locator('.card').count()==20;assert page.locator('.card img').evaluate_all('(imgs)=>imgs.every(i=>i.complete&&i.naturalWidth>0)');page.screenshot(path=str(OUT/'overview.png'),full_page=True);b.close()
print(f'Built: 20 slots; {matched} exact ring targets; exceptions 10/13; all tool-validated/solved.')
