from playwright.sync_api import sync_playwright
import os;f='file://'+os.path.join(os.path.dirname(os.path.abspath(__file__)),'medcalc.html')
with sync_playwright() as p:
  b=p.chromium.launch()
  print('== Tela inicial (altura útil do navegador)')
  for name,w,h in [('iPhone SE Safari',375,548),('iPhone SE app',375,667),('iPhone 13 Safari',390,664),('iPhone 13 app',390,844),('iPhone Pro Max Safari',430,739),('Android pequeno',360,640),('Android médio Chrome',393,727),('Android grande',412,915),('Galaxy A Chrome',384,700)]:
    c=b.new_context(viewport={'width':w,'height':h},is_mobile=True,has_touch=True,device_scale_factor=3);pg=c.new_page();pg.goto(f);pg.wait_for_timeout(300)
    sh=pg.evaluate('document.documentElement.scrollHeight');sw=pg.evaluate('document.documentElement.scrollWidth')
    ft=pg.evaluate("Math.round(document.querySelector('.hfoot').getBoundingClientRect().bottom)")
    print(f'  {name:22} {w}x{h}: altura {sh} {"OK" if sh<=h else "ROLA "+str(sh-h)+"px"} | largura {"OK" if sw<=w else "VAZA"} | rodapé termina em {ft}')
    c.close()
  print('== Todas as páginas em 360x640 (toque)')
  c=b.new_context(viewport={'width':360,'height':640},is_mobile=True,has_touch=True);pg=c.new_page();errs=[];pg.on('pageerror',lambda x:errs.append(str(x)));pg.goto(f);pg.wait_for_timeout(300)
  ids=pg.evaluate('TOOLS.map(t=>t.id)')+['calc','esc','esp','med','med-0','med-973','cid10','cid10-c0','cid10-A00','cron','sobre','fav','instalar']
  over=[];small=set();tiny_font=set()
  for h in ids:
    pg.evaluate(f"location.hash='#{h}'");pg.wait_for_timeout(40)
    if pg.evaluate('document.documentElement.scrollWidth')>360:over.append(h)
    r=pg.evaluate("""[...document.querySelectorAll('#app button,#app a,#app input,#app .opt,#bar a,#bar button')].filter(e=>e.offsetParent&&!(e.tagName==='INPUT'&&/^(checkbox|radio)$/.test(e.type)&&(e.closest('label')?.getBoundingClientRect().height||0)>=40)).map(e=>{const r=e.getBoundingClientRect();return [e.tagName+'.'+(e.className||'')+(e.textContent||'').trim().slice(0,14),Math.round(r.height),Math.round(r.width)]}).filter(x=>x[1]<32||x[2]<32)""")
    for x in r:small.add((h,x[0],x[1],x[2]))
    fz=pg.evaluate("""[...document.querySelectorAll('#app input')].filter(e=>e.offsetParent&&parseFloat(getComputedStyle(e).fontSize)<16).map(e=>e.id)""")
    for x in fz:tiny_font.add((h,x))
  print('  vazamento lateral:',over or 'nenhum')
  print('  inputs com fonte < 16px (iPhone dá zoom):',sorted(tiny_font)[:10] or 'nenhum')
  sm=sorted(small);print('  alvos de toque < 32px:',len(sm));[print('   ',x) for x in sm if not x[1].startswith('INPUT')]
  print('  erros JS:',errs)
  b.close()
