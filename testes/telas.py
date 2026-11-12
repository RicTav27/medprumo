"""Tamanhos de tela, toque e contraste. Substitui mobile.py, aparelhos.py, disp.js, novos.py, bordas.py e kb.py.
  python3 telas.py           19 telas (celular, celular deitado, tablet, computador), todas as páginas em 11 larguras
  python3 telas.py --todos   lista longa de aparelhos, todas as páginas em cada largura
  python3 telas.py --fotos   grava capturas em telas_shots/ (para conferir a aparência a olho)
Linhas FALHA viram Erro no checar.py; linhas AVISO viram Aviso.
"""
from playwright.sync_api import sync_playwright
import os, sys
T = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(T, 'medcalc.html')
FILL = open(os.path.join(T, 'shoot.py'), encoding='utf-8').read().split('FILL="""')[1].split('"""')[0]
# (nome, largura, altura visível, tipo, a tela inicial tem que caber sem rolar)
BASE = [('iPhone SE 1ª Safari', 320, 460, 'cel', 0), ('Galaxy Z Fold fechado', 344, 810, 'cel', 0), ('Android pequeno', 360, 640, 'cel', 1),
        ('Android 368', 368, 700, 'cel', 1), ('iPhone SE Safari', 375, 548, 'cel', 1), ('iPhone SE app', 375, 667, 'cel', 1),
        ('Galaxy A Chrome', 384, 700, 'cel', 1), ('iPhone 13 Safari', 390, 664, 'cel', 1), ('iPhone 13 app', 390, 844, 'cel', 1),
        ('Android médio Chrome', 393, 727, 'cel', 1), ('Android grande', 412, 915, 'cel', 1), ('iPhone Pro Max Safari', 430, 739, 'cel', 1),
        ('iPhone SE deitado', 667, 326, 'deitado', 0), ('iPhone 13 deitado', 844, 340, 'deitado', 0),
        ('iPad em pé', 768, 954, 'tab', 0), ('iPad deitado', 1024, 698, 'tab', 0), ('iPad Pro deitado', 1366, 954, 'tab', 0),
        ('Notebook 1366', 1366, 657, 'pc', 0), ('Monitor 1920', 1920, 960, 'pc', 0)]
MAIS = [('iPhone SE 1ª app', 320, 568, 'cel', 0), ('iPhone mini app', 375, 812, 'cel', 1), ('iPhone 11 Safari', 414, 715, 'cel', 1), ('iPhone 15 Safari', 393, 659, 'cel', 1),
        ('iPhone 16 Pro Safari', 402, 681, 'cel', 1), ('iPhone 14 Plus Safari', 428, 746, 'cel', 1), ('iPhone 16 Pro Max Safari', 440, 763, 'cel', 1),
        ('Android antigo', 320, 534, 'cel', 0), ('Galaxy S23 Chrome', 360, 708, 'cel', 1), ('Pixel 9 Pro XL', 448, 906, 'cel', 1),
        ('Galaxy Z Fold aberto', 690, 760, 'tab', 0), ('iPhone Pro Max deitado', 932, 370, 'deitado', 0), ('Android deitado', 800, 312, 'deitado', 0),
        ('iPad mini', 744, 1063, 'tab', 0), ('iPad 10ª', 820, 1110, 'tab', 0), ('iPad Pro 11', 834, 1124, 'tab', 0), ('iPad Pro 13', 1032, 1306, 'tab', 0),
        ('Galaxy Tab A', 600, 904, 'tab', 0), ('Galaxy Tab S9', 800, 1200, 'tab', 0), ('iPad 10ª deitado', 1180, 750, 'tab', 0), ('Galaxy Tab deitado', 1280, 720, 'tab', 0),
        ('iPad Slide Over', 320, 980, 'cel', 0), ('iPad metade', 507, 954, 'tab', 0), ('iPad 2/3', 694, 954, 'tab', 0), ('Notebook 1280', 1280, 640, 'pc', 0), ('Monitor 2560', 2560, 1300, 'pc', 0)]
TODOS = '--todos' in sys.argv
D = BASE + (MAIS if TODOS else [])
# larguras em que todas as páginas são abertas: uma de cada lado de cada ponto de quebra do CSS (350, 360, 370, 380, 400) + deitado, tablet e computador
LARG = None if TODOS else {320, 344, 360, 368, 375, 390, 412, 844, 768, 1366, 1920}
EXTRA = ['calc', 'esc', 'esp', 'med', 'med-0', 'med-973', 'cid10', 'cid10-c0', 'cid10-A00', 'cron', 'sobre', 'fav', 'instalar']
# Percorre todas as páginas dentro do navegador (uma chamada só por largura)
VARRE = """async([pages,touch,fill])=>{const R={vaza:[],corte:[],toque:[],fonte:[],n:0};const W=innerWidth;
for(const h of pages){location.hash='#'+h;await new Promise(r=>setTimeout(r,8));if(fill&&document.querySelector('#app form,#app .card')){try{(new Function('('+fill+')()'))()}catch(e){}await new Promise(r=>setTimeout(r,8))}
 R.n++;if(document.documentElement.scrollWidth>W)R.vaza.push(h);
 if([...document.querySelectorAll('#app *,#bar *')].some(e=>e.offsetParent&&!e.children.length&&e.textContent.trim()&&(r=>r.right>W+1||r.left<-1)(e.getBoundingClientRect())))R.corte.push(h);
 if(touch){for(const e of document.querySelectorAll('#app button,#app a,#app .opt,#bar a,#bar button')){if(!e.offsetParent)continue;const r=e.getBoundingClientRect();if(r.height<32||r.width<32)R.toque.push(h+' '+e.tagName+'.'+String(e.className).slice(0,20)+' '+Math.round(r.width)+'x'+Math.round(r.height))}
  for(const e of document.querySelectorAll('#app input,#app select'))if(e.offsetParent&&!/^(checkbox|radio)$/.test(e.type)&&parseFloat(getComputedStyle(e).fontSize)<16)R.fonte.push(h+' '+e.id)}}
return R}"""
# Contraste do texto visível contra o fundo real (WCAG: 4,5 texto normal; 3 texto grande)
CONTR = """async([pages,fill])=>{const P=s=>{const m=s.replace('srgb','').match(/[\\d.]+/g).map(Number),k=s.startsWith('color(')?255:1;return [m[0]*k,m[1]*k,m[2]*k,m[3]===undefined?1:m[3]]};
const L=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
const over=(a,b)=>[0,1,2].map(i=>a[i]*a[3]+b[i]*(1-a[3])).concat(1);
const bg=e=>{const st=[];for(let x=e;x;x=x.parentElement){const s=getComputedStyle(x);if(s.backgroundImage!=='none')return null;const c=P(s.backgroundColor);if(c[3]>0){st.push(c);if(c[3]===1)break}}let r=[255,255,255,1];for(const c of st.reverse())r=over(c,r);return r};
const out={};for(const h of pages){location.hash='#'+h;await new Promise(r=>setTimeout(r,8));if(fill&&document.querySelector('#app form,#app .card')){try{(new Function('('+fill+')()'))()}catch(e){}await new Promise(r=>setTimeout(r,8))}
 document.querySelectorAll('details').forEach(d=>d.open=true);
 for(const e of document.querySelectorAll('#bar *,#app *')){if(!e.offsetParent||e.closest('svg')||e.disabled)continue;if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
  const s=getComputedStyle(e);if(+s.opacity<1||s.visibility==='hidden')continue;const b=bg(e);if(!b)continue;const f=over(P(s.color),b);const a=L(f),c=L(b);const r=(Math.max(a,c)+.05)/(Math.min(a,c)+.05);
  const px=parseFloat(s.fontSize),big=px>=24||(px>=18.66&&+s.fontWeight>=700);if(r<(big?3:4.5)){const k=e.tagName+'.'+String(e.className).split(' ')[0]+' '+s.color+' sobre rgb('+b.slice(0,3).map(Math.round)+')';(out[k]=out[k]||{r:r.toFixed(2),ex:h+': '+e.textContent.trim().slice(0,30),n:0}).n++}}}
return out}"""
falha = aviso = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    feito = {}
    pages = None
    print('== Tela inicial')
    for nome, w, h, tipo, cabe in D:
        mob = tipo != 'pc'
        c = b.new_context(viewport={'width': w, 'height': h}, is_mobile=mob, has_touch=mob)
        pg = c.new_page(); errs = []; pg.on('pageerror', lambda x: errs.append(str(x)[:120]))
        pg.goto(URL); pg.wait_for_timeout(200)
        sh, sw = pg.evaluate('[document.documentElement.scrollHeight,document.documentElement.scrollWidth]')
        prob = []
        if sw > w: prob.append('vaza para o lado')
        if cabe and sh > h: prob.append(f'rola {sh - h} px')
        if errs: prob.append('erro JS ' + errs[0])
        if prob:
            falha += 1; print(f'FALHA tela inicial em {nome} ({w}x{h}): ' + ', '.join(prob))
        if '--fotos' in sys.argv:
            os.makedirs(os.path.join(T, 'telas_shots'), exist_ok=True)
            pg.screenshot(path=os.path.join(T, 'telas_shots', f'{w}x{h}_home.png'))
        if w not in feito and (LARG is None or w in LARG):
            if pages is None: pages = pg.evaluate('TOOLS.map(t=>t.id)') + EXTRA
            r = pg.evaluate(VARRE, [pages, mob, FILL]); feito[w] = r
            for k, t in (('vaza', 'página vaza para o lado'), ('corte', 'texto cortado na lateral'), ('fonte', 'campo com fonte < 16 px (iPhone dá zoom)')):
                if r[k]:
                    falha += 1; print(f'FALHA {t} em {w} px: {len(r[k])} ({", ".join(r[k][:8])})')
            if r['toque']:
                aviso += 1; print(f'AVISO alvo de toque < 32 px em {w} px: {len(r["toque"])} ({"; ".join(sorted(set(r["toque"]))[:5])})')
            if errs:
                falha += 1; print(f'FALHA erro JS em {w} px: {errs[0]}')
        c.close()
    print(f'  {len(D)} telas; todas as páginas ({len(pages)}) em {len(feito)} larguras: {', '.join(map(str, sorted(feito)))}')
    print('== Contraste do texto')
    for tema in ('light', 'dark'):
        c = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        pg = c.new_page(); pg.goto(URL); pg.wait_for_timeout(200)
        pg.evaluate("t=>{document.documentElement.dataset.theme=t}", tema)
        r = pg.evaluate(CONTR, [pages, FILL])
        for k, v in sorted(r.items(), key=lambda kv: float(kv[1]['r'])):
            aviso += 1; print(f'AVISO contraste {v["r"]} no tema {"claro" if tema == "light" else "escuro"}: {k} ({v["n"]}x, ex. {v["ex"]})')
        if '--fotos' in sys.argv:
            for hh in ('', 'imc', 'esc', 'med-0', 'cron', 'instalar', 'sobre'):
                pg.evaluate("h=>{location.hash='#'+h}", hh); pg.wait_for_timeout(120)
                if hh == 'imc': pg.evaluate('(' + FILL + ')()'); pg.wait_for_timeout(80)
                pg.screenshot(path=os.path.join(T, 'telas_shots', f'{tema}_{hh or "home"}.png'))
        c.close()
    b.close()
print(f'falhas: {falha} | avisos: {aviso}')
