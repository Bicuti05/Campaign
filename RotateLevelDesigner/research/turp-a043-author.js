"use strict";
// A043/source10053: generate-only authoring (user decision 16/10/2026: GD finds solutions; no solve/proof here).
const fs=require('fs'),path=require('path'),RR=require('../rr-core.js'),{api}=require('./turp-continue'),{linkedColors}=require('./turp-a032-author'),{check}=require('./turp-a042-author');
const OUT=path.join(__dirname,'20261016-turp-a043-01');fs.mkdirSync(OUT,{recursive:true});
const G=4.9,BIG=2.15,STD=1.75,X=[-7.35,-2.45,2.45,7.35],Y=[0,4.9,9.8,14.7,19.6];
function author(rev){
 const d={format:'turp-design',version:1,levelId:'draft',name:'Level 43',author:'Codex / TURP',notes:'',rings:[],sticks:[]},rings={};
 const ring=(id,c,r,gapDir,closed)=>{const o={id,x:X[c],y:Y[r],radius:closed?BIG:STD,gapDir,gap:closed?0:90,lockCount:0,pins:[]};rings[id]=o;d.rings.push(o);};
 const pin=(a,b)=>{const s=rings[a],t=rings[b],dist=Math.hypot(t.x-s.x,t.y-s.y),ang=(Math.atan2(t.y-s.y,t.x-s.x)*180/Math.PI+360)%360;s.pins.push({id:'to'+b,target:b,angle:+ang.toFixed(4),length:+(dist-t.radius-(s.radius+.25)).toFixed(4)});};
 const pinBar=(a,bar,angle,tip)=>{const s=rings[a];s.pins.push({id:'to'+bar,target:bar,angle,length:+(tip-(s.radius+.25)).toFixed(4)});};
 // Row4 (top): corner c0 removed; A,B,C. Row3: D,SRC1,E,F. Row2: G,H,SRC2,I. Row1: J,SRC3,K,L. Row0: M,N (corners removed).
 ring('R1',1,4,180);ring('R2',2,4,90);ring('R3',3,4,0);
 ring('R4',0,3,90);ring('R5',1,3,0,true);ring('R6',2,3,0);ring('R7',3,3,0);
 ring('R8',0,2,180);ring('R9',1,2,180);ring('R10',2,2,0,true);ring('R11',3,2,0);
 ring('R12',0,1,180);ring('R13',1,1,0,true);ring('R14',2,1,270);ring('R15',3,1,0);
 ring('R16',1,0,270);ring('R17',2,0,0);
 pin('R5','R1');pin('R5','R4');pin('R5','R6');pin('R5','R9');
 pin('R10','R6');pin('R10','R9');pin('R10','R11');pin('R10','R14');
 pin('R13','R9');pin('R13','R12');pin('R13','R14');pin('R13','R16');
 pin('R2','R1');pin('R2','R6');pin('R3','R2');pin('R3','R7');pin('R7','R11');
 pin('R4','R8');pin('R14','R15');pin('R16','R17');
 pinBar('R17','S6',270,G/2);
 // S1: guided U from the left through gaps of R8/R12 (rows2/1); S2: guided U from the right through gaps of R7/R11 (rows3/2).
 d.sticks.push({id:'S1',x:-11.5,y:(Y[2]+Y[1])/2,angle:0,path:[[4.15,G/2],[0,G/2],[0,-G/2],[4.15,-G/2]],slideAxis:[1,0],guides:[{x:-10,y:Y[2],angle:0},{x:-10,y:Y[1],angle:0}]});
 d.sticks.push({id:'S2',x:11.5,y:(Y[3]+Y[2])/2,angle:0,path:[[-4.15,G/2],[0,G/2],[0,-G/2],[-4.15,-G/2]],slideAxis:[1,0],guides:[{x:10,y:Y[3],angle:0},{x:10,y:Y[2],angle:0}]});
 // S3: L from the removed top-left corner down into R4's gap; exits up.
 d.sticks.push({id:'S3',x:X[0],y:17.3,angle:0,path:[[0,Y[3]-17.3],[0,1.4],[2.0,1.4]],slideAxis:[0,1],guides:[{x:X[0],y:17.3,angle:90}]});
 // S4: L from the right into R15's gap, foot down into the removed bottom-right corner; S5: L from below into R16's gap, foot left.
 d.sticks.push({id:'S4',x:10,y:Y[1],angle:0,path:[[X[3]-10,0],[1.5,0],[1.5,-4.4]],slideAxis:[1,0],guides:[{x:10,y:Y[1],angle:0}]});
 d.sticks.push({id:'S5',x:X[1],y:-2.6,angle:0,path:[[0,2.6],[0,-1.0],[-3.4,-1.0]],slideAxis:[0,1],guides:[{x:X[1],y:-2.6,angle:90}]});
 // S6: pinbar under R17, too long to clear R17 before touching S4's foot (right) or S5's leg (left).
 d.sticks.push({id:'S6',x:5.0,y:-G/2,angle:0,path:[[-3.9,0],[5.2,0]],slideAxis:[1,0]});
 linkedColors(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const d=author(process.argv[2]||'01'),c=check(d);console.log(JSON.stringify({warn:c.analysis.warnings,err:c.analysis.error,info:c.analysis.info,strict:c.strict,minMargin:c.minMargin,guides:c.guides.map(g=>g.engaged).join(),idle:c.links.filter(l=>!l.active).map(l=>l.source+'>'+l.target)}));fs.writeFileSync(path.join(require('os').tmpdir(),'claude','a043-draft.rrdesign.json'),JSON.stringify(d,null,1));}
