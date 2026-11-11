const fs=require('fs'),path=require('path'),R=require('../../rr-core.js'),{search}=require('./diagnostic-search.cjs');
const root=path.resolve(__dirname,'../../../..'),m=JSON.parse(fs.readFileSync(path.join(root,'Tools/LevelGen/IMPORT_MANIFEST.json'))).rows.find(x=>x.slot===Number(process.argv[2]||155));
const original=JSON.parse(fs.readFileSync(path.join(root,'Tools/LevelGen',m.pack))).design;
for(const hostId of (process.argv[3]?[process.argv[3]]:original.rings.filter(r=>!(r.pins||[]).length).map(r=>r.id))){
 for(let angle=0;angle<360;angle+=30){const d=structuredClone(original),h=d.rings.find(r=>r.id===hostId);if(h.bomb)continue;h.bomb={x:h.x+h.radius*Math.cos(angle*Math.PI/180),y:h.y+h.radius*Math.sin(angle*Math.PI/180)};
 const b=R.Design.toLevel(d),a=R.analyze(b.level);if(a.error||a.warnings.length)continue;
 const s=new R.Simulation(b.level,R.Tuning.defaults());if(Array.from({length:s.objectCount()},(_,o)=>R.W.bombSweep(s.world,o,s.isStick(o)?s.offsetOf(o):s.angleOf(o),s.isStick(o)?s.offsetOf(o):s.angleOf(o)).contact).some(Boolean))continue;
 const r=search(b.level,{seconds:4,nodes:22000});console.log(hostId,angle,r.found,r.bestRemaining);
 fs.writeFileSync(path.join(__dirname,'A'+m.slot+'-bomb-'+hostId+'-'+angle+'.json'),JSON.stringify({design:d,...r},null,2),{flag:'wx'});
 if(r.verified)process.exit(0);
 }
}
