from playwright.sync_api import sync_playwright
import os
import os;f='file://'+os.path.join(os.path.dirname(os.path.abspath(__file__)),'medcalc.html')
ids=['ottawat','ottawaj','cspine','rockall','aims65','maddrey','lille','four','aspects','cpis','sic','candida','rodwell','finnegan','rnclass','aldrete','prevent','crusade','peps4','hama','hamd','meld']
os.makedirs('shots_novos',exist_ok=True)
with sync_playwright() as p:
  b=p.chromium.launch()
  for scheme in ('light','dark'):
    for wd in (320,390,1280):
      c=b.new_context(viewport={'width':wd,'height':800},color_scheme=scheme,is_mobile=wd<800,has_touch=wd<800,device_scale_factor=2);pg=c.new_page();errs=[];pg.on('pageerror',lambda x:errs.append(str(x)));pg.goto(f);pg.wait_for_timeout(300)
      bad=[]
      for h in ids:
        pg.evaluate(f"location.hash='#{h}'");pg.wait_for_timeout(60)
        if pg.evaluate('document.documentElement.scrollWidth')>wd:bad.append((h,'vaza'))
        lg=pg.evaluate("""[...document.querySelectorAll('#app legend,#app .pl,#app .seg button,#app .po button b,#bar h1')].filter(e=>e.offsetParent).filter(e=>{const r=e.getBoundingClientRect(),lh=parseFloat(getComputedStyle(e).lineHeight)||20;return (e.tagName==='LEGEND'||e.tagName==='H1')&&r.height>lh*1.6}).map(e=>e.textContent.slice(0,40))""")
        if lg:bad.append((h,'quebra',lg))
        if scheme=='light' and wd==390 or scheme=='dark' and wd==320: pg.screenshot(path=f'shots_novos/{h}_{scheme}_{wd}.png',full_page=True)
      print(scheme,wd,'problemas:',bad,'erros:',errs)
      c.close()
  b.close()
