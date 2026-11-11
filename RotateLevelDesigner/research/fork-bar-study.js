"use strict";
// A rejected guide role, plus an authored-source graph audit. No Designer export.
const fs=require("fs"),path=require("path"),h=require("./ongoing-study.js");
const {RR,P,D,OUT,clone,ring,pin,design,build,inspect,probe,replay}=h;
const base=design("Một nguồn giữ hai thanh khác trục — đối chứng ngàm", "Sketch nghiên cứu: một vòng giữ pin vào hai L có passage vuông góc. Không phải mẫu giao; ngàm thêm vào chưa có thao tác phụ cần giữ thanh sống.",[
 ring("R",0,0,135,"orange",[pin(0,"V"),pin(270,"H")])
],[
 {id:"V",shape:"L",x:D,y:P/2,length:5.6,arm:1.3,angle:90,color:"blue",slideAxis:[1,0]},
 {id:"H",shape:"L",x:-P/2,y:-D,length:5.6,arm:1.3,angle:180,color:"purple",slideAxis:[1,0]}
]);
const guided=clone(base);
guided.sticks[0].guides=[{x:D,y:4.1,angle:90}];
guided.sticks[1].guides=[{x:-4.1,y:-D,angle:180}];
const short=[{part:"V",target:.6},{part:"H",target:.6}];
const long=[{part:"V",target:6},{part:"H",target:6}];
const result={format:"rotate-fork-bar-study",version:1,exported:false,base,guided,
 inspection:{base:inspect(base,false,2,400),guided:inspect(guided,false,2,400)},
 short:{base:replay(base,short),guided:replay(guided,short)},
 long:{base:replay(base,long),guided:replay(guided,long)},
 sourceAfterOne: [-1,1].map(dir=>probe(base,"R",dir,short.slice(0,1))),
 directions:[base,guided].map(d=>({guides:!!d.sticks[0].guides,parts:["V","H"].map(id=>({id,moves:[-1,1].map(dir=>probe(d,id,dir))}))})),
 decision:"Do not export another guide variant. Both bars can be pulled out independently with the same V then H recipe. Added guides retain bars after pin clearance, but no separate preparation or dependent target in this sketch requires that retained state. The no-guide fork is mechanically valid but insufficiently distinct from existing shared-retention drafts to warrant another pack.",
 limits:["No claim that guide variants are globally equivalent; only tested states and the concrete recipe are compared.","No inferred beauty or difficulty from the search result or number of parts."]};
fs.writeFileSync(path.join(OUT,"fork-bar-study.json"),JSON.stringify(result,null,2));

const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../../../LevelTrainingData/ring-lab/data/original_levels.json"))),rows=[],hist={};
for(const level of source.levels)for(const part of level.parts.filter(p=>p.ring)){
 const outgoing=level.links.filter(l=>l.sourceRingId===part.id),barLinks=outgoing.filter(l=>l.targetPartId.startsWith("slide_bar_")),targets=[...new Set(barLinks.map(l=>l.targetPartId))];
 if(!barLinks.length)continue;
 const key=String(targets.length);hist[key]=(hist[key]||0)+1;
 const targetsWithGuides=targets.filter(id=>(level.guideLinks||[]).some(g=>g.stickPartId===id));
 rows.push({level:level.id,owner:part.id,barLinkCount:barLinks.length,distinctBarTargets:targets,targetsWithGuides,otherTargets:[...new Set(outgoing.filter(l=>!l.targetPartId.startsWith("slide_bar_")).map(l=>l.targetPartId))]});
}
const forks=rows.filter(r=>r.distinctBarTargets.length>=2);
const audit={format:"rotate-fork-bar-source-audit",version:1,source:"LevelTrainingData/ring-lab/data/original_levels.json",totals:{ownersWithBarTargets:rows.length,ownersWithTwoOrMoreBarTargets:forks.length,assetsWithForks:new Set(forks.map(r=>r.level)).size,forksWithGuidedTargets:forks.filter(r=>r.targetsWithGuides.length).length},distinctBarTargetHistogram:hist,forks,limits:["Authored link occurrences, not deduplicated layouts or live contacts.","No slide axis, pin ownership in screenshots, necessity of guides or original solver route inferred."]};
fs.writeFileSync(path.join(OUT,"fork-bar-source-audit.json"),JSON.stringify(audit,null,2));
console.log(JSON.stringify({inspection:result.inspection,short:result.short,long:result.long,sourceAfterOne:result.sourceAfterOne,directions:result.directions,audit:{totals:audit.totals,hist,examples:forks.slice(0,4)}}));
