"use strict";
const fs=require("fs"),path=require("path"),{pathToFileURL}=require("url");
const {chromium}=require("C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const OUT=path.join(__dirname,"20261013");
(async()=>{
 const browser=await chromium.launch({executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true});
 try {
  const page=await browser.newPage({viewport:{width:540,height:720}});
  const m=JSON.parse(fs.readFileSync(path.join(OUT,"poc-manifest.json")));
  for(const s of m.selected){await page.goto(pathToFileURL(path.join(OUT,s.stem+".svg")).href);await page.screenshot({path:path.join(OUT,s.stem+".png")});}
  if(process.argv.includes("--test-gallery")) {
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto(pathToFileURL(path.join(OUT,"index.html")).href);
   const checks=[];
   for(let i=0;i<m.selected.length;i++) {
    await page.selectOption("#level",String(i));await page.check("#links");
    checks.push({level:i,initialParts:await page.locator("#board g[data-id]").count()});
    const count=await page.locator("#steps li").count();
    for(let step=0;step<count;step++)await page.click("#next");
    if(await page.locator("#state").textContent()!=="Hoàn thành")throw new Error("Replay did not finish level "+i);
    await page.click("#previous");await page.click("#start");
    const refs=await page.locator("#refs img").evaluateAll(images=>images.every(im=>im.complete&&im.naturalWidth>0));
    if(!refs)throw new Error("Reference image missing");
   }
   const overflow=[];
   for(const width of [320,390,1100]) {await page.setViewportSize({width,height:1000});overflow.push({width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});}
   if(errors.length||overflow.some(r=>r.overflow))throw new Error(JSON.stringify({errors,overflow}));
   await page.selectOption("#level","0");await page.uncheck("#links");
   await page.screenshot({path:path.join(OUT,"gallery-desktop.png"),fullPage:true});
   fs.writeFileSync(path.join(OUT,"gallery-tests.json"),JSON.stringify({passed:true,errors,checks,overflow,allReplaysFinish:true,allReferencesLoad:true},null,2));
   console.log("Gallery PASS: all replays, references, controls, 320/390/1100 widths");return;
  }
  // Native browser video decoder. Sample evidence only; no claim of full playback.
  const repo=path.resolve(__dirname,"../../.."), video=path.join(repo,"LevelTrainingData/TrainingLevel/video_20261011_185649_edit.mp4");
  await page.goto(pathToFileURL(video).href);
  await page.waitForFunction(()=>document.querySelector("video")?.readyState>=2,{timeout:15000});
  const meta=await page.evaluate(()=>{const v=document.querySelector("video");return {duration:v.duration,width:v.videoWidth,height:v.videoHeight};});
  const samples=[];
  if(!meta.width||!meta.height) {
   fs.writeFileSync(path.join(OUT,"video-samples.json"),JSON.stringify({source:path.relative(repo,video),...meta,samples,verified:false,error:"Native Edge decoder exposes duration but no video dimensions; no frames decoded."},null,2));
   console.log("rendered",m.selected.length,"SVG; video could not decode picture",meta);return;
  }
  for(const fraction of [0,.2,.4,.6,.8,.99]){
   const t=meta.duration*fraction;
   await page.evaluate(t=>new Promise(resolve=>{const v=document.querySelector("video");v.pause();v.onseeked=()=>resolve();v.currentTime=Math.max(.01,t);}),t);
   const data=await page.evaluate(()=>{const v=document.querySelector("video"),c=document.createElement("canvas");c.width=v.videoWidth;c.height=v.videoHeight;c.getContext("2d").drawImage(v,0,0);return c.toDataURL("image/png").split(",")[1];});
   const name="video-frame-"+samples.length+".png";fs.writeFileSync(path.join(OUT,name),Buffer.from(data,"base64"));samples.push({seconds:t,file:name});
  }
  fs.writeFileSync(path.join(OUT,"video-samples.json"),JSON.stringify({source:path.relative(repo,video),...meta,samples,method:"Six native-decoder samples; not a full transition trace."},null,2));
  console.log("rendered",m.selected.length,"SVG; video",meta);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
