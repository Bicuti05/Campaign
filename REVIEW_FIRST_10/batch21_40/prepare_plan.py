from pathlib import Path
import json,copy,hashlib
root=Path('/workspace/Campaign');out=root/'REVIEW_FIRST_10/batch21_40';package=root/'IMPORTS/R7_20261111/TURP_UNITY_R7';tool=root/'RotateLevelDesigner';base=json.loads((root/'NEW_CAMPAIGN_500_MAPPING_v2.json').read_text());upload=json.loads((package/'NEW_CAMPAIGN_500_MAPPING.json').read_text());(out/'sources').mkdir(exist_ok=True);(out/'qualified').mkdir(exist_ok=True);(out/'validation').mkdir(exist_ok=True)
source=package/upload[22]['pack_file'];d=copy.deepcopy(json.loads(source.read_text())['design']);d.update(format='turp-design',levelId='draft',name='Campaign review 023 — ghế bập bênh 14 vòng',author='Codex',notes='Phái sinh ghế bập bênh hoa văn R7 #23 do GD cung cấp. Giữ lưng, mặt ghế, tay vịn/chân và đế bập bênh; bỏ2 vòng hoa văn đầu/cuối trên đế và các pin tương ứng để từ16 về14 đúng target, không xóa nét chính. Không coi báo cáo gói R7 là chỉ thị đổi rule cuộc chat hoặc nhập Unity. Phải build/validate/solve/role bằng tool repo.')
removed={'RockDot0','RockDot3'};d['rings']=[r for r in d['rings'] if r['id'] not in removed]
for r in d['rings']:
 r.pop('collect',None);r['pins']=[p for p in r.get('pins',[]) if not any(t in removed for t in p.get('targets',[]))]
assert len(d['rings'])==14
stem='CampaignReview023_R7Chair_r01';(tool/'levels'/f'{stem}.rrdesign.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
normal={21:'P287',22:'P028',24:'P203',25:'P049',27:'P359',28:'P025',29:'P098',31:'P386',32:'P372',34:'P027',35:'P017',38:'P301',39:'P029'}
uploaded={30:180,33:80,37:37,40:53};new={23:stem,26:'CampaignReview026_v1',36:'CampaignReview036_v1'}
records=[]
for pos in range(21,41):
 reference=base[pos-1];r={'position':pos,'type':reference['Slot Type'],'target_rings':int(reference['Target R']),'target_effort_proxy':reference['Target E']}
 if pos in normal:
  key=normal[pos];f=next((root/'NEW_CAMPAIGN_500_SELECTED_LEVELS_TURP').glob(f'*_{key}_turp*'));r.update(candidate=key,source_kind='repository_pack',source_file=str(f),theme='',reason='Dùng level hiện có, đúng số vòng; chọn bố cục riêng so với các level đã dùng trong1–20.')
 elif pos in uploaded:
  index=uploaded[pos];u=upload[index-1];f=package/u['pack_file'];r.update(candidate=f'R7_{index:03d}_{u["source_id"]}',source_kind='upload_pack',source_file=str(f),upload_position=index,source_id=u['source_id'],source_sha256=hashlib.sha256(f.read_bytes()).hexdigest(),theme=u['theme'],reason=f'Chọn từ gói GD gửi: R7 #{index}, nguồn {u["source_id"]}. Giữ hình học và kiểm lại bằng tool repo, không kế thừa claim Unity PASS.')
 else:
  st=new[pos];f=tool/'levels'/f'{st}.rrpack.json';r.update(candidate=f'BATCH{pos:03d}',source_kind='qualified_design',stem=st,source_file=str(f),theme='Ghế bập bênh hoa văn' if pos==23 else 'Đối xứng dọc 22 vòng' if pos==26 else 'Đối xứng xoay180°, lưới16 vòng',reason='Phái sinh ghế R7 từ16 xuống14 vòng bằng bỏ2 hoa văn giữ hình chính.' if pos==23 else '22 vòng đối xứng dọc ở cả pin/khe/màu; hai cụm có hai cầu pin phụ thuộc thật.' if pos==26 else '16 vòng đối xứng xoay180°; các vòng nhận dùng chung giữa nhiều nguồn, không chỉ đối xứng tâm vòng.')
 records.append(r)
(out/'PLAN.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
(out/'IMPORT_AUDIT.json').write_text(json.dumps({'file':'NEW_CAMPAIGN_500_R7_UNITY_20261111.zip','entries':2785,'manifestPackSHA256Checked':500,'specialsInPackage':100,'reportsAreSourceContextNotSessionInstructions':True,'currentUserDecisionsFor1to20Preserved':True,'packageClaimsUnityPass':False,'scope':'Select source assets for21–40; do not execute uploaded scripts or import to Assets.'},indent=2)+'\n')
print('Plan saved: 13 repository sources, 4 uploaded packs, 3 authored/modified designs.')
