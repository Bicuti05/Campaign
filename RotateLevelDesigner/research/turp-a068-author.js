"use strict";
// A068/BoardA68 (source10060): balanced remake = pipeline (flip, reversals, shrink) + manual outline cuts. Generate-only.
const path=require('path'),T=require('./turp-src-remake.js'),B=require('./turp-balanced.js');
const OUT=path.join(__dirname,'20261017-turp-a068-01');
function author(){
 const st=B.remake('./20261016-boardA-ref-51/sources/Level10060.rrdesign.json',{kind:'flipY',seed:68});st.d.name='Level 68';st.d.author='Codex / TURP';
 B.step(st,'bỏ U góc S5 và L góc S8 (đổi viền trên)',d=>{T.removeStick(d,'S5');T.removeStick(d,'S8');});
 B.step(st,'bỏ vòng rìa R7',d=>{T.removeRing(d,'R7');});
 B.step(st,'bỏ thanh S6 cạnh vòng đã bỏ',d=>{T.removeStick(d,'S6');});
 return st;
}
module.exports={author,OUT};
if(require.main===module){const {check}=require('./turp-a042-author'),{linkedColors}=require('./turp-a032-author'),N=require('./turp-color-near.js'),st=author();linkedColors(st.d);T.fixColors(st.d,N);const c=check(st.d);console.log(st.log.join('; '));console.log(JSON.stringify(c.analysis.warnings.map(w=>w.text)),JSON.stringify(c.margins.filter(m=>m.margin<45)),c.links.filter(l=>!l.active).length,JSON.stringify(N(st.d)),JSON.stringify(c.analysis.info));require('fs').writeFileSync(process.env.TEMP+'/claude/a068.rrdesign.json',JSON.stringify(st.d,null,1));}
