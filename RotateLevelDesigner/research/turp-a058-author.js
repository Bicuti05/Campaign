"use strict";
// A058/BoardA58: source-weighted remake of 60002 (generate-only; GD finds solutions).
const path=require('path'),T=require('./turp-src-remake.js');
const OUT=path.join(__dirname,'20261016-turp-a058-01');
function author(){
 const d=T.load('./20261016-boardA-ref-51/sources/Level60002.rrdesign.json');d.name='Level 58';d.author='Codex / TURP';
 T.removeRing(d,'R18');T.removeRing(d,'R17');                 // drop the top ring and one lower edge ring
 T.dropPin(d,'R10','R6');T.setPin(d,'R6','R10');               // reverse one link (G5)
 T.ringOf(d,'R1').radius=2.1;                                  // centre closed hub clearly bigger
 // New straight bar from above into R10's top gap, standing between R14/R15 where R18 was.
 const r10=T.ringOf(d,'R10');d.sticks.push({id:'S1',x:r10.x,y:r10.y+2.6,angle:0,path:[[0,-2.6],[0,3.2]],slideAxis:[0,1],guides:[{x:r10.x,y:r10.y+2.6,angle:90}]});
 T.fitPins2(d);T.fixGaps(d);
 T.mirrorY(d,-13.2);                                           // flip up/down
 return d;
}
module.exports={author,OUT};
if(require.main===module){const {check}=require('./turp-a042-author'),{linkedColors}=require('./turp-a032-author'),d=author();linkedColors(d);const c=check(d);console.log(JSON.stringify(c.analysis.warnings.map(w=>w.text)),JSON.stringify(c.strict),JSON.stringify(c.margins.filter(m=>m.margin<45)),c.guides.map(g=>g.engaged).join(),c.links.filter(l=>!l.active).length,JSON.stringify(require('./turp-color-near.js')(d)));require('fs').writeFileSync(process.env.TEMP+'/claude/a058.rrdesign.json',JSON.stringify(d,null,1));}
