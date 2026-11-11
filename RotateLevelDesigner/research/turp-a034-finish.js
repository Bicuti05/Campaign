"use strict";
const fs=require('fs'),path=require('path');let code=fs.readFileSync(path.join(__dirname,'turp-a025-finish.js'),'utf8').replaceAll('20261015-turp-a025','20261016-turp-a034-image').replace("['70008','A025','turp-A025-70008-shared-U-r02']","['70004','A034','turp-A034-70004-image-shared-sliders-r03']").replace('under50% stop policy','under30% remaining stop policy');
const marker="new Function('require','__dirname','process',code)(require,__dirname,process);";
const additions=[
 ['const graph=api.touchGraph(d),keys=api.PALETTE','const graph=api.touchGraph(d);for(const r of d.rings)for(const p of r.pins||[]){const i=graph.objs.findIndex(o=>o.id===r.id),j=graph.objs.findIndex(o=>o.id===p.target);if(i>=0&&j>=0){graph.E[i].add(j);graph.E[j].add(i);}}const keys=api.PALETTE'],
 ['!compare.pass','!compare.candidateQualified'],
 ["source=api.loadDesign(srcFile)","source=read(path.join(IN,'image-supported-source-reference-r01.rrdesign.json'))"],
 ['sourceInitialInputComparison:reversal,','sourceInitialInputComparison:reversal,sourceLimit:"Source drawing includes two image-estimated L paths; custom pin/runtime/source solution still unverified. No G4 equivalence approval.",']
 ].map(([a,b])=>'replace('+JSON.stringify(a)+','+JSON.stringify(b)+');').join('');
code=code.replace(marker,additions+marker);new Function('require','__dirname','process',code)(require,__dirname,process);
