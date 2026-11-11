"""Rebuild the isolated first-10 review, without modifying the source campaign."""
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
import json,csv,hashlib,copy,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(__file__).resolve().parent
rows=json.loads((ROOT/'NEW_CAMPAIGN_500_MAPPING_v2.json').read_text())
reports={r['candidate']:r for r in csv.DictReader((ROOT/'TURP_TOOL_FIX_REPORT.csv').open(encoding='utf-8-sig'))}
selection=['P001','P002','P020','P004','P007','P449','P013','P006','P085','S170']
reasons={8:'Thay P111 bằng P006: 9 vòng, 0 thanh, 0 bom; proof nguồn 7 thao tác. Bỏ cụm hai bom/thanh lệch của bản trước. Cần GD review bố cục và pin.',3:'Thỏ: hai tai dài, mặt tròn và râu. 4 vòng đúng target; ít thanh hơn phương án cối xay gió SCG (25 thanh).',6:'KHÔNG ĐẠT REVIEW: tâm vòng đối xứng nhưng khe vòng, pin, bom và thanh chưa cân đối. Giữ ảnh cũ để đối chiếu, chưa chốt lựa chọn thay thế.',10:'Cây thông và quà: đỉnh cây, tán xếp tầng, quà ở gốc. 6 vòng đúng nhịp hạ R sau level 9; nhiều thanh nên chưa xác nhận là nhịp nghỉ về thao tác.'}
(OUT/'levels').mkdir(exist_ok=True);(OUT/'previews').mkdir(exist_ok=True)
result=[]
for pos,key in enumerate(selection,1):
 srcrow=next(r for r in rows if r['Candidate Key']==key)
 src=next((ROOT/'NEW_CAMPAIGN_500_SELECTED_LEVELS_TURP').glob(f'*_{key}_turp.rrpack.json'))
 pack=json.loads(src.read_text());runtime_before=copy.deepcopy(pack['runtime']);design_before=copy.deepcopy(pack['design'])
 changed=0
 for ring in pack['design']['rings']:
  if ring.get('collect'):changed+=1;ring['collect']=False
 for part in pack['runtime']['parts']:
  if part.get('canCollect'):part['canCollect']=False
 # Campaign order belongs in the manifest. Keep source IDs and proof provenance.
 pack['first10Review']={'campaignPosition':pos,'candidate':key,'sourceCampaignPosition':srcrow['New Campaign Position'],'sourceFile':str(src.relative_to(ROOT)),'sourceSHA256':hashlib.sha256(src.read_bytes()).hexdigest(),'changes':['collect=false for positions 1–10'] if changed else [],'geometryChanged':False,'newSolverRun':False,'sourceProofStatus':reports[key]['proof_status']}
 filename=f'{pos:03d}_{key}_turp.rrpack.json'
 (OUT/'levels'/filename).write_text(json.dumps(pack,ensure_ascii=False,indent=2)+'\n')
 # Remove shadow filters only in the review copy: the original userSpace filter
 # clips some initial ring bodies in Chromium. All paths/coordinates are retained.
 svg=ET.fromstring((ROOT/'NEW_CAMPAIGN_500_PREVIEW/previews'/f'{key}.svg').read_text())
 for el in svg.iter():el.attrib.pop('filter',None)
 ET.register_namespace('','http://www.w3.org/2000/svg')
 (OUT/'previews'/f'{key}.svg').write_text(ET.tostring(svg,encoding='unicode'))
 rings=pack['design']['rings'];target=int(rows[pos-1]['Target R'])
 assert len(rings)==target
 assert sum(p['kind']=='ring' for p in pack['runtime']['parts'])==target
 r={'position':pos,'type':'Special' if pos in [3,10] else 'Symmetrical' if pos==6 else 'Normal','candidate':key,'source_position':srcrow['New Campaign Position'],'target_rings':target,'rings':len(rings),'delta':len(rings)-target,'sticks':len(pack['design'].get('sticks',[])),'effort_proxy':srcrow['Candidate E (proxy)'],'target_effort_proxy':rows[pos-1]['Target E'],'source_proof':reports[key]['proof_status'],'picture':srcrow['Picture Theme'] or ('Lưới 3×3 đối xứng tâm vòng' if pos==6 else 'Bố cục trừu tượng'),'reason':reasons.get(pos,'Giữ nguyên lựa chọn hiện tại: đã đúng số vòng của curve, có bằng chứng giải trong gói nguồn.'),'preview':f'previews/{key}.svg','pack':f'levels/{filename}','fish_removed':changed,'source_sha256':pack['first10Review']['sourceSHA256']}
 if pos==6:
  assert all(any(abs(a['x']+b['x'])<1e-6 and abs(a['y']-b['y'])<1e-6 and abs(a.get('radius',1.75)-b.get('radius',1.75))<1e-6 for b in rings) for a in rings)
 result.append(r)
now=datetime.now(ZoneInfo('Asia/Ho_Chi_Minh')).isoformat(timespec='seconds')
data={'updated_at':now,'status':'ĐANG SỬA — chưa xác nhận curve gốc 500; #6 không đạt đối xứng; #3/#9/#10 cần thiết kế lại','rows':result,'source_slots_reserved':[28,50,170,295],'scope':'Phương án riêng cho 10 vị trí đầu. Mapping 500 nguồn chưa đổi; nếu áp dụng toàn campaign phải tái xếp các vị trí nguồn 28, 50, 170 để tránh trùng level.','validation':{'ring_targets':True,'unique_candidates':len(set(selection))==10,'symmetry_ring_centers':'9/9 phản chiếu qua x=0','new_solver_run':False,'native_unity_test':False}}
(OUT/'review.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
with (OUT/'mapping.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(result[0]));w.writeheader();w.writerows(result)
md=f'''# Review trực tiếp: 10 level đầu\n\nCập nhật: **{now}** (giờ Việt Nam).\n\n**ĐANG SỬA — chưa đạt yêu cầu difficulty.** Số vòng khớp mapping v2 không chứng minh khớp curve 500 gốc. #6 không đạt review đối xứng; #3/#9/#10 cần làm lại; #8 đã thay P111 bằng P006 (không bom/thanh). Đây là bản review riêng; chưa ghi đè campaign 500.\n\nCurve giữ nguyên: **2 → 3 → 4 → 7 → 7 → 9 → 7 → 9 → 12 → 6**.\n\n| Vị trí | Loại | Candidate | Target / thực tế | Thanh | E proxy nguồn | Chuyển từ |\n|---|---|---|---|---|---|---|\n'''
for r in result:md+=f"| {r['position']} | {r['type']} | {r['candidate']} | {r['target_rings']} / {r['rings']} | {r['sticks']} | {r['effort_proxy']} | {r['source_position']} |\n"
md+='''\n## Những điểm cần duyệt\n\n- **#3 — Thỏ, 4 vòng:** tai dài, mặt tròn, râu; 11 thanh, E proxy 18 so với E_record target 3. Cần chơi thử độ khó ở vị trí sớm.\n- **#6 — Không đạt:** P449 chỉ đối xứng tâm vòng; pin, khe, bom và thanh chưa tạo đối xứng tổng thể. Không coi là Symmetrical đã duyệt. P005 là phương án để so sánh cảm giác bố cục (7 vòng, không thanh/bom), nhưng lệch target mapping 9 vòng nên chưa áp dụng.\n- **#10 — Cây thông và quà, 6 vòng:** 18 thanh, E proxy 25 so với E_record target 5. Đúng nhịp giảm số vòng nhưng chưa xác nhận giảm số thao tác.\n- Độ khó người chơi chưa có dữ liệu đo; E chỉ là proxy và có nguồn đo khác nhau. Không khẳng định đã khớp toàn bộ difficulty.\n- 10 pack có proof nguồn FOUND hoặc proof tái sử dụng; chưa chạy solver mới hoặc Unity. Giữ ID nguồn, không đổi hình học. Bỏ cờ cá trong bản sao cho đúng luật vị trí 1–10.\n- Nếu áp dụng vào campaign 500, cần tái xếp vị trí **28 (P449), 50 (P020), 170 (S170), 295 (P006)** để không trùng. Bản này chỉ đủ 10 level đầu, không tự tạo thêm level hay lấp các vị trí nguồn.\n\n## Xem từng level\n'''
for r in result:
 md+=f"\n### {r['position']:02d} · {r['candidate']} · {r['type']} · {r['rings']} vòng\n\n{r['reason']}\n\n![Level {r['position']}](previews/{r['candidate']}.svg)\n\n[Pack TURP]({r['pack']})\n"
md+='''\n## Nhật ký\n\n1. Đọc target từ mapping frozen, giữ nguyên 7 lựa chọn đã khớp R.\n2. Lấp #3 bằng P020, #6 bằng P449, #10 bằng S170.\n3. Xuất 10 pack riêng, kiểm tra số vòng runtime/design, ID, cờ cá và đối xứng tâm vòng.\n4. Sửa cách hiển thị bản sao SVG bằng cách bỏ shadow filter gây cắt hình trong Chromium; không đổi path hay hình học level.\n\nTrang HTML `index.html` tự đọc lại `review.json` mỗi 2 giây khi được phục vụ bằng HTTP. Chạy `python3 build_review.py` để cập nhật mapping, pack, ảnh và file review này.\n'''
(OUT/'REVIEW.md').write_text(md)
# Preserve the distinction between the old observation mapping and an available original curve.
audit=[]
for old in rows[:20]:
 pos=old['New Campaign Position']; selected=result[pos-1] if pos<=10 else None
 key=selected['candidate'] if selected else old['Candidate Key']
 row={'position':pos,'type':old['Slot Type'],'mapping_target_r':old['Target R'],'target_source':old['Target R Source'],'mapping_target_e':old['Target E'],'candidate':key or 'MISSING','rings':None,'sticks':None,'pins':None,'bombs':None,'source_proof_actions':None,'issues':[]}
 if key:
  source=next((ROOT/'NEW_CAMPAIGN_500_SELECTED_LEVELS_TURP').glob(f'*_{key}_turp*'))
  pack=json.loads(source.read_text());parts=pack['runtime']['parts'];proof=pack.get('proof') or {}
  row.update(rings=len(pack['design']['rings']),sticks=len(pack['design'].get('sticks',[])),pins=sum(len(p.get('pins') or []) for p in parts),bombs=sum(bool(p.get('hasBomb')) for p in parts),source_proof_actions=proof.get('drags',len(proof['moves']) if 'moves' in proof else None))
  if row['rings']!=row['mapping_target_r']:row['issues'].append('Lệch R mapping')
 else:row['issues'].append('Chưa có level')
 if pos in [3,9,10]:row['issues'].append('GD: quá nhiều vật thể/vòng; cần làm lại sau khi xác định curve')
 if pos==6:row['issues'].append('GD: chưa đối xứng tổng thể; không đạt')
 if pos==8:row['issues'].append('Đã đổi P111 → P006; cần review cân đối')
 row['issues'].append('Chưa đối chiếu file curve 500 gốc')
 audit.append(row)
data['audit20']=audit
data['mapping500']=[{'position':r['New Campaign Position'],'target':r['Target R'],'actual':r['Ring Count'] if isinstance(r['Ring Count'],(int,float)) else None,'source':r['Target R Source']} for r in rows]
data['curve_authority']='Chưa xác định: TARGET_CURVE_500_FROZEN.json không có trong checkout. 1–100 trong mapping là Original observation row (frozen), không đủ để suy ra đây là intended difficulty budget.'
data['revision_notes']=['#6 P449 không đạt cảm giác đối xứng tổng thể; chưa chốt thay thế.','#8 thay P111 bằng P006: giữ 9 vòng, bỏ hai bom và hai thanh.','#3/#9/#10 chưa giảm vòng khi chưa xác định đúng curve; số thanh và thao tác cũng phải xét.','Đính chính: target E_record của #10 là 5, không phải 9 như ghi nhầm ở bản review trước.']
(OUT/'review.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
auditmd='# Đối chiếu 20 level đầu với mapping 500\n\n'+data['curve_authority']+'\n\n'
auditmd+='| # | Loại | Candidate | Target R trong mapping | R thực | Thanh | Pin | Bom | Thao tác proof nguồn | E_record target |\n|---|---|---|---|---|---|---|---|---|---|\n'
for r in audit:
 auditmd+='| '+' | '.join(str(r[k]) if r[k] is not None else '—' for k in ['position','type','candidate','mapping_target_r','rings','sticks','pins','bombs','source_proof_actions','mapping_target_e'])+' |\n'
auditmd+='\nSố thao tác proof là số lệnh trong gói nguồn, không phải độ khó đo trên người chơi; các proof có nguồn/phiên bản khác nhau. Vị trí 11–20 chỉ kiểm toán mapping hiện có, chưa xếp lại.\n\n'+'\n'.join('- '+s for s in data['revision_notes'])+'\n'
(OUT/'AUDIT_20.md').write_text(auditmd)
(OUT/'REVIEW.md').write_text((OUT/'REVIEW.md').read_text()+'\n\n[Đối chiếu 20 vị trí và nguồn curve](AUDIT_20.md)\n\n'+data['curve_authority']+'\n')
print('Built',len(result),'levels at',now)

# Package the review as a self-contained page. Workspace file viewers may not
# resolve sibling SVG files, and some viewers do not execute JavaScript.
import base64,re
from playwright.sync_api import sync_playwright
with sync_playwright() as playwright:
 browser=playwright.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':420,'height':440},device_scale_factor=1)
 for row in result:
  svg=(OUT/row['preview']).read_text()
  page.set_content('<html><style>body{margin:0;background:#fbf1e0}svg{width:420px;height:440px;display:block}</style>'+svg+'</html>')
  png=page.screenshot()
  (OUT/'previews'/f"{row['candidate']}.png").write_bytes(png)
  row['preview_data']='data:image/png;base64,'+base64.b64encode(png).decode('ascii')
 (OUT/'review.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 htmlpath=OUT/'index.html'
 if htmlpath.exists():
  html=htmlpath.read_text().replace('src="${r.preview}"','src="${r.preview_data || r.preview}"')
  payload=json.dumps(data,ensure_ascii=False).replace('</','<\\/')
  html=re.sub(r'(<script id="initial" type="application/json">).*?(</script>)',lambda m:m[1]+payload+m[2],html,flags=re.S)
  # Remove only generated static cards; render the fresh data into them below.
  htmlpath.write_text(html)
  page.unroute('**/*')
  page.route('**/review.json?*',lambda route:route.abort())
  page.set_viewport_size({'width':1600,'height':1100})
  page.set_content(html,wait_until='networkidle')
  assert page.locator('.card img').evaluate_all('(imgs)=>imgs.length===10 && imgs.every(i=>i.complete&&i.naturalWidth>0)')
  htmlpath.write_text(page.content())
  page.screenshot(path=str(OUT/'overview.png'),full_page=True)
 browser.close()
md=(OUT/'REVIEW.md').read_text()
for row in result:
 md=md.replace(f"(previews/{row['candidate']}.svg)",f"(/workspace/Campaign/REVIEW_FIRST_10/previews/{row['candidate']}.png)")
(OUT/'REVIEW.md').write_text(md)
print('Self-contained HTML: 10 embedded PNGs, static cards, and live refresh retained.')
