"use strict";
const fs=require("fs"),path=require("path"),h=require("./ongoing-study.js");
const {RR,P,OUT,clone,ring,pin,design,build,inspect,probe,replay}=h;
const d=design("Nổ cửa trước — mở quyền xoay bom thứ hai", "Ba vòng kín và một vòng hở nối bằng pin thường. Vòng kín K mang bom nhưng còn pin đi ra vào C nên bị khóa input. Vòng hở R nhận pin từ C, quay bom R chạm phần rắn của pin C để phá C/R trước; thân vòng C chưa chạm bom tại contact. K hết pin đi ra nhưng còn được vòng kín J giữ, nên bom K vẫn có host; lúc này K mới xoay bom tới phần rắn pin J để phá cặp kín còn lại. Hai bom nổ ở hai contact riêng, không cần ba bom chạm đồng thời, không ngàm/chốt/thanh thêm để giữ host. Không Booster/Chain. Chưa GD nghiệm thu bố cục/độ khó.",[
 ring("K",0,0,90,"orange",[pin(0,"C")],{gap:0,bomb:{x:-2.2,y:0,radius:.3}}),
 ring("C",P,0,90,"purple",[pin(90,"R")],{gap:0}),
 ring("R",P,P,180,"blue",[],{bomb:{x:P+2.2,y:P,radius:.3}}),
 ring("J",0,-P,90,"green",[pin(90,"K")],{gap:0})
]);
const first=[{part:"R",target:90}],route=[...first,{part:"K",target:180}];
function state(design,moves){
 const b=build(design),s=RR.Solver.newSim(b.level,true),events=[],explosions=[],initialContacts=[];
 for(let obj=0;obj<s.objectCount();obj++){
  const pose=s.isStick(obj)?s.offsetOf(obj):s.angleOf(obj),q=RR.W.bombSweep(s.world,obj,pose,pose).contact;
  if(q)initialContacts.push({moving:s.idOf(obj),contact:q});
 }
 const old=s.explode.bind(s);s.explode=q=>{const r=old(q);explosions.push({contact:{...q},...r});return r;};
 for(const m of moves)RR.Solver.apply(s,{obj:s.indexOf(b.ids[m.part]),target:m.target},(sim,x)=>{
  if(!x.bombContact)return;
  const q=x.bombContact,bomb=sim.world.bombs[q.bomb],target=q.target>=0?sim.world.rings[q.target]:null,center=bomb.center();
  const solidQuads=target?target.worldQuads.map((poly,i)=>({kind:target.quadKind[i],pin:target.quadPin[i]>=0?target.pinFeatures[target.quadPin[i]]:null,clearance:RR.M.distanceToPolygon(center,poly)-bomb.radius})).filter(q=>q.kind!==RR.KIND.SENSOR):[];
  events.push({part:m.part,target:q.target>=0?sim.idOf(q.target):null,otherBomb:q.otherBomb,pose:q.pose,bodyClearance:target?RR.M.arcSdf(target.arc,center)-bomb.radius:null,solidQuads});
 });
 return {initialContacts,events,explosions,solved:s.allSolved(),remaining:s.remaining(),links:s.graph.active.filter(Boolean).length,kLocked:s.isMovementLocked(s.indexOf(b.ids.K)),bombs:s.world.bombs.map(q=>({id:q.id,active:q.active,host:q.host,hostId:q.host<0?null:s.idOf(q.host),center:q.center()}))};
}
const noFirst=clone(d);delete noFirst.rings[2].bomb;
const noSecond=clone(d);delete noSecond.rings[0].bomb;
const noPrerequisitePin=clone(d);noPrerequisitePin.rings[0].pins=[];
const noRetainingPin=clone(d);noRetainingPin.rings[3].pins=[];
const noContactPin=clone(d);noContactPin.rings[1].pins=[];
const wrong=[{part:"R",target:360}];
const cases=[];
for(const shift of [-.1,-.05,.05,.1]){const v=clone(d);v.rings[2].bomb.x+=shift;v.rings[0].bomb.x-=shift;cases.push({orbit:2.2+shift,analysis:RR.analyze(build(v).level),result:state(v,route)});}
const w={initial:state(d,[]),beforeK:[-1,1].map(dir=>probe(d,"K",dir,[],true)),afterFirst:state(d,first),correct:state(d,route),trace:replay(d,route,true),feel:replay(d,route,true,true),withoutFirst:inspect(noFirst,true,2,500),withoutSecond:inspect(noSecond,true,2,500),withoutPrerequisite:state(noPrerequisitePin,[{part:"K",target:180}]),withoutRetaining:state(noRetainingPin,first),withoutContactPin:state(noContactPin,first),wrongFirst:state(d,wrong),geometryCases:cases};
const c={stem:"study-20261013-v28-sequential-ring-bombs",design:d,bombs:true,authorMoves:route,inspection:inspect(d,true,6,1000),witness:w};
fs.writeFileSync(path.join(OUT,"sequential-bomb-study.json"),JSON.stringify({format:"rotate-sequential-bomb-study",version:1,scope:"Two separate contacts unlock the second bomb host, rather than simultaneous front contact",candidates:[c]},null,2));
console.log(JSON.stringify({inspection:c.inspection,witness:{initial:w.initial,afterFirst:w.afterFirst,correct:w.correct,withoutContactPin:w.withoutContactPin,withoutFirst:w.withoutFirst,withoutSecond:w.withoutSecond,wrongFirst:w.wrongFirst,geometryCases:w.geometryCases.map(c=>({orbit:c.orbit,warnings:c.analysis.warnings.length,initialContacts:c.result.initialContacts.length,solved:c.result.solved}))}}));
