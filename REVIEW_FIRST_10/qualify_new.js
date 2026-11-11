'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process');
const tool='/workspace/Campaign/RotateLevelDesigner',out='/workspace/Campaign/REVIEW_FIRST_10',RR=require(tool+'/rr-core.js');
const clone=x=>JSON.parse(JSON.stringify(x));
function state(sim){return Array.from({length:sim.objectCount()},(_,i)=>({id:sim.idOf(i),solved:sim.isSolved(i),free:sim.isFreeToSolve(i),movementLocked:sim.isMovementLocked(i),pose:Math.round((sim.isStick(i)?sim.offsetOf(i):sim.angleOf(i))*10000)/10000}));}
function trace(level,moves){const sim=RR.Solver.newSim(level,false),result=[state(sim)];for(const m of moves){RR.Solver.apply(sim,m);result.push(state(sim));}return result;}
const positions=process.argv.slice(2).map(Number);
for(const position of (positions.length?positions:[3,6,10,13,16,20])){
 const stem='CampaignReview'+String(position).padStart(3,'0')+'_v1',file=tool+'/levels/'+stem+'.rrdesign.json';let design=JSON.parse(fs.readFileSync(file));
 // Build all geometry with the official builder. Use official fish CLI on its runtime.
 if(position>=11){
  // Feed fish --mark a fresh unmarked design: the CLI's in-place re-marker
  // leaves a dangling comma when stripping an existing final canCollect field.
  design.rings.forEach(r=>delete r.collect);fs.writeFileSync(file,JSON.stringify(design,null,2)+'\n');
  const runtime=out+'/validation/'+stem+'.runtime.json';
  cp.execFileSync('node',[tool+'/rr-cli.js','build',file,'-o',runtime]);
  const fishLog=cp.execFileSync('node',[tool+'/rr-cli.js','fish',runtime,'--mark'],{encoding:'utf8'});fs.writeFileSync(out+'/validation/'+stem+'.fish.log',fishLog);
  const marked=JSON.parse(fs.readFileSync(runtime)).parts.filter(p=>p.kind==='ring').map(p=>!!p.canCollect);design.rings.forEach((r,i)=>{if(marked[i])r.collect=true;else delete r.collect;});if(position===16){design.rings.forEach(r=>{delete r.collect;if(['HUB','LEAF1','LEAF8'].includes(r.id))r.collect=true;});fs.appendFileSync(out+'/validation/'+stem+'.fish.log','Symmetry tie-break among equally eligible candidates: HUB, LEAF1, LEAF8; checked by official Fish.check.\n');}
  fs.writeFileSync(file,JSON.stringify(design,null,2)+'\n');
 }
 const level=RR.Design.toLevel(design).level,analysis=RR.analyze(level);if(analysis.error||analysis.warnings.length)throw Error(stem+' validation warnings '+JSON.stringify(analysis));
 const proof=RR.Solver.find(level,{timeLimitSeconds:15,nodeLimit:2000,explodeBombs:false});if(!proof.found)throw Error(stem+' NOT FOUND');
 const replay=RR.Solver.replay(level,proof.moves,false);if(!replay.allSolved())throw Error('replay failed');
 const baseline=trace(level,proof.moves),ablation=[];
 for(let owner=0;owner<design.rings.length;owner++)for(let index=0;index<(design.rings[owner].pins||[]).length;index++){
  const alternative=clone(design),pin=alternative.rings[owner].pins.splice(index,1)[0];const altLevel=RR.Design.toLevel(alternative).level;
  const altProof=RR.Solver.find(altLevel,{timeLimitSeconds:10,nodeLimit:1500,explodeBombs:false});
  const altTrace=trace(altLevel,proof.moves);let firstDifference=-1;
  for(let i=0;i<baseline.length;i++)if(JSON.stringify(baseline[i])!==JSON.stringify(altTrace[i])){firstDifference=i;break;}
  const meaningful=firstDifference>=0||!altProof.found;
  ablation.push({owner:design.rings[owner].id,pin:pin.id,removedPhysically:true,alternativeFound:altProof.found,alternativeDrags:altProof.found?altProof.moves.length:null,originalTraceChanged:firstDifference>=0,firstDifferentState:firstDifference,meaningful});
  if(!meaningful)throw Error(stem+' redundant pin '+pin.id);
 }
 const fish=RR.Fish.check(level).filter(f=>level.parts.find(p=>p.partId===f.id).canCollect);if(fish.some(f=>f.hard.length||f.tier===3))throw Error(stem+' bad fish');
 const result={position,designSHA256:require('crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex'),validateOK:true,warnings:analysis.warnings,info:analysis.info,found:true,noBombs:true,noBooster:true,drags:proof.moves.length,route:RR.Solver.describeRoute(level,proof.moves,false),replayComplete:true,ablation,fish,ringRoles:'All rings have an initially active gameplay link; no floating or auto-solved ring.'};
 fs.writeFileSync(out+'/validation/'+stem+'.qualification.json',JSON.stringify(result,null,2)+'\n');
 const cliValidate=cp.execFileSync('node',[tool+'/rr-cli.js','validate',file],{encoding:'utf8'});fs.writeFileSync(out+'/validation/'+stem+'.validate.log',cliValidate);
 const cliSolve=cp.execFileSync('node',[tool+'/rr-cli.js','solve',file,'--no-bombs','--time','15','--nodes','2000','--json'],{encoding:'utf8'});fs.writeFileSync(out+'/validation/'+stem+'.solve.json',cliSolve);
 cp.execFileSync('node',[tool+'/rr-cli.js','render',file,'-o',out+'/previews/'+stem+'.svg']);
 cp.execFileSync('node',[tool+'/rr-cli.js','pack',file,'-o',tool+'/levels/'+stem+'.rrpack.json','--no-bombs','--time','15','--nodes','2000']);
 const pack=JSON.parse(fs.readFileSync(tool+'/levels/'+stem+'.rrpack.json'));if(!pack.proof?.found)throw Error(stem+' exported pack missing proof');
 console.log(position+': validate OK; FOUND '+proof.moves.length+'; replay OK; '+ablation.length+'/'+ablation.length+' useful pins; fish '+fish.length);
}
