'use strict';
const C=require('./common.cjs'),cp=require('child_process'),{availableSharp}=require('./preview.cjs');
const must=['AGENTS.md','PROMPT_101_200.md','state/progress.json','references/CAMPAIGN_CATALOG.json','references/ORIGINAL_CATALOG.json','Tools/RotateLevelDesigner/index.html','Tools/RotateLevelDesigner/rr-core.js','Tools/RotateLevelDesigner/rr-campaign.js','references/TURPLevel/LevelVariants/overlap_check.js'];
const missing=must.filter(p=>!C.fs.existsSync(C.path.join(C.ROOT,p)));
let cli=null;try{cli=cp.execFileSync(process.execPath,[C.path.join(C.TOOL,'rr-cli.js'),'validate',C.path.join(C.TOOL,'samples/sample-4rings-stick.rrdesign.json')],{encoding:'utf8'}).trim();}catch(e){cli={error:e.message,stdout:String(e.stdout||'')};}
const info={root:C.ROOT,node:process.version,minimumNode22:Number(process.versions.node.split('.')[0])>=22,missing,nativeCLI:cli,pngOptional:!!availableSharp(),unityRequired:false,npmRequiredForSVG:false,solutionSearch:false,notes:'Use root scripts; archived research may depend on the old machine or call a solver.'};
info.ok=info.minimumNode22&&!missing.length&&typeof cli==='string';console.log(JSON.stringify(info,null,2));process.exitCode=info.ok?0:1;
