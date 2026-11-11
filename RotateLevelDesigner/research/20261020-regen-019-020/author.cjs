'use strict';
const fs=require('fs'),path=require('path'),RR=require('../../rr-core'),{canonical}=require('../20261020-regen-012-014/author.cjs');
const sources={19:'turp-A019-10017-left-U-r02.rrpack.json',20:'genai-24-rabbit-v03.rrpack.json'};
function author(id){const d=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../ingame',sources[id]))).design;d.author='Codex / report_20Level remake';d.levelId=String(id).padStart(3,'0');
 if(id===19){d.sticks.find(s=>s.id==='S4').path[2][1]=1.9;d.sticks.find(s=>s.id==='S8').arm=1.9;d.rings.find(r=>r.id==='R11').color='blue';d.name='Level 19 — Nhận lại bom và mở nguồn kín';d.notes='Proposal theo report_20Level L19/§10.3: giữ bố cục vòng và U bên trái, tăng hai cánh L từ1.5 lên1.9; sửa màu vòng R11 theo lớp cỡ. Kiểm riêng vai trò bom/Stop và đường tháo. Không Chain/Booster, chưa GD duyệt, không nhập ingame/campaign.';
 }else{const r=n=>d.rings.find(r=>r.id===n);r('R1').gapDir=75;r('R1').color='blue';r('R1').pins=[{id:'leftMouth',angle:180,inner:true,length:4.85,targets:['S8']},{id:'rightMouth',angle:0,inner:true,length:4.85,targets:['S9']}];r('R2').color='navy';r('R3').color='orange';r('R4').color='red';
 for(const [id,x,side]of[['S1',-3.8125,1],['S2',3.8125,-1]]){const s=d.sticks.find(s=>s.id===id);s.angle=0;s.path=[[0,-4.75],[0,4.75],[side*1.8,4.75]];s.slideAxis=[0,1];s.guides=[{x,y:s.y,angle:90}];s.color='purple';}
 for(const id of['S3','S4','S5','S6']){const s=d.sticks.find(s=>s.id===id);s.path=[[-1.7,0],[1.7,0]];s.angle=0;s.slideAxis=[1,0];s.guides=[{x:s.x,y:s.y,angle:0}];s.color=['S3','S5'].includes(id)?'orange':'green';}
 const left=d.sticks.find(s=>s.id==='S8');delete left.shape;delete left.length;delete left.arm;left.x=0;left.y=0;left.angle=0;left.path=[[-.35,-6.4],[-2.4,-6.4],[-2.4,-2.25]];left.slideAxis=[0,1];left.guides=[{x:-2.4,y:-5.3,angle:90}];left.color='teal';
 d.sticks.push({id:'S9',x:0,y:0,angle:0,color:'purple',path:[[.35,-6.4],[2.4,-6.4],[2.4,-2.25]],slideAxis:[0,1],guides:[{x:2.4,y:-5.3,angle:90}]});
 d.name='Level 20 — Hai L giữ miệng, quay lại sau khi mở mặt';d.notes='Proposal report_20Level L20: giữ silhouette đầu/tai/mắt/râu của ingame; dựng4 L (2 tai+2 nửa miệng), các thanh mới ngang/dọc, mọi đoạn>1.5. Pin gắn trong thật trên vòng mặt giữ hai L miệng; dịch tạm để mở input mặt nhưng Guide còn giữ L. Vòng mặt còn cản rút hết, mở các mắt/mũi và quay mặt rồi quay lại rút hai L. Không Bom/vòng kín/Chain/Booster. Chưa GD duyệt silhouette/độ khó; không nhập ingame/campaign.';
 }
 return d;
}
module.exports={author,canonical,sources};
if(require.main===module)(async()=>{const sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');for(const id of[19,20]){const d=author(id),b=RR.Design.toLevel(d),w=RR.World.build(b.level),pre='A0'+id+'-draft01';fs.writeFileSync(path.join(__dirname,pre+'.rrdesign.json'),canonical(d),{flag:'wx'});await sharp(Buffer.from(RR.Render.render({world:w,level:b.level,width:620,labels:true}))).png().toFile(path.join(__dirname,pre+'.png'));console.log(JSON.stringify({id,analysis:RR.analyze(b.level),color:require('../turp-color-near')(d),ids:b.ids}));}})();
