import json, math, re
src=open('gen_levels.py',encoding='utf-8').read()
exec(src.split('LV = []')[0])
old=json.load(open('turp_creative_levels.json',encoding='utf-8'))
def linkS(s,R,S,angle):
    a=s.rmap[R]; d=u(angle)
    p1=(a["cx"]+(a["r"]+TH/2)*d[0],a["cy"]+(a["r"]+TH/2)*d[1])
    st=next(x for x in s.d["sticks"] if x["id"]==S); best=None
    for (x1,y1),(x2,y2) in zip(st["points"],st["points"][1:]):
        for k in range(101):
            t=k/100; q=(x1+(x2-x1)*t,y1+(y2-y1)*t); dd=math.dist(q,p1)
            if best is None or dd<best[0]: best=(dd,q)
    q=best[1]; L_=math.dist(q,p1)-TH/2
    p2=(p1[0]+d[0]*max(L_,0),p1[1]+d[1]*max(L_,0))
    s.d["links"].append({"from":R,"to":S,"angle":angle,"p1":[round(p1[0],1),round(p1[1],1)],"p2":[round(p2[0],1),round(p2[1],1)]})
L.linkS=linkS
LV=[]
def lv(*a): return L(*a)

l=lv(20,"Cây thông Noel","Christmas tree","3 tầng lá là thanh gấp hình chữ Λ, ngôi sao và quả châu là vòng treo trên cành, thân cây là thanh.","Một quả châu (R3) là bom.")
t1=l.stick([(180,460),(300,360),(420,460)],"dkgreen"); t2=l.stick([(200,330),(300,250),(400,330)],"green"); t3=l.stick([(220,210),(300,150),(380,210)],"dkgreen")
l.stick([(300,480),(300,560)],"orange")
r=l.ring(300,105,22,"yellow",270,60); l.linkS(r,t3,90)
o1=l.ring(205,515,18,"red",90,70); l.linkS(o1,t1,-90)
o2=l.ring(395,515,18,"blue",90,70); l.linkS(o2,t1,-90)
o3=l.ring(215,385,18,"purple",90,70); l.linkS(o3,t2,-90)
o4=l.ring(385,385,18,"cyan",90,70); l.linkS(o4,t2,-90)
l.bomb(o3,90,6); LV.append(l.done())

l=lv(21,"Con gà mái","Hen","Thân là vòng lớn, đầu là vòng nối thân, mỏ, mào, đuôi và chân là thanh.","Gà 'đẻ' trứng bom trong bụng R1.")
r1=l.ring(300,340,110,"orange",0,40); r2=l.ring(180,210,55,"red",315,50); l.link(r1,r2)
r3=l.ring(170,200,14,"purple",0,90); l.link(r2,r3,180)
l.stick([(100,205),(65,225),(100,240)],"yellow",0); l.stick([(155,130),(180,105),(205,130)],"red",0)
l.stick([(435,275),(500,215)],"green"); l.stick([(440,320),(520,300)],"blue"); l.stick([(435,378),(500,410)],"cyan")
l.stick([(270,475),(260,540),(230,555)],"yellow",0); l.stick([(330,475),(340,540),(370,555)],"yellow",0)
l.bomb(r1,90,40); LV.append(l.done())

l=lv(22,"Máy bay","Airplane","Nhìn từ trên xuống: thân, cánh, đuôi là thanh tách rời, 2 động cơ là vòng treo dưới cánh.","Động cơ trái (R1) mang bom.")
f=l.stick([(300,80),(300,520)],"blue"); w1=l.stick([(70,330),(270,270)],"cyan"); w2=l.stick([(530,330),(330,270)],"cyan")
l.stick([(215,505),(272,482)],"purple"); l.stick([(385,505),(328,482)],"purple")
e1=l.ring(150,360,24,"orange",90,60); l.linkS(e1,w1,-90); e2=l.ring(450,360,24,"orange",90,60); l.linkS(e2,w2,-90)
l.bomb(e1,90,8); LV.append(l.done())

l=lv(23,"Ngôi nhà","House","Mái, tường, cửa, nền là thanh; cửa sổ là 2 vòng nối nhau; khói là vòng treo ở ống khói.","Bom giấu sau cửa sổ trái R3.")
l.stick([(140,260),(300,130),(460,260)],"red"); l.stick([(170,290),(170,500)],"orange"); l.stick([(430,290),(430,500)],"orange")
l.stick([(150,540),(450,540)],"dkgreen"); ch=l.stick([(395,120),(395,170)],"purple")
l.stick([(265,515),(265,445),(335,445),(335,515)],"blue",1)
s1=l.ring(425,82,18,"cyan",180,70); l.linkS(s1,ch,135); s2=l.ring(470,42,20,"cyan",180,70); l.link(s1,s2)
w1=l.ring(240,370,35,"yellow",180,50); w2=l.ring(360,370,35,"yellow",0,50); l.link(w1,w2)
l.bomb(w1,90,14); LV.append(l.done())

l=lv(24,"Con thỏ","Rabbit","Mặt thỏ là vòng lớn, tai dài là thanh, mắt và mũi là vòng nối nhau, râu và răng là thanh.","Bom là củ cà rốt giấu ở má trái R1.")
r1=l.ring(300,350,120,"cyan",270,30)
l.stick([(250,212),(228,60)],"purple"); l.stick([(350,212),(372,60)],"purple")
e1=l.ring(255,315,22,"blue",0,70); e2=l.ring(345,315,22,"blue",180,70); l.link(e1,e2)
n=l.ring(300,370,14,"red",270,90); l.link(e1,n); l.link(r1,e1)
l.stick([(105,355),(158,368)],"orange"); l.stick([(105,405),(160,395)],"orange"); l.stick([(495,355),(442,368)],"orange"); l.stick([(495,405),(440,395)],"orange")
l.stick([(300,407),(300,430)],"green")
l.bomb(r1,135,22); LV.append(l.done())

l=lv(25,"Chiếc ô","Umbrella","Tán ô là 2 vòng bán nguyệt đồng tâm, cán ô là thanh móc, hạt mưa và vũng nước là thanh.","Bom treo bên trong tán ô (R2).")
r1=l.ring(300,260,170,"red",90,180); r2=l.ring(300,260,110,"orange",90,180); l.link(r1,r2,270)
l.stick([(300,180),(300,480),(275,505),(250,480)],"purple",0)
l.stick([(100,80),(85,110)],"cyan"); l.stick([(500,60),(485,90)],"cyan"); l.stick([(530,150),(515,180)],"cyan")
l.stick([(180,555),(420,555)],"blue")
l.bomb(r2,215,20); LV.append(l.done())

l=lv(26,"Con voi","Elephant","Đầu voi là vòng lớn, tai là vòng nối bên cạnh, mắt là vòng nhỏ, vòi và ngà là thanh.","Voi giấu bom trong tai (R2).")
r1=l.ring(260,280,110,"blue",315,30); r2=l.ring(440,270,62,"purple",0,40); l.link(r1,r2)
r3=l.ring(225,240,16,"dkgreen",0,90); l.link(r1,r3,200)
l.stick([(195,400),(170,470),(210,540)],"cyan",0); l.stick([(250,410),(285,455)],"yellow")
l.bomb(r2,0,24); LV.append(l.done())

l=lv(27,"Cối xay gió","Windmill","Tháp là 2 thanh, trục là vòng giữa, 4 cánh quạt là thanh hướng tâm, nền là thanh.","Bom nằm ở trục quay R1.")
l.stick([(270,550),(290,335)],"orange"); l.stick([(330,550),(310,335)],"orange"); l.stick([(210,575),(390,575)],"dkgreen")
r1=l.ring(300,280,28,"red",90,50); bl=[]
for i,a in enumerate((-135,-45,45,135)):
    d=u(a); bl.append(l.stick([(round(300+55*d[0]),round(280+55*d[1])),(round(300+170*d[0]),round(280+170*d[1]))],["cyan","blue","cyan","blue"][i]))
l.linkS(r1,bl[0],-135); l.bomb(r1,270,8); LV.append(l.done())

l=lv(28,"Con sứa","Jellyfish","Chuông sứa là 2 vòng bán nguyệt đồng tâm, 5 xúc tu là thanh lượn sóng song song.","Bom là 'nọc' giấu trong chuông R2.")
r1=l.ring(300,220,120,"purple",90,160); r2=l.ring(300,220,70,"cyan",90,160); l.link(r1,r2,270)
for i,x in enumerate((200,250,300,350,400)):
    l.stick([(x,295),(x+25,380),(x-10,465),(x+15,550)],["purple","cyan","blue","cyan","purple"][i])
l.bomb(r2,270,25); LV.append(l.done())

l=lv(29,"Con rắn","Snake","Thân rắn là chuỗi 6 vòng nối nhau uốn lượn, đầu là vòng lớn, lưỡi là thanh, cỏ là thanh.","Bom là chuông ở đuôi rắn (R1).")
pts=[(90,450),(160,410),(230,450),(300,410),(370,450),(440,410)]; cs=["dkgreen","green"]*3
rs=[l.ring(x,y,32,cs[i],270 if i%2 else 90,60) for i,(x,y) in enumerate(pts)]
for i in range(5): l.link(rs[i],rs[i+1])
h=l.ring(510,350,38,"dkgreen",0,40); l.link(rs[5],h)
l.stick([(565,330),(590,310)],"red"); l.stick([(60,560),(250,560)],"green"); l.stick([(330,560),(540,560)],"green")
l.bomb(rs[0],180,10); LV.append(l.done())

l=lv(30,"Cây nấm","Mushroom","Mũ nấm là vòng bán nguyệt lớn, đốm là 3 vòng nối nhau, thân và nền là thanh.","Một đốm nấm (R4) là bom - nấm độc.")
r1=l.ring(300,280,150,"red",90,180)
a=l.ring(232,205,26,"yellow",90,60); b=l.ring(325,185,25,"yellow",90,60); c=l.ring(385,240,22,"yellow",90,70); l.link(a,b); l.link(b,c); l.link(r1,b)
l.stick([(262,305),(250,500)],"orange"); l.stick([(338,305),(350,500)],"orange"); l.stick([(220,530),(380,530)],"dkgreen")
l.bomb(c,270,6); LV.append(l.done())

l=lv(31,"Trực thăng","Helicopter","Thân là vòng lớn có cửa kính vòng trong, đuôi, cánh quạt, càng là thanh, cánh quạt đuôi là vòng.","Trực thăng chở bom trong khoang R1.")
r1=l.ring(280,320,85,"blue",0,40); r2=l.ring(300,305,38,"cyan",0,60); l.link(r1,r2,315)
tb=l.stick([(390,318),(530,300)],"blue")
r3=l.ring(558,262,22,"orange",270,60); l.linkS(r3,tb,128)
l.stick([(280,215),(280,178)],"purple"); l.stick([(105,160),(262,160)],"red"); l.stick([(298,160),(455,160)],"red")
l.stick([(205,420),(222,450)],"purple"); l.stick([(355,420),(338,450)],"purple"); l.stick([(170,472),(390,472)],"dkgreen")
l.bomb(r1,180,18); LV.append(l.done())

# ---- validator ----
def samples(lv):
    obs=[]
    for r in lv["rings"]:
        pts=[];a0=r["gapAngle"]+r["gapSize"]/2;span=360-r["gapSize"];n=max(12,int(span/3))
        for k in range(n+1):
            d=u(a0+span*k/n);pts.append((r["cx"]+r["r"]*d[0],r["cy"]+r["r"]*d[1]))
        obs.append((r["id"],pts,6))
    for s in lv["sticks"]:
        pts=[]
        for (x1,y1),(x2,y2) in zip(s["points"],s["points"][1:]):
            n=max(2,int(math.dist((x1,y1),(x2,y2))/3))
            pts+=[(x1+(x2-x1)*k/n,y1+(y2-y1)*k/n) for k in range(n+1)]
        obs.append((s["id"],pts,6))
    for b in lv["bombs"]: obs.append((b["id"],[(b["cx"],b["cy"])],13))
    return obs
def check(lv):
    ok=set()
    for k in lv["links"]: ok.add(frozenset((k["from"],k["to"])))
    for b in lv["bombs"]: ok.add(frozenset((b["id"],b["attachedTo"])))
    obs=samples(lv);errs=[]
    for i in range(len(obs)):
        for j in range(i+1,len(obs)):
            A,B=obs[i],obs[j]
            if frozenset((A[0],B[0])) in ok: continue
            m=min(math.dist(p,q) for p in A[1] for q in B[1])
            if m<A[2]+B[2]+4: errs.append(f"{A[0]}~{B[0]} {m:.0f}")
    linked={x for k in lv["links"] for x in (k["from"],k["to"])}
    for r in lv["rings"]:
        if r["id"] not in linked: errs.append(r["id"]+" unfixed")
    for _,pts,_h in obs:
        if any(not(5<=x<=595 and 5<=y<=595) for x,y in pts): errs.append(_+" out"); 
    return errs
for v in LV: print(v["id"],v["name_vi"],check(v))
for v in old["levels"]: print("old",v["id"],check(v))
json.dump({**{k:old[k] for k in ("game","version")},"conventions":{**old["conventions"],"links":"rigid tab joining a ring to another ring or to a stick (p1 on 'from' ring, p2 on 'to')","rules":"no two objects overlap; every ring is fixed by at least one link; every stick is held by its guide"},"levels":LV},open('turp_creative_levels_part2.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
import pickle; pickle.dump(LV,open('/tmp/lv2.pkl','wb'))
