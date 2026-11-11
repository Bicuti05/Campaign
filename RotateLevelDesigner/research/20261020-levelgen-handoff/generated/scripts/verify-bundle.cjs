'use strict';
const C=require('./common.cjs');
const m=C.read(C.path.join(C.ROOT,'PACKAGE_MANIFEST.json')),bad=[];
for(const f of m.files){const p=C.path.join(C.ROOT,f.path);if(!C.fs.existsSync(p))bad.push({path:f.path,error:'missing'});else if(C.sha(p)!==f.sha256)bad.push({path:f.path,error:'changed_since_snapshot'});}
console.log(JSON.stringify({files:m.files.length,bad,ok:bad.length===0,note:'State/work/new level files legitimately change after authoring. This checks the original handoff snapshot, not approval or gameplay.'},null,2));process.exitCode=bad.length?1:0;
