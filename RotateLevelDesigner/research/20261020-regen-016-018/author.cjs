'use strict';
const fs=require('fs'),path=require('path'),RR=require('../../rr-core');
const sources={16:'turp-A016-70002-linked-r01.rrpack.json',18:'turp-A018-70009-shared-r06.rrpack.json'};
const canonical=require('../20261020-regen-012-014/author.cjs').canonical;
function author(id){const d=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../ingame',sources[id]))).design;
 d.author='Codex / report_20Level remake';d.levelId=String(id).padStart(3,'0');
 if(id===16){d.sticks[0].path[2][1]=1.9;d.sticks[1].path[2][1]=-1.9;
 d.name='Level 16 — Dịch L, mở vòng rồi quay lại';d.notes='Proposal theo report_20Level L16/§10.3: tăng hai cánh L S1/S2 từ1.3/1.5 lên1.9; giữ10 vòng và bố cục liên kết của bản ingame. Kiểm riêng cách dịch tạm và quay lại, không coi mọi thao tác trượt là phải rút thanh ngay. Không Bom/Chain/Booster; chưa GD duyệt, không nhập ingame/campaign.';
 }else{for(const [id,arm,color]of[['S7',-2.2083,'navy'],['S8',3.22,'blue'],['S9',-3,'purple']]){const st=d.sticks.find(s=>s.id===id),len=st.length;delete st.shape;delete st.length;delete st.arm;st.path=[[-len/2,0],[len/2,0],[len/2,arm],[-len/2,arm]];st.color=color;const rot=p=>{const a=st.angle*RR.D2R;return{x:st.x+p[0]*Math.cos(a)-p[1]*Math.sin(a),y:st.y+p[0]*Math.sin(a)+p[1]*Math.cos(a),angle:st.angle};};st.guides=[rot([-len/2+1.2,0]),rot([len/2-1.5,arm])];}
 d.name='Level 18 — Ba U, hai chân và cửa chung';d.notes='Proposal theo report_20Level L18: giữ11 vòng/2 kín và6 thanh, chuyển S7/S8/S9 thành3 U; còn1 L và2 thẳng. Ba U chân bằng nhau, mỗi chân có1 Guide engaged đặt xa khuỷu; Guide hai vị trí khác nhau để kiểm riêng đoạn giữ/trượt và hướng cản. Giữ các pin nguồn và các liên kết vùng giữa/dưới. Không Bom/Chain/Booster; Combine về cấu trúc, chưa gán Challenge hoặc độ khó. Chưa GD duyệt, không nhập ingame/campaign.';
 }
 return d;
}
module.exports={author,canonical,sources};
if(require.main===module)(async()=>{const sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');for(const id of[16,18]){const d=author(id),b=RR.Design.toLevel(d),s=new RR.Simulation(b.level),pre='A0'+id+'-draft01';fs.writeFileSync(path.join(__dirname,pre+'.rrdesign.json'),canonical(d),{flag:'wx'});await sharp(Buffer.from(RR.Render.render({world:s.world,level:b.level,width:600,labels:true}))).png().toFile(path.join(__dirname,pre+'.png'));console.log(JSON.stringify({id,analysis:RR.analyze(b.level),near:require('../turp-color-near')(d),guides:s.world.guides.map((g,i)=>({id:g.id,engaged:s.world.guideEngaged(i)}))}));}})();
