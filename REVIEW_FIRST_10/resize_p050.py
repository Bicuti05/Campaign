from pathlib import Path
import json,math,copy
root=Path('/workspace/Campaign/RotateLevelDesigner');src=json.loads((root/'ingame/Level050.rrpack.json').read_text())['design'];d=copy.deepcopy(src)
d.update(levelId='draft',name='Campaign review 010 — P050 chuẩn hóa kích thước r01',author='Codex',notes='GD yêu cầu phục hồi P050 dù trước đây được note bỏ. Giữ hình chim, 3 vòng của nguồn; đây là bản chuẩn hóa kích thước, chưa quyết định ngoại lệ curve 6 vòng. Cỡ lớn có mục đích: thân 5.25, đầu 2.625, mắt 1.0; collider và pin do builder chính thức sinh. Thanh giữ đường nét nguồn, min đoạn có vai trò 2.3 trong revision này (lựa chọn thiết kế, không đặt thành luật chung). Không bom/xích/cá/Booster.')
for r in d['rings']:
 r['x']*=.8;r['y']*=.8;r.pop('collect',None)
by={r['id']:r for r in d['rings']};by['R1']['radius']=5.25;by['R2']['radius']=2.625;by['R3'].update(radius=1.0,x=by['R2']['x']-.5,y=by['R2']['y'])
for r in d['rings']:
 for p in r.get('pins',[]):
  t=by[p['targets'][0]];dx=t['x']-r['x'];dy=t['y']-r['y']
  if r['id']=='R3':p.update(angle=180,length=t['radius']-abs(dx)-r['radius']-.25)
  else:p.update(angle=math.degrees(math.atan2(dy,dx))%360,length=math.hypot(dx,dy)-r['radius']-.25-t['radius'])
for st in d['sticks']:
 st['x']*=.8;st['y']*=.8
 path=st['path'];lengths=[math.dist(a,b) for a,b in zip(path,path[1:])];scale=(4.5/lengths[0]) if len(path)==2 else 2.3/min(lengths)
 st['path']=[[x*scale,y*scale] for x,y in path]
 a,b=max(zip(st['path'],st['path'][1:]),key=lambda p:math.dist(*p));dx=b[0]-a[0];dy=b[1]-a[1];ln=math.hypot(dx,dy);st['slideAxis']=[dx/ln,dy/ln]
 angle=math.radians(st.get('angle',0));x=(a[0]+b[0])/2;y=(a[1]+b[1])/2
 st['guides']=[dict(x=st['x']+x*math.cos(angle)-y*math.sin(angle),y=st['y']+x*math.sin(angle)+y*math.cos(angle),angle=(st.get('angle',0)+math.degrees(math.atan2(dy,dx)))%360)]
file=root/'levels/CampaignReview010_P050_r01.rrdesign.json';file.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');print(file)
