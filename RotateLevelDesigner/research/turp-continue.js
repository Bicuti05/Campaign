"use strict";
// Reviewed TURP helpers are loaded read-only; all candidates and evidence stay here.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),Module=require('module');
const CORE=path.resolve(__dirname,'..'),ROOT='C:/Project Folder/TURPLevel',OUT=path.join(__dirname,'20261015-turp-continuation-01');
fs.mkdirSync(OUT,{recursive:true});
const sourceFile=path.join(ROOT,'LevelVariants/variant.js');
const text=fs.readFileSync(sourceFile,'utf8');
let prefix=text.slice(0,text.indexOf('// ---------- chính ----------')).replace(/^#![^\n]*\n/,'');
// Authoring adapter only; upstream and engine untouched. Restrict newly added bars.
prefix=prefix.replace('[0, 90, 180, 270, 45, 135, 225, 315]','[0, 90, 180, 270]');
const api=new Function('require','__dirname','process',prefix+`\nreturn {loadDesign,build,gate,baselineOf,relax,geomTransform,sizeVary,outlineMutate,relinkOps,applyOp,recolor,aspectOf,ringLinks,solve,planProfile,removalOrder,stickWorld,clone,pick,uni,margin,OVL,touchGraph,PALETTE,dE,setBase(d){BASE=baselineOf(RR.analyze(build(d)));SRC_OVL=new Map(OVL.check(d).map(x=>[[x.a,x.b].sort().join('|'),x.depth]));},reseed(n){seed=n>>>0;}};`)(Module.createRequire(sourceFile),path.dirname(sourceFile),{argv:['node','adapter','--core',CORE,'--out',OUT,'--repair','--outline','--solve','8'],env:{}});
const RR=require('../rr-core.js');
const write=(name,data)=>fs.writeFileSync(path.join(OUT,name),JSON.stringify(data,null,2)+'\n',{flag:'wx'});
function clean(d){for(const k of Object.keys(d))if(k.startsWith('_'))delete d[k];for(const s of d.sticks||[])for(const k of Object.keys(s))if(k.startsWith('_'))delete s[k];return d;}
function marginFix(d){for(const r of d.rings){r.lockCount=0;if(r.gap===0)continue;const pins=r.pins||[];if(!pins.length)continue;if(pins.every(p=>api.margin(r,p.angle)>=45.1))continue;let best=null;for(let off=-20;off<=20;off+=.5){const dir=((r.gapDir||0)+off+360)%360;const min=Math.min(...pins.map(p=>api.margin({...r,gapDir:dir,gap:80},p.angle)));if(min>=45.1&&(!best||Math.abs(off)<best.off))best={min,dir,off:Math.abs(off)};}if(!best)return false;r.gap=80;r.gapDir=best.dir;}return true;}
function colorSizes(d){
  // Exact radius classes for repeated colors: no same-color differently sized rings.
  const radii=[1.6,1.85,2.15],groups=[['blue','orange','purple'],['red','green'],['navy','teal']];
  for(const r of d.rings){let k=0;for(let j=1;j<radii.length;j++)if(Math.abs((r.radius||1.75)-radii[j])<Math.abs((r.radius||1.75)-radii[k]))k=j;r.radius=radii[k];r._sizeClass=k;}
  d=api.relax(d);api.recolor(d);
  const {objs,E}=api.touchGraph(d),colors=new Map(),ordered=objs.slice().sort((a,b)=>E[objs.indexOf(b)].size-E[objs.indexOf(a)].size);
  function dfs(k){if(k===ordered.length)return true;const o=ordered[k],i=objs.indexOf(o),r=d.rings.find(r=>r.id===o.id);const choices=r?groups[r._sizeClass]:RR.Color.KEYS;
    for(const c of choices){if([...E[i]].some(j=>colors.has(objs[j].id)&&colors.get(objs[j].id)===c))continue;colors.set(o.id,c);if(dfs(k+1))return true;colors.delete(o.id);}return false;}
  if(!dfs(0))return null;for(const o of [...d.rings,...d.sticks])o.color=colors.get(o.id);for(const r of d.rings)delete r._sizeClass;return d;
}
if(require.main===module){const id=process.argv[2]||'10014',seed0=+(process.argv[3]||1400),count=+(process.argv[4]||60);const src=api.loadDesign(path.join(ROOT,'LevelVariants/sources/Level'+id+'.rrdesign.json'));api.setBase(src);let base=api.relax(src);base.rings.forEach(r=>r.stops=[]);api.setBase(base);const reasons={},accepted=[];
  for(let n=0;n<count;n++){api.reseed(seed0+n);let d=api.outlineMutate(base);const outline=d._outline||[];if(outline.filter(x=>x.startsWith('bỏ vòng')).length<2||!outline.some(x=>x.startsWith('thêm thanh'))){reasons.outline=(reasons.outline||0)+1;continue;}
    d=api.geomTransform(d,{flipH:true,flipV:false,rot:180,rScale:1,field:{ax:.12,ay:.1,kx:.1,ky:.12,px:1,py:2},jit:0});
    d=api.sizeVary(d);d=colorSizes(d);if(!d){reasons.colors=(reasons.colors||0)+1;continue;}
    const ops=api.relinkOps(d).filter(o=>o.kind==='reverse'||o.kind==='retarget');if(!ops.length)continue;const op=api.pick(ops);api.applyOp(d,op);if(!marginFix(d)){reasons.margin=(reasons.margin||0)+1;continue;}
    for(const r of d.rings)delete r._sizeClass;
    const g=api.gate(d);if(!g.ok){reasons[g.why]=(reasons[g.why]||0)+1;continue;}
    if(g.analysis.warnings.length){reasons.warnings=(reasons.warnings||0)+1;continue;}
    const r=api.solve(g.level,false);if(!r.found){reasons.unsolved=(reasons.unsolved||0)+1;continue;}
    d=clean(d);d.levelId='draft';d.name='TURP '+id+' — outline proposal';d.author='Codex / TURP continuation';d.notes='Đề xuất đổi viền theo report.md 15/10; chưa GD duyệt. '+outline.join('; ')+'. Đổi cấu trúc: '+JSON.stringify(op)+'. Kéo thanh giải phóng nguồn pin trước khi quay vòng nhận; màu không đổi cơ chế.';
    const stem=id+'-seed'+(seed0+n);write(stem+'.rrdesign.json',d);write(stem+'-search.json',{outline,op,route:r.route,moves:r.moves,removalOrder:r.removalOrder,analysis:g.analysis,source:sourceFile});accepted.push(stem);console.log('FOUND '+stem+' '+d.rings.length+'R '+d.sticks.length+'S '+r.moves.length+' drags');if(accepted.length>=2)break;
  }
  write(id+'-search-'+seed0+'.json',{accepted,reasons,upstreamSha256:crypto.createHash('sha256').update(text).digest('hex'),reportSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'report.md'))).digest('hex')});console.log(JSON.stringify({accepted,reasons}));
}
module.exports={api,RR,OUT,ROOT,CORE,write,clean,marginFix,colorSizes};
