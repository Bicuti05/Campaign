'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root='C:/Project Folder/LevelGen',local=__dirname,backup=path.join(local,'prompt-revisions/20261020-batch10/backup');
assert.ok(fs.existsSync(path.join(root,'PACKAGE_MANIFEST.json')));
const changed=[];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function save(p,text){const dst=path.join(root,p);if(fs.existsSync(dst)){const old=path.join(backup,p);fs.mkdirSync(path.dirname(old),{recursive:true});if(!fs.existsSync(old))fs.copyFileSync(dst,old,fs.constants.COPYFILE_EXCL);}fs.mkdirSync(path.dirname(dst),{recursive:true});fs.writeFileSync(dst,text);changed.push(p);}
function edit(p,changes){const original=path.join(backup,p);let text=fs.existsSync(original)?fs.readFileSync(original,'utf8'):read(p);for(const [from,to]of changes){assert.ok(text.includes(from),'Missing replacement in '+p+': '+from);text=text.replace(from,to);}save(p,text);}
const scheduling=`# Tự đặt lịch tiếp tục — batch10, logical slots101–200

Quyết định20/10/2026: mỗi lượt sinh10 level, sau khi xuất xong tự schedule lượt gen tiếp theo; không cần GD bật lại từng đợt. Đây là quyền cho AI thực thi prompt trên máy GD. Việc đóng gói/sửa prompt không tạo lịch tại máy người soạn.

## Cách thực hiện khi AI đang làm việc

1. Đọc checkpoint và feedback mới trước mỗi lượt. Lần đầu101–110, sau đó111–120…191–200. Giữ pendingReview riêng; chưa review không chặn tự gen batch mới và cũng không đồng nghĩa approved. Feedback GD đến giữa chừng phải được áp dụng trước phần phụ thuộc. Không tìm lời giải.
2. Sau khi xuất batch, ghi đủ stem/hash/ảnh/checks/giới hạn, pendingReview, currentBatch/nextSlot. Chỉ các bản đạt gate được gọi là bản giao; giữ phần chưa xong và hold trong checkpoint, không giảm kiểm để đủ10.
3. Nếu còn việc độc lập được phép làm trong101–200 và GD chưa yêu cầu dừng/tạm dừng, dùng **công cụ scheduler thật của nền tảng AI** để tạo hoặc cập nhật một lịch tiếp tục gắn với cuộc trò chuyện/workspace này. Với Codex, ưu tiên heartbeat của thread hiện tại; không tự tạo task/thread mới hay dùng cron standalone làm đường vòng. Với nền tảng khác dùng khả năng lịch tương đương theo quy tắc của nền tảng đó.
4. Mặc định yêu cầu lượt tiếp theo sau khoảng15phút, không coi là ETA hoàn thành batch; dùng cùng lịch định kỳ15phút nếu nền tảng hỗ trợ heartbeat, tái sử dụng ID và chỉ cập nhật một lịch. Không tạo job trùng sau mỗi lượt. Không chạy chồng: nếu lượt trước còn chạy, giữ lượt đó; scheduler và thread phải tuần tự, không spawn các phiên cùng ghi checkpoint. Không dùng lệnh sleep dài/while vô hạn để giả lịch.
5. Nội dung lịch là toàn bộ prompt trong prompts/SCHEDULED_RUN.md, thêm đường dẫn workspace thực tế và nhắc phải đọc checkpoint mới trước mọi lượt. Khi GD đổi lịch, lưu cả trạng thái do scheduler trả về và quyết định của GD, không đoán nextRun. Không đưa mật khẩu/token vào prompt.
6. Chỉ ghi status=active và automationId/nextRunAt sau khi công cụ xác nhận tạo/cập nhật thành công. state/scheduler.json chỉ là bản ghi, bản thân file không chạy lịch. Nếu công cụ bị thiếu/không có quyền hoặc máy/app không đáp ứng điều kiện chạy nền: ghi unavailable/blocked, nêu lý do thật và hỏi GD thao tác cần thiết; không nói đã schedule. Không tự cài daemon/Task Scheduler hay dịch vụ hệ điều hành để lách giới hạn.
7. Chỉ thông báo khi có batch/revision mới, phát hiện đáng kể, lỗi/quota chặn hoặc cần GD hành động. Các lượt không có thay đổi không tạo báo cáo lặp. Không gửi tin cho người khác hoặc upload file.
8. Khi đã đủ101–200 được xuất hoặc chỉ còn phần thực sự phải chờ GD, ghi hoàn tất/chờ GD, dừng hoặc vô hiệu hóa đúng lịch đã tạo và xác nhận trạng thái trả về. Nếu GD yêu cầu dừng/tạm dừng thì làm ngay; không tự resume do thời gian trôi qua. Không gen quá200, không tự chuyển sang201.

## Lưu trạng thái

state/progress.json giữ batchSize10 và policy.autoContinue=true. state/scheduler.json giữ cadence15phút, automationId, nền tảng, status, nextRunAt (nếu công cụ cung cấp), lastResult, lý do chặn/tạm dừng. Không chứa giả định scheduler đã hoạt động khi mới giải nén bộ này.

Yêu cầu này thay quy tắc ban đầu “mỗi cặp2level rồi dừng chờ lệnh”. Giới hạn không solve/không auto-approve/không sửa engine/không ghi đè revision vẫn giữ.
`;
save('context/SCHEDULING.md',scheduling);
save('prompts/SCHEDULED_RUN.md',`Tiếp tục luồng LevelGen101–200 trong workspace đã gắn với lịch này. Đọc AGENTS.md, context/CURRENT_RULES.md, context/SCHEDULING.md, state/progress.json, state/scheduler.json và feedback/nhật ký mới nhất trước khi làm. Kiểm file/hash thực tế, hoàn tất batch đang dở trước; nếu không có batch dở thì sinh10 slot kế tiếp chưa giao trong101–200, tối đa đến200. Tiếp nối campaign1–100, tham khảo màn gốc và pattern/counterexample đã research, thay đổi bố cục/quan hệ có chủ đích; không tìm lời giải. Native validate design+pack, check hình học/màu/ngàm/pin/initialBom, --no-solve, proof:null, preview màu/mono/so nguồn cùng camera; không hạ gate để đủ số. Không sửa engine/campaign/nguồn, không ghi đè revision, không tự approved.\n\nGhi checkpoint/nhật ký và giao batch mới cùng giới hạn; không cần chờ GD review mới làm batch tiếp. Feedback đang có được ưu tiên; câu hỏi chỉ chặn phần phụ thuộc, tiếp tục phần độc lập được phép làm. Dùng công cụ scheduler thực tế để tái sử dụng/cập nhật duy nhất lịch gắn với thread hiện tại cho lượt sau khoảng15phút; không tạo job/task/thread trùng và không chạy chồng. Chỉ ghi lịch active sau xác nhận thật. Nếu thiếu công cụ lịch/quyền/điều kiện chạy nền, báo GD và ghi unavailable, không giả lịch. Nếu GD đã dừng/tạm dừng thì không gen tiếp. Khi hết phạm vi101–200 hoặc không còn phần độc lập có thể làm, cập nhật trạng thái và dừng/vô hiệu hóa lịch qua công cụ. Không gen201+. Chỉ thông báo khi có kết quả mới/phát hiện quan trọng/lỗi hoặc cần GD hành động.\n`);
edit('AGENTS.md',[
 ['và `state/progress.json` trước mỗi lượt.','và `context/SCHEDULING.md`, `state/progress.json`, `state/scheduler.json` trước mỗi lượt.'],
 ['tạo 101–200, mỗi lượt đúng 2 level rồi dừng cho GD kiểm.','tạo 101–200, mỗi lượt10 level rồi bàn giao batch; tự schedule lượt gen tiếp theo theo context/SCHEDULING.md.'],
 ['Không tự tiếp tục cặp sau khi GD chưa yêu cầu.','Không cần chờ GD review để sinh batch tiếp, nhưng mọi bản vẫn chờ GD duyệt; dừng/tạm dừng khi GD yêu cầu.'],
 ['cho hai slot.','cho10slot trong batch, tránh lặp khuôn giữa các màn.'],
 ['giao cặp và dừng.','giao batch10 và kết thúc lượt; nếu còn việc thì tạo/cập nhật lịch thật cho lượt tiếp theo.']
 ]);
edit('context/CURRENT_RULES.md',[[
 'Mỗi lượt hai proposal, không tự sang cặp mới.',
 'Mỗi lượt10proposal, tự đặt lịch tiếp tục batch sau theo context/SCHEDULING.md; không chờ GD review để gen tiếp, không tự approved. Khi GD dừng/tạm dừng hoặc hết phạm vi thì dừng lịch.'
 ]]);
edit('README.md',[
 ['AI chỉ sinh 101/102 rồi dừng. Sau khi xem và tự giải, dùng prompt trong `prompts/CONTINUE.md` hoặc `prompts/REVISE.md`.','AI sinh101–110 ở lượt đầu, sau đó dùng công cụ lịch thật của nền tảng để tự tiếp tục111–120…191–200, mặc định15phút giữa các lượt kích hoạt. GD vẫn tự giải/review; các bản chờ review không tự thành approved. Muốn điều chỉnh hoặc sửa, dùng `prompts/CONTINUE.md` hoặc `prompts/REVISE.md`. Chi tiết tại `context/SCHEDULING.md`.'],
 ['mỗi cặp 2 level.','mỗi đợt10level và tự schedule đợt tiếp theo.'],
 ['| `state/progress.json`, `work/` | Checkpoint mới 101–200, brief/ảnh/nhật ký GD |','| `state/progress.json`, `state/scheduler.json`, `work/` | Checkpoint101–200, trạng thái lịch thật sau khi được tạo, brief/ảnh/nhật ký GD |']
 ]);
edit('PROMPT_101_200.md',[
 ['context/KNOWN_LIMITS.md, state/progress.json.','context/KNOWN_LIMITS.md, context/SCHEDULING.md, state/progress.json, state/scheduler.json.'],
 ['liên quan tới cặp sắp sinh.','liên quan tới batch sắp sinh.'],
 ['Mỗi lượt chỉ làm2 level chưa giao tiếp theo rồi dừng cho GD kiểm; lượt đầu101/102. Chưa được tự sinh cả100 trong một lượt.','Mỗi lượt làm10level chưa giao tiếp theo, lượt đầu101–110, rồi111–120…191–200. Sau khi xuất batch và lưu checkpoint, tự tạo/cập nhật lịch thật để gen batch tiếp theo; không cần chờ GD review hoặc nhắc lại. Mặc định kích hoạt sau khoảng15phút bằng scheduler nền tảng; không tạo các lượt chạy chồng. Không làm cả100 trong cùng một lượt hoặc vượt200.'],
 ['Cặp hiện tại ở pendingReview; nextSlot trỏ cặp chưa làm kế tiếp, nhưng không được tiếp tục nếu chưa có yêu cầu GD.','Batch hiện tại ở pendingReview; nextSlot trỏ slot chưa giao kế tiếp. PendingReview không chặn lịch gen tiếp nhưng cũng không là approved. Đọc feedback mới trước mọi lượt.'],
 ['làm101/102 ngay;','làm101–110 ngay;'],
 ['phần độc lập của cặp. Dừng sau khi giao cặp để GD xem và tự giải.','phần độc lập trong batch. Sau khi giao batch, thực hiện lịch theo context/SCHEDULING.md bằng công cụ scheduler thật, tái sử dụng duy nhất một lịch gắn với cuộc trò chuyện/workspace. Với Codex dùng heartbeat; không tự mở task/thread mới. Ghi automationId/trạng thái/nextRunAt do công cụ trả về vào state/scheduler.json; chỉ nói đã đặt lịch sau khi công cụ xác nhận thành công. Nếu không có công cụ hoặc cần thao tác GD để bật chạy nền, ghi unavailable và hỏi GD, không dùng file JSON/sleep làm lịch giả. Khi đủ101–200, chỉ còn phần phải chờ GD, hoặc GD yêu cầu dừng/tạm dừng, dừng/vô hiệu hóa lịch và xác nhận. Quyền auto-gen không cho phép tự approved, upload hay giảm các gate chất lượng.']
 ]);
edit('context/WORKFLOW.md',[[
 'AI vẫn chịu trách nhiệm đọc ảnh, cập nhật checkpoint và giao cặp.',
 'AI vẫn chịu trách nhiệm đọc ảnh, cập nhật checkpoint và giao batch10. Sau khi giao, dùng scheduler thật để tiếp tục batch sau theo context/SCHEDULING.md; file checkpoint không tự chạy lịch. PendingReview không tự được approve và không chặn batch tiếp nếu chưa có yêu cầu dừng từ GD.'
 ]]);
edit('context/CONTEXT_FROM_CHAT.md',[[
 'Các prompt cũ nhắc lịch tự chạy/quota/nhánh/đường dẫn máy cũ không được kích hoạt trong bộ này. Không tự tạo automation, task khác hoặc nhắn cho người khác.',
 '11. Cập nhật tiếp20/10/2026: người dùng yêu cầu đổi sang10level mỗi lượt và tự schedule lượt gen tiếp. Quyết định này thay quy tắc batch2/dừng chờ lệnh ban đầu. Quyền tạo lịch hiện hành theo context/SCHEDULING.md, trên máy GD khi AI chạy prompt.\n\nCác lịch/quota/nhánh/đường dẫn từ chat cũ không được tự khôi phục. Chỉ tạo/tái sử dụng một lịch mới cho101–200 theo quyền vừa chốt; không tự tạo task/thread mới, nhắn người khác hoặc upload.'
 ]]);
edit('context/REFERENCE_INDEX.md',[
 ['và mục cuối `work/DELIVERY_LOG.md`.','và `state/scheduler.json`, `context/SCHEDULING.md`, mục cuối `work/DELIVERY_LOG.md`.'],
 ['cho cặp, đọc source design','cho batch10, đọc source design']
 ]);
save('prompts/CONTINUE.md',`Tiếp tục batch10level kế tiếp trong101–200 theo AGENTS.md, context/SCHEDULING.md và checkpoint mới nhất. Ưu tiên feedback hiện có; hoàn tất batch đang dở trước, không sinh trùng. Không tìm lời giải; validate/kiểm cấu trúc-hình học và pack --no-solve, xem ảnh màu/mono/so nguồn cùng tỷ lệ, ghi brief/giới hạn/checkpoint rồi bàn giao batch. Không tự approved. Sau khi giao, tự tái sử dụng/cập nhật một lịch thật gắn với thread/workspace cho lượt sau khoảng15phút; không chờ GD review và không tạo job trùng/chạy chồng. Nếu thiếu scheduler, báo rõ và ghi unavailable; nếu đã dừng/tạm dừng hoặc đủ200 thì không gen tiếp và dừng lịch.\n`);
save('prompts/RESUME.md',`Khôi phục luồng LevelGen101–200 theo AGENTS.md, context/CURRENT_RULES.md, context/SCHEDULING.md, state/progress.json, state/scheduler.json và nhật ký/feedback mới nhất. Đối chiếu file/hash thật, không dựa vào số slot lịch sử. Tóm tắt ngắn batch10 đang làm, pendingReview và slot tiếp. Tiếp tục batch dở hoặc10slot kế theo quyền auto-gen hiện hành; không chạy nếu GD đã dừng/tạm dừng. Không tìm lời giải, không sửa engine/campaign/nguồn, không ghi đè revision. Sau khi giao, kiểm lịch thật qua công cụ và tái sử dụng/cập nhật duy nhất một lịch cho lượt tiếp theo; không giả active bằng cách sửa JSON. Hết phạm vi200 thì dừng lịch.\n`);
edit('prompts/REVISE.md',[[
 'Chưa sinh slot khác nếu tôi chưa yêu cầu.',
 'Trong lượt sửa này chỉ sửa slot được yêu cầu; ghi feedback vào checkpoint để lịch tự gen kế tiếp không bỏ sót. Không coi yêu cầu sửa là lệnh dừng/tạm dừng lịch trừ khi tôi nói rõ. Các phần gen mới phụ thuộc feedback phải chờ được giải quyết; phần độc lập tiếp tục theo chính sách batch10.'
 ]]);
edit('work/DELIVERY_LOG.md',[[
 'Mỗi mục ghi slot/revision, nguồn/hash, ý tưởng, các gate đã kiểm, ảnh, giới hạn và feedback GD.',
 'Mỗi lượt10level; sau khi giao tự schedule lượt sau theo context/SCHEDULING.md. Mỗi mục ghi slot/revision, nguồn/hash, ý tưởng, các gate đã kiểm, ảnh, giới hạn, feedback GD và kết quả thao tác lịch thật.'
 ]]);
const progress=JSON.parse(read('state/progress.json'));
progress.updatedAtUtc=new Date().toISOString();progress.status=progress.delivered.length?progress.status:'ready_for_first_batch';progress.batchSize=10;
delete progress.policy.stopAfterEachPair;
Object.assign(progress.policy,{autoContinue:true,yieldAfterEachBatch:true,requireGdReviewBeforeNextBatch:false,autoScheduleNextBatch:true,autoApprove:false});
progress.scheduling={stateFile:'state/scheduler.json',instructions:'context/SCHEDULING.md',runPrompt:'prompts/SCHEDULED_RUN.md'};
save('state/progress.json',JSON.stringify(progress,null,2)+'\n');
save('state/scheduler.json',JSON.stringify({format:'levelgen-scheduler-state',version:1,status:'not_created',enabledByUser:true,createOn:'AI executing the prompt on GD machine after first batch',preferredKind:'current-thread heartbeat or equivalent native scheduler',intervalMinutes:15,automationId:null,platform:null,nextRunAt:null,lastResult:null,maxSlot:200,preventOverlappingRuns:true,reuseSingleSchedule:true,reviewDoesNotBlockGeneration:true,notes:'This JSON records scheduler state only. Editing the prompt bundle has not created any live automation.'},null,2)+'\n');
const sourcePath='PACKAGE_SOURCES.json',sources=JSON.parse(read(sourcePath));
sources.promptPolicyUpdates=sources.promptPolicyUpdates||[];
sources.promptPolicyUpdates.push({atUtc:new Date().toISOString(),request:'10 levels per batch; automatically schedule next generation on GD machine',liveAutomationCreated:false,changedFiles:[...changed],intervalMinutesDefault:15});
for(const f of sources.copied||[]){if(changed.includes(f.path)){f.sha256=hash(path.join(root,f.path));f.bytes=fs.statSync(path.join(root,f.path)).size;f.category='portable_active_files_batch10_update';}}
save(sourcePath,JSON.stringify(sources,null,2)+'\n');
const packageCheck=JSON.parse(read('PACKAGE_CHECK.json'));packageCheck.promptPolicy={updatedAtUtc:new Date().toISOString(),batchSize:10,autoSchedule:true,liveAutomationCreated:false};save('PACKAGE_CHECK.json',JSON.stringify(packageCheck,null,2)+'\n');
const manifestPath='PACKAGE_MANIFEST.json',oldManifest=JSON.parse(read(manifestPath));
fs.mkdirSync(path.dirname(path.join(backup,manifestPath)),{recursive:true});fs.copyFileSync(path.join(root,manifestPath),path.join(backup,manifestPath),fs.constants.COPYFILE_EXCL);
const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.git'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else{const rel=path.relative(root,p).replaceAll('\\','/');if(rel!=='PACKAGE_MANIFEST.json')files.push({path:rel,bytes:fs.statSync(p).size,sha256:hash(p)});}}}walk(root);
for(const f of oldManifest.files)if(!changed.includes(f.path))assert.equal(hash(path.join(root,f.path)),f.sha256,'Unexpected change outside prompt update '+f.path);
const manifest={...oldManifest,updatedAt:new Date().toISOString(),fileCount:files.length,totalBytes:files.reduce((a,x)=>a+x.bytes,0),files:files.sort((a,b)=>a.path.localeCompare(b.path))};fs.writeFileSync(path.join(root,manifestPath),JSON.stringify(manifest,null,2)+'\n');
const result={atUtc:new Date().toISOString(),root,changedFiles:changed,batchSize:10,firstBatch:[101,110],autoSchedule:true,intervalMinutes:15,liveAutomationCreated:false,manifestSha256:hash(path.join(root,manifestPath)),files:files.length+1,totalBytes:manifest.totalBytes+fs.statSync(path.join(root,manifestPath)).size};
fs.writeFileSync(path.join(local,'batch10-update-result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result,null,2));
