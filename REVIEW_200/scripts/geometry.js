const RR=require('../../RotateLevelDesigner/rr-core.js'),rad=Math.PI/180;
function segments(s){let p=s.path;if(!p){p=RR.Builder.stickPath(s.shape||'straight',s.length??RR.C.authoring.STICK_DEFAULT_LENGTH,s.arm??RR.C.authoring.STICK_DEFAULT_ARM).map(p=>Array.isArray(p)?p:[p.x,p.y]);}const a=(s.angle||0)*rad,c=Math.cos(a),sn=Math.sin(a),v=p.map(([x,y])=>({x:s.x+x*c-y*sn,y:s.y+x*sn+y*c}));return v.slice(1).map((b,i)=>({a:v[i],b}));}
function pointDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
function warningCount(a){return a.warnings.reduce((v,w)=>(v[w.code]=(v[w.code]||0)+1,v),{});}
function fitPins(old,d){const oldR=new Map(old.rings.map(r=>[r.id,r])),newR=new Map(d.rings.map(r=>[r.id,r])),oldS=new Map((old.sticks||[]).map(s=>[s.id,s])),newS=new Map((d.sticks||[]).map(s=>[s.id,s]));for(const r of d.rings){const o=oldR.get(r.id);for(let i=0;i<(r.pins||[]).length;i++){const pin=r.pins[i],op=o.pins[i],id=(pin.targets||[pin.target])[0];if(!id)continue;let target;
 if(newR.has(id)){const ot=oldR.get(id),nt=newR.get(id),a=op.angle*rad,dist=op.inner?(o.radius??1.75)-.25-(op.length??.8354):(o.radius??1.75)+.25+(op.length??.8354),oldHead={x:o.x+Math.cos(a)*dist,y:o.y+Math.sin(a)*dist};const dx=oldHead.x-ot.x,dy=oldHead.y-ot.y,len=Math.hypot(dx,dy)||1;target={x:nt.x+dx/len*(nt.radius??1.75),y:nt.y+dy/len*(nt.radius??1.75)};
 }else if(newS.has(id)){const os=segments(oldS.get(id)),ns=segments(newS.get(id)),a=op.angle*rad,dist=op.inner?(o.radius??1.75)-.25-(op.length??.8354):(o.radius??1.75)+.25+(op.length??.8354),head={x:o.x+Math.cos(a)*dist,y:o.y+Math.sin(a)*dist};let k=0;for(let j=1;j<os.length;j++)if(pointDistance(head,os[j].a,os[j].b)<pointDistance(head,os[k].a,os[k].b))k=j;const {a:p,b:q}=ns[k],dx=q.x-p.x,dy=q.y-p.y,t=Math.max(0,Math.min(1,((r.x-p.x)*dx+(r.y-p.y)*dy)/(dx*dx+dy*dy)));target={x:p.x+t*dx,y:p.y+t*dy};}
 if(target){const dx=target.x-r.x,dy=target.y-r.y,dist=Math.hypot(dx,dy);pin.angle=Math.atan2(dy,dx)/rad;pin.length=pin.inner?(r.radius??1.75)-.25-dist:dist-(r.radius??1.75)-.25;}
 }} }

module.exports={fitPins,segments};
