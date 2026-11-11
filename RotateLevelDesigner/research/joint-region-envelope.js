"use strict";
// Finite mechanical samples; never publish parameter variants as extra levels.
const fs=require("fs"),path=require("path"),H=require("./ongoing-study.js");
const {RR,OUT,clone,build,inspect,probe,replay}=H;
const source=g=>JSON.parse(fs.readFileSync(path.join(OUT,g+".json"))).candidates[0],a=source("inside-outside-study"),b=source("two-guide-wall-study"),rows=[];
function checkRoles(d,kind){
 const level=build(d),analysis=RR.analyze(level.level),s=RR.Solver.newSim(level.level,false),fail=[];
 if(analysis.error||analysis.warnings.length)return {analysis,roleFailures:["initial geometry"],qualified:false};
 if(s.world.guides.some((g,i)=>!s.world.guideEngaged(i)))fail.push("initial guide contact");
 let checks;
 if(kind==="shared-bar"){
  const p=[{part:"S",target:3.6}],l=[...p,{part:"T",target:0}],ng=clone(d);delete ng.sticks[0].guides;
  checks={initialBar:[-1,1].map(x=>probe(d,"S",x)),initialOuter:[-1,1].map(x=>probe(d,"O",x)),initialLower:[-1,1].map(x=>probe(d,"T",x)),partialOuter:[-1,1].map(x=>probe(d,"O",x,p)),partialLower:[-1,1].map(x=>probe(d,"T",x,p)),afterLowerBar:[-1,1].map(x=>probe(d,"S",x,l)),withoutGuide:replay(ng,p),feel:replay(d,a.authorMoves,false,true)};
  if(checks.initialBar.some(x=>x.removed))fail.push("bar can escape before lower preparation");
  if(checks.initialOuter.some(x=>x.removed)||checks.initialLower.some(x=>x.removed))fail.push("initial ring gate missing");
  if(checks.partialOuter.some(x=>x.removed))fail.push("outer ring releases before shared bar is cleared");
  if(checks.partialLower.some(x=>!x.removed))fail.push("fixed preparation does not open lower ring");
  if(!checks.afterLowerBar[0].removed||checks.afterLowerBar[1].removed)fail.push("return direction changed");
  if(checks.withoutGuide.trace[0].remaining!==4)fail.push("guide ablation does not create preparation shortcut");
  checks.fixedAuthoredRoutePass=checks.feel.solved;
 }else{
  const nl=clone(d);nl.sticks[0].guides.shift();const nr=clone(d);nr.sticks[0].guides.pop();
  checks={initialH:[-1,1].map(x=>probe(d,"H",x)),withoutLeft:[-1,1].map(x=>probe(nl,"H",x)),withoutRight:[-1,1].map(x=>probe(nr,"H",x)),feel:replay(d,b.authorMoves,false,true)};
  if(checks.initialH.some(x=>x.removed))fail.push("one initial bar door is already open");
  if(!checks.withoutLeft[0].removed||checks.withoutLeft[1].removed||checks.withoutRight[0].removed||!checks.withoutRight[1].removed)fail.push("guides no longer select distinct doors");
  RR.Solver.apply(s,{obj:s.indexOf(level.ids.U),target:-.2});checks.partial={remaining:s.remaining(),bindingActive:s.graph.bindingActive.slice()};
  if(checks.partial.remaining!==2||!checks.partial.bindingActive[0]||checks.partial.bindingActive[1])fail.push("two-stage binding state is lost");
  checks.fixedAuthoredRoutePass=checks.feel.solved;
 }
 const solution=fail.length?null:inspect(d,false,2,400).solution;
 if(!fail.length&&!solution?.found)fail.push("bounded finder has no route");
 if(solution?.found){checks.finderFeel=replay(d,solution.route.map(m=>({part:m.part,target:m.to})),false,true);if(!checks.finderFeel.solved&&!checks.fixedAuthoredRoutePass)fail.push("neither authored nor raw finder route passes default feel");}
 return {analysis,checks,solution,roleFailures:fail,qualified:!fail.length,exactAuthoredRouteQualified:!fail.length&&checks.fixedAuthoredRoutePass};
}
for(const lowerY of [-6.5,-6.7,-6.9])for(const length of [6,6.2,6.4]){
 const d=clone(a.design);d.rings.filter(r=>["T","B"].includes(r.id)).forEach(r=>r.y=lowerY);d.sticks[0].length=length;
 rows.push({family:"shared-bar",parameters:{lowerY,length},...checkRoles(d,"shared-bar")});
}
for(const leftGuideY of [3.1,3.3,3.5])for(const horizontalY of [3.6,3.7,3.8]){
 const d=clone(b.design);d.sticks[0].guides[0].y=leftGuideY;d.sticks[1].y=horizontalY;d.sticks[1].guides[0].y=horizontalY;
 rows.push({family:"two-guide-walls",parameters:{leftGuideY,horizontalY},...checkRoles(d,"two-guide-walls")});
}
fs.writeFileSync(path.join(OUT,"joint-region-envelope.json"),JSON.stringify({format:"rotate-joint-region-envelope",version:1,scope:"18 finite local parameter samples of V19/V20, not extra exports, a global robustness estimate or a visual/difficulty score",rows},null,2));
for(const r of rows)console.log(r.qualified?"ROLE OK":"ROLE LOST",r.family,JSON.stringify(r.parameters),r.roleFailures.join("; "));
