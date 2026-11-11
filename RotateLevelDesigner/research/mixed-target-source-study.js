"use strict";
const fs=require("fs"),path=require("path"),h=require("./ongoing-study.js");
const {RR,P,D,OUT,clone,ring,pin,design,build,inspect,probe,replay}=h;
const d=design("Chọn thanh mở hướng quay — một nguồn giữ ba đích", "Nguồn A giữ hai thanh đứng và vòng B phía trên bằng ba pin thường. Hai thanh không ngàm, mỗi thanh chặn một phía của hai chốt trên B; B chưa thể quay tháo theo cả hai hướng. Rút thanh phải thì B mở hướng CW, thanh trái thì mở CCW. Khi B rời, A vẫn được thanh còn lại giữ; rút nốt thanh để nhả A. Có thể rút cả hai thanh trước rồi mở B, không tự ép một thứ tự duy nhất. Bỏ từng chốt mở một cửa xoay ngay đầu; pin/than không thêm để trang trí. Không bom/Chain/Booster; chưa GD nghiệm thu bố cục/độ khó.",[
 ring("A",0,0,270,"orange",[pin(0,"R"),pin(90,"B"),pin(180,"L")]),
 ring("B",0,P,90,"purple",[],{stops:[{angle:45,length:2},{angle:135,length:2}]})
],[
 {id:"R",shape:"straight",x:D,y:P/2,length:5.6,angle:90,color:"blue"},
 {id:"L",shape:"straight",x:-D,y:P/2,length:5.6,angle:90,color:"green"}
]);
const right=[{part:"R",target:.6}],left=[{part:"L",target:.6}],route=[...right,{part:"B",target:-90},{part:"L",target:.6}];
const noRightStop=clone(d);noRightStop.rings[1].stops=noRightStop.rings[1].stops.filter(s=>s.angle!==45);
const noLeftStop=clone(d);noLeftStop.rings[1].stops=noLeftStop.rings[1].stops.filter(s=>s.angle!==135);
const noRight=clone(d);noRight.sticks=noRight.sticks.filter(s=>s.id!=="R");noRight.rings[0].pins=noRight.rings[0].pins.filter(p=>p.target!=="R");
const noLeft=clone(d);noLeft.sticks=noLeft.sticks.filter(s=>s.id!=="L");noLeft.rings[0].pins=noLeft.rings[0].pins.filter(p=>p.target!=="L");
const noRingTarget=clone(d);noRingTarget.rings[0].pins=noRingTarget.rings[0].pins.filter(p=>p.target!=="B");
const w={initialB:[-1,1].map(dir=>probe(d,"B",dir)),afterRight:[-1,1].map(dir=>probe(d,"B",dir,right)),afterLeft:[-1,1].map(dir=>probe(d,"B",dir,left)),withoutRightStop:[-1,1].map(dir=>probe(noRightStop,"B",dir)),withoutLeftStop:[-1,1].map(dir=>probe(noLeftStop,"B",dir)),withoutRightBar:[-1,1].map(dir=>probe(noRight,"B",dir)),withoutLeftBar:[-1,1].map(dir=>probe(noLeft,"B",dir)),initialSource:[-1,1].map(dir=>probe(d,"A",dir)),bothBars:replay(d,[...right,...left]),withoutRingTarget:replay(noRingTarget,[...right,...left]),rightFirst:replay(d,right),leftFirst:replay(d,left),trace:replay(d,route),feel:replay(d,route,false,true),otherRoute:replay(d,[...left,{part:"B",target:270},{part:"R",target:.6}])};
const noStops=clone(d);delete noStops.rings[1].stops;
w.afterBothB=[-1,1].map(dir=>probe(d,"B",dir,[...right,...left]));
w.noStopsAfterBothB=[-1,1].map(dir=>probe(noStops,"B",dir,[...right,...left]));
w.blockedSourceGeometry=[-90,270].map(target=>{
 const b=build(d),s=RR.Solver.newSim(b.level,false);for(const m of [...right,...left,{part:"B",target}])RR.Solver.apply(s,{obj:s.indexOf(b.ids[m.part]),target:m.target});
 const source=s.world.rings[s.indexOf(b.ids.A)],receiver=s.world.rings[s.indexOf(b.ids.B)];
 const depths=receiver.worldQuads.map((q,i)=>({kind:receiver.quadKind[i],sourceBody:Math.max(0,-RR.M.minSdfArcOverConvex(source.arc,q)),sourceSolidPins:Math.max(0,...source.worldQuads.filter((_,j)=>source.quadKind[j]!==RR.KIND.SENSOR).map(other=>RR.M.satDepth(q,other)))})).filter(q=>q.kind===RR.KIND.STOP);
 return {target,pose:s.angleOf(s.indexOf(b.ids.B)),sourceInputLocked:s.isMovementLocked(s.indexOf(b.ids.A)),depths};
});
const c={stem:"study-20261013-v29-source-ring-and-bars",holdout:true,design:d,authorMoves:route,inspection:inspect(d,false,6,1000),witness:w,decision:"Not exported: initial geometry passes but proposed recipe fails. Even after both bars leave, receiver stops hit the source geometry before the incoming pin clears. First blocker is measured against source body/solid pin separately below; do not infer it from the graph alone. Removing both stops opens both angular escape directions."};
fs.writeFileSync(path.join(OUT,"mixed-target-source-study.json"),JSON.stringify({format:"rotate-mixed-target-source-study",version:1,scope:"One source has angular and continuous targets; each bar chooses a different rotation escape",candidates:[c]},null,2));
console.log(JSON.stringify({inspection:c.inspection,witness:w}));
