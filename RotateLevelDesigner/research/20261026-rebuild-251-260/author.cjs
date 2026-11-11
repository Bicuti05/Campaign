'use strict';
const fs=require('fs'),path=require('path'),RR=require('../../rr-core.js'),H=require('../turp-src-remake.js'),near=require('../turp-color-near.js');
const ROOT=path.resolve(__dirname,'../../../..'),INGAME=path.join(ROOT,'Tools/RotateLevelDesigner/ingame');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),clone=structuredClone;
const SOURCES=new Map(fs.readdirSync(INGAME).filter(f=>f.endsWith('.rrpack.json')).map(f=>{const p=read(path.join(INGAME,f));return[Number(p.runtime.levelId),{file:path.join(INGAME,f),pack:p}];}));
const r=(d,id)=>d.rings.find(r=>r.id===id),s=(d,id)=>d.sticks.find(s=>s.id===id);
function positions(d,map){for(const [id,[x,y]]of Object.entries(map)){const o=r(d,id)||s(d,id),dx=x-o.x,dy=y-o.y;if(o.bomb){o.bomb.x+=dx;o.bomb.y+=dy;}o.x=x;o.y=y;}}
function bar(d,id,x,y,p,axis,guides=[]){const o=s(d,id);Object.assign(o,{x,y,path:p,angle:0,slideAxis:axis,guides});}
function drop(d,a,b){r(d,a).pins=(r(d,a).pins||[]).filter(p=>!(p.targets||[p.target]).includes(b));}
function pin(d,a,b){r(d,a).pins.push({id:'new-'+b,targets:[b],angle:0,length:1});}
function remove(d,ids){for(const id of ids){if(r(d,id))H.removeRing(d,id);else H.removeStick(d,id);}}
const specs={
 251:{source:101,tag:'Recovery + Practice',title:'Hai cửa dưới một mái',idea:'Rút L theo cửa còn thoáng, mở hai receiver của nguồn kín và hoàn tất nhánh dưới; phản hồi sớm sau màn100 lớn.',edit(d){
  positions(d,{R3:[0,0],R1:[3.5,3.6],R2:[-3.5,3.6],R4:[3.5,-3.6],R5:[-3.5,-3.6],R6:[0,-6.3]});bar(d,'S1',0,6.4,[[-5.6,0],[5.6,0],[5.6,-2]],[1,0]);
  r(d,'R1').gapDir=270;r(d,'R2').gapDir=270;r(d,'R4').gapDir=0;r(d,'R5').gapDir=180;r(d,'R6').gapDir=270;
 }},
 252:{source:102,tag:'Practice + Combine',title:'Hai nhánh cùng một then',idea:'Đọc hai nguồn giữ chung một thanh, theo receiver chung R5 rồi quay về nhánh dưới; thanh thẳng giúp tách bài toán trục rút khỏi khuỷu L.',edit(d){
  positions(d,{R1:[0,-2],R3:[-3.6,1],R5:[0,4.3],R6:[-3.8,7.1],R7:[4.5,1],R2:[4.4,-4.8]});bar(d,'Bridge',7.5,-1.4,[[0,4.8],[0,-4.8]],[0,1]);
 }},
 253:{source:103,tag:'Combine',title:'Cửa trên và chốt dưới',idea:'Nguồn kín giữ cửa trái và cửa trên; receiver có Stop ở nhánh dưới nhận hai nguồn, nối vào thanh chung bên phải.',edit(d){
  positions(d,{R1:[-2.4,3.5],R2:[0,7.1],R3:[2.4,3.5],R4:[-6.8,3.5],R5:[-2.4,-1.2],R6:[-6.2,-4.2],R7:[1.6,-4.2],R8:[-2.4,-7.2]});bar(d,'S1',5.2,-.35,[[0,-5.6],[0,5.6]],[0,1]);
  drop(d,'R5','R4');pin(d,'R5','R6');pin(d,'R1','R4');r(d,'R6').gapDir=90;r(d,'R6').stops[0].angle=180;
 }},
 254:{source:104,tag:'Practice + định hướng',title:'Khuỷu thấp, cửa cao',idea:'R1 là receiver dùng chung có chốt; bar bên trái nối R8/R6, khoảng cách được rút gọn để đọc liên hệ giữa tầng trên và dưới.',edit(d){
  positions(d,{R1:[2,3],R2:[4,7],R5:[8.6,3],R8:[-2,3],R3:[4,-2],R4:[8.6,-2],R6:[0,-4]});bar(d,'Bridge',-4.8,-.35,[[0,5.5],[0,-5.5],[-2,-5.5]],[0,-1]);r(d,'R8').gapDir=90;r(d,'R1').gapDir=0;
 }},
 255:{source:105,tag:'Combine + Challenge dự kiến',title:'Hai nguồn, một cửa đáy',idea:'Hai nguồn kín chia sẻ receiver; then đáy nhận R8/R9 thay vì kéo một pin xuyên suốt chiều cao từ R2. Giải nhánh vòng rồi quay về nguồn.',edit(d){
  positions(d,{R6:[-5.4,5.8],R5:[-5.4,1.2],R1:[3.5,5.8],R2:[3.5,1.2],R3:[-.7,5],R4:[-.7,.4],R8:[3.5,-3.4],R9:[-.7,-4.2]});bar(d,'Bridge',.65,-7,[[-4.1,0],[5.1,0],[5.1,-2]],[1,0]);
  drop(d,'R2','Bridge');drop(d,'R9','R8');pin(d,'R8','R9');pin(d,'R8','Bridge');r(d,'R8').pins.at(-1).angle=270;r(d,'R8').gapDir=0;r(d,'R4').stops=[];pin(d,'R4','R5');
 }},
 256:{source:106,tag:'Practice + Recovery về loại thao tác',title:'Vòng hồi quanh tâm',idea:'Chỉ vòng và một Stop: ba nhánh hội tụ ở receiver R1, có phản hồi trực tiếp và quay lại; giảm tải thao tác trượt sau năm màn có thanh.',edit(d){
  positions(d,{R1:[0,0],R2:[4.6,0],R3:[4.6,4.6],R4:[0,-4.6],R5:[-4.6,-4.6],R6:[-4.6,0],R7:[0,4.6],R8:[4.6,9.2],R9:[0,9.2],R10:[-4.6,4.6]});
  pin(d,'R9','R7');r(d,'R8').stops=[];r(d,'R2').gapDir=0;r(d,'R6').gapDir=180;
 }},
 257:{source:107,tag:'Combine',title:'Bốn cửa quanh lõi',idea:'Năm nguồn kín dùng chung bốn receiver; bỏ bốn vòng rìa để cụm trọng tâm thành khối rõ, hai receiver phải cùng nhả thanh biên.',edit(d){
  remove(d,['R10','R11','R13','R14']);positions(d,{R1:[0,0],R2:[0,4.5],R3:[0,-4.5],R4:[4.5,0],R5:[-4.5,0],R6:[4.5,4.5],R7:[-4.5,4.5],R8:[4.5,-4.5],R9:[-4.5,-4.5]});bar(d,'Bridge',7.3,0,[[0,-6.2],[0,6.2],[2,6.2]],[0,1]);
 }},
 258:{source:108,tag:'Combine + Challenge dự kiến',title:'Hai cửa trả về tâm',idea:'Giữ tuyến hai receiver bên hông và vòng dưới, mở khe trung tâm từ60 thành90 và gỡ một pin hội tụ dư; thử thứ tự thay vì dựa vào khe sát mép.',edit(d){
  remove(d,['R8']);drop(d,'R10','R1');positions(d,{R1:[0,4.5],R2:[0,0],R3:[-4.5,0],R4:[4.5,0],R5:[4.5,4.5],R6:[-4.5,4.5],R7:[0,-4.5],R9:[4.5,9],R10:[-4.5,9]});r(d,'R1').gap=90;
  bar(d,'S1',-7.3,2.25,[[0,4.2],[0,-4.2],[-2,-4.2]],[0,-1]);
 }},
 259:{source:109,tag:'Practice L/U + Combine',title:'Khung U giữ cửa dưới',idea:'L ở mái, thanh giữa và U dưới nối qua cùng chuỗi receiver; giảm các thanh song song không rõ vai trò, đưa nhánh thấp sát phần giữa.',edit(d){
  remove(d,['Bridge','S3','S5','S6','S7','S8']);positions(d,{R2:[4,-1.5],R3:[-4.8,-1.5],R1:[-2.4,-5.6],R4:[-4.8,3],R5:[4,3],R6:[4,7.5],R9:[2.4,-5.6]});drop(d,'R2','R1');pin(d,'R2','R9');r(d,'R4').gapDir=0;r(d,'R6').gapDir=180;r(d,'R1').gapDir=270;r(d,'R9').gapDir=270;r(d,'R2').stops=[];Object.assign(r(d,'R9').pins[0],{inner:true,angle:0,length:1.1});
  bar(d,'S1',0,2.2,[[0,-4],[0,4]],[0,1]);bar(d,'S2',0,7.1,[[2.5,0],[-2.8,0],[-2.8,-2.2]],[1,0],[{x:0,y:7.1,angle:0}]);
  bar(d,'S4',0,-10.5,[[-2.4,5.5],[-2.4,0],[2.8,0],[2.8,5.5]],[0,1],[{x:-2.4,y:-7.35,angle:90},{x:2.8,y:-7.3,angle:90}]);
 }},
 260:{source:110,tag:'Combine + Challenge dự kiến',title:'Hai cánh ôm cửa giữa',idea:'U ghé hai receiver trái, thanh giữa mở hai vòng đối diện; nguồn kín trên nhận thêm R10, cụm dưới cân với phần trên thay cho nhánh dài rơi xuống.',edit(d){
  remove(d,['S3']);positions(d,{R13:[0,7.2],R4:[-4.4,7.2],R11:[0,2.8],R10:[-4.4,2.8],R7:[0,-1.6],R3:[-4.4,-1.6],R5:[4.4,-1.6],R8:[4.4,2.8],R9:[4.4,7.2],R2:[0,-6],R1:[-4.4,-6]});
  drop(d,'R7','R10');drop(d,'R7','R8');pin(d,'R13','R10');r(d,'R7').gap=90;r(d,'R7').gapDir=90;r(d,'R11').gapDir=270;r(d,'R4').gapDir=180;r(d,'R10').gapDir=180;
  bar(d,'S1',0,.55,[[0,-2.15],[0,2.15]],[0,1],[{x:0,y:.55,angle:90}]);bar(d,'S2',-7.5,5,[[3.1,2.2],[0,2.2],[0,-2.2],[3.1,-2.2]],[1,0],[{x:-6.6,y:7.2,angle:0},{x:-6.5,y:2.8,angle:0}]);
  bar(d,'S4',-7.2,-3.7,[[0,-4.3],[0,4.3],[-2,4.3]],[0,1]);
 }}
};
function author(id){const spec=specs[id],source=SOURCES.get(spec.source),d=clone(source.pack.design);d.sticks=d.sticks||[];for(const ring of d.rings){ring.radius=ring.radius||1.75;ring.lockCount=0;ring.pins=ring.pins||[];}
 spec.edit(d);H.keepInnerPins(d);H.fitPins3(d);
 H.fixGaps(d,45,180);H.fixColors(d,near);
 d.levelId=String(id);d.name='A'+id+' | '+spec.title;d.author='Codex / Designer review batch01';d.notes=spec.tag+'. '+spec.idea+' Tham chiếu A'+spec.source+'; bố cục và vai trò được dựng lại, không tự GD-approved. Kiểm Designer, không Unity/device. Chi tiết kiểm/giới hạn nằm trong delivery manifest.';
 for(let i=0;i<8;i++){const c=JSON.parse(RR.json.stringify(d));if(JSON.stringify(c)===JSON.stringify(d))break;Object.assign(d,c);}
 return{d,spec,source};}
module.exports={author,specs,SOURCES,RR,ROOT};
