"use strict";
// A049/source10025: generate-only authoring (user decision 16/10/2026: GD finds solutions; no solve/proof here).
const fs=require('fs'),path=require('path'),{linkedColors}=require('./turp-a032-author'),{check}=require('./turp-a042-author');
const OUT=path.join(__dirname,'20261016-turp-a049-01');fs.mkdirSync(OUT,{recursive:true});
const G=4.9,BIG=2.15,STD=1.75,TX=3.6;
function author(rev){
 const d={format:'turp-design',version:1,levelId:'draft',name:'Level 49',author:'Codex / TURP',notes:'',rings:[],sticks:[]},rings={};
 const ring=(id,x,y,gapDir,closed)=>{const o={id,x,y,radius:closed?BIG:STD,gapDir,gap:closed?0:90,lockCount:0,pins:[]};rings[id]=o;d.rings.push(o);return o;};
 const pin=(a,b)=>{const s=rings[a],t=rings[b],dist=Math.hypot(t.x-s.x,t.y-s.y),ang=(Math.atan2(t.y-s.y,t.x-s.x)*180/Math.PI+360)%360;s.pins.push({id:'to'+b,target:b,angle:+ang.toFixed(4),length:+(dist-t.radius-(s.radius+.25)).toFixed(4)});};
 const pinBar=(a,bar,angle,tip)=>{const s=rings[a];s.pins.push({id:'to'+bar,target:bar,angle,length:+(tip-(s.radius+.25)).toFixed(4)});};
 const st=o=>d.sticks.push(o);
 // Left tower (half-row offset) and right tower; closed sources cap the central pinbar from below and above.
 ring('R1',-TX,G/2,180);ring('R2',-TX,1.5*G,180);ring('R3',-TX,2.5*G,180);
 ring('R4',TX,0,0);ring('R5',TX,G,0);ring('R6',TX,2*G,0);ring('R7',TX,3*G,0);
 ring('R8',0,-3.6,0,true);ring('R9',0,3*G+3.6,0,true);
 pin('R8','R4');pin('R8','R1');pin('R9','R7');pin('R9','R3');
 pin('R1','R2');pin('R3','R2');pin('R4','R5');pin('R7','R6');
 pinBar('R2','S1',0,TX);pinBar('R5','S1',180,TX);pinBar('R6','S1',180,TX);
 // Stop on R3 facing the central bar, on material opposite its gap.
 rings.R3.stops=[{angle:0,length:.9}];
 // S1: long central pinbar of three receivers, capped by R8 below and R9 above.
 st({id:'S1',x:0,y:7.5,angle:0,path:[[0,-7.5],[0,7.5]],slideAxis:[0,1]});
 // S2: left U through R1/R2 gaps; S3: L from the left into R3, hook up.
 st({id:'S2',x:-7.7,y:G,angle:0,path:[[4.1,G/2],[0,G/2],[0,-G/2],[4.1,-G/2]],slideAxis:[1,0],guides:[{x:-6.2,y:1.5*G,angle:0},{x:-6.2,y:G/2,angle:0}]});
 st({id:'S3',x:-6.2,y:2.5*G,angle:0,path:[[2.6,0],[-1.1,0],[-1.1,2.3]],slideAxis:[1,0],guides:[{x:-6.2,y:2.5*G,angle:0}]});
 // S4: right U through R6/R7 gaps; S5/S6: L from the right into R5/R4, hooks down.
 st({id:'S4',x:7.7,y:2.5*G,angle:0,path:[[-4.1,G/2],[0,G/2],[0,-G/2],[-4.1,-G/2]],slideAxis:[1,0],guides:[{x:6.2,y:3*G,angle:0},{x:6.2,y:2*G,angle:0}]});
 st({id:'S5',x:6.2,y:G,angle:0,path:[[-2.6,0],[1.1,0],[1.1,-2.0]],slideAxis:[1,0],guides:[{x:6.2,y:G,angle:0}]});
 st({id:'S6',x:6.2,y:0,angle:0,path:[[-2.6,0],[1.1,0],[1.1,-2.3]],slideAxis:[1,0],guides:[{x:6.2,y:0,angle:0}]});
 linkedColors(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const d=author(process.argv[2]||'01'),c=check(d),n=require('./turp-color-near.js')(d);console.log(JSON.stringify({warn:c.analysis.warnings,err:c.analysis.error,info:c.analysis.info,strict:c.strict,low:c.margins.filter(m=>m.margin<45),guides:c.guides.map(g=>g.engaged).join(),idle:c.links.filter(l=>!l.active).map(l=>l.source+'>'+l.target),color:n}));fs.writeFileSync(path.join(require('os').tmpdir(),'claude','a049-draft.rrdesign.json'),JSON.stringify(d,null,1));}
