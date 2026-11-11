"use strict";
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{api,RR,ROOT,OUT:IN,CORE}=require('./turp-continue'),pose=require('./pose-body-gesture-query'),Q=require('./gen/rr-qualify');
const OUT=path.join(__dirname,'20261015-turp-continuation-delivery');fs.mkdirSync(OUT,{recursive:true});
const sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const jobs=[['10014','A014','turp-A014-10014-outline-r02'],['10013','A015','turp-A015-10013-outline-r02']];
const save=(p,x)=>fs.writeFileSync(p,typeof x==='string'?x:JSON.stringify(x,null,2)+'\n',{flag:'wx'}),read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'')),clone=x=>JSON.parse(JSON.stringify(x)),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function same32(a,b){if(typeof a==='number'&&typeof b==='number')return Math.fround(a)===Math.fround(b);if(a===null||b===null||typeof a!=='object'||typeof b!=='object')return a===b;const k=Object.keys(a);return k.length===Object.keys(b).length&&k.every(k=>Object.hasOwn(b,k)&&same32(a[k],b[k]));}
function camera(b,w,h){const x=(b.xMin+b.xMax)/2,y=(b.yMin+b.yMax)/2;return{xMin:x-w/2,xMax:x+w/2,yMin:y-h/2,yMax:y+h/2};}
async function main(){const summaries=[],images=[],phaseImages=[];
 for(let row=0;row<jobs.length;row++){
  const [id,slot,stem]=jobs[row],d=read(path.join(IN,stem+'.rrdesign.json')),proof=read(path.join(IN,stem+'-qualification.json')),cli=read(path.join(IN,stem+'-cli-solve.json')),compare=read(path.join(IN,stem+'-comparison.json'));
  if(!proof.ok||!cli.found||!compare.pass)throw Error('Preflight '+stem);
  const stage=read(path.join(IN,stem+'-cli-stage.rrpack.json'));stage.name=d.name;stage.notes=d.notes;stage.proof={found:true,drags:proof.runtimeMoves.length,moves:proof.runtimeMoves,explodeBombs:false,log:'CLI FOUND; authored current-pose material-body full pointer target/release route, analytic/default feel. See research/20261015-turp-continuation-01. Proposed visual/difficulty, pending GD.'};
  const designFile=path.join(CORE,'levels',stem+'.rrdesign.json'),packFile=path.join(CORE,'levels',stem+'.rrpack.json');
  // First qualify exactly the serialization that will be delivered.
  const serialized=RR.json.stringify(stage),check=JSON.parse(serialized),rebuilt=JSON.parse(RR.json.stringify(RR.Design.toLevel(check.design).level));
  if(!same32(d,check.design)||RR.validate(check.runtime)||RR.validate(rebuilt))throw Error('Readback mismatch');
  const probes=d.sticks.flatMap(s=>{const ms=proof.moves.filter(m=>m.part!==s.id);return ms.map((_,i)=>ms.slice(0,i+1));});
  const finalProof=Q.qualify(check.design,{runtime:check.runtime,moves:proof.moves,probes}),rebuiltProof=Q.qualify(check.design,{runtime:rebuilt,moves:proof.moves,probes});
  if(!finalProof.ok||!rebuiltProof.ok)throw Error('Serialized qualification '+stem+': '+finalProof.status+'/'+rebuiltProof.status);
  for(const [p,s]of [[designFile,fs.readFileSync(path.join(IN,stem+'.rrdesign.json'),'utf8')],[packFile,serialized]]){if(fs.existsSync(p)){if(fs.readFileSync(p,'utf8')!==s)throw Error('Saved artifact differs; choose new revision '+p);}else save(p,s);}
  const saved=read(packFile),profiles={savedAnalytic:pose.replay(saved.runtime,saved.proof.moves,false,false),savedDefault:pose.replay(saved.runtime,saved.proof.moves,false,true),rebuiltAnalytic:pose.replay(rebuilt,saved.proof.moves,false,false),rebuiltDefault:pose.replay(rebuilt,saved.proof.moves,false,true)};
  if(Object.values(profiles).some(p=>!p.ok))throw Error('Saved final replay');
  save(path.join(OUT,stem+'-final-proof.json'),{finalProof,rebuiltProof,profiles});
  const srcFile=path.join(ROOT,'LevelVariants/sources/Level'+id+'.rrdesign.json'),source=api.loadDesign(srcFile),sourceLevel=api.build(source),sw=RR.World.build(sourceLevel),nw=RR.World.build(saved.runtime);
  const bs=RR.Render.bounds(sw),bn=RR.Render.bounds(nw),w=Math.max(bs.xMax-bs.xMin,bn.xMax-bn.xMin)+3.2,h=Math.max(bs.yMax-bs.yMin,bn.yMax-bn.yMin)+3.2,aspect=320/550;
  let vh=Math.max(h,w/aspect),vw=vh*aspect;
  const srcView=camera(bs,vw,vh),newView=camera(bn,vw,vh),mono=clone(saved.runtime);for(const p of mono.parts)if(p.color)p.color=[.3,.3,.3,1];
  for(const [col,key,lv,world,view]of [[0,'source',sourceLevel,sw,srcView],[1,'new',saved.runtime,nw,newView],[2,'mono',mono,RR.World.build(mono),newView]]){
   const svg=RR.Render.render({world,level:lv,view,width:320,height:550,labels:true,title:slot+' '+key});save(path.join(OUT,stem+'-'+key+'.svg'),svg);
   const banner=Buffer.from('<svg width="320" height="40"><rect width="320" height="40" fill="#fff"/><text x="12" y="26" font-family="sans-serif" font-size="16">'+slot+' / '+id+' — '+key+'</text></svg>');
   images.push({input:await sharp(Buffer.from(svg)).png().toBuffer(),left:col*320,top:row*590+40},{input:await sharp(banner).png().toBuffer(),left:col*320,top:row*590});
  }
  const raw=saved.proof.moves,prefixes=[[],raw.slice(0,Math.ceil(raw.length/2)),raw.slice(0,-1),raw],states=prefixes.map(m=>pose.query(saved,m,false,true).sim);let pv={xMin:Infinity,yMin:Infinity,xMax:-Infinity,yMax:-Infinity};
  for(const s of states){const active={...s.world,rings:s.world.rings.filter(o=>o.active),sticks:s.world.sticks.filter(o=>o.active),guides:s.world.guides.filter(o=>o.active),bombs:s.world.bombs.filter(o=>o.active)};if(!active.rings.length&&!active.sticks.length)continue;const b=RR.Render.bounds(active);for(const k of ['xMin','yMin'])pv[k]=Math.min(pv[k],b[k]);for(const k of ['xMax','yMax'])pv[k]=Math.max(pv[k],b[k]);}
  for(const k of ['xMin','yMin'])pv[k]-=1.6;for(const k of ['xMax','yMax'])pv[k]+=1.6;
  for(let col=0;col<states.length;col++){const s=states[col],hidden={};for(let i=0;i<s.objectCount();i++)if(s.isSolved(i)){hidden[s.idOf(i)]=true;for(const g of s.world.guides)if(g.stickId===s.idOf(i))hidden[g.id]=true;}const svg=RR.Render.render({world:s.world,level:saved.runtime,view:pv,width:320,height:550,labels:true,hidden,title:slot+' phase '+col});save(path.join(OUT,stem+'-phase'+col+'.svg'),svg);phaseImages.push({input:await sharp(Buffer.from(svg)).png().toBuffer(),left:col*320,top:row*550});}
  const graph=api.touchGraph(d),keys=api.PALETTE,objs=[...d.rings,...d.sticks],byId=new Map(objs.map(o=>[o.id,o]));let minDeltaE=Infinity,sameColor=0;graph.E.forEach((E,i)=>E.forEach(j=>{if(j>i){const a=byId.get(graph.objs[i].id),b=byId.get(graph.objs[j].id);minDeltaE=Math.min(minDeltaE,api.dE(keys.indexOf(a.color),keys.indexOf(b.color)));if(a.color===b.color)sameColor++;}}));
  const a=pose.query(source),b=pose.query(saved);const reversal=['R1','R2'].map(id=>({id,sourceMovementLocked:a.sim.isMovementLocked(a.sim.indexOf(a.b.ids[id])),variantMovementLocked:b.sim.isMovementLocked(b.sim.indexOf(b.b.ids[id]))}));
  const summary={stem,slot,sourceId:id,design:designFile,pack:packFile,status:'mechanically_qualified_proposal_pending_GD_visual_and_difficulty',sourceSha256:hash(srcFile),designSha256:hash(designFile),packSha256:hash(packFile),cliFound:cli.found,cliDrags:cli.drags,noBooster:true,noBombs:true,noChain:true,geometryWarnings:finalProof.geometry.analysis.warnings.length,strictOverlap:api.OVL.check(saved.design),allLinksAndGuidesEngaged:true,bodyAndMarginsPassed:true,roles:finalProof.roles.rows.map(x=>({kind:x.kind,label:x.label,ok:x.ok,prefixLength:x.prefix.length})),sourceReversal:reversal,modelComparison:compare,color:{palette:keys,used:[...new Set(objs.map(o=>o.color))],minNeighborDeltaE:minDeltaE,sameColorNeighbors:sameColor,radiusByColor:Object.fromEntries(keys.map(c=>[c,[...new Set(d.rings.filter(r=>r.color===c).map(r=>r.radius||1.75))]]))},profiles:Object.fromEntries(Object.entries(profiles).map(([k,v])=>[k,v.ok])),preview:{sameWorldScaleSourceAndNew:true,sourceView:srcView,newView,phaseView:pv,prefixLengths:prefixes.map(x=>x.length)}};
  save(path.join(OUT,stem+'-delivery.json'),summary);summaries.push(summary);
 }
 await sharp({create:{width:960,height:1180,channels:4,background:'#fff'}}).composite(images).png().toFile(path.join(OUT,'comparison.png'));
 await sharp({create:{width:1280,height:1100,channels:4,background:'#fff'}}).composite(phaseImages).png().toFile(path.join(OUT,'phases.png'));
 const report=path.join(ROOT,'report.md');save(path.join(OUT,'delivery-index.json'),{createdAt:new Date().toISOString(),report,reportSha256:hash(report),sourceReadOnly:true,approvedReferencesUntouched:true,levels:summaries,limits:'GD must assess changed silhouette and comparable human difficulty; source native rebuild may differ from custom source pin geometry. Current Designer only, no Unity Physics2D/campaign/save changes, no automatic schedule resume.'});console.log(JSON.stringify(summaries.map(s=>({stem:s.stem,profiles:s.profiles,roles:s.roles.length,color:s.color,model:[s.modelComparison.before.drags,s.modelComparison.after.drags]}))));
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
