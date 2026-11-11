"use strict";
// A048/source60007: generate-only authoring (user decision 16/10/2026: GD finds solutions; no solve/proof here).
const fs=require('fs'),path=require('path'),{linkedColors}=require('./turp-a032-author'),{check}=require('./turp-a042-author');
const OUT=path.join(__dirname,'20261016-turp-a048-01');fs.mkdirSync(OUT,{recursive:true});
const G=4.9,BIG=2.15,STD=1.75;
function author(rev){
 const d={format:'turp-design',version:1,levelId:'draft',name:'Level 48',author:'Codex / TURP',notes:'',rings:[],sticks:[]},rings={};
 const ring=(id,x,y,gapDir,closed)=>{const o={id,x,y,radius:closed?BIG:STD,gapDir,gap:closed?0:90,lockCount:0,pins:[]};rings[id]=o;d.rings.push(o);return o;};
 const pin=(a,b)=>{const s=rings[a],t=rings[b],dist=Math.hypot(t.x-s.x,t.y-s.y),ang=(Math.atan2(t.y-s.y,t.x-s.x)*180/Math.PI+360)%360;s.pins.push({id:'to'+b,target:b,angle:+ang.toFixed(4),length:+(dist-t.radius-(s.radius+.25)).toFixed(4)});};
 const pinBar=(a,bar,angle,tip)=>{const s=rings[a];s.pins.push({id:'to'+bar,target:bar,angle,length:+(tip-(s.radius+.25)).toFixed(4)});};
 const st=o=>d.sticks.push(o);
 // Left column R1–R4 (top→bottom), right column R5–R8, closed top R9 and bottom R10 cap the central channel.
 ring('R1',-G,3*G,180);ring('R2',-G,2*G,180);ring('R3',-G,G,0);ring('R4',-G,0,180);
 ring('R5',G,3*G,0);ring('R6',G,2*G,0);ring('R7',G,G,0);ring('R8',G,0,0);
 ring('R9',0,3.5*G,0,true);ring('R10',0,-1.5,0,true);
 pin('R9','R1');pin('R9','R5');pin('R10','R4');pin('R10','R8');
 pin('R1','R2');pin('R2','R3');pin('R4','R3');pin('R5','R6');pin('R6','R7');pin('R8','R7');
 pinBar('R2','S1',0,G-.6);pinBar('R6','S2',180,G-.6);
 // S1/S2: interlocking vertical Ls in the channel (source's horizontal pair turned upright), each a Guided pinbar.
 st({id:'S1',x:-.6,y:6.5,angle:0,path:[[0,11.5-6.5],[0,4.0-6.5],[2.6,4.0-6.5]],slideAxis:[0,1],guides:[{x:-.6,y:6.5,angle:90}]});
 st({id:'S2',x:.6,y:11.0,angle:0,path:[[0,5.0-11.0],[0,12.5-11.0],[-2.6,12.5-11.0]],slideAxis:[0,1],guides:[{x:.6,y:11.0,angle:90}]});
 // S3: left U through R1/R2 gaps (upper rows); S4: right U through R7/R8 gaps (lower rows); equal legs, one Guide per leg.
 st({id:'S3',x:-9,y:2.5*G,angle:0,path:[[4.1,G/2],[0,G/2],[0,-G/2],[4.1,-G/2]],slideAxis:[1,0],guides:[{x:-7.5,y:3*G,angle:0},{x:-7.5,y:2*G,angle:0}]});
 st({id:'S4',x:9,y:.5*G,angle:0,path:[[-4.1,G/2],[0,G/2],[0,-G/2],[-4.1,-G/2]],slideAxis:[1,0],guides:[{x:7.5,y:G,angle:0},{x:7.5,y:0,angle:0}]});
 // S5: L from the right into R5's gap, hook up; S6: L from the left into R4's gap, hook down.
 st({id:'S5',x:7.5,y:3*G,angle:0,path:[[-2.6,0],[1.1,0],[1.1,2.3]],slideAxis:[1,0],guides:[{x:7.5,y:3*G,angle:0}]});
 st({id:'S6',x:-7.5,y:0,angle:0,path:[[2.6,0],[-1.1,0],[-1.1,-2.3]],slideAxis:[1,0],guides:[{x:-7.5,y:0,angle:0}]});
 linkedColors(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const d=author(process.argv[2]||'01'),c=check(d),n=require('./turp-color-near.js')(d);console.log(JSON.stringify({warn:c.analysis.warnings,err:c.analysis.error,info:c.analysis.info,strict:c.strict,low:c.margins.filter(m=>m.margin<45),guides:c.guides.map(g=>g.engaged).join(),idle:c.links.filter(l=>!l.active).map(l=>l.source+'>'+l.target),color:n}));fs.writeFileSync(path.join(require('os').tmpdir(),'claude','a048-draft.rrdesign.json'),JSON.stringify(d,null,1));}
