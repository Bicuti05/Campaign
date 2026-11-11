'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),RR=require('../../rr-core.js'),G=require('../pose-body-gesture-query.js'),check=require('../20261021-gd-return-review/audit-static.cjs').check;
const sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const ROOT=path.resolve(__dirname,'../../../..'),read=p=>JSON.parse(fs.readFileSync(p,'utf8')),OUT=__dirname;
const file=path.join(ROOT,'Tools/RotateLevelDesigner/levels/A010_20261026_image-r01.rrpack.json'),pack=read(file),d=pack.design,lv=pack.runtime;
const write=(f,x)=>fs.writeFileSync(path.join(OUT,'final-'+f),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
async function main(){
 const checks=check(file),rebuilt=JSON.parse(RR.json.stringify(RR.Design.toLevel(d).level));assert(checks.ok,JSON.stringify(checks.errors));assert.deepEqual(rebuilt,lv);assert(read(path.join(OUT,'final-native.json')).found);
 const base=read(path.join(OUT,'draft04-body.json')).moves,kinds=new Map(lv.parts.map(p=>[p.partId,p.kind]));let route=null;const trials=[];
 for(const [rm,sm]of[[0,0],[3,.15],[6,.3],[9,.4],[12,.5]]){
  const sim=new RR.Simulation(lv,RR.Tuning.defaults()),moves=[];
  for(const m of base){const o=sim.indexOf(m.part);if(sim.isSolved(o))continue;const from=sim.isStick(o)?sim.offsetOf(o):sim.angleOf(o),pts=G.selectableBody(sim,o),grab=pts[Math.floor(pts.length/2)];if(!grab||sim.isMovementLocked(o))break;const target=m.target+Math.sign(m.target-from)*(sim.isStick(o)?sm:rm);G.release.apply(sim,o,target,grab);moves.push({part:m.part,target});}
  const normal=G.replay(lv,moves,false,true),analytic=G.replay(lv,moves,false,false),jitter=[];
  for(let test=0;test<8;test++){const varied=moves.map((m,i)=>({...m,target:m.target+(kinds.get(m.part)==='stick'?.1:2)*((test<2?test%2:(i+test)%2)?1:-1)*(test>=4?.5:1)}));jitter.push(G.replay(lv,varied,false,true).ok);}
  trials.push({rm,sm,default:normal.ok,analytic:analytic.ok,jitter});if(normal.ok&&analytic.ok&&jitter.every(Boolean)){route={moves,defaultFeel:normal,analytic,jitter,margin:{ring:rm,stick:sm}};break;}
 }
 write('route-trials.json',trials);assert(route,'No route passed endpoint checks');
 assert(G.replay(rebuilt,route.moves,false,true).ok&&G.replay(rebuilt,route.moves,false,false).ok);
 const build=RR.Design.toLevel(d),names=Object.fromEntries(Object.entries(build.ids).map(([k,v])=>[v,k])),named=route.moves.map(m=>({part:names[m.part],target:m.target})),variants=[];
 for(const bar of d.sticks){for(const kind of ['L_arm','Guide']){const a=structuredClone(d),s=a.sticks.find(x=>x.id===bar.id);if(kind==='L_arm')s.path=s.path.slice(0,2);else s.guides=[];variants.push({kind,host:bar.id,d:a});}}
 const roles=[];
 for(const v of variants){let evidence=null;
  for(let k=0;k<=named.length&&!evidence;k++){const prefix=named.slice(0,k),a=G.query(d,prefix,false,true),b=G.query(v.d,prefix,false,true);if(b.data.trace.some(t=>t.began===false&&!t.alreadySolved))continue;
   const ids=[...d.rings,...d.sticks].map(x=>x.id),sa=a.sim.saveState(),sb=b.sim.saveState();
   function differences(){return ids.map(id=>{const oa=a.sim.indexOf(a.b.ids[id]),ob=b.sim.indexOf(b.b.ids[id]);return{id,a:{solved:a.sim.isSolved(oa),pose:a.sim.isStick(oa)?a.sim.offsetOf(oa):a.sim.angleOf(oa)},b:{solved:b.sim.isSolved(ob),pose:b.sim.isStick(ob)?b.sim.offsetOf(ob):b.sim.angleOf(ob)}};}).find(x=>x.a.solved!==x.b.solved||!x.a.solved&&Math.abs(x.a.pose-x.b.pose)>(x.id.startsWith('S')?.25:10));}
   let diff=differences();if(diff){evidence={prefix,phaseEffect:diff};break;}
   for(const id of ids){if(evidence)break;for(const delta of id.startsWith('S')?[-6,-3,-1.5,1.5,3,6]:[-180,-90,90,180]){a.sim.restoreState(sa);b.sim.restoreState(sb);let accepted=true;for(const q of[a,b]){const o=q.sim.indexOf(q.b.ids[id]);if(q.sim.isSolved(o)||q.sim.isMovementLocked(o)){accepted=false;break;}const pts=G.selectableBody(q.sim,o),grab=pts[Math.floor(pts.length/2)];if(!grab){accepted=false;break;}G.release.apply(q.sim,o,(q.sim.isStick(o)?q.sim.offsetOf(o):q.sim.angleOf(o))+delta,grab);}if(accepted&&(diff=differences())){evidence={prefix,actor:id,delta,effect:diff};break;}}}
  }roles.push({kind:v.kind,host:v.host,effectFound:!!evidence,evidence});
 }
 write('feature-roles.json',roles);assert(roles.filter(r=>r.kind==='L_arm').every(r=>r.effectFound),'Unproven L arm role');
 // GD explicitly requested the image's two Guides; retain them and disclose the unproven independent effect.
 const start=new RR.Simulation(lv,RR.Tuning.defaults()),selectable=Array.from({length:start.objectCount()},(_,o)=>({id:start.idOf(o),points:G.selectableBody(start,o).length}));assert(selectable.every(x=>x.points));
 const view={xMin:-10,xMax:10,yMin:-10,yMax:10};
 async function render(sim,name,mono=false){const svg=RR.Render.render({world:sim.world,level:lv,view,width:600,height:600,labels:false});fs.writeFileSync(path.join(OUT,name+'.svg'),svg,{flag:'wx'});let s=sharp(Buffer.from(svg));if(mono)s=s.grayscale();await s.png().toFile(path.join(OUT,name+'.png'));}
 await render(start,'preview');await render(start,'mono',true);
 for(let i=0;i<route.moves.length;i++){const m=route.moves[i],o=start.indexOf(m.part);if(start.isSolved(o))continue;const pts=G.selectableBody(start,o);G.release.apply(start,o,m.target,pts[Math.floor(pts.length/2)]);if(i===1||i===3||i===7)await render(start,'phase-'+(i+1));}assert(start.allSolved());
 write('delivery.json',{status:'ready_to_apply',pack:path.relative(ROOT,file),design:pack.design.name,checks,exactRebuild:true,route,selectable,roles,sourceImage:'gd-reference.png',imageAdjustments:{R1Gap:65,R2R3Gap:60,GuideOffsetOutward:.8},limits:['Designer analytic JS only; no Unity/device gameplay test.','Eight endpoint perturbations are local checks, not exhaustive route robustness.','Feature effects at stored reachable prefixes do not prove global necessity.','Both Guides from the explicit GD image are engaged; no independent counterfactual effect found at tested prefixes. Retained to reproduce the requested image, not certified individually necessary.']});
 console.log(JSON.stringify({ready:true,default:route.defaultFeel.ok,analytic:route.analytic.ok,jitter:route.jitter,roles:roles.map(x=>[x.kind,x.host,x.effectFound])}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
