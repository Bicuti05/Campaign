'use strict';
// Explicit allowlist export: no Git/config/SDK/UserSettings/cache/credentials.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process'),assert=require('assert/strict');
const PROJECT=path.resolve(__dirname,'../../../..'),TURP='C:/Project Folder/TURPLevel',DOWNLOAD='C:/Users/ADMIN/Downloads';
const DEST=path.resolve(process.argv[2]||path.join(__dirname,'staging/LevelGen'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const excluded=[],copied=[];
if(fs.existsSync(DEST)&&fs.readdirSync(DEST).length)throw Error('Destination must be empty; never overwrite an existing handoff: '+DEST);
fs.mkdirSync(DEST,{recursive:true});
function put(rel,data,source,category){
 const p=path.resolve(DEST,rel);assert.ok(p.startsWith(DEST+path.sep));fs.mkdirSync(path.dirname(p),{recursive:true});
 fs.writeFileSync(p,data,{flag:'wx'});copied.push({path:rel.replaceAll('\\','/'),source:source||null,category,sha256:sha(Buffer.from(data)),bytes:Buffer.byteLength(data)});
}
function copy(src,rel,category){
 if(!fs.existsSync(src)){excluded.push({source:src,reason:'not_on_disk'});return;}
 const st=fs.lstatSync(src);
 if(st.isSymbolicLink()){excluded.push({source:src,reason:'symlink_not_followed'});return;}
 if(st.isDirectory()){
  for(const name of fs.readdirSync(src)){
   if(['.git','.codex','.claude','node_modules','__pycache__','.DS_Store'].includes(name)||name==='20261020-levelgen-handoff'){excluded.push({source:path.join(src,name),reason:'excluded_config_cache_or_recursive_handoff'});continue;}
   copy(path.join(src,name),path.join(rel,name),category);
  }
 }else{
  if(/(?:^\.env|\.pfx$|\.p12$|\.keystore$|^credentials\.json$)/i.test(path.basename(src))){excluded.push({source:src,reason:'credential_filename'});return;}
  const b=fs.readFileSync(src);
  if(/\.(?:json|js|cjs|txt|md|html|csv|yaml|yml|prefab)$/i.test(src)){
   const s=b.toString('utf8');if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bsk-[A-Za-z0-9_-]{30,}|\bgithub_pat_[A-Za-z0-9_]{35,}/.test(s)){excluded.push({source:src,reason:'credential_content_detected'});return;}
  }
  put(rel,b,src,category);
 }
}
copy(path.join(PROJECT,'Tools/RotateLevelDesigner'),'Tools/RotateLevelDesigner','designer_snapshot');
// Retain the original nested rules as an archive; installed active rules supersede them.
const toolRules=fs.readFileSync(path.join(DEST,'Tools/RotateLevelDesigner/AGENTS.md'));
put('context/archive/Designer-AGENTS-original.md',toolRules,'Tools/RotateLevelDesigner/AGENTS.md','historical_rules');
fs.unlinkSync(path.join(DEST,'Tools/RotateLevelDesigner/AGENTS.md'));
copied.splice(copied.findIndex(x=>x.path==='Tools/RotateLevelDesigner/AGENTS.md'),1);
copy(path.join(PROJECT,'AGENTS.md'),'context/archive/Project-AGENTS-original.md','historical_rules');
for(const f of ['README.md','naming-convention.md','assets-folder-structure.md','event-data-controller-template-project.md','pattern-event-data-controller.md']){
 const src=f==='README.md'?path.join(PROJECT,f):path.join(PROJECT,'Wiki',f);copy(src,'context/archive/company/'+f,'company_context');
}
for(const f of fs.readdirSync(path.join(PROJECT,'Assets/Document'))){if(/^TURP.*\.(?:md|png)$/i.test(f))copy(path.join(PROJECT,'Assets/Document',f),'Assets/Document/'+f,'project_documentation');}
const camp='Assets/_IEC/Config/TURP/Campaign';copy(path.join(PROJECT,camp),camp,'campaign_runtime_snapshot');
copy(path.join(PROJECT,'Assets/_IEC/Prefab/_Controllers.prefab'),'Assets/_IEC/Prefab/_Controllers.prefab','campaign_order_snapshot');
for(const name of ['LevelVariants','LevelAnalysis','ring-lab','Ảnh chơi-20261004T064143Z-1-001'])copy(path.join(TURP,name),'references/TURPLevel/'+name,'original_and_TURP_reference');
for(const f of fs.readdirSync(TURP)){if(/\.(?:md|html)$/i.test(f)&&f!=='AGENTS.md')copy(path.join(TURP,f),'references/TURPLevel/'+f,'TURP_report_and_board');}
copy(path.join(TURP,'AGENTS.md'),'context/archive/TURP-AGENTS-original.md','historical_rules');
for(const f of ['index (6).html','level_data.json','level_summary.csv','extract_levels.py'])copy(path.join(DOWNLOAD,f),'references/original-downloads/'+f,'original_supplied_data');
for(const f of ['turp-no-solution-search.md','turp-source-weight.md','designer-tool-web.md'])copy('C:/Users/ADMIN/.claude/projects/C--Project-Folder-intern-iec-game-2026/memory/'+f,'context/archive/memory/'+f,'user_confirmed_memory');
copy(path.join(__dirname,'generated'),'.','portable_active_files');
put('Tools/RotateLevelDesigner/AGENTS.md','# Règles actives / Quy tắc đang áp dụng\n\nĐọc `../../AGENTS.md`, `../../context/CURRENT_RULES.md` và checkpoint `../../state/progress.json`. Luồng101–200 KHÔNG tìm lời giải; xuất --no-solve. Luật Designer nguyên bản đã lưu ở `../../context/archive/Designer-AGENTS-original.md` để đối chiếu, yêu cầu solve trong đó không áp dụng. Không sửa core/app/constants/campaign/golden; không ghi đè các level có sẵn. Dùng script portable ở root.\n',null,'portable_rule_override');
// Catalog links ordinals to source pack names; never infer ordinal from old filename.
const prefab=fs.readFileSync(path.join(DEST,'Assets/_IEC/Prefab/_Controllers.prefab'),'utf8');
const block=/^ {2}sampleLevels:[^\r\n]*\r?\n((?: {2}- [^\r\n]*\r?\n)*)/m.exec(prefab);assert.ok(block);
const byGuid=new Map();for(const f of fs.readdirSync(path.join(DEST,camp)).filter(f=>f.endsWith('.json.meta'))){const m=/guid: ([0-9a-f]{32})/.exec(fs.readFileSync(path.join(DEST,camp,f),'utf8'));if(m)byGuid.set(m[1],f.slice(0,-5));}
const packs=fs.readdirSync(path.join(DEST,'Tools/RotateLevelDesigner/ingame')).filter(f=>f.endsWith('.rrpack.json')).map(f=>({file:'Tools/RotateLevelDesigner/ingame/'+f,doc:read(path.join(DEST,'Tools/RotateLevelDesigner/ingame',f))}));assert.equal(packs.length,100);
const order=[...block[1].matchAll(/guid: ([0-9a-f]{32})/g)].map((g,i)=>{
 const f=byGuid.get(g[1]);assert.ok(f);const runtime=camp+'/'+f,l=read(path.join(DEST,runtime));
 const match=packs.filter(p=>p.doc.levelId===l.levelId);assert.equal(match.length,1,'Ambiguous ingame ID '+l.levelId);
 const p=match[0],counts={};for(const o of l.parts)counts[o.kind]=(counts[o.kind]||0)+1;
 const runtimeMatchesPack=JSON.stringify(l)===JSON.stringify(p.doc.runtime);
 return{slot:i+1,levelId:l.levelId,name:p.doc.name,pack:p.file,packSha256:sha(fs.readFileSync(path.join(DEST,p.file))),runtime,runtimeSha256:sha(fs.readFileSync(path.join(DEST,runtime))),guid:g[1],counts,runtimeMatchesPack,status:'current_campaign_snapshot_not_auto_QA_approved'};
});assert.equal(order.length,100);
put('references/CAMPAIGN_CATALOG.json',JSON.stringify({createdAt:new Date().toISOString(),count:order.length,rows:order},null,2)+'\n',null,'generated_catalog');
const original=read(path.join(TURP,'ring-lab/data/original_levels.json'));
const items=Array.isArray(original)?original:(original.levels||Object.values(original));
const originalCatalog={note:'Original IDs are not Board A or campaign ordinal. No mapping for101-200 is asserted.',originalData:'references/TURPLevel/ring-lab/data/original_levels.json',topKeys:Object.keys(original).slice(0,12),records:Array.isArray(items)?items.length:null,boardAHtml:'references/original-downloads/index (6).html',mapping1to50:'references/TURPLevel/LevelVariants/selection_A1-50.json',mapping51to100:'Tools/RotateLevelDesigner/research/20261016-boardA-ref-51/mapping-51-100.json',mappingLimits:['60/92/99 not exact','Do not assign images by numeric order','Source10024/10036 reconstructed bent bars need authored slideAxis before validation'],sourceDesigns:['references/TURPLevel/LevelVariants/sources','Tools/RotateLevelDesigner/research/20261016-boardA-ref-51/sources']};
put('references/ORIGINAL_CATALOG.json',JSON.stringify(originalCatalog,null,2)+'\n',null,'generated_catalog');
const approved='references/TURPLevel/LevelVariants/approved';const approvedFiles=fs.readdirSync(path.join(DEST,approved)).filter(f=>/\.rr(?:design|pack)\.json$/.test(f));assert.equal(approvedFiles.length,18);
put('references/APPROVED_HASHES.json',JSON.stringify({status:'GD_approved_reference_snapshot_only',files:approvedFiles.map(f=>({path:approved+'/'+f,sha256:sha(fs.readFileSync(path.join(DEST,approved,f)))}))},null,2)+'\n',null,'generated_catalog');
// Portable rule warning for every archived nested AGENTS, preserving original bytes separately.
const nested=[];function findAgents(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory())findAgents(p);else if(f.name==='AGENTS.md')nested.push(path.relative(DEST,p).replaceAll('\\','/'));}}
findAgents(path.join(DEST,'references'));
for(const p of nested){put(p.replace(/AGENTS\.md$/,'AGENTS-HISTORICAL.txt'),fs.readFileSync(path.join(DEST,p)),null,'historical_rules');fs.writeFileSync(path.join(DEST,p),'# Archive only\n\nThis is reference data. Root LevelGen/AGENTS.md and context/CURRENT_RULES.md override historical rules. Do not execute old scripts or solution searches as part of101–200. Original rules retained in AGENTS-HISTORICAL.txt.\n');const row=copied.find(x=>x.path===p);row.sha256=sha(fs.readFileSync(path.join(DEST,p)));row.bytes=fs.statSync(path.join(DEST,p)).size;row.category='portable_rule_override';}
const missing=[];for(const p of ['C:/Project Folder/TrainingLevel','C:/Project Folder/LevelTrainingData','C:/Project Folder/TURPLevel/LevelVariants/selection_active.json'])if(!fs.existsSync(p))missing.push(p);
put('references/AVAILABILITY.json',JSON.stringify({notOnDisk:missing,substitutes:{TrainingLevel:'Existing TURP screenshots, Board A HTML, ring-lab original_levels and Designer research previews included.',selection_active:'No active file on disk; selection_A1-50 and reference mapping51-100 retained as historical mappings. Campaign catalog reflects the live 100 slots.'},noInventedApproval:true},null,2)+'\n',null,'availability');
const headText=fs.readFileSync(path.join(PROJECT,'.git/HEAD'),'utf8').trim();let head=headText;
if(headText.startsWith('ref: ')){const ref=headText.slice(5),rf=path.join(PROJECT,'.git',ref);head=fs.existsSync(rf)?fs.readFileSync(rf,'utf8').trim():'symbolic '+ref;}
put('PACKAGE_SOURCES.json',JSON.stringify({builtAt:new Date().toISOString(),project:PROJECT,head,destination:DEST,copied,excluded,missingHistoricalPaths:missing,limitations:['Not a raw full transcript; context is a curated synthesis plus original on-disk documents.','Some historical research scripts remain machine-bound; root scripts are portable.','No new101-200 levels have been generated.']},null,2)+'\n',null,'provenance');
console.log(JSON.stringify({destination:DEST,files:copied.length,MB:Math.round(copied.reduce((a,x)=>a+x.bytes,0)/1048576),campaignSlots:order.length,runtimePackMismatches:order.filter(x=>!x.runtimeMatchesPack).map(x=>x.slot),approvedFiles:approvedFiles.length,excluded:excluded.length,missing},null,2));
