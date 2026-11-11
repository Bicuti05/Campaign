from pathlib import Path
import math,json
OUT=Path('/workspace/Campaign/RotateLevelDesigner/levels')
def ring(id,x,y,r=1.3,gap=90,gapDir=90,color='blue'):
 return dict(id=id,x=round(x,6),y=round(y,6),radius=r,gap=gap,gapDir=gapDir,color=color)
def pin_between(a,b):
 dx=b['x']-a['x'];dy=b['y']-a['y'];length=math.hypot(dx,dy)-(a['radius']+.25)-b['radius']
 assert .45-1e-6<=length<=8,(a['id'],b['id'],length)
 a.setdefault('pins',[]).append(dict(id='to_'+b['id'],angle=math.degrees(math.atan2(dy,dx))%360,length=length,targets=[b['id']]))
def write(pos,name,rings,idea):
 d=dict(format='turp-design',version=1,levelId='draft',name=f'Campaign review {pos:03d} — {name}',author='Codex',notes=idea+' Không dùng Booster/bom/xích. Không suy ra độ khó từ số lệnh solver; cần GD playtest.',rings=rings,sticks=[])
 (OUT/f'CampaignReview{pos:03d}_v1.rrdesign.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
# 006: all ring bodies/gaps/pins/colors reflect through x=0, not just centres.
rings=[ring('HUB',0,0,1.75,0,0,'purple')]
for i in range(8):
 theta=i*45;rad=math.radians(theta);color='green' if theta in [0,180] else 'orange' if theta in [90,270] else 'blue'
 leaf=ring(f'LEAF{i}',4.5*math.cos(rad),4.5*math.sin(rad),1.3,90,270 if theta==270 else 90,color);pin_between(rings[0],leaf);rings.append(leaf)
write(6,'Đối xứng tám nhánh',rings,'Nhìn nhận ra đối xứng trái/phải ở cả khe, pin và màu. 9 vòng, không thanh/bom/StopPin. Mỗi nhánh giữ một pin thật của vòng giữa.')
# 010: centre + five petals, five useful pins; minimal object count, readable flower.
rings=[ring('CORE',0,0,1.4,0,0,'green')]
for i in range(5):
 theta=90+i*72;rad=math.radians(theta);petal=ring(f'PETAL{i}',4*math.cos(rad),4*math.sin(rad),1.5,90,theta%360,'orange');pin_between(rings[0],petal);rings.append(petal)
write(10,'Bông hoa năm cánh',rings,'Special: nhận ra một bông hoa năm cánh quanh nhụy. Đúng 6 vòng; bỏ toàn bộ 18 thanh của phương án cây thông. Mỗi cánh phải mở một pin của nhụy.')
# 013: six grapes in a 3/2/1 triangle plus a curved green leaf.
rings=[ring('GRAPE_TOP',0,2,1.45,0,0,'purple'),ring('GRAPE_L',-3.8,2,1.45,90,180,'purple'),ring('GRAPE_R',3.8,2,1.45,90,0,'purple'),ring('GRAPE_ML',-1.9,-1.7,1.45,90,180,'purple'),ring('GRAPE_MR',1.9,-1.7,1.45,90,0,'purple'),ring('GRAPE_BOTTOM',0,-5.4,1.45,90,270,'purple'),ring('LEAF',1.9,5.7,1.2,220,62.8189,'green')]
for i in [1,2,3,4,6]:pin_between(rings[0],rings[i])
for i in [3,4]:pin_between(rings[i],rings[5])
write(13,'Chùm nho và lá',rings,'Special: nhận ra chùm sáu quả nho thu nhỏ thành tam giác 3/2/1 và lá xanh phía trên. 7 vòng. Mở quả dưới trước để cho hai quả giữa được quay; sau đó mở các nhánh còn lại.')
# 016: 9-fold radial symmetry (a declared rotation symmetry, also mirrored gaps).
rings=[ring('HUB',0,0,1.75,0,0,'purple')]
for i in range(9):
 theta=90+i*40;rad=math.radians(theta);leaf=ring(f'LEAF{i}',5.2*math.cos(rad),5.2*math.sin(rad),1.3,90,theta%360,'blue');pin_between(rings[0],leaf);rings.append(leaf)
write(16,'Đối xứng vòng hoa chín nhánh',rings,'Đối xứng xoay 9 nhánh, có trục dọc phản chiếu cả khe và pin. 10 vòng đúng curve. Không gọi là độ khó đo trên người chơi.')
# 020: body + head + 4 wings, a distinctly readable butterfly.
rings=[ring('BODY',0,0,1.5,0,0,'green'),ring('HEAD',0,3.1,.85,90,90,'orange')]
for id,x,y,r,c in [('WING_UL',-3.5,2,1.6,'purple'),('WING_UR',3.5,2,1.6,'purple'),('WING_LL',-3.5,-2,1.35,'blue'),('WING_LR',3.5,-2,1.35,'blue')]:
 theta=math.degrees(math.atan2(y,x))%360;rings.append(ring(id,x,y,r,90,theta,c))
for leaf in rings[1:]:pin_between(rings[0],leaf)
write(20,'Con bướm bốn cánh',rings,'Special: nhận ra đầu nhỏ, thân giữa và bốn cánh bướm đối xứng. 6 vòng; không thêm thanh làm hình. Mỗi vòng cánh/đầu nhận pin thật từ thân. Chọn cá bằng bộ luật chính thức sau khi build.')
print('Authored 006, 010, 013, 016, 020 (design only, official builder is required).')
