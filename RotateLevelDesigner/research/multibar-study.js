"use strict";
// Bounded joint layout/mechanics study. No core, campaign or HTML changes.
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js");
const P=4.5854,D=2.8354,out=path.join(__dirname,"20261013");
const base=(name,notes)=>({format:"turp-design",version:1,levelId:"draft",name,author:"Codex reference study 20261013",notes,rings:[],sticks:[]});
const ring=(id,col,row,gapDir,color,pins)=>({id,x:col*P,y:-row*P,radius:1.75,gap:90,gapDir,color,pins});
const pin=(angle,target)=>({angle,target});
const drafts=[];
{
 const d=base("Khung U mở đường cho thanh ngang — ba hàng", "Ý tưởng cần nhận ra: khung U giữ các pin bên hông và chặn hai lối trượt của thanh ngang. Kéo U xuống để mở đường ngang; sau đó mới dịch thanh ngang và tháo cặp vòng dưới. Hai thanh có vai trò khác nhau. Không ngàm, Chain, bom hoặc Booster. Bản nghiên cứu, chưa nghiệm thu đẹp/khó.");
 d.rings=[ring("R1",0,0,0,"orange",[pin(180,"S1")]),ring("R2",1,0,180,"blue",[pin(0,"S1")]),
  ring("R3",0,1,45,"purple",[pin(180,"S1"),pin(270,"S2")]),ring("R4",1,1,135,"green",[pin(0,"S1"),pin(270,"S2")]),
  ring("R5",0,2,90,"blue",[pin(180,"S1"),pin(0,"R6")]),ring("R6",1,2,90,"orange",[pin(0,"S1")])];
 const bottom=-2*P-D-.5;
 d.sticks=[{id:"S1",shape:"U",length:P+2*D,arm:-bottom+.7,x:P/2,y:bottom,angle:0,color:"red",slideAxis:[0,1]},
  {id:"S2",shape:"straight",length:P+3.6,x:P/2,y:-P-D,angle:0,color:"teal"}];
 drafts.push({stem:"study-20261013-v3-u-gates-divider",design:d,gate:"S1",bar:"S2",counterfactual:"remove_gate"});
}
{
 const d=base("Ngàm giữ khung không có pin — mở đường ngang", "Ý tưởng cần nhận ra: thanh ngang được hai pin giữ; khung U ngoài không nhận pin nên cần đúng một ngàm để tồn tại và chặn hai lối trượt ngang. Trượt khung U xuống khỏi ngàm, mở đường cho thanh ngang; rồi tháo cặp vòng dưới. Đối chứng bỏ ngàm phải cho phép thanh ngang đi trước mà không kéo U. Không Chain, bom hoặc Booster. Bản nghiên cứu, chưa nghiệm thu đẹp/khó.");
 d.rings=[ring("R1",0,0,90,"orange",[pin(270,"S2")]),ring("R2",1,0,90,"purple",[pin(270,"S2")]),
  ring("R3",0,1,90,"green",[pin(0,"R4")]),ring("R4",1,1,90,"blue",[])];
 d.sticks=[{id:"S1",shape:"U",length:P+2*D,arm:P+D+.7,x:P/2,y:-P-D,angle:0,color:"blue",slideAxis:[0,1],guides:[{id:"G1",x:-D,y:0.2,angle:90}]},
  {id:"S2",shape:"straight",length:P+3.6,x:P/2,y:-D,angle:0,color:"red"}];
 drafts.push({stem:"study-20261013-v3-guide-holds-frame",design:d,gate:"S1",bar:"S2",counterfactual:"remove_guide"});
}
function removeGate(d){d=JSON.parse(JSON.stringify(d));d.sticks=d.sticks.filter(s=>s.id!=="S1");for(const r of d.rings)r.pins=r.pins.filter(p=>p.target!=="S1");return d;}
function probe(d,barId,prep=[]){const b=RR.Design.toLevel(d),results=[];for(const dir of [-1,1]){const s=RR.Solver.newSim(b.level,false);for(const m of prep)RR.Solver.apply(s,{obj:s.indexOf(b.ids[m.part]),target:m.target});const obj=s.indexOf(b.ids[barId]);let reached;for(let attempt=0;attempt<3&&!s.isSolved(obj);attempt++)reached=RR.Solver.explore(s,obj,dir);results.push({direction:dir,pointerReached:Number.isNaN(reached)?null:reached,offset:s.offsetOf(obj),barRemoved:s.isSolved(obj),solvedObjects:Array.from({length:s.objectCount()},(_,i)=>i).filter(i=>s.isSolved(i)).map(i=>s.idOf(i))});}return results;}
const report={format:"rotate-multibar-study",version:1,drafts:[]};
const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../../../LevelTrainingData/ring-lab/data/original_levels.json"),"utf8"));
const counts={},examples={};let bars=0;
for(const l of source.levels){const guides=new Set((l.guideLinks||[]).map(g=>g.stickPartId)),targets=new Set(l.links.map(p=>p.targetPartId));for(const p of l.parts.filter(p=>p.id.startsWith("slide_bar"))){bars++;const key=(targets.has(p.id)?"authored_pin":"no_authored_pin")+"+"+(guides.has(p.id)?"guide":"no_guide");counts[key]=(counts[key]||0)+1;(examples[key]||(examples[key]=[]));if(examples[key].length<8)examples[key].push({asset:l.id,part:p.id});}}
report.sourceRetentionAudit={source:"LevelTrainingData/ring-lab/data/original_levels.json",assets:source.levels.length,bars,counts,examples,limits:["Counts authored relation references, not verified physical contacts or solutions.","Resource assets may repeat layouts; not a deduplicated campaign sample.","The 30 pin-and-guide bars need individual role review; no universal prohibition."]};
for(const x of drafts){const built=RR.Design.toLevel(x.design),a=RR.analyze(built.level),sol=RR.Solver.find(built.level,{nodeLimit:1500,timeLimitSeconds:15,explodeBombs:false});
 const variant=x.counterfactual==="remove_gate"?removeGate(x.design):JSON.parse(JSON.stringify(x.design));if(x.counterfactual==="remove_guide")delete variant.sticks[0].guides;
 const pins=x.design.rings.flatMap(r=>r.pins.map(p=>({owner:r.id,angle:p.angle,logicMargin:Math.abs(((p.angle-r.gapDir+180)%360+360)%360-180)-45})));
 const initial=probe(x.design,x.bar),without=probe(variant,x.bar),gateMoves=sol.moves.filter(m=>m.obj===built.level.parts.filter(p=>p.kind==="ring").length).map(m=>({part:"S1",target:m.target}));
 const after=probe(x.design,x.bar,gateMoves);
 const row={stem:x.stem,design:x.design,analysis:a,found:sol.found,log:sol.log,route:RR.Solver.describeRoute(built.level,sol.moves,false),moves:sol.moves,pinMargins:pins,initialBarProbes:initial,counterfactual:x.counterfactual,counterfactualBarProbes:without,afterGateProbes:after};
 report.drafts.push(row);console.log(JSON.stringify({...row,design:undefined,analysis:{error:a.error,warnings:a.warnings},moves:undefined,pinMargins:undefined}));
}
fs.writeFileSync(path.join(out,"multibar-study.json"),JSON.stringify(report,null,2));
