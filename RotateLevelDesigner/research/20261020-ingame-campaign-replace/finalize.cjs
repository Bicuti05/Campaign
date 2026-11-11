const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '../../../..');
process.chdir(root);
const dir = path.relative(root,__dirname).replaceAll('\\','/');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const read = p => JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const manifestPath = dir + '/manifest.json';
const m = read(manifestPath);
const before = read(dir + '/before.json');
// Permit a concurrent formatting-only save, while preserving the copied version.
for (const p of m.slots) {
 const bytes = fs.readFileSync(p.source);
 const currentHash = hash(bytes);
 if (currentHash === p.sourceSha256) continue;
 assert.deepEqual(read(p.source), read(p.ingame), 'Source content changed after copy');
 const saved = dir + '/intermediate/' + p.stem + '.rrpack.json';
 fs.mkdirSync(path.dirname(saved), {recursive:true});
 if (!fs.existsSync(saved)) fs.copyFileSync(p.ingame,saved,fs.constants.COPYFILE_EXCL);
 p.initialCopiedSha256 = p.sourceSha256;
 p.sourceFormattingChangedAfterCopy = true;
 fs.writeFileSync(p.ingame,bytes);
 p.sourceSha256 = currentHash;
 p.ingameSha256 = currentHash;
}
for (const p of m.slots) {
 assert.equal(hash(fs.readFileSync(p.source)), p.sourceSha256, 'Source modified after copy');
 assert.equal(hash(fs.readFileSync(p.ingame)), p.sourceSha256);
 assert.deepEqual(read(p.unity),read(p.source).runtime);
 p.unitySha256 = hash(fs.readFileSync(p.unity));
 const metaNow = fs.readFileSync(p.unity+'.meta','utf8');
 const metaOld = fs.readFileSync(m.backup+'/'+p.unity+'.meta','utf8');
 assert.equal(metaNow.replace(/\r\n/g,'\n'),metaOld.replace(/\r\n/g,'\n'));
 p.metaSha256 = hash(Buffer.from(metaNow));
}
const formattingChanges = [];
for (const [p,h] of Object.entries(before.inventory)) if (!m.changedFiles.includes(p)) {
 const b = fs.readFileSync(p);
 if (hash(b)===h) continue;
 const lf = b.toString().replace(/\r\n/g,'\n');
 assert.ok(hash(Buffer.from(lf))===h || hash(Buffer.from(lf.replace(/\n/g,'\r\n')))===h, 'Unexpected semantic change: '+p);
 formattingChanges.push(p);
}
m.concurrentFormattingChanges = formattingChanges;
m.bundle.sha256 = hash(fs.readFileSync(m.bundle.path));
const logPath = path.join(process.env.LOCALAPPDATA,'Unity/Editor/Editor.log');
const log = fs.readFileSync(logPath,'utf8');
assert.ok(log.toLowerCase().includes(root.toLowerCase()), 'Editor log does not identify project');
const imports = m.slots.map(p => {
 const pattern = new RegExp('Start importing '+p.unity.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+' using Guid\\(([^)]+)\\)[^\\r\\n]*\\r?\\n -> \\(artifact id: \'([^\']+)\'\\) in ([0-9.]+) seconds','g');
 const matches = [...log.matchAll(pattern)];
 assert.ok(matches.length, 'No completed Unity import: '+p.unity);
 const last = matches.at(-1);
 const expectedGuid = /guid: ([0-9a-f]{32})/.exec(fs.readFileSync(p.unity+'.meta','utf8'))[1];
 assert.equal(last[1],expectedGuid);
 return {path:p.unity,guid:last[1],artifactId:last[2],seconds:Number(last[3])};
});
const issue = "Firebase.Editor.XcodeProjectPatcher reports missing Google.IOSResolver / UnityEditor.iOS.Extensions.Xcode in Editor.log; also logged before this level import. Not modified in this task.";
const evidence = {observedAt:new Date().toISOString(),project:root,source:logPath,method:'Unity automatic Asset Pipeline refresh; completed imports observed in Editor.log',imports,editorIssue:issue,gameplayTestsRun:false};
fs.writeFileSync(dir+'/editor-import-evidence.json',JSON.stringify(evidence,null,2)+'\n',{flag:'wx'});
m.status = 'applied_ingame_and_unity_campaign';
m.unityEditorRefresh = 'automatic_refresh_completed_for_all_8_assets_observed_in_Editor_log';
m.editorEvidence = dir+'/editor-import-evidence.json';
m.editorIssue = issue;
fs.writeFileSync(manifestPath,JSON.stringify(m,null,2)+'\n');
const checkpointPath = 'Tools/RotateLevelDesigner/research/20261013/ongoing-research-state.json';
const state = read(checkpointPath);
const batch = state.ingameRegeneration20261020;
assert.ok(batch);
batch.status = 'applied_ingame_and_unity_campaign_by_user_request';
batch.currentBatch = [];
batch.ingameUnchanged = false;
batch.lastUserInstruction = 'Replace current renamed Level XX packs in ingame and Unity campaign; explicitly include 12 and 14. No additional gameplay tests/solution search.';
batch.integration = {appliedAt:m.createdAt,slots:m.slots.map(p=>p.slot),evidence:manifestPath,editorEvidence:m.editorEvidence,campaignSlots:100,orderUnchanged:true,saveUnchanged:true,testsRun:false};
for (const entry of batch.delivered) {
 const p = m.slots.find(p=>p.slot===entry.level);
 if (!p) continue;
 entry.originalDeliverySha256 = entry.originalDeliverySha256 || entry.sha256;
 entry.sha256 = p.sourceSha256;
 entry.status = 'applied_to_ingame_campaign_by_user_request';
 entry.sourceModifiedSinceOriginalDelivery = entry.originalDeliverySha256 !== entry.sha256;
}
fs.writeFileSync(checkpointPath,JSON.stringify(state,null,1)+'\n');
const section = `\n\n## Áp dụng 8 level người dùng đã đổi tên vào Ingame và campaign Unity (20/10/2026)\n\nNgười dùng yêu cầu thay các bản đã đổi tên thành Level XX vào ingame và cập nhật campaign Unity, sau đó yêu cầu thêm level12 và14. Đã áp dụng đúng8 slot:8,10,12,14,16,18,19,20. Đây là quyền thay dữ liệu campaign tại các slot hiện có; không tự coi là nghiệm thu gameplay/độ khó. Checkout TURP-TheAnh/318cd3e90, không đổi nhánh.\n\nLấy nguyên bytes pack hiện tại trong levels/ (tên metadata cả8 file hiện là Level XX), gồm các chỉnh sửa người dùng sau lần bàn giao; không dùng hash/proof cũ làm chứng nhận cho bản đã sửa. Copy vào đúng tên pack ingame hiện có; Unity Level<ID>.json nhận nguyên cấu trúc pack.runtime, không rebake từ design.\n\n| Slot | Pack nguồn trong Tools/RotateLevelDesigner/levels | SHA256 pack hiện được áp dụng | Unity campaign |\n|---|---|---|---|\n${m.slots.map(p=>`| ${p.slot} | ${p.stem}.rrpack.json | ${p.sourceSha256} | Level${p.id}.json |`).join('\n')}\n\nĐã đọc lại:8 pack ingame khớp byte/hash nguồn;8 JSON Unity khớp runtime từng field. Giữ nguyên GUID/meta, toàn bộ bytes _Controllers.prefab, thứ tự100 slot,92 pack ingame khác và mọi file campaign ngoài8 JSON được thay. Campaign có155 asset,100 slot đang dùng và55 asset ngoài thứ tự; không thêm/xóa/đổi slot. Đồng bộ rr-campaign.js bằng CLI bundle-campaign sẵn có. Không sửa nguồn pack/design, core/app/constants/golden/gameplay/save/module/dependency, không commit/push/merge/upload/phát hành.\n\nUnity Editor đã tự Asset Pipeline refresh; Editor.log ghi đủ8 lần import hoàn tất với đúng GUID và artifact ID, lưu bằng chứng có chọn lọc tại ${m.editorEvidence}. Không gọi importer có bước tìm lời giải, không chạy thêm validate/solve/replay/gameplay test theo yêu cầu trước đó “không cần test”. Kiểm ở đợt này chỉ là copy/readback và xác nhận import asset. Log Editor còn lỗi Firebase XcodeProjectPatcher thiếu Google.IOSResolver/UnityEditor.iOS.Extensions.Xcode, đã xuất hiện trước đợt import này; không sửa SDK/dependency trong tác vụ level.\n\nBản sao bytes trước thay (8 pack,8 JSON,8 meta, prefab và bundle) tại ${m.backup}/. Chỉ mục áp dụng: ${manifestPath}; inventory/order trước thay: ${dir}/before.json. Checkpoint ingameRegeneration20261020 đã ghi trạng thái applied và giữ originalDeliverySha256 để đối chiếu lịch sử; không gắn approved/QA pass cho pack đã chỉnh.\n`;
fs.appendFileSync('Assets/Document/TURP_ProjectScan.md',section);
console.log(JSON.stringify({status:m.status,imports:imports.length,evidence:manifestPath,editorIssue:issue},null,2));
