'use strict';
const fs=require('fs'),path=require('path'),RR=require('../../rr-core.js'),H=require('../turp-src-remake.js'),near=require('../turp-color-near.js');
const r=(id,x,y,gapDir,gap=90,radius=1.75,color='purple')=>({id,x,y,gapDir,gap,radius,color,pins:[]});
const bar=(id,x,y,path,axis,guides,color)=>({id,x,y,angle:0,path,slideAxis:axis,guides,color});
function make(id){let d={format:'turp-design',version:1,levelId:String(id),name:'Level '+id,author:'Codex / source distinction 2026-10-27',rings:[],sticks:[]};
 if(id===120){
  d.rings=[r('R1',0,0,0,0,1.75,'teal'),r('R2',-4.8,0,0,0,1.75,'red'),r('R3',0,4.8,0,0,1.75,'orange'),r('R4',4.8,4.8,0),r('R5',0,-4.8,0,0,1.75,'green'),r('R6',-4.8,-4.8,270),r('R7',-4.8,4.8,180),r('R8',4.8,-4.8,270),r('R9',4.8,0,0)];
  d.rings[0].bomb={x:1.237436867,y:1.237436867,radius:.75};
  d.sticks=[bar('S1',2.6,0,[[0,-3],[0,3]],[0,1],[{x:2.6,y:-1,angle:90}],'blue'),bar('S2',-8,4.8,[[3.2,0],[-1.6,0],[-1.6,2.2]],[1,0],[{x:-7.2,y:4.8,angle:0}],'red'),bar('S3',0,-8,[[-4.8,3.8],[-4.8,0],[4.8,0],[4.8,3.8]],[0,1],[{x:-4.8,y:-7,angle:90},{x:4.8,y:-7,angle:90}],'orange')];
  for(const [a,b]of[['R2','R1'],['R2','R6'],['R2','R7'],['R3','R1'],['R3','R4'],['R3','R7'],['R5','R1'],['R5','R8'],['R8','R9'],['R4','R9']])H.setPin(d,a,b);
  d.notes='A120 sửa khác nguồn10090: bốn nguồn kín thành cụm vuông quanh receiver Bom R1; thanh thẳng S1 nằm giữa để kích nổ, cánh L trái và U đáy. Bỏ hình hai cột xiên, U đứng ngoài phải và các đường chéo của bản cũ. R7/R9 là receiver chung cho nhánh trên/dưới. Bom phải phá R1; quay lại các nguồn sau khi mở receiver. Không Booster/Chain. Độ khó chưa GD kiểm.';
 }else if(id===122){
  d.rings=[r('R1',-2.8,-2.8,0,0,1.5,'red'),r('R2',-2.8,5.6,90,90,1.5,'teal'),r('R3',5.6,-2.8,0,90,1.5,'teal'),r('R4',-2.8,-2.8,270,90,4.2,'orange'),r('R5',5.6,5.6,0,90,1.75,'purple'),r('R6',1.4,5.6,90,90,1.5,'green'),r('R7',5.6,1.4,0,90,1.5,'green'),r('R8',-8,5.6,90,90,1.5,'purple'),r('R9',5.6,-8,270,90,1.5,'purple'),r('R10',-8,1.2,0,0,1.75,'red'),r('R11',1.2,-8,0,0,1.75,'red')];
  d.sticks=[bar('S1',-.7,9.2,[[-2.1,-4.2],[-2.1,0],[2.1,0],[2.1,-4.2]],[0,1],[{x:-2.8,y:8,angle:90},{x:1.4,y:8,angle:90}],'red'),bar('S2',8.3,1.4,[[-2.7,0],[1.4,0],[1.4,-2.2]],[1,0],[{x:8,y:1.4,angle:0}],'purple'),bar('S3',5.6,-10.6,[[0,2.6],[0,-1.2],[-2.2,-1.2]],[0,1],[{x:5.6,y:-10,angle:90}],'orange')];
  for(const [a,b]of[['R1','R4'],['R4','R2'],['R4','R3'],['R2','R6'],['R3','R7'],['R6','R5'],['R7','R5'],['R8','R2'],['R9','R3'],['R10','R8'],['R11','R9']])H.setPin(d,a,b);
  d.rings[0].pins[0].angle=180;d.rings[2].stops=[{angle:135,length:2.2}];
  d.notes='A122 sửa khác nguồn10021: vòm7.5 và hai tai nhỏ được thay bằng sân vòng4.2 lệch trái, chỉ một nguồn kín bên trong. Hai nhánh chạy theo viền trên/phải qua R6/R7 tới receiver chung R5; R10/R11 ở hai góc nối thêm vào hai cửa. U hai khe ở trên, hai L ở phải/dưới; một Stop thay ba Stop cũ. Giữ ý tưởng mở receiver ngoài rồi quay về vòng bao và nguồn trong; không Bom/Booster/Chain. Độ khó chưa GD kiểm.';
 }else throw Error('Only120/122 are authorized');
 H.fitPins3(d);H.fixGaps(d,45,180);H.fixColors(d,near);
 for(let i=0;i<8;i++){const n=JSON.parse(RR.json.stringify(d));if(JSON.stringify(n)===JSON.stringify(d))break;Object.assign(d,n);}
 return d;
}
module.exports={make};
if(require.main===module)for(const id of[120,122]){const d=make(id),f=path.join(__dirname,'A'+id+'-draft01.rrdesign.json');fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n',{flag:'wx'});console.log(id,RR.analyze(RR.Design.toLevel(d).level));}
