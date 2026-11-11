"use strict";
// A055 r01 export (generate-only; GD solves). New files only.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),A=require('./turp-a055-author.js');
const stem='turp-A055-70013-caged-bomb-ring-r01',LV=path.join(__dirname,'../levels'),CLI=path.join(__dirname,'../rr-cli.js'),sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const d=A.author('01');
d.sticks.find(x=>x.id==='S4').color='red';{const n=require('./turp-color-near.js')(d);if(n.near.length||n.sizeClash.length)throw Error(JSON.stringify(n));}
d.notes='Board A level55 (ref index (6).html: 13 vòng/14 pin, 5 thanh/5 ngàm, 1 Bom, vòng kín5/7/11; nguồn khớp TURP 70013: dáng tam giác, Bom gắn trên vòng kín nhận pin, có vòng tự do lúc nạp). Bản mới dựng thẳng lưới3 cột×5 hàng: 13 vòng (3 kín) + 5 thanh ngang/dọc + 1 Bom, không vật tự do, lockCount0, không Stop/Xích. Vòng kín R1 (radius1,75, vai trò khác nguồn) ở tâm mang Bom ở góc45°, nhận pin từ bốn phía R4/R5/R6/R7 nên không thể tự tháo — **level chỉ giải được khi Bom nổ** (theo luật Designer: vòng kín không có khe để nhả pin). Quay R1 ngược chiều ~45° Bom chạm pin R6, xuôi chiều ~45° chạm pin R5: người chơi chọn vật hy sinh cùng R1. Hai nguồn kín R2 (đỉnh) và R3 (đáy) radius2,15: R2→R10/R11/R6/R9, R3→R12/R13/R7/R8; R4→R8, R5→R9. Thanh: U trái S1 xuyên khe R8/R4, U phải S2 xuyên khe R5/R9 (lệch một hàng), hai chân bằng nhau, mỗi chân một Guide; S3 L từ trên vào khe R10; S4 L từ trái vào khe R12; S5 L từ dưới vào khe R13. Lời giải do GD tìm (quyết định người dùng16/10/2026), Codex không chạy solve/proof; GD xác nhận lựa chọn hướng nổ.';
const dp=path.join(LV,stem+'.rrdesign.json'),pp=path.join(LV,stem+'.rrpack.json');
fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(A.OUT,stem+'-geometry.json'),JSON.stringify(require('./turp-a042-author.js').check(d),null,2)+'\n',{flag:'wx'});
console.log(execFileSync('node',[CLI,'validate',dp]).toString());
execFileSync('node',[CLI,'pack',dp,'-o',pp,'--author','Codex / TURP','--no-solve']);
console.log(execFileSync('node',[CLI,'validate',pp]).toString());
execFileSync('node',[CLI,'render',dp,'-o',path.join(A.OUT,'r01.svg'),'--links']);
(async()=>{await sharp(path.join(A.OUT,'r01.svg')).png().toFile(path.join(A.OUT,'r01.png'));const a=await sharp(path.join(A.OUT,'source.png')).resize({height:800}).toBuffer(),b=await sharp(path.join(A.OUT,'r01.png')).resize({height:800}).toBuffer(),ma=await sharp(a).metadata(),mb=await sharp(b).metadata();await sharp({create:{width:ma.width+mb.width+20,height:800,channels:3,background:'#ffffff'}}).composite([{input:a,left:0,top:0},{input:b,left:ma.width+20,top:0}]).png().toFile(path.join(A.OUT,'r01-vs-source.png'));console.log(require('crypto').createHash('sha256').update(fs.readFileSync(pp)).digest('hex'));})();
