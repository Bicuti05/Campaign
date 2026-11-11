'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict'),{execFileSync}=require('child_process');
const {RR,SOURCES,specs,ROOT}=require('./author.cjs'),G=require('../pose-body-gesture-query.js'),check=require('../20261021-gd-return-review/audit-static.cjs').check,sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const OUT=__dirname,TOOL=path.resolve(OUT,'../..'),read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),write=(f,x)=>fs.writeFileSync(path.join(OUT,f),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
const latest=(id,kind)=>fs.readdirSync(OUT).filter(f=>f.startsWith('A'+id+'-'+kind+'-')).sort().at(-1);
function viewport(b,w,h){const cx=(b.xMin+b.xMax)/2,cy=(b.yMin+b.yMax)/2;return{xMin:cx-w/2,xMax:cx+w/2,yMin:cy-h/2,yMax:cy+h/2};}
function expand(a,b){return{xMin:Math.min(a.xMin,b.xMin),xMax:Math.max(a.xMax,b.xMax),yMin:Math.min(a.yMin,b.yMin),yMax:Math.max(a.yMax,b.yMax)};}
function activeBounds(w){return RR.Render.bounds({rings:w.rings.filter(x=>x.active),sticks:w.sticks.filter(x=>x.active),guides:w.guides.filter(x=>x.active),bombs:w.bombs.filter(x=>x.active)});}
function framed(b){const width=Math.max(b.xMax-b.xMin+2,(b.yMax-b.yMin+2)*9/16);return viewport(b,width,width*16/9);}
function robust(level,moves){
 let compact=structuredClone(moves),merged=true;
 while(merged){merged=false;for(let i=0;i<compact.length-1;i++)if(compact[i].part===compact[i+1].part){const candidate=compact.filter((_,k)=>k!==i);if(G.replay(level,candidate,false,true).ok){compact=candidate;merged=true;break;}}}
 const trials=[];
 for(const [ringMargin,stickMargin]of[[6,.3],[9,.4],[3,.2],[0,0]]){
  const sim=new RR.Simulation(level,RR.Tuning.defaults()),route=[];let accepted=true;
  for(const m of compact){const o=sim.indexOf(m.part);if(sim.isSolved(o))continue;if(sim.isMovementLocked(o)){accepted=false;break;}const points=G.selectableBody(sim,o),grab=points[Math.floor(points.length/2)];if(!grab){accepted=false;break;}const from=sim.isStick(o)?sim.offsetOf(o):sim.angleOf(o),target=m.target+Math.sign(m.target-from)*(sim.isStick(o)?stickMargin:ringMargin);if(!G.release.apply(sim,o,target,grab).began){accepted=false;break;}route.push({part:m.part,target});}
  if(!accepted)continue;const feel=G.replay(level,route,false,true),analytic=G.replay(level,route,false,false);if(!feel.ok)continue;
  const kinds=new Map(level.parts.map(p=>[p.partId,p.kind])),jitter=[];
  for(let test=0;test<8;test++){const varied=route.map((m,i)=>({...m,target:m.target+(kinds.get(m.part)==='stick'?.1:2)*((test<2?test%2:(i+test)%2)?1:-1)*(test>=4?.5:1)}));jitter.push({test,ok:G.replay(level,varied,false,true).ok});}
  const t={route,defaultFeel:feel,analytic,jitter,margin:{ring:ringMargin,stick:stickMargin},passed:jitter.filter(x=>x.ok).length};trials.push({margin:t.margin,passed:t.passed,analytic:analytic.ok});
  if(t.passed===8&&analytic.ok)return{...t,trials,scope:'Eight deterministic endpoint perturbations only: up to2 degrees /0.1 board units; no device or human robustness claim.'};
 }
 throw Error('No route passed default+analytic and8 endpoint probes: '+JSON.stringify(trials));
}
async function exportOne(id){
 const stem='A'+id+'_20261026_review-r01',resultFile=path.join(OUT,stem+'-delivery.json');if(fs.existsSync(resultFile)){console.log('Existing delivery A'+id);return;}
 const proofName=latest(id,'solution'),proof=read(path.join(OUT,proofName));assert(proof.defaultFeel?.ok,'Latest draft lacks verified route');
 const roleName=latest(id,'roles'),roles=read(path.join(OUT,roleName));assert.equal(roles.design,proof.file,'Role proof belongs to previous draft');assert(roles.roles.every(x=>x.effectFound),'Unproven feature: '+JSON.stringify(roles.roles.filter(x=>!x.effectFound).map(x=>[x.kind,x.host,x.index])));
 const d=read(path.join(OUT,proof.file));for(let i=0;i<8;i++){const next=JSON.parse(RR.json.stringify(d));if(JSON.stringify(next)===JSON.stringify(d))break;Object.assign(d,next);}
 d.notes=specs[id].tag+'. '+specs[id].idea+' Nguồn A'+specs[id].source+'; ID mới, proposal chờ GD. Vai trò đã đối chứng ở prefix tới được, không chứng minh mọi lời giải bắt buộc. CLI validate/solve và full-pointer replay Designer/analytic/default feel; không Booster/Bom/Chain. Không Unity/device. Proof thực nằm trong research/20261026-rebuild-251-260/'+stem+'-delivery.json; pack no-solve tránh nhúng route solver nhả sớm.';
 const dp=path.join(TOOL,'levels',stem+'.rrdesign.json'),pp=path.join(TOOL,'levels',stem+'.rrpack.json');assert(!fs.existsSync(dp)&&!fs.existsSync(pp),'Do not overwrite revisions');
 fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
 const cli=(args)=>execFileSync(process.execPath,[path.join(TOOL,'rr-cli.js'),...args],{encoding:'utf8',timeout:90000,maxBuffer:8e6});
 const designValidate=cli(['validate',dp]);cli(['pack',dp,'-o',pp,'--author','Codex / GD review batch01','--no-solve']);const packValidate=cli(['validate',pp]),pack=read(pp),source=SOURCES.get(specs[id].source),checks=check(pp,source.file);write(stem+'-checks.json',checks);assert(checks.ok,JSON.stringify(checks.errors));
 assert.deepEqual(JSON.parse(RR.json.stringify(RR.Design.toLevel(pack.design).level)),pack.runtime);
 const native=JSON.parse(cli(['solve',pp,'--nodes','30000','--time','25','--json']));assert(native.found);write(stem+'-native.json',native);
 const route=robust(pack.runtime,proof.moves),b=RR.Design.toLevel(pack.design),start=new RR.Simulation(pack.runtime,RR.Tuning.defaults());assert(start.world.bombs.length===0);
 const initialSelectable=Array.from({length:start.objectCount()},(_,o)=>({id:start.idOf(o),points:G.selectableBody(start,o).length}));assert(initialSelectable.every(x=>x.points>0));
 const sim=new RR.Simulation(pack.runtime,RR.Tuning.defaults()),phases=[];let visibleBounds=activeBounds(sim.world);
 for(let i=0;i<route.route.length;i++){const m=route.route[i],o=sim.indexOf(m.part);if(sim.isSolved(o))continue;const pts=G.selectableBody(sim,o),grab=pts[Math.floor(pts.length/2)];assert(grab&&!sim.isMovementLocked(o));G.release.apply(sim,o,m.target,grab);if(i===0||i===Math.floor(route.route.length/2)||i===route.route.length-2){visibleBounds=expand(visibleBounds,activeBounds(sim.world));phases.push({step:i+1,state:sim.saveState()});}}
 assert(sim.allSolved());const view=framed(visibleBounds),phaseImages=[];
 async function render(world,level,name,camera,mono=false){const svg=RR.Render.render({world,level,view:camera,width:450,height:800,labels:true,title:name});fs.writeFileSync(path.join(OUT,name+'.svg'),svg,{flag:'wx'});let img=sharp(Buffer.from(svg));if(mono)img=img.grayscale();await img.png().toFile(path.join(OUT,name+'.png'));return name+'.png';}
 const initialImage=await render(start.world,pack.runtime,stem+'-color',view),monoImage=await render(start.world,pack.runtime,stem+'-mono',view,true);
 for(const phase of phases){sim.restoreState(phase.state);phaseImages.push(await render(sim.world,pack.runtime,stem+'-phase'+phase.step,view));}
 const oldWorld=RR.World.build(source.pack.runtime),sb=activeBounds(oldWorld),nb=activeBounds(start.world),w=Math.max(sb.xMax-sb.xMin,nb.xMax-nb.xMin)+2,h=Math.max(sb.yMax-sb.yMin,nb.yMax-nb.yMin,(w*16/9)-2)+2;
 const srcImage=await render(oldWorld,source.pack.runtime,stem+'-source-same-scale',viewport(sb,w,h)),newImage=await render(start.world,pack.runtime,stem+'-new-same-scale',viewport(nb,w,h));
 await sharp({create:{width:900,height:800,channels:3,background:'#fff'}}).composite([{input:path.join(OUT,srcImage),left:0,top:0},{input:path.join(OUT,newImage),left:450,top:0}]).png().toFile(path.join(OUT,stem+'-compare.png'));
 const firstRemoval=route.defaultFeel.trace.findIndex(t=>(t.removed||[]).length>0),stats={rings:pack.design.rings.length,sticks:pack.design.sticks.length,guides:pack.design.sticks.reduce((n,s)=>n+(s.guides||[]).length,0),closed:pack.design.rings.filter(r=>r.gap===0).length,longestPin:Math.max(...pack.design.rings.flatMap(r=>(r.pins||[]).map(p=>p.length||0))),gestures:route.route.length,firstRemovalGesture:firstRemoval<0?null:firstRemoval+1};
 const result={id,sourceId:specs[id].source,stem,status:'designer_verified_pending_GD',tag:specs[id].tag,idea:specs[id].idea,design:path.relative(ROOT,dp).replaceAll('\\','/'),pack:path.relative(ROOT,pp).replaceAll('\\','/'),source:path.relative(ROOT,source.file).replaceAll('\\','/'),sourceSha256:hash(source.file),designSha256:hash(dp),packSha256:hash(pp),draft:proof.file,modelSolution:proofName,roles:roleName,designValidate,packValidate,nativeFound:true,staticPass:true,exactRebuild:true,initialSelectable,route,stats,camera:view,preview:initialImage,mono:monoImage,phases:phaseImages,comparison:stem+'-compare.png',limitations:['Designer JS analytic port only; no Unity/Physics2D/device test by current user scope.','Tags/difficulty are design hypotheses; endpoint probes and counts are not difficulty or GD approval.','Feature counterfactuals show local effects at recorded reached prefixes, not exhaustive necessity.']};write(stem+'-delivery.json',result);
 console.log('READY A'+id+' '+stats.rings+'R/'+stats.sticks+'S, gestures '+stats.gestures+', endpoint8/8');
}
(async()=>{for(const id of process.argv.slice(2).map(Number))try{await exportOne(id);}catch(e){write('A'+id+'-export-hold-'+Date.now()+'.json',{error:e.stack});console.log('HOLD A'+id+' '+e.message);}})();
