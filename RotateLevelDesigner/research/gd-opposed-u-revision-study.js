"use strict";
const fs=require("fs"),path=require("path"),h=require("./ongoing-study.js"),full=require("./gd-bomb-revisions-study.js").full;
const {RR,P,D,OUT,clone,ring,pin,design,build,inspect,replay}=h;
const x=1.1+D,base=-P-2.6;
const d=design("U hai pin — chốt ngắn nối đầu cung", "Revision V26: nguồn C dùng radius2.8354, tâm dưới A cách5.6708, khe hướng0; chốt315 dài1.2 nối thật đầu cung dưới bên phải. U arm8.0 thay8.8 để nhả pin trái trước chỗ bị chốt chặn. Hai pin ngược giữ hai nhánh, không ngàm thừa. Hạ U khoảng-0.9, quay A CCW dọn C/chốt rồi hạ tiếp. Chốt cản drag trực tiếp đầu; không khẳng định bước chuẩn bị là bắt buộc trên mọi gesture lặp. Radius khác1.75 có mục đích giảm chiều dài chốt và giữ anchor đúng; không radius0.8/Booster/Chain. Chưa GD nghiệm thu bố cục/độ khó.",[
 ring("A",-x,0,180,"orange",[pin(0,"U")]),
 ring("B",x,-P,0,"blue",[pin(180,"U")]),
 ring("C",-x,-5.6708,0,"purple",[pin(90,"A")],{radius:2.8354,stops:[{angle:315,length:1.2}]})
 ],[{id:"U",shape:"U",x:0,y:base,length:2.2,arm:8,angle:0,color:"green",slideAxis:[0,1]}]);
const partial=[{part:"U",target:-2}],gate=[...partial,{part:"A",target:270}],route=[...gate,{part:"U",target:-7}],noStop=clone(d),noLeft=clone(d),noRight=clone(d);delete noStop.rings[2].stops;noLeft.rings[0].pins=[];noRight.rings[1].pins=[];
function geometry(){const {sim:s,b}=full(d,[{part:"U",target:-7}]),st=s.world.stickOf(s.indexOf(b.ids.U)),c=s.world.rings[s.indexOf(b.ids.C)],pose=RR.W.stickPose(st),q=c.worldQuads.filter((q,i)=>c.quadKind[i]===RR.KIND.STOP);return {offset:st.offset,stopDepth:Math.max(0,...q.map(q=>-RR.M.chainMinSdfOverConvex(st.centerline,pose,q))),sourceBodyDepth:Math.max(0,st.centerline.tube+c.arc.tube-RR.M.chainDistanceToArc(st.centerline,pose,c.arc)),footSdf:q.map(q=>RR.M.minSdfArcOverConvex(c.arc,q))};}
const w={initial:full(d).evidence,partial:full(d,partial).evidence,afterGate:full(d,gate).evidence,correct:full(d,route).evidence,trace:replay(d,route),feel:replay(d,route,false,true),initialDown:full(d,[{part:"U",target:-7}]).evidence,initialUp:full(d,[{part:"U",target:7}]).evidence,withoutStop:full(noStop,[{part:"U",target:-7},{part:"A",target:270}]).evidence,withoutLeftPin:full(noLeft,[{part:"A",target:270}]).evidence,withoutRightPin:full(noRight,partial).evidence,wrongA:full(d,[...partial,{part:"A",target:0}]).evidence,undo:full(d,[...partial,{part:"U",target:0},{part:"A",target:270}]).evidence,geometry:geometry()};
{const v=clone(d);v.rings[2].pins=[];w.withoutIncomingSource=full(v,partial).evidence;}
{const v=clone(d);v.rings[0].pins[0].target="UL";v.rings[1].pins[0].target="UR";v.sticks=[{id:"UL",shape:"straight",x:-1.1,y:base+4,length:8,angle:90,color:"green"},{id:"UR",shape:"straight",x:1.1,y:base+4,length:8,angle:90,color:"green"}];w.splitFrame={analysis:RR.analyze(build(v).level),firstLeft:full(v,[{part:"UL",target:-.9}]).evidence};}
w.finiteStopLengths=[1.15,1.25].map(length=>{const v=clone(d);v.rings[2].stops[0].length=length;return {length,analysis:RR.analyze(build(v).level),result:full(v,route).evidence};});
const repeatFile=path.join(OUT,"v44-repeat-slide-check.json");if(fs.existsSync(repeatFile))w.repeatBypass=JSON.parse(fs.readFileSync(repeatFile));
d.notes+=" Kiểm kéo U lặp có đường đi qua chốt trước khi quay A; không dùng chốt này để nhận thứ tự bắt buộc hoặc độ khó. File cũ V26 được giữ nguyên.";
const c={stem:"study-20261014-v44-opposed-u-attached-stop",design:d,bombs:false,authorMoves:route,inspection:inspect(d,false,6,1000),witness:w,oldStem:"study-20261013-v26-opposed-pin-u",holdout:!(w.correct.solved&&w.trace.solved&&w.feel.solved)};
if(require.main===module){fs.writeFileSync(path.join(OUT,"gd-opposed-u-revision-study.json"),JSON.stringify({format:"rotate-gd-opposed-u-revision-study",version:1,candidates:[c]},null,2));console.log(JSON.stringify({inspection:c.inspection,holdout:c.holdout,witness:w}));}
module.exports={d,c,full};
