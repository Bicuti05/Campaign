"use strict";
// A052/BoardA52 (source70006): generate-only authoring (user decision 16/10/2026: GD finds solutions).
const fs=require('fs'),path=require('path'),{linkedColors}=require('./turp-a032-author'),{check}=require('./turp-a042-author');
const OUT=path.join(__dirname,'20261016-turp-a052-01');fs.mkdirSync(OUT,{recursive:true});
const G=4.9,BIG=2.15,STD=1.75,X=[-7.35,-2.45,2.45,7.35];
function author(rev){
 const d={format:'turp-design',version:1,levelId:'draft',name:'Level 52',author:'Codex / TURP',notes:'',rings:[],sticks:[]},rings={};
 const ring=(id,x,y,gapDir,closed)=>{const o={id,x,y,radius:closed?BIG:STD,gapDir,gap:closed?0:90,lockCount:0,pins:[]};rings[id]=o;d.rings.push(o);return o;};
 const pin=(a,b)=>{const s=rings[a],t=rings[b],dist=Math.hypot(t.x-s.x,t.y-s.y),ang=(Math.atan2(t.y-s.y,t.x-s.x)*180/Math.PI+360)%360;s.pins.push({id:'to'+b,target:b,angle:+ang.toFixed(4),length:+(dist-t.radius-(s.radius+.25)).toFixed(4)});};
 const pinBar=(a,bar,angle,tip)=>{const s=rings[a];s.pins.push({id:'to'+bar,target:bar,angle,length:+(tip-(s.radius+.25)).toFixed(4)});};
 const st=o=>d.sticks.push(o);
 // Rectangular frame (top-left and bottom-left corners removed) around two diagonal closed sources.
 ring('R1',X[1],0,180);ring('R2',X[2],0,270);ring('R3',X[3],0,0);
 ring('R4',X[0],G,270);ring('R5',X[0],2*G,180);ring('R6',X[0],3*G,180);
 ring('R7',X[3],G,0);ring('R8',X[3],2*G,0);ring('R9',X[3],3*G,0);
 ring('R10',X[1],4*G,180);ring('R11',X[2],4*G,90);ring('R12',X[3],4*G,0);
 ring('R13',X[1],1.5*G,0,true);ring('R14',X[2],2.5*G,0,true);
 pin('R13','R4');pin('R13','R5');pin('R13','R1');pinBar('R13','S1',0,G);
 pin('R14','R8');pin('R14','R9');pin('R14','R11');pinBar('R14','S2',180,G);
 pin('R5','R6');pinBar('R6','S2',0,G);pin('R1','R2');pin('R2','R3');pin('R3','R7');pin('R8','R7');pinBar('R7','S1',180,G);
 pin('R10','R11');pin('R11','R12');pin('R12','R9');
 // S1/S2: inner vertical pinbars; each takes one closed source and one frame ring, capped above and below by rings.
 st({id:'S1',x:X[2],y:6.25,angle:0,path:[[0,-2.75],[0,2.75]],slideAxis:[0,1]});
 st({id:'S2',x:X[1],y:13.35,angle:0,path:[[0,-2.75],[0,2.75]],slideAxis:[0,1]});
 // S3: left U through R5/R6 gaps (upper); S4: right U through R7/R8 gaps (lower); equal legs, one Guide per leg.
 st({id:'S3',x:-11.45,y:2.5*G,angle:0,path:[[4.1,G/2],[0,G/2],[0,-G/2],[4.1,-G/2]],slideAxis:[1,0],guides:[{x:-9.95,y:3*G,angle:0},{x:-9.95,y:2*G,angle:0}]});
 st({id:'S4',x:11.45,y:1.5*G,angle:0,path:[[-4.1,G/2],[0,G/2],[0,-G/2],[-4.1,-G/2]],slideAxis:[1,0],guides:[{x:9.95,y:2*G,angle:0},{x:9.95,y:G,angle:0}]});
 // Corner Ls: S5 from below into R4 (removed bottom-left), S6 from below into R2, S7 from the left into R10 (removed top-left), S8 from the right into R9.
 st({id:'S5',x:X[0],y:G-2.6,angle:0,path:[[0,2.6],[0,-1.4],[2.0,-1.4]],slideAxis:[0,1],guides:[{x:X[0],y:G-2.6,angle:90}]});
 st({id:'S6',x:X[2],y:-2.6,angle:0,path:[[0,2.6],[0,-1.0],[3.2,-1.0]],slideAxis:[0,1],guides:[{x:X[2],y:-2.6,angle:90}]});
 st({id:'S7',x:X[1]-2.6,y:4*G,angle:0,path:[[2.6,0],[-1.1,0],[-1.1,-2.2]],slideAxis:[1,0],guides:[{x:X[1]-2.6,y:4*G,angle:0}]});
 st({id:'S8',x:X[3]+2.6,y:3*G,angle:0,path:[[-2.6,0],[1.1,0],[1.1,2.0]],slideAxis:[1,0],guides:[{x:X[3]+2.6,y:3*G,angle:0}]});
 linkedColors(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const d=author(process.argv[2]||'01'),c=check(d),n=require('./turp-color-near.js')(d);console.log(JSON.stringify({warn:c.analysis.warnings,err:c.analysis.error,info:c.analysis.info,strict:c.strict,low:c.margins.filter(m=>m.margin<45),guides:c.guides.map(g=>g.engaged).join(),idle:c.links.filter(l=>!l.active).map(l=>l.source+'>'+l.target),color:n}));fs.writeFileSync(path.join(require('os').tmpdir(),'claude','a052-draft.rrdesign.json'),JSON.stringify(d,null,1));}
