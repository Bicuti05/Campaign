"use strict";
// A047/source10054: generate-only authoring (user decision 16/10/2026: GD finds solutions; no solve/proof here).
const fs=require('fs'),path=require('path'),{linkedColors}=require('./turp-a032-author'),{check}=require('./turp-a042-author');
const OUT=path.join(__dirname,'20261016-turp-a047-01');fs.mkdirSync(OUT,{recursive:true});
const G=4.9,BIG=2.15,STD=1.75;
function author(rev){
 const d={format:'turp-design',version:1,levelId:'draft',name:'Level 47',author:'Codex / TURP',notes:'',rings:[],sticks:[]},rings={};
 const ring=(id,x,y,gapDir,closed)=>{const o={id,x,y,radius:closed?BIG:STD,gapDir,gap:closed?0:90,lockCount:0,pins:[]};rings[id]=o;d.rings.push(o);return o;};
 const pin=(a,b)=>{const s=rings[a],t=rings[b],dist=Math.hypot(t.x-s.x,t.y-s.y),ang=(Math.atan2(t.y-s.y,t.x-s.x)*180/Math.PI+360)%360;s.pins.push({id:'to'+b,target:b,angle:+ang.toFixed(4),length:+(dist-t.radius-(s.radius+.25)).toFixed(4)});};
 const pinBar=(a,bar,angle,tip)=>{const s=rings[a];s.pins.push({id:'to'+bar,target:bar,angle,length:+(tip-(s.radius+.25)).toFixed(4)});};
 const st=(o)=>d.sticks.push(o);
 // Ring cluster at the bottom (source had it on top): closed source R2 in the upper row.
 ring('R1',-G,G,90);ring('R2',0,G,0,true);ring('R3',G,G,90);
 ring('R4',-G,0,180);ring('R5',0,0,270);ring('R6',G,0,0);
 ring('R7',-G,-G,270);ring('R8',G,-G,270);
 pin('R2','R1');pin('R2','R3');pin('R2','R5');pin('R5','R4');pin('R5','R6');pin('R4','R7');pin('R6','R8');
 pinBar('R2','S3',90,7.75-G);pinBar('R1','S5',180,7.7-G);pinBar('R3','S6',0,7.7-G);
 // Bar maze on top, wired into the rings: S1/S2 L legs down into the top gaps of R1/R3 (exit up); S3 pinbar of R2 between their Guides.
 st({id:'S1',x:-G,y:8.5,angle:0,path:[[0,G-8.5],[0,12.6-8.5],[1.9,12.6-8.5]],slideAxis:[0,1],guides:[{x:-G,y:8.5,angle:90}]});
 st({id:'S2',x:G,y:8.5,angle:0,path:[[0,G-8.5],[0,12.6-8.5],[-1.9,12.6-8.5]],slideAxis:[0,1],guides:[{x:G,y:8.5,angle:90}]});
 st({id:'S3',x:0,y:7.75,angle:0,path:[[-3.4,0],[3.4,0]],slideAxis:[1,0]});
 // S4: lid bar above both L hooks; its ends meet the long pinbars S5/S6.
 st({id:'S4',x:2,y:13.6,angle:0,path:[[-8.5,0],[4.5,0]],slideAxis:[1,0],guides:[{x:2,y:13.6,angle:0}]});
 // S5/S6: long side pinbars held by R1/R3, reaching up under the top U.
 st({id:'S5',x:-7.7,y:9.5,angle:0,path:[[0,-6.0],[0,6.0]],slideAxis:[0,1]});
 st({id:'S6',x:7.7,y:9.5,angle:0,path:[[0,-6.0],[0,6.0]],slideAxis:[0,1]});
 // S7: top U opening down, slides sideways on a spine Guide; its legs straddle S5/S6.
 st({id:'S7',x:0,y:17.2,angle:0,path:[[-9,-3.4],[-9,0],[9,0],[9,-3.4]],slideAxis:[1,0],guides:[{x:0,y:17.2,angle:0}]});
 // Bottom Ls into the outer gaps: S8 left into R4, S9 below into R5, S10 right into... R8 bottom gap from below.
 st({id:'S8',x:-7.5,y:0,angle:0,path:[[2.6,0],[-1.1,0],[-1.1,-2.0]],slideAxis:[1,0],guides:[{x:-7.5,y:0,angle:0}]});
 st({id:'S9',x:0,y:-2.6,angle:0,path:[[0,2.6],[0,-4.0],[-3.0,-4.0]],slideAxis:[0,1],guides:[{x:0,y:-2.6,angle:90}]});
 st({id:'S10',x:7.5,y:0,angle:0,path:[[-2.6,0],[1.1,0],[1.1,-2.0]],slideAxis:[1,0],guides:[{x:7.5,y:0,angle:0}]});
 linkedColors(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const d=author(process.argv[2]||'01'),c=check(d),n=require('./turp-color-near.js')(d);console.log(JSON.stringify({warn:c.analysis.warnings,err:c.analysis.error,info:c.analysis.info,strict:c.strict,low:c.margins.filter(m=>m.margin<45),guides:c.guides.map(g=>g.engaged).join(),idle:c.links.filter(l=>!l.active).map(l=>l.source+'>'+l.target),color:n}));fs.writeFileSync(path.join(require('os').tmpdir(),'claude','a047-draft.rrdesign.json'),JSON.stringify(d,null,1));}
