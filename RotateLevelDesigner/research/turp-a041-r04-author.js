"use strict";
// A041 r04+: research authoring for source10111 (bars/Guides only). Writes new files only (flag wx); r01–r03 stay untouched.
const fs=require('fs'),path=require('path'),B=require('./turp-a041-r04-bench.js');
const OUT=B.OUT,save=(n,v)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
// Vertical bar on x from y0 (plain end) to y1 (hook end); hook dx sideways at y1; Guide at gy. Origin = Guide.
function V(d,id,x,y0,y1,dx,gy,color){const p=[[0,y0-gy],[0,y1-gy]];if(dx)p.push([dx,y1-gy]);d.sticks.push({id,x,y:gy,angle:0,path:p,slideAxis:[0,1],guides:[{x,y:gy,angle:90}],color});}
// Horizontal bar on y from x0 (plain end) to x1 (hook end); hook dy at x1; Guide at gx.
function H(d,id,y,x0,x1,dy,gx,color){const p=[[x0-gx,0],[x1-gx,0]];if(dy)p.push([x1-gx,dy]);d.sticks.push({id,x:gx,y,angle:0,path:p,slideAxis:[1,0],guides:[{x:gx,y,angle:0}],color});}
function author(rev){
 const d={format:'turp-design',version:1,levelId:'draft',name:'A041 — U cửa chung giữ lại và chuỗi thanh quay về / TURP r'+rev,author:'Codex / TURP continuation',notes:'',rings:[],sticks:[]};
 // U: arms y9.5/0.5, spine x3.52; Guides top x1.8 (above short C5) and bottom x-0.6 (below short C3).
 d.sticks.push({id:'S1',x:1.8,y:5,angle:0,path:[[-6,4.5],[1.92,4.5],[1.92,-4.5],[-6,-4.5]],slideAxis:[1,0],guides:[{x:1.8,y:9.5,angle:0},{x:-.6,y:.5,angle:0}],color:'orange'});
 V(d,'S2',-3.0,9.48,1.02,-1.2,5,'blue');
 V(d,'S3',-1.8,9.48,.52,0,5,'green');
 V(d,'S4',-.6,1.27,9.48,0,6.5,'purple');
 V(d,'S5',.6,9.48,1.25,-1.2,5,'red');
 V(d,'S6',1.8,9.28,.52,0,4,'teal');
 V(d,'S7',3.0,9.48,.52,0,5,'navy');
 H(d,'S8',5,-6.6,-3.72,1.2,-4.5,'green');
 V(d,'S9',-8.2,10.6,5.52,3.4,6.26,'red');
 H(d,'S10',11,7.4,-7.68,-1.2,-6.94,'blue');
 V(d,'S11',7.02,+rev>=5?-4.6:-2.2,10.48,-1.2,9.69,'purple');
 H(d,'S12',-1.2,-1.5,6.5,-1.2,5.76,'orange');
 V(d,'S13',-6.4,+rev>=5?-5.0:-6.5,4.28,1.2,-4,'teal');
 H(d,'S14',-.6,-2.4,-5.88,1.6,-4.2,'red');
 if(+rev>=5)H(d,'S15',-3.7,-2.4,5.88,1.2,4.7,'navy');
 if(+rev>=6){const set=(id,f)=>f(d.sticks.find(s=>s.id===id)),top=s=>Math.max(...s.path.map(q=>q[1])),lo=s=>Math.min(...s.path.map(q=>q[1]));
  // r05: visible gap between column ends and U arms (strict OVL), no change to roles.
  for(const id of ['S2','S3','S4','S5','S7'])set(id,s=>{const t=top(s);s.path.forEach(q=>{if(q[1]===t)q[1]-=.5;});});
  set('S6',s=>{const t=top(s);s.path.forEach(q=>{if(q[1]===t)q[1]-=.3;});});
  for(const id of ['S2','S3','S5','S6','S7'])set(id,s=>{const l=lo(s);s.path.forEach(q=>{if(q[1]===l)q[1]+=.5;});});
  set('S4',s=>{const l=lo(s);s.path.forEach(q=>{if(q[1]===l)q[1]+=1;});});}
 return d;
}
module.exports={author,V,H,save,OUT};
if(require.main===module){(async()=>{const rev=process.argv[2]||'04',d=author(rev);console.table(B.probe(d));const r=B.search(d);console.log(r.found,r.n,r.moves&&r.moves.map(m=>m.part+(m.dir>0?'+':'-')+(m.target??'OUT')).join(' '));if(r.found)console.log(JSON.stringify(B.prep(r.moves)));await B.png(d,path.join(require('os').tmpdir(),'claude','a041-'+rev+'-draft.png'));})();}
