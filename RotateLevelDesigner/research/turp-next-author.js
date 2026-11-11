"use strict";
const fs=require('fs'),path=require('path'),{api,RR,ROOT}=require('./turp-continue'),{OUT,color,pin,circleInter}=require('./turp-feedback-author');
function author(slot,rev){const id=slot===16?'70002':'10015',d=api.loadDesign(ROOT+'/LevelVariants/out_v3/levels/A0'+slot+'-'+id+'.rrdesign.json'),r=id=>d.rings.find(x=>x.id===id);
 for(const q of d.rings){q.lockCount=0;q.pins=q.pins||[];for(const p of q.pins){p.target=p.targets[0];delete p.targets;}}
 if(slot===16){
  const old={x:r('R4').x,y:r('R4').y},p=circleInter(r('R1'),r('R10'),r('R1').radius+1.0854+r('R4').radius,r('R10').radius+1.0854+r('R4').radius).sort((a,b)=>b.y-a.y)[0];
  r('R4').x=p.x;r('R4').y=p.y;for(const id of ['R5','R8']){r(id).x+=p.x-old.x;r(id).y+=p.y-old.y;}
  pin(r('R1'),r('R4'),'centralDoor');r('R1').gapDir=200;r('R4').gapDir=270;r('R4').gap=80;
  const q=circleInter(r('R9'),r('R10'),r('R9').radius+1.0854+r('R6').radius,r('R10').radius+1.0854+r('R6').radius).sort((a,b)=>a.x-b.x)[0];r('R6').x=q.x;r('R6').y=q.y;pin(r('R10'),r('R6'),'lowerDoor');
  r('R2').gap=80;r('R2').gapDir=180;r('R3').gap=80;r('R3').gapDir=180;
  r('R2').pins.find(p=>p.target==='S2').angle=270;r('R3').pins.find(p=>p.target==='S1').angle=90;
  d.sticks=[{id:'S1',x:r('R3').x,y:r('R3').y+r('R3').radius+1.0854,angle:0,path:[[1.8,0],[-2.1,0],[-2.1,1.3]],slideAxis:[1,0],color:'red'},
   {id:'S2',x:r('R2').x,y:r('R2').y-r('R2').radius-1.0854,angle:0,path:[[1,0],[-2.1,0],[-2.1,-1.5]],slideAxis:[1,0],color:'red'}];
  for(const q of d.rings)for(const p of q.pins||[]){const t=r(p.target);if(t)p.angle=(Math.atan2(t.y-q.y,t.x-q.x)*180/Math.PI+360)%360;}
  d.name='A016 — Hai khung L và cửa trung tâm / TURP r'+rev;d.notes='Tiếp nối nguồn70002 và feedback khe/màu trong TURPLevel. Thay hai L xiên thành ngang/dọc; thêm pin R1→R4 và R10→R6 nối các vùng, căn khoảng pin native. Các khe điều chỉnh phục vụ junction và owner margin45°. Cỡ khác nhau có mục đích đổi silhouette, không Chain/Booster/Bom. Chưa GD duyệt.';
 }
 if(slot===17){
  r('R7').gap=60;r('R7').gapDir=82.3046;r('R11').gap=60;r('R11').gapDir=330;r('R10').gapDir=135;
  const bridgeTarget=circleInter(r('R13'),r('R9'),5.1804,4.7954).sort((a,b)=>b.x-a.x)[0];r('R12').x=bridgeTarget.x;r('R12').y=bridgeTarget.y;pin(r('R13'),r('R12'),'upperSharedReceiver');r('R9').pins.find(p=>p.target==='R12').angle=(Math.atan2(r('R12').y-r('R9').y,r('R12').x-r('R9').x)*180/Math.PI+360)%360;
  r('R9').pins.push({id:'sideGate',angle:0,target:'S5'});
  const rail=d.sticks.find(s=>s.id==='S1');rail.x=r('R7').x+r('R7').radius+1.0854;rail.y=-.5;rail.path=[[0,-2],[0,2]];rail.guides=[];rail.slideAxis=[0,1];r('R7').pins.find(p=>p.target==='R8').target='S1';r('R7').pins.find(p=>p.target==='S1').angle=0;r('R8').gap=100;r('R8').gapDir=180;
  const u=d.sticks.find(s=>s.id==='S2');u.path[0][0]=2.6541;u.path[3][0]=2.6541;u.slideAxis=[1,0];u.guides.push({x:-3.45,y:u.y+3.1125,angle:0});
  const l=d.sticks.find(s=>s.id==='S4');r('R6').gapDir=90;r('R6').pins=[{id:'lowerFrame',angle:270,target:'S4'}];l.x=r('R6').x;l.y=r('R6').y-r('R6').radius-1.0854;l.angle=0;l.path=[[1.6,0],[-2.3,0],[-2.3,-1.4]];l.slideAxis=[1,0];l.guides=[];
  const inside=d.sticks.find(s=>s.id==='S3');inside.x=r('R4').x;inside.y=r('R4').y-r('R4').radius-1.0854;inside.path=[[-2,0],[.8,0]];inside.guides=[];inside.slideAxis=[1,0];r('R4').gap=90;r('R4').pins.push({id:'innerBar',angle:270,target:'S3'});
  d.sticks.push({id:'S5',x:r('R9').x+r('R9').radius+1.0854,y:r('R9').y,angle:0,path:[[0,-1],[0,.8],[1.5,.8]],slideAxis:[0,1],color:'blue'});
  d.name='A017 — Cửa phải và khung U hai chân / TURP r'+rev;d.notes='Tiếp nối10015: giữ13 vòng để bố cục đủ mật độ, thay các thanh bằng cửa nhận pin có vai trò. R7 đổi pin R8 sang S1; R13 thêm pin vào receiver R12 dùng chung với R9; R9 nhận L S5 phía phải. R4 nhận thanh ngang S3, R6 nhận L S4 phía dưới, bỏ ngàm dư. U S2 hai chân bằng nhau mỗi chân một Guide, mở các cửa vòngR4/R10. Khe60° ở junction giữ owner margin≥45°, cỡ/màu theo report; chưa GD duyệt.';
 }
 delete d._notes;d.author='Codex / TURP continuation';d.levelId='draft';
 // Preserve the upstream radius classes; color by source, then verify neighbors in evidence.
 {const keys=api.PALETTE,{objs,E}=api.touchGraph(d),cols=new Map();function dfs(){if(cols.size===objs.length)return true;let best=-1,score=-1;for(let i=0;i<objs.length;i++)if(!cols.has(i)){const z=new Set([...E[i]].map(j=>cols.get(j)).filter(Boolean)).size*100+E[i].size;if(z>score){best=i;score=z;}}for(const c of keys.slice().sort((a,b)=>[...cols.values()].filter(x=>x===a).length-[...cols.values()].filter(x=>x===b).length)){const o=objs[best];if(o.kind==='r'&&[...cols].some(([j,cj])=>cj===c&&objs[j].kind==='r'&&Math.abs(objs[j].r.radius-o.r.radius)>.001))continue;if([...E[best]].some(j=>cols.has(j)&&api.dE(keys.indexOf(c),keys.indexOf(cols.get(j)))<40))continue;cols.set(best,c);if(dfs())return true;cols.delete(best);}return false;}if(!dfs())throw Error('Palette');for(let i=0;i<objs.length;i++)(objs[i].kind==='r'?d.rings:d.sticks).find(x=>x.id===objs[i].id).color=cols.get(i);}
 const stem='turp-A0'+slot+'-'+id+'-linked-r'+rev;fs.writeFileSync(path.join(OUT,stem+'.rrdesign.json'),JSON.stringify(d,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({stem,analysis:RR.analyze(RR.Design.toLevel(d).level),strict:api.OVL.check(d)}));return {stem,d};}
if(require.main===module)author(+process.argv[2]||16,process.argv[3]||'01');module.exports={author};
