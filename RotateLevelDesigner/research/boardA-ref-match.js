"use strict";
// Research-only: match Board A 51–100 reference counts/graph to TURPLevel source designs (read-only).
const fs=require('fs'),path=require('path'),RR=require('../rr-core.js');
const SRC='C:/Project Folder/TURPLevel/LevelVariants/sources',ref=require('./20261016-boardA-ref-51/boardA-51-100.json');
const prof={};
for(const f of fs.readdirSync(SRC).filter(f=>f.endsWith('.rrdesign.json'))){const d=JSON.parse(fs.readFileSync(path.join(SRC,f),'utf8'));const id=f.match(/Level(\d+)/)[1];
 const rings=d.rings||[],sticks=d.sticks||[];let pins=0,rr=0,stops=0,bombs=0;for(const r of rings){pins+=(r.pins||[]).length;stops+=(r.stops||[]).length;if(r.bomb)bombs++;}for(const s of sticks)if(s.bomb)bombs++;
 const deg=rings.map(()=>0);
 prof[id]={rings:rings.length,closed:rings.filter(r=>r.gap===0).length,pins,stops,sticks:sticks.length,guides:sticks.reduce((a,s)=>a+(s.guides||[]).length,0),bombs};}
const used=new Set(require('C:/Project Folder/TURPLevel/LevelVariants/selection_active.json').map(x=>x.source));
const rows=[];
for(const l of ref.levels){const c=l.board_A.counts,cl=(l.board_A.closed_rings||[]).length;
 const cands=Object.entries(prof).filter(([id,p])=>p.rings===c.rings&&p.sticks===c.slide_bars&&p.closed===cl&&p.stops===c.stop_pins&&p.bombs===c.bombs).map(([id,p])=>({id,pins:p.pins,guides:p.guides,used:used.has(id)}));
 const exact=cands.filter(x=>x.pins===c.blocking_pins&&x.guides===c.clamps);
 rows.push({level:l.level,counts:c,closed:cl,exact:exact.map(x=>x.id),near:cands.filter(x=>!exact.includes(x)).map(x=>x.id+'(p'+x.pins+',g'+x.guides+')')});}
fs.writeFileSync(path.join(__dirname,'20261016-boardA-ref-51','match.json'),JSON.stringify({scope:'counts match only (rings, bars, closed, stops, bombs; exact also pins/clamps); no geometry/graph proof',rows},null,1));
for(const r of rows)console.log(r.level,'exact',r.exact.join(',')||'-','near',r.near.slice(0,4).join(',')||'-');
