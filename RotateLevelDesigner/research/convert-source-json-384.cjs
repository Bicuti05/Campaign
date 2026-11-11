'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'../../..'),TOOL=path.join(ROOT,'Tools/RotateLevelDesigner');
const SOURCE='C:/Users/ADMIN/Downloads/level_data.json',OUT=path.join(TOOL,'reference-converted-379');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const source=JSON.parse(fs.readFileSync(SOURCE,'utf8'));
fs.mkdirSync(OUT,{recursive:true});
function yaw(rot){
  const x=rot?.[0]||0,y=rot?.[1]||0,z=rot?.[2]||0;
  if(Math.abs(x)>1e-5||Math.abs(y)>1e-5||Math.abs(z)>1+1e-5)throw Error('Non-planar or invalid truncated quaternion: '+JSON.stringify(rot));
  const zz=Math.max(-1,Math.min(1,z)),w=Math.sqrt(Math.max(0,1-zz*zz));
  return 2*Math.atan2(zz,w)*180/Math.PI;
}
function ringNo(p){const m=String(p||'').match(/Ring_ring_(\d+)/);return m?Number(m[1]):null;}
const records=[];
for(const [sourceId,l] of Object.entries(source)){
  if(!Array.isArray(l.rings)||!l.rings.length)continue;
  const ringByNo=new Map(l.rings.map(r=>[ringNo(r.path),r]));
  const pins=new Map(l.rings.map(r=>[ringNo(r.path),[]]));
  for(const o of l.others||[]){
    if(!String(o.feature||'').startsWith('attachment.pin_'))continue;
    const owner=ringNo(o.path),base=ringByNo.get(owner),pos=o.pos;
    if(!base||!Array.isArray(pos)||pos.length<2)continue;
    const theta=yaw(base.rot),local=Math.atan2(pos[1],pos[0])*180/Math.PI;
    const angle=theta+local,dist=Math.hypot(pos[0],pos[1]);
    pins.get(owner).push({id:o.feature,angle,length:Math.max(.2,dist-(base.radius||1.75)),targets:[]});
  }
  const rings=l.rings.map((r,i)=>({id:'R'+(ringNo(r.path)??i+1),x:r.pos?.[0]||0,y:r.pos?.[1]||0,
    radius:r.radius||1.75,gap:r.gapAngle||0,gapDir:(r.gapDir||0)+yaw(r.rot),pins:pins.get(ringNo(r.path))||[]}));
  const d={format:'turp-design',version:1,levelId:String(sourceId),name:'Source reference '+sourceId,
    author:'Converted from Downloads/level_data.json',notes:'Lossy visual/reference conversion. Source lacks pin target IDs (ringLinks is only a count), sticks, guides, stops, bombs, colors and lockCount. Pins are retained as unlinked blockers; inspect against original source before gameplay use.',rings,sticks:[],bombs:[]};
  const file='Level'+sourceId+'.rrdesign.json';
  const dest=path.join(OUT,file),text=JSON.stringify(d,null,2)+'\n';
  if(fs.existsSync(dest)){if(fs.readFileSync(dest,'utf8')!==text)throw Error('Existing output differs; refusing to overwrite: '+dest);}
  else fs.writeFileSync(dest,text,{flag:'wx'});
  records.push({sourceId:Number(sourceId),file,sourceRingCount:l.rings.length,sourceRingLinks:l.info?.ringLinks??null,sourceGuideLinks:l.info?.guideLinks??null,convertedPins:rings.reduce((n,r)=>n+r.pins.length,0)});
}
if(records.length!==379)throw Error('Expected 379 ring-bearing levels; got '+records.length);
console.log(JSON.stringify({out:OUT,converted:records.length,excluded:Object.values(source).filter(l=>!l.rings?.length).length,sourceSha256:sha(SOURCE)},null,2));
