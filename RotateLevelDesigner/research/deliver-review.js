"use strict";
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js");
const OUT=path.join(__dirname,"20261013"), levels=path.resolve(__dirname,"../levels"), repo=path.resolve(__dirname,"../../..");
const manifest=JSON.parse(fs.readFileSync(path.join(OUT,"poc-manifest.json"))),unity=JSON.parse(fs.readFileSync(path.join(OUT,"unity-verification.json"))),audit=JSON.parse(fs.readFileSync(path.join(OUT,"reference-audit.json")));
const items=[];
for(const s of manifest.selected){
 const u=unity.results.find(r=>r.stem===s.stem);if(!u||u.importVerdict!=="Pass"||!u.physicsFeelVerified)throw new Error(s.stem+": no verified result");
 const p=JSON.parse(fs.readFileSync(path.join(OUT,s.stem+".rrpack.json"))),name="study-20261013-"+s.stem.replace(/^poc-/,"");
 for(const ext of [".rrdesign.json",".rrpack.json"]){
  const source=path.join(OUT,s.stem+ext),dest=path.join(levels,name+ext);
  // Existing Designer saves are never overwritten. Exact prior output is safe to reuse.
  if(fs.existsSync(dest)){if(fs.readFileSync(source,"utf8")!==fs.readFileSync(dest,"utf8"))throw new Error("Existing output differs: "+dest);}
  else fs.copyFileSync(source,dest,fs.constants.COPYFILE_EXCL);
 }
 s.unity_verified=true;s.human_accepted=false;s.release_candidate=false;
 manifest.candidates.find(c=>c.stem===s.stem).unity_verified=true;
 const references=s.reference_ids.map(id=>{const r=audit.records.find(x=>x.reference_id===id);return {id,name:path.basename(r.source_image),url:path.relative(OUT,path.join(repo,r.source_image)).replace(/\\/g,"/")};});
 items.push({pack:p,manifest:s,unity:u,references,deliveredPack:"../../levels/"+name+".rrpack.json",deliveredDesign:"../../levels/"+name+".rrdesign.json"});
}
fs.writeFileSync(path.join(OUT,"poc-manifest.json"),JSON.stringify(manifest,null,2));
fs.writeFileSync(path.join(OUT,"review-data.js"),"window.RR_REVIEW="+JSON.stringify({items})+";\n");
console.log("Delivered",items.length,"new designs/packs; existing core/campaign untouched.");
