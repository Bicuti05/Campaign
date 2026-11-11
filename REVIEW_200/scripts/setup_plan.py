from pathlib import Path
from scipy.optimize import linear_sum_assignment
import json,hashlib,numpy as np,copy
root=Path('/workspace/Campaign');review=root/'REVIEW_200';legacy=root/'REVIEW_FIRST_10';package=root/'IMPORTS/R7_20261111/TURP_UNITY_R7';source=json.loads((root/'NEW_CAMPAIGN_500_MAPPING_v2.json').read_text());r7=json.loads((package/'NEW_CAMPAIGN_500_MAPPING.json').read_text());baseline=json.loads((legacy/'batch21_40/BASELINE_FIRST20.json').read_text());(review/'source/BASELINE_FIRST20.json').write_text(json.dumps(baseline,ensure_ascii=False))
rows=[]
for r in baseline['rows']:
 row=copy.deepcopy(r);row.update(source_kind='baseline_first20',input_pack=str(legacy/r['pack']),status='qualified',fixed=True);rows.append(row)
remaps=json.loads((legacy/'batch21_40/SPECIAL_REMAP_REQUESTS.json').read_text());remap_by={r['destination']:r for r in remaps}
for r in remaps:
 stem=f'SpecialMove_R7{r["source_r7_position"]:03d}_to{r["destination"]:03d}_r01';rows.append(dict(position=r['destination'],type='Special',candidate=f'R7S{r["source_r7_position"]:03d}_D{r["destination"]:03d}',source_kind='special_remap',input_pack=r['source_file'],input_design=str(root/'RotateLevelDesigner/levels'/f'{stem}.rrdesign.json'),stem=stem,source_position=r['source_r7_position'],theme=r['source_theme'],target_rings=r['frozen_target'],required_rings=r['required_rings'],source_rings=r['source_rings'],specific_feedback=r['specific_feedback'],status='draft',reason='Theo ánh xạ GD. Không giảm vòng nguồn; thiếu so với mốc nguyên thì bổ sung có liên kết thật.'))
sym=json.loads((legacy/'batch21_40/SYMMETRY_REQUESTS.json').read_text());targets=sym['target_slots'];candidates=[r7[x-1] for x in sym['r7_sources']];cost=np.array([[abs(source[pos-1]['Target R']-r['rings'])*100+abs(pos-r['position'])*.001 for r in candidates] for pos in targets]);ii,jj=linear_sum_assignment(cost)
for i,j in zip(ii,jj):
 pos=targets[int(i)];r=candidates[int(j)];entry=dict(position=pos,type='Symmetrical',candidate=f'R7SYM{r["position"]:03d}',source_kind='approved_symmetry',source_position=r['position'],input_pack=str(package/r['pack_file']),target_rings=source[pos-1]['Target R'],required_rings=r['rings'],source_rings=r['rings'],theme='Đối xứng đã được GD duyệt',status='pending',reason='Nguồn đối xứng GD chỉ định; phân bố bằng tối ưu sai lệch R, giữ hình học đã duyệt.')
 if r['position']==206:entry.update(source_kind='symmetry_spacing_revision',stem=f'SymMove_R7206_to{pos:03d}_r01',input_design=str(root/'RotateLevelDesigner/levels'/f'SymMove_R7206_to{pos:03d}_r01.rrdesign.json'),reason='Nguồn206: chỉnh khoảng cách ring/stick, giữ số vòng và tính đối xứng, dựng lại bằng tool.')
 rows.append(entry)
fixed_normal={}
used_legacy={int(r['candidate'][1:]) for r in baseline['rows'] if r.get('candidate','').startswith('P') and r['candidate'][1:].isdigit()};used_legacy|={int(x[1:]) for x in fixed_normal.values() if x.startswith('P') and x[1:].isdigit()};used_legacy.add(315)
used_upload={r['source_r7_position'] for r in remaps}|set(sym['r7_sources'])|set()
normal_slots=[i for i in range(21,201) if source[i-1]['Slot Type']=='Normal' and i not in fixed_normal]
pool=[r for r in r7 if r['role']=='Normal' and r['position'] not in used_upload and (r.get('legacy_id') is None or int(r['legacy_id']) not in used_legacy)]
# Avoid choosing two variants of the same meaningful legacy source.
dedup={}
for r in pool:
 key=('legacy',r['legacy_id']) if r.get('legacy_id') is not None else ('geometry',r['geometry_hash'])
 score=(r['sticks'],abs(r['rings']-r['r_target']))
 if key not in dedup or score<(dedup[key]['sticks'],abs(dedup[key]['rings']-dedup[key]['r_target'])):dedup[key]=r
pool=list(dedup.values());cost=np.array([[abs(float(source[pos-1]['Target R'])-r['rings'])*10000+(0 if bool(r['bombs'])==(pos%10==5) else 300)+r['sticks']*.2+min(abs(pos-r['position']),100)*.01 for r in pool] for pos in normal_slots]);a,b=linear_sum_assignment(cost)
for i,j in zip(a,b):
 pos=normal_slots[int(i)];r=pool[int(j)];rows.append(dict(position=pos,type='Normal',candidate=f'R7N{r["position"]:03d}',source_kind='normal_pool',source_position=r['position'],input_pack=str(package/r['pack_file']),target_rings=source[pos-1]['Target R'],required_rings=r['rings'],source_rings=r['rings'],theme='',status='pending',reason='Normal nguồn R7, chọn đúng R và tránh lặp nguồn đã dùng; không coi mật độ/số lệnh là độ khó.'))
rows.sort(key=lambda r:r['position']);assert [r['position'] for r in rows]==list(range(1,201));assert len({r['candidate'] for r in rows})==200
for r in rows:
 r['chain_requested']=r['position'] in {101,102,108,118,131,145,158,198}
 if r['chain_requested']:r['chain_ring_count']=2
for r in rows:r.setdefault('target_effort_proxy',source[r['position']-1].get('Target E'))
(review/'PLAN_200.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n');print('200 planned:',{role:sum(r['type']==role for r in rows) for role in ['Normal','Special','Symmetrical']});print('Normal exact R',sum(r['source_rings']==r['target_rings'] for r in rows if r['type']=='Normal' and 'source_rings'in r),'of',sum(r['type']=='Normal'and'source_rings'in r for r in rows));print('Sym206 destination',next(r['position'] for r in rows if r.get('source_position')==206 and r['type']=='Symmetrical'))
