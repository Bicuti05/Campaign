from pathlib import Path
import math,json
out=Path('/workspace/Campaign/RotateLevelDesigner/levels')
def ring(id,x,y,r=1.25,gap=90,direction=90,color='blue'):return dict(id=id,x=round(x,6),y=round(y,6),radius=r,gap=gap,gapDir=direction,color=color)
def pin(source,target,angle=None):
 dx=target['x']-source['x'];dy=target['y']-source['y'];a=math.degrees(math.atan2(dy,dx))%360 if angle is None else angle
 length=math.hypot(dx,dy)-source['radius']-.25-target['radius'];assert .45-1e-5<=length<=8,(source['id'],target['id'],length)
 source.setdefault('pins',[]).append({'id':'to_'+target['id'],'angle':a,'length':length,'targets':[target['id']]})
def write(n,rings,notes):
 d=dict(format='turp-design',version=1,levelId='draft',name=f'Campaign review {n:03d} — đối xứng',author='Codex',notes=notes+' Không bom/xích/Booster. R target giữ nguyên; độ khó người chơi chưa đo.',rings=rings,sticks=[])
 (out/f'CampaignReview{n:03d}_v1.rrdesign.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
# 22 rings: two ten-leaf hubs coupled by a mirrored bridge pair.
angles=[0,30,60,120,150,180,210,240,300,330];colors={0:'blue',180:'blue',30:'green',150:'green',60:'orange',120:'orange',210:'red',330:'red',240:'teal',300:'teal'}
rings=[];by={}
for group,y in [('UP',7.4),('DOWN',-7.4)]:
 hub=ring('HUB_'+group,0,y,2.625,0,0,'purple');rings.append(hub);by[hub['id']]=hub
 for a in angles:
  direction=a
  if group=='UP' and a in [240,300]:direction=0 if a==240 else 180
  if group=='DOWN' and a in [60,120]:direction=0 if a==60 else 180
  leaf=ring(f'{group}_{a}',6.5*math.cos(math.radians(a)),y+6.5*math.sin(math.radians(a)),1.25,90,direction,colors[a]);pin(hub,leaf);rings.append(leaf);by[leaf['id']]=leaf
pin(by['UP_240'],by['DOWN_120']);pin(by['UP_300'],by['DOWN_60'])
write(26,rings,'22 vòng, đối xứng phản chiếu trục dọc ở cả khe/pin/màu. Hai cụm liên hệ bằng hai cầu pin: cần mở các vòng nhận phía dưới trước rồi quay lại nguồn phía trên, không ghép hai cụm độc lập cho đủ số.')
# 16 rings: half-turn symmetric checkerboard of shared roots and receivers.
pitch=4.5854;rings=[];by={}
for row in range(4):
 for col in range(4):
  root=(row+col)%2==0
  r=ring(f'R{row}_{col}',(col-1.5)*pitch,(1.5-row)*pitch,1.75,0 if root else 70,0 if root else (45 if row<2 else 225),'purple' if root else 'green');rings.append(r);by[(row,col)]=r
for (row,col),r in by.items():
 if (row+col)%2==0:
  for dr,dc in [(0,1),(0,-1),(1,0),(-1,0)]:
   target=by.get((row+dr,col+dc))
   if target:pin(r,target)
write(36,rings,'16 vòng, lưới4×4 đối xứng xoay180° cả pin/khe/màu. Các vòng hở nhận nhiều nguồn kín dùng chung; cần mở một cửa rồi phối hợp các cửa khác để giải nguồn, không coi số thao tác là độ khó.')
