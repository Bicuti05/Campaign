"use strict";
// Three-host contact study: simultaneous contact is not a broad chain reaction.
const fs=require("fs"),path=require("path"),h=require("./ongoing-study.js");
const {RR,P,OUT,clone,ring,pin,design,build,inspect}=h;
const d=design("Mặt tiếp xúc hai bom — sketch kiểm độ phụ thuộc hình học", "Chỉ research: hai cặp vòng kín độc lập có bom cố định ở hai phía; một thanh có ngàm đưa bom vào giữa. Cần kiểm ba bom cùng tiếp xúc và sai lệch nhỏ, không xuất nếu chỉ đúng ở hình học đối xứng chính xác.",[
 ring("L",-2.3,0,90,"orange",[pin(270,"LX")],{gap:0,bomb:{x:-.4,y:1.25,radius:.3}}),
 ring("LX",-2.3,-P,90,"blue",[],{gap:0}),
 ring("R",2.3,0,90,"purple",[pin(270,"RX")],{gap:0,bomb:{x:.4,y:1.25,radius:.3}}),
 ring("RX",2.3,-P,90,"green",[],{gap:0})
],[{id:"S",shape:"straight",x:0,y:4.3,length:3.2,angle:90,color:"red",guides:[{x:0,y:3.6,angle:90}],bomb:{x:0,y:2.5,radius:.3}}]);
function run(design){
 const b=build(design),s=RR.Solver.newSim(b.level,true),events=[],explosions=[];
 const initialContacts=[];
 for(let obj=0;obj<s.objectCount();obj++){
  const pose=s.isStick(obj)?s.offsetOf(obj):s.angleOf(obj),contact=RR.W.bombSweep(s.world,obj,pose,pose).contact;
  if(contact)initialContacts.push({moving:s.idOf(obj),contact});
 }
 const old=s.explode.bind(s);s.explode=contact=>{const result=old(contact);explosions.push({contact:{...contact},...result});return result;};
 const obj=s.indexOf(b.ids.S);
 RR.Solver.apply(s,{obj,target:-1.2},(sim,x)=>{if(x.bombContact)events.push({...x.bombContact});});
 return {analysis:RR.analyze(b.level),initialContacts,events,explosions,remaining:s.remaining(),solved:s.allSolved(),barPose:s.offsetOf(obj),movementLocked:Array.from({length:s.objectCount()},(_,i)=>i).filter(i=>!s.isSolved(i)&&s.isMovementLocked(i)).map(i=>s.idOf(i)),activeBombs:s.world.bombs.map(b=>({id:b.id,active:b.active,host:b.host,center:b.center()}))};
}
const cases=[{label:"symmetric",design:d}];
for(const dy of [-.01,-.001,.001,.01]){const v=clone(d);v.rings[2].bomb.y+=dy;cases.push({label:"rightBombY"+(dy>0?"+":"")+dy,design:v});}
const noGuide=clone(d);delete noGuide.sticks[0].guides;
const noLeft=clone(d);delete noLeft.rings[0].bomb;
const noRight=clone(d);delete noRight.rings[2].bomb;
const noMoving=clone(d);delete noMoving.sticks[0].bomb;
const report={format:"rotate-multi-bomb-front-study",version:1,exported:false,design:d,
 inspection:inspect(d,true,4,600),cases:cases.map(c=>({label:c.label,result:run(c.design)})),
 ablations:{noGuide:run(noGuide),noLeft:run(noLeft),noRight:run(noRight),noMoving:run(noMoving)},
 analyticConstraint:"When only one bomb host moves, stationary bombs must initially be separated. At the first contact the moving bomb stops and is destroyed. To explode a third initially separated stationary bomb in that same event, it must also be within contact epsilon at that exact pose. Three-host propagation therefore needs simultaneous contacts here, rather than an explosion radius or a later moving bomb.",
 decision:"Rejected for delivery: the symmetric draft succeeds, but all four +/-0.001 and +/-0.01 Y perturbations leave one closed pair. Removing the guide still permits the same continuous downward drag to win, so that guide also fails the independent-role requirement in this sketch. No epsilon or tuning changed.",
 limits:["Designer engine behavior only; original gameplay bomb/bomb chaining is not independently verified.","Perturbations are four concrete counterexamples, not an exhaustive robustness estimate.","No explosion radius is added: the engine queues only bombs touching an exploding bomb at contact."]};
fs.writeFileSync(path.join(OUT,"multi-bomb-front-study.json"),JSON.stringify(report,null,2));
console.log(JSON.stringify({inspection:report.inspection,cases:report.cases.map(c=>({label:c.label,...c.result})),ablations:report.ablations}));
