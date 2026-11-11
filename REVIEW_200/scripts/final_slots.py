from pathlib import Path
import json,hashlib,copy
import numpy as np
from scipy.optimize import linear_sum_assignment
out=Path('/workspace/Campaign/REVIEW_200');plan=json.loads((out/'PLAN_200.json').read_text());sym=[r for r in plan if r['type']=='Symmetrical' and r['position']>20]
assert all((out/'validation'/f'{r["position"]:03}.json').exists() for r in plan),'Only run after all qualified'
marker=out/'validation/FINAL_SYMMETRY_ASSIGNMENT.json'
if not marker.exists():
 cost=np.array([[(x['target_rings']-y['source_rings'])**2*100+abs(x['position']-y['source_position'])*.001 for y in sym] for x in sym]);ii,jj=linear_sum_assignment(cost)
 cache={r['position']:{'pack':(out/'packs'/f'Level{r["position"]:03}.rrpack.json').read_bytes(),'record':(out/'validation'/f'{r["position"]:03}.json').read_bytes(),'design':(out/'designs'/f'Level{r["position"]:03}.rrdesign.json').read_bytes() if (out/'designs'/f'Level{r["position"]:03}.rrdesign.json').exists() else None,'logs':{ext:(out/'validation'/f'{r["position"]:03}.{ext}').read_bytes() for ext in ['validate.log','solve.json'] if (out/'validation'/f'{r["position"]:03}.{ext}').exists()}} for r in sym}
 moves=[]
 for i,j in zip(ii,jj):
  dst,src=sym[int(i)],sym[int(j)];n=dst['position'];old=src['position'];row=copy.deepcopy(src);row.update(position=n,target_rings=dst['target_rings'],target_effort_proxy=dst.get('target_effort_proxy'),reason='Nguồn đối xứng GD duyệt; phân bố tối ưu bình phương sai lệch R để giảm lệch lớn, giữ nguyên hình học đã kiểm định.');plan[n-1]=row
  data=cache[old];(out/'packs'/f'Level{n:03}.rrpack.json').write_bytes(data['pack']);rec=json.loads(data['record']);rec['position']=n;rec['curveTarget']=row['target_rings'];rec['qualifiedBeforeSlotRelocation']=old;(out/'validation'/f'{n:03}.json').write_text(json.dumps(rec,ensure_ascii=False,indent=2))
  if data['design']:(out/'designs'/f'Level{n:03}.rrdesign.json').write_bytes(data['design'])
  for ext,b in data['logs'].items():(out/'validation'/f'{n:03}.{ext}').write_bytes(b)
  if n!=old:moves.append({'destination':n,'sourceR7':row['source_position'],'previousReviewSlot':old,'rings':row['source_rings'],'target':row['target_rings']})
 (out/'PLAN_200.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2));marker.write_text(json.dumps(moves,ensure_ascii=False,indent=2))
# Position metadata and authoring files; no collider edits.
for row in plan:
 n=row['position'];f=out/'packs'/f'Level{n:03}.rrpack.json';pack=json.loads(f.read_text());recfile=out/'validation'/f'{n:03}.json';rec=json.loads(recfile.read_text())
 if n>20:
  pack['levelId']=pack['runtime']['levelId']=str(n)
  if pack.get('design'):pack['design']['levelId']=str(n)
  pack['name']=f'Campaign {n:03} — '+(row.get('theme')or row['type'])
  pack.setdefault('reviewProvenance',{})['campaignPosition']=n
  f.write_text(json.dumps(pack,ensure_ascii=False,indent=2)+'\n')
 if pack.get('design'):
  d=copy.deepcopy(pack['design']);d['format']='turp-design';(out/'designs'/f'Level{n:03}.rrdesign.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
 rec['sha256']=hashlib.sha256(f.read_bytes()).hexdigest();rec['position']=n;recfile.write_text(json.dumps(rec,ensure_ascii=False,indent=2)+'\n')
print('Final slot assignment / metadata complete')
