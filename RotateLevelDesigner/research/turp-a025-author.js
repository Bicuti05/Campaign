"use strict";
const fs=require('fs'),path=require('path'),{api,RR}=require('./turp-continue'),{color}=require('./turp-feedback-author');const OUT=path.join(__dirname,'20261015-turp-a025-01');fs.mkdirSync(OUT,{recursive:true});const save=(n,v)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
function author(rev='01'){
 const d={format:'turp-design',version:1,levelId:'draft',name:'A025 — U chung và nguồn kín giữa cụm / TURP r'+rev,author:'Codex / TURP continuation',notes:'Remake70008 thành hàng/cột và xoay90 độ để dựng dọc. U S1 chung qua hai khe R2/R3, hai chân bằng nhau và mỗi chân một Guide; R5 giữ cả hai receiver nên cần đo quay lại nguồn. Vòng kín lớn R4 giữ bốn đầu ra; R8 lớn giữ R7/R6, R7 nhận thanh giữa S3, R1 giữ R9 và L S5. Các thanh ngang/dọc, pin dài theo vị trí thật, không Guide dư trên thanh nhận pin. Không Bom/Booster/Chain; cần kiểm vai trò từng cửa và so nguồn, chờ GD.',rings:[],sticks:[]};
 const specs=[['R1',-1,-1,1.75,180,90],['R2',-1,1,1.75,90,90],['R3',0,1,1.75,90,90],['R4',0,0,2.15,90,0],['R5',-1,0,1.75,225,90],['R6',1,0,1.75,270,90],['R7',1,1,1.75,90,90],['R8',2,0,2.15,270,90],['R9',0,-1,1.75,270,90]];
 for(const[id,x,y,radius,gapDir,gap]of specs)d.rings.push({id,x:x*4.9,y:y*4.9,radius,gapDir,gap,lockCount:0,pins:[],color:'blue'});const r=id=>d.rings.find(r=>r.id===id);
 function link(a,b){a=r(a);b=r(b);const dx=b.x-a.x,dy=b.y-a.y;a.pins.push({id:'to'+b.id,target:b.id,angle:(Math.atan2(dy,dx)*180/Math.PI+360)%360,length:Math.hypot(dx,dy)-a.radius-.25-b.radius});}
 for(const[a,b]of [['R1','R9'],['R4','R3'],['R4','R5'],['R4','R6'],['R4','R9'],['R5','R3'],['R5','R2'],['R8','R7'],['R8','R6']])link(a,b);
 d.sticks.push({id:'S1',x:-4.9,y:8.5,angle:0,path:[[0,-4.2],[0,0],[4.9,0],[4.9,-4.2]],slideAxis:[0,1],guides:[{x:-4.9,y:7.55,angle:90},{x:0,y:7.05,angle:90}],color:'red'});
 d.sticks.push({id:'S2',x:4.9,y:4.9,angle:0,path:[[0,0],[0,3.8],[1.3,3.8]],slideAxis:[0,1],guides:[{x:4.9,y:7.55,angle:90}],color:'red'});
 d.sticks.push({id:'S3',x:2.45,y:4.9,angle:0,path:[[0,-1.3],[0,1.3]],slideAxis:[0,1],color:'red'});r('R7').pins.push({id:'middleBar',angle:180,length:.45,target:'S3'});
 d.sticks.push({id:'S4',x:0,y:-4.9,angle:0,path:[[0,0],[0,-3.8],[1.3,-3.8]],slideAxis:[0,1],guides:[{x:0,y:-7.55,angle:90}],color:'red'});
 d.sticks.push({id:'S5',x:-4.9,y:-7.7354,angle:0,path:[[-1.4,0],[1.4,0],[1.4,-1.3]],slideAxis:[1,0],color:'red'});r('R1').pins.push({id:'lowerGate',angle:270,target:'S5'});
 d.sticks.push({id:'S6',x:4.9,y:0,angle:0,path:[[0,0],[0,-3.8],[-1.3,-3.8]],slideAxis:[0,1],guides:[{x:4.9,y:-2.65,angle:90}],color:'red'});
 // A single rigid90-degree view/layout change; rotate axes, authored pin angles and guides consistently.
 for(const o of [...d.rings,...d.sticks]){const x=o.x;o.x=-o.y;o.y=x;if(d.rings.includes(o)){o.gapDir=(o.gapDir+90)%360;for(const p of o.pins)p.angle=(p.angle+90)%360;}else{o.angle=90;if(+rev<2&&o.slideAxis)o.slideAxis=[-o.slideAxis[1],o.slideAxis[0]];for(const g of o.guides||[]){const x=g.x;g.x=-g.y;g.y=x;g.angle=(g.angle+90)%360;}}}
 color(d);const stem='turp-A025-70008-shared-U-r'+rev;save(stem+'.rrdesign.json',d);const geometry={analysis:RR.analyze(RR.Design.toLevel(d).level),strict:api.OVL.check(d)};save(stem+'-geometry.json',geometry);console.log(JSON.stringify({stem,...geometry}));return{stem,d};
}
if(require.main===module)author(process.argv[2]||'01');module.exports={OUT,save,author};
