'use strict';
// Static checks only. No solve, pointer gesture, replay, ablation or state search.
const C=require('./common.cjs'),{RR,TOOL,path}=C;
const OVL=require('../references/TURPLevel/LevelVariants/overlap_check.js').init(TOOL);
const near=require('../Tools/RotateLevelDesigner/research/turp-color-near.js');
const delta=a=>((a+180)%360+360)%360-180;
const pair=x=>[x.a,x.b].sort().join('|');
function check(file,source){
 const result={file:C.rel(file),source:source?C.rel(source):null,solutionSearch:false,checks:{},errors:[],limitations:[
  'Static model checks do not establish solvability, difficulty, visual quality or dynamic necessity of a feature.',
  'Strict OVL is the historical conservative body-only checker (sampled bars; circles ignore gaps). It excludes pins/stops/Guides/Boms; native analyzer covers additional geometry.',
  'Same-colour near distance1.5 and OVL baseline allowance0.01 are research measurements, not gameplay tolerance changes. Different palette names still need human contrast review.'
 ]};
 const fail=(code,detail)=>result.errors.push({code,detail});
 try{
  const {doc,design:d,level:lv}=C.load(file);
  if(!d)throw Error('Pack is missing design; use an authoring design for new levels.');
  // Native builder does not enforce every schema property; reject easy-to-miss
  // hosted-bomb typos rather than silently baking a bomb at the host centre.
  for(const host of [...d.rings||[],...d.sticks||[]])if(host.bomb){
   const unknown=Object.keys(host.bomb).filter(k=>!['x','y','radius'].includes(k));
   if(unknown.length)fail('hosted-bomb-properties',{id:host.id,unknown,expected:'World x/y/radius, not angle/distance.'});
  }
  result.checks.nativeValidation=RR.validate(lv)||null;
  if(result.checks.nativeValidation)fail('validate',result.checks.nativeValidation);
  const analysis=RR.analyze(lv);result.checks.analysis=analysis;
  if(analysis.error)throw Error(analysis.error);
  if(analysis.warnings.length)fail('analysis-warnings',analysis.warnings);
  const sim=new RR.Simulation(lv,RR.Tuning.defaults()),w=sim.world;
  const margins=(d.rings||[]).flatMap(r=>(r.gap===0?[]:(r.pins||[]).map(p=>({ring:r.id,pin:p.id,margin:Math.abs(delta(p.angle-(r.gapDir||0)))-(r.gap==null?90:r.gap)/2}))));
  result.checks.pinMargins=margins;
  for(const m of margins)if(m.margin<45-1e-7)fail('pin-margin',m);
  const guides=w.guides.map((g,i)=>({id:g.id,engaged:w.guideEngaged(i)}));result.checks.guides=guides;
  for(const g of guides)if(!g.engaged)fail('guide-idle',g);
  const links=sim.snapshot().links;result.checks.links=links;
  for(const l of links)if(!l.active)fail('link-idle',l);
  for(const p of lv.parts)if((p.lockCount||0)!==0)fail('chain',p.partId);
  const allowed=new Set(RR.Color.KEYS);
  for(const o of [...d.rings||[],...d.sticks||[]]){
   const color=RR.Color.name(RR.Color.parse(o.color));
   if(!allowed.has(color))fail('palette',{id:o.id,color:o.color});
  }
  result.checks.colors=near(d);
  if(result.checks.colors.near.length||result.checks.colors.sizeClash.length)fail('color-near-or-size',result.checks.colors);
  const base=source?OVL.check(C.load(source).design):[];
  const bm=new Map(base.map(x=>[pair(x),x.depth]));
  const strict=OVL.check(d),increased=strict.filter(x=>!bm.has(pair(x))||x.depth>bm.get(pair(x))+.01);
  result.checks.strictOVL={source:base,current:strict,newOrDeeper:increased};
  if(increased.length)fail('strict-OVL',increased);
  const contact=[];
  for(let o=0;o<w.objectCount();o++){
   const p=w.isStickObject(o)?w.stickOf(o).offset:w.rings[o].angleDeg;
   const q=RR.W.bombSweep(w,o,p,p);if(q.contact)contact.push(q.contact);
  }
  result.checks.initialBombContacts=contact;if(contact.length)fail('initial-bomb-contact',contact);
  const stops=[];
  for(const r of w.rings){const part=lv.parts.find(p=>p.partId===r.id);
   for(const s of part.stopPins||[]){const poly=s.hardBlockPoints;
    const roots=[poly[0],poly.at(-1)].map(p=>RR.M.add(r.center,RR.M.rot(RR.M.V(p[0],p[1]),r.angleDeg)));
    const sdf=roots.map(p=>RR.M.arcSdf(r.arc,p));
    const record={ring:r.id,feature:s.featureId,rootSdf:sdf};stops.push(record);
    if(sdf.some(v=>v>=-1e-6))fail('stop-root-not-in-material',record);
   }
  }
  result.checks.stopRoots=stops;
  const bars=[];
  for(const s of d.sticks||[]){const pts=s.path||RR.Builder.stickPath(s.shape||'straight',s.length||5.4167,s.arm||2.2083);
   const seg=[];for(let i=1;i<pts.length;i++){
    const v=RR.M.rot(RR.M.V(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]),s.angle||0),len=RR.M.len(v);
    seg.push({v,len});if(len<1e-8||Math.min(Math.abs(v.x),Math.abs(v.y))>1e-5)fail('non-cardinal-or-zero-segment',{id:s.id,segment:i,length:len});
   }
   const isU=seg.length===3&&RR.M.dot(seg[0].v,seg[2].v)<0&&Math.abs(RR.M.dot(seg[0].v,seg[1].v))<1e-5;
   const info={id:s.id,lengths:seg.map(x=>x.len),isU,guides:(s.guides||[]).length};bars.push(info);
   if(isU){
    if(Math.abs(seg[0].len-seg[2].len)>1e-5)fail('unequal-U-legs',info);
    // Nearest world path segment locates each Guide; rejects half-catch placement near either bend.
    const a=(s.angle||0)*RR.D2R,W=pts.map(([x,y])=>RR.M.V(s.x+Math.cos(a)*x-Math.sin(a)*y,s.y+Math.sin(a)*x+Math.cos(a)*y));
    const occupied=[];
    for(const g of s.guides||[]){const p=RR.M.V(g.x,g.y);const dist=W.slice(1).map((b,i)=>RR.M.distanceToSegment(p,W[i],b));const k=dist.indexOf(Math.min(...dist));occupied.push(k);
     if(k===0||k===2){const corner=k===0?W[1]:W[2];const clearance=RR.M.len(RR.M.sub(p,corner));
      if(clearance<.5)fail('U-guide-near-bend',{id:s.id,clearance,limitDescription:'Research review guard, not engine tolerance; inspect actual trigger/walls.'});}
    }
    if(occupied.filter(i=>i===0).length!==1||occupied.filter(i=>i===2).length!==1)fail('U-needs-one-guide-per-leg',{id:s.id,occupied});
   }
  }
  result.checks.bars=bars;
  if(doc.format==='turp-pack'){
   const rebuilt=JSON.parse(RR.json.stringify(RR.Design.toLevel(d).level));
   result.checks.roundtripRuntime=JSON.stringify(rebuilt)===JSON.stringify(lv);
   if(!result.checks.roundtripRuntime)fail('runtime-design-mismatch','Rebake differs; keep original pack unchanged, inspect authoring loss before delivery.');
   if(doc.proof!=null)fail('proof-must-be-null','101-200 deliveries use --no-solve. Historical packs may have proof; this does not invalidate their historical record.');
  }
 }catch(e){fail('exception',e.message);}
 result.ok=result.errors.length===0;return result;
}
module.exports={check};
if(require.main===module){const f=C.args[0];if(!f){console.error('node scripts/check-level.cjs <design|pack> [--source file] [--out checks.json]');process.exit(2);}
 const r=check(f,C.opt('--source'));if(C.opt('--out'))C.writeNew(C.opt('--out'),r);console.log(JSON.stringify(r,null,2));process.exitCode=r.ok?0:1;}
