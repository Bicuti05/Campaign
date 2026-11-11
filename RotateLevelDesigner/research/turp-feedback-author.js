"use strict";
const fs=require('fs'),path=require('path'),{api,RR,CORE}=require('./turp-continue');
const OUT=path.join(__dirname,'20261015-turp-feedback-02');fs.mkdirSync(OUT,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),clone=x=>JSON.parse(JSON.stringify(x));
function color(d){const {objs,E}=api.touchGraph(d),keys=api.PALETTE,cols=new Map();let colored=false;
 for(let mask=0;mask<128&&!colored;mask++){if(keys.filter((_,i)=>mask&(1<<i)).length!==3)continue;const allowed=objs.map(o=>o.kind==='s'?keys:keys.filter((_,i)=>!!(mask&(1<<i))===((o.r.radius||1.75)>2)));
 function dfs(){if(cols.size===objs.length)return true;let best=-1,score=-1;for(let i=0;i<objs.length;i++)if(!cols.has(i)){const z=new Set([...E[i]].map(j=>cols.get(j)).filter(Boolean)).size*100+E[i].size;if(z>score){score=z;best=i;}}for(const c of allowed[best].slice().sort((a,b)=>[...cols.values()].filter(x=>x===a).length-[...cols.values()].filter(x=>x===b).length)){if([...E[best]].some(j=>cols.has(j)&&api.dE(keys.indexOf(c),keys.indexOf(cols.get(j)))<40))continue;cols.set(best,c);if(dfs())return true;cols.delete(best);}return false;}
 cols.clear();colored=dfs();}
 if(!colored)throw Error('No palette solution');for(let i=0;i<objs.length;i++)(objs[i].kind==='r'?d.rings:d.sticks).find(x=>x.id===objs[i].id).color=cols.get(i);return d;
}
function pin(a,b,id){a.pins=a.pins||[];a.pins.push({id,angle:(Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI+360)%360,target:b.id});}
function circleInter(a,b,ra,rb){const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy),u=(ra*ra-rb*rb+L*L)/(2*L),h=Math.sqrt(ra*ra-u*u);return [{x:a.x+dx*u/L-dy*h/L,y:a.y+dy*u/L+dx*h/L},{x:a.x+dx*u/L+dy*h/L,y:a.y+dy*u/L-dx*h/L}];}
function author(slot,rev='03'){
 const id=slot===14?'10014':'10013',d=read(path.join(CORE,'levels','turp-A0'+slot+'-'+id+'-outline-r02.rrdesign.json')),r=id=>d.rings.find(x=>x.id===id);
 if(slot===14){
  const p=circleInter(r('R1'),r('R3'),4.5854,4.5854).sort((a,b)=>a.x-b.x)[0];const bridge={id:'R13',...p,radius:1.75,gap:90,gapDir:180,lockCount:0,pins:[],color:'green'};d.rings.push(bridge);pin(bridge,r('R1'),'toUpper');pin(bridge,r('R3'),'toMiddle');
  r('R1').gap=60;r('R1').gapDir=180;r('R3').gap=60;r('R3').gapDir=180;
  r('R10').y+=.25;r('R12').x=circleInter(r('R3'),r('R10'),4.5854,4.5854).sort((a,b)=>a.x-b.x)[0].x;r('R12').y=circleInter(r('R3'),r('R10'),4.5854,4.5854).sort((a,b)=>a.x-b.x)[0].y;
  r('R10').pins[0].angle=(Math.atan2(r('R12').y-r('R10').y,r('R12').x-r('R10').x)*180/Math.PI+360)%360;r('R10').gap=80;
  r('R9').pins.find(p=>p.target==='R10').angle=(Math.atan2(r('R10').y-r('R9').y,r('R10').x-r('R9').x)*180/Math.PI+360)%360;
  pin(r('R3'),r('R12'),'toLower');
  const dx=Math.sqrt(4.9354**2-(r('R4').y-r('R5').y)**2);for(const id of ['R5','R6','R7'])r(id).x=r('R4').x+dx;
  pin(r('R5'),r('R4'),'sharedDoor');r('R4').gapDir=90;
  const st={id:'S7',x:r('R3').x+2.8354,y:-2.025,angle:0,path:[[0,-1.275],[0,1.275]],color:'red'};d.sticks.push(st);r('R3').pins.push({id:'verticalGate',angle:0,target:'S7'});
  d.name='A014 — Cầu ba vùng và cửa dùng chung / TURP r'+rev;
  d.notes='Sửa feedback GD: thêm R13 giữ cả R1/R3; nối R3→R12 xuống vùng dưới, R5→R4 nối cụm lớn vào cửa chung; S7 giữ nguồn R3. Cả ba vùng có pin nối thật và nguồn còn giữ để quay sau khi đầu ra đã mở. Khe R1/R3=60° có mục đích chứa junction nhiều pin, lockCount0. R03 thay đề xuất r02, cần GD xem lại bố cục và độ khó.';
 }else{
  const main=r('R1'),left=r('R2'),lower=r('R5'),L=4.9354,dx=lower.x-left.x;lower.y=left.y-Math.sqrt(L*L-dx*dx);pin(left,lower,'lowerReceiver');lower.gap=80;lower.gapDir=180;
  left.gap=80;left.gapDir=90;left.pins.push({id:'leftFrame',angle:180,target:'S10'});
  d.sticks.push({id:'S10',x:left.x-3.1854,y:left.y,angle:0,path:[[0,1.6],[0,-3],[1.5,-3]],slideAxis:[0,1],color:'navy'});
  r('R7').gap=80;r('R7').gapDir=90;r('R7').pins.push({id:'upperRail',angle:180,target:'S11'});
  d.sticks.push({id:'S11',x:r('R7').x-2.8354,y:r('R7').y,angle:0,path:[[0,-1.8],[0,1.8]],color:'orange'});
  d.name='A015 — Khung L và thanh mở quạt pin / TURP r'+rev;
  d.notes='Sửa feedback GD: bổ sung L S10 bên trái và stick S11 ở khoảng trống trên. L nhận pin R2, thanh trên nhận pin R7, không ngàm dư. Nối R2→R5 để nhánh dưới trái giữ cùng nguồn R2 với L; phải rút S1, quay receiver R5 và rút L thì R2 mới quay mở pin của R1. S6/S7 trong khe trung tâm giữ vai trò đường quay R1. Bản mới thay đề xuất outline-r02; bố cục và độ khó chờ GD.';
 }
 color(d);const stem='turp-A0'+slot+'-'+id+'-linked-r'+rev;const file=path.join(OUT,stem+'.rrdesign.json');fs.writeFileSync(file,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
 const baked=RR.Design.toLevel(d),a=RR.analyze(baked.level),ov=api.OVL.check(d);fs.writeFileSync(path.join(OUT,stem+'-preflight.json'),JSON.stringify({analysis:a,strictOverlap:ov},null,2),{flag:'wx'});console.log(JSON.stringify({stem,analysis:a,strict:ov}));return {stem,d};
}
if(require.main===module)author(+process.argv[2]||14,process.argv[3]||'03');
module.exports={OUT,read,clone,color,pin,circleInter,author};
