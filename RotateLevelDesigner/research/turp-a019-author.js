"use strict";
const fs=require('fs'),path=require('path'),{api,RR}=require('./turp-continue'),{color}=require('./turp-feedback-author');
const OUT=path.join(__dirname,'20261015-turp-a019-01');fs.mkdirSync(OUT,{recursive:true});const save=(n,v)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
function author(rev='01'){
 const d={format:'turp-design',version:1,levelId:'draft',name:'A019 — Khung U bên trái và receiver dùng chung / TURP r'+rev,author:'Codex / TURP continuation',notes:'Đề xuất nguồn10017: dựng lại10 vòng/5 thanh thành cột dọc, bỏ Bom và mở receiver R1 để không còn vòng kín chờ nổ. R3 retarget sang R10 dùng chung với R9; R5 nối vào R4, các nhánh cùng phụ thuộc. U bên trái đi qua khe R1/R7, hai chân bằng nhau, mỗi chân một Guide đầy đủ. Thanh nhận pin không ngàm dư; không Chain/Booster/Bom. Lời giải và vai trò được kiểm bằng full pointer-target/release; chưa GD duyệt hình và độ khó.',rings:[],sticks:[]};
 const specs=[['R1',-1,0,1.75,180,90],['R2',0,0,1.75,90,0],['R3',0,1,2.15,90,0],['R4',0,2,1.75,270,90],['R5',-1,2,2.15,90,0],['R6',0,-1,1.75,315,90],['R7',-1,-1,1.75,180,90],['R8',1,0,1.75,0,90],['R9',1,1,1.75,90,0],['R10',1,2,1.75,315,90]];
 for(const [id,x,y,radius,gapDir,gap]of specs)d.rings.push({id,x:x*4.9,y:y*4.9,radius,gapDir,gap,lockCount:0,pins:[],color:'blue'});
 const r=id=>d.rings.find(r=>r.id===id);
 if(+rev>=2){r('R2').gap=60;r('R2').gapDir=0;d.notes=d.notes.replace('mở receiver R1','mở các receiver R1/R2');}
 function link(a,b){a=r(a);b=r(b);const dx=b.x-a.x,dy=b.y-a.y;a.pins.push({id:'to'+b.id,angle:(Math.atan2(dy,dx)*180/Math.PI+360)%360,length:Math.hypot(dx,dy)-a.radius-.25-b.radius,target:b.id});}
 for(const [a,b]of [['R2','R1'],['R2','R6'],['R3','R2'],['R3','R1'],['R3','R10'],['R5','R4'],['R6','R7'],['R9','R8'],['R9','R10']])link(a,b);
 function bar(id,owner,angle,points,axis){const o=r(owner),L=o.radius+1.0854;d.sticks.push({id,x:o.x+Math.cos(angle*Math.PI/180)*L,y:o.y+Math.sin(angle*Math.PI/180)*L,angle:0,path:points,slideAxis:axis,color:'red'});o.pins.push({id:'to'+id,angle,target:id});}
 bar('S1','R4',90,[[-1.4,0],[1.4,0],[1.4,1.4]],[1,0]);
 bar('S2','R5',180,[[0,-1.4],[0,1.4],[-1.4,1.4]],[0,1]);
 bar('S3','R5',90,[[-1.6,0],[1.6,0]],[1,0]);
 const a=r('R8');d.sticks.push({id:'S4',x:a.x,y:a.y,angle:0,path:[[0,0],[4,0],[4,1.5]],slideAxis:[1,0],guides:[{x:a.x+2.65,y:a.y,angle:0}],color:'red'});
 d.sticks.push({id:'S5',x:-8.5,y:0,angle:0,path:[[4.2,0],[0,0],[0,-4.9],[4.2,-4.9]],slideAxis:[1,0],guides:[{x:-7.5,y:0,angle:0},{x:+rev>=2?-7.0:-7.5,y:-4.9,angle:0}],color:'red'});
 color(d);const stem='turp-A019-10017-left-U-r'+rev;save(stem+'.rrdesign.json',d);const geometry={analysis:RR.analyze(RR.Design.toLevel(d).level),strict:api.OVL.check(d)};save(stem+'-geometry.json',geometry);console.log(JSON.stringify({stem,...geometry}));return{stem,d};
}
if(require.main===module)author(process.argv[2]||'01');module.exports={OUT,save,author};
