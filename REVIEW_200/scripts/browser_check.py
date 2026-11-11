from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path('/workspace/Campaign/REVIEW_200')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1000});page.goto('http://127.0.0.1:8765/review200/index.html',wait_until='networkidle');page.locator('#block').select_option('1');page.wait_for_timeout(500)
 result={'cards':page.locator('article').count(),'embeddedImages':page.locator('img[src^="data:image/png;base64,"]').count(),'visible21to40':page.locator('article:visible').count(),'images':page.locator('img').evaluate_all('(xs)=>xs.filter(x=>x.complete).map(x=>({width:x.naturalWidth,height:x.naturalHeight}))')}
 page.screenshot(path=str(out/'review-desktop.png'),full_page=False)
 page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(out/'review-mobile.png'),full_page=False);result['mobileOverflow']=page.evaluate('document.documentElement.scrollWidth>innerWidth')
 page.set_javascript_enabled if False else None
 browser.close()
 (out/'validation/browser.json').write_text(json.dumps(result,indent=2));print({k:v for k,v in result.items() if k!='images'})
