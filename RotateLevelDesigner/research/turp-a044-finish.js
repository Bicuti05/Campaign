"use strict";
// A044 r01 export (generate-only; GD solves). New files only.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),A=require('./turp-a044-author.js');
const stem='turp-A044-70007-capped-pinbar-shared-U-r01',LV=path.join(__dirname,'../levels'),CLI=path.join(__dirname,'../rr-cli.js'),sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const d=A.author('01');
d.sticks.find(s=>s.id==='S3').color='navy';d.sticks.find(s=>s.id==='S7').color='red';{const n=require('./turp-color-near.js')(d);if(n.near.length||n.sizeClash.length)throw Error(JSON.stringify(n));}
d.notes='Remake70007: nguồn15 vòng (3 kín) xếp tháp, 4 thanh thẳng trong đó hai thanh xiên60° và một thanh qua hai khe đối diện R5/R6. Bản mới dựng thẳng lưới3 cột×5 hàng bước4,9, bỏ góc trên phải và dưới trái để viền bậc thang dọc, 13 vòng + 7 thanh ngang/dọc. Ba nguồn kín R4/R6/R11 radius2,15 xếp chéo; vòng mở1,75, lockCount0, không Stop/Bom/Xích. Đổi dây: R4→R2/R3/R5/R7, R6→R3/R7/R9 và thanh pin S4, R11→R8/R10/R13; chuỗi R2→R1→R3, R7→R8, R9→R10→R12→R13. Receiver chung: R3 nhận R4/R6/R1, R7 nhận R4/R6, R8 nhận R11/R7, R10 nhận R11/R9, R13 nhận R11/R12. Thanh: S3/S5 là hai L xuyên khe trái R3/R9, móc bằng nhau2,1 kẹp trên/dưới thanh pin S4 của nguồn R6 nên S4 chỉ nhả được sau khi rút một L; U phải S2 xuyên khe R5/R8, hai chân bằng nhau4,1, mỗi chân một Guide; S1 L vào khe R2 từ góc trên phải; S6 L vào khe R12 từ dưới, chân lấp góc dưới trái; S7 L vào khe R13 từ phải. Ý tưởng cần nhận ra: nguồn R6 bị thanh pin kẹp giữ, phải mở một L trái trước; các receiver chung quay lại sau khi nguồn kia mở. Lời giải do GD tìm (quyết định người dùng16/10/2026), Codex không chạy solve/proof.';
const dp=path.join(LV,stem+'.rrdesign.json'),pp=path.join(LV,stem+'.rrpack.json');
fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(A.OUT,stem+'-geometry.json'),JSON.stringify(require('./turp-a042-author.js').check(d),null,2)+'\n',{flag:'wx'});
console.log(execFileSync('node',[CLI,'validate',dp]).toString());
execFileSync('node',[CLI,'pack',dp,'-o',pp,'--author','Codex / TURP','--no-solve']);
console.log(execFileSync('node',[CLI,'validate',pp]).toString());
execFileSync('node',[CLI,'render',dp,'-o',path.join(A.OUT,'r01.svg'),'--links']);
(async()=>{await sharp(path.join(A.OUT,'r01.svg')).png().toFile(path.join(A.OUT,'r01.png'));const a=await sharp(path.join(A.OUT,'source.png')).resize({height:800}).toBuffer(),b=await sharp(path.join(A.OUT,'r01.png')).resize({height:800}).toBuffer(),ma=await sharp(a).metadata(),mb=await sharp(b).metadata();await sharp({create:{width:ma.width+mb.width+20,height:800,channels:3,background:'#ffffff'}}).composite([{input:a,left:0,top:0},{input:b,left:ma.width+20,top:0}]).png().toFile(path.join(A.OUT,'r01-vs-source.png'));console.log(require('crypto').createHash('sha256').update(fs.readFileSync(pp)).digest('hex'));})();
