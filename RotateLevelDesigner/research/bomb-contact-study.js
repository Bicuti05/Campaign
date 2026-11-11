"use strict";
const fs=require("fs"),path=require("path"),H=require("./ongoing-study.js");
const {RR,P,OUT,clone,ring,pin,design,build,inspect,probe,replay}=H;
const d=design("Hai bom chạm nhau — điểm tiếp xúc trên vùng đang khóa",
 "Một vòng kín giữ pin vào vòng kín dưới nên không được xoay; nó mang bom ở phía trên. Vòng hở trên mang bom thứ hai, còn nhận pin từ nguồn trên cùng. Quay vòng hở CW để hai bom chạm nhau trước khi bất kỳ bom nào chạm thân vòng đối diện. Hai host bị phá, ba nguồn/đích còn lại được nhả. Bỏ một trong hai bom giữ lại vùng pin vào vòng kín: bom di chuyển không đủ gần thân để phá trực tiếp, bom cố định không thể được quay do host còn link đi ra. CCW nhả vật mang sớm và để bom tự do ở vị trí khác, chưa mở vùng kín. Đây là hành vi tiếp xúc bom/bom của engine Designer, không cơ chế Xích hoặc Booster; chưa nghiệm thu đẹp/khó và chưa đối chiếu độc lập với video gốc.",[
 ring("C",0,0,90,"red",[pin(270,"X")],{gap:0,bomb:{x:0,y:2.2,radius:.3}}),
 ring("X",0,-P,90,"orange",[],{gap:0}),
 ring("E",P,0,0,"green",[pin(180,"C")]),
 ring("R",0,P,0,"blue",[],{bomb:{x:2.2,y:P,radius:.3}}),
 ring("G",0,2*P,90,"purple",[pin(270,"R")])
]);
const noFixed=clone(d);delete noFixed.rings[0].bomb;
const noMoving=clone(d);delete noMoving.rings[3].bomb;
const inset=clone(d);inset.rings[0].bomb.y=1.7;
function contactTrace(design,target){
 const b=build(design),s=RR.Solver.newSim(b.level,true),o=s.indexOf(b.ids.R),events=[],explosions=[],original=s.explode.bind(s);
 s.explode=c=>{const result=original(c);explosions.push({contact:{...c},...result});return result;};
 RR.Solver.apply(s,{obj:o,target},(sim,x)=>{
  if(!x.bombContact)return;const q=x.bombContact,moving=sim.world.bombs.find(bomb=>bomb.host===o),fixed=sim.world.bombs.find(bomb=>bomb.host===sim.indexOf(b.ids.C));
  events.push({contact:{...q},movingBombToFixedBody:moving?RR.M.arcSdf(sim.world.rings[sim.indexOf(b.ids.C)].arc,moving.center())-moving.radius:null,fixedBombToMovingBody:fixed?RR.M.arcSdf(sim.world.rings[o].arc,fixed.center())-fixed.radius:null});
 });
 return {solved:s.allSolved(),remaining:s.remaining(),events,explosions,bombs:s.world.bombs.map(b=>({id:b.id,host:b.host,active:b.active,position:b.center()})),cMovementLocked:!s.isSolved(s.indexOf(b.ids.C))&&s.isMovementLocked(s.indexOf(b.ids.C))};
}
const b=build(d),s=RR.Solver.newSim(b.level,true),initialContacts=[];for(let o=0;o<s.objectCount();o++){const q=RR.W.bombSweep(s.world,o,s.angleOf(o),s.angleOf(o)).contact;if(q)initialContacts.push(q);}
const route=[{part:"R",target:-100}],witness={initialBombHosts:s.world.bombs.map(b=>s.idOf(b.host)),initialContacts,closedSourceMotion:[-1,1].map(x=>probe(d,"C",x,[],true)),correct:contactTrace(d,-100),wrong:contactTrace(d,100),withoutFixedBomb:inspect(noFixed,true,2,400),withoutMovingBomb:inspect(noMoving,true,2,400),fixedBombInside:inspect(inset,true,2,400),trace:replay(d,route,true),feel:replay(d,route,true,true)};
const c={stem:"study-20261013-v25-hosted-bombs-contact",design:d,bombs:true,authorMoves:route,inspection:inspect(d,true,6,1000),witness};
fs.writeFileSync(path.join(OUT,"bomb-contact-study.json"),JSON.stringify({format:"rotate-bomb-contact-study",version:1,scope:"Bomb/bomb collider contact target=-1 and explosion of both hosts, supplied engine only",candidates:[c]},null,2));
console.log(JSON.stringify({stem:c.stem,inspection:c.inspection,witness}));
