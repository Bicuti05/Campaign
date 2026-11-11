const fs=require('fs'),path=require('path'),{Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
if(!isMainThread){process.env.REPAIR_RETRY='1';const {repair}=require('./repair-batch.cjs');parentPort.postMessage({type:'result',result:repair(workerData)});}
else {const rows=read(path.resolve(__dirname,'../../../..','Tools/LevelGen/IMPORT_MANIFEST.json')).rows,slots=process.argv.slice(2).map(Number);let active=0;
 function pump(){while(slots.length&&active<2){const slot=slots.shift(),w=new Worker(__filename,{workerData:rows.find(x=>x.slot===slot)});active++;let result;
 w.on('message',x=>{if(x.type==='result')result=x.result;else if(x.scanned%70===0)console.log(JSON.stringify(x));});w.on('error',e=>console.log('ERROR',slot,e.message));w.on('exit',()=>{active--;if(result){fs.writeFileSync(path.join(__dirname,'A'+slot+'-repair-retry1.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(slot,result.status,result.log);}pump();});}}
 pump();}
