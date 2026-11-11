"use strict";
// A060/BoardA60 (source10095 "cat face", graphOnly match): balanced manual remake. Generate-only; GD finds solutions.
const path=require('path'),T=require('./turp-src-remake.js'),r4=T.r4;
const OUT=path.join(__dirname,'20261017-turp-a060-01');
function author(log=[]){
 const d=T.load('./20261016-boardA-ref-51/sources/Level10095.rrdesign.json');d.name='Level 60';d.author='Codex / TURP';d.levelId='draft';
 for(const id of ['S8','S11']){T.removeStick(d,id);}log.push('bỏ ria giữa mỗi bên (S8, S11)');
 for(const id of ['S7','S9','S10','S12']){const s=T.stickOf(d,id),L=Math.max(...s.path.map(p=>Math.hypot(p[0],p[1])));const dx=(s.x<10.79?-.45:.45);s.x=r4(s.x+dx);s.path=[[r4(-L),0],[r4(L),0]];s.guides=[{x:r4(s.guides[0].x+dx),y:s.y,angle:0}];}
 log.push('duỗi bốn ria xiên thành ngang (thanh mới ngang/dọc)');
 T.ringOf(d,'R1').radius=1.85;log.push('thu nhỏ một mắt R1 radius1,85 (mắt lệch cỡ)');
 T.keepInnerPins(d,log);T.fitPins3(d);T.mirrorX(d,10.79);log.push('lật ngang');
 return d;
}
module.exports={author,OUT};
if(require.main===module){const {check}=require('./turp-a042-author'),{linkedColors}=require('./turp-a032-author'),N=require('./turp-color-near.js'),log=[],d=author(log);linkedColors(d);T.fixColors(d,N);const c=check(d);console.log(log.join('; '));console.log(JSON.stringify(c.analysis.warnings.map(w=>w.text)),JSON.stringify(c.strict),JSON.stringify(c.margins.filter(m=>m.margin<45)),c.guides.map(g=>g.engaged).join(),c.links.filter(l=>!l.active).length,JSON.stringify(N(d)));require('fs').writeFileSync(process.env.TEMP+'/claude/a060.rrdesign.json',JSON.stringify(d,null,1));}
