"use strict";
// A042 r01 export (generate-only; GD solves). New files only.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),A=require('./turp-a042-author.js');
const stem='turp-A042-10043-shared-U-two-sources-r01',LV=path.join(__dirname,'../levels'),CLI=path.join(__dirname,'../rr-cli.js'),sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const d=A.author('01');
d.notes='Remake10043: bỏ cột phải R8/R9/R14 và Stop của nguồn, dựng lại thành3 cột dọc bước4,9 với đáy kim cương R10/R11/R12, viền mới có U trái và thanh pin phải. Hai nguồn kín R2 (trên) và R7 (giữa trái) radius2,15 cùng màu, các vòng mở1,75, lockCount0, không Stop/Bom/Xích. Liên kết: R2→R1/R3/R5, R5→R4/R6 (R5 vừa nhận vừa phát), R7→R4/R8/R10, R8→R9→R11, R10→R11, R11→R12; R4 nhận hai nguồn R5/R7, R11 nhận hai nguồn R9/R10. Thanh: U S1 hai chân bằng nhau4,1 xuyên khe trái R1/R4, mỗi chân một Guide, chặn cả hai receiver tới khi rút; S2 thanh pin chung nhận pin R3 và R6 (hai nguồn), trượt dọc nhả từng nguồn; S4 thanh pin giữ R10 dưới nguồn R7; S5 L xuyên khe R11; S3 L xuyên khe R12 và chân dưới chặn S6 (thanh pin giữ R12) trượt xuống. Ý tưởng cần nhận ra: mở cửa chung U/S2 theo từng pha, receiver nhận hai nguồn phải quay lại sau khi nguồn kia mở; đáy S3/S6 phụ thuộc nhau. Lời giải do GD tìm (quyết định người dùng16/10/2026), Codex không chạy solve/proof.';
const dp=path.join(LV,stem+'.rrdesign.json'),pp=path.join(LV,stem+'.rrpack.json');
fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(A.OUT,stem+'-geometry.json'),JSON.stringify(A.check(d),null,2)+'\n',{flag:'wx'});
console.log(execFileSync('node',[CLI,'validate',dp]).toString());
execFileSync('node',[CLI,'pack',dp,'-o',pp,'--author','Codex / TURP','--no-solve']);
console.log(execFileSync('node',[CLI,'validate',pp]).toString());
execFileSync('node',[CLI,'render',dp,'-o',path.join(A.OUT,'r01.svg'),'--links']);
(async()=>{await sharp(path.join(A.OUT,'r01.svg')).png().toFile(path.join(A.OUT,'r01.png'));const a=await sharp(path.join(A.OUT,'source.png')).resize({height:800}).toBuffer(),b=await sharp(path.join(A.OUT,'r01.png')).resize({height:800}).toBuffer(),ma=await sharp(a).metadata(),mb=await sharp(b).metadata();await sharp({create:{width:ma.width+mb.width+20,height:800,channels:3,background:'#ffffff'}}).composite([{input:a,left:0,top:0},{input:b,left:ma.width+20,top:0}]).png().toFile(path.join(A.OUT,'r01-vs-source.png'));console.log(require('crypto').createHash('sha256').update(fs.readFileSync(pp)).digest('hex'));})();
