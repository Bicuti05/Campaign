"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto"),RR=require("../rr-core.js"),g=require("./pose-body-gesture-query.js");
const root=path.resolve(__dirname,".."),out=path.join(__dirname,"20261015-genai-part3-completed");
const jobs=[
 ["genai-32-peacock-v04","20261015-genai-part3-v04/genai-32-peacock-v04-authored-gesture.json"],
 ["genai-33-ferris-wheel-v03","20261015-genai-part3-v03/genai-33-ferris-wheel-v03-authored-gesture.json"],
 ["genai-34-birthday-cake-v02","20261015-genai-part3-v02/genai-34-birthday-cake-v02-authored-gesture.json"],
 ["genai-35-castle-v01","20261015-genai-part3-v01/genai-35-castle-v01-authored-gesture.json"],
 ["genai-36-stegosaurus-v02","20261015-genai-part3-v02/genai-36-stegosaurus-v02-authored-gesture.json"]
];
function save(p,v){fs.writeFileSync(p,typeof v==="string"?v:JSON.stringify(v,null,2)+"\n",{flag:"wx"});}
function clone(o){return JSON.parse(JSON.stringify(o));}
function sameFloat32Authoring(a,b){
 if(typeof a==="number"&&typeof b==="number")return Math.fround(a)===Math.fround(b);
 if(a===null||b===null||typeof a!=="object"||typeof b!=="object")return a===b;
 const ak=Object.keys(a),bk=Object.keys(b);return ak.length===bk.length&&ak.every(k=>Object.hasOwn(b,k)&&sameFloat32Authoring(a[k],b[k]));
}
const summaries=[];
for(const [stem,proofPath] of jobs){
 const stage=JSON.parse(fs.readFileSync(path.join(out,stem+"-cli-stage.rrpack.json"),"utf8")),d=stage.design,proof=JSON.parse(fs.readFileSync(path.join(__dirname,proofPath),"utf8"));
 if(!Array.isArray(proof.moves))throw Error("Missing authored actual-gesture route "+stem);
 const raw=proof.moves;
 const analytic=g.replay(stage.runtime,raw,false,false),feel=g.replay(stage.runtime,raw,false,true),analysis=RR.analyze(stage.runtime);
 if(!analytic.ok||!feel.ok||analysis.error||analysis.warnings.length)throw Error("Main qualification failed "+stem);
 stage.name=d.name;stage.notes=d.notes;stage.proof={found:true,drags:raw.length,moves:raw,explodeBombs:false,log:"CLI FOUND; actual current-pose material-body replay to target/release verified analytic/default. Authored route may deepen solver angular targets. No Booster/Bomb/Chain. See research/20261015-genai-part3-completed."};
 const packFile=path.join(root,"levels",stem+".rrpack.json"),serialized=RR.json.stringify(stage);if(fs.existsSync(packFile)){if(fs.readFileSync(packFile,"utf8")!==serialized)throw Error("Different saved pack; use new revision");}else save(packFile,serialized);
 const pack=JSON.parse(fs.readFileSync(packFile,"utf8")),design=JSON.parse(fs.readFileSync(path.join(root,"levels",stem+".rrdesign.json"),"utf8")),rebuilt=JSON.parse(RR.json.stringify(RR.Design.toLevel(pack.design).level));
 // Native writer's decimal output is not text-idempotent: -.99317065 -> -.9931707
 // on a second serialization, but both encode the same Float32. Compare exactly
 // at that representation, then require real saved/rebuilt gestures below.
 if(RR.validate(pack.runtime)||RR.validate(rebuilt)||!sameFloat32Authoring(design,pack.design))throw Error("Final readback failed");
 const finalProfiles={savedAnalytic:g.replay(pack.runtime,raw,false,false),savedDefault:g.replay(pack.runtime,raw,false,true),rebuiltAnalytic:g.replay(rebuilt,raw,false,false),rebuiltDefault:g.replay(rebuilt,raw,false,true)};
 if(Object.values(finalProfiles).some(p=>!p.ok))throw Error("Final serialized route failed "+stem);
 const baked=RR.Design.toLevel(design),sim=new RR.Simulation(pack.runtime),initialBodies=Object.entries(baked.ids).map(([id,runtimeId])=>{const s=new RR.Simulation(pack.runtime),o=s.indexOf(runtimeId),points=g.selectableBody(s,o),p=points[Math.floor(points.length/2)];return {id,runtimeId,materialPoints:points.length,locked:s.isMovementLocked(o),beginDrag:p?s.beginDrag(o,p):false};});
 if(initialBodies.some(p=>!p.materialPoints||(!p.locked&&!p.beginDrag)))throw Error("Body inaccessible "+stem);
 const margins=design.rings.flatMap(r=>(r.pins||[]).map(p=>({owner:r.id,target:p.target,margin:Math.abs(((p.angle-r.gapDir+540)%360)-180)-r.gap/2})));
 if(margins.some(p=>p.margin<45)||sim.graph.active.some(a=>!a)||sim.graph.bindingActive.some(a=>!a))throw Error("Attachment engagement failed");
 const controls=[];
 for(const r of design.rings)for(let i=0;i<(r.pins||[]).length;i++){const c=clone(design);c.rings.find(q=>q.id===r.id).pins.splice(i,1);const cb=RR.Design.toLevel(c),s=new RR.Simulation(cb.level);controls.push({kind:"remove_pin",owner:r.id,target:r.pins[i].target,initialActive:s.graph.active.slice(),initialBodies:[r.id,r.pins[i].target].map(id=>{const o=s.indexOf(cb.ids[id]);return {id,locked:s.isMovementLocked(o),hasLock:s.hasActiveLock(o)};})});}
 for(const s of design.sticks)if(s.guides?.length){const c=clone(design),bar=c.sticks.find(q=>q.id===s.id);bar.guides=[];const cb=RR.Design.toLevel(c),q=new RR.Simulation(cb.level),o=q.indexOf(cb.ids[s.id]);controls.push({kind:"remove_guide",bar:s.id,retainedWithoutGuide:q.hasActiveLock(o),note:"Guide retains its own bar. This does not establish that the bar is a required preparation for another piece."});}
 const checkpoints=[{key:"initial",moves:[]},{key:"middle",moves:raw.slice(0,Math.ceil(raw.length/2))},{key:"final",moves:raw}];
 const initialWorld=sim.world,view=RR.Render.bounds(initialWorld);for(const k of ["xMin","yMin"])view[k]-=1.6;for(const k of ["xMax","yMax"])view[k]+=1.6;
 for(const phase of checkpoints){const state=g.query(pack,phase.moves,false,true).sim,hidden={};for(let i=0;i<state.objectCount();i++)if(state.isSolved(i)){hidden[state.idOf(i)]=true;const st=state.isStick(i)?state.world.stickOf(i):null;if(st)for(const guide of state.world.guides)if(guide.stickId===st.id)hidden[guide.id]=true;}
  save(path.join(out,stem+"-"+phase.key+".svg"),RR.Render.render({world:state.world,level:pack.runtime,view,width:600,labels:true,hidden,title:stem+" "+phase.key}));
 }
 const mono=clone(pack.runtime);for(const p of mono.parts)if(p.color)p.color=[.25,.25,.25,1];save(path.join(out,stem+"-mono.svg"),RR.Render.render({world:RR.World.build(mono,{lenient:true}),level:mono,view,width:600,labels:true,title:stem+" mono"}));
 const item={stem,design:path.relative(root,path.join(root,"levels",stem+".rrdesign.json")),pack:path.relative(root,packFile),status:"valid_and_full_gesture_solvable_pending_GD_visual_difficulty",cliSolve:"FOUND_no_bombs",warningCount:analysis.warnings.length,initialAllLinksEngaged:sim.graph.active.every(Boolean),initialAllGuidesEngaged:sim.graph.bindingActive.every(Boolean),initialBodies,margins,controls,profiles:finalProfiles,scope:"Existing Designer analytic simulation; not Unity Physics2D/device testing. Retains source figure-making bars: no claim every such bar creates a cross-object preparation, no difficulty certification.",sha256:crypto.createHash("sha256").update(fs.readFileSync(packFile)).digest("hex")};
 save(path.join(out,stem+"-proof.json"),item);summaries.push({...item,initialBodies:undefined,margins:undefined,controls:undefined,profiles:Object.fromEntries(Object.entries(finalProfiles).map(([k,v])=>[k,v.ok]))});
}
save(path.join(out,"delivery-index.json"),{createdAt:new Date().toISOString(),status:"five_repaired_figures_valid_and_solvable",levels:summaries,noUnityCampaignSaveChanges:true,noBooster:true,noBombs:true,sourceReferenceDraftsPreserved:true});
console.log(JSON.stringify(summaries,null,2));
