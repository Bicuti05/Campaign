"use strict";
// An offset inner source leaves a crescent for a shared bar between two regions.
// All motion, retention and collision checks use the supplied Designer engine.
const fs=require("fs"),path=require("path"),H=require("./ongoing-study.js");
const {RR,P,OUT,clone,ring,pin,design,build,inspect,replay,probe}=H;
const d=design("Thanh dùng chung — nâng mở vùng dưới, hạ mở vòng lớn",
 "Vòng nhỏ lệch tâm nằm trong vòng lớn, chừa vùng trống bên phải cho thanh đứng đi qua khe dưới của vòng lớn và khe trên của vòng ngoài phía dưới. Thanh không tháo được theo cả hai phía lúc đầu. Nâng một đoạn mở vòng dưới nhưng thanh vẫn bị ngàm giữ và vẫn chặn vòng lớn. Nhả cụm dưới rồi hạ thanh khỏi ngàm mới mở được vòng lớn. Ngàm giữ vật không nhận pin; bỏ ngàm tạo tự tháo ở bước chuẩn bị. Nhóm nghiên cứu vòng lớn/nhỏ, không bom/Chain/Booster; chưa nghiệm thu bố cục hoặc độ khó.",[
  ring("I",-1.0854,0,0,"orange",[pin(180,"O")]),
  ring("O",0,0,270,"red",[],{radius:3.9208}),
  ring("T",2,-6.7,90,"blue"),
  ring("B",2+P,-6.7,0,"purple",[pin(180,"T")])
 ],[{id:"S",shape:"straight",x:2,y:-5.1,length:6.2,angle:90,color:"green",guides:[{x:2,y:-2.6,angle:90}]}]);
const partial=[{part:"S",target:3.6}],lower=[...partial,{part:"T",target:0}],route=[...lower,{part:"S",target:-1},{part:"O",target:180}];
const noBar=clone(d);noBar.sticks=[];
const noGuide=clone(d);delete noGuide.sticks[0].guides;
const noLower=clone(d);noLower.rings=noLower.rings.filter(r=>!["T","B"].includes(r.id));
const noOuter=clone(d);noOuter.rings=noOuter.rings.filter(r=>!["O","I"].includes(r.id));
const b=build(d),sim=RR.Solver.newSim(b.level,false);
const witness={
 initialGuideEngaged:sim.world.guideEngaged(0),
 initialBar:[-1,1].map(x=>probe(d,"S",x)),
 initialOuter:[-1,1].map(x=>probe(d,"O",x)),
 initialLower:[-1,1].map(x=>probe(d,"T",x)),
 partialOuter:[-1,1].map(x=>probe(d,"O",x,partial)),
 partialLower:[-1,1].map(x=>probe(d,"T",x,partial)),
 afterLowerOuter:[-1,1].map(x=>probe(d,"O",x,lower)),
 afterLowerBar:[-1,1].map(x=>probe(d,"S",x,lower)),
 withoutBarOuter:[-1,1].map(x=>probe(noBar,"O",x)),
 withoutBarLower:[-1,1].map(x=>probe(noBar,"T",x)),
 withoutGuidePartial:replay(noGuide,partial),
 withoutLowerBar:[-1,1].map(x=>probe(noLower,"S",x)),
 withoutOuterBar:[-1,1].map(x=>probe(noOuter,"S",x)),
 undoLower:[-1,1].map(x=>probe(d,"T",x,[...partial,{part:"S",target:0}])),
 trace:replay(d,route),feelTrace:replay(d,route,false,true)
};
const candidate={stem:"study-20261013-v19-shared-bar-inside-outside",design:d,authorMoves:route,inspection:inspect(d,false,6,1000),witness};
fs.writeFileSync(path.join(OUT,"inside-outside-study.json"),JSON.stringify({format:"rotate-inside-outside-study",version:1,scope:"Shared bar in nested crescent and external ring region; no core changes",candidates:[candidate]},null,2));
console.log(JSON.stringify({stem:candidate.stem,inspection:candidate.inspection,witness}));
