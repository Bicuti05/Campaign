// Bounded proof of concept: spatial role and mechanical contacts are planned together.
// Uses the existing builder/probe/solver; does not change gameplay or campaign files.
// Run: node research/joint-poc.js. Outputs are isolated from levels/ until accepted.
"use strict";
const fs = require("fs"), path = require("path");
const RR = require("../rr-core.js");
const OUT = path.join(__dirname, "20261013");
fs.mkdirSync(OUT, {recursive: true});
const P = RR.C.layout.PITCH, D = RR.C.authoring.RING_RADIUS + RR.C.authoring.RING_BAND_HALF + RR.C.authoring.PIN_OFFSET_FROM_OUTER;
const SEED = 131026;
const clone = x => JSON.parse(JSON.stringify(x));
function ring(id, x, y, gapDir, color, pins = []) { return {id,x,y,gapDir,radius:1.75,gap:90,color,pins}; }
function pin(angle, target) { return {angle, target}; }
function base(name, notes, rings, sticks) { return {format:"turp-design",version:1,levelId:"draft",name,author:"Codex reference study 20261013",notes,rings,sticks}; }

function divider(gap) {
  return base("Thanh ngang chia hai hàng", "ref_028/ref_041: thanh là đường phân vùng và vật cản. Trượt thanh để nhả hai vòng trên; thanh còn hiện diện chặn hai hướng quay trực tiếp của vòng dưới bên phải. Sau khi thanh rời đi, quay vòng đó để nhả pin ngang. Vòng radius 1.75; không Booster/Chain/bom.", [
    ring("R1",0,0,135,"orange",[pin(270,"S1")]),
    ring("R2",P,0,45,"purple",[pin(270,"S1")]),
    ring("R3",0,-P,90,"green",[pin(0,"R4")]),
    ring("R4",P,-P,90,"blue")
  ], [{id:"S1",shape:"straight",length:P+3.6,x:P/2,y:-D,angle:0,color:"red",guides:[{x:P+1.05,y:-D,angle:0}]}]);
}
function corner(gap) {
  const bottom = -P-0.7, top = D, length = top-bottom;
  return base("Thanh L giữ biên trên–trái", "ref_019/ref_052: thanh L tổ chức hai cạnh của cùng một vùng vòng. Thanh là nguồn khóa chung của hai pin bên trái, phải kéo lên; ngàm giữ thanh sau khi pin rời. Vòng dưới phải nhận hai pin từ hai hướng, nhả một pin trước rồi đổi pose để nhả pin còn lại. Không giả định đẹp/khó từ solver.", [
    ring("R1",0,0,gap,"orange",[pin(180,"S1")]),
    ring("R2",P,0,225,"blue",[pin(270,"R4")]),
    ring("R3",0,-P,270,"purple",[pin(180,"S1"),pin(0,"R4")]),
    ring("R4",P,-P,270,"green")
  ], [{id:"S1",shape:"L",length,arm:P+D+0.8,x:-D,y:(top+bottom)/2,angle:90,color:"red",guides:[{x:-D,y:1.8,angle:90}]}]);
}
function frame(gap) {
  const bottom = -P-D;
  return base("Thanh U bao hai tầng vòng", "ref_018/ref_041: U là biên trái–dưới–phải quanh cụm, đồng thời giữ bốn pin. Trượt xuống nhả tầng trên rồi tầng dưới; vòng trên phải còn giữ vòng dưới phải nên cần xử lý phụ thuộc sau khi nguồn U mở. Ngàm giữ U cho tới khi rời hành lang.", [
    ring("R1",0,0,gap,"blue",[pin(180,"S1")]),
    ring("R2",P,0,45,"orange",[pin(0,"S1"),pin(270,"R4")]),
    ring("R3",0,-P,270,"green",[pin(180,"S1")]),
    ring("R4",P,-P,270,"purple",[pin(0,"S1")])
  ], [{id:"S1",shape:"U",length:P+2*D,arm:P+D+0.7,x:P/2,y:bottom,angle:0,color:"red",guides:[{x:-D,y:bottom+1.7,angle:90}]}]);
}

function solve(level, seconds = 4) {return RR.Solver.find(level,{nodeLimit:600,timeLimitSeconds:seconds,explodeBombs:false});}
function summary(level) {
  const a=RR.analyze(level);
  return {error:a.error||null,warnings:a.warnings||[],info:a.info};
}
function replayFeel(level, moves) {
  const t=RR.Tuning.defaults(), s=new RR.Simulation(level,t), rows=[];
  for(const m of moves) {
    const id=s.idOf(m.obj), before=s.remaining();
    RR.Solver.apply(s,m);
    rows.push({part:id,target:m.target,pose:s.isStick(m.obj)?s.offsetOf(m.obj):s.angleOf(m.obj),remaining:s.remaining(),removed:before-s.remaining()});
  }
  return {solved:s.allSolved(),remaining:s.remaining(),steps:rows};
}
function comfortableMoves(level, moves) {
  // The search stops at the first tiny unlock window with feel off. Extend only
  // the pointer travel in the SAME direction, then prove the whole route again.
  // A locked target still stops by collision; no geometry/tuning is loosened.
  const ref=RR.Solver.newSim(level,false), directions=[];
  for(const m of moves) {directions.push(Math.sign(m.target-(ref.isStick(m.obj)?ref.offsetOf(m.obj):ref.angleOf(m.obj))));RR.Solver.apply(ref,m);}
  for(const pad of [6,15,30,60]) {
    const expanded=moves.map((m,i)=>({obj:m.obj,target:m.target+(ref.isStick(m.obj)?0:directions[i]*pad)}));
    const feel=replayFeel(level,expanded), analytic=RR.Solver.replay(level,expanded,false).allSolved();
    if(feel.solved&&analytic) return {moves:expanded,pointerExtensionDegrees:pad,feel};
  }
  return null;
}
function graph(level) {
  return {mechanical:{nodes:level.parts.map(p=>({id:p.partId,kind:p.kind})),pinLinks:level.links,guideLinks:level.guideLinks||[]},
    visual:{relations:[],confidence:"intent_hypothesis_not_human_accepted"}};
}
function routeWithIds(level, result) {
  const s=RR.Solver.newSim(level,false);
  return result.moves.map(m=>({part:s.idOf(m.obj),target:m.target}));
}
function ablations(design, result) {
  const changes=[];
  for(const stick of design.sticks||[]) {
    const noStick=clone(design);noStick.sticks=noStick.sticks.filter(s=>s.id!==stick.id);
    noStick.rings.forEach(r=>(r.pins||[]).forEach(p=>{if(p.target===stick.id) delete p.target;if(p.targets) p.targets=p.targets.filter(id=>id!==stick.id);}));
    changes.push({special:stick.id,type:"stick",design:noStick});
    (stick.guides||[]).forEach((_,i)=>{const d=clone(design);d.sticks.find(s=>s.id===stick.id).guides.splice(i,1);changes.push({special:stick.id+"/guide"+i,type:"guide",design:d});});
  }
  const baseLevel=RR.Design.toLevel(design).level;
  return changes.map(c=>{
    try {
      const l=RR.Design.toLevel(c.design).level, a=summary(l);
      if(a.error) return {special:c.special,type:c.type,invalid:a.error};
      const r=solve(l,3), route=r.found?RR.Solver.describeRoute(l,r.moves,false):null;
      // Compare the same moves by stable part IDs (object indices change when a stick is removed).
      const sim=RR.Solver.newSim(l,false), baseSim=RR.Solver.newSim(baseLevel,false), beforeTrace=[], original=routeWithIds(baseLevel,result);
      function solvedIds(s) {return Array.from({length:s.objectCount()},(_,i)=>i).filter(i=>s.isSolved(i)).map(i=>s.idOf(i)).sort();}
      let changed=false;
      original.forEach(m=>{const o=sim.indexOf(m.part);if(o>=0)RR.Solver.apply(sim,{obj:o,target:m.target});RR.Solver.apply(baseSim,{obj:baseSim.indexOf(m.part),target:m.target});
        const remainingCommon=baseLevel.parts.filter(p=>p.kind==="ring").map(p=>p.partId), actual=solvedIds(sim), expected=solvedIds(baseSim);
        const ringDifference=remainingCommon.some(id=>actual.includes(id)!==expected.includes(id));
        const stickDifferent=c.type==="guide"&&sim.isSolved(sim.indexOf("slide_bar_1"))!==baseSim.isSolved(baseSim.indexOf("slide_bar_1"));
        if(ringDifference||stickDifferent) changed=true;
        beforeTrace.push({part:m.part,remaining:sim.remaining(),solvedParts:actual,baseSolvedParts:expected,commonRingReleaseChanged:ringDifference,stickReleaseChanged:stickDifferent});});
      return {special:c.special,type:c.type,solver:r.found?"solved":"unsolved_within_limits",route,releaseSequenceChanged:changed,originalRouteReplay:beforeTrace,originalRouteStillFinishes:sim.allSolved()};
    } catch(e) {return {special:c.special,type:c.type,invalid:e.message};}
  });
}

const plans=[{id:"divider",fn:divider,references:["ref_028","ref_041"],relations:["between_rows","separates_regions"],gaps:[135]},
             {id:"corner",fn:corner,references:["ref_019","ref_052"],relations:["boundary_of","continues_axis"],gaps:[225,270,315]},
             {id:"frame",fn:frame,references:["ref_018","ref_041"],relations:["frames","boundary_of"],gaps:[45,90,270]}];
const manifest={format:"rotate-joint-poc",version:1,seed:SEED,algorithm:"bounded role/contact hypotheses + discrete gap search; no learned aesthetic model",container:{width:18,height:24,aspect:"3:4",units:"board"},candidates:[],selected:[],limits:["Small PoC, not a generator quality benchmark.","No v0-v6 baseline files available.","Visual acceptance requires human comparison."]};
for(const plan of plans) {
  let selected=false;
  for(const gap of plan.gaps) {
    const design=plan.fn(gap), stem=`poc-${plan.id}-${gap}`, f=path.join(OUT,stem+".rrdesign.json");
    fs.writeFileSync(f,JSON.stringify(design,null,2));
    let level;try{level=RR.Design.toLevel(design).level;}catch(e){manifest.candidates.push({stem,error:e.message});continue;}
    const a=summary(level);
    if(a.error) {manifest.candidates.push({stem,error:a.error,solver_status:"not_tested"});console.log("REJECT",stem,a.error);continue;}
    const b=RR.Render.bounds(RR.World.build(level)), w=b.xMax-b.xMin,h=b.yMax-b.yMin;
    const fits=w<=16&&h<=22;
    const entry={stem,intent:plan.id,reference_ids:plan.references,gap,error:a.error,warnings:a.warnings,info:a.info,bounds:b,fits_container:fits};
    if(!fits||a.warnings.length) {entry.solver_status="not_tested";manifest.candidates.push(entry);console.log("REJECT",stem,a.warnings.map(x=>x.text).join("; ")||"bounds");continue;}
    const res=solve(level), rawFeel=res.found?replayFeel(level,res.moves):null;
    const comfortable=res.found?comfortableMoves(level,res.moves):null;
    const feel=comfortable?comfortable.feel:rawFeel;
    entry.solver_status=res.found?"solved":"unsolved_within_limits";entry.nodes=res.nodes;entry.seconds=res.seconds;entry.feel_replay=feel;
    entry.raw_feel_replay=rawFeel;entry.pointer_extension_degrees=comfortable&&comfortable.pointerExtensionDegrees;
    manifest.candidates.push(entry);console.log(stem,entry.solver_status,res.log,feel&&feel.solved);
    if(!res.found||!comfortable||selected) continue;
    entry.search_moves=routeWithIds(level,res);res.moves=comfortable.moves;
    selected=true; entry.selected_for_review=true;entry.human_accepted=false;entry.unity_verified=false;
    const ab=ablations(design,res);entry.ablations=ab;
    const cx=(b.xMin+b.xMax)/2,cy=(b.yMin+b.yMax)/2,view={xMin:cx-9,xMax:cx+9,yMin:cy-12,yMax:cy+12};
    fs.writeFileSync(path.join(OUT,stem+".svg"),RR.Render.render({world:RR.World.build(level),level,view,width:540,height:720,labels:true,title:design.name}));
    const g=graph(level);g.visual.relations=plan.relations.map(relation=>({source:"S1",target:"ring_region",relation,confidence:"planned"}));
    fs.writeFileSync(path.join(OUT,stem+".graph.json"),JSON.stringify(g,null,2));
    const pack={format:"turp-pack",version:1,tool:{name:"RotateLevelDesigner joint PoC",version:"research-20261013",constants:RR.C.exportedAt},createdAt:new Date().toISOString(),name:design.name,author:design.author,notes:design.notes,levelId:level.levelId,runtime:level,design,proof:{found:true,drags:res.moves.length,route:RR.Solver.describeRoute(level,res.moves,false),moves:routeWithIds(level,res),log:res.log,nodes:res.nodes,seconds:res.seconds,limits:{nodes:600,seconds:4},explodeBombs:false},analysis:{warnings:a.warnings,info:a.info}};
    fs.writeFileSync(path.join(OUT,stem+".rrpack.json"),RR.json.stringify(pack));
    manifest.selected.push({stem,name:design.name,reference_ids:plan.references,visual_relations:plan.relations,proof:pack.proof,feel_replay:feel,ablations:ab,view,review_status:"not_human_accepted"});
  }
}
fs.writeFileSync(path.join(OUT,"poc-manifest.json"),JSON.stringify(manifest,null,2));
console.log("Review candidates:",manifest.selected.length,"of",manifest.candidates.length);
