import sys,os
from playwright.sync_api import sync_playwright
src,out=sys.argv[1],sys.argv[2];os.makedirs(out,exist_ok=True)
with sync_playwright() as p:
  b=p.chromium.launch()
  for th in ['light','dark']:
    c=b.new_context(viewport={'width':390,'height':844},color_scheme=th,is_mobile=True,has_touch=True);q=c.new_page();q.goto('file://'+src);q.add_style_tag(content='*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}');q.wait_for_timeout(300)
    q.fill('#app input[type=search], #app input',"go");q.wait_for_timeout(150);q.screenshot(path=f'{out}/{th}_busca.png')
    q.fill('#app input[type=search], #app input',"");q.evaluate("location.hash='#med'");q.wait_for_timeout(150);q.fill('#app input','dip');q.wait_for_timeout(300);q.screenshot(path=f'{out}/{th}_medbusca.png')
    q.evaluate("location.hash='#cid10'");q.wait_for_timeout(300);q.fill('#app input','asma');q.wait_for_timeout(400);q.screenshot(path=f'{out}/{th}_cidbusca.png')
    q.evaluate("location.hash='#gold'");q.wait_for_timeout(150);q.click('.bar .fav');q.wait_for_timeout(100);q.screenshot(path=f'{out}/{th}_favon.png')
    q.evaluate("location.hash='#cron'");q.wait_for_timeout(150)
    bt=q.query_selector_all('#app button')
    for x in bt:
      if x.inner_text().strip()=='RCP':x.click();break
    q.wait_for_timeout(150);q.screenshot(path=f'{out}/{th}_rcp.png')
    for x in q.query_selector_all('#app button'):
      if x.inner_text().strip()=='Dinâmica uterina':x.click();break
    q.wait_for_timeout(150);q.screenshot(path=f'{out}/{th}_din.png')
    q.evaluate("location.hash='#instalar'");q.wait_for_timeout(150)
    try:q.click('#cpy');q.wait_for_timeout(100)
    except Exception:pass
    q.screenshot(path=f'{out}/{th}_instcopy.png',full_page=True)
    c.close()
  b.close()
