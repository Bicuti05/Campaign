"use strict";
// A056/BoardA56 (source60006): generate-only authoring (user decision 16/10/2026: GD finds solutions).
const fs=require('fs'),path=require('path'),{linkedColors}=require('./turp-a032-author'),{check}=require('./turp-a042-author');
const OUT=path.join(__dirname,'20261016-turp-a056-01');fs.mkdirSync(OUT,{recursive:true});
const G=4.9,BIG=2.15,STD=1.75;
function author(rev){
 const d={format:'turp-design',version:1,levelId:'draft',name:'Level 56',author:'Codex / TURP',notes:'',rings:[],sticks:[]},rings={};
 const ring=(id,x,y,gapDir,closed)=>{const o={id,x,y,radius:closed?BIG:STD,gapDir,gap:closed?0:90,lockCount:0,pins:[]};rings[id]=o;d.rings.push(o);return o;};
 const pin=(a,b)=>{const s=rings[a],t=rings[b],dist=Math.hypot(t.x-s.x,t.y-s.y),ang=(Math.atan2(t.y-s.y,t.x-s.x)*180/Math.PI+360)%360;s.pins.push({id:'to'+b,target:b,angle:+ang.toFixed(4),length:+(dist-t.radius-(s.radius+.25)).toFixed(4)});};
 const st=o=>d.sticks.push(o);
 // Two stacked flowers around closed hubs R1 (lower) and R2 (upper) sharing the middle ring R3; bottom-left and top-right corners removed.
 ring('R1',0,G,0,true);ring('R2',0,3*G,0,true);ring('R3',0,2*G,0);
 ring('R4',0,0,270);ring('R5',0,4*G,90);
 ring('R6',-G,G,180);ring('R7',G,G,0);ring('R8',-G,3*G,180);ring('R9',G,3*G,0);
 ring('R10',-G,2*G,180);ring('R11',G,2*G,0);ring('R12',G,0,0);ring('R13',-G,4*G,180);
 pin('R1','R3');pin('R1','R4');pin('R1','R6');pin('R1','R7');
 pin('R2','R3');pin('R2','R5');pin('R2','R8');pin('R2','R9');
 pin('R6','R10');pin('R8','R10');pin('R8','R13');pin('R7','R11');pin('R7','R12');pin('R9','R11');pin('R4','R12');pin('R5','R13');
 // S1: left U through R6/R10 gaps; S2: right U through R11/R9 gaps (one row higher); equal legs, one Guide per leg.
 const U=(id,x,y,dir,gy)=>st({id,x,y,angle:0,path:[[dir*4.1,G/2],[0,G/2],[0,-G/2],[dir*4.1,-G/2]],slideAxis:[1,0],guides:gy.map(v=>({x:x+dir*1.5,y:v,angle:0}))});
 U('S1',-9,1.5*G,1,[2*G,G]);U('S2',9,2.5*G,-1,[3*G,2*G]);
 // S3: L from below into R4's gap, foot into the removed bottom-left corner; S4: L from above into R5's gap, hook into the removed top-right corner.
 st({id:'S3',x:0,y:-2.6,angle:0,path:[[0,2.6],[0,-1.0],[-3.6,-1.0]],slideAxis:[0,1],guides:[{x:0,y:-2.6,angle:90}]});
 st({id:'S4',x:0,y:4*G+2.6,angle:0,path:[[0,-2.6],[0,1.0],[3.6,1.0]],slideAxis:[0,1],guides:[{x:0,y:4*G+2.6,angle:90}]});
 linkedColors(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const d=author(process.argv[2]||'01'),c=check(d),n=require('./turp-color-near.js')(d);console.log(JSON.stringify({warn:c.analysis.warnings,err:c.analysis.error,info:c.analysis.info,strict:c.strict,low:c.margins.filter(m=>m.margin<45),guides:c.guides.map(g=>g.engaged).join(),idle:c.links.filter(l=>!l.active).map(l=>l.source+'>'+l.target),color:n}));fs.writeFileSync(path.join(require('os').tmpdir(),'claude','a056-draft.rrdesign.json'),JSON.stringify(d,null,1));}
