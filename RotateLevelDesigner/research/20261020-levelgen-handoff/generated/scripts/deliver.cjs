'use strict';
const C=require('./common.cjs'),{check}=require('./check-level.cjs'),{preview}=require('./preview.cjs'),cp=require('child_process');
const {fs,path,TOOL,RR}=C;
async function deliver(){
 const input=C.args[0],slot=Number(C.opt('--slot')),rev=C.opt('--rev','r01'),briefPath=C.opt('--brief'),source=C.opt('--source');
 if(!input||!Number.isInteger(slot)||slot<101||slot>200||!/^r\d{2,}$/.test(rev)||!briefPath)throw Error('Usage: node scripts/deliver.cjs design --slot 101 --rev r01 --brief brief.json [--source file]');
 const d=C.read(input),brief=C.read(briefPath);
 if(d.format!=='turp-design')throw Error('Input must be an authoring design, not runtime/pack.');
 if(brief.slot!==slot||brief.solutionSearch!==false||!brief.idea||!Array.isArray(brief.roles)||!brief.limitations?.length)throw Error('Complete brief: matching slot, idea, roles, limitations, solutionSearch:false.');
 if(d.levelId!==String(slot)||!d.notes||!d.name)throw Error('Set design levelId to logical slot, name and explicit notes before delivery.');
 const stem='A'+slot+'_'+C.date()+'_'+rev,folder=path.join(C.ROOT,'work',String(slot),stem),dp=path.join(TOOL,'levels',stem+'.rrdesign.json'),pp=path.join(TOOL,'levels',stem+'.rrpack.json');
 if([folder,dp,pp].some(p=>fs.existsSync(p)))throw Error('Output already exists. Preserve saved revision; choose a new rev.');
 const first=check(input,source);if(!first.ok)throw Error('Static checks failed: '+JSON.stringify(first.errors));
 fs.mkdirSync(folder,{recursive:true});C.writeNew(path.join(folder,'checks-design.json'),first);
 C.writeNew(path.join(folder,'brief.json'),brief);C.writeNew(dp,d);
 const cli=(...args)=>cp.execFileSync(process.execPath,[path.join(TOOL,'rr-cli.js'),...args],{encoding:'utf8'}).trim();
 const nativeDesign=cli('validate',dp),packed=cli('pack',dp,'-o',pp,'--no-solve'),nativePack=cli('validate',pp);
 const pack=C.read(pp);if(pack.proof!==null)throw Error('Expected proof:null');
 const final=check(pp,source);C.writeNew(path.join(folder,'checks-pack.json'),final);
 if(!final.ok)throw Error('Final pack held as research: '+JSON.stringify(final.errors));
 const images=await preview(pp,{source,out:path.join(folder,'preview')});
 const delivery={slot,stem,status:'proposal_pending_GD_review',design:C.rel(dp),pack:C.rel(pp),sha256:C.sha(pp),designSha256:C.sha(dp),source:source?{path:C.rel(source),sha256:C.sha(source)}:null,brief:C.rel(path.join(folder,'brief.json')),checks:C.rel(path.join(folder,'checks-pack.json')),nativeDesign,nativePack,packCommand:'native pack --no-solve',solutionSearch:false,proof:null,images,limitations:brief.limitations,checkpointUpdateRequired:true};
 C.writeNew(path.join(folder,'delivery.json'),delivery);console.log(JSON.stringify(delivery,null,2));
}
deliver().catch(e=>{console.error(e.message);process.exitCode=1;});
