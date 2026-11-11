const fs=require('fs'),path=require('path');
let s=fs.readFileSync(path.join(__dirname,'../20261021-levelgen-solution-audit/body-search.cjs'),'utf8');
s=s.replace('let explored=0,last=0,bestRemaining=Infinity;','let explored=0,last=0,bestRemaining=Infinity,bestMoves=[],bestState=null;');
s=s.replace('witness=immovableRingLock(root)','witness=null').replace('if(immovableRingLock(s))continue;','');
s=s.replace('bestRemaining=Math.min(bestRemaining,s.remaining());','if(s.remaining()<bestRemaining){bestRemaining=s.remaining();bestMoves=moves;bestState=s.saveState();}');
s=s.replace('open:open.length,bombsEnabled:bombs,diversify,','open:open.length,bombsEnabled:bombs,bestMoves,bestState,diversify,');
fs.writeFileSync(path.join(__dirname,'diagnostic-search.cjs'),s,{flag:'wx'});
