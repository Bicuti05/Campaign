import json, math

COL = {"red":"#e0403a","orange":"#ef8c2b","green":"#63c13d","dkgreen":"#1fa060",
       "blue":"#4a6fe0","cyan":"#2eaadc","purple":"#9b4ddc","yellow":"#f2c230"}
TH = 12  # ring / stick thickness

def u(a):
    r = math.radians(a); return (math.cos(r), math.sin(r))

class L:
    def __init__(s, lid, vi, en, idea, bomb_note=""):
        s.d = {"id":lid,"name_vi":vi,"name_en":en,"idea":idea,"bomb_note":bomb_note,
               "canvas":{"w":600,"h":600},"rings":[],"sticks":[],"links":[],"bombs":[]}
        s.rmap = {}
    def ring(s, cx, cy, r, color, gap=90, gsize=50):
        rid = "R%d" % (len(s.d["rings"])+1)
        o = {"id":rid,"label":str(len(s.d["rings"])+1),"cx":cx,"cy":cy,"r":r,"thickness":TH,
             "color":color,"gapAngle":gap,"gapSize":gsize,"rotatable":True}
        s.d["rings"].append(o); s.rmap[rid]=o; return rid
    def stick(s, pts, color, guide_seg=0, guide_t=0.5):
        sid = "S%d" % (len(s.d["sticks"])+1)
        a, b = pts[guide_seg], pts[guide_seg+1]
        gx, gy = a[0]+(b[0]-a[0])*guide_t, a[1]+(b[1]-a[1])*guide_t
        ang = math.degrees(math.atan2(b[1]-a[1], b[0]-a[0]))
        s.d["sticks"].append({"id":sid,"points":[list(p) for p in pts],"thickness":TH,"color":color,
            "guide":{"x":round(gx,1),"y":round(gy,1),"angle":round(ang,1)},
            "slideAxis":round(ang,1)})
        return sid
    def link(s, A, B, angle=None):
        a, b = s.rmap[A], s.rmap[B]
        dx, dy = b["cx"]-a["cx"], b["cy"]-a["cy"]; dist = math.hypot(dx, dy)
        ang = angle if angle is not None else math.degrees(math.atan2(dy, dx))
        d = u(ang)
        if dist + b["r"] <= a["r"]:
            p1 = (a["cx"]+(a["r"]-TH/2)*d[0], a["cy"]+(a["r"]-TH/2)*d[1])
            p2 = (b["cx"]+(b["r"]+TH/2)*d[0], b["cy"]+(b["r"]+TH/2)*d[1])
        else:
            p1 = (a["cx"]+(a["r"]+TH/2)*d[0], a["cy"]+(a["r"]+TH/2)*d[1])
            p2 = (b["cx"]-(b["r"]+TH/2)*d[0], b["cy"]-(b["r"]+TH/2)*d[1])
        s.d["links"].append({"from":A,"to":B,"angle":round(ang,1),
            "p1":[round(p1[0],1),round(p1[1],1)],"p2":[round(p2[0],1),round(p2[1],1)]})
    def bomb(s, R, angle, arm):
        a = s.rmap[R]; d = u(angle)
        p0 = (a["cx"]+(a["r"]-TH/2)*d[0], a["cy"]+(a["r"]-TH/2)*d[1])
        c = (p0[0]-arm*d[0], p0[1]-arm*d[1])
        bid = "B%d" % (len(s.d["bombs"])+1)
        s.d["bombs"].append({"id":bid,"attachedTo":R,"angle":angle,"armLength":arm,
            "armStart":[round(p0[0],1),round(p0[1],1)],"cx":round(c[0],1),"cy":round(c[1],1),"r":13})
    def done(s):
        n = len(s.d["rings"])+len(s.d["sticks"])+len(s.d["bombs"])
        s.d["objectCount"] = n
        s.d["difficulty"] = "easy" if n <= 9 else ("medium" if n <= 16 else "hard")
        return s.d

LV = []

# 1 Snail
l = L(1,"Ốc sên","Snail","Vỏ ốc là 3 vòng lồng xoắn ốc, thân và 2 râu là thanh.")
r1=l.ring(320,300,110,"red",45,50); r2=l.ring(340,310,62,"orange",200,50); r3=l.ring(352,316,26,"purple",10,60)
l.link(r1,r2,225); l.link(r2,r3,30)
l.stick([(120,440),(490,440)],"green")
l.stick([(150,425),(120,320)],"cyan"); l.stick([(175,425),(215,320)],"blue")
LV.append(l.done())

# 2 Fish
l = L(2,"Con cá","Fish","Thân cá là vòng lớn hở ở miệng, đuôi và vây là thanh, bong bóng là vòng nhỏ.",
      "Con cá 'nuốt' quả bom: bom gắn trong bụng R1, xoay R1 kéo bom đi theo.")
r1=l.ring(270,300,120,"orange",180,45); r2=l.ring(205,265,24,"blue",0,60)
r3=l.ring(150,165,26,"cyan",270,60); r4=l.ring(115,95,18,"cyan",270,70)
l.link(r1,r2,215); l.link(r3,r4)
l.stick([(400,300),(510,210)],"red"); l.stick([(400,300),(510,390)],"purple"); l.stick([(515,215),(515,385)],"green")
l.stick([(230,175),(300,110),(330,185)],"dkgreen")
l.bomb(r1,90,40)
LV.append(l.done())

# 3 Snowman
l = L(3,"Người tuyết","Snowman","Hai vòng chồng nhau làm thân và đầu, mũ và tay là thanh.",
      "Bom là 'cúc áo' giữa bụng, gắn trên R1.")
r1=l.ring(300,420,105,"cyan",90,50); r2=l.ring(300,240,68,"blue",270,40)
l.link(r1,r2)
l.stick([(235,168),(365,168)],"red"); l.stick([(262,160),(262,110),(338,110),(338,160)],"red",1)
l.stick([(205,370),(110,290)],"orange"); l.stick([(395,370),(490,290)],"orange")
l.stick([(285,240),(325,250)],"orange")
l.bomb(r1,270,45)
LV.append(l.done())

# 4 Flower
l = L(4,"Bông hoa","Flower","Nhuỵ là vòng giữa, 6 cánh hoa là vòng nối vào nhuỵ, cuống và lá là thanh.",
      "Bom là nhuỵ hoa: mọi cánh đều nối vào vòng chứa bom.")
c=l.ring(300,210,40,"yellow",270,60)
cols=["red","orange","purple","blue","cyan","green"]
for i,a in enumerate(range(0,360,60)):
    d=u(a); p=l.ring(round(300+86*d[0]),round(210+86*d[1]),38,cols[i],a,70); l.link(c,p)
l.stick([(300,345),(300,570)],"dkgreen")
l.stick([(300,480),(215,420)],"green"); l.stick([(300,430),(385,370)],"green")
l.bomb(c,270,14)
LV.append(l.done())

# 5 Turtle
l = L(5,"Con rùa","Turtle","Mai rùa là vòng lớn chứa 5 vòng hoa văn, đầu là vòng ngoài, chân và đuôi là thanh.",
      "Bom nằm ở vảy giữa mai (R2); xoay R2 sai hướng sẽ đưa bom chạm các vảy xung quanh.")
r1=l.ring(290,300,130,"dkgreen",270,30); r2=l.ring(290,300,38,"green",0,60)
ins=[]
for a in (45,135,225,315):
    d=u(a); ins.append(l.ring(round(290+82*d[0]),round(300+82*d[1]),30,"orange" if a in (45,225) else "purple",a,70))
r7=l.ring(470,250,38,"green",0,60)
l.link(r1,r7); l.link(r2,ins[0]); l.link(r2,ins[2])
l.stick([(190,410),(140,480)],"blue"); l.stick([(390,410),(440,480)],"blue")
l.stick([(190,190),(140,125)],"cyan"); l.stick([(390,190),(440,125)],"cyan")
l.stick([(155,305),(85,330)],"red")
l.bomb(r2,90,10)
LV.append(l.done())

# 6 Rocket
l = L(6,"Tên lửa","Rocket","Thân tên lửa ghép từ thanh, cửa sổ là vòng, ngọn lửa đuôi là vòng chứa bom.",
      "Bom là nhiên liệu ở buồng đốt R3.")
l.stick([(250,450),(250,220),(298,115)],"blue",0); l.stick([(350,450),(350,220),(302,115)],"blue",0)
r1=l.ring(300,230,30,"cyan",270,60); r2=l.ring(300,320,30,"cyan",90,60)
r3=l.ring(300,500,38,"orange",90,70)
l.link(r1,r2)
l.stick([(250,380),(185,470)],"red"); l.stick([(350,380),(415,470)],"red")
l.stick([(250,452),(350,452)],"purple")
r4=l.ring(110,140,22,"yellow",0,60); r5=l.ring(490,200,26,"yellow",180,60)
l.bomb(r3,90,18)
LV.append(l.done())

# 7 Bicycle
l = L(7,"Xe đạp","Bicycle","Hai bánh xe là vòng lớn, khung xe, yên và ghi-đông là thanh, giò đĩa là vòng nhỏ.",
      "Bom kẹt trên nan bánh trước (R2).")
r1=l.ring(165,390,85,"blue",0,40); r2=l.ring(435,390,85,"purple",180,40)
r3=l.ring(290,390,24,"green",270,70)
l.stick([(165,390),(250,255),(400,255)],"orange",1); l.stick([(250,255),(285,370)],"red")
l.stick([(305,375),(400,255)],"red"); l.stick([(400,255),(432,385)],"cyan")
l.stick([(215,228),(285,228)],"dkgreen"); l.stick([(375,205),(415,212),(405,250)],"dkgreen",0)
l.bomb(r2,315,30)
LV.append(l.done())

# 8 Owl
l = L(8,"Cú mèo","Owl","Thân cú là vòng lớn, mắt là 2 vòng to có đồng tử, tai và cành cây là thanh, cánh là vòng hở.",
      "Bom treo ở cánh trái (R6) - không phải mắt như level mèo/bò.")
r1=l.ring(300,320,150,"purple",90,40)
r2=l.ring(240,275,45,"orange",0,60); r3=l.ring(360,275,45,"orange",180,60)
r4=l.ring(240,275,18,"yellow",90,70); r5=l.ring(360,275,18,"yellow",90,70)
r6=l.ring(118,360,36,"cyan",180,80); r7=l.ring(482,360,36,"cyan",0,80)
l.link(r2,r3); l.link(r1,r6); l.link(r1,r7); l.link(r2,r4,180); l.link(r3,r5,0)
l.stick([(283,330),(300,365),(317,330)],"orange")
l.stick([(225,165),(185,85),(262,150)],"dkgreen"); l.stick([(375,165),(415,85),(338,150)],"dkgreen")
l.stick([(110,520),(490,520)],"red")
l.bomb(r6,180,22)
LV.append(l.done())

# 9 Bee
l = L(9,"Con ong","Bee","Đầu - ngực - bụng là 3 vòng nối nhau, cánh là 2 vòng, sọc và ngòi là thanh.",
      "Bom trong bụng ong (R3) = nọc độc.")
r1=l.ring(170,300,45,"orange",180,50); r2=l.ring(282,300,55,"purple",90,40); r3=l.ring(415,300,72,"orange",0,40)
r4=l.ring(255,190,50,"cyan",270,70); r5=l.ring(345,175,45,"cyan",270,70)
l.link(r1,r2); l.link(r2,r3); l.link(r2,r4); l.link(r2,r5)
l.stick([(395,240),(395,360)],"purple"); l.stick([(440,240),(440,360)],"purple")
l.stick([(495,300),(555,300)],"red")
l.stick([(150,262),(110,170)],"blue"); l.stick([(180,256),(205,170)],"blue")
l.bomb(r3,0,25)
LV.append(l.done())

# 10 Ladybug
l = L(10,"Bọ rùa","Ladybug","Thân là vòng đỏ lớn, đầu là vòng nhỏ, đốm lưng là 4 vòng, chân và râu là thanh.",
      "2 trong 4 'đốm' là bom ngụy trang (R5, R6) - người chơi phải phân biệt.")
r1=l.ring(300,325,140,"red",270,24); r2=l.ring(300,135,40,"purple",270,60)
l.link(r1,r2)
sp=[l.ring(232,262,28,"blue",0,70),l.ring(368,262,28,"blue",180,70),
    l.ring(225,385,28,"dkgreen",0,70),l.ring(375,385,28,"dkgreen",180,70)]
l.stick([(300,190),(300,460)],"purple")
for y1,y2 in ((250,215),(330,330),(410,450)):
    l.stick([(170,y1),(100,y2)],"orange"); l.stick([(430,y1),(500,y2)],"orange")
l.stick([(285,100),(250,45)],"cyan"); l.stick([(315,100),(350,45)],"cyan")
l.bomb(sp[2],0,22); l.bomb(sp[3],180,22)
LV.append(l.done())

# 11 Lantern
l = L(11,"Đèn lồng Trung thu","Mid-Autumn lantern","3 vòng đồng tâm làm thân đèn, móc treo, nắp và tua rua là thanh.",
      "Bom là ngọn nến ở lõi R3; phải xoay 3 vòng đồng tâm để lộ lối ra.")
r1=l.ring(300,290,140,"red",0,30); r2=l.ring(300,290,92,"orange",180,40); r3=l.ring(300,290,46,"yellow",90,60)
l.link(r1,r2,0+180-180); l.link(r2,r3,180)
l.stick([(300,40),(300,135)],"purple"); l.stick([(235,145),(365,145)],"dkgreen")
l.stick([(235,438),(365,438)],"dkgreen")
l.stick([(275,450),(275,550)],"red"); l.stick([(300,450),(300,565)],"orange"); l.stick([(325,450),(325,550)],"red")
l.bomb(r3,270,22)
LV.append(l.done())

# 12 Train
l = L(12,"Đoàn tàu hơi nước","Steam train","Đầu máy và 2 toa ghép từ thanh, 6 bánh xe và khói là vòng, đường ray là thanh dài.",
      "Toa cuối chở bom (R13) - phải tháo toa này cẩn thận.")
w=[l.ring(90,430,33,"blue",270,50),l.ring(180,430,33,"blue",270,50),l.ring(290,430,28,"purple",270,50),
   l.ring(365,430,28,"purple",270,50),l.ring(460,430,28,"green",270,50),l.ring(535,430,28,"green",270,50)]
s1=l.ring(205,200,22,"cyan",0,60); s2=l.ring(240,148,28,"cyan",0,60); s3=l.ring(290,90,34,"cyan",0,60)
win=l.ring(100,300,22,"yellow",90,60)
c1=l.ring(300,285,30,"orange",270,60); c2=l.ring(360,285,30,"orange",270,60); bc=l.ring(495,280,35,"red",270,60)
l.link(w[0],w[1]); l.link(w[2],w[3]); l.link(w[4],w[5]); l.link(s1,s2); l.link(s2,s3); l.link(c1,c2)
l.stick([(55,390),(55,250),(150,250)],"blue"); l.stick([(150,250),(150,320),(228,320),(228,390)],"blue",2)
l.stick([(195,318),(195,228)],"red")
l.stick([(250,392),(250,322),(400,322),(400,392)],"orange",1); l.stick([(425,392),(425,322),(570,322),(570,392)],"green",1)
l.stick([(50,398),(230,398)],"purple"); l.stick([(250,398),(400,398)],"purple"); l.stick([(425,398),(572,398)],"purple")
l.stick([(20,472),(580,472)],"dkgreen")
l.bomb(bc,90,22)
LV.append(l.done())

# 13 Sun
l = L(13,"Mặt trời","Sun","Lõi mặt trời là 2 vòng đồng tâm, 12 tia nắng là thanh trượt hướng tâm.",
      "Bom là lõi nóng ở R2; các tia (thanh) phải được rút ra trước khi xoay lõi.")
r1=l.ring(300,300,92,"orange",270,40); r2=l.ring(300,300,50,"red",90,60); l.link(r1,r2,90)
for i,a in enumerate(range(0,360,30)):
    d=u(a); l.stick([(round(300+118*d[0]),round(300+118*d[1])),(round(300+(205 if i%2 else 180)*d[0]),round(300+(205 if i%2 else 180)*d[1]))],
                    "yellow" if i%2==0 else "orange")
l.bomb(r2,270,24)
LV.append(l.done())

# 14 Octopus
l = L(14,"Bạch tuộc","Octopus","Đầu là vòng lớn với 2 mắt vòng, 8 xúc tu là thanh gấp khúc toả xuống, bong bóng là vòng nhỏ.",
      "Bom là túi mực gắn đáy đầu R1, nằm giữa các xúc tu.")
r1=l.ring(300,210,118,"purple",270,40)
r2=l.ring(252,200,30,"cyan",90,60); r3=l.ring(348,200,30,"cyan",90,60); l.link(r2,r3)
r4=l.ring(80,120,24,"blue",0,60); r5=l.ring(110,55,16,"blue",0,70)
cols=["red","orange","purple","blue","cyan","green","dkgreen","red"]
for i in range(8):
    x0=185+i*33; dx=x0-300
    l.stick([(x0,350),(round(300+dx*1.6+(-25 if i%2 else 25)),450),(round(300+dx*2.0),550)],cols[i])
l.bomb(r1,90,22)
LV.append(l.done())

# 15 Alarm clock
l = L(15,"Đồng hồ báo thức","Alarm clock","Mặt đồng hồ là 2 vòng đồng tâm, 2 chuông là vòng phía trên, kim và chân là thanh.",
      "Bom hẹn giờ gắn trên vòng R2, nằm ngay dưới tâm mặt đồng hồ.")
r1=l.ring(300,320,150,"red",90,24); r2=l.ring(300,320,110,"orange",270,40); l.link(r1,r2,270)
r3=l.ring(178,158,45,"cyan",225,60); r4=l.ring(422,158,45,"cyan",315,60); l.link(r1,r3); l.link(r1,r4)
l.stick([(300,305),(300,225)],"blue"); l.stick([(310,315),(385,315)],"purple")
l.stick([(300,165),(300,110)],"dkgreen")
l.stick([(205,445),(165,525)],"green"); l.stick([(395,445),(435,525)],"green")
l.bomb(r2,90,62)
LV.append(l.done())

# 16 Penguin
l = L(16,"Chim cánh cụt","Penguin","Thân và đầu là 2 vòng chồng, bụng trắng là vòng trong, mỏ, cánh, chân là thanh.",
      "Chim cánh cụt ôm bom trong bụng (R3).")
r1=l.ring(300,375,120,"blue",270,30); r2=l.ring(300,175,70,"blue",90,40); r3=l.ring(300,385,78,"cyan",270,50)
l.link(r1,r2); l.link(r1,r3,90)
l.stick([(282,190),(300,215),(318,190)],"orange")
l.stick([(185,330),(130,440)],"purple"); l.stick([(415,330),(470,440)],"purple")
l.stick([(255,500),(220,535),(285,535)],"orange",1); l.stick([(345,500),(315,535),(380,535)],"orange",1)
l.bomb(r3,90,30)
LV.append(l.done())

# 17 Dragonfly
l = L(17,"Chuồn chuồn","Dragonfly","Đầu và ngực là 2 vòng, đuôi là thanh dài, 4 cánh là thanh gấp khúc.",
      "Bom gắn ở ngực R2, nơi cả 4 cánh bám vào.")
r1=l.ring(300,85,32,"dkgreen",270,60); r2=l.ring(300,165,40,"green",90,40); l.link(r1,r2)
l.stick([(300,215),(300,545)],"dkgreen")
r3=l.ring(300,565,16,"dkgreen",270,90)
l.stick([(255,155),(60,110),(70,185),(255,178)],"cyan",0); l.stick([(345,155),(540,110),(530,185),(345,178)],"cyan",0)
l.stick([(260,195),(90,265),(110,315),(268,212)],"blue",0); l.stick([(340,195),(510,265),(490,315),(332,212)],"blue",0)
l.bomb(r2,90,20)
LV.append(l.done())

# 18 Puppy
l = L(18,"Cún con","Puppy face","Mặt là vòng lớn, tai cụp là thanh gấp, mắt, mũi, lưỡi là vòng, vòng cổ có thẻ tên.",
      "Thẻ tên ở vòng cổ (R6) thực chất là quả bom.")
r1=l.ring(300,310,140,"orange",270,24)
r2=l.ring(245,270,26,"purple",0,60); r3=l.ring(355,270,26,"purple",180,60)
r4=l.ring(300,350,24,"blue",270,70); r5=l.ring(300,415,22,"red",270,90)
r6=l.ring(300,530,28,"yellow",270,60)
l.link(r1,r4,90+180-180) if False else None
l.stick([(185,200),(105,250),(118,385)],"red",1); l.stick([(415,200),(495,250),(482,385)],"red",1)
l.stick([(300,375),(300,393)],"purple")
l.stick([(195,475),(405,475)],"dkgreen")
l.link(r4,r5); l.link(r2,r3)
l.bomb(r6,270,22)
LV.append(l.done())

# 19 Sailboat
l = L(19,"Thuyền buồm","Sailboat","Thân thuyền, cột buồm, 2 cánh buồm là thanh; mặt trời và sóng biển là vòng.",
      "Bom là thuỷ lôi nổi giữa các con sóng (R3).")
l.stick([(120,420),(180,488),(420,488),(480,420)],"orange",1); l.stick([(120,420),(480,420)],"red")
l.stick([(300,410),(300,95)],"purple")
l.stick([(312,120),(450,385),(312,385)],"cyan",0); l.stick([(288,150),(165,385),(288,385)],"blue",0)
r1=l.ring(500,105,40,"yellow",180,50)
wv=[l.ring(150+110*i,555,38,"cyan",270,120) for i in range(4)]
for i in range(3): l.link(wv[i],wv[i+1])
l.bomb(wv[1],90,24)
LV.append(l.done())

json.dump({"game":"TURP","version":1,
  "conventions":{"units":"px on 600x600 canvas","angles":"degrees, 0=right, 90=down (screen/SVG coords, clockwise)",
    "ring.gapAngle":"centre direction of the opening","ring.gapSize":"opening width in degrees",
    "stick.points":"polyline vertices","stick.guide":"rail/clamp position; stick slides along slideAxis",
    "links":"rigid tab joining two rings (p1 on 'from', p2 on 'to')",
    "bombs":"bomb attached to a ring by an arm; moves with that ring"},
  "levels":LV}, open("turp_creative_levels.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)

# ---------- render ----------
def arc(r):
    c=COL[r["color"]]; cx,cy,R=r["cx"],r["cy"],r["r"]
    a0=r["gapAngle"]+r["gapSize"]/2; a1=r["gapAngle"]-r["gapSize"]/2+360
    p0=u(a0); p1=u(a1); span=a1-a0
    return f'<path d="M{cx+R*p0[0]:.1f},{cy+R*p0[1]:.1f} A{R},{R} 0 {1 if span>180 else 0} 1 {cx+R*p1[0]:.1f},{cy+R*p1[1]:.1f}" fill="none" stroke="{c}" stroke-width="{TH}" stroke-linecap="round"/>'
def svg(lv):
    o=[f'<svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="600" fill="#fff"/>']
    for k in lv["links"]:
        c=COL[next(r for r in lv["rings"] if r["id"]==k["from"])["color"]]
        o.append(f'<line x1="{k["p1"][0]}" y1="{k["p1"][1]}" x2="{k["p2"][0]}" y2="{k["p2"][1]}" stroke="{c}" stroke-width="9"/>')
    for r in lv["rings"]: o.append(arc(r))
    for s in lv["sticks"]:
        pts=" ".join(f"{x},{y}" for x,y in s["points"])
        o.append(f'<polyline points="{pts}" fill="none" stroke="{COL[s["color"]]}" stroke-width="{TH}" stroke-linecap="round" stroke-linejoin="round"/>')
        g=s["guide"]; d=u(g["angle"]); n=(-d[1],d[0])
        for sg in (1,-1):
            mx,my=g["x"]+sg*13*n[0],g["y"]+sg*13*n[1]
            o.append(f'<line x1="{mx-9*d[0]:.1f}" y1="{my-9*d[1]:.1f}" x2="{mx+9*d[0]:.1f}" y2="{my+9*d[1]:.1f}" stroke="#444" stroke-width="3" stroke-linecap="round"/>')
        o.append(f'<text x="{g["x"]+26*n[0]:.1f}" y="{g["y"]+26*n[1]+4:.1f}" font-size="11" text-anchor="middle" fill="#333" font-family="serif">{s["id"]}</text>')
    hasb={b["attachedTo"] for b in lv["bombs"]}
    for r in lv["rings"]:
        if r["id"] in hasb or r["r"]<20: continue
        if any(q is not r and q["cx"]==r["cx"] and q["cy"]==r["cy"] and q["r"]<r["r"] for q in lv["rings"]): continue
        o.append(f'<circle cx="{r["cx"]}" cy="{r["cy"]}" r="10" fill="#fff" stroke="#555"/><text x="{r["cx"]}" y="{r["cy"]+4}" font-size="11" text-anchor="middle" font-family="serif">{r["label"]}</text>')
    for b in lv["bombs"]:
        o.append(f'<line x1="{b["armStart"][0]}" y1="{b["armStart"][1]}" x2="{b["cx"]}" y2="{b["cy"]}" stroke="#444" stroke-width="7" stroke-linecap="round"/>')
        o.append(f'<circle cx="{b["cx"]}" cy="{b["cy"]}" r="13" fill="#111" stroke="#ff5a3c" stroke-width="2.5"/><text x="{b["cx"]}" y="{b["cy"]+4}" font-size="11" fill="#fff" text-anchor="middle" font-family="serif">B</text>')
    o.append("</svg>"); return "".join(o)

dl={"easy":"Dễ","medium":"Vừa","hard":"Khó"}
cards="".join(f'<div class="card"><div class="sv">{svg(lv)}</div><h3>Level {lv["id"]}: {lv["name_vi"]}</h3><p class="m">{dl[lv["difficulty"]]} · {len(lv["rings"])} vòng · {len(lv["sticks"])} thanh · {len(lv["bombs"])} bom</p><p>{lv["idea"]}</p><p class="b">💣 {lv["bomb_note"] or "Không có bom"}</p></div>' for lv in LV)
open("turp_preview.html","w",encoding="utf-8").write(f'''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TURP Levels</title>
<style>body{{font-family:system-ui,sans-serif;background:#f4f5f7;margin:0;padding:16px;color:#222}}h1{{font-size:20px}}
.g{{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}}.card{{background:#fff;border-radius:12px;padding:12px;border:1px solid #e3e3e8}}
.sv svg{{width:100%;height:auto;border-radius:8px}}h3{{margin:8px 0 2px;font-size:16px}}.m{{color:#666;font-size:13px;margin:0 0 6px}}p{{font-size:14px;margin:4px 0}}.b{{color:#a33}}</style></head>
<body><h1>TURP – {len(LV)} level sáng tạo mới</h1><div class="g">{cards}</div></body></html>''')
for lv in LV: print(lv["id"],lv["name_vi"],lv["difficulty"],lv["objectCount"])
