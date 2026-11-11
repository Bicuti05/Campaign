"use strict";
// A042/source10043: generate-only authoring (user decision 16/10/2026: GD finds solutions; no solve/proof here).
const fs=require('fs'),path=require('path'),RR=require('../rr-core.js'),{api}=require('./turp-continue'),{linkedColors}=require('./turp-a032-author');
const OUT=path.join(__dirname,'20261016-turp-a042-01');fs.mkdirSync(OUT,{recursive:true});
const G=4.9,BIG=2.15,STD=1.75;
function author(rev){
 const d={format:'turp-design',version:1,levelId:'draft',name:'Level 42',author:'Codex / TURP',notes:'',rings:[],sticks:[]};
 const rings={};
 const ring=(id,x,y,gapDir,closed)=>{const r={id,x,y,radius:closed?BIG:STD,gapDir,gap:closed?0:90,lockCount:0,pins:[]};rings[id]=r;d.rings.push(r);return r;};
 // pin from ring to ring: tip on target centerline.
 const pin=(a,b)=>{const s=rings[a],t=rings[b],dx=t.x-s.x,dy=t.y-s.y,dist=Math.hypot(dx,dy),ang=(Math.atan2(dy,dx)*180/Math.PI+360)%360;s.pins.push({id:'to'+b,target:b,angle:+ang.toFixed(4),length:+(dist-t.radius-(s.radius+.25)).toFixed(4)});};
 // pin from ring into a bar at distance `tip` from the ring centre along `angle`.
 const pinBar=(a,bar,angle,tip)=>{const s=rings[a];s.pins.push({id:'to'+bar,target:bar,angle,length:+(tip-(s.radius+.25)).toFixed(4)});};
 ring('R1',-G,4*G,180);ring('R2',0,4*G,0,true);ring('R3',G,4*G,90);
 ring('R4',-G,3*G,180);ring('R5',0,3*G,270);ring('R6',G,3*G,270);
 ring('R7',-G,2*G,0,true);ring('R8',0,2*G,90);ring('R9',G,2*G,90);
 ring('R10',-G/2,G,270);ring('R11',G/2,G,0);
 ring('R12',0,0,270);
 pin('R2','R1');pin('R2','R3');pin('R2','R5');
 pin('R5','R4');pin('R5','R6');
 pin('R7','R4');pin('R7','R8');pin('R7','R10');
 pin('R8','R9');pin('R9','R11');
 pin('R10','R11');pin('R11','R12');
 pinBar('R3','S2',0,8.0-G);pinBar('R6','S2',0,8.0-G);pinBar('R10','S4',180,G/2);pinBar('R12','S6',0,3.7);
 // S1: guided U from the left through the gaps of R1/R4, equal legs4.1, one Guide per leg.
 d.sticks.push({id:'S1',x:-9,y:3.5*G,angle:0,path:[[4.1,G/2],[0,G/2],[0,-G/2],[4.1,-G/2]],slideAxis:[1,0],guides:[{x:-7.5,y:4*G,angle:0},{x:-7.5,y:3*G,angle:0}]});
 // S2: shared pinbar right of R3/R6 (two sources), slides vertically along the pierced segment.
 d.sticks.push({id:'S2',x:8.0,y:16.95,angle:0,path:[[0,-4.05],[0,4.05]],slideAxis:[0,1]});
 // S3: L into R12 gap from below; S4: pinbar held by R10 under the closed source R7; S5: L into R11 gap from the right.
 d.sticks.push({id:'S3',x:0,y:-2.6,angle:0,path:[[0,2.6],[0,-1.0],[4.3,-1.0]],slideAxis:[0,1],guides:[{x:0,y:-2.6,angle:90}]});
 d.sticks.push({id:'S4',x:-G,y:3.7,angle:0,path:[[0,-2.9],[0,2.9]],slideAxis:[0,1]});
 d.sticks.push({id:'S5',x:5.4,y:G,angle:0,path:[[-2.95,0],[1.6,0],[1.6,-2.4]],slideAxis:[1,0],guides:[{x:5.4,y:G,angle:0}]});
 // S6: pinbar right of R12, held by R12; its downward release is blocked by the foot of S3 until S3 leaves.
 d.sticks.push({id:'S6',x:3.7,y:.15,angle:0,path:[[0,-2.45],[0,2.45]],slideAxis:[0,1]});
 linkedColors(d);
 return d;
}
function check(d){
 const lv=RR.Design.toLevel(d).level,an=RR.analyze(lv),strict=api.OVL.check(d);
 const margins=d.rings.filter(r=>r.gap).flatMap(r=>(r.pins||[]).map(p=>({ring:r.id,pin:p.id,margin:+api.margin(r,p.angle).toFixed(2)})));
 const s=new RR.Simulation(lv,RR.Tuning.defaults()),w=s.world;
 const guides=w.guides.map((g,i)=>({id:g.id,engaged:w.guideEngaged(i)}));
 const links=s.snapshot().links;
 return {analysis:an,strict,minMargin:Math.min(...margins.map(m=>m.margin)),margins,guides,links};
}
module.exports={author,check,OUT};
if(require.main===module){const d=author(process.argv[2]||'01'),c=check(d);console.log(JSON.stringify({warn:c.analysis.warnings,err:c.analysis.error,info:c.analysis.info,strict:c.strict,minMargin:c.minMargin,guides:c.guides,links:c.links&&c.links.map(l=>l.source+'>'+l.target+(l.active?'':'(idle)'))}));fs.writeFileSync(path.join(require('os').tmpdir(),'claude','a042-draft.rrdesign.json'),JSON.stringify(d,null,1));}
