"use strict";
const fs=require('fs'),path=require('path'),{api,RR}=require('./turp-continue'),{color}=require('./turp-feedback-author');
const OUT=path.join(__dirname,'20261015-turp-a023-01');fs.mkdirSync(OUT,{recursive:true});const save=(n,v)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
function author(rev='01'){
 const d={format:'turp-design',version:1,levelId:'draft',name:'A023 — Cửa U trên và hai nhánh hồi phục / TURP r'+rev,author:'Codex / TURP continuation',notes:'Remake10020: bỏ hai receiver rìa trên R9/R10, U hai chân bằng nhau thay thanh ngang dài; hàng/cột 4.9, hai nguồn kín lớn phía dưới. Bom giữa mở receiver chung R1; các nguồn R2/R3/R6 cần quay lại sau cửa. Thanh L hai bên và thanh giữa cần đo vai trò riêng, không coi đủ vật là đủ khó. Chưa GD duyệt, không Booster/Chain.',rings:[],sticks:[]};
 const specs=[['R1',0,0,1.75,90,0],['R2',1,0,1.75,0,90],['R3',-1,0,1.75,180,90],['R4',1,-1,1.75,180,90],['R5',-1,-1,1.75,0,90],['R6',0,1,1.75,90,90],['R7',-1,1,1.75,90,90],['R8',1,1,1.75,90,90],['R11',-1,-3,1.75,0,90],['R12',-1,-2,2.15,90,0],['R13',1,-3,1.75,180,90],['R14',1,-2,2.15,90,0]];
 for(const[id,x,y,radius,gapDir,gap]of specs)d.rings.push({id,x:x*4.9,y:y*4.9,radius,gapDir,gap,lockCount:0,pins:[],color:'blue'});
 const r=id=>d.rings.find(r=>r.id===id);function link(a,b){a=r(a);b=r(b);const dx=b.x-a.x,dy=b.y-a.y;a.pins.push({id:'to'+b.id,angle:(Math.atan2(dy,dx)*180/Math.PI+360)%360,length:Math.hypot(dx,dy)-a.radius-.25-b.radius,target:b.id});}
 for(const[a,b]of [['R2','R1'],['R3','R1'],['R4','R2'],['R5','R3'],['R6','R1'],['R6','R7'],['R6','R8'],['R12','R11'],['R12','R5'],['R14','R13'],['R14','R4']])link(a,b);
 d.sticks.push({id:'S1',x:0,y:-5.5,angle:0,path:[[0,-2.6],[0,2.6]],slideAxis:[0,1],guides:[{x:0,y:-6,angle:90}],bomb:{x:0,y:-3.4167},color:'red'});
 for(const[id,side]of [['S2',1],['S3',-1]])d.sticks.push({id,x:side*2.0646,y:-8.6,angle:0,path:[[0,-2],[0,3.7],[side*2.1,3.7]],slideAxis:[0,1],guides:[{x:side*2.0646,y:-7.9,angle:90}],color:'red'});
 d.sticks.push({id:'S4',x:0,y:-11.0,angle:0,path:[[-1.7,0],[1.7,0]],slideAxis:[1,0],guides:[{x:0,y:-11,angle:0}],color:'red'});
 d.sticks.push({id:'S5',x:-4.9,y:8.5,angle:0,path:[[0,-4.2],[0,0],[9.8,0],[9.8,-4.2]],slideAxis:[0,1],guides:[{x:-4.9,y:7.55,angle:90},{x:4.9,y:7.05,angle:90}],color:'red'});
 d.sticks.push({id:'S6',x:0,y:4.9,angle:0,path:[[0,0],[0,3.8],[1.3,3.8]],slideAxis:[0,1],guides:[{x:0,y:7.55,angle:90}],color:'red'});
 d.sticks.push({id:'S7',x:0,y:-14.7,angle:0,path:[[-3.6,0],[3.6,0]],slideAxis:[1,0],guides:[{x:0,y:-14.7,angle:0}],color:'red'});
 if(+rev>=2){const u=d.sticks.find(s=>s.id==='S5'),g=d.sticks.find(s=>s.id==='S6');u.x=0;u.path=[[0,-4.2],[0,0],[4.9,0],[4.9,-4.2]];u.guides=[{x:0,y:7.55,angle:90},{x:4.9,y:7.05,angle:90}];g.x=-4.9;g.guides=[{x:-4.9,y:7.55,angle:90}];d.notes+=' U đổi sang hai vòng kề R6/R8 bước4.9, L S6 qua khe R7 riêng; bỏ ôm rộng và chỗ cắt ngang thanh L ở r01.';}
 if(+rev>=3){for(const id of ['S2','S3'])d.sticks.find(s=>s.id===id).path[0][1]=-3.9;const s=d.sticks.find(s=>s.id==='S4');s.y=-13.1;s.path=[[-2.3,0],[2.3,0]];s.guides=[{x:0,y:-13.1,angle:0}];d.notes+=' S4 hạ vào khoảng giữa hai receiver dưới và kéo dài tới đường trượt chân L S2/S3; hai chân L dài xuống để S4 giữ lượt chuẩn bị, cần mở receiver dưới trước rút thanh giữa. Không coi witness ở nhánh tự đóng lại là đủ vai trò trên lời giải.';}
 color(d);const stem='turp-A023-10020-return-U-r'+rev;save(stem+'.rrdesign.json',d);const geometry={analysis:RR.analyze(RR.Design.toLevel(d).level),strict:api.OVL.check(d)};save(stem+'-geometry.json',geometry);console.log(JSON.stringify({stem,...geometry}));return{stem,d};
}
if(require.main===module)author(process.argv[2]||'01');module.exports={OUT,save,author};
