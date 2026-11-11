"use strict";
// A051 r01 export (generate-only; GD solves). New files only.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),A=require('./turp-a051-author.js');
const stem='turp-A051-71033-rotated-bomb-maze-U-r01',LV=path.join(__dirname,'../levels'),CLI=path.join(__dirname,'../rr-cli.js'),sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const d=A.author('01');
d.name='Level 51';{const n=require('./turp-color-near.js')(d);if(n.near.length||n.sizeClash.length)throw Error(JSON.stringify(n));}
d.notes='Board A level51 (ref index (6).html, nguồn khớp TURP match_boardA: 71033, 13 thanh/16 ngàm/1 Bom, không vòng). Bản mới: xoay180° (bội90°), bỏ hai thanh rìa S7/S13 vốn trượt ra tự do lúc nạp, thêm U mới S13 ở góc dưới trái mở sang phải có chân dưới chạy dưới chân trái U S6 (chặn S6 trượt xuống khi Guide của S10 đã đi), U rút sang trái; hạ S6 0,1 để bỏ chồng0,026 với vách Guide S10 có sẵn ở nguồn; đổi màu theo palette. 12 thanh/15 Guide/1 Bom trên thanh Z S1 (giữ vị trí tương đối như nguồn), không vòng/Stop/Xích. Strict OVL còn ba chỗ đầu thanh sát nhau thừa kế nguồn (S2–S8, S3–S11, S9–S10), không sâu hơn nguồn. Hai chân U S13 dài khác nhau có mục đích (chân dưới phải với tới dưới S6). Ý tưởng: mê cung thanh khóa nhau, Bom trên thanh Z có thể dùng để phá thanh bị kẹt; GD tìm lời giải và ghi rõ có cần Bom nổ không (quyết định người dùng16/10/2026: Codex không chạy solve/proof). Workbench nhanh với Bom trơ không tìm được đường trong3000 bước cho cả nguồn, nên nhiều khả năng cần Bom.';
const dp=path.join(LV,stem+'.rrdesign.json'),pp=path.join(LV,stem+'.rrpack.json');
fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(A.OUT,stem+'-geometry.json'),JSON.stringify(require('./turp-a042-author.js').check(d),null,2)+'\n',{flag:'wx'});
console.log(execFileSync('node',[CLI,'validate',dp]).toString());
execFileSync('node',[CLI,'pack',dp,'-o',pp,'--author','Codex / TURP','--no-solve']);
console.log(execFileSync('node',[CLI,'validate',pp]).toString());
execFileSync('node',[CLI,'render',dp,'-o',path.join(A.OUT,'r01.svg'),'--links']);
(async()=>{await sharp(path.join(A.OUT,'r01.svg')).png().toFile(path.join(A.OUT,'r01.png'));const a=await sharp(path.join(A.OUT,'source.png')).resize({height:800}).toBuffer(),b=await sharp(path.join(A.OUT,'r01.png')).resize({height:800}).toBuffer(),ma=await sharp(a).metadata(),mb=await sharp(b).metadata();await sharp({create:{width:ma.width+mb.width+20,height:800,channels:3,background:'#ffffff'}}).composite([{input:a,left:0,top:0},{input:b,left:ma.width+20,top:0}]).png().toFile(path.join(A.OUT,'r01-vs-source.png'));console.log(require('crypto').createHash('sha256').update(fs.readFileSync(pp)).digest('hex'));})();
