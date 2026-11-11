"use strict";
// A054 r01 export (generate-only; GD solves). New files only.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),A=require('./turp-a054-author.js');
const stem='turp-A054-10050-alternating-spine-stops-r01',LV=path.join(__dirname,'../levels'),CLI=path.join(__dirname,'../rr-cli.js'),sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const d=A.author('01');
for(const [id,c] of [['S1','red'],['S3','red'],['S6','orange']])d.sticks.find(x=>x.id===id).color=c;{const n=require('./turp-color-near.js')(d);if(n.near.length||n.sizeClash.length)throw Error(JSON.stringify(n));}
d.notes='Board A level54 (ref index (6).html: 20 vòng/18 pin/4 Stop, vòng kín6 và12, không thanh; nguồn khớp TURP 10050, lưới4×5). Bản mới dựng3 cột×6 hàng dọc, bỏ góc dưới trái và trên phải: 16 vòng + 6 thanh ngang/dọc + 2 Stop. Cột giữa xen kẽ nguồn kín R2/R4/R6 (radius2,15) và receiver R1/R3/R5; R3 nhận R2/R4, R5 nhận R4/R6. Liên kết: R2→R1/R3/R7/R13, R4→R3/R5/R9/R15, R6→R5/R11/R16, R7→R8, R9→R8/R10, R11→R10, R13→R12/R14, R15→R14/R16; R8/R10/R14/R16 nhận hai nguồn mở. Stop: R8 góc0 và R14 góc180 dài0,45, hướng về hai bên R3, chân trên cung vật liệu đối diện khe. Thanh: hai U trái chồng nhau S1 (R7/R8) và S2 (R9/R10), U phải S3 (R12/R13), hai chân bằng nhau, mỗi chân một Guide; S4 L từ dưới vào khe R1, chân lấp góc dưới trái; S5 L từ trên vào khe R11; S6 L từ phải vào khe R16, móc lên góc trên phải. lockCount0, không Bom/Xích. Ý tưởng cần nhận ra: trục giữa nguồn–receiver xen kẽ, mỗi receiver giữa hai nguồn; Stop hai bên hạn chế hướng quay của R8/R14 khi R3 còn. Lời giải do GD tìm (quyết định người dùng16/10/2026), Codex không chạy solve/proof.';
const dp=path.join(LV,stem+'.rrdesign.json'),pp=path.join(LV,stem+'.rrpack.json');
fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(A.OUT,stem+'-geometry.json'),JSON.stringify(require('./turp-a042-author.js').check(d),null,2)+'\n',{flag:'wx'});
console.log(execFileSync('node',[CLI,'validate',dp]).toString());
execFileSync('node',[CLI,'pack',dp,'-o',pp,'--author','Codex / TURP','--no-solve']);
console.log(execFileSync('node',[CLI,'validate',pp]).toString());
execFileSync('node',[CLI,'render',dp,'-o',path.join(A.OUT,'r01.svg'),'--links']);
(async()=>{await sharp(path.join(A.OUT,'r01.svg')).png().toFile(path.join(A.OUT,'r01.png'));const a=await sharp(path.join(A.OUT,'source.png')).resize({height:800}).toBuffer(),b=await sharp(path.join(A.OUT,'r01.png')).resize({height:800}).toBuffer(),ma=await sharp(a).metadata(),mb=await sharp(b).metadata();await sharp({create:{width:ma.width+mb.width+20,height:800,channels:3,background:'#ffffff'}}).composite([{input:a,left:0,top:0},{input:b,left:ma.width+20,top:0}]).png().toFile(path.join(A.OUT,'r01-vs-source.png'));console.log(require('crypto').createHash('sha256').update(fs.readFileSync(pp)).digest('hex'));})();
