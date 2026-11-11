"use strict";
// Research only, using the supplied Designer engine. No Unity replay or HTML.
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js");
const out=path.join(__dirname,"20261013"),P=4.5854,D=2.8354;
const ring=(id,x,y,gapDir,color,pins=[],extra={})=>({id,x,y,gapDir,color,radius:1.75,gap:90,pins,...extra});
const pin=(angle,target)=>({angle,target});
const base=(name,notes,rings,sticks=[])=>({format:"turp-design",version:1,levelId:"draft",name,author:"Codex reference study 20261013",notes,rings,sticks});
function inspect(design,bombs=false,seconds=8){const b=RR.Design.toLevel(design),a=RR.analyze(b.level),s=RR.Solver.find(b.level,{nodeLimit:1200,timeLimitSeconds:seconds,explodeBombs:bombs});return {analysis:a,solution:{...s,route:RR.Solver.describeRoute(b.level,s.moves,bombs)},ids:b.ids};}
function probe(design,id,dir,prep=[]){const b=RR.Design.toLevel(design),s=RR.Solver.newSim(b.level,false);for(const m of prep)RR.Solver.apply(s,{obj:s.indexOf(b.ids[m.part]),target:m.target});const obj=s.indexOf(b.ids[id]),v=RR.Solver.explore(s,obj,dir);return {direction:dir,pointerReached:Number.isNaN(v)?null:v,removed:s.isSolved(obj),remaining:s.remaining(),activeLinks:s.graph.active.filter(Boolean).length,gateRemoved:!!(b.ids.S1&&s.isSolved(s.indexOf(b.ids.S1)))};}
const candidates=[];
{
 const top=1.75,bottom=-P-.7;
 const d=base("Thanh L nhấc mái để mở cửa xoay", "Nhận ra nhánh ngang của L chặn cửa xoay vòng trên phải. Nhấc L một đoạn để mở cửa, dù L vẫn còn được pin giữ; sau đó xoay vòng nhận pin và tiếp tục tháo các liên kết. Đối chứng bỏ riêng nhánh ngang phải mở được cửa ngay. Không ngàm, bom, Chain hoặc Booster. Bản nghiên cứu, chưa nghiệm thu đẹp/khó.",[
  ring("R1",0,0,90,"orange",[pin(180,"S1"),pin(0,"R2")]),ring("R2",P,0,90,"blue"),
  ring("R3",0,-P,270,"purple",[pin(180,"S1"),pin(0,"R4")]),ring("R4",P,-P,270,"green")
 ],[{id:"S1",shape:"L",length:top-bottom,arm:D+P+2.2,x:-D,y:(top+bottom)/2,angle:90,color:"red",slideAxis:[1,0]}]);
 const variant=JSON.parse(JSON.stringify(d));variant.sticks[0].shape="straight";delete variant.sticks[0].arm;
 candidates.push({stem:"study-20261013-v4-l-lifts-roof",design:d,inspection:inspect(d),witness:{type:"L arm changes access before full bar removal",initial:[-1,1].map(dir=>probe(d,"R2",dir)),afterPreparation:[-1,1].map(dir=>probe(d,"R2",dir,[{part:"S1",target:1}])),armRemoved:[-1,1].map(dir=>probe(variant,"R2",dir))}});
}
{
 const d=base("Chốt chặn chọn hướng quay", "Chốt trên vòng trên phải chặn hướng CCW vào phía vòng nguồn, nhưng để mở hướng CW. Nhận ra hướng quay còn lại thay vì kéo mãi vào phía bị chặn. Bỏ riêng chốt phải mở lại hướng CCW. Cặp dưới tạo nhánh độc lập có liên kết cùng cụm, không dùng ngàm/bom/Chain/Booster. Bản nghiên cứu, chưa nghiệm thu đẹp/khó.",[
  ring("R1",0,0,135,"orange",[pin(0,"R2"),pin(270,"R3")]),ring("R2",P,0,270,"blue",[],{stops:[{angle:90,length:.8}]}),
  ring("R3",0,-P,270,"green",[pin(0,"R4")]),ring("R4",P,-P,90,"purple")
 ]);
 const variant=JSON.parse(JSON.stringify(d));delete variant.rings[1].stops;
 candidates.push({stem:"study-20261013-v4-stop-selects-direction",design:d,inspection:inspect(d),witness:{type:"Stop removes one release direction",withStop:[-1,1].map(dir=>probe(d,"R2",dir)),withoutStop:[-1,1].map(dir=>probe(variant,"R2",dir))}});
}
{
 const d=base("Dọn đường cho bom đến vòng kín", "Vòng kín trên phải nhận pin nên không thể căn khe để nhả. Phải tháo vòng dưới phải để mở hành lang, sau đó đẩy thanh mang bom lên chạm vòng kín. Đẩy bom trước sẽ nổ vào vòng chắn đường và mất công cụ mở vòng kín. Ngàm giữ thanh trong lúc dọn đường; bỏ ngàm làm thanh tự tháo khi cập nhật sau thao tác chuẩn bị. Chỉ giải được bằng bom gameplay, không dùng Booster/Chain. Bản nghiên cứu có bom, chưa nghiệm thu đẹp/khó.",[
  ring("R1",P,0,90,"purple",[],{gap:0}),ring("R2",0,0,135,"orange",[pin(0,"R1"),pin(270,"R3")]),
  ring("R3",0,-P,180,"green",[pin(0,"R4")]),ring("R4",P,-P,90,"blue")
 ],[{id:"S1",shape:"straight",length:6.5,x:P,y:-10.85,angle:90,color:"red",guides:[{x:P,y:-8.5,angle:90}],bomb:{x:P,y:-7.6,radius:.45}}]);
 const noBomb=JSON.parse(JSON.stringify(d));delete noBomb.sticks[0].bomb;
 const open=JSON.parse(JSON.stringify(d));open.rings[0].gap=90;
 const noGuide=JSON.parse(JSON.stringify(d));delete noGuide.sticks[0].guides;
 candidates.push({stem:"study-20261013-v4-clear-bomb-corridor",design:d,inspection:inspect(d,true,30),witness:{type:"Closed receiver and bomb delivery corridor",withoutBomb:inspect(noBomb,false),openReceiverWithoutExplosion:inspect(open,false),withoutGuide:inspect(noGuide,true)}});
}
const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../../../LevelTrainingData/ring-lab/data/original_levels.json"),"utf8"));
const audit={assets:source.levels.length,attachmentTypes:{},featurePrefixes:{},closedRings:0,closedIncoming:0,closedOutgoingOnly:0,closedNoAuthoredLinks:0,closedMixed:0,examples:[]};
for(const l of source.levels){for(const f of l.features){const k=f.id.split("_")[0];audit.featurePrefixes[k]=(audit.featurePrefixes[k]||0)+1;}for(const r of l.parts.filter(p=>p.ring)){for(const a of r.ring.attachments||[])audit.attachmentTypes[a.type]=(audit.attachmentTypes[a.type]||0)+1;if(Number(r.partData.GapAngleDeg)!==0)continue;audit.closedRings++;const incoming=l.links.filter(x=>x.targetPartId===r.id).length,outgoing=l.links.filter(x=>x.sourceRingId===r.id).length;if(incoming)audit.closedIncoming++;if(outgoing&&!incoming)audit.closedOutgoingOnly++;if(!incoming&&!outgoing)audit.closedNoAuthoredLinks++;if(incoming&&outgoing)audit.closedMixed++;if(audit.examples.length<8)audit.examples.push({asset:l.id,ring:r.id,incoming,outgoing,meshGap:r.ring.gapAngle});}}
const report={format:"rotate-other-families-study",version:1,verificationScope:"Designer analytic engine only, per user instruction; no Unity replay",sourceAudit:audit,candidates};
fs.writeFileSync(path.join(out,"other-families-study.json"),JSON.stringify(report,null,2));
console.log(JSON.stringify(audit));for(const c of candidates)console.log(JSON.stringify({stem:c.stem,warnings:c.inspection.analysis.warnings,error:c.inspection.analysis.error,found:c.inspection.solution.found,route:c.inspection.solution.route,witness:c.witness}));
