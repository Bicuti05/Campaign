"use strict";
// A053 r01 export (generate-only; GD solves). New files only.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),A=require('./turp-a053-author.js');
const stem='turp-A053-10056-staircase-sources-three-U-r01',LV=path.join(__dirname,'../levels'),CLI=path.join(__dirname,'../rr-cli.js'),sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const d=A.author('01');
d.sticks.find(x=>x.id==='S2').color='purple';d.sticks.find(x=>x.id==='S3').color='red';{const n=require('./turp-color-near.js')(d);if(n.near.length||n.sizeClash.length)throw Error(JSON.stringify(n));}
d.notes='Board A level53 (ref index (6).html: 12 vòng/12 pin, 10 thanh/11 ngàm, vòng kín4/9/12; nguồn khớp TURP 10056, cụm hữu cơ có thanh xiên qua khe). Bản mới dựng thẳng lưới3 cột bước4,9: ba nguồn kín R1/R2/R3 radius2,15 xếp bậc thang chéo, các receiver dùng chung nằm giữa các bậc (R5 nhận R1/R2, R7 nhận R1/R2, R8 nhận R2/R3/R6, R10 nhận R2/R3); 12 vòng + 7 thanh ngang/dọc, lockCount0, không Stop/Bom/Xích. Liên kết thêm: R1→R4, R7→R9, R10→R11, R12→R11, R3→R12, R6→R8; R1 cắm thanh pin S6, R3 và R12 cùng cắm thanh pin S7. Thanh: U trái S1 xuyên khe R7/R9, U phải S2 xuyên khe R6/R8 (lệch một hàng), U đáy S3 từ dưới xuyên khe R11/R12, hai chân bằng nhau, mỗi chân một Guide; S4 L từ trái vào khe R4, móc xuống chặn S6 trượt lên; S5 L từ trên vào khe R5; S6 thanh pin trái của nguồn R1, bị móc S4 chặn trên và chân trên U S1 chặn dưới; S7 thanh pin phải của R3/R12, bị chân dưới U S2 chặn trên. Ý tưởng cần nhận ra: bậc thang nguồn chia receiver theo cặp; mở dần từ một đầu bậc và quay lại receiver chung. Lời giải do GD tìm (quyết định người dùng16/10/2026), Codex không chạy solve/proof.';
const dp=path.join(LV,stem+'.rrdesign.json'),pp=path.join(LV,stem+'.rrpack.json');
fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(A.OUT,stem+'-geometry.json'),JSON.stringify(require('./turp-a042-author.js').check(d),null,2)+'\n',{flag:'wx'});
console.log(execFileSync('node',[CLI,'validate',dp]).toString());
execFileSync('node',[CLI,'pack',dp,'-o',pp,'--author','Codex / TURP','--no-solve']);
console.log(execFileSync('node',[CLI,'validate',pp]).toString());
execFileSync('node',[CLI,'render',dp,'-o',path.join(A.OUT,'r01.svg'),'--links']);
(async()=>{await sharp(path.join(A.OUT,'r01.svg')).png().toFile(path.join(A.OUT,'r01.png'));const a=await sharp(path.join(A.OUT,'source.png')).resize({height:800}).toBuffer(),b=await sharp(path.join(A.OUT,'r01.png')).resize({height:800}).toBuffer(),ma=await sharp(a).metadata(),mb=await sharp(b).metadata();await sharp({create:{width:ma.width+mb.width+20,height:800,channels:3,background:'#ffffff'}}).composite([{input:a,left:0,top:0},{input:b,left:ma.width+20,top:0}]).png().toFile(path.join(A.OUT,'r01-vs-source.png'));console.log(require('crypto').createHash('sha256').update(fs.readFileSync(pp)).digest('hex'));})();
