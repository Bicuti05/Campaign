"use strict";
const fs=require('fs'),path=require('path'),{api,RR,OUT,ROOT,write}=require('./turp-continue'),pose=require('./pose-body-gesture-query'),q=require('./gen/rr-qualify');
const jobs=[['10014','05','A014'],['10013','04','A015']];
for(const [id,rev,slot]of jobs){
 const d=JSON.parse(fs.readFileSync(path.join(OUT,id+'-manual-r'+rev+'.rrdesign.json'))),raw=JSON.parse(fs.readFileSync(path.join(OUT,id+'-manual-r'+rev+'-routes.json'))).attempts.find(x=>x.analytic.ok&&x.default.ok);
 const baked=RR.Design.toLevel(d),labels=Object.fromEntries(Object.entries(baked.ids).map(([a,b])=>[b,a]));
 const moves=raw.moves.map(m=>({...m,part:labels[m.part]}));
 for(const r of d.rings)for(const p of r.pins||[]){p.target=p.targets[0];delete p.targets;}
 d.name=slot+' — '+(id==='10014'?'Bậc L và nguồn trở lại':'Cửa mở trước và cánh L')+' / TURP r01';
 d.notes+=' Đã bỏ các thanh không tạo khác biệt trong đối chứng đường giải; bản cuối '+d.rings.length+' vòng/'+d.sticks.length+' thanh. Vai trò, hình học và phép so mô hình xem research/20261015-turp-continuation-01. Trạng thái đề xuất, chưa GD duyệt.';
 const stem='turp-'+slot+'-'+id+'-outline-r01';write(stem+'.rrdesign.json',d);
 const probes=d.sticks.flatMap(s=>{const m=moves.filter(x=>x.part!==s.id);return m.map((_,i)=>m.slice(0,i+1));});
 const p=q.qualify(d,{moves,probes});write(stem+'-qualification.json',p);
 const src=api.loadDesign(ROOT+'/LevelVariants/sources/Level'+id+'.rrdesign.json');
 const before=api.planProfile(api.build(src),20),after=api.planProfile(api.build(d),20);
 const compare={before,after,metricScope:'TURP local next-removal BFS proxy, feel disabled and early release; not a human difficulty certificate or full UI proof',pass:before.done&&after.done&&Math.abs(before.maxDepth-after.maxDepth)<=2&&Math.abs(before.drags-after.drags)<=.6*before.drags,removedRings:id==='10014'?['R13','R14']:['R4','R6'],removedRedundantBars:id==='10014'?['S1','S2','S3']:['S2','S3','S5','S8'],newBar:id==='10014'?'S6':'S9',sourceToVariantRewire:'R2->R1 reversed to R1->R2',view:'horizontal flip followed by 180 degrees, equivalent to vertical mirror; no oblique rotation',strictOverlap:api.OVL.check(d)};
 write(stem+'-comparison.json',compare);
 console.log(JSON.stringify({stem,ok:p.ok,status:p.status,error:p.error,failedRoles:p.roles?.rows.filter(x=>!x.ok).map(x=>x.kind+':'+x.label),comparison:{before:before.drags,after:after.drags,depth:[before.maxDepth,after.maxDepth],pass:compare.pass},colors:[...new Set([...d.rings,...d.sticks].map(x=>x.color))]}));
}
