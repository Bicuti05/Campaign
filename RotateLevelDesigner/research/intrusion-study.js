"use strict";
const h=require("./ongoing-study.js"),fs=require("fs"),path=require("path"),{P,ring,pin,design,clone,inspect,replay,probe}=h;
const candidates=[];
{
 const d=design("Dọn chốt đang nằm trong khe", "Chốt ngang của vòng trái đi vào khe trái của vòng nhận pin bên phải. Chốt chặn cả hai đường quay nhưng không tạo khóa; phải nhả vòng dưới trái để nguồn chốt tự rời, rồi mới xoay vòng nhận pin bên phải. Hai cặp có pin riêng nhưng phụ thuộc nhau qua va chạm chốt. Không thanh, ngàm, bom, Chain hoặc Booster; bản nghiên cứu chưa nghiệm thu bố cục/độ khó.",[
  ring("C",0,0,90,"purple",[pin(270,"A")],{stops:[{angle:0,length:1.8}]}),ring("R",P,0,180,"blue"),
  ring("A",0,-P,270,"orange"),ring("B",P,-P,270,"green",[pin(90,"R")])
 ]),n=clone(d);delete n.rings[0].stops;
 candidates.push({stem:"study-20261013-v8-stop-in-neighbor-gap",design:d,inspection:inspect(d),witness:{initial:[-1,1].map(dir=>probe(d,"R",dir)),afterSourceLeaves:[-1,1].map(dir=>probe(d,"R",dir,[{part:"A",target:120}])),withoutStop:[-1,1].map(dir=>probe(n,"R",dir))}});
}
{
 const d=clone(h.candidates[0].design);d.name="Thanh L trong khe — rút theo nhánh ngang";d.notes="Nhánh dọc của L nằm trong vùng hở của vòng dưới phải, ngàm nằm trên nhánh ngang ngắn ở trong lòng vòng. Trượt ngang theo nhánh ngàm để rút L, rồi xoay vòng nhận pin. Quan sát ngàm để nhận trục trượt thay vì kéo theo đoạn dọc dài. Nhánh ngang cần để ngàm giữ thanh; không có pin giữ L. Không bom/Chain/Booster, bản nghiên cứu chưa nghiệm thu đẹp/khó.";
 Object.assign(d.sticks[0],{shape:"L",arm:1.1,y:-P-1.75,guides:[{x:P+.85,y:-P-.1,angle:0}]});
 const noGuide=clone(d);delete noGuide.sticks[0].guides;noGuide.sticks[0].slideAxis=[0,1];const noArm=clone(d);noArm.sticks[0].shape="straight";delete noArm.sticks[0].arm;
 const b=h.build(d),s=h.RR.Solver.newSim(b.level,false),a=h.RR.Solver.newSim(h.build(noArm).level,false);
 candidates.push({stem:"study-20261013-v8-l-side-pull",design:d,inspection:inspect(d),witness:{worldAxis:s.world.sticks[0].slideAxis,initialGate:[-1,1].map(dir=>probe(d,"R4",dir)),barDirections:[-1,1].map(dir=>probe(d,"S1",dir)),afterPull:[-1,1].map(dir=>probe(d,"R4",dir,[{part:"S1",target:.6}])),withGuideOtherRelease:replay(d,[{part:"R2",target:150},{part:"R4",target:216}]),withoutGuideOtherRelease:replay(noGuide,[{part:"R2",target:150},{part:"R4",target:216}]),armBinding:{original:s.world.guideEngaged(0),withoutArm:a.world.guideEngaged(0),withoutArmAnalysis:h.RR.analyze(h.build(noArm).level)}}});
}
fs.writeFileSync(path.join(h.OUT,"intrusion-study.json"),JSON.stringify({format:"rotate-intrusion-study",version:1,scope:"Designer only",candidates},null,2));
for(const c of candidates)console.log(JSON.stringify(c));
