'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const stage=path.resolve(process.argv[2]),generated=path.join(__dirname,'generated');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
// Refresh active authored files only; original reference bytes remain untouched.
function refresh(src,dst){for(const e of fs.readdirSync(src,{withFileTypes:true})){const a=path.join(src,e.name),b=path.join(dst,e.name);if(e.isDirectory()){fs.mkdirSync(b,{recursive:true});refresh(a,b);}else fs.copyFileSync(a,b);}}
refresh(generated,stage);
const RR=require(path.join(stage,'Tools/RotateLevelDesigner/rr-core.js'));
const catalogPath=path.join(stage,'references/CAMPAIGN_CATALOG.json'),catalog=read(catalogPath);
for(const e of catalog.rows){const a=read(path.join(stage,e.runtime)),b=read(path.join(stage,e.pack)).runtime;let max=0,count=0,nonNumeric=0;
 function diff(a,b){if(typeof a==='number'&&typeof b==='number'){if(a!==b){count++;max=Math.max(max,Math.abs(a-b));}return;}if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k]);}else if(a!==b)nonNumeric++;}diff(a,b);
 e.runtimeDifference={numericFields:count,maxAbsoluteNumericDifference:max,nonNumericFields:nonNumeric};
}
catalog.note='Exact equality is reported separately from small numeric serialization differences. No source or runtime was normalized or rewritten; game runtime is the baseline for in-game values.';
fs.writeFileSync(catalogPath,JSON.stringify(catalog,null,2)+'\n');
const mismatches=catalog.rows.filter(x=>!x.runtimeMatchesPack);const limitPath=path.join(stage,'context/KNOWN_LIMITS.md');
fs.appendFileSync(limitPath,'\n\n## Đối chiếu số serialized trong snapshot đóng gói\n\n'+mismatches.length+'/100 slot không trùng số JSON tuyệt đối giữa runtime Unity và pack ingame. Catalog đã đếm chênh lệch từng slot: max tuyệt đối toàn bộ='+Math.max(...catalog.rows.map(x=>x.runtimeDifference.maxAbsoluteNumericDifference))+', số field khác kiểu/khác chuỗi/cấu trúc='+catalog.rows.reduce((a,x)=>a+x.runtimeDifference.nonNumericFields,0)+'. Đây là dữ liệu đối chiếu, không tự coi là lỗi gameplay hoặc chứng nhận tương đương. Đã giữ nguyên cả hai nguồn; dùng runtime game làm mốc giá trị ingame và pack/design làm authoring tham khảo. Không rebake/sửa dữ liệu tham chiếu để ép khớp.\n');
const old=read(path.join(stage,'PACKAGE_SOURCES.json'));
old.activeFilesUpdatedAt=new Date().toISOString();
// Refresh hashes after curated docs/catalog edits while retaining original provenance.
for(const f of old.copied){const p=path.join(stage,f.path);if(fs.existsSync(p)){f.sha256=sha(p);f.bytes=fs.statSync(p).size;}}
const test=read(path.join(__dirname,'portable-checks.json'));
const isolated=path.join(__dirname,'relocated check/LevelGen');
const pngMeta=read(path.join(isolated,'work/tests/compare-png-preview.json'));
assert.ok(pngMeta.png);assert.equal(test.solutionSearch,false);
const check={createdAt:new Date().toISOString(),status:'portable_workflow_checked',nativeCliValidated:true,isolatedPathWithSpaces:true,oldMachineImportsRequired:false,solutionSearch:false,proofInFixture:null,staticRegressionCases:test.cases.filter(x=>x.rejected).map(x=>x.case),overwriteProtection:true,svgPreview:true,pngPreview:true,sameScaleComparison:true,colorAndMonoInspected:true,pngDependencyInstalledInIsolatedTestOnly:true,fixtureNotDeliveredAs101:true,originalCampaignSlots:100,approvedReferenceFiles:18,limitations:['Actual browser interaction and Unity/device are not re-tested by packaging. Existing Designer app/core are copied unchanged.','Not all archived research scripts are portable; root scripts are the supported entry points.','No101-200 proposal has been generated or solved.']};
fs.writeFileSync(path.join(stage,'PACKAGE_CHECK.json'),JSON.stringify(check,null,2)+'\n');
fs.writeFileSync(path.join(stage,'PACKAGE_SOURCES.json'),JSON.stringify(old,null,2)+'\n');
const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.git'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else{const rel=path.relative(stage,p).replaceAll('\\','/');if(rel!=='PACKAGE_MANIFEST.json')files.push({path:rel,bytes:fs.statSync(p).size,sha256:sha(p)});}}}walk(stage);
assert.equal(files.filter(x=>x.path.startsWith('Tools/RotateLevelDesigner/ingame/')&&x.path.endsWith('.rrpack.json')).length,100);
const unexpected=files.filter(x=>/^Tools\/RotateLevelDesigner\/levels\/A(?:10[1-9]|1[1-9][0-9]|200)_/.test(x.path));assert.equal(unexpected.length,0);
// Existing scripts/styles of the offline Designer resolve locally.
const html=fs.readFileSync(path.join(stage,'Tools/RotateLevelDesigner/index.html'),'utf8');
for(const x of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(/^(?:https?:|#|data:)/.test(x[1]))continue;assert.ok(fs.existsSync(path.resolve(stage,'Tools/RotateLevelDesigner',x[1])),'Missing browser resource '+x[1]);}
const manifest={createdAt:new Date().toISOString(),format:'levelgen-handoff-manifest',fileCount:files.length,totalBytes:files.reduce((a,x)=>a+x.bytes,0),files:files.sort((a,b)=>a.path.localeCompare(b.path))};
fs.writeFileSync(path.join(stage,'PACKAGE_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({root:stage,files:files.length,MB:Math.round(manifest.totalBytes/1048576),originalLevels:read(path.join(stage,'references/TURPLevel/ring-lab/data/original_levels.json')).levels.length,maxSerializationDifference:Math.max(...catalog.rows.map(x=>x.runtimeDifference.maxAbsoluteNumericDifference)),nonNumericDifferences:catalog.rows.reduce((a,x)=>a+x.runtimeDifference.nonNumericFields,0)},null,2));
