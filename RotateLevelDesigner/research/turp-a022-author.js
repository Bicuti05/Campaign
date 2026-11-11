"use strict";
const fs=require('fs'),path=require('path'),{api,RR}=require('./turp-continue'),{color}=require('./turp-feedback-author');
const OUT=path.join(__dirname,'20261015-turp-a022-01');fs.mkdirSync(OUT,{recursive:true});const save=(n,v)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
function author(rev='01'){
 const d={format:'turp-design',version:1,levelId:'draft',name:'A022 — Bom trên thanh L và cửa U trên / TURP r'+rev,author:'Codex / TURP continuation',notes:'Remake10019: bố cục dọc9 vòng/6 thanh. S1 mang Bom ở đầu trái, kéo trái tiếp xúc R3 kín để mở input R4; các cửa dưới có thể tạo đường khác cần đối chứng, không khẳng định Bom bắt buộc trước khi kiểm. U S6 hai chân bằng nhau qua khe trên R1/R8, mỗi chân một Guide đầy đủ; các thanh nhận pin không thêm Guide dư. Bố cục và thứ tự khác nguồn; route có Bom phải ghi rõ, không Booster/Chain. Chưa GD duyệt.',rings:[],sticks:[]};
 const specs=[['R1',0,2,1.75,90,90],['R2',1,1,1.75,315,90],['R3',-1,1,1.75,90,0],['R4',0,1,2.15,270,60],['R5',-1,0,1.75,180,90],['R6',0,-1,1.75,0,90],['R7',-1,2,2.15,225,60],['R8',1,2,1.75,90,90],['R9',-1,3,1.75,90,90]];
 for(const[id,x,y,radius,gapDir,gap]of specs)d.rings.push({id,x:x*4.9,y:y*4.9,radius,gapDir,gap,lockCount:0,pins:[],color:'blue'});
 const r=id=>d.rings.find(r=>r.id===id);if(+rev>=2)r('R4').y-=(+rev>=3?1.2:.6);function link(a,b){a=r(a);b=r(b);const dx=b.x-a.x,dy=b.y-a.y;a.pins.push({id:'to'+b.id,angle:(Math.atan2(dy,dx)*180/Math.PI+360)%360,length:Math.hypot(dx,dy)-a.radius-.25-b.radius,target:b.id});}
 for(const[a,b]of [['R2','R4'],['R2','R8'],['R3','R5'],['R4','R3'],['R6','R5'],['R7','R1'],['R7','R9']])link(a,b);
 if(+rev>=5){link('R4','R6');r('R4').gapDir=70;d.notes=d.notes.replace('để mở input R4','để bỏ một khóa nguồn R4');d.notes+=' R4 thêm pin dọc tới R6, liên hệ cửa giữa với ngàm S3 và receiver R5; phải kiểm quay thực sau mở input. S2 ngắn phần đầu trên để trượt khỏi pin trước vùng vách pin R6.';}
 if(+rev>=6){r('R4').pins=r('R4').pins.filter(p=>p.target!=='R3');d.notes='Remake10019: bố cục dọc9 vòng/6 thanh. S1 mang Bom ở đầu trái; kéo trái phá R3 kín, thay đổi vật cản và nhánh giữ receiver R5. R4 giữ pin dọc vào R6, liên hệ cửa giữa với ngàm S3 và receiver R5; bỏ pin R4→R3 không có chứng cứ vai trò trong các prefix thử. U S6 hai chân bằng nhau qua R1/R8, hai Guide có vai trò riêng. Route giao dùng Bom; hướng phải/đường không nổ phải kiểm và ghi đúng giới hạn. Không Booster/Chain; chưa GD duyệt.';}
 const bombY=r('R1').y-r('R1').radius-1.0854;d.sticks.push({id:'S1',x:0,y:bombY,angle:0,path:[[-2,0],[2,0],[2,1.2]],slideAxis:[1,0],bomb:{x:-2.2,y:bombY},color:'red'});r('R1').pins.push({id:'bombBar',angle:270,target:'S1'});
 if(+rev>=7){d.sticks.find(s=>s.id==='S1').path=[[-2,0],[2.5,0],[2.5,-1]];d.notes+=' Chân phải S1 gập xuống trong cửa R2 để đo đường kéo sang phải trước tiếp xúc Bom; chân và đường trái phải kiểm trên geometry/native gesture.';}
 const a=r('R5');d.sticks.push({id:'S2',x:a.x+a.radius+1.0854,y:a.y,angle:0,path:[[0,-1.4],[0,1.4],[1.3,1.4]],slideAxis:[0,1],color:'red'});a.pins.push({id:'sideGate',angle:0,target:'S2'});
 if(+rev>=4)d.sticks.find(s=>s.id==='S2').path=[[0,1.4],[0,-1.4],[1.3,-1.4]];
 if(+rev>=5)d.sticks.find(s=>s.id==='S2').path=[[0,.6],[0,-1.4],[1.3,-1.4]];
 const b=r('R6');d.sticks.push({id:'S3',x:b.x,y:b.y,angle:0,path:[[0,0],[4,0],[4,-1.3]],slideAxis:[1,0],guides:[{x:b.x+2.65,y:b.y,angle:0}],color:'red'});
 d.sticks.push({id:'S4',x:a.x,y:a.y,angle:0,path:[[0,0],[-3.8,0],[-3.8,1.3]],slideAxis:[1,0],guides:[{x:a.x-2.65,y:a.y,angle:0}],color:'red'});
 const c=r('R9');d.sticks.push({id:'S5',x:c.x,y:c.y,angle:0,path:[[0,0],[0,3.8],[-1.3,3.8]],slideAxis:[0,1],guides:[{x:c.x,y:c.y+2.65,angle:90}],color:'red'});
 d.sticks.push({id:'S6',x:0,y:13.4,angle:0,path:[[0,-4.2],[0,0],[4.9,0],[4.9,-4.2]],slideAxis:[0,1],guides:[{x:0,y:12.4,angle:90},{x:4.9,y:11.9,angle:90}],color:'red'});
 color(d);const stem='turp-A022-10019-bomb-U-r'+rev;save(stem+'.rrdesign.json',d);const geometry={analysis:RR.analyze(RR.Design.toLevel(d).level),strict:api.OVL.check(d)};save(stem+'-geometry.json',geometry);console.log(JSON.stringify({stem,...geometry}));return{stem,d};
}
if(require.main===module)author(process.argv[2]||'01');module.exports={OUT,save,author};
