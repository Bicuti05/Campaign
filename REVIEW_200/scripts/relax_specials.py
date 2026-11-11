from pathlib import Path
import json,math
out=Path('/workspace/Campaign/REVIEW_200');rows=json.loads((out/'PLAN_200.json').read_text());changed=[]
for row in rows:
 if row['source_kind']!='special_remap' or (out/'validation'/f'{row["position"]:03}.json').exists():continue
 p=Path(row['input_design']);d=json.loads(p.read_text());edits=[]
 for r in d['rings']:
  gap=r.get('gap',90)
  if not 0<gap<160:continue
  candidates=[]
  for direction in range(0,360,5):
   valid=True
   for pin in r.get('pins',[]):
    delta=abs((pin['angle']-direction+540)%360-180)
    radius=r.get('radius',1.75)-.25 if pin.get('inner') else r.get('radius',1.75)+.25
    if delta-80<math.degrees(math.atan2(.833/2,radius))+1:valid=False;break
   if valid:candidates.append(direction)
  if candidates:
   old=r.get('gapDir',0);direction=min(candidates,key=lambda v:abs((v-old+540)%360-180));r['gap']=160;r['gapDir']=direction;edits.append(r['id'])
 if edits:
  d['notes']+='\nRuntime repair: widened existing open arcs to160 degrees while retaining icon, ring count, fixed width and physically mounted pins; must re-validate, solve, replay and ablate.'
  p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');changed.append({'position':row['position'],'openArcsAdjusted':edits})
(out/'validation/OPEN_ARC_REPAIRS.json').write_text(json.dumps(changed,ensure_ascii=False,indent=2));print('Repair queued', [x['position']for x in changed])
