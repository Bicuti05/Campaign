"use strict";
// A066/BoardA66 (source10029: concentric closed rings with 2 Bom): balanced manual remake. Generate-only; GD finds solutions.
const path=require('path'),T=require('./turp-src-remake.js'),B=require('./turp-balanced.js');
const OUT=path.join(__dirname,'20261017-turp-a066-01');
function author(){
 const st={d:T.load('./20261016-boardA-ref-51/sources/Level10029.rrdesign.json'),log:[]};st.d.name='Level 66';st.d.author='Codex / TURP';st.d.levelId='draft';
 T.keepInnerPins(st.d,st.log);T.fitPins3(st.d);
 B.step(st,'lật dọc (tháp vòng đồng tâm xuống dưới, cụm nguồn R5 lên trên)',d=>T.mirrorY(d,-12));
 B.step(st,'bỏ vòng rìa R7 và hai thanh trái S4/S5',d=>{T.removeRing(d,'R7');T.removeStick(d,'S4');T.removeStick(d,'S5');});
 B.step(st,'thêm L S9 vào khe R6 từ ngoài',d=>{const r=T.ringOf(d,'R6');r.gapDir=90;const gy=r.y+r.radius+.85;d.sticks.push({id:'S9',x:r.x,y:T.r4(gy),angle:0,path:[[0,T.r4(-(r.radius+.85))],[0,1.15],[1.6,1.15]],slideAxis:[0,1],guides:[{x:r.x,y:T.r4(gy),angle:90}]});});
 T.fixGaps(st.d);return st;
}
module.exports={author,OUT};
if(require.main===module){const {check}=require('./turp-a042-author'),{linkedColors}=require('./turp-a032-author'),N=require('./turp-color-near.js'),st=author();linkedColors(st.d);T.fixColors(st.d,N);const c=check(st.d);console.log(st.log.join('; '));console.log(JSON.stringify(c.analysis.warnings.map(w=>w.text)),JSON.stringify(c.strict),JSON.stringify(c.margins.filter(m=>m.margin<45)),c.guides.map(g=>g.engaged).join(),c.links.filter(l=>!l.active).length,JSON.stringify(N(st.d)));require('fs').writeFileSync(process.env.TEMP+'/claude/a066.rrdesign.json',JSON.stringify(st.d,null,1));}
