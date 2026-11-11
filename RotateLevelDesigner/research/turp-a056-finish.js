"use strict";
// A056 r01 export (generate-only; GD solves). New files only.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),A=require('./turp-a056-author.js');
const stem='turp-A056-60006-stacked-flowers-r01',LV=path.join(__dirname,'../levels'),CLI=path.join(__dirname,'../rr-cli.js'),sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const d=A.author('01');
for(const [id,c] of [['S1','red'],['S4','orange']])d.sticks.find(x=>x.id===id).color=c;{const n=require('./turp-color-near.js')(d);if(n.near.length||n.sizeClash.length)throw Error(JSON.stringify(n));}
d.notes='Board A level56 (ref index (6).html: 17 vòng/28 pin, 4 thanh/4 ngàm, vòng kín9; nguồn khớp TURP 60006: hoa đối xứng4 phía quanh tâm kín, 4 thanh xiên chéo, vòng tự do lúc nạp). Bản mới dựng dọc hai "hoa" chồng nhau quanh hai hub kín R1 (dưới) và R2 (trên) radius2,15, dùng chung vòng giữa R3; bỏ góc dưới trái và trên phải để phá đối xứng; 13 vòng + 4 thanh ngang/dọc, không vật tự do, lockCount0, không Stop/Bom/Xích. Liên kết: R1→R3/R4/R6/R7, R2→R3/R5/R8/R9, R6→R10, R8→R10/R13, R7→R11/R12, R9→R11, R4→R12, R5→R13; R10/R11/R12/R13 nhận hai nguồn mở. Thanh: U trái S1 xuyên khe R6/R10, U phải S2 xuyên khe R11/R9 (lệch một hàng), hai chân bằng nhau, mỗi chân một Guide; S3 L từ dưới vào khe R4, chân lấp góc dưới trái; S4 L từ trên vào khe R5, móc sang góc trên phải. Ý tưởng cần nhận ra: hai hub chia vòng giữa R3; mỗi bên cột là chuỗi nhận hai nguồn. Lời giải do GD tìm (quyết định người dùng16/10/2026), Codex không chạy solve/proof.';
const dp=path.join(LV,stem+'.rrdesign.json'),pp=path.join(LV,stem+'.rrpack.json');
fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(A.OUT,stem+'-geometry.json'),JSON.stringify(require('./turp-a042-author.js').check(d),null,2)+'\n',{flag:'wx'});
console.log(execFileSync('node',[CLI,'validate',dp]).toString());
execFileSync('node',[CLI,'pack',dp,'-o',pp,'--author','Codex / TURP','--no-solve']);
console.log(execFileSync('node',[CLI,'validate',pp]).toString());
execFileSync('node',[CLI,'render',dp,'-o',path.join(A.OUT,'r01.svg'),'--links']);
(async()=>{await sharp(path.join(A.OUT,'r01.svg')).png().toFile(path.join(A.OUT,'r01.png'));const a=await sharp(path.join(A.OUT,'source.png')).resize({height:800}).toBuffer(),b=await sharp(path.join(A.OUT,'r01.png')).resize({height:800}).toBuffer(),ma=await sharp(a).metadata(),mb=await sharp(b).metadata();await sharp({create:{width:ma.width+mb.width+20,height:800,channels:3,background:'#ffffff'}}).composite([{input:a,left:0,top:0},{input:b,left:ma.width+20,top:0}]).png().toFile(path.join(A.OUT,'r01-vs-source.png'));console.log(require('crypto').createHash('sha256').update(fs.readFileSync(pp)).digest('hex'));})();
