'use strict';
// Authoring only; ingame and shared runtime stay unchanged.
const fs=require('fs'),path=require('path'),RR=require('../../rr-core');
const files={12:'turp-A012-10006.rrpack.json',14:'turp-A014-10014-outline-r01.rrpack.json'};
function author(id){const d=JSON.parse(fs.readFileSync(path.join(__dirname,'../../ingame',files[id]))).design;
 d.author='Codex / report_20Level remake';d.levelId=String(id).padStart(3,'0');
 if(id===12){const r=n=>d.rings.find(r=>r.id===n),a=r('R1'),b=r('R6');
  a.stops=[{angle:+(Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI).toFixed(4),length:1.2}];
  r('R7').color='blue';r('R8').color='orange';r('R6').color='navy';
  const st=d.sticks[0];st.angle=180;st.guides[0].y=st.y;st.guides[0].angle=180;
  d.name='Level 12 — Ôn cửa chốt và quay lại';
  d.notes='Proposal theo report_20Level L12: giữ bố cục 9 vòng, vòng kín R1 và nhánh L; khôi phục StopPin gắn thật trên vòng kín R1, nằm ở khe R6. Mở các nhánh giữ R1 rồi quay lại vùng dưới. Thanh L chỉnh đúng trục ngang/dọc, thân 3.04 và cánh 6.41 >1.5. Sửa phối màu để các vòng cùng màu cùng cỡ và vật gần khác màu. Chưa GD duyệt; không thay ingame/campaign. Không Bom, Chain hoặc Booster. Bằng chứng/giới hạn sẽ được ghi trong delivery JSON.';
 }else{d.sticks.find(s=>s.id==='S1').path[2][1]=1.9;
  d.name='Level 14 — Đọc cánh L và nhiều vùng';
  d.notes='Proposal theo report_20Level L14 và mục10.3: giữ bố cục nhiều vùng, 12 vòng (2 kín), 1 thanh thẳng và 2 L của bản ingame. Tăng cánh L S1 từ1.3 lên1.9, mọi đoạn liên quan >1.5, giữ góc vuông và trục trượt. Không Bom, Chain hoặc Booster. Chưa GD duyệt, không thay ingame/campaign. Native route và kiểm body gesture/counterexample là bằng chứng mô hình, không chứng nhận độ khó hoặc tối thiểu thao tác.';
 }
 return d;
}
function canonical(d){let s=JSON.stringify(d);for(let i=0;i<10;i++){const n=RR.json.stringify(JSON.parse(s));if(n===s)return s+'\n';s=n;}throw Error('No authoring serialization fixed point');}
module.exports={author,canonical,files};
if(require.main===module)for(const id of [12,14]){const d=author(id),b=RR.Design.toLevel(d),s=new RR.Simulation(b.level);fs.writeFileSync(path.join(__dirname,'A'+String(id).padStart(3,'0')+'-draft01.rrdesign.json'),canonical(d),{flag:'wx'});console.log(JSON.stringify({id,analysis:RR.analyze(b.level),near:require('../turp-color-near')(d),guides:s.world.guides.map((g,i)=>({id:g.id,engaged:s.world.guideEngaged(i)}))}));}
