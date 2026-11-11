"use strict";
// A041 r04: export new design/pack only (no solve per user decision 16/10/2026: GD finds solutions).
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),A=require('./turp-a041-r04-author.js'),B=require('./turp-a041-r04-bench.js'),{linkedColors}=require('./turp-a032-author'),{api}=require('./turp-continue');
const stem='turp-A041-10111-shared-U-return-r04',LV=path.join(__dirname,'../levels'),CLI=path.join(__dirname,'../rr-cli.js');
const d=A.author('05');d.name='Level 41';
d.notes='Remake10111 (chỉ thanh/ngàm, không ring/pin/Stop/Bom/Xích, lockCount0). Nguồn23 thanh dạng lược đan; bản mới15 thanh dựng quanh U cam S1 mở trái, hai tay bằng nhau, mỗi tay một Guide (trên x1,8 trên cột ngắn S6, dưới x−0,6 dưới cột S4) nên Guide cũng ép hướng thoát của cột. Sáu cột S2–S7 nằm trong U. Ý tưởng cần nhận ra: U chỉ trượt phải được một đoạn tới khi chạm thanh đứng S11 bên phải, đủ thả hai cột trái; S2 bị thanh ngang S14 dưới đáy chặn, phải đẩy S14 sang phải để thanh đứng S13 tụt xuống, rồi rút S14 trái. Hết hai cột trái thì thanh S8 mới vào được lòng U và thoát, nhả móc của S9; S9 nhả thanh trên S10; S10 nhả S11; quay lại rút hết U, rồi S12 và thanh đáy S15 (S15 trượt phải một đoạn tới S11 trước đó) thả các cột còn lại; S13 quay lên thoát sau cùng. Lời giải do GD tìm theo quyết định người dùng16/10/2026; Codex không chạy solve/proof cho bản này, ý tưởng trên chỉ là hướng thiết kế, chưa kiểm chứng. Bố cục dọc, thanh ngang/dọc, palette campaign.';
linkedColors(d);
const dp=path.join(LV,stem+'.rrdesign.json'),pp=path.join(LV,stem+'.rrpack.json');
for(const f of [dp,pp])if(fs.existsSync(f))throw Error('exists '+f);
fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
const geo={analysis:B.RR.analyze(B.level(d).level),strict:api.OVL.check(d)};
fs.writeFileSync(path.join(B.OUT,stem+'-geometry.json'),JSON.stringify(geo,null,2)+'\n',{flag:'wx'});
console.log(execFileSync('node',[CLI,'validate',dp]).toString());
execFileSync('node',[CLI,'pack',dp,'-o',pp,'--author','Codex / TURP','--no-solve']);
console.log(execFileSync('node',[CLI,'validate',pp]).toString());
(async()=>{await B.png(d,path.join(B.OUT,'r04.png'));console.log(JSON.stringify(geo),d.sticks.map(s=>s.id+':'+s.color).join(' '));})();
