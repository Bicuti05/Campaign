"use strict";
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js"),out=path.join(__dirname,"20261013"),P=4.5854,D=2.8354;
const ring=(id,x,y,gapDir,color,pins=[])=>({id,x,y,radius:1.75,gap:90,gapDir,color,pins}),pin=(angle,target)=>({angle,target});
const design=(name,notes,rings,sticks=[])=>({format:"turp-design",version:1,levelId:"draft",name,author:"Codex reference study 20261013",notes,rings,sticks});
const candidates=[];
function inspect(d,bombs=false){const b=RR.Design.toLevel(d),a=RR.analyze(b.level),s=RR.Solver.find(b.level,{nodeLimit:1000,timeLimitSeconds:6,explodeBombs:bombs});return {analysis:a,solution:{...s,route:RR.Solver.describeRoute(b.level,s.moves,bombs)}};}
function replay(d,moves,bombs=false,feel=false){const b=RR.Design.toLevel(d),t=RR.Tuning.defaults();t.explodeBombs=bombs;const s=feel?new RR.Simulation(b.level,t):RR.Solver.newSim(b.level,bombs),trace=[];for(const m of moves){const contacts=[];RR.Solver.apply(s,{obj:s.indexOf(b.ids[m.part]||m.part),target:m.target},(sim,x)=>{if(x.bombContact)contacts.push({target:sim.idOf(x.bombContact.target),pose:x.bombContact.pose});});trace.push({part:m.part,target:m.target,remaining:s.remaining(),activeLinks:s.graph.active.map((active,i)=>active?i:null).filter(i=>i!==null),solved:Array.from({length:s.objectCount()},(_,i)=>i).filter(i=>s.isSolved(i)).map(i=>s.idOf(i)),contacts});}return {solved:s.allSolved(),trace};}
function probe(d,id,dir,prep=[]){const b=RR.Design.toLevel(d),s=RR.Solver.newSim(b.level,false);for(const m of prep)RR.Solver.apply(s,{obj:s.indexOf(b.ids[m.part]),target:m.target});const obj=s.indexOf(b.ids[id]);let p;for(let attempt=0;attempt<3&&!s.isSolved(obj);attempt++)p=RR.Solver.explore(s,obj,dir);return {direction:dir,removed:s.isSolved(obj),pointerReached:Number.isNaN(p)?null:p,remaining:s.remaining()};}
{
 const top=1.75,bottom=-P-.7,rightBottom=-P-D-.5,rightTop=.7;
 const d=design("Hai thanh L — chọn cửa trái hoặc phải", "Hai thanh L tạo hai biên và chặn hai lối trượt của thanh ngang. Mở L trái thì thanh ngang ra trái; mở L phải thì ra phải. Chỉ cần mở một cửa để giải phóng thanh ngang, cửa còn lại xử lý khi dọn hết bàn. Các nhánh ngang hạn chế hướng trượt của mỗi L. Không ngàm, bom, Chain hoặc Booster. Bản nghiên cứu, chưa nghiệm thu đẹp/khó.",[
  ring("R1",0,0,90,"orange",[pin(270,"S3")]),ring("R2",P,0,90,"blue",[pin(270,"S3")]),
  ring("R3",0,-P,90,"green",[pin(180,"S1")]),ring("R4",P,-P,90,"purple",[pin(0,"S2")])
 ],[{id:"S1",shape:"L",length:top-bottom,arm:P+2*D-.8,x:-D,y:(top+bottom)/2,angle:90,color:"teal",slideAxis:[1,0]},
  {id:"S2",shape:"L",length:rightTop-rightBottom,arm:P+2*D-.8,x:P+D,y:(rightTop+rightBottom)/2,angle:270,color:"red",slideAxis:[1,0]},
  {id:"S3",shape:"straight",length:P+3.6,x:P/2,y:-D,angle:0,color:"navy"}]);
 const removeArm=(index)=>{const v=JSON.parse(JSON.stringify(d));v.sticks[index].shape="straight";delete v.sticks[index].arm;return v;};
 candidates.push({stem:"study-20261013-v5-two-l-choice",design:d,inspection:inspect(d),witness:{initialBar:[-1,1].map(dir=>probe(d,"S3",dir)),afterLeft:[-1,1].map(dir=>probe(d,"S3",dir,[{part:"S1",target:1}])),afterRight:[-1,1].map(dir=>probe(d,"S3",dir,[{part:"S2",target:5.4}])),leftRoute:replay(d,[{part:"S1",target:1},{part:"S3",target:-1.9},{part:"S3",target:-6.5},{part:"S2",target:5.4}]),rightRoute:replay(d,[{part:"S2",target:5.4},{part:"S3",target:1.9},{part:"S3",target:6.5},{part:"S1",target:1}]),leftWrongDirection:probe(d,"S1",-1),leftWithoutArm:probe(removeArm(0),"S1",-1),rightWrongDirection:probe(d,"S2",-1),rightWithoutArm:probe(removeArm(1),"S2",-1)}});
}
{
 const d=design("Ba pin hội tụ — mở từng nguồn", "Ba nguồn trái, phải, trên giữ cùng một vòng nhận pin. Khe 90 độ không nhả ba hướng cùng lúc; xoay vòng nhận để nhả từng nguồn, quan sát pin nguồn biến mất rồi tiếp tục quay. Cụm T nhỏ gọn, giữ khoảng trống phía dưới. Không thanh, ngàm, bom, chốt, Chain hoặc Booster. Bản nghiên cứu, chưa nghiệm thu đẹp/khó.",[
  ring("C",0,0,270,"purple"),ring("L",-P,0,180,"blue",[pin(0,"C")]),ring("R",P,0,0,"green",[pin(180,"C")]),ring("T",0,P,90,"orange",[pin(270,"C")])
 ]);
 const i=inspect(d);candidates.push({stem:"study-20261013-v5-three-pin-junction",design:d,inspection:i,witness:{routeTrace:replay(d,i.solution.route.map(m=>({part:m.part,target:m.to})))}});
}
{
 const d=design("Dọn hành lang rồi phá vòng pin", "Bốn vòng phía trên tạo vòng phụ thuộc pin có hướng; các vòng đang giữ pin không xoay được. Tháo vòng dưới phải để dọn hành lang, giữ thanh mang bom bằng một ngàm, rồi đẩy bom lên phá vòng giữa phải. Sau đó nhả các pin còn lại để dọn cụm trên. Đưa bom trước làm nổ vòng chắn đường và mất thanh mang bom. Bom gameplay bắt buộc, không dùng Booster hoặc Chain. Bản nghiên cứu, chưa nghiệm thu đẹp/khó.",[
  ring("R1",0,0,135,"orange",[pin(0,"R2")]),ring("R2",P,0,45,"blue",[pin(270,"R4")]),
  ring("R3",0,-P,180,"purple",[pin(90,"R1"),pin(270,"R5")]),ring("R4",P,-P,315,"green",[pin(180,"R3")]),
  ring("R5",0,-2*P,180,"blue",[pin(0,"R6")]),ring("R6",P,-2*P,90,"orange")
 ],[{id:"S1",shape:"straight",length:6.5,x:P,y:-10.85-P,angle:90,color:"red",guides:[{x:P,y:-8.5-P,angle:90}],bomb:{x:P,y:-7.6-P,radius:.45}}]);
 const i=inspect(d,true),noGuide=JSON.parse(JSON.stringify(d)),noBomb=JSON.parse(JSON.stringify(d));delete noGuide.sticks[0].guides;delete noBomb.sticks[0].bomb;
 const route=i.solution.route.map(m=>({part:m.part,target:m.to}));
 candidates.push({stem:"study-20261013-v5-bomb-breaks-pin-cycle",design:d,inspection:i,bombs:true,witness:{withoutBomb:inspect(noBomb),withoutGuide:inspect(noGuide,true),correctTrace:replay(d,route,true),wrongFirstBomb:replay(d,[{part:"S1",target:5.3},...route.filter(m=>m.part!=="slide_bar_1")],true),guideRemovedSameRoute:replay(noGuide,route,true)}});
}
const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../../../LevelTrainingData/ring-lab/data/original_levels.json"),"utf8"));
const audit={ringTargets:0,incomingSourceCounts:{},threeOrMoreExamples:[],limits:"Counts authored distinct source owners, not live lock states, player difficulty or deduplicated campaign levels."};
for(const l of source.levels)for(const p of l.parts.filter(p=>p.ring)){const n=new Set(l.links.filter(x=>x.targetPartId===p.id).map(x=>x.sourceRingId)).size;audit.ringTargets++;audit.incomingSourceCounts[n]=(audit.incomingSourceCounts[n]||0)+1;if(n>=3&&audit.threeOrMoreExamples.length<8)audit.threeOrMoreExamples.push({asset:l.id,ring:p.id,sources:n});}
const report={format:"rotate-phase-two-study",version:1,scope:"Designer engine only; no Unity or new HTML",incomingSourceAudit:audit,candidates};fs.writeFileSync(path.join(out,"phase-two-study.json"),JSON.stringify(report,null,2));
console.log(JSON.stringify(audit));for(const c of candidates)console.log(JSON.stringify({stem:c.stem,found:c.inspection.solution.found,log:c.inspection.solution.log,analysis:c.inspection.analysis,route:c.inspection.solution.route,witness:c.witness}));
