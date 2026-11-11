import json, math, pickle
g2=open('gen2.py',encoding='utf-8').read()
exec(g2.split('LV=[]')[0]); exec(g2.split('# ---- validator ----')[1].split('for v in LV')[0])
LV=[]; lv=L

# 32 Peacock
l=lv(32,"Chim công xoè đuôi","Peacock","Thân và đầu là vòng, 8 lông đuôi là thanh toả ra mang 'mắt lông' là vòng ở đầu, chân và mặt đất là thanh.","Một 'mắt lông' (R6) là bom nguỵ trang giữa 8 mắt lông.")
B=l.ring(300,420,55,"blue",90,40); H=l.ring(300,300,28,"blue",90,50); l.link(B,H)
cs=l.stick([(300,250),(300,225)],"dkgreen"); cr=l.ring(300,198,12,"green",270,80); l.linkS(cr,cs,90)
cols=["green","cyan","dkgreen","purple","purple","dkgreen","cyan","green"]
for i,a in enumerate((185,205,225,245,295,315,335,355)):
    d=u(a); st=l.stick([(round(300+75*d[0]),round(420+75*d[1])),(round(300+172*d[0]),round(420+172*d[1]))],cols[i],0,0.4)
    r=l.ring(round(300+212*d[0]),round(420+212*d[1]),26,cols[i],a,60); l.linkS(r,st,a+180)
l.stick([(275,495),(268,555)],"orange"); l.stick([(325,495),(332,555)],"orange"); l.stick([(150,578),(450,578)],"dkgreen")
l.bomb("R6",250,8); LV.append(l.done())

# 33 Ferris wheel
l=lv(33,"Vòng đu quay","Ferris wheel","Vành đu quay là vòng lớn, trục là vòng nhỏ, 8 nan hoa là thanh hướng tâm, 8 cabin là vòng treo ngoài vành, chân đế là thanh.","Một cabin (R7) chở bom.")
W=l.ring(300,285,165,"red",270,16); hub=l.ring(300,285,24,"orange",90,60); sp=[]
for i,a in enumerate(range(0,360,45)):
    d=u(a); sp.append(l.stick([(round(300+50*d[0]),round(285+50*d[1])),(round(300+146*d[0]),round(285+146*d[1]))],"orange" if i%2 else "yellow",0,0.6))
l.linkS(hub,sp[0],0)
cc=["blue","green","purple","cyan"]*2
for i,a in enumerate([22.5+45*k for k in range(8)]):
    d=u(a); c=l.ring(round(300+210*d[0]),round(285+210*d[1]),22,cc[i],(a+180)%360,70); l.link(W,c)
l.stick([(250,560),(281,477)],"purple"); l.stick([(350,560),(319,477)],"purple"); l.stick([(140,582),(460,582)],"dkgreen")
l.bomb("R7",90,8); LV.append(l.done())

# 34 Birthday cake
l=lv(34,"Bánh sinh nhật","Birthday cake","Bánh 3 tầng ghép từ thanh, nến là thanh có ngọn lửa vòng, hoa trang trí là chuỗi vòng trong từng tầng, 2 bóng bay hai bên.","Quà bất ngờ: tầng trên cùng giấu bom (R11).")
l.stick([(120,565),(480,565)],"purple")
t1=l.stick([(140,545),(140,455),(460,455),(460,545)],"orange",1); t2=l.stick([(190,435),(190,355),(410,355),(410,435)],"red",1); t3=l.stick([(240,335),(240,265),(360,265),(360,335)],"cyan",1)
for x in (260,300,340):
    c=l.stick([(x,245),(x,195)],"blue"); f=l.ring(x,170,11,"yellow",90,90); l.linkS(f,c,90)
r=[l.ring(x,500,20,"purple",270,70) for x in (200,265,330,395)]
for i in range(3): l.link(r[i],r[i+1])
r2=[l.ring(x,395,16,"yellow",270,80) for x in (235,300,365)]
for i in range(2): l.link(r2[i],r2[i+1])
top=l.ring(300,300,15,"green",90,70); l.linkS(top,t3,270)
for x,sx in ((70,1),(530,-1)):
    s=l.stick([(x+2*sx,195),(x+20*sx,320)],"dkgreen"); b=l.ring(x,150,30,"red" if sx>0 else "blue",90,40); l.linkS(b,s,90)
l.bomb(top,90,6); LV.append(l.done())

# 35 Castle
l=lv(35,"Lâu đài","Castle","2 tháp canh và tường thành là thanh, lỗ châu mai là thanh ngắn, cửa sổ và cổng vòm là vòng, cờ là vòng trên cột.","Cổng thành (R7) chứa bom - đại bác giữ cổng.")
l.stick([(80,560),(520,560)],"dkgreen")
for x0 in (90,430):
    l.stick([(x0,540),(x0,262)],"blue"); l.stick([(x0+80,540),(x0+80,262)],"blue")
    l.stick([(x0-10,242),(x0+90,242)],"purple")
    for dx in (0,40,80): l.stick([(x0+dx,222),(x0+dx,200)],"red")
l.stick([(195,330),(405,330)],"purple")
w=[l.ring(130,320,18,"yellow",90,60),l.ring(130,420,18,"yellow",90,60),l.ring(470,320,18,"yellow",90,60),l.ring(470,420,18,"yellow",90,60),
   l.ring(250,390,20,"cyan",90,60),l.ring(350,390,20,"cyan",90,60)]
l.link(w[0],w[1]); l.link(w[2],w[3]); l.link(w[4],w[5])
G=l.ring(300,490,40,"orange",90,140); l.link(w[4],G)
pole=l.stick([(300,310),(300,240)],"orange"); fl=l.ring(326,240,15,"red",0,70); l.linkS(fl,pole,180)
l.bomb(G,270,14); LV.append(l.done())

# 36 Stegosaurus
l=lv(36,"Khủng long phiến sừng","Stegosaurus","Thân là vòng lớn có 3 đốm vòng, 7 phiến lưng là thanh toả ra, đầu là vòng có mắt, đuôi có gai, 4 chân và mặt đất là thanh.","Một đốm trên lưng (R4) là bom.")
Bd=l.ring(300,350,110,"dkgreen",90,60); Hd=l.ring(125,440,35,"green",315,50); l.link(Bd,Hd)
e=l.ring(112,432,10,"purple",0,90); l.link(Hd,e,200)
s=[l.ring(250,330,25,"yellow",0,60),l.ring(320,300,25,"orange",0,60),l.ring(340,380,25,"yellow",0,60)]
l.link(s[0],s[1]); l.link(s[1],s[2])
for i,a in enumerate(range(195,350,25)):
    d=u(a); l.stick([(round(300+132*d[0]),round(350+132*d[1])),(round(300+178*d[0]),round(350+178*d[1]))],"orange" if i%2 else "red")
l.stick([(430,380),(520,440),(575,430)],"dkgreen",0)
l.stick([(470,385),(480,345)],"red"); l.stick([(510,405),(530,370)],"red")
for x in (230,280,330,380): l.stick([(x,478),(x,555)],"green")
l.stick([(100,582),(560,582)],"orange")
l.bomb(s[1],0,8); LV.append(l.done())

for v in LV: print(v["id"],v["name_vi"],v["objectCount"],check(v))
pickle.dump(LV,open('/tmp/lv3.pkl','wb'))
old=json.load(open('turp_creative_levels_part2.json',encoding='utf-8'))
json.dump({**old,"levels":LV},open('turp_creative_levels_part3.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
