"use strict";
// Authored graph + actual wall-edge geometry only; no claim of live contact or solvability.
const fs=require("fs"),path=require("path"),source=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../../../LevelTrainingData/ring-lab/data/original_levels.json"))),out=path.join(__dirname,"20261013");
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],hist={},rows=[],axisRows=[];let guides=0,incomingPinLinks=0,duplicateGuideReferences=0,missingGuideParts=0;
function wallAxis(level,id){
 const walls=level.colliders.filter(c=>c.owner===id&&Number(c.trigger)===0&&Number(c.enabled)!==0),axes=[];
 for(const wall of walls){let best=null,length=0;for(const poly of wall.paths||[])for(let k=0;k<poly.length;k++){const q=poly[k],p=poly[(k+1)%poly.length],dx=p[0]-q[0],dy=p[1]-q[1],n=Math.hypot(dx,dy);if(n>length){length=n;best=[dx/n,dy/n];}}if(best)axes.push(best);}
 if(!axes.length)return null;return {axis:axes[0],wallAxes:axes,internalMaxDeviationDegrees:Math.max(...axes.map(a=>Math.acos(Math.min(1,Math.abs(dot(a,axes[0]))))*180/Math.PI))};
}
for(const level of source.levels){
 for(const part of level.parts.filter(p=>p.id.startsWith("slide_bar_"))){
  const declared=(level.guideLinks||[]).filter(g=>g.stickPartId===part.id).map(g=>g.guidePartId),guideIds=[...new Set(declared)],pins=level.links.filter(l=>l.targetPartId===part.id);
  duplicateGuideReferences+=declared.length-guideIds.length;guides+=guideIds.length;incomingPinLinks+=pins.length;
  const key="guides="+guideIds.length+",pins="+pins.length;hist[key]=(hist[key]||0)+1;
  const axes=guideIds.map(id=>{const present=level.parts.some(p=>p.id===id);if(!present)missingGuideParts++;return {id,present,geometry:wallAxis(level,id)};});
  const row={level:level.id,stick:part.id,guideIds,incomingPins:pins.map(p=>({owner:p.sourceRingId,feature:p.pinFeatureId})),guideCount:guideIds.length,pinCount:pins.length};rows.push(row);
  if(guideIds.length>=2){const uncertain=axes.some(a=>!a.geometry),axis=axes[0].geometry?.axis;let max=uncertain?null:0;if(!uncertain)for(const a of axes)max=Math.max(max,a.geometry.internalMaxDeviationDegrees,Math.acos(Math.min(1,Math.abs(dot(a.geometry.axis,axis))))*180/Math.PI);axisRows.push({...row,wallAxes:axes,maxGuideAxisDeviationDegrees:max,parallelWithinOneDegree:max!==null&&max<=1});}
 }
}
const totals={sticks:rows.length,guidesReferenced:guides,incomingPinLinks,duplicateGuideReferences,missingGuideParts,noPinNoGuide:rows.filter(r=>!r.pinCount&&!r.guideCount).length,pinOnly:rows.filter(r=>r.pinCount&&!r.guideCount).length,guideOnly:rows.filter(r=>!r.pinCount&&r.guideCount).length,pinAndGuide:rows.filter(r=>r.pinCount&&r.guideCount).length,multipleGuides:axisRows.length,multipleGuidesWithPins:axisRows.filter(r=>r.pinCount).length,multipleGuideAxesParallel:axisRows.filter(r=>r.parallelWithinOneDegree).length,multipleGuideAxesUnknown:axisRows.filter(r=>r.maxGuideAxisDeviationDegrees===null).length,multipleGuideAxesDivergent:axisRows.filter(r=>r.maxGuideAxisDeviationDegrees!==null&&!r.parallelWithinOneDegree).length};
const report={format:"rotate-stick-retention-source-audit",version:1,source:"LevelTrainingData/ring-lab/data/original_levels.json",method:"Match authored pin targets/guide links by part ID; for multi-guide bars, infer each guide passage axis from the longest edges of its enabled non-trigger wall polygons in world XY. Count per asset occurrence, not campaign or deduplicated layouts.",totals,histogram:hist,pinAndGuideExamples:rows.filter(r=>r.pinCount&&r.guideCount).slice(0,12),multiGuideAxisRows:axisRows,divergentExamples:axisRows.filter(r=>r.maxGuideAxisDeviationDegrees!==null&&!r.parallelWithinOneDegree).slice(0,12),limits:["Authored links do not establish active sensor/body contact or that every guide is necessary.","Parallel wall axes constrain the geometric passage but do not certify a motion route or the original slide resolver.","Do not map these asset IDs to screenshots, compare difficulty, or copy colliders into a Designer draft.","Only supported straight/L/U compact paths are generated. Source custom outlines are not automatically classified as L/U or imported."]};
fs.writeFileSync(path.join(out,"stick-retention-source-audit.json"),JSON.stringify(report,null,2));console.log(JSON.stringify({totals,histogram:hist,examples:report.pinAndGuideExamples.slice(0,3),divergent:report.divergentExamples.slice(0,3)}));
