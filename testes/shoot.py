import sys,os
from playwright.sync_api import sync_playwright
src,out=sys.argv[1],sys.argv[2];os.makedirs(out,exist_ok=True)
f='file://'+src
FILL="""()=>{document.querySelectorAll('details').forEach(d=>d.open=true);
document.querySelectorAll('.po').forEach(g=>{const b=g.querySelectorAll('button');(b[1]||b[0]).click()});
[...document.querySelectorAll('#app input[type=checkbox]')].slice(0,2).forEach(c=>{c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}))});
document.querySelectorAll('#app input.num').forEach(i=>{const L=(typeof LIM!=='undefined'&&LIM[i.id]);i.value=L?String(Math.round((L[0]+L[1])/2*10)/10).replace('.',','):'1';i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}))});
document.querySelectorAll('#app .seg').forEach(s=>s.querySelector('button')?.click());
document.activeElement&&document.activeElement.blur&&document.activeElement.blur()}"""
with sync_playwright() as p:
  b=p.chromium.launch()
  for th in ['light','dark']:
    c=b.new_context(viewport={'width':390,'height':844},color_scheme=th,is_mobile=True,has_touch=True);q=c.new_page();q.goto(f);q.add_style_tag(content='*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}');q.wait_for_timeout(300)
    q.evaluate("()=>{try{localStorage.setItem('favs',JSON.stringify(['gold','imc']))}catch(e){}}")
    ids=q.evaluate("TOOLS.map(t=>t.id)")
    pages=['','esp','calc','esc','med','med-0','med-973','med-1764','cid10','cid10-c0','cid10-A00','cron','fav','sobre','instalar']+ids
    for h in pages:
      q.evaluate(f"location.hash='#{h}'");q.wait_for_timeout(60)
      if h in ids or h in('sobre','instalar'):q.evaluate(FILL);q.wait_for_timeout(40)
      q.screenshot(path=f'{out}/{th}_{h or "home"}.png',full_page=True)
    c.close()
  for (w,h) in [(320,454),(375,667),(1280,800)]:
    c=b.new_context(viewport={'width':w,'height':h},is_mobile=w<1000,has_touch=w<1000);q=c.new_page();q.goto(f);q.add_style_tag(content='*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}');q.wait_for_timeout(300)
    q.screenshot(path=f'{out}/home_{w}.png');q.evaluate("location.hash='#gold'");q.wait_for_timeout(100);q.screenshot(path=f'{out}/gold_{w}.png');c.close()
  b.close()
print(len(os.listdir(out)))
