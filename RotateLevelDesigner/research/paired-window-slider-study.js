"use strict";
// Authoring experiment: a default L couples one retained source to the lower common receiving window.
const fs=require("fs"),path=require("path"),h=require("./dual-common-gates-delivery.js"),{RR,clone,move,checks,query,release,P,D,Y,ALPHA}=h;
const OUT=path.join(__dirname,"20261014-paired-window-slider"),E=RR.C.authoring.STICK_DEFAULT_LENGTH/2;
const design=clone(h.design);design.name="PWS-01 research | Thanh L và hai cửa chung";
design.notes="Nghiên cứu mới ghép thanh L mặc định với hai cửa nhận chung T/R: A giữ L bằng pin270; ngàm ngang trên base giữ L sau pin nhả, nhánh xuống gần R để R thay đường kéo. Bố cục và hai cửa từ DCG là nền đối chiếu, không bàn giao lại DCG hoặc coi thêm thanh là khó. Radius1,75/size thanh default; không Bom/Stop/Chain/Booster. Chỉ research cho tới khi geometry, role từng đoạn và lượt quay lại được kiểm.";
design.rings.find(r=>r.id==="A").pins.push({angle:270,target:"L"});
const armX=-2.35,baseY=-D;
design.sticks=[{id:"L",shape:"L",x:armX-E,y:baseY,angle:0,color:"red",slideAxis:[1,0],guides:[{x:-6.5,y:baseY,angle:0}]}];
const phases={left:[move("L",-4)],right:[move("L",4)],shallowLeft:[move("L",-.3)],shallowRight:[move("L",.3)],RLeftThenRight:[move("R",180),move("L",4)]};
function study(){fs.mkdirSync(OUT,{recursive:true});const input=checks.serialized(design),geometry=checks.geometry(input),data=Object.fromEntries(Object.entries(phases).map(([key,moves])=>[key,{moves,data:query(input,moves).data}]));fs.writeFileSync(OUT+"/candidate-01.rrdesign.json",JSON.stringify(design,null,2),{flag:"wx"});fs.writeFileSync(OUT+"/initial-study-01.json",JSON.stringify({design,geometry,data},null,2),{flag:"wx"});console.log(JSON.stringify({geometry,data}));}
if(require.main===module)study();module.exports={...h,OUT,E,design,phases,armX,baseY};
