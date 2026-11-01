from playwright.sync_api import sync_playwright
import os,sys,json
import os;f='file://'+os.path.join(os.path.dirname(os.path.abspath(__file__)),'medcalc.html')
# (nome, largura, altura visível, tipo) em px CSS. Altura "Safari/Chrome" = tela menos barras do navegador; "app" = instalado na tela inicial
D=[
 # iPhone
 ('iPhone SE 1ª Safari',320,460,'cel'),('iPhone SE 1ª app',320,568,'cel'),
 ('iPhone SE 2/3 Safari',375,548,'cel'),('iPhone SE 2/3 app',375,667,'cel'),
 ('iPhone 12/13 mini Safari',375,635,'cel'),('iPhone 12/13 mini app',375,812,'cel'),
 ('iPhone 11/XR Safari',414,715,'cel'),('iPhone 11/XR app',414,896,'cel'),
 ('iPhone 12/13/14 Safari',390,664,'cel'),('iPhone 12/13/14 app',390,844,'cel'),
 ('iPhone 15/16 Safari',393,659,'cel'),('iPhone 15/16 app',393,852,'cel'),
 ('iPhone 16/17 Pro Safari',402,681,'cel'),('iPhone 16/17 Pro app',402,874,'cel'),
 ('iPhone 14 Plus Safari',428,746,'cel'),('iPhone 15 Pro Max Safari',430,739,'cel'),('iPhone 15 Pro Max app',430,932,'cel'),
 ('iPhone 16/17 Pro Max Safari',440,763,'cel'),('iPhone 16/17 Pro Max app',440,956,'cel'),
 # Android
 ('Android antigo pequeno',320,534,'cel'),('Android pequeno',360,640,'cel'),('Galaxy S8/S9 Chrome',360,668,'cel'),
 ('Galaxy S20/S21 Chrome',360,728,'cel'),('Galaxy S23/S24 Chrome',360,708,'cel'),('Galaxy A14/A15 Chrome',384,746,'cel'),
 ('Galaxy A54/A55 Chrome',384,770,'cel'),('Moto G Chrome',412,770,'cel'),('Pixel 7/8 Chrome',412,839,'cel'),
 ('Pixel 9 Pro XL Chrome',448,906,'cel'),('Xiaomi Redmi Note Chrome',393,770,'cel'),
 ('Galaxy Z Fold (tela externa)',344,810,'cel'),('Galaxy Z Fold (aberto)',690,760,'tab'),('Galaxy Z Flip',412,840,'cel'),
 # Celular deitado
 ('iPhone SE deitado',667,326,'deitado'),('iPhone 13 deitado',844,340,'deitado'),('iPhone Pro Max deitado',932,370,'deitado'),('Android deitado',800,312,'deitado'),
 # Tablets em pé
 ('iPad mini Safari',744,1063,'tab'),('iPad 9ª Safari',768,954,'tab'),('iPad 10ª / Air 11 Safari',820,1110,'tab'),
 ('iPad Pro 11 Safari',834,1124,'tab'),('iPad Air 13 / Pro 12,9 Safari',1024,1296,'tab'),('iPad Pro 13 M4 Safari',1032,1306,'tab'),
 ('Galaxy Tab A Chrome',600,904,'tab'),('Galaxy Tab S8/S9 Chrome',800,1200,'tab'),('Tablet Android 10" Chrome',800,1180,'tab'),
 # Tablets deitados
 ('iPad 9ª deitado',1024,698,'tab'),('iPad 10ª deitado',1180,750,'tab'),('iPad Pro 11 deitado',1194,764,'tab'),('iPad Pro 12,9 deitado',1366,954,'tab'),('Galaxy Tab S9 deitado',1280,720,'tab'),
 # iPad dividido (Split View / Slide Over)
 ('iPad Slide Over',320,980,'cel'),('iPad 1/3 da tela',375,1000,'cel'),('iPad metade',507,954,'tab'),('iPad 2/3 da tela',694,954,'tab'),
 # Computador
 ('Notebook 1280',1280,640,'pc'),('Notebook 1366',1366,657,'pc'),('Monitor 1920',1920,960,'pc'),
]
pages=None
res=[];shots='aparelhos_shots';os.makedirs(shots,exist_ok=True)
with sync_playwright() as p:
  b=p.chromium.launch()
  over={};checked={}
  for name,w,h,kind in D:
    mob=kind!='pc'
    c=b.new_context(viewport={'width':w,'height':h},is_mobile=mob,has_touch=mob,device_scale_factor=2);pg=c.new_page();errs=[];pg.on('pageerror',lambda x:errs.append(str(x)));pg.goto(f);pg.wait_for_timeout(250)
    sh=pg.evaluate('document.documentElement.scrollHeight');sw=pg.evaluate('document.documentElement.scrollWidth')
    clip=pg.evaluate("""[...document.querySelectorAll('#app *')].filter(e=>e.offsetParent&&e.children.length===0&&e.textContent.trim()).filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1||r.left<-1}).map(e=>e.textContent.trim().slice(0,30)).slice(0,5)""")
    small=pg.evaluate("""[...document.querySelectorAll('#app a,#app button')].filter(e=>e.offsetParent).filter(e=>{const r=e.getBoundingClientRect();return r.height<32||r.width<32}).length""")
    res.append((name,w,h,kind,sh,sw,clip,small,errs))
    tag=name.replace(' ','_').replace('/','-')
    if kind in('tab','deitado','pc') or w in(320,344):
      pg.screenshot(path=f'{shots}/{tag}_home.png')
    # todas as páginas: uma vez por largura
    if w not in checked:
      if pages is None:pages=pg.evaluate('TOOLS.map(t=>t.id)')+['calc','esc','esp','med','med-0','med-973','cid10','cid10-c0','cid10-A00','cron','sobre','fav','instalar']
      ov=[];cl=[]
      for hh in pages:
        pg.evaluate(f"location.hash='#{hh}'");pg.wait_for_timeout(25)
        if pg.evaluate('document.documentElement.scrollWidth')>w:ov.append(hh)
        x=pg.evaluate("""[...document.querySelectorAll('#app *,#bar *')].filter(e=>e.offsetParent&&e.children.length===0&&e.textContent.trim()).filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1}).length""")
        if x:cl.append(hh)
      checked[w]=(ov,cl,errs[:])
      if kind in('tab','pc'):
        for hh in ('esc','nihss','prevent','med-0','sobre'):
          pg.evaluate(f"location.hash='#{hh}'");pg.wait_for_timeout(80);pg.screenshot(path=f'{shots}/{tag}_{hh}.png')
    c.close()
  b.close()
print('== Tela inicial')
for name,w,h,kind,sh,sw,clip,small,errs in res:
  fit='cabe' if sh<=h else f'rola {sh-h}px'
  print(f'  {name:32} {w}x{h:<5} {kind:8} {fit:12} largura {"OK" if sw<=w else "VAZA"} {("corte:"+str(clip)) if clip else ""} {("erros:"+str(errs)) if errs else ""}')
print('== Todas as páginas por largura')
for w,(ov,cl,e) in sorted(checked.items()):
  print(f'  {w:5}px  vazamento: {ov or "nenhum"}  texto cortado: {cl or "nenhum"}  erros: {e or "nenhum"}')
