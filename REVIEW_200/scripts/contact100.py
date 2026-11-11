from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,re,datetime
out=Path('/workspace/Campaign/REVIEW_200');dest=out/'preview100';dest.mkdir(exist_ok=True)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',24);small=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
for start in range(1,101,20):
 board=Image.new('RGB',(1800,2200),'#e9e5dd');draw=ImageDraw.Draw(board);draw.text((25,15),f'CAMPAIGN — {start:03}–{start+19:03}',fill='#202832',font=font)
 for i,n in enumerate(range(start,start+20)):
  x=(i%5)*360;y=(i//5)*530+65;draw.rounded_rectangle((x+7,y,x+353,y+520),radius=12,fill='#fffdf7');ok=(out/'validation'/f'{n:03}.json').exists();draw.text((x+20,y+9),f'#{n:03}'+('' if ok else ' — DRAFT'),fill='#254331' if ok else '#a23b21',font=font)
  p=out/'previews'/f'Level{n:03}.png'
  if p.exists():
   im=Image.open(p).convert('RGB');im.thumbnail((330,465));board.paste(im,(x+(360-im.width)//2,y+47+(465-im.height)//2))
 board.save(dest/f'levels_{start:03}_{start+19:03}.jpg',quality=92)
page=(out/'index.html').read_text();main=re.search(r'<main>(.*?)</main>',page,re.S);cards=re.findall(r'<article\b.*?</article>',main.group(1),re.S);page=page[:main.start(1)]+''.join(cards[:100])+page[main.end(1):];page=page.replace('Campaign · Bộ review 200 level','Campaign · 100 level đầu hiện tại').replace('Tất cả 200','100 level đầu').replace('fetch(\'version.json',"fetch('../version.json");page=page.replace('href="packs/','href="../packs/').replace('href="validation/','href="../validation/').replace('href="MAPPING_200','href="../MAPPING_200').replace('href="STATUS','href="../STATUS').replace('href="README','href="../README');page=page.replace('setInterval(async()=>','/* live refresh disabled for this snapshot */ false&&setInterval(async()=>');(dest/'index.html').write_text(page)
print('Updated100; draft positions',[n for n in range(1,101)if not(out/'validation'/f'{n:03}.json').exists()])
