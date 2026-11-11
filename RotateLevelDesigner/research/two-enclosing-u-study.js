"use strict";
const fs=require("fs"),path=require("path"),h=require("./ongoing-study.js");
const {RR,D,OUT,clone,ring,pin,design,build,inspect,probe,replay}=h;
const a=3.5,height=2.5,base=-height-3.5,top=.5;
const d=design("Một U nối hai vùng lồng — đối chứng khung chung", "Sketch chưa giao: hai vùng gồm nguồn nhỏ và vòng nhận lớn. Pin ngang giữ hai nhánh U khác độ cao, pin dọc giữ vòng lớn; vùng trái thêm nguồn kín nhỏ bên trong để cần thao tác quay lại vòng giữa. Khe lớn 120 độ cho pin ngang còn sống và pin dọc cùng được clearance. Chưa chứng minh đáy nối U tạo phụ thuộc khác hai thanh riêng.",[
 ring("IL",-a,0,180,"orange",[pin(0,"U"),pin(90,"OL")]),
 ring("OL",-a,0,315,"purple",[],{radius:2.8354,gap:120}),
 ring("CL",-a,0,90,"green",[pin(270,"IL")],{radius:.8,gap:0}),
 ring("IR",a,-height,180,"blue",[pin(0,"U"),pin(90,"OR")]),
 ring("OR",a,-height,315,"teal",[],{radius:2.8354,gap:120})
],[{id:"U",shape:"U",x:D,y:base,length:2*a,arm:top-base,angle:0,color:"red",slideAxis:[0,1]}]);
const rejectedOriginal=clone(d);
d.rings[0].pins.shift();d.rings[1].gap=90;d.rings[1].gapDir=0;d.rings[2].y=.1354;d.rings[4].gapDir=0;
d.name="Pin nhánh phải giữ U — nhánh trái chặn vùng lồng";
d.notes="U chỉ nhận một pin ở nhánh phải thấp hơn; không ngàm/pin trái thừa. Nhánh trái U chặn hai đường quay vòng lớn trái dù không nhận pin. Hạ một đoạn vẫn giữ U, mở vùng trái có thêm nguồn nhỏ bên trong; hạ hết mới mở vùng phải. Khe phải 120 độ để clearance cả pin ngang và pin dọc còn sống, khe trái 90 độ. Không bom/Booster/Chain; chưa GD nghiệm thu bố cục/độ khó.";
const shallow=[{part:"U",target:-.6}],prep=[{part:"U",target:-2}],route=[...prep,{part:"OL",target:100},{part:"IL",target:300},{part:"U",target:-4},{part:"OR",target:60}];
const split=clone(d);split.rings[3].pins[0].target="UR";split.sticks=[{id:"UL",shape:"straight",x:-a+D,y:(base+top)/2,length:top-base,angle:90,color:"red",slideAxis:[1,0]},{id:"UR",shape:"straight",x:a+D,y:(base+top)/2,length:top-base,angle:90,color:"navy",slideAxis:[1,0]}];
const splitRoute=[{part:"UR",target:-.1},{part:"OL",target:100},{part:"IL",target:300},{part:"UR",target:-4},{part:"OR",target:60}];
const narrow=clone(d);narrow.rings[1].gap=90;narrow.rings[4].gap=90;
const noOuter=clone(d);noOuter.rings=noOuter.rings.filter(r=>!["OL","OR"].includes(r.id));noOuter.rings.find(r=>r.id==="IL").pins.pop();noOuter.rings.find(r=>r.id==="IR").pins.pop();
const noInnerRoot=clone(d);noInnerRoot.rings=noInnerRoot.rings.filter(r=>r.id!=="CL");
const noLeftArm=clone(split);noLeftArm.sticks=noLeftArm.sticks.filter(s=>s.id!=="UL");
const noRightArm=clone(split);noRightArm.sticks=noRightArm.sticks.filter(s=>s.id!=="UR");noRightArm.rings[3].pins.shift();
const w={trace:replay(d,route),feel:replay(d,route,false,true),initialLeft:[-1,1].map(dir=>probe(d,"OL",dir)),shallowLeft:[-1,1].map(dir=>probe(d,"OL",dir,shallow)),deepLeft:[-1,1].map(dir=>probe(d,"OL",dir,prep)),deepRight:[-1,1].map(dir=>probe(d,"OR",dir,prep)),initialIL:[-1,1].map(dir=>probe(d,"IL",dir)),onlyBarIL:[-1,1].map(dir=>probe(d,"IL",dir,prep)),bothIL:[-1,1].map(dir=>probe(d,"IL",dir,[...prep,{part:"OL",target:100}])),splitAnalysis:RR.analyze(build(split).level),splitTrace:replay(split,splitRoute),narrow:inspect(narrow,false,4,800),withoutOuter:replay(noOuter,[...prep,{part:"IL",target:300},{part:"U",target:-4}]),withoutInnerRoot:replay(noInnerRoot,[...prep,{part:"OL",target:100}]),withoutLeftArm:[-1,1].map(dir=>probe(noLeftArm,"OL",dir)),withoutRightArm:replay(noRightArm,[{part:"UL",target:-.1},{part:"OL",target:100},{part:"IL",target:300},{part:"OR",target:60}]),fullBarFirst:replay(d,[{part:"U",target:-4},{part:"OL",target:100},{part:"IL",target:300},{part:"OR",target:60}]),rejectedOriginal:{analysis:RR.analyze(build(rejectedOriginal).level),reason:"Original 0.8 concentric pin anchor overshoots 1.75 band; high U arm overlaps a near-zero gap edge on lower enclosing ring. No exported geometry from this prototype."}};
const noPin=clone(d);noPin.rings[3].pins.shift();const sameHeight=clone(d);sameHeight.rings[3].y=0;sameHeight.rings[4].y=0;const narrowNoPin=clone(narrow);narrowNoPin.rings[3].pins.shift();
w.withoutRetainingPin=replay(noPin,[{part:"U",target:-.1},{part:"OL",target:100}]);
w.sameHeightAnalysis=RR.analyze(build(sameHeight).level);w.sameHeight=replay(sameHeight,[...shallow,{part:"OL",target:100}]);
w.narrowRightAfterU=[-1,1].map(dir=>probe(narrow,"OR",dir,[{part:"U",target:-4}]));
w.narrowWithoutPinRight=[-1,1].map(dir=>probe(narrowNoPin,"OR",dir,[{part:"U",target:-.1}]));
w.shallowPhase=replay(d,shallow);w.deepPhase=replay(d,prep);
w.undoLeft=[-1,1].map(dir=>probe(d,"OL",dir,[...prep,{part:"U",target:0}]));
w.leftCollision=[-1,1].map(dir=>{const b=build(d),s=RR.Solver.newSim(b.level,false),obj=s.indexOf(b.ids.OL);RR.Solver.apply(s,{obj,target:dir*360});const r=s.world.rings[obj],st=s.world.stickOf(s.indexOf(b.ids.U));return {direction:dir,angle:s.angleOf(obj),uBodyDepth:Math.max(0,st.centerline.tube+r.arc.tube-RR.M.chainDistanceToArc(st.centerline,RR.W.stickPose(st),r.arc))};});
w.narrowCollision=[-1,1].map(dir=>{const b=build(narrow),s=RR.Solver.newSim(b.level,false);RR.Solver.apply(s,{obj:s.indexOf(b.ids.U),target:-4});const obj=s.indexOf(b.ids.OR);RR.Solver.apply(s,{obj,target:dir*360});const r=s.world.rings[obj],owner=s.world.rings[s.indexOf(b.ids.IR)];return {direction:dir,angle:s.angleOf(obj),sourceBodyDepth:Math.max(0,r.arc.tube+owner.arc.tube-RR.M.arcArcDistance(r.arc,owner.arc)),solidPinQuads:owner.worldQuads.map((q,i)=>({kind:owner.quadKind[i],pinFeature:owner.quadPin[i]>=0?owner.pinFeatures[owner.quadPin[i]]:null,depth:Math.max(0,-RR.M.minSdfArcOverConvex(r.arc,q))})).filter(q=>q.kind!==RR.KIND.SENSOR)};});
w.narrowLockPoses=[0,54,90,180,270].map(angle=>{const b=build(narrow),s=RR.Solver.newSim(b.level,false);RR.Solver.apply(s,{obj:s.indexOf(b.ids.U),target:-4});const obj=s.indexOf(b.ids.OR),owner=s.world.rings[s.indexOf(b.ids.IR)];RR.Solver.apply(s,{obj,target:angle});const r=s.world.rings[obj];return {angle:s.angleOf(obj),remaining:s.remaining(),links:s.graph.active.slice(),sourceScopeEngaged:s.world.isEngaged(obj,s.indexOf(b.ids.IR),-1),sensorQuads:owner.worldQuads.map((q,i)=>({kind:owner.quadKind[i],pinFeature:owner.quadPin[i]>=0?owner.pinFeatures[owner.quadPin[i]]:null,depth:Math.max(0,-RR.M.minSdfArcOverConvex(r.arc,q))})).filter(q=>q.kind===RR.KIND.SENSOR)};});
w.narrowInterpretation="OR with gap90 can make full turns after U leaves, so failure is not a solid collision gate. The link IR pin90 -> OR uses whole-ring source scope: IR pin0 originally targeted U, but its still-present sensor can retain OR. At pose54 pin90 sensor is clear while pin0 sensor engages. Gap120 admits both sensors in one release window.";
w.finiteHeights=[2.2,2.8].map(height=>{const v=clone(d);v.rings[3].y=-height;v.rings[4].y=-height;v.sticks[0].y=-height-3.5;v.sticks[0].arm=top-v.sticks[0].y;return {height,analysis:RR.analyze(build(v).level),trace:replay(v,route),feel:replay(v,route,false,true)};});
const c={stem:"study-20261014-v35-two-enclosing-u",design:d,bombs:false,authorMoves:route,inspection:inspect(d,false,6,1000),witness:w};
fs.writeFileSync(path.join(OUT,"two-enclosing-u-study.json"),JSON.stringify({format:"rotate-two-enclosing-u-study",version:1,candidates:[c]},null,2));
console.log(JSON.stringify({inspection:c.inspection,traceSolved:w.trace.solved,feel:w.feel.solved,leftCollision:w.leftCollision,narrowLockPoses:w.narrowLockPoses,finiteHeights:w.finiteHeights.map(c=>({height:c.height,warnings:c.analysis.warnings.length,analytic:c.trace.solved,feel:c.feel.solved}))}));
