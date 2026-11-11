"use strict";
const fs=require('fs'),path=require('path'),{api,RR}=require('./turp-continue'),{color}=require('./turp-feedback-author');
const OUT=path.join(__dirname,'20261015-turp-a028-01');fs.mkdirSync(OUT,{recursive:true});const save=(n,v)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
function author(rev='01'){
 const d={format:'turp-design',version:1,levelId:'draft',name:'A028 — Thanh hai nguồn và Bom mở receiver kín / TURP r'+rev,author:'Codex / TURP continuation',notes:'Remake70012: bỏ R8/R10 rìa, dựng lại dọc; Bom chuyển từ receiver kín sang thanh riêng phía trên để mở R1 chung cho R3/R4. R3 và R6 cùng giữ thanh L S2 bằng hai pin song song khác cao độ, liên hệ phần trên và dưới; đo từng pin còn giữ ở pha trượt. R4 kín vẫn giữ R5 và L S6 sau khi R1 bị phá, chưa tự hoàn thành. R7 nhận cả R6/R9, thêm cửa L có ngàm qua khe, các nguồn cần quay lại khi mở đầu ra. Không Guide dư trên thanh nhận pin; thanh mới cardinal. Có Bom, không Booster/Xích, chưa GD duyệt.',rings:[],sticks:[]};
 const specs=[['R1',3.25,9.8,1.75,90,0],['R2',8.15,9.8,1.75,180,90],['R3',-2.45,9.8,1.75,90,90],['R4',3.25,4.9,2.15,90,0],['R5',8.15,4.9,2.15,0,90],['R6',-2.45,4.9,1.75,0,90],['R7',-2.45,0,1.75,180,90],['R9',3.25,-1.5,1.75,0,90]];
 for(const[id,x,y,radius,gapDir,gap]of specs)d.rings.push({id,x,y,radius,gapDir,gap,lockCount:0,pins:[],color:'blue'});
 const r=id=>d.rings.find(x=>x.id===id);function link(a,b){a=r(a);b=r(b);const dx=b.x-a.x,dy=b.y-a.y;a.pins.push({id:'to'+b.id,target:b.id,angle:(Math.atan2(dy,dx)*180/Math.PI+360)%360,length:Math.hypot(dx,dy)-a.radius-.25-b.radius});}
 for(const[a,b]of [['R2','R5'],['R3','R1'],['R4','R1'],['R4','R5'],['R6','R7'],['R9','R7']])link(a,b);
 d.sticks.push({id:'S1',x:10.9854,y:9.8,angle:0,path:[[0,-1.4],[0,1.4],[1.3,1.4]],slideAxis:[0,1],color:'red'});r('R2').pins.push({id:'rightBar',angle:0,target:'S1'});
 d.sticks.push({id:'S2',x:-5.2854,y:4.9,angle:0,path:[[0,-.9],[0,6.3],[-1.3,6.3]],slideAxis:[0,1],color:'red'});for(const id of ['R3','R6'])r(id).pins.push({id:'sharedLeftBar',angle:180,target:'S2'});
 d.sticks.push({id:'S3',x:3.25,y:15.3,angle:0,path:[[0,-2.6],[0,2.6]],slideAxis:[0,1],guides:[{x:3.25,y:15.8,angle:90}],bomb:{x:3.25,y:13.2167},color:'red'});
 d.sticks.push({id:'S4',x:-2.45,y:4.9,angle:0,path:[[0,0],[2.9,0],[2.9,-1.1]],slideAxis:[1,0],guides:[{x:.1,y:4.9,angle:0}],color:'red'});
 d.sticks.push({id:'S5',x:-2.45,y:0,angle:0,path:[[0,0],[-3.8,0],[-3.8,-1.3]],slideAxis:[1,0],guides:[{x:-5.1,y:0,angle:0}],color:'red'});
 d.sticks.push({id:'S6',x:3.25,y:1.2646,angle:0,path:[[-1.4,0],[1.4,0],[1.4,-1.3]],slideAxis:[1,0],color:'red'});r('R4').pins.push({id:'bottomBar',angle:270,target:'S6',length:4.9-1.2646-2.15-.25});
 if(+rev>=2){r('R1').radius=2.15;r('R4').radius=1.75;for(const a of d.rings)for(const p of a.pins){const b=d.rings.find(x=>x.id===p.target);if(b)p.length=Math.hypot(a.x-b.x,a.y-b.y)-a.radius-.25-b.radius;}r('R4').pins.find(p=>p.target==='S6').length=4.9-1.2646-1.75-.25;d.sticks.find(s=>s.id==='S6').path[2][1]=1.3;d.notes+=' r02+ thay r01 về đề xuất: chuyển vòng lớn từ R4 sang receiver Bom R1 để không ép pin tối thiểu giữa hai vòng lớn; gập S6 lên tránh thân R9. Giữ nguyên r01 lỗi.';}
 if(+rev>=3){d.sticks.find(s=>s.id==='S4').guides[0].x=-.5;d.notes+=' r03 đưa Guide S4 ra xa góc gập để đủ ngàm, thay r02 về đề xuất.';}
 if(+rev>=4){link('R3','R6');d.notes+=' r04 thêm R3→R6 để R6 còn nhận pin khi đã mở R7 và S2, cần quay R6 thật qua cửa S4; nối vòng phụ thuộc giữa hai nguồn của thanh chung. Thay r03 về đề xuất, không ghi đè.';}
 if(+rev>=5){r('R3').pins=r('R3').pins.filter(p=>p.target!=='R1');d.notes+=' r05 bỏ R3→R1 vì đối chứng r04 cho thấy pin này không tạo thay đổi trên tập prefix thực: R3 đã bị S2/R6 giữ, R1 vẫn nhận R4. Bom mở liên kết R4→R1; R4 tiếp tục bị giữ ở R5/S6. Thay r04 về đề xuất, giữ counterexample.';}
 if(+rev>=6){const s=d.sticks.find(s=>s.id==='S3');s.path=[[1.3,-2.0833],[0,-2.0833],[0,2.6]];s.bomb.x=4.55;d.notes+=' r06 đổi carrier Bom sang L, Bom gắn đầu nhánh ngang lệch1,3 khỏi trục Guide. Kiểm đường kéo lên có thể hồi phục thay nhánh Bom tự đụng ngàm ở r05. Thay r05 về đề xuất, giữ bản và counterexample cũ.';}
 color(d);const stem='turp-A028-70012-shared-pinbar-bomb-r'+rev;save(stem+'.rrdesign.json',d);const geometry={analysis:RR.analyze(RR.Design.toLevel(d).level),strict:api.OVL.check(d)};save(stem+'-geometry.json',geometry);console.log(JSON.stringify({stem,...geometry}));return{stem,d};
}
if(require.main===module)author(process.argv[2]||'01');module.exports={OUT,save,author};
