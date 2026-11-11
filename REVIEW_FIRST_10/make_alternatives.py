from pathlib import Path
import json,subprocess,base64,shutil,xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright
out=Path(__file__).resolve().parent;root=out.parent;tool=root/'RotateLevelDesigner';(out/'alternatives').mkdir(exist_ok=True)
files=[('p050_original','P050 gốc · con gà 3 vòng','Nguồn cũ trong mục không được xếp; giữ để đối chiếu kích thước.',tool/'ingame/Level050.rrpack.json'),('p050_size3','P050 chỉnh cỡ · bản GD đã chọn','Giữ đúng3 vòng của con gà; ngoại lệ so với target #10 là6.',tool/'levels/CampaignReview010_P050_r01.rrpack.json'),('sch2_before','Level20 trước · U hẹp và thấp','Mốc trước feedback mới nhất; cùng camera với ảnh sau.',tool/'levels/CampaignReview020_SCH2_r03.rrpack.json'),('sch2_compact','Level20 sau · U rộng và dịch lên','U bao quanh hai thanh xanh/cam và cặp vòng tím/xanh lá; cùng camera với ảnh trước.',tool/'levels/CampaignReview020_SCH2_r04.rrpack.json')]
# Shared camera per pair, measured with the official renderer bounds.
script="const RR=require(process.argv[1]+'/rr-core.js'),fs=require('fs'),files=JSON.parse(process.argv[2]);const b=files.map(f=>RR.Render.bounds(RR.World.build(JSON.parse(fs.readFileSync(f)).runtime,{lenient:true})));console.log(JSON.stringify(b));"
bounds=json.loads(subprocess.run(['node','-e',script,str(tool),json.dumps([str(f) for _,_,_,f in files])],check=True,capture_output=True,text=True).stdout)
views=[]
for i in range(0,len(bounds),2):
 pair=bounds[i:i+2];view={'xMin':min(b['xMin'] for b in pair)-1.6,'yMin':min(b['yMin'] for b in pair)-1.6,'xMax':max(b['xMax'] for b in pair)+1.6,'yMax':max(b['yMax'] for b in pair)+1.6};views.extend([view,view])
old=bounds[2];new=bounds[3];measure={'before':old,'after':new,'beforeHeight':old['yMax']-old['yMin'],'afterHeight':new['yMax']-new['yMin'],'UWidthBefore':3.2,'UWidthAfter':10.1,'bottomLiftBoardUnits':5.3};measure['heightReductionPercent']=100*(1-measure['afterHeight']/measure['beforeHeight']);(out/'COMPACT20_MEASUREMENTS.json').write_text(json.dumps(measure,indent=2)+'\n')

render="const RR=require(process.argv[1]+'/rr-core.js'),fs=require('fs');const pack=JSON.parse(fs.readFileSync(process.argv[2])),level=pack.runtime;fs.writeFileSync(process.argv[3],RR.Render.render({world:RR.World.build(level,{lenient:true}),level,labels:false,width:700,view:JSON.parse(process.argv[4])}));"
ET.register_namespace('','http://www.w3.org/2000/svg');result=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page(viewport={'width':420,'height':440})
 for index,(key,title,notes,f) in enumerate(files):
  svgpath=out/'alternatives'/f'{key}.svg';subprocess.run(['node','-e',render,str(tool),str(f),str(svgpath),json.dumps(views[index])],check=True);svg=ET.fromstring(svgpath.read_text())
  for el in svg.iter():el.attrib.pop('filter',None)
  text=ET.tostring(svg,encoding='unicode');svgpath.write_text(text);page.set_content('<style>body{margin:0;background:#fbf1e0}svg{width:420px;height:440px}</style>'+text);png=page.screenshot();(out/'alternatives'/f'{key}.png').write_bytes(png);result.append({'key':key,'title':title,'notes':notes,'image':'data:image/png;base64,'+base64.b64encode(png).decode(),'png':f'alternatives/{key}.png'})
 browser.close()
shutil.copy2(tool/'levels/CampaignReview010_P050_r01.rrpack.json',out/'alternatives/P050_3rings.rrpack.json')
(out/'ALTERNATIVES.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('Built four shared-camera before/after comparison images.')
