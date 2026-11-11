"use strict";
// A054/BoardA54 (source10050): generate-only authoring (user decision 16/10/2026: GD finds solutions).
const fs=require('fs'),path=require('path'),{linkedColors}=require('./turp-a032-author'),{check}=require('./turp-a042-author');
const OUT=path.join(__dirname,'20261016-turp-a054-01');fs.mkdirSync(OUT,{recursive:true});
const G=4.9,BIG=2.15,STD=1.75;
function author(rev){
 const d={format:'turp-design',version:1,levelId:'draft',name:'Level 54',author:'Codex / TURP',notes:'',rings:[],sticks:[]},rings={};
 const ring=(id,x,y,gapDir,closed)=>{const o={id,x,y,radius:closed?BIG:STD,gapDir,gap:closed?0:90,lockCount:0,pins:[]};rings[id]=o;d.rings.push(o);return o;};
 const pin=(a,b)=>{const s=rings[a],t=rings[b],dist=Math.hypot(t.x-s.x,t.y-s.y),ang=(Math.atan2(t.y-s.y,t.x-s.x)*180/Math.PI+360)%360;s.pins.push({id:'to'+b,target:b,angle:+ang.toFixed(4),length:+(dist-t.radius-(s.radius+.25)).toFixed(4)});};
 const st=o=>d.sticks.push(o);
 // Centre column alternates closed sources and shared receivers; side columns (bottom-left and top-right removed).
 ring('R1',0,0,270);ring('R2',0,G,0,true);ring('R3',0,2*G,0);ring('R4',0,3*G,0,true);ring('R5',0,4*G,180);ring('R6',0,5*G,0,true);
 ring('R7',-G,G,180);ring('R8',-G,2*G,180);ring('R9',-G,3*G,180);ring('R10',-G,4*G,180);ring('R11',-G,5*G,90);
 ring('R12',G,0,0);ring('R13',G,G,0);ring('R14',G,2*G,0);ring('R15',G,3*G,0);ring('R16',G,4*G,0);
 pin('R2','R1');pin('R2','R3');pin('R2','R7');pin('R2','R13');
 pin('R4','R3');pin('R4','R5');pin('R4','R9');pin('R4','R15');
 pin('R6','R5');pin('R6','R11');pin('R6','R16');
 pin('R7','R8');pin('R9','R8');pin('R9','R10');pin('R11','R10');
 pin('R13','R12');pin('R13','R14');pin('R15','R14');pin('R15','R16');
 // Stops: R8 toward the gap of R3, R14 toward R3's right side; both on material opposite their gaps.
 rings.R8.stops=[{angle:0,length:.45}];rings.R14.stops=[{angle:180,length:.45}];
 // S1/S2: two stacked left Us through R7/R8 and R9/R10 gaps; S3: right U through R12/R13 gaps; equal legs, one Guide per leg.
 const U=(id,x,y,dir,gy)=>st({id,x,y,angle:0,path:[[dir*4.1,G/2],[0,G/2],[0,-G/2],[dir*4.1,-G/2]],slideAxis:[1,0],guides:gy.map(v=>({x:x+dir*1.5,y:v,angle:0}))});
 U('S1',-9,1.5*G,1,[2*G,G]);U('S2',-9.4,3.5*G,1,[4*G,3*G]);U('S3',9,.5*G,-1,[G,0]);
 // S4: L from below into R1's gap, foot into the removed bottom-left corner; S5: L from above into R11's gap; S6: L from the right into R16, hook up into the removed top-right corner.
 st({id:'S4',x:0,y:-2.6,angle:0,path:[[0,2.6],[0,-1.0],[-3.4,-1.0]],slideAxis:[0,1],guides:[{x:0,y:-2.6,angle:90}]});
 st({id:'S5',x:-G,y:5*G+2.6,angle:0,path:[[0,-2.6],[0,1.4],[-2.0,1.4]],slideAxis:[0,1],guides:[{x:-G,y:5*G+2.6,angle:90}]});
 st({id:'S6',x:G+2.6,y:4*G,angle:0,path:[[-2.6,0],[1.1,0],[1.1,2.4]],slideAxis:[1,0],guides:[{x:G+2.6,y:4*G,angle:0}]});
 linkedColors(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const d=author(process.argv[2]||'01'),c=check(d),n=require('./turp-color-near.js')(d);console.log(JSON.stringify({warn:c.analysis.warnings,err:c.analysis.error,info:c.analysis.info,strict:c.strict,low:c.margins.filter(m=>m.margin<45),guides:c.guides.map(g=>g.engaged).join(),idle:c.links.filter(l=>!l.active).map(l=>l.source+'>'+l.target),color:n}));fs.writeFileSync(path.join(require('os').tmpdir(),'claude','a054-draft.rrdesign.json'),JSON.stringify(d,null,1));}
