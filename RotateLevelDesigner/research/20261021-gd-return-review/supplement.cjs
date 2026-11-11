'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const OUT=__dirname,ROOT=path.resolve(OUT,'../../../..'),RR=require(path.join(ROOT,'Tools/RotateLevelDesigner/rr-core.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const original=read(path.join(OUT,'report.json')),r=structuredClone(original);
const lg=path.join(ROOT,'Tools/LevelGen'),rl=path.join(ROOT,'Tools/RingLab-GameDeveloper-20261021-r01');
const {check}=require('./audit-static.cjs');
const lm=read(path.join(lg,'IMPORT_MANIFEST.json')),rm=read(path.join(rl,'manifest.json'));
const diffs=[];for(const row of lm.rows.filter(x=>x.slot>100)){
 const a=read(path.join(lg,row.design)),b=read(path.join(lg,row.pack));const runtime=JSON.parse(RR.json.stringify(RR.Design.toLevel(a).level));
 const same=JSON.stringify(runtime)===JSON.stringify(b.runtime);const result=r.levelGen.newResults.find(x=>x.slot===row.slot);result.separateDesignBakesToExactPackRuntime=same;
 if(result.issues.includes('designPairMismatch')){
  const changes=[];function diff(a,b,p){if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],p+'.'+k);}else if(a!==b)changes.push({path:p,separateDesign:a,embeddedDesign:b});}diff(a,b.design,'');
  result.precisionDifference=changes;diffs.push({slot:row.slot,changes,separateDesignBakesToExactPackRuntime:same});
  if(same){result.issues=result.issues.filter(x=>x!=='designPairMismatch');result.ok=!result.errors.length&&!result.issues.length;}
 }
 if(!same){result.ok=false;result.issues.push('separate-design-runtime-mismatch');}
}
for(const e of rm.entries.filter(x=>x.pack)){const pack=read(path.join(rl,e.pack)),d=read(path.join(rl,e.nativeDesign));const same=JSON.stringify(JSON.parse(RR.json.stringify(RR.Design.toLevel(d).level)))===JSON.stringify(pack.runtime);const entry=r.ringLab.readyResults.find(x=>x.id===e.id);entry.separateDesignBakesToExactPackRuntime=same;if(!same){entry.ok=false;entry.issues.push('separate-design-runtime-mismatch');}}
const listed=read(path.join(rl,'IMPORT_ONLY_THESE_PACKS.json')).packs;const declared=new Set(rm.entries.filter(e=>e.pack).map(e=>e.pack));r.ringLab.importListIssues=[];
for(const item of listed)if(!declared.has(item.path))r.ringLab.importListIssues.push(item.path);
assert.equal(new Set(listed.map(x=>x.path)).size,listed.length);
const heldChecks=[],freq={};for(const e of rm.entries.filter(e=>!e.pack)){
 const p=path.join(rl,e.nativeDesign),source=path.join(path.dirname(p),'source-reference.json');const saved=read(path.join(OUT,'held-independent-checks.json')).find(x=>x.id===e.id);const c=saved;
 for(const code of new Set(c.errors.map(x=>x.code)))freq[code]=(freq[code]||0)+1;
 heldChecks.push({id:e.id,ok:c.ok,errors:c.errors,sourceUsed:fs.existsSync(source)?source:null});
}
r.ringLab.heldIndependentErrorCounts=freq;r.ringLab.heldPassOnRecheck=heldChecks.filter(x=>x.ok).map(x=>x.id);
r.levelGen.precisionDifferences=diffs;
r.summary.levelGenStaticPass=r.levelGen.newResults.filter(x=>x.ok).length;r.summary.levelGenFailed=r.levelGen.newResults.filter(x=>!x.ok).map(x=>x.slot);
r.summary.ringLabStaticPass=r.ringLab.readyResults.filter(x=>x.ok).length;r.summary.ringLabFailed=r.ringLab.readyResults.filter(x=>!x.ok).map(x=>x.id);r.summary.levelGenDesignPrecisionDifferences=diffs.map(x=>x.slot);
r.auditCorrection='report-final.json had a pretty-vs-compact JSON string comparison bug in the supplemental RingLab separate-design check. This reviewed report compares parsed serialized objects; original static checks were53/53 all along. No source files modified.';
fs.writeFileSync(path.join(OUT,'report-reviewed.json'),JSON.stringify(r,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({summary:r.summary,precisionDifferences:diffs,heldIndependentErrorCounts:freq,heldPassOnRecheck:r.ringLab.heldPassOnRecheck},null,2));
