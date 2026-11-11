"use strict";
const fs=require("fs"),path=require("path"),h=require("./ongoing-study.js");
const {RR,P,OUT,clone,ring,pin,design,build,inspect,probe,replay}=h;
function make(length=2.6){return design("Bom đầu dỡ cửa hình học cho bom sau", "Thăm dò: K đã được phép xoay từ pose đầu, nhưng chốt K nằm trong khe M và bị thân M chặn đường tới bom thứ hai. R dùng bom phá M trước; không đổi luật nổ, không Booster/Chain. Chưa đủ proof để xuất.",[
 ring("K",0,0,90,"orange",[],{gap:0,stops:[{angle:0,length}],bomb:{x:-2.2,y:0,radius:.3}}),
 ring("M",P,0,180,"purple",[pin(90,"R")]),
 ring("R",P,P,180,"blue",[],{bomb:{x:P+2.2,y:P,radius:.3}}),
 ring("J",0,-P,90,"green",[pin(90,"K")],{gap:0}),
 ring("N",P,-P,90,"teal",[pin(90,"M")],{gap:0})
]);}
function makeNested(length=2,radius=5.3354){const a=P/2,external=radius+1.75+1.0854;return design("Phá vỏ lớn — mở đường bom trong lòng", "Vòng lớn kín M bao quanh hai vòng nhỏ kín K/J. K không có pin đi ra nên được xoay từ đầu, nhưng chốt K bị vỏ M chặn đường tới bom J. R bên trên mang bom phá pin/vỏ M; N giữ M sống khi R nhả nhầm khe. Sau khi M biến mất, K quay bom phá J. Hai lần nổ gameplay riêng, không Booster/Chain. Nhóm nghiên cứu vòng lớn/nhỏ; chưa GD nghiệm thu bố cục/độ khó.",[
 ring("K",-a,0,90,"orange",[],{gap:0,stops:[{angle:270,length}],bomb:{x:-a,y:2.2,radius:.3}}),
 ring("M",0,0,90,"purple",[pin(90,"R")],{gap:0,radius}),
 ring("R",0,external,180,"blue",[],{bomb:{x:2.2,y:external,radius:.3}}),
 ring("J",a,0,90,"green",[pin(180,"K")],{gap:0}),
 ring("N",0,-external,90,"teal",[pin(90,"M")],{gap:0})
 ]);}
function state(d,moves=[]){const b=build(d),s=RR.Solver.newSim(b.level,true),events=[],explosions=[],initialContacts=[];
 for(let obj=0;obj<s.objectCount();obj++){const pose=s.angleOf(obj),q=RR.W.bombSweep(s.world,obj,pose,pose).contact;if(q)initialContacts.push({moving:s.idOf(obj),contact:q});}
 const old=s.explode.bind(s);s.explode=q=>{const r=old(q);explosions.push({contact:{...q},...r});return r;};
 for(const m of moves)RR.Solver.apply(s,{obj:s.indexOf(b.ids[m.part]),target:m.target},(sim,x)=>{if(!x.bombContact)return;const q=x.bombContact,target=q.target>=0?sim.world.rings[q.target]:null,bomb=sim.world.bombs[q.bomb],center=bomb.center();events.push({part:m.part,target:q.target>=0?sim.idOf(q.target):null,otherBomb:q.otherBomb,pose:q.pose,bodyClearance:target?RR.M.arcSdf(target.arc,center)-bomb.radius:null,solidQuads:target?target.worldQuads.map((poly,i)=>({kind:target.quadKind[i],clearance:RR.M.distanceToPolygon(center,poly)-bomb.radius})).filter(q=>q.kind!==RR.KIND.SENSOR):[]});});
 return {initialContacts,events,explosions,solved:s.allSolved(),remaining:s.remaining(),links:s.graph.active.filter(Boolean).length,kLocked:s.isMovementLocked(s.indexOf(b.ids.K)),angles:Object.fromEntries(Object.entries(b.ids).map(([label,id])=>[label,s.angleOf(s.indexOf(id))])),solvedParts:Array.from({length:s.objectCount()},(_,i)=>i).filter(i=>s.isSolved(i)).map(i=>s.idOf(i)),bombs:s.world.bombs.map(q=>({id:q.id,active:q.active,host:q.host,hostId:q.host<0?null:s.idOf(q.host),center:q.center()}))};}
function stopCollision(d,dir){const b=build(d),s=RR.Solver.newSim(b.level,true),obj=s.indexOf(b.ids.K);RR.Solver.apply(s,{obj,target:90+dir*360});const k=s.world.rings[obj],quad=k.worldQuads[k.quadKind.findIndex(q=>q===RR.KIND.STOP)];return {direction:dir,angle:s.angleOf(obj),obstacles:["M","J"].map(label=>{const m=s.world.rings[s.indexOf(b.ids[label])];return {label,bodyDepth:Math.max(0,-RR.M.minSdfArcOverConvex(m.arc,quad)),pinDepth:Math.max(0,...m.worldQuads.filter((_,i)=>m.quadKind[i]!==RR.KIND.SENSOR).map(q=>RR.M.satDepth(quad,q)))};})};}
const first=[{part:"R",target:90}],route=[...first,{part:"K",target:180}];
if(require.main===module){
 const trials=[2,2.3,2.6,2.9,3.2].map(length=>{const d=make(length),a=RR.analyze(build(d).level);return {length,analysis:a,initial:state(d),beforeK:[-1,1].map(dir=>probe(d,"K",dir,[],true)),correct:state(d,route)};});
 const d=make(2),noStop=clone(d),noFirst=clone(d),noSecond=clone(d),noGateRetaining=clone(d),noKRetaining=clone(d),noContactPin=clone(d);
 delete noStop.rings[0].stops;delete noFirst.rings[2].bomb;delete noSecond.rings[0].bomb;noGateRetaining.rings[4].pins=[];noKRetaining.rings[3].pins=[];noContactPin.rings[1].pins=[];
 const w={initial:state(d),beforeK:[-1,1].map(dir=>probe(d,"K",dir,[],true)),stopCollision:[-1,1].map(dir=>stopCollision(d,dir)),afterFirst:state(d,first),correct:state(d,route),trace:replay(d,route,true),feel:replay(d,route,true,true),withoutStopSecondFirst:state(noStop,[{part:"K",target:180}]),withoutFirst:inspect(noFirst,true,6,1000),withoutSecond:inspect(noSecond,true,4,1000),withoutGateRetaining:state(noGateRetaining,[{part:"R",target:360},{part:"K",target:180}]),withoutKRetaining:state(noKRetaining,first),withoutContactPin:inspect(noContactPin,true,4,1000),wrongFirst:state(d,[{part:"R",target:360}]),afterWrongM:[-1,1].map(dir=>probe(d,"M",dir,[{part:"R",target:360}],true)),afterWrongK:[-1,1].map(dir=>probe(d,"K",dir,[{part:"R",target:360}],true)),geometryCases:trials};
 const c={stem:"study-20261014-v32-bomb-opens-physical-door",design:d,bombs:true,holdout:true,holdoutReason:"Removing first bomb still solves by rotating M to move its gap away from K stop; first bomb does not enforce the intended prerequisite",authorMoves:route,inspection:inspect(d,true,6,1000),witness:w};
 const nested=makeNested(),second=[{part:"K",target:0}],nestedRoute=[...first,...second],nNoStop=clone(nested),nNoFirst=clone(nested),nNoSecond=clone(nested),nNoGateRetaining=clone(nested),nNoKRetaining=clone(nested),nNoContactPin=clone(nested);
 delete nNoStop.rings[0].stops;delete nNoFirst.rings[2].bomb;delete nNoSecond.rings[0].bomb;nNoGateRetaining.rings[4].pins=[];nNoKRetaining.rings[3].pins=[];nNoContactPin.rings[1].pins=[];
 const nw={initial:state(nested),beforeK:[-1,1].map(dir=>probe(nested,"K",dir,[],true)),stopCollision:[-1,1].map(dir=>stopCollision(nested,dir)),afterFirst:state(nested,first),correct:state(nested,nestedRoute),trace:replay(nested,nestedRoute,true),feel:replay(nested,nestedRoute,true,true),withoutStopSecondFirst:state(nNoStop,second),withoutFirst:inspect(nNoFirst,true,2,500),withoutSecond:inspect(nNoSecond,true,2,500),withoutGateRetaining:state(nNoGateRetaining,[{part:"R",target:360},...second]),withoutKRetaining:state(nNoKRetaining,first),withoutContactPin:state(nNoContactPin,first),wrongFirst:state(nested,[{part:"R",target:360}]),afterWrongM:[-1,1].map(dir=>probe(nested,"M",dir,[{part:"R",target:360}],true)),afterWrongK:[-1,1].map(dir=>probe(nested,"K",dir,[{part:"R",target:360}],true)),geometryCases:[1.8,2,2.2].map(length=>{const v=makeNested(length);return {length,analysis:RR.analyze(build(v).level),initial:state(v),beforeK:[-1,1].map(dir=>probe(v,"K",dir,[],true)),correct:state(v,nestedRoute)};}),closedShellBombClearance:5.3354-.25-(P/2+2.2+.3)};
 nw.afterFirstK=[-1,1].map(dir=>probe(nested,"K",dir,first,true));
 nw.withoutStopK=[-1,1].map(dir=>probe(nNoStop,"K",dir,[],true));
 nw.closedShellPinBombClearance=5.3354-(P/2+2.2+.3);
 nw.withoutFirstInvariant="Closed M retains fixed incoming pin N. K bomb orbit stays wholly inside M: body clearance >=0.2927 and outward pin clearance >=0.5427 for all M angles. J/K bomb can remove only the inner pair; R has no bomb. M/N therefore cannot auto-remove or explode.";
 nw.withoutSecondInvariant="Closed K retains fixed incoming pin J. J cannot rotate while its outgoing pin is active. R bomb is outside the enclosing shell and never reaches the inner pair, and is consumed with M. Neither inner closed part has a bomb after removing K bomb.";
 const nc={stem:"study-20261014-v33-bomb-clears-enclosing-ring",design:nested,bombs:true,authorMoves:nestedRoute,inspection:inspect(nested,true,6,1000),witness:nw};
 fs.writeFileSync(path.join(OUT,"bomb-geometry-door-study.json"),JSON.stringify({format:"rotate-bomb-geometry-door-study",version:1,scope:"First explosion removes physical blocker; second host input was already unlocked",candidates:[c,nc]},null,2));
 console.log(JSON.stringify({openDoor:{heldOut:c.holdout,withoutFirstFound:w.withoutFirst.solution.found},nestedDoor:{inspection:nc.inspection,initialContacts:nw.initial.initialContacts,kLocked:nw.initial.kLocked,beforeK:nw.beforeK,stopCollision:nw.stopCollision,afterFirstK:nw.afterFirstK,withoutStopK:nw.withoutStopK,withoutFirst:nw.withoutFirst.solution,withoutSecond:nw.withoutSecond.solution,solved:nw.correct.solved,feel:nw.feel.solved}}));
}
module.exports={make,makeNested,state,first,route};
