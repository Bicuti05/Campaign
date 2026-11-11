"use strict";
// A044/source70007: generate-only authoring (user decision 16/10/2026: GD finds solutions; no solve/proof here).
const fs=require('fs'),path=require('path'),{linkedColors}=require('./turp-a032-author'),{check}=require('./turp-a042-author');
const OUT=path.join(__dirname,'20261016-turp-a044-01');fs.mkdirSync(OUT,{recursive:true});
const G=4.9,BIG=2.15,STD=1.75,X=[-G,0,G],Y=[0,G,2*G,3*G,4*G];
function author(rev){
 const d={format:'turp-design',version:1,levelId:'draft',name:'Level 44',author:'Codex / TURP',notes:'',rings:[],sticks:[]},rings={};
 const ring=(id,c,r,gapDir,closed)=>{const o={id,x:X[c],y:Y[r],radius:closed?BIG:STD,gapDir,gap:closed?0:90,lockCount:0,pins:[]};rings[id]=o;d.rings.push(o);};
 const pin=(a,b)=>{const s=rings[a],t=rings[b],dist=Math.hypot(t.x-s.x,t.y-s.y),ang=(Math.atan2(t.y-s.y,t.x-s.x)*180/Math.PI+360)%360;s.pins.push({id:'to'+b,target:b,angle:+ang.toFixed(4),length:+(dist-t.radius-(s.radius+.25)).toFixed(4)});};
 const pinBar=(a,bar,angle,tip)=>{const s=rings[a];s.pins.push({id:'to'+bar,target:bar,angle,length:+(tip-(s.radius+.25)).toFixed(4)});};
 ring('R1',0,4,180);ring('R2',1,4,0);
 ring('R3',0,3,180);ring('R4',1,3,0,true);ring('R5',2,3,0);
 ring('R6',0,2,0,true);ring('R7',1,2,270);ring('R8',2,2,0);
 ring('R9',0,1,180);ring('R10',1,1,90);ring('R11',2,1,0,true);
 ring('R12',1,0,270);ring('R13',2,0,0);
 pin('R4','R2');pin('R4','R3');pin('R4','R5');pin('R4','R7');
 pin('R6','R3');pin('R6','R7');pin('R6','R9');pinBar('R6','S4',180,8.4-G);
 pin('R11','R8');pin('R11','R10');pin('R11','R13');
 pin('R2','R1');pin('R1','R3');pin('R7','R8');pin('R9','R10');pin('R10','R12');pin('R12','R13');
 // S1: L from the removed top-right corner into R2's gap, foot down.
 d.sticks.push({id:'S1',x:2.6,y:Y[4],angle:0,path:[[-2.6,0],[1.4,0],[1.4,-1.9]],slideAxis:[1,0],guides:[{x:2.6,y:Y[4],angle:0}]});
 // S2: guided U from the right through the gaps of R5/R8, equal legs4.1, one Guide per leg.
 d.sticks.push({id:'S2',x:9,y:(Y[3]+Y[2])/2,angle:0,path:[[-4.1,G/2],[0,G/2],[0,-G/2],[-4.1,-G/2]],slideAxis:[1,0],guides:[{x:7.5,y:Y[3],angle:0},{x:7.5,y:Y[2],angle:0}]});
 // S3/S5: L brackets from the left into R3/R9 gaps; their equal hooks cap the pinbar S4 (held by closed R6) both ways.
 d.sticks.push({id:'S3',x:-7.6,y:Y[3],angle:0,path:[[G-(-7.6)-2*G,0],[-.8,0],[-.8,-2.1]],slideAxis:[1,0],guides:[{x:-7.6,y:Y[3],angle:0}]});
 d.sticks.push({id:'S4',x:-8.4,y:9.8,angle:0,path:[[0,-1.8],[0,1.8]],slideAxis:[0,1]});
 d.sticks.push({id:'S5',x:-7.6,y:Y[1],angle:0,path:[[G-(-7.6)-2*G,0],[-.8,0],[-.8,2.1]],slideAxis:[1,0],guides:[{x:-7.6,y:Y[1],angle:0}]});
 // S6: L from below into R12's gap, foot left into the removed bottom-left corner; S7: L from the right into R13's gap, hook up.
 d.sticks.push({id:'S6',x:0,y:-2.6,angle:0,path:[[0,2.6],[0,-1.0],[-3.6,-1.0]],slideAxis:[0,1],guides:[{x:0,y:-2.6,angle:90}]});
 d.sticks.push({id:'S7',x:7.5,y:0,angle:0,path:[[-2.6,0],[1.1,0],[1.1,2.4]],slideAxis:[1,0],guides:[{x:7.5,y:0,angle:0}]});
 linkedColors(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const d=author(process.argv[2]||'01'),c=check(d);console.log(JSON.stringify({warn:c.analysis.warnings,err:c.analysis.error,info:c.analysis.info,strict:c.strict,minMargin:c.minMargin,guides:c.guides.map(g=>g.engaged).join(),idle:c.links.filter(l=>!l.active).map(l=>l.source+'>'+l.target)}));fs.writeFileSync(path.join(require('os').tmpdir(),'claude','a044-draft.rrdesign.json'),JSON.stringify(d,null,1));}
