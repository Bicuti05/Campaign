'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict');
const stage=path.resolve(process.argv[2]),dest=path.resolve(__dirname,'relocated check/LevelGen');
fs.mkdirSync(dest,{recursive:true});
// Intentionally minimal, relocated copy: no old project, source directory or global deps.
const paths=['scripts','context','state','AGENTS.md','README.md','PROMPT_101_200.md','package.json','references/CAMPAIGN_CATALOG.json','references/ORIGINAL_CATALOG.json','references/TURPLevel/LevelVariants/overlap_check.js','Tools/RotateLevelDesigner/rr-core.js','Tools/RotateLevelDesigner/rr-cli.js','Tools/RotateLevelDesigner/rr-constants.js','Tools/RotateLevelDesigner/rr-campaign.js','Tools/RotateLevelDesigner/index.html','Tools/RotateLevelDesigner/app.js','Tools/RotateLevelDesigner/app.css','Tools/RotateLevelDesigner/core','Tools/RotateLevelDesigner/samples','Tools/RotateLevelDesigner/research/turp-color-near.js'];
for(const p of paths){fs.mkdirSync(path.dirname(path.join(dest,p)),{recursive:true});fs.cpSync(path.join(stage,p),path.join(dest,p),{recursive:true,errorOnExist:false});}
fs.mkdirSync(path.join(dest,'work/tests'),{recursive:true});fs.mkdirSync(path.join(dest,'Tools/RotateLevelDesigner/levels'),{recursive:true});
const json=(p,v)=>fs.writeFileSync(path.join(dest,p),JSON.stringify(v,null,2)+'\n');
const fixture={format:'turp-design',version:1,levelId:'101',name:'Technical fixture only — not a delivered Level101',author:'portable checks',notes:'Packaging fixture. No solution search. Not a campaign proposal.',rings:[{id:'R1',x:0,y:0,gap:90,gapDir:180,color:'blue',pins:[{id:'p',angle:0,target:'R2'}]},{id:'R2',x:4.5854,y:0,gap:90,gapDir:90,color:'red',pins:[]}],sticks:[]};
json('work/tests/fixture.rrdesign.json',fixture);
const brief={slot:101,idea:'Packaging fixture only',roles:[],limitations:['Not a delivered proposal; no solution search.'],solutionSearch:false};json('work/tests/brief.json',brief);
const run=(args,ok=true)=>{const r=cp.spawnSync(process.execPath,args,{cwd:dest,encoding:'utf8',env:{...process.env,NODE_PATH:''}});if(r.error)throw r.error;if(ok)assert.equal(r.status,0,r.stdout+'\n'+r.stderr);else assert.notEqual(r.status,0,'Expected rejection: '+args.join(' '));return{args,status:r.status,stdout:r.stdout.trim(),stderr:r.stderr.trim()};};
const records=[];
records.push(run(['scripts/doctor.cjs']));
records.push(run(['scripts/check-level.cjs','work/tests/fixture.rrdesign.json']));
const {check}=require(path.join(dest,'scripts/check-level.cjs'));
const bads=[
 ['pin-margin',d=>d.rings[0].gapDir=0,'pin-margin'],
 ['palette',d=>d.rings[0].color='#ffffff','palette'],
 ['free',d=>d.rings[0].pins=[],'analysis-warnings'],
 ['overlap',d=>d.rings[1].x=2,'strict-OVL'],
 ['floating-stop',d=>d.rings[1].stops=[{angle:90,length:.6}],'stop-root-not-in-material'],
 ['initial-bomb',d=>d.rings[0].bomb={x:2.8354,y:0,radius:.4},'initial-bomb-contact']
];
for(const [name,mutate,expected] of bads){const d=structuredClone(fixture);mutate(d);const p='work/tests/'+name+'.rrdesign.json';json(p,d);const r=check(path.join(dest,p));assert.ok(!r.ok&&r.errors.some(e=>e.code===expected),name+': '+JSON.stringify(r.errors));records.push({case:name,expected,rejected:true});}
records.push(run(['scripts/preview.cjs','work/tests/fixture.rrdesign.json','--source','work/tests/fixture.rrdesign.json','--out','work/tests/compare']));
records.push(run(['scripts/deliver.cjs','work/tests/fixture.rrdesign.json','--slot','101','--rev','r98','--brief','work/tests/brief.json','--source','work/tests/fixture.rrdesign.json']));
records.push(run(['scripts/deliver.cjs','work/tests/fixture.rrdesign.json','--slot','101','--rev','r98','--brief','work/tests/brief.json'],false));
const PP=fs.readdirSync(path.join(dest,'Tools/RotateLevelDesigner/levels')).find(f=>f.endsWith('.rrpack.json'));const pack=JSON.parse(fs.readFileSync(path.join(dest,'Tools/RotateLevelDesigner/levels',PP)));assert.equal(pack.proof,null);
const result={atUtc:new Date().toISOString(),root:dest,ok:true,solutionSearch:false,tests:'Packaging workflow and static-gate regression checks only, not101-200 gameplay tests.',cases:records};
fs.writeFileSync(path.join(__dirname,'portable-checks.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({ok:true,records:records.length,root:dest,proof:pack.proof},null,2));
