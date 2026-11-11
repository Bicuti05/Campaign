"use strict";
// A043 r01 export (generate-only; GD solves). New files only.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),A=require('./turp-a043-author.js');
const stem='turp-A043-10053-triple-source-hub-two-U-r01',LV=path.join(__dirname,'../levels'),CLI=path.join(__dirname,'../rr-cli.js'),sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const d=A.author('01');
d.notes='Remake10053: nguồn là cụm hữu cơ21 vòng (5 nguồn kín) xoay lệch, không thanh. Bản mới dựng thẳng lưới4 cột×5 hàng bước4,9, bỏ ba góc (trên trái, hai góc đáy), 17 vòng + 6 thanh ngang/dọc lấp góc với vai trò. Ba nguồn kín R5/R10/R13 radius2,15, mỗi nguồn4 đầu ra; vòng mở1,75, lockCount0, không Stop/Bom/Xích. Receiver chung: R9 nhận cả ba nguồn R5/R10/R13; R6 nhận R5/R10/R2; R14 nhận R10/R13; R1 nhận R5/R2. Chuỗi nguồn mở: R3→R2/R7, R2→R1/R6, R7→R11, R4→R8, R14→R15, R16→R17. Thanh: U trái S1 xuyên khe R8/R12 (hàng2/1), U phải S2 xuyên khe R7/R11 (hàng3/2), lệch hàng nhau, hai chân bằng nhau4,15, mỗi chân một Guide; S3 L từ góc trên trái vào khe R4; S4 L vào khe R15, chân xuống góc dưới phải; S5 L vào khe R16 từ dưới; S6 thanh pin giữ R17, quá dài nên bị chân S4 (phải) hoặc chân S5 (trái) chặn trước khi nhả. Ý tưởng cần nhận ra: mở dần ba nguồn quanh hub R9 và quay lại các receiver chung; cửa U hai bên giữ receiver tới khi rút. Lời giải do GD tìm (quyết định người dùng16/10/2026), Codex không chạy solve/proof.';
const dp=path.join(LV,stem+'.rrdesign.json'),pp=path.join(LV,stem+'.rrpack.json');
fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(A.OUT,stem+'-geometry.json'),JSON.stringify(require('./turp-a042-author.js').check(d),null,2)+'\n',{flag:'wx'});
console.log(execFileSync('node',[CLI,'validate',dp]).toString());
execFileSync('node',[CLI,'pack',dp,'-o',pp,'--author','Codex / TURP','--no-solve']);
console.log(execFileSync('node',[CLI,'validate',pp]).toString());
execFileSync('node',[CLI,'render',dp,'-o',path.join(A.OUT,'r01.svg'),'--links']);
(async()=>{await sharp(path.join(A.OUT,'r01.svg')).png().toFile(path.join(A.OUT,'r01.png'));const a=await sharp(path.join(A.OUT,'source.png')).resize({height:800}).toBuffer(),b=await sharp(path.join(A.OUT,'r01.png')).resize({height:800}).toBuffer(),ma=await sharp(a).metadata(),mb=await sharp(b).metadata();await sharp({create:{width:ma.width+mb.width+20,height:800,channels:3,background:'#ffffff'}}).composite([{input:a,left:0,top:0},{input:b,left:ma.width+20,top:0}]).png().toFile(path.join(A.OUT,'r01-vs-source.png'));console.log(require('crypto').createHash('sha256').update(fs.readFileSync(pp)).digest('hex'));})();
