"use strict";
// A051/BoardA51 (source71033, bars+Bom): generate-only remake (user decision 16/10/2026: GD finds solutions).
const fs=require('fs'),path=require('path'),{linkedColors}=require('./turp-a032-author');
const OUT=path.join(__dirname,'20261016-turp-a051-01');fs.mkdirSync(OUT,{recursive:true});
const SRC=require('./20261016-boardA-ref-51/sources/Level71033.rrdesign.json');
const r4=v=>Math.round(v*1e4)/1e4;
function author(rev){
 const d={format:'turp-design',version:1,levelId:'draft',name:'Level 51',author:'Codex / TURP',notes:'',rings:[],sticks:[]};
 // Rotate the source 180° about (5.5,-8.5) and drop the two edge bars that slide out freely at load (S7, S13).
 const cx=5.5,cy=-8.5,rot=p=>[r4(2*cx-p[0]),r4(2*cy-p[1])];
 for(const s of SRC.sticks){if(s.id==='S7'||s.id==='S13')continue;const [x,y]=rot([s.x,s.y]);const o={id:s.id,x,y,angle:0,path:s.path.map(p=>[r4(-p[0]),r4(-p[1])])};
  if(s.slideAxis)o.slideAxis=s.slideAxis.map(v=>-v);if(s.guides)o.guides=s.guides.map(g=>{const [gx,gy]=rot([g.x,g.y]);return {x:gx,y:gy,angle:(g.angle+180)%360};});
  if(s.bomb){const [bx,by]=rot([s.bomb.x,s.bomb.y]);o.bomb={x:bx,y:by};}d.sticks.push(o);}
 // Size change: shorten the long right Z-bar arm and lengthen the bottom straight (K3), keep Guides on their segments.
 const S=id=>d.sticks.find(s=>s.id===id);
 // Fix the source's 0.026 start overlap of S6 with S10's Guide wall: lower S6 and its Guides by 0.1.
 {const s6=S('S6');s6.y=r4(s6.y-.1);s6.guides.forEach(g=>g.y=r4(g.y-.1));}
 // S13: new U in the empty lower-left, opening right; its lower leg runs under S6's left leg (blocks S6 sliding down) and it leaves to the left.
 d.sticks.push({id:'S13',x:.2,y:-15.5,angle:0,path:[[4.4,1.1],[0,1.1],[0,-1.1],[6.9,-1.1]],slideAxis:[1,0],guides:[{x:2.4,y:-14.4,angle:0},{x:2.4,y:-16.6,angle:0}]});
 linkedColors(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const B=require('./turp-a041-r04-bench.js'),d=author('01');const lv=B.level(d).level;console.log(JSON.stringify(B.RR.analyze(lv).warnings));console.table(B.probe(d).map(r=>({id:r.id,pos:r.pos.slice(0,60),neg:r.neg.slice(0,60)})));fs.writeFileSync(path.join(require('os').tmpdir(),'claude','a051-draft.rrdesign.json'),JSON.stringify(d,null,1));}
