"use strict";
// A045/source10027: generate-only authoring (user decision 16/10/2026: GD finds solutions; no solve/proof here).
const fs=require('fs'),path=require('path'),{linkedColors}=require('./turp-a032-author'),{check}=require('./turp-a042-author');
const OUT=path.join(__dirname,'20261016-turp-a045-01');fs.mkdirSync(OUT,{recursive:true});
const G=4.9,BIG=2.15,STD=1.75;
function author(rev){
 const d={format:'turp-design',version:1,levelId:'draft',name:'Level 45',author:'Codex / TURP',notes:'',rings:[],sticks:[]},rings={};
 const ring=(id,x,y,gapDir,closed)=>{const o={id,x,y,radius:closed?BIG:STD,gapDir,gap:closed?0:90,lockCount:0,pins:[]};rings[id]=o;d.rings.push(o);return o;};
 const pin=(a,b)=>{const s=rings[a],t=rings[b],dist=Math.hypot(t.x-s.x,t.y-s.y),ang=(Math.atan2(t.y-s.y,t.x-s.x)*180/Math.PI+360)%360;s.pins.push({id:'to'+b,target:b,angle:+ang.toFixed(4),length:+(dist-t.radius-(s.radius+.25)).toFixed(4)});};
 const pinBar=(a,bar,angle,tip)=>{const s=rings[a];s.pins.push({id:'to'+bar,target:bar,angle,length:+(tip-(s.radius+.25)).toFixed(4)});};
 // Side columns (bottom-left and top-right removed) and a centre spine: closed source, open hub, closed source, open top.
 ring('R1',-G,G,180);ring('R2',-G,2*G,180);ring('R3',-G,3*G,180);
 ring('R4',G,0,270);ring('R5',G,G,0);ring('R6',G,2*G,270);
 ring('R7',0,G/2,0,true);ring('R8',0,1.5*G,90);ring('R9',0,2.5*G,0,true);ring('R10',0,3.5*G,90);
 pin('R7','R1');pin('R7','R4');pin('R7','R5');pin('R7','R8');
 pin('R9','R2');pin('R9','R3');pin('R9','R6');pin('R9','R10');
 pin('R8','R1');pin('R8','R5');pin('R2','R1');pin('R3','R10');
 pinBar('R6','S2',0,8.5-G);pinBar('R4','S2',0,8.5-G);
 // Stop on R6 (top, on material, away from the gap): its swing meets the closed source R9 or the corner bar S4.
 rings.R6.stops=[{angle:90,length:1.4}];
 // S1: guided U from the left through gaps of R1/R2, equal legs4.1, one Guide per leg.
 d.sticks.push({id:'S1',x:-9,y:1.5*G,angle:0,path:[[4.1,G/2],[0,G/2],[0,-G/2],[4.1,-G/2]],slideAxis:[1,0],guides:[{x:-7.5,y:2*G,angle:0},{x:-7.5,y:G,angle:0}]});
 // S2: long shared pinbar on the right, held by R6 (top) and R4 (bottom).
 d.sticks.push({id:'S2',x:8.5,y:4.9,angle:0,path:[[0,-6.6],[0,6.5]],slideAxis:[0,1]});
 // S3: L from the left into R3's gap; S4: corner L top-right whose hook caps S2 from above; S5: L from above into R10's gap; S6: L from below into R4's gap, foot into the removed bottom-left corner.
 d.sticks.push({id:'S3',x:-7.5,y:3*G,angle:0,path:[[2.6,0],[-1.1,0],[-1.1,-1.9]],slideAxis:[1,0],guides:[{x:-7.5,y:3*G,angle:0}]});
 d.sticks.push({id:'S4',x:5.6,y:13.9,angle:0,path:[[-2.6,0],[2.9,0],[2.9,-1.9]],slideAxis:[1,0],guides:[{x:5.6,y:13.9,angle:0}]});
 d.sticks.push({id:'S5',x:0,y:19.8,angle:0,path:[[0,3.5*G-19.8],[0,1.4],[2.2,1.4]],slideAxis:[0,1],guides:[{x:0,y:19.8,angle:90}]});
 d.sticks.push({id:'S6',x:G,y:-2.6,angle:0,path:[[0,2.6],[0,-1.0],[-9.4,-1.0]],slideAxis:[0,1],guides:[{x:G,y:-2.6,angle:90}]});
 linkedColors(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const d=author(process.argv[2]||'01'),c=check(d),n=require('./turp-color-near.js')(d);console.log(JSON.stringify({warn:c.analysis.warnings,err:c.analysis.error,info:c.analysis.info,strict:c.strict,minMargin:c.minMargin,guides:c.guides.map(g=>g.engaged).join(),idle:c.links.filter(l=>!l.active).map(l=>l.source+'>'+l.target),color:n}));fs.writeFileSync(path.join(require('os').tmpdir(),'claude','a045-draft.rrdesign.json'),JSON.stringify(d,null,1));}
