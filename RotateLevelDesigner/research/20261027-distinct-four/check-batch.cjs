'use strict';
const fs=require('fs'),path=require('path'),{Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const OUT=__dirname,RR=require('../../rr-core.js'),G=require('../pose-body-gesture-query.js'),{search}=require('../20261021-levelgen-solution-audit/body-search.cjs');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function latest(id){return fs.readdirSync(OUT).filter(f=>new RegExp('^A'+id+'-draft[0-9]+\\.rrdesign.json$').test(f)).sort().at(-1);}
if(!isMainThread){const file=latest(workerData),d=read(path.join(OUT,file)),level=RR.Design.toLevel(d).level,start=Date.now();
 const valid=RR.validate(level),analysis=RR.analyze(level);if(valid||analysis.error||analysis.warnings.length){parentPort.postMessage({id:workerData,file,error:valid||analysis.error||analysis.warnings});}
 else {const native=RR.Solver.find(level,{nodeLimit:20000,timeLimitSeconds:18,explodeBombs:true}),sim=new RR.Simulation(level,RR.Tuning.defaults()),moves=(native.moves||[]).map(m=>({part:sim.idOf(m.obj),target:m.target}));
 const replay=native.found?G.replay(level,moves,true,true):null;
 const body=replay?.ok?null:search(level,{seconds:35,nodes:80000});
 const route=replay?.ok?moves:body?.verified?body.moves:null;
 parentPort.postMessage({id:workerData,file,native:{found:native.found,nodes:native.nodes,seconds:native.seconds,log:native.log,moves},defaultFeel:route?G.replay(level,route,true,true):null,analytic:route?G.replay(level,route,true,false):null,moves:route,body:body&&{found:body.found,nodes:body.nodes,bestRemaining:body.bestRemaining,seconds:body.seconds,structuralWitness:body.structuralWitness},seconds:(Date.now()-start)/1000});}
}else if(require.main===module){const jobs=process.argv.slice(2).map(Number);if(!jobs.length)for(let i=251;i<=260;i++)jobs.push(i);let active=0;
 fs.writeFileSync(path.join(OUT,'check-pid-'+Date.now()+'.json'),JSON.stringify({pid:process.pid,slots:jobs,startedAt:new Date().toISOString()}));
 function pump(){while(active<3&&jobs.length){const id=jobs.shift(),w=new Worker(__filename,{workerData:id});active++;w.on('message',r=>{fs.writeFileSync(path.join(OUT,'A'+id+'-solution-'+Date.now()+'.json'),JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log('A'+id+' '+(r.defaultFeel?.ok?'VERIFIED':'HOLD')+' native='+r.native?.found+' '+JSON.stringify(r.error||r.body||{}));});w.on('error',e=>console.log('ERROR',id,e.stack));w.on('exit',()=>{active--;pump();});}}
 pump();}
