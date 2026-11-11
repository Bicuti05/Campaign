"use strict";
// A053/BoardA53 (source10056): generate-only authoring (user decision 16/10/2026: GD finds solutions).
const fs=require('fs'),path=require('path'),{linkedColors}=require('./turp-a032-author'),{check}=require('./turp-a042-author');
const OUT=path.join(__dirname,'20261016-turp-a053-01');fs.mkdirSync(OUT,{recursive:true});
const G=4.9,BIG=2.15,STD=1.75;
function author(rev){
 const d={format:'turp-design',version:1,levelId:'draft',name:'Level 53',author:'Codex / TURP',notes:'',rings:[],sticks:[]},rings={};
 const ring=(id,x,y,gapDir,closed)=>{const o={id,x,y,radius:closed?BIG:STD,gapDir,gap:closed?0:90,lockCount:0,pins:[]};rings[id]=o;d.rings.push(o);return o;};
 const pin=(a,b)=>{const s=rings[a],t=rings[b],dist=Math.hypot(t.x-s.x,t.y-s.y),ang=(Math.atan2(t.y-s.y,t.x-s.x)*180/Math.PI+360)%360;s.pins.push({id:'to'+b,target:b,angle:+ang.toFixed(4),length:+(dist-t.radius-(s.radius+.25)).toFixed(4)});};
 const pinBar=(a,bar,angle,tip)=>{const s=rings[a];s.pins.push({id:'to'+bar,target:bar,angle,length:+(tip-(s.radius+.25)).toFixed(4)});};
 const st=o=>d.sticks.push(o);
 // Staircase of closed sources R1 (top-left), R2 (centre), R3 (lower-right); shared receivers sit between the steps.
 ring('R1',-G,3*G,0,true);ring('R2',0,2*G,0,true);ring('R3',G,G,0,true);
 ring('R4',-G,4*G,180);ring('R5',0,3*G,90);ring('R6',G,3*G,0);
 ring('R7',-G,2*G,180);ring('R8',G,2*G,0);ring('R9',-G,G,180);ring('R10',0,G,180);
 ring('R11',0,0,270);ring('R12',G,0,270);
 pin('R1','R4');pin('R1','R5');pin('R1','R7');pinBar('R1','S6',180,8.6-G);
 pin('R2','R5');pin('R2','R7');pin('R2','R8');pin('R2','R10');
 pin('R3','R8');pin('R3','R10');pin('R3','R12');pinBar('R3','S7',0,8.6-G);
 pin('R6','R8');pin('R7','R9');pin('R10','R11');pin('R12','R11');pinBar('R12','S7',0,8.6-G);
 // S1: left U through R7/R9 gaps; S2: right U through R6/R8 gaps (one row higher); S3: bottom U from below through R11/R12 gaps.
 st({id:'S1',x:-9,y:1.5*G,angle:0,path:[[4.1,G/2],[0,G/2],[0,-G/2],[4.1,-G/2]],slideAxis:[1,0],guides:[{x:-7.5,y:2*G,angle:0},{x:-7.5,y:G,angle:0}]});
 st({id:'S2',x:9,y:2.5*G,angle:0,path:[[-4.1,G/2],[0,G/2],[0,-G/2],[-4.1,-G/2]],slideAxis:[1,0],guides:[{x:7.5,y:3*G,angle:0},{x:7.5,y:2*G,angle:0}]});
 st({id:'S3',x:G/2,y:-4.1,angle:0,path:[[-G/2,4.1],[-G/2,0],[G/2,0],[G/2,4.1]],slideAxis:[0,1],guides:[{x:0,y:-2.6,angle:90},{x:G,y:-2.6,angle:90}]});
 // S4: L from the left into R4's gap, hook down capping S6; S5: L from above into R5's gap, hook right.
 st({id:'S4',x:-7.5,y:4*G,angle:0,path:[[2.6,0],[-1.1,0],[-1.1,-1.9]],slideAxis:[1,0],guides:[{x:-7.5,y:4*G,angle:0}]});
 st({id:'S5',x:0,y:17.3,angle:0,path:[[0,3*G-17.3],[0,4.2],[2.2,4.2]],slideAxis:[0,1],guides:[{x:0,y:17.3,angle:90}]});
 // S6: left pinbar of the top source R1, capped by S4's hook above and S1's top leg below.
 st({id:'S6',x:-8.6,y:14.5,angle:0,path:[[0,-2.5],[0,2.5]],slideAxis:[0,1]});
 // S7: right pinbar of R3 and R12, capped above by S2's lower leg.
 st({id:'S7',x:8.6,y:3.0,angle:0,path:[[0,-4.5],[0,4.5]],slideAxis:[0,1]});
 linkedColors(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const d=author(process.argv[2]||'01'),c=check(d),n=require('./turp-color-near.js')(d);console.log(JSON.stringify({warn:c.analysis.warnings,err:c.analysis.error,info:c.analysis.info,strict:c.strict,low:c.margins.filter(m=>m.margin<45),guides:c.guides.map(g=>g.engaged).join(),idle:c.links.filter(l=>!l.active).map(l=>l.source+'>'+l.target),color:n}));fs.writeFileSync(path.join(require('os').tmpdir(),'claude','a053-draft.rrdesign.json'),JSON.stringify(d,null,1));}
