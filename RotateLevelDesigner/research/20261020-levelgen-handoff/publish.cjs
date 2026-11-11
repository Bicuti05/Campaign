'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const src=path.resolve(process.argv[2]),dst=path.resolve('C:/Project Folder/LevelGen');
assert.equal(dst.toLowerCase(),'c:\\project folder\\levelgen');
assert.ok(src!==dst&&!src.startsWith(dst+path.sep));
const m=JSON.parse(fs.readFileSync(path.join(src,'PACKAGE_MANIFEST.json'),'utf8'));
if(fs.existsSync(dst))assert.equal(fs.readdirSync(dst).length,0,'Target is not empty; preserve existing files.');
else fs.mkdirSync(dst,{recursive:true});
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
for(const f of m.files){const a=path.resolve(src,f.path),b=path.resolve(dst,f.path);assert.ok(a.startsWith(src+path.sep)&&b.startsWith(dst+path.sep));assert.equal(sha(a),f.sha256);fs.mkdirSync(path.dirname(b),{recursive:true});fs.copyFileSync(a,b,fs.constants.COPYFILE_EXCL);assert.equal(sha(b),f.sha256);}
fs.copyFileSync(path.join(src,'PACKAGE_MANIFEST.json'),path.join(dst,'PACKAGE_MANIFEST.json'),fs.constants.COPYFILE_EXCL);
const result={atUtc:new Date().toISOString(),destination:dst,files:m.files.length+1,totalBytes:m.totalBytes+fs.statSync(path.join(dst,'PACKAGE_MANIFEST.json')).size,manifestSha256:sha(path.join(dst,'PACKAGE_MANIFEST.json')),allCopiedFileHashesMatch:true,sourceProjectModified:false,new101to200LevelsGenerated:false};
fs.writeFileSync(path.join(__dirname,'publish-result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result,null,2));
