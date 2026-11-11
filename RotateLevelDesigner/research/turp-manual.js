"use strict";
const {api,RR,ROOT,OUT,write,clean,marginFix}=require('./turp-continue');
const fs=require('fs'),path=require('path');
const mode=process.argv[2]||'10014',rev=process.argv[3]||'01';
let src=api.loadDesign(ROOT+'/LevelVariants/sources/Level'+mode+'.rrdesign.json'),d=api.relax(src);
function r(id){return d.rings.find(r=>r.id===id);}
function remove(ids){d.rings=d.rings.filter(r=>!ids.includes(r.id));for(const r of d.rings){for(const p of r.pins||[])p.targets=p.targets.filter(t=>!ids.includes(t));r.pins=(r.pins||[]).filter(p=>p.targets.length);}}
for(const q of d.rings){q.stops=[];q.lockCount=0;}
if(mode==='10014'){
 remove(['R13','R14']);
 r('R2').pins=[];
 const a=Math.atan2(r('R2').y-r('R1').y,r('R2').x-r('R1').x)*180/Math.PI;
 r('R1').pins=[{id:'return',angle:(a+360)%360,targets:['R2']},{id:'ledge',angle:270,targets:['S6']}];
 d.sticks.push({id:'S6',x:r('R1').x,y:r('R1').y-2.8354,angle:0,path:[[.5,0],[-4.4,0],[-4.4,-1.6]],slideAxis:[1,0],color:'purple'});
 for(const id of ['R5','R6','R7']){r(id).radius=2.1;r(id).x=11.3787;}
 r('R6').y=r('R5').y+5.2854;r('R7').y=r('R5').y-5.2854;r('R5').pins[0].angle=90;r('R5').pins[1].angle=270;
 // The native pin passage is at 2.8354, not the source helper's +.15 heuristic.
 const s=d.sticks.find(s=>s.id==='S4');s.y=r('R11').y-2.8354;s.path[2][1]=-1.3;
 d.sticks.find(s=>s.id==='S1').path[0][1]=2.15;
 d.sticks.find(s=>s.id==='S2').path[0][0]=.9;
 if(+rev>=5)d.sticks=d.sticks.filter(s=>!['S1','S2','S3'].includes(s.id));
}
if(mode==='10013'){
 remove(['R4','R6']);
 // Change the first release: R2 is now an open receiver, holding R1's source pin.
 const main=r('R1'),left=r('R2'),right=r('R3');
 for(const q of [left,right]){const dx=q.x-main.x,dy=q.y-main.y,L=Math.hypot(dx,dy);q.x=main.x+dx/L*4.9354;q.y=main.y+dy/L*4.9354;q.radius=2.1;}
 left.pins=[];left.gap=90;left.gapDir=90;
 main.pins=[{id:'rewired',angle:(Math.atan2(left.y-main.y,left.x-main.x)*180/Math.PI+360)%360,targets:['R2']}];main.gapDir=70;
 right.pins[0].angle=(Math.atan2(main.y-right.y,main.x-right.x)*180/Math.PI+360)%360;
 right.pins.push({id:'outline',angle:90,targets:['S9']});
 d.sticks.push({id:'S9',x:right.x,y:right.y+3.1854,angle:0,path:[[-1.7,0],[2.7,0],[2.7,1.6]],slideAxis:[1,0],color:'purple'});
 const s1=d.sticks.find(s=>s.id==='S1');s1.x=r('R5').x+2.8354;s1.y=-6;s1.path=[[0,2.4],[0,-2.4]];
 function shift(id,dx,dy){const s=d.sticks.find(s=>s.id===id);s.x+=dx;s.y+=dy;for(const g of s.guides||[]){g.x+=dx;g.y+=dy;}}
 shift('S6',main.x+.1-d.sticks.find(s=>s.id==='S6').x,0);shift('S7',-.45,0);shift('S8',-.8,.15);
 d.sticks.find(s=>s.id==='S7').path[0][1]=-2.9;
 d.sticks.find(s=>s.id==='S3').path=[[0,1.2],[0,-1.55]];
 if(+rev>=4)d.sticks=d.sticks.filter(s=>!['S2','S3','S5','S8'].includes(s.id));
}
if(!marginFix(d))throw Error('Owner gap cannot be kept clear');
api.reseed(1415);api.recolor(d);
// Keep equal radius among repeated ring colors while preserving contrast.
const {objs,E}=api.touchGraph(d),cols=new Map();let colored=false;
const keys=api.PALETTE;
for(let mask=0;mask<(1<<7)&&!colored;mask++){
 if([...keys.keys()].filter(i=>mask&(1<<i)).length!==3)continue;
 const allowed=objs.map(o=>o.kind==='s'?keys:keys.filter((c,i)=>!!(mask&(1<<i))===((o.r.radius||1.75)>2)));
 function dfs(){if(cols.size===objs.length)return true;let best=-1,score=-1;for(let i=0;i<objs.length;i++)if(!cols.has(i)){const z=new Set([...E[i]].map(j=>cols.get(j)).filter(Boolean)).size*100+E[i].size;if(z>score){best=i;score=z;}}
  const choices=allowed[best].slice().sort((a,b)=>[...cols.values()].filter(c=>c===a).length-[...cols.values()].filter(c=>c===b).length);
  for(const c of choices){if([...E[best]].some(j=>cols.has(j)&&api.dE(keys.indexOf(c),keys.indexOf(cols.get(j)))<40))continue;cols.set(best,c);if(dfs())return true;cols.delete(best);}return false;}
 cols.clear();colored=dfs();
}
if(!colored)throw Error('No contrasting size-consistent palette assignment');for(let i=0;i<objs.length;i++){const o=objs[i];(o.kind==='r'?d.rings:d.sticks).find(x=>x.id===o.id).color=cols.get(i);}
// Vertical flip of the complete authored layout, no oblique rotation.
d=api.geomTransform(d,{flipH:true,flipV:false,rot:180,rScale:1,field:{ax:0,ay:0,kx:0,ky:0,px:0,py:0},jit:0});
for(const s of d.sticks)if(s.path.length>2&&!s.slideAxis){const p=s.path[0],q=s.path[1];s.slideAxis=Math.abs(q[0]-p[0])>Math.abs(q[1]-p[1])?[1,0]:[0,1];}
d=clean(d);d.levelId='draft';d.name='TURP '+(mode==='10014'?'A014 / 10014 — bậc L và nguồn trở lại':'A015 / 10013 — cửa mở trước và cánh L')+' r'+rev;d.author='Codex / TURP continuation';d.notes=mode==='10014'?'Đề xuất theo report.md 15/10. Bỏ R13/R14 ở rìa; thêm L S6 không ngàm dư vào R1; đảo R2→R1 thành R1→R2. R5/R6/R7 radius2.1 so với nhóm1.75; giữ silhouette dọc, đổi màu và view. Rút L trước để nguồn R1 quay lại, các thanh gốc còn nối qua khe. Chưa GD duyệt silhouette/độ khó.':'Đề xuất theo report.md 15/10. Bỏ R4/R6; thêm L S9 giữ nguồn R3; đảo R2→R1 thành R1→R2 và mở R2. R2/R3 radius2.1; thu ngắn S1, dời S6/S7/S8 để không chồng. U S4 giữ hai chân bằng nhau và hai ngàm. Cần mở receiver R2, rút L để dùng nguồn R3 và xử lý quạt pin quanh R1; chưa GD duyệt silhouette/độ khó.';
write(mode+'-manual-r'+rev+'.rrdesign.json',d);
const lv=api.build(d),an=RR.analyze(lv);write(mode+'-manual-r'+rev+'-preflight.json',{analysis:an,strictOverlap:api.OVL.check(d)});
console.log(JSON.stringify({file:mode+'-manual-r'+rev+'.rrdesign.json',analysis:an,strict:api.OVL.check(d)}));
