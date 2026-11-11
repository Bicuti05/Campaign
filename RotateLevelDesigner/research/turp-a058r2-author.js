"use strict";
// A058 r02: 60002 with stronger edits (user feedback 16/10/2026 "giống nguồn quá, hãy sáng tạo thêm"). Generate-only.
const path=require('path'),T=require('./turp-src-remake.js');
const OUT=path.join(__dirname,'20261016-turp-a058-01');
function author(){
 const d=T.load('./20261016-boardA-ref-51/sources/Level60002.rrdesign.json');d.name='Level 58';d.author='Codex / TURP';
 T.removeRing(d,'R18');T.removeRing(d,'R19');T.removeRing(d,'R5');        // cut both tips and the left-middle ring: hexagon becomes a barrel
 for(const [a,b] of [['R11','R4'],['R13','R12'],['R10','R6']]){T.dropPin(d,a,b);T.setPin(d,b,a);}  // reverse three links
 T.ringOf(d,'R1').radius=2.1;for(const id of ['R10','R11'])T.ringOf(d,id).radius=1.5; // hub bigger, middle top/bottom receivers smaller
 T.fitPins2(d);T.fixGaps(d);
 // Left: shared vertical pinbar where R5 was, pinned sideways by inner rings R3/R4 and capped above/below by the closed corners R2/R9.
 const r3=T.ringOf(d,'R3');T.pinBar(d,'R3','S1',180,r3.x-2);T.pinBar(d,'R4','S1',180,T.ringOf(d,'R4').x-2);
 d.sticks.push({id:'S1',x:2,y:-13.25,angle:0,path:[[0,-3.65],[0,3.65]],slideAxis:[0,1]});
 // Top: vertical pinbar between R14 and R15 where R18 was, held by R14 (R15 keeps its source link from R8).
 const r14=T.ringOf(d,'R14'),r15=T.ringOf(d,'R15'),bx=(r14.x+r15.x)/2;T.pinBar(d,'R14','S2',0,bx-r14.x);
 d.sticks.push({id:'S2',x:bx,y:-2.5,angle:0,path:[[0,-2.7],[0,2.7]],slideAxis:[0,1]});
 T.fixGaps(d);T.mirrorX(d,9.1);                                            // flip left/right
 return d;
}
module.exports={author,OUT};
if(require.main===module){const {check}=require('./turp-a042-author'),{linkedColors}=require('./turp-a032-author'),d=author();linkedColors(d);const c=check(d);console.log(JSON.stringify(c.analysis.warnings.map(w=>w.text)),JSON.stringify(c.strict),JSON.stringify(c.margins.filter(m=>m.margin<45)),c.guides.map(g=>g.engaged).join(),c.links.filter(l=>!l.active).length,JSON.stringify(require('./turp-color-near.js')(d)));require('fs').writeFileSync(process.env.TEMP+'/claude/a058b.rrdesign.json',JSON.stringify(d,null,1));}
