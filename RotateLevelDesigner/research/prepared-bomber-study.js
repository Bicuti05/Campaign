"use strict";
const fs=require("fs"),path=require("path"),H=require("./ongoing-study.js");
const {RR,P,D,OUT,clone,ring,pin,design,build,inspect,probe,replay}=H;
// Portrait arrangement: one selected orientation of a new prepared-bomber relation,
// not a separate export of the horizontal discovery sketch.
const d=design("Giữ L mang bom qua bước chuẩn bị — phá vòng kín nhỏ",
 "Dịch L +0,6 nhả pin nhưng ngàm vẫn giữ vật mang bom; khuỷu với ngàm chặn đường lùi, chốt trên nguồn chặn đường đưa bom lên mục tiêu. Xoay nguồn dưới để dọn cặp nguồn và chốt, rồi nâng L đưa bom vào vòng kín nhỏ trước lúc nó rời ngàm. Vòng kín giữ pin của nguồn trên; bom phá vòng kín và L, nguồn trên được nhả. Bỏ chốt cho phép đánh bom trước bước dọn nguồn. Bỏ ngàm làm L tự tháo ở bước chuẩn bị và bom tách ở vị trí chưa chạm mục tiêu. Bom gameplay cần thiết; nhóm lớn/nhỏ radius 1,75 và 0,8, không Chain/Booster. Bố cục theo chiều dọc, chưa nghiệm thu đẹp/khó.",[
 ring("A",0,0,180,"orange",[pin(0,"S")]),
 ring("B",0,P,180,"purple",[pin(270,"A")],{stops:[{angle:45,length:2}]}),
 ring("C",D+1.3,8.7,0,"red",[],{gap:0,radius:.8}),
 ring("E",.5,8.7,180,"green",[pin(0,"C")])
 ],[{id:"S",shape:"L",x:D,y:P/2,length:5.6,arm:1.3,angle:90,color:"blue",guides:[{x:D,y:4.1,angle:90}],bomb:{x:D+1.3,y:P/2+2.8,radius:.3}}]);
const partial=[{part:"S",target:.6}],gate=[...partial,{part:"A",target:90}],route=[...gate,{part:"S",target:4}];
const noStop=clone(d);delete noStop.rings[1].stops;
const noGuide=clone(d);delete noGuide.sticks[0].guides;noGuide.sticks[0].slideAxis=[1,0];
const noBomb=clone(d);delete noBomb.sticks[0].bomb;
const straight=clone(d);straight.sticks[0].shape="straight";delete straight.sticks[0].arm;
function state(design,moves){const b=build(design),s=RR.Solver.newSim(b.level,true);for(const m of moves)RR.Solver.apply(s,{obj:s.indexOf(b.ids[m.part]),target:m.target});return {remaining:s.remaining(),solvedIds:Array.from({length:s.objectCount()},(_,i)=>i).filter(i=>s.isSolved(i)).map(i=>s.idOf(i)),bombs:s.world.bombs.map(q=>({host:q.host,hostId:q.host<0?null:s.idOf(q.host),active:q.active,position:q.center()}))};}
const b=build(d),sim=RR.Solver.newSim(b.level,true),initialContacts=[];for(let o=0;o<sim.objectCount();o++){const pose=sim.isStick(o)?sim.offsetOf(o):sim.angleOf(o),c=RR.W.bombSweep(sim.world,o,pose,pose).contact;if(c)initialContacts.push({moving:sim.idOf(o),target:sim.idOf(c.target)});}
const witness={initialHostedBomb:sim.world.bombs[0].host===sim.indexOf(b.ids.S),initialContacts,initialBar:[-1,1].map(x=>probe(d,"S",x,[],true)),partial:replay(d,partial,true),trace:replay(d,route,true),feel:replay(d,route,true,true),withoutStopFirst:replay(noStop,[{part:"S",target:4}],true),withoutGuideFirst:replay(noGuide,partial,true),withoutGuideAfterPreparation:state(noGuide,gate),withoutBomb:inspect(noBomb,false,2,500),straightAfterGate:[-1,1].map(x=>probe(straight,"S",x,gate,true))};
const c={stem:"study-20261013-v24-prepared-l-bomber",design:d,bombs:true,authorMoves:route,inspection:inspect(d,true,6,1000),witness};
fs.writeFileSync(path.join(OUT,"prepared-bomber-study.json"),JSON.stringify({format:"rotate-prepared-bomber-study",version:1,scope:"Host retained past a preparation; removable gate before contact with a closed small ring",candidates:[c]},null,2));
console.log(JSON.stringify({stem:c.stem,inspection:c.inspection,witness}));
