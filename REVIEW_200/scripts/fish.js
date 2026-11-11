const RR=require('../../RotateLevelDesigner/rr-core.js');
function selectFish(level,pos,exclude=new Set()){
 for(const p of level.parts)delete p.canCollect;
 if(pos<11)return [];
 const w=RR.World.build(level,{lenient:true}),options=RR.Fish.candidates(level).filter(f=>!exclude.has(f.id)),chosen=[];
 // Exhaust each tier before considering the next; alignment is only a tie-breaker.
 for(let tier=0;tier<=3&&chosen.length<3;tier++){
 let pool=options.filter(f=>f.tier===tier);
 while(pool.length&&chosen.length<3){pool.sort((a,b)=>alignment(a)-alignment(b));const f=pool.shift(),c=w.rings.find(r=>r.id===f.id).center;if(chosen.some(g=>{const q=w.rings.find(r=>r.id===g.id).center;return Math.hypot(c.x-q.x,c.y-q.y)<2*RR.Fish.CLEAR_RADIUS;}))continue;chosen.push(f);}
 }
 function alignment(f){const c=w.rings.find(r=>r.id===f.id).center;return chosen.reduce((v,g)=>{const q=w.rings.find(r=>r.id===g.id).center;return v+(Math.abs(q.x-c.x)<.3||Math.abs(q.y-c.y)<.3?1:0);},0);}
 for(const p of level.parts)if(chosen.some(f=>f.id===p.partId))p.canCollect=true;
 return chosen;
}

module.exports=selectFish;
