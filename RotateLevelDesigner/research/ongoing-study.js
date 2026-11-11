"use strict";
// Local research harness. Uses the supplied Designer core without modifying it.
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js");
const OUT=path.join(__dirname,"20261013"),P=4.5854,D=2.8354;
const clone=x=>JSON.parse(JSON.stringify(x));
const ring=(id,x,y,gapDir,color,pins=[],extra={})=>({id,x,y,gapDir,color,radius:1.75,gap:90,pins,...extra});
const pin=(angle,target)=>({angle,target});
const design=(name,notes,rings,sticks=[],extra={})=>({format:"turp-design",version:1,levelId:"draft",name,author:"Codex ongoing research 20261013",notes,rings,sticks,...extra});
function build(d){return RR.Design.toLevel(d);}
function inspect(d,bombs=false,time=4,nodes=1000){try{const b=build(d),a=RR.analyze(b.level);if(a.error||a.warnings.length)return {analysis:a,solution:null};const s=RR.Solver.find(b.level,{nodeLimit:nodes,timeLimitSeconds:time,explodeBombs:bombs});return {analysis:a,solution:{...s,route:RR.Solver.describeRoute(b.level,s.moves,bombs)}};}catch(e){return {error:String(e)};}}
function replay(d,moves,bombs=false,feel=false){const b=build(d),t=RR.Tuning.defaults();t.explodeBombs=bombs;const s=feel?new RR.Simulation(b.level,t):RR.Solver.newSim(b.level,bombs),trace=[];for(const m of moves){const obj=s.indexOf(b.ids[m.part]||m.part),events=[];RR.Solver.apply(s,{obj,target:m.target},(sim,x)=>{if(x.bombContact)events.push({bomb:x.bombContact.bomb,target:x.bombContact.target>=0?sim.idOf(x.bombContact.target):null,otherBomb:x.bombContact.otherBomb>=0?sim.world.bombs[x.bombContact.otherBomb].id:null,pose:x.bombContact.pose});});trace.push({part:m.part,pointer:m.target,pose:s.isStick(obj)?s.offsetOf(obj):s.angleOf(obj),remaining:s.remaining(),links:s.graph.active.filter(Boolean).length,bindings:s.graph.bindingActive.filter(Boolean).length,solved:Array.from({length:s.objectCount()},(_,i)=>i).filter(i=>s.isSolved(i)).map(i=>s.idOf(i)),events});}return {solved:s.allSolved(),trace};}
function probe(d,id,dir,prep=[],bombs=false){const b=build(d),s=RR.Solver.newSim(b.level,bombs);for(const m of prep)RR.Solver.apply(s,{obj:s.indexOf(b.ids[m.part]||m.part),target:m.target});const obj=s.indexOf(b.ids[id]||id),start=s.isStick(obj)?s.offsetOf(obj):s.angleOf(obj);for(let i=0;i<4&&!s.isSolved(obj);i++)RR.Solver.explore(s,obj,dir);return {direction:dir,removed:s.isSolved(obj),from:start,to:s.isStick(obj)?s.offsetOf(obj):s.angleOf(obj),remaining:s.remaining(),links:s.graph.active.filter(Boolean).length};}
const candidates=[];
{
 const d=design("Rút thanh khỏi lòng vòng", "Thanh dọc đi qua khe dưới của vòng nhận pin, chặn cả hai cửa quay. Rút thanh xuống để đưa đầu thanh ra khỏi lòng vòng rồi mới xoay vòng nhận. Ngàm giữ thanh không nhận pin. Không bom/Chain/Booster; bản nghiên cứu chưa nghiệm thu bố cục hoặc độ khó.",[
  ring("R1",0,0,135,"orange",[pin(0,"R2"),pin(270,"R3")]),ring("R2",P,0,90,"blue"),
  ring("R3",0,-P,270,"green",[pin(0,"R4")]),ring("R4",P,-P,270,"purple")
 ],[{id:"S1",shape:"straight",x:P,y:-P-2.05,length:3.3,angle:90,color:"red",guides:[{x:P,y:-P-1.4,angle:90}]}]);
 const noStick=clone(d);noStick.sticks=[];
 const noGuide=clone(d);delete noGuide.sticks[0].guides;
 candidates.push({stem:"study-20261013-v6-interior-retract",design:d,inspection:inspect(d),witness:{initial:[-1,1].map(dir=>probe(d,"R4",dir)),retracted:[-1,1].map(dir=>probe(d,"R4",dir,[{part:"S1",target:-1.9}])),withoutStick:[-1,1].map(dir=>probe(noStick,"R4",dir)),barDirections:[-1,1].map(dir=>probe(d,"S1",dir)),withGuideOtherRelease:replay(d,[{part:"R2",target:150},{part:"R4",target:216}]),withoutGuideOtherRelease:replay(noGuide,[{part:"R2",target:150},{part:"R4",target:216}])}});
}
{
 const d=design("Nhả nguồn rồi đánh bom trong vòng kín", "Vòng kín nhận pin từ dưới và còn giữ pin sang phải. Nhả vòng bên phải trước để vòng kín được xoay; chốt hướng vào trong vòng quét tới bom tự do, phá vòng kín và giải phóng nguồn dưới. Bom nằm trong cụm; chốt và bom có vai trò cần đối chứng. Chỉ bom gameplay, không Booster/Chain.",[
  ring("C",0,0,90,"purple",[pin(0,"R")],{gap:0,stops:[{angle:180,length:-.8}]}),
  ring("R",P,0,90,"blue"),ring("L",0,-P,270,"orange",[pin(90,"C")])
 ],[],{bombs:[{x:-.6,y:.6,radius:.3}]});
 const noStop=clone(d);delete noStop.rings[0].stops;const noBomb=clone(d);noBomb.bombs=[];
 candidates.push({stem:"study-20261013-v6-inner-stop-bomb",design:d,bombs:true,inspection:inspect(d,true,6),witness:{closedInitially:[-1,1].map(dir=>probe(d,"C",dir,[],true)),withoutStop:inspect(noStop,true,2,400),withoutBomb:inspect(noBomb,false,2,400)}});
}
{
 const d=design("Hai cửa phải cùng nhả một nguồn", "Hai vòng nguồn mỗi vòng giữ pin vào cả hai vòng nhận. Mở một cửa chưa làm nguồn biến mất vì cửa còn lại vẫn giữ nó. Căn cửa thứ hai để nhả cùng nguồn, rồi quay lại xử lý nguồn còn lại. Hai cửa kết hợp qua các pin bình thường, không chu trình có hướng, không Chain/Booster. Bản nghiên cứu chưa nghiệm thu đẹp/khó.",[
  ring("A",0,0,135,"orange",[pin(0,"C"),pin(270,"D")]),ring("C",P,0,45,"purple"),
  ring("D",0,-P,225,"blue"),ring("B",P,-P,315,"green",[pin(90,"C"),pin(180,"D")])
 ]);
 const i=inspect(d,false,6),route=i.solution&&i.solution.route.map(m=>({part:m.part,target:m.to}));
 candidates.push({stem:"study-20261013-v6-coupled-junctions",design:d,inspection:i,witness:{routeTrace:route?replay(d,route):null,eachReceiverAlone:["C","D"].flatMap(id=>[-1,1].map(dir=>({id,...probe(d,id,dir)})))}});
}
if(require.main===module){fs.writeFileSync(path.join(OUT,"ongoing-study.json"),JSON.stringify({format:"rotate-ongoing-study",version:1,scope:"Designer only; no HTML or Unity",candidates},null,2));for(const c of candidates)console.log(JSON.stringify(c));}
module.exports={RR,P,D,OUT,clone,ring,pin,design,build,inspect,replay,probe,candidates};
