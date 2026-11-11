"use strict";
const fs=require("fs"),h=require("./dual-common-gates-composition.js"),{OUT,clone,checks}=h;
const design=clone(h.design);design.rings[0].gapDir+=.1;design.rings[1].gapDir-=.1;design.name="DCG-04 | Hai cửa cùng nguồn, mở lệch rồi quay lại";design.notes=h.design.notes+" Revision04 tăng khoảng cách khe owner A/B thêm0,1° ở hai phía, giữ nguyên pin/center/radius/recipe, để margin>=45° thật sau writer f32. Bản03 CLI validate/solve qua nhưng pack margin A→T44,999997° không đạt; giữ research, không nới engine/tolerance hoặc ghi đè mẫu.";
const candidate={...h.candidate,design,stem:"study-20261014-dual-common-gates-04"};
function verify(input){return h.verify(input);}
if(require.main===module){const result=verify(checks.serialized(design));fs.writeFileSync(OUT+"/candidate-04.rrdesign.json",JSON.stringify(design,null,2),{flag:"wx"});fs.writeFileSync(OUT+"/composition-proof-04.json",JSON.stringify({candidate,...result},null,2),{flag:"wx"});console.log(JSON.stringify({ok:result.ok,g:result.geometry.ok,main:result.proof.release.ok,cross:result.crossProof.release.ok,roles:result.roles.ok,margins:result.geometry.pinMargins}));}
module.exports={...h,design,candidate,verify};
