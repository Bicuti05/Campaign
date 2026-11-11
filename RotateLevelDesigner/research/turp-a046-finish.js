"use strict";
// A046 r01 export (generate-only; GD solves). New files only.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),A=require('./turp-a046-author.js');
const stem='turp-A046-60023-brick-sources-top-U-r01',LV=path.join(__dirname,'../levels'),CLI=path.join(__dirname,'../rr-cli.js'),sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const d=A.author('01');
d.sticks.find(x=>x.id==='S6').color='purple';{const n=require('./turp-color-near.js')(d);if(n.near.length||n.sizeClash.length)throw Error(JSON.stringify(n));}
d.notes='Remake60023: nguồn là lưới3×4 gồm12 vòng mở đối xứng, không thanh, pin chéo dài idle lúc nạp. Bản mới xếp gạch lệch (hex) 2-3-2-3-2, mọi vòng đứng thẳng, viền dọc lục giác; 12 vòng + 6 thanh ngang/dọc. Hai nguồn kín R4/R9 radius2,15 cùng màu ở tâm hai nửa, mỗi nguồn4 đầu ra; vòng mở1,75, lockCount0, không Stop/Bom/Xích; mọi pin chạm lúc nạp. Liên kết: R4→R1/R2/R3/R7, R9→R6/R10/R11/R12, chuỗi R1→R2→R5, R3→R6→R8, R7→R5/R10, R11→R12. Receiver chung: R2 nhận R4/R1, R5 nhận R2/R7, R6 nhận R9/R3, R10 nhận R9/R7, R12 nhận R9/R11. Thanh: S1 thanh pin chung bên trái của hai receiver R3/R8 (trượt lên nhả R3, xuống nhả R8), móc của S2 chặn chiều xuống tới khi rút S2; S2 L vào khe R1 từ trái; S3 L vào khe R2 từ dưới; S4/S5 L vào khe R5/R10 từ phải; U S6 mở xuống xuyên khe trên R11/R12, hai chân bằng nhau4,1, mỗi chân một Guide. Ý tưởng cần nhận ra: hai nguồn kín chia sẻ receiver qua hàng giữa R6/R7; thanh pin trái nhả hai receiver theo hai chiều, một chiều bị chặn. Lời giải do GD tìm (quyết định người dùng16/10/2026), Codex không chạy solve/proof.';
const dp=path.join(LV,stem+'.rrdesign.json'),pp=path.join(LV,stem+'.rrpack.json');
fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(A.OUT,stem+'-geometry.json'),JSON.stringify(require('./turp-a042-author.js').check(d),null,2)+'\n',{flag:'wx'});
console.log(execFileSync('node',[CLI,'validate',dp]).toString());
execFileSync('node',[CLI,'pack',dp,'-o',pp,'--author','Codex / TURP','--no-solve']);
console.log(execFileSync('node',[CLI,'validate',pp]).toString());
execFileSync('node',[CLI,'render',dp,'-o',path.join(A.OUT,'r01.svg'),'--links']);
(async()=>{await sharp(path.join(A.OUT,'r01.svg')).png().toFile(path.join(A.OUT,'r01.png'));const a=await sharp(path.join(A.OUT,'source.png')).resize({height:800}).toBuffer(),b=await sharp(path.join(A.OUT,'r01.png')).resize({height:800}).toBuffer(),ma=await sharp(a).metadata(),mb=await sharp(b).metadata();await sharp({create:{width:ma.width+mb.width+20,height:800,channels:3,background:'#ffffff'}}).composite([{input:a,left:0,top:0},{input:b,left:ma.width+20,top:0}]).png().toFile(path.join(A.OUT,'r01-vs-source.png'));console.log(require('crypto').createHash('sha256').update(fs.readFileSync(pp)).digest('hex'));})();
