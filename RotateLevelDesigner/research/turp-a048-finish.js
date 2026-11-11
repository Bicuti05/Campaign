"use strict";
// A048 r01 export (generate-only; GD solves). New files only.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),A=require('./turp-a048-author.js');
const stem='turp-A048-60007-upright-locked-pair-r01',LV=path.join(__dirname,'../levels'),CLI=path.join(__dirname,'../rr-cli.js'),sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const d=A.author('01');
for(const id of ['S3','S5'])d.sticks.find(x=>x.id===id).color='navy';{const n=require('./turp-color-near.js')(d);if(n.near.length||n.sizeClash.length)throw Error(JSON.stringify(n));}
d.notes='Remake60007: nguồn là khung ngang14 vòng mở đối xứng tâm (4 vòng góc tự do lúc nạp) với hai L ngang khóa nhau ở giữa. Bản mới dựng dọc: hai cột vòng hai bên, kênh giữa có hai L dọc khóa nhau, hai nguồn kín R9 (trên) và R10 (dưới) radius2,15 chặn đầu thoát của kênh; 10 vòng + 6 thanh ngang/dọc, không vật tự do, lockCount0, không Stop/Bom/Xích. Liên kết: R9→R1/R5, R10→R4/R8, R1→R2→R3, R4→R3, R5→R6→R7, R8→R7; R2 cắm thanh pin S1, R6 cắm thanh pin S2. Thanh: S1 L dọc có Guide, móc dưới nằm dưới chân S2, thoát xuống bị R10 chặn nhưng trượt xuống một đoạn nhả R2; S2 L dọc có Guide, móc trên phủ đầu S1, thoát lên bị R9 chặn, chỉ nhả R6 khi trượt xuống đủ sâu, mà muốn vậy S1 phải xuống trước; U trái S3 xuyên khe R1/R2 (hàng trên), U phải S4 xuyên khe R7/R8 (hàng dưới), hai chân bằng nhau, mỗi chân một Guide; S5 L vào khe R5 từ phải; S6 L vào khe R4 từ trái. Ý tưởng cần nhận ra: cặp L giữa vừa là thanh pin của hai bên vừa khóa nhau theo thứ tự; nguồn trên/dưới chỉ tháo khi các receiver hai cột quay mở. Lời giải do GD tìm (quyết định người dùng16/10/2026), Codex không chạy solve/proof.';
const dp=path.join(LV,stem+'.rrdesign.json'),pp=path.join(LV,stem+'.rrpack.json');
fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(A.OUT,stem+'-geometry.json'),JSON.stringify(require('./turp-a042-author.js').check(d),null,2)+'\n',{flag:'wx'});
console.log(execFileSync('node',[CLI,'validate',dp]).toString());
execFileSync('node',[CLI,'pack',dp,'-o',pp,'--author','Codex / TURP','--no-solve']);
console.log(execFileSync('node',[CLI,'validate',pp]).toString());
execFileSync('node',[CLI,'render',dp,'-o',path.join(A.OUT,'r01.svg'),'--links']);
(async()=>{await sharp(path.join(A.OUT,'r01.svg')).png().toFile(path.join(A.OUT,'r01.png'));const a=await sharp(path.join(A.OUT,'source.png')).resize({height:800}).toBuffer(),b=await sharp(path.join(A.OUT,'r01.png')).resize({height:800}).toBuffer(),ma=await sharp(a).metadata(),mb=await sharp(b).metadata();await sharp({create:{width:ma.width+mb.width+20,height:800,channels:3,background:'#ffffff'}}).composite([{input:a,left:0,top:0},{input:b,left:ma.width+20,top:0}]).png().toFile(path.join(A.OUT,'r01-vs-source.png'));console.log(require('crypto').createHash('sha256').update(fs.readFileSync(pp)).digest('hex'));})();
