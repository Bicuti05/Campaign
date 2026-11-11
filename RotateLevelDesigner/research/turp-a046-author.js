"use strict";
// A046/source60023: generate-only authoring (user decision 16/10/2026: GD finds solutions; no solve/proof here).
const fs=require('fs'),path=require('path'),{linkedColors}=require('./turp-a032-author'),{check}=require('./turp-a042-author');
const OUT=path.join(__dirname,'20261016-turp-a046-01');fs.mkdirSync(OUT,{recursive:true});
const G=4.9,H=+(G*Math.sqrt(3)/2).toFixed(4),BIG=2.15,STD=1.75;
function author(rev){
 const d={format:'turp-design',version:1,levelId:'draft',name:'Level 46',author:'Codex / TURP',notes:'',rings:[],sticks:[]},rings={};
 const ring=(id,x,y,gapDir,closed)=>{const o={id,x,y,radius:closed?BIG:STD,gapDir,gap:closed?0:90,lockCount:0,pins:[]};rings[id]=o;d.rings.push(o);return o;};
 const pin=(a,b)=>{const s=rings[a],t=rings[b],dist=Math.hypot(t.x-s.x,t.y-s.y),ang=(Math.atan2(t.y-s.y,t.x-s.x)*180/Math.PI+360)%360;s.pins.push({id:'to'+b,target:b,angle:+ang.toFixed(4),length:+(dist-t.radius-(s.radius+.25)).toFixed(4)});};
 const pinBar=(a,bar,angle,tip)=>{const s=rings[a];s.pins.push({id:'to'+bar,target:bar,angle,length:+(tip-(s.radius+.25)).toFixed(4)});};
 // Brick (hex) rows, every ring upright: row0 A,B; row1 C,D*,E; row2 F,G; row3 Hh,I*,J; row4 K,L (* closed sources).
 ring('R1',-G/2,0,180);ring('R2',G/2,0,270);
 ring('R3',-G,H,270);ring('R4',0,H,0,true);ring('R5',G,H,0);
 ring('R6',-G/2,2*H,0);ring('R7',G/2,2*H,180);
 ring('R8',-G,3*H,90);ring('R9',0,3*H,0,true);ring('R10',G,3*H,0);
 ring('R11',-G/2,4*H,90);ring('R12',G/2,4*H,90);
 pin('R4','R1');pin('R4','R2');pin('R4','R3');pin('R4','R7');
 pin('R9','R6');pin('R9','R10');pin('R9','R11');pin('R9','R12');
 pin('R1','R2');pin('R2','R5');pin('R3','R6');pin('R6','R8');pin('R7','R5');pin('R7','R10');pin('R11','R12');
 pinBar('R3','S1',180,8.5-G);pinBar('R8','S1',180,8.5-G);
 // S1: shared pinbar on the left for receivers R3/R8; down releases R8, up releases R3; S2's hook caps it from below.
 d.sticks.push({id:'S1',x:-8.5,y:8.5,angle:0,path:[[0,-6.0],[0,6.0]],slideAxis:[0,1]});
 // S2: L from the left into R1's gap, long leg with hook up under S1. S3: L from below into R2's gap, foot right.
 d.sticks.push({id:'S2',x:-6.4,y:0,angle:0,path:[[G/2+(-6.4)*-1-G,0],[-2.1,0],[-2.1,1.5]],slideAxis:[1,0],guides:[{x:-6.4,y:0,angle:0}]});
 d.sticks.push({id:'S3',x:G/2,y:-2.6,angle:0,path:[[0,2.6],[0,-1.0],[4.2,-1.0]],slideAxis:[0,1],guides:[{x:G/2,y:-2.6,angle:90}]});
 // S4/S5: L from the right into R5/R10 gaps, hooks toward the open right corners.
 d.sticks.push({id:'S4',x:7.5,y:H,angle:0,path:[[-2.6,0],[1.1,0],[1.1,-2.4]],slideAxis:[1,0],guides:[{x:7.5,y:H,angle:0}]});
 d.sticks.push({id:'S5',x:7.5,y:3*H,angle:0,path:[[-2.6,0],[1.1,0],[1.1,2.4]],slideAxis:[1,0],guides:[{x:7.5,y:3*H,angle:0}]});
 // S6: U from above through the top gaps of R11/R12, legs4.1 equal, one Guide per leg.
 d.sticks.push({id:'S6',x:0,y:4*H+4.1,angle:0,path:[[-G/2,-4.1],[-G/2,0],[G/2,0],[G/2,-4.1]],slideAxis:[0,1],guides:[{x:-G/2,y:4*H+2.6,angle:90},{x:G/2,y:4*H+2.6,angle:90}]});
 linkedColors(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const d=author(process.argv[2]||'01'),c=check(d),n=require('./turp-color-near.js')(d);console.log(JSON.stringify({warn:c.analysis.warnings,err:c.analysis.error,info:c.analysis.info,strict:c.strict,low:c.margins.filter(m=>m.margin<45),guides:c.guides.map(g=>g.engaged).join(),idle:c.links.filter(l=>!l.active).map(l=>l.source+'>'+l.target),color:n}));fs.writeFileSync(path.join(require('os').tmpdir(),'claude','a046-draft.rrdesign.json'),JSON.stringify(d,null,1));}
