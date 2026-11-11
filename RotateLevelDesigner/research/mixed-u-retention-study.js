"use strict";
const fs=require("fs"),path=require("path"),h=require("./ongoing-study.js");
const {RR,D,OUT,clone,ring,pin,design,build,inspect,probe,replay}=h;
const a=1.8;
const d=design("Ngàm đã nhả — pin còn giữ U và vách", "U nhận pin vào nhánh phải, ngàm ở nhánh trái; cả hai passage theo Y. Hạ U một đoạn nhả binding ngàm trái nhưng pin phải vẫn giữ nguyên U, nên vách ngàm trái vẫn chặn thanh ngang H. Vòng nguồn giữ pin bên phải đồng thời chặn lối H phải bằng thân vòng. Hạ U tiếp để nhả pin: U/ngàm và nguồn vòng rời, H mới được rút hai phía. Bỏ ngàm U mở lối H trái, bỏ vòng nguồn mở lối H phải; tách U thành hai thanh làm vách trái rời sớm dù thanh phải còn pin. Có thể hạ U liền một lần; proof chia bước để kiểm trạng thái, không coi số drag là độ khó. Không thêm ngàm trên nhánh đang có pin. Không bom/chốt/Chain/Booster; chưa GD nghiệm thu bố cục/độ khó.",[
 ring("R",a+D,3,0,"orange",[pin(180,"U")])
],[
 {id:"U",shape:"U",x:0,y:0,length:2*a,arm:3.6,angle:0,color:"green",slideAxis:[0,1],guides:[{x:-a,y:3.5,angle:90}]},
 {id:"H",shape:"straight",x:0,y:3.75,length:3,angle:0,color:"blue",guides:[{x:.2,y:3.75,angle:0}]}
]);
const partial=[{part:"U",target:-.3}],released=[{part:"U",target:-2}],route=[...partial,...released,{part:"H",target:3}];
const noUGuide=clone(d);delete noUGuide.sticks[0].guides;
const noHGuide=clone(d);delete noHGuide.sticks[1].guides;
const noRing=clone(d);noRing.rings=[];
const noPin=clone(d);noPin.rings[0].pins=[];
const split=clone(d);split.rings[0].pins[0].target="UR";
split.sticks=[{id:"UL",shape:"straight",x:-a,y:1.8,length:3.6,angle:90,color:"green",guides:[{x:-a,y:3.5,angle:90}]},{id:"UR",shape:"straight",x:a,y:1.8,length:3.6,angle:90,color:"green"},clone(d.sticks[1])];
function state(design,moves){const b=build(design),s=RR.Solver.newSim(b.level,false);for(const m of moves)RR.Solver.apply(s,{obj:s.indexOf(b.ids[m.part]),target:m.target});return {remaining:s.remaining(),links:s.graph.active.slice(),bindings:s.graph.bindingActive.slice(),guides:s.world.guides.map((g,i)=>({id:g.id,active:g.active,engaged:s.world.guideEngaged(i)})),sourceLocked:s.isMovementLocked(s.indexOf(b.ids.R))};}
const w={initial:state(d,[]),partial:state(d,partial),undo:state(d,[...partial,{part:"U",target:0}]),initialH:[-1,1].map(dir=>probe(d,"H",dir)),partialH:[-1,1].map(dir=>probe(d,"H",dir,partial)),afterU:[-1,1].map(dir=>probe(d,"H",dir,released)),uDirections:[-1,1].map(dir=>probe(d,"U",dir)),withoutUGuideH:[-1,1].map(dir=>probe(noUGuide,"H",dir)),withoutRingH:[-1,1].map(dir=>probe(noRing,"H",dir)),withoutHGuide:replay(noHGuide,partial),withoutPin:replay(noPin,partial),splitAnalysis:inspect(split,false,2,400).analysis,splitPartial:replay(split,[{part:"UL",target:-.3}]),splitH:[-1,1].map(dir=>probe(split,"H",dir,[{part:"UL",target:-.3}])),trace:replay(d,route),feel:replay(d,route,false,true)};
w.hCollisionGeometry=[-3,3].map(target=>{
 const b=build(d),s=RR.Solver.newSim(b.level,false),obj=s.indexOf(b.ids.H);RR.Solver.apply(s,{obj,target});
 const st=s.world.stickOf(obj),pose=RR.W.stickPose(st),r=s.world.rings[0];
 return {target,offset:s.offsetOf(obj),sourceBody:Math.max(0,st.centerline.tube+r.arc.tube-RR.M.chainDistanceToArc(st.centerline,pose,r.arc)),sourceSolidPins:Math.max(0,...r.worldQuads.filter((_,i)=>r.quadKind[i]!==RR.KIND.SENSOR).map(q=>-RR.M.chainMinSdfOverConvex(st.centerline,pose,q))),guideWalls:s.world.guides.map(g=>({id:g.id,host:g.stickId,depth:Math.max(0,...g.wallQuads.map(q=>-RR.M.chainMinSdfOverConvex(st.centerline,pose,q)))}))};
});
const far=clone(d);far.rings[0].x=2.2+D;far.rings[0].y=2;far.sticks[0].length=4.4;far.sticks[0].guides[0].x=-2.2;far.sticks[1].y=3.7;far.sticks[1].guides[0]={x:0,y:3.7,angle:0};
w.rejectedFarSource={design:far,inspection:inspect(far,false,2,400),initialH:[-1,1].map(dir=>probe(far,"H",dir)),decision:"Rejected: H can leave its guide to the right before reaching the remote ring. Valid analysis/found does not prove the intended right-side blocker role."};
const c={stem:"study-20261013-v30-u-pin-keeps-guide-walls",design:d,authorMoves:route,inspection:inspect(d,false,6,1000),witness:w};
fs.writeFileSync(path.join(OUT,"mixed-u-retention-study.json"),JSON.stringify({format:"rotate-mixed-u-retention-study",version:1,scope:"Pin retains whole U after guide binding off; foreign wall blocking persists",candidates:[c]},null,2));
console.log(JSON.stringify({inspection:c.inspection,witness:w}));
