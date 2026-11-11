"use strict";
// A049 r01 export (generate-only; GD solves). New files only.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),A=require('./turp-a049-author.js');
const stem='turp-A049-10025-twin-towers-capped-pinbar-r01',LV=path.join(__dirname,'../levels'),CLI=path.join(__dirname,'../rr-cli.js'),sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const d=A.author('01');
{const n=require('./turp-color-near.js')(d);if(n.near.length||n.sizeClash.length)throw Error(JSON.stringify(n));}
d.notes='Remake10025: nguồn8 vòng (1 kín), 7 thanh, 2 Stop, thanh pin S1 dùng chung cho ba vòng ở góc trên. Bản mới dựng hai tháp vòng lệch nửa tầng hai bên một thanh pin dọc dài S1 ở giữa; hai nguồn kín R8 (dưới) và R9 (trên) radius2,15 kẹp hai đầu S1; 9 vòng + 6 thanh ngang/dọc + 1 Stop, lockCount0, không Bom/Xích. Liên kết: R8→R1/R4, R9→R3/R7, R1→R2, R3→R2, R4→R5, R7→R6; ba receiver R2/R5/R6 cùng cắm S1 ở ba độ cao. Thanh: S1 bị R8/R9 chặn hai đầu nên chưa trượt đủ để nhả pin nào khi hai nguồn còn; U trái S2 xuyên khe R1/R2; S3 L vào khe R3 từ trái; U phải S4 xuyên khe R6/R7; S5/S6 L vào khe R5/R4 từ phải. Stop R3 góc0 dài0,9 hướng về S1, chân trên cung vật liệu đối diện khe180. Ý tưởng cần nhận ra: phải mở các receiver đáy/đỉnh để tháo một nguồn kín, nhường chỗ cho thanh pin giữa trượt và nhả ba receiver theo thứ tự độ cao. Lời giải do GD tìm (quyết định người dùng16/10/2026), Codex không chạy solve/proof.';
const dp=path.join(LV,stem+'.rrdesign.json'),pp=path.join(LV,stem+'.rrpack.json');
fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(A.OUT,stem+'-geometry.json'),JSON.stringify(require('./turp-a042-author.js').check(d),null,2)+'\n',{flag:'wx'});
console.log(execFileSync('node',[CLI,'validate',dp]).toString());
execFileSync('node',[CLI,'pack',dp,'-o',pp,'--author','Codex / TURP','--no-solve']);
console.log(execFileSync('node',[CLI,'validate',pp]).toString());
execFileSync('node',[CLI,'render',dp,'-o',path.join(A.OUT,'r01.svg'),'--links']);
(async()=>{await sharp(path.join(A.OUT,'r01.svg')).png().toFile(path.join(A.OUT,'r01.png'));const a=await sharp(path.join(A.OUT,'source.png')).resize({height:800}).toBuffer(),b=await sharp(path.join(A.OUT,'r01.png')).resize({height:800}).toBuffer(),ma=await sharp(a).metadata(),mb=await sharp(b).metadata();await sharp({create:{width:ma.width+mb.width+20,height:800,channels:3,background:'#ffffff'}}).composite([{input:a,left:0,top:0},{input:b,left:ma.width+20,top:0}]).png().toFile(path.join(A.OUT,'r01-vs-source.png'));console.log(require('crypto').createHash('sha256').update(fs.readFileSync(pp)).digest('hex'));})();
