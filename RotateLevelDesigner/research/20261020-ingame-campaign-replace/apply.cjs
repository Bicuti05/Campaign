const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cp = require('child_process');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '../../../..');
process.chdir(root);
const research = path.relative(root, __dirname).replaceAll('\\', '/');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
const designer = 'Tools/RotateLevelDesigner';
const campaign = 'Assets/_IEC/Config/TURP/Campaign';
const controllers = 'Assets/_IEC/Prefab/_Controllers.prefab';
const bundle = designer + '/rr-campaign.js';
const specs = [
 [8, 'A008_20261020_r02', 'turp-A008-10008'],
 [10, 'A010_20261020_r04', 'genai-31-helicopter-v03'],
 [12, 'A012_20261020_r01', 'turp-A012-10006'],
 [14, 'A014_20261020_r01', 'turp-A014-10014-outline-r01'],
 [16, 'A016_20261020_r01', 'turp-A016-70002-linked-r01'],
 [18, 'A018_20261020_r01', 'turp-A018-70009-shared-r06'],
 [19, 'A019_20261020_r01', 'turp-A019-10017-left-U-r02'],
 [20, 'A020_20261020_r01', 'genai-24-rabbit-v03'],
];
const plan = specs.map(([slot, stem, oldStem]) => {
 const id = String(slot).padStart(3, '0');
 const source = `${designer}/levels/${stem}.rrpack.json`;
 const ingame = `${designer}/ingame/${oldStem}.rrpack.json`;
 const unity = `${campaign}/Level${id}.json`;
 const bytes = fs.readFileSync(source);
 const pack = read(source);
 assert.equal(pack.name, `Level ${slot}`, `GD name changed: ${source}`);
 assert.equal(pack.levelId, id);
 assert.equal(pack.runtime.levelId, id);
 assert.equal(read(ingame).levelId, id);
 assert.equal(read(unity).levelId, id);
 assert.ok(Array.isArray(pack.runtime.parts));
 return {slot, id, stem, source, ingame, unity, bytes, pack};
});
const inventory = () => {
 const files = [controllers, bundle];
 for (const dir of [`${designer}/ingame`, campaign])
  for (const f of fs.readdirSync(dir)) if (fs.statSync(`${dir}/${f}`).isFile()) files.push(`${dir}/${f}`);
 return Object.fromEntries(files.sort().map(f => [f, hash(fs.readFileSync(f))]));
};
const before = inventory();
const prefabBytes = fs.readFileSync(controllers);
const block = /^ {2}sampleLevels:[^\r\n]*\r?\n((?: {2}- [^\r\n]*\r?\n)*)/m.exec(prefabBytes.toString());
assert.ok(block);
const order = [...block[1].matchAll(/guid: ([0-9a-f]{32})/g)].map(m => m[1]);
assert.equal(order.length, 100);
for (const p of plan) {
 const guid = /guid: ([0-9a-f]{32})/.exec(fs.readFileSync(p.unity + '.meta', 'utf8'))[1];
 assert.equal(order[p.slot - 1], guid);
}
const backupRoot = `${research}/backup`;
assert.ok(!fs.existsSync(backupRoot), 'Backup exists; do not overwrite saved work');
fs.mkdirSync(backupRoot, {recursive:true});
const backups = [...plan.flatMap(p => [p.ingame, p.unity, p.unity + '.meta']), controllers, bundle];
for (const f of backups) {
 const dest = `${backupRoot}/${f}`;
 fs.mkdirSync(path.dirname(dest), {recursive:true});
 fs.copyFileSync(f, dest, fs.constants.COPYFILE_EXCL);
}
fs.writeFileSync(`${research}/before.json`, JSON.stringify({createdAt:new Date().toISOString(), inventory:before, order}, null, 2) + '\n', {flag:'wx'});
for (const p of plan) {
 assert.equal(hash(fs.readFileSync(p.source)), hash(p.bytes), 'Source changed during preparation');
 fs.writeFileSync(p.ingame, p.bytes);
 fs.writeFileSync(p.unity, JSON.stringify(p.pack.runtime, null, 2) + '\n');
}
cp.execFileSync(process.execPath, [`${designer}/rr-cli.js`, 'bundle-campaign'], {stdio:'inherit'});
const after = inventory();
assert.deepEqual(Object.keys(after), Object.keys(before));
const allowed = new Set([...plan.flatMap(p => [p.ingame, p.unity]), bundle]);
for (const f of Object.keys(before)) if (!allowed.has(f)) assert.equal(after[f], before[f], `Unexpected change ${f}`);
assert.deepEqual(fs.readFileSync(controllers), prefabBytes);
const manifest = {
 createdAt:new Date().toISOString(), status:'applied_on_disk',
 authorization:'User requested renamed Level XX packs replace ingame and Unity campaign; explicitly added 12 and 14.',
 policy:'Exact current source-pack bytes copied to ingame. Unity JSON is pack.runtime, without rebake or solution search. Existing asset GUIDs, order, save, source packs/designs preserved.',
 backup:backupRoot, campaignSlots:order.length, campaignOrderUnchanged:true,
 gameplayTestsRun:false, solveRun:false, unityEditorRefresh:'pending',
 slots:plan.map(p => {
  assert.equal(hash(fs.readFileSync(p.ingame)), hash(p.bytes));
  assert.deepEqual(read(p.unity), p.pack.runtime);
  assert.equal(hash(fs.readFileSync(p.source)), hash(p.bytes));
  return {slot:p.slot,id:p.id,name:p.pack.name,stem:p.stem,source:p.source,ingame:p.ingame,unity:p.unity,
   sourceSha256:hash(p.bytes),ingameSha256:after[p.ingame],unitySha256:after[p.unity],
   previousIngameSha256:before[p.ingame],previousUnitySha256:before[p.unity],
   metaSha256:after[p.unity+'.meta'],runtimeParts:p.pack.runtime.parts.length};
 }),
 bundle:{path:bundle,sha256:after[bundle]},
 changedFiles:Object.keys(before).filter(f => before[f] !== after[f]),
 limitations:'Copy/readback checks only; no additional validate/solve/gameplay tests. Older proof/notes in user-edited source packs have not been re-certified.'
};
fs.writeFileSync(`${research}/manifest.json`, JSON.stringify(manifest,null,2)+'\n', {flag:'wx'});
console.log(JSON.stringify({status:manifest.status,slots:manifest.slots.map(p=>({slot:p.slot,name:p.name,parts:p.runtimeParts,sha256:p.sourceSha256})),changedFiles:manifest.changedFiles},null,2));
