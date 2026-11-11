"use strict";
// Exact source export for GD editing; approval applies only to the approved folder.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),RR=require('../rr-core');
const core=path.resolve(__dirname,'..'),src='C:/Project Folder/TURPLevel/LevelVariants',out=path.join(__dirname,'20261015-turp-export-a001-a013');
fs.mkdirSync(out,{recursive:true});const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),read=f=>JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,''));
const before=fs.readdirSync(path.join(core,'levels')).filter(n=>/\.rr(?:design|pack)\.json$/.test(n)).map(name=>({name,sha256:hash(path.join(core,'levels',name))}));
const selection=read(path.join(src,'selection_active.json')).filter(e=>e.boardA<=13),entries=[];
for(const e of selection){
 const stem='A'+String(e.boardA).padStart(3,'0')+'-'+e.source,approved=fs.existsSync(path.join(src,'approved',stem+'.rrpack.json')),sourceDir=path.join(src,approved?'approved':'out_v3/levels');
 const pairs=['rrdesign','rrpack'].map(ext=>({source:path.join(sourceDir,stem+'.'+ext+'.json'),target:path.join(core,'levels','turp-'+stem+'.'+ext+'.json')}));
 for(const p of pairs){if(!fs.existsSync(p.source))throw Error('Missing source '+p.source);const data=read(p.source),lv=p.source.endsWith('.rrpack.json')?data.runtime:RR.Design.toLevel(data).level;if(RR.validate(lv))throw Error('Invalid source '+p.source);if(lv.parts.some(p=>(p.lockCount||0)!==0))throw Error('Chain source '+p.source);if(fs.existsSync(p.target)&&hash(p.target)!==hash(p.source))throw Error('Existing edit preserved; choose another name '+p.target);}
 entries.push({slot:e.boardA,sourceId:e.source,stem:'turp-'+stem,status:approved?'GD_approved_source_copy':'source_variant_for_GD_review_not_folder_approved',sourceDir,files:pairs.map(p=>({...p,sourceSha256:hash(p.source),existing:fs.existsSync(p.target)}))});
}
// Preflight all destinations before copying any file.
for(const e of entries)for(const p of e.files){if(!p.existing)fs.copyFileSync(p.source,p.target,fs.constants.COPYFILE_EXCL);p.targetSha256=hash(p.target);p.byteExact=p.targetSha256===p.sourceSha256;if(!p.byteExact)throw Error('Copy mismatch '+p.target);}
const manifest={createdAtUtc:new Date().toISOString(),request:'Export TURP A001–A013 to the existing Designer levels folder for GD editing',destination:path.join(core,'levels'),sourceReadOnly:true,approvalSource:'Direct user confirmation for LevelVariants/approved only',entries,missing:[{slot:10,reason:'Excluded from selection_active.json and no A010 variant exists in LevelVariants; selection_A1-50 maps original10109 with bomb mismatch. No replacement invented.'}],preservedExisting:before.map(e=>({...e,unchanged:hash(path.join(core,'levels',e.name))===e.sha256})),limits:'Exact export of existing source assets, not newly qualified authored proposals. Native CLI results are recorded separately; no new full gesture/Unity/GD approval is inferred.'};
fs.writeFileSync(path.join(out,'export-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({copiedPairs:entries.length,approved:entries.filter(e=>e.status==='GD_approved_source_copy').length,review:entries.filter(e=>e.status!=='GD_approved_source_copy').map(e=>e.slot),missing:manifest.missing,allCopiesExact:entries.every(e=>e.files.every(p=>p.byteExact)),priorPreserved:manifest.preservedExisting.every(e=>e.unchanged)}));
