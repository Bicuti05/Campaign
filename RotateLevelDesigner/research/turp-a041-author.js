"use strict";
const fs=require('fs'),path=require('path'),{api,RR}=require('./turp-continue'),{linkedColors}=require('./turp-a032-author'),OUT=path.join(__dirname,'20261016-turp-a041-01'),save=(n,v)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
function author(rev='01'){
 const d={format:'turp-design',version:1,levelId:'draft',name:'A041 — U cửa chung và các thanh hồi tiếp / TURP r'+rev,author:'Codex / TURP continuation',notes:'Remake10111 giữ đặc trưng chỉ thanh/ngàm, không tự thêm ring để đổi family. Nguồn23 thanh, bản nghiên cứu16 thanh: U ngang S1 giữ hai biên của sáu L dọc S2–S7, hai chân8 bằng nhau/cách10, hai Guide đầy đủ cách góc có mục đích. S1 mở dần theo cột nhưng còn giữ để quay lại. Cửa ngoài S8/S9/S10/S11/S12 dùng chung phía trên; S15 vừa chặn U sang phải vừa chặn cửa đáy S14, S16 chặn S14 bên trái và S13 dọc ngoài; S13/S16 có đường phụ thuộc theo hướng. Hypothesis cần full gesture/ablation chứng minh; không gọi mọi thứ tự bắt buộc. Tất cả trục ngang/dọc, tube/Guide mặc định; không ring/pin/Stop/Bom/Booster/Chain. Cùng một quan hệ cửa chung/đường hồi phục, không ghép nhiều cụm độc lập. Nguồn native23/maxDepth1 có strict overlap, không coi là Unity baseline/độ khó người chơi.',rings:[],sticks:[]};
 const add=(id,x,y,path,axis,guides)=>d.sticks.push({id,x,y,angle:0,path,slideAxis:axis,guides,color:'blue'});
 add('S1',0,0,[[-4,0],[4,0],[4,10],[-4,10]],[1,0],[{x:-1,y:0,angle:0},{x:2.75,y:10,angle:0}]);
 for(let i=0;i<6;i++){const x=-3+i*1.25;add('S'+(i+2),x,5,[[0,-4],[0,4],[-.7,4]],[0,1],[{x,y:5,angle:90}]);}
 add('S8',6,5,[[0,-6],[0,6],[-1,6]],[0,1],[{x:6,y:5,angle:90}]);
 add('S9',6.5,12,[[-2,0],[2,0],[2,1.2]],[1,0],[{x:6.5,y:12,angle:0}]);
 add('S10',10,13,[[0,-2],[0,2]],[0,1],[{x:10,y:13,angle:90}]);
 add('S11',3.5,13,[[0,-2],[0,2]],[0,1],[{x:3.5,y:13,angle:90}]);
 add('S12',6.75,16,[[-4.75,0],[4.75,0]],[1,0],[{x:6.75,y:16,angle:0}]);
 add('S13',-5.5,5,[[0,-4],[0,4],[2,4]],[0,1],[{x:-5.5,y:5,angle:90}]);
 add('S14',0,-2,[[-4,0],[4,0],[4,-1.2]],[1,0],[{x:0,y:-2,angle:0}]);
 add('S15',5.5,-2,[[0,-2],[0,2],[-1,2]],[0,1],[{x:5.5,y:-2,angle:90}]);
 add('S16',-5.5,-2,[[0,2],[0,-2],[2,-2]],[0,1],[{x:-5.5,y:-2,angle:90}]);
 if(+rev>=2){for(let i=0;i<6;i++){const s=d.sticks.find(s=>s.id==='S'+(i+2));s.x=-3.75+i*1.25;s.guides[0].x=s.x;}const u=d.sticks.find(s=>s.id==='S1');u.guides[0].x=-3;u.guides[1].x=3;const s=d.sticks.find(s=>s.id==='S13');s.path=[[0,-4],[0,3.25],[1.1,3.25]];d.notes+=' r01 hai nhánh đầu L S2/S13 đè nhau, giữ research. r02 hạ móc S13 xuống0,75 và rút còn1,1, dịch sáu cột trái0,75 để U còn được Guide trên giữ khi mở hết các cột ở+7,2. Hai Guide ở x−3/+3 cách góc1 đơn vị có mục đích giữ U cả lúc mở và trả lại, phải kiểm hình học đủ và roles. Không giả trạng thái giữ từ hình.';}
 if(+rev>=3){for(let i=0;i<6;i++){const s=d.sticks.find(s=>s.id==='S'+(i+2));s.x=-3.75+i*1.15;s.guides[0].x=s.x;s.path[2][0]=-.6;}d.notes+=' r02 full pointer U+7.2 removes frame before return; reject retained-frame hypothesis for r02. r03 columns use spacing1.15 and hooks0.6 to clear final column at+6.7 while upper Guide still engaged. Must verify full gesture, not infer from input.';}
 linkedColors(d);const stem='turp-A041-10111-shared-U-sliders-r'+rev;save(stem+'.rrdesign.json',d);const geometry={analysis:RR.analyze(RR.Design.toLevel(d).level),strict:api.OVL.check(d)};save(stem+'-geometry.json',geometry);console.log(JSON.stringify({stem,...geometry}));return{stem,d};
}
if(require.main===module)author(process.argv[2]||'01');module.exports={OUT,save,author};
