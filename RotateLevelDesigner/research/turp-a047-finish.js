"use strict";
// A047 r01 export (generate-only; GD solves). New files only.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),A=require('./turp-a047-author.js');
const stem='turp-A047-10054-ring-base-bar-maze-r01',LV=path.join(__dirname,'../levels'),CLI=path.join(__dirname,'../rr-cli.js'),sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const d=A.author('01');
{const n=require('./turp-color-near.js')(d);if(n.near.length||n.sizeClash.length)throw Error(JSON.stringify(n));}
d.notes='Remake10054: nguồn lai gồm cụm11 vòng (1 kín) phía trên và mê cung13 thanh phía dưới, 1 Stop. Bản mới lật vai trò: cụm8 vòng thẳng lưới ở dưới, mê cung10 thanh ngang/dọc ở trên, nối chéo hai vùng thay vì hai cụm độc lập. Nguồn kín R2 radius2,15 giữa hàng trên, vòng mở1,75, lockCount0, không Stop/Bom/Xích. Liên kết: R2→R1/R3/R5 và thanh pin S3; R5→R4/R6; R4→R7; R6→R8; R1/R3 cắm hai thanh pin dài S5/S6. Thanh: S1/S2 là L từ mê cung cắm xuống khe trên R1/R3 (thoát lên) và móc của chúng nằm dưới nắp S4; S3 thanh pin của R2 bị kẹt giữa chân/Guide S1/S2; S4 nắp ngang chạm hai thanh pin S5/S6 khi trượt; S5/S6 thanh pin dài giữ R1/R3, trượt lên nhả sớm nhưng bị sống U S7 chặn, trượt xuống phải đi xa; S7 U mở xuống trượt ngang trên Guide sống, hai chân bằng nhau ôm ngoài S5/S6; S8/S9/S10 L vào khe R4/R5/R6. Ý tưởng cần nhận ra: mở nguồn kín R2 đòi rút một chân L, chân L đòi bỏ nắp, nắp đòi bỏ một thanh pin bên, thanh pin bên phụ thuộc U trên hoặc đường xuống dài. Lời giải do GD tìm (quyết định người dùng16/10/2026), Codex không chạy solve/proof.';
const dp=path.join(LV,stem+'.rrdesign.json'),pp=path.join(LV,stem+'.rrpack.json');
fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(A.OUT,stem+'-geometry.json'),JSON.stringify(require('./turp-a042-author.js').check(d),null,2)+'\n',{flag:'wx'});
console.log(execFileSync('node',[CLI,'validate',dp]).toString());
execFileSync('node',[CLI,'pack',dp,'-o',pp,'--author','Codex / TURP','--no-solve']);
console.log(execFileSync('node',[CLI,'validate',pp]).toString());
execFileSync('node',[CLI,'render',dp,'-o',path.join(A.OUT,'r01.svg'),'--links']);
(async()=>{await sharp(path.join(A.OUT,'r01.svg')).png().toFile(path.join(A.OUT,'r01.png'));const a=await sharp(path.join(A.OUT,'source.png')).resize({height:800}).toBuffer(),b=await sharp(path.join(A.OUT,'r01.png')).resize({height:800}).toBuffer(),ma=await sharp(a).metadata(),mb=await sharp(b).metadata();await sharp({create:{width:ma.width+mb.width+20,height:800,channels:3,background:'#ffffff'}}).composite([{input:a,left:0,top:0},{input:b,left:ma.width+20,top:0}]).png().toFile(path.join(A.OUT,'r01-vs-source.png'));console.log(require('crypto').createHash('sha256').update(fs.readFileSync(pp)).digest('hex'));})();
