'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{execFileSync}=require('child_process');
const OUT=__dirname,ROOT=path.resolve(OUT,'../../../..'),TOOL=path.join(ROOT,'Tools/RotateLevelDesigner'),R=require('../../rr-core.js'),G=require('../pose-body-gesture-query.js'),staticCheck=require('../20261021-gd-return-review/audit-static.cjs').check;
const sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),write=(f,x)=>fs.writeFileSync(path.join(OUT,f),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
async function main(slot){
 const resultPath=path.join(OUT,'A'+slot+'-delivery.json');if(fs.existsSync(resultPath)){console.log('Already exported A'+slot);return;}
 const candidateFiles=fs.readdirSync(OUT).filter(f=>new RegExp('^A'+slot+'-repair-(candidate|retry[0-9]+)\\.json$').test(f)).sort().reverse();
 const candidate=candidateFiles.map(f=>read(path.join(OUT,f))).find(r=>r.status==='verified_candidate');if(!candidate)return;
 const source=path.join(ROOT,'Tools/LevelGen',candidate.source),old=read(source);if(hash(source)!==candidate.sourceSha256)throw Error('Source changed');
 for(let i=0;i<8;i++){const next=JSON.parse(R.json.stringify(candidate.design));if(JSON.stringify(next)===JSON.stringify(candidate.design))break;candidate.design=next;}
 const d=JSON.parse(R.json.stringify(candidate.design)),notes='Sửa khóa cứng 21/10/2026 theo yêu cầu GD. Giữ toàn bộ vòng/thanh và bố cục nguồn; '+candidate.log.map(op=>op.kind+' '+op.host).join('; ')+'. Ý tưởng: mở đường bằng cửa chuyển động hiện có, Bom phá vật chặn khi cần rồi quay lại nguồn pin. Có route full-body/default-feel không Booster được lưu riêng; pack --no-solve, chưa Unity/device hoặc duyệt độ khó. Ghi chú nguồn lịch sử: '+(d.notes||'');d.notes=notes;d.author='Codex / GD repair';
 let revision=1;while(fs.existsSync(path.join(TOOL,'levels','A'+slot+'_20261021_fix-r'+String(revision).padStart(2,'0')+'.rrdesign.json')))revision++;
 const stem='A'+slot+'_20261021_fix-r'+String(revision).padStart(2,'0'),dp=path.join(TOOL,'levels',stem+'.rrdesign.json'),pp=path.join(TOOL,'levels',stem+'.rrpack.json');
 if(fs.existsSync(dp)||fs.existsSync(pp))throw Error('Revision exists '+stem);
 fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
 const cli=(args)=>execFileSync(process.execPath,[path.join(TOOL,'rr-cli.js'),...args],{encoding:'utf8',timeout:90000});
 const designValidate=cli(['validate',dp]);cli(['pack',dp,'-o',pp,'--author',d.author,'--no-solve']);const packValidate=cli(['validate',pp]);
 const p=read(pp),checks=staticCheck(pp,source);write(stem+'-static-checks.json',checks);if(!checks.ok)throw Error('Static hold '+slot+': '+checks.errors.map(e=>e.code).join(','));
 const rebuilt=JSON.parse(R.json.stringify(R.Design.toLevel(p.design).level));if(JSON.stringify(rebuilt)!==JSON.stringify(p.runtime))throw Error('Roundtrip mismatch');
 const moves=candidate.proof.moves,proof=G.replay(p.runtime,moves,true,true),analytic=G.replay(p.runtime,moves,true,false);if(!proof.ok)throw Error('Serialized replay failed');
 const b=R.Design.toLevel(d),s=new R.Simulation(p.runtime,R.Tuning.defaults()),mounts=[];
 for(const h of [...d.rings,...d.sticks])if(h.bomb){const original=[...old.design.rings,...old.design.sticks].find(x=>x.id===h.id);if(JSON.stringify(original.bomb)===JSON.stringify(h.bomb))continue;
  const sdf=G.bodySdf(s,s.indexOf(b.ids[h.id]),h.bomb);mounts.push({host:h.id,sdf});if(sdf>1e-5)throw Error('New bomb not mounted on host material '+h.id);
 }
 const bombEvents=proof.trace.flatMap(t=>t.events||[]),ablations=[];
 for(const op of candidate.log.filter(x=>x.kind==='add_bomb'||x.kind==='move_bomb')){
  const ab=structuredClone(d),host=[...ab.rings,...ab.sticks].find(x=>x.id===op.host),oldHost=[...old.design.rings,...old.design.sticks].find(x=>x.id===op.host);if(oldHost.bomb)host.bomb=oldHost.bomb;else delete host.bomb;
  const a=G.replay(R.Design.toLevel(ab).level,moves,true,true);ablations.push({host:op.host,sameRouteSolved:a.ok,remaining:a.trace.at(-1)?.remaining,scope:'Same full pointer route with just this bomb reverted; not exhaustive alternative-solution proof.'});
  if(a.ok)throw Error('Bomb not necessary for stored route '+op.host);
 }
 let native;if(process.argv.includes('--saved-route-only'))native={found:null,skipped:true,reason:'Only finish export and replay the already saved solution; do not restart search after stop.'};else try{native={found:true,output:cli(['solve',pp,'--nodes','50000','--time','20','--json'])};}catch(e){native={found:false,output:e.stdout?.toString(),error:e.message};}
 write(stem+'-native-solve.json',native);
 // The source camera is shared with revision, monochrome and significant post-explosion poses.
 const sw=R.World.build(old.runtime,{lenient:true}),nw=R.World.build(p.runtime,{lenient:true}),a=R.Render.bounds(sw),z=R.Render.bounds(nw),view=R.Render.pad({xMin:Math.min(a.xMin,z.xMin),yMin:Math.min(a.yMin,z.yMin),xMax:Math.max(a.xMax,z.xMax),yMax:Math.max(a.yMax,z.yMax)},1.6);
 async function render(world,level,name,title,mono=false){const svg=R.Render.render({world,level,view,width:420,labels:true,title});fs.writeFileSync(path.join(OUT,name+'.svg'),svg,{flag:'wx'});let img=sharp(Buffer.from(svg));if(mono)img=img.grayscale();await img.png().toFile(path.join(OUT,name+'.png'));}
 const imageStem=fs.existsSync(path.join(OUT,'A'+slot+'-before.svg'))?stem:'A'+slot;
 await render(sw,old.runtime,imageStem+'-before','A'+slot+' source');await render(nw,p.runtime,imageStem+'-after','A'+slot+' repair');await render(nw,p.runtime,imageStem+'-mono','A'+slot+' mono',true);
 const t=R.Tuning.defaults();t.explodeBombs=true;const phaseSim=new R.Simulation(p.runtime,t);let frame=0;
 for(let i=0;i<moves.length;i++){const m=moves[i],o=phaseSim.indexOf(m.part);if(phaseSim.isSolved(o))continue;const pts=G.selectableBody(phaseSim,o),grab=pts[Math.floor(pts.length/2)];if(!grab||phaseSim.isMovementLocked(o))throw Error('Phase replay mismatch');const event=G.release.apply(phaseSim,o,m.target,grab);if(event.events?.length||i===Math.floor(moves.length/2)){if(frame<4)await render(phaseSim.world,p.runtime,imageStem+'-phase-'+(++frame),'A'+slot+' step '+(i+1));}}
 write('A'+slot+'-delivery.json',{slot,stem,source:candidate.source,sourceSha256:candidate.sourceSha256,design:path.relative(ROOT,dp).replaceAll('\\','/'),pack:path.relative(ROOT,pp).replaceAll('\\','/'),designSha256:hash(dp),packSha256:hash(pp),edits:candidate.log,designValidate,packValidate,staticPass:true,roundtrip:true,defaultFeelVerified:proof.ok,analyticSameRouteVerified:analytic.ok,nativeSolveFound:native.found,moves,bombEvents,bombMounts:mounts,ablations,defaultFeel:proof,analytic,sourceBodyCounts:{rings:old.design.rings.length,sticks:old.design.sticks.length},revisedBodyCounts:{rings:d.rings.length,sticks:d.sticks.length},status:native.found?'ready_for_visual_review':'research_hold_native_not_found'});
 console.log('EXPORTED A'+slot+' '+moves.length+' gestures, bomb events '+bombEvents.length+', native '+native.found);
}
(async()=>{for(const slot of process.argv.slice(2).filter(x=>!x.startsWith('--')).map(Number))try{await main(slot);}catch(e){write('A'+slot+'-export-error-'+Date.now()+'.json',{error:e.stack});console.log('HOLD A'+slot+' '+e.message);}})();
