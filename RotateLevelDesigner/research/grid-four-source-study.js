"use strict";
const fs=require("fs"),path=require("path"),h=require("./ongoing-study.js");
const {RR,P,OUT,clone,ring,pin,design,build,inspect,probe,replay}=h;
const d=design("Bốn nguồn cùng giữ cửa giữa", "Cụm 3×3 gồm 9 vòng radius 1,75. Bốn nguồn nằm giữa các cạnh, mỗi nguồn giữ hai vòng góc và vòng giữa. Mở một góc hoặc cửa giữa riêng lẻ chưa nhả nguồn: cần phối hợp các cửa đang cùng giữ nguồn. Sau một nguồn rời, lựa chọn của các cửa lân cận đổi, rồi quay lại cửa giữa để xử lý nguồn khác. Không thanh/ngàm/chốt/bom/Booster/Chain; quy mô là sketch nghiên cứu, chưa chốt vị trí campaign hoặc độ khó.",[
 ring("BL",0,0,225,"orange"),
 ring("SB",P,0,270,"purple",[pin(180,"BL"),pin(0,"BR"),pin(90,"M")]),
 ring("BR",2*P,0,315,"blue"),
 ring("SL",0,P,180,"red",[pin(270,"BL"),pin(90,"TL"),pin(0,"M")]),
 ring("M",P,P,45,"sky"),
 ring("SR",2*P,P,0,"green",[pin(270,"BR"),pin(90,"TR"),pin(180,"M")]),
 ring("TL",0,2*P,135,"teal"),
 ring("ST",P,2*P,90,"navy",[pin(180,"TL"),pin(0,"TR"),pin(270,"M")]),
 ring("TR",2*P,2*P,45,"orange")
]);
const inspection=inspect(d,false,8,1800),authorMoves=[{part:"TL",target:0},{part:"TR",target:180},{part:"M",target:90},{part:"BR",target:450},{part:"TR",target:270},{part:"M",target:0},{part:"BL",target:90},{part:"TL",target:-90},{part:"M",target:180},{part:"BL",target:0},{part:"BR",target:540},{part:"M",target:270}];
const w={initialSources:["SB","SL","SR","ST"].flatMap(part=>[-1,1].map(dir=>({part,...probe(d,part,dir)}))),oneReceiverOnly:["BL","BR","M","TL","TR"].flatMap(part=>[-1,1].map(dir=>({part,...probe(d,part,dir)}))),trace:authorMoves?replay(d,authorMoves):null,feel:authorMoves?replay(d,authorMoves,false,true):null};
const release=require("./replay-until-release.js"),b=build(d);w.releaseInput=release.replay(b.level,authorMoves.map(m=>({part:b.ids[m.part],target:m.target})),false);
function phase(v,moves){const b=build(v),s=RR.Solver.newSim(b.level,false);for(const m of moves)RR.Solver.apply(s,{obj:s.indexOf(b.ids[m.part]),target:m.target});return {remaining:s.remaining(),sources:Object.fromEntries(["SB","SL","SR","ST"].map(k=>[k,{solved:s.isSolved(s.indexOf(b.ids[k])),locked:s.isMovementLocked(s.indexOf(b.ids[k]))}]))};}
const cases=[{source:"ST",corners:[{part:"TL",target:0},{part:"TR",target:180}],center:90},{source:"SR",corners:[{part:"BR",target:90},{part:"TR",target:270}],center:0},{source:"SL",corners:[{part:"BL",target:90},{part:"TL",target:270}],center:180},{source:"SB",corners:[{part:"BL",target:0},{part:"BR",target:180}],center:270}];
w.centerRoles=cases.map(x=>{const v=clone(d);v.rings.find(r=>r.id===x.source).pins=v.rings.find(r=>r.id===x.source).pins.filter(p=>p.target!=="M");return {source:x.source,twoCorners:phase(d,x.corners),threeWindows:phase(d,[...x.corners,{part:"M",target:x.center}]),withoutCenterPin:phase(v,x.corners)};});
w.cornerRoles=cases.flatMap(x=>x.corners.map(corner=>{const other=x.corners.filter(m=>m.part!==corner.part),prep=[...other,{part:"M",target:x.center}],v=clone(d);v.rings.find(r=>r.id===x.source).pins=v.rings.find(r=>r.id===x.source).pins.filter(p=>p.target!==corner.part);return {source:x.source,corner:corner.part,withoutCornerPreparation:phase(d,prep),withoutCornerPin:phase(v,prep)};}));
const c={stem:"study-20261014-v41-grid-four-source",design:d,authorMoves,inspection,witness:w,holdout:!(w.trace.solved&&w.feel.solved&&w.releaseInput.ok)};
if(require.main===module){fs.writeFileSync(path.join(OUT,"grid-four-source-study.json"),JSON.stringify({format:"rotate-grid-four-source-study",version:1,candidates:[c]},null,2));console.log(JSON.stringify({inspection,authorMoves,witness:w}));}
module.exports={d,c};
