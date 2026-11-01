# Testes de segurança e robustez no site servido localmente (index.html real, com CSP e service worker)
# Uso: python3 seguranca.py   (de dentro de testes/)
import json, os, subprocess, time
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8766
BASE = f'http://127.0.0.1:{PORT}/'
XSS = '<img src=x onerror="window.__xss=1">'
INIT = """window.__xss=0;window.__csp=[];
document.addEventListener('securitypolicyviolation',e=>window.__csp.push(e.violatedDirective+' '+(e.blockedURI||'inline')));"""

falhas = []
def check(nome, ok, info=''):
    print(('OK    ' if ok else 'FALHA ') + nome + (f'  [{info}]' if info and not ok else ''))
    if not ok:
        falhas.append(nome)

def servidor():
    p = subprocess.Popen(['python3', '-m', 'http.server', str(PORT), '--bind', '127.0.0.1'], cwd=ROOT,
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    return p

srv = servidor()
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 390, 'height': 844})
        ctx.add_init_script(INIT)
        # Fontes do Google ficam fora do ambiente de teste: responde vazio para não esperar a rede
        ctx.route(lambda u: 'fonts.g' in u, lambda r: r.fulfill(status=200, body='', content_type='text/css'))
        pg = ctx.new_page()
        pg.set_default_timeout(8000)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))

        def abrir(url, espera=400):
            pg.goto('about:blank')
            pg.goto(url)
            pg.wait_for_timeout(espera)

        def estado():
            return pg.evaluate("""()=>({xss:window.__xss,app:(document.getElementById('app')||{}).innerHTML?.length||0,
              txt:document.body.innerText,csp:window.__csp})""")

        # 1. CSP presente e efetiva (bloqueia script inline injetado)
        abrir(BASE, 1500)
        tem = pg.evaluate("!!document.querySelector('meta[http-equiv=\"Content-Security-Policy\"]')")
        check('CSP declarada no index.html', tem)
        pg.evaluate("document.body.insertAdjacentHTML('beforeend','<img id=t0 src=x onerror=\"window.__xss=1\">')")
        pg.wait_for_timeout(300)
        check('CSP bloqueia evento inline injetado', pg.evaluate('window.__xss') == 0)
        pg.evaluate("window.__xss=0;document.getElementById('t0')?.remove()")
        pg.evaluate("()=>{const s=document.createElement('script');s.textContent='window.__xss=1';document.body.appendChild(s)}")
        pg.wait_for_timeout(200)
        check('CSP bloqueia script inline injetado', pg.evaluate('window.__xss') == 0)
        pg.evaluate("window.__csp=[];new Image().src='https://rictav27.goatcounter.com/count?p=/teste'")
        pg.wait_for_timeout(300)
        check('CSP permite o contador de acessos (GoatCounter)', not any('img-src' in x for x in pg.evaluate('window.__csp')), str(pg.evaluate('window.__csp')))
        pg.evaluate("window.__csp=[];new Image().src='https://exemplo.com/x.png'")
        pg.wait_for_timeout(300)
        check('CSP bloqueia imagem de outro site', any('img-src' in x for x in pg.evaluate('window.__csp')))

        # 2. Endereços (hash) maliciosos ou inválidos
        hashes = ['med-q:"><img src=x onerror=window.__xss=1>', 'med-q:&quot;><img src=x onerror=window.__xss=1>',
                  "med-q:'><svg onload=window.__xss=1>", 'cid10-q:"><img src=x onerror=window.__xss=1>',
                  'cid10-c999', 'cid10-c-1', 'cid10-c00000000000000000001', 'cid10-Z99', 'cid10-X999', 'cid10-ZZZ', 'cid10-U99', 'cid10-Q99',
                  'med-999999', 'med--1', 'med-q:', '<img src=x onerror=window.__xss=1>', 'javascript:alert(1)',
                  '%3Cscript%3Ewindow.__xss=1%3C/script%3E', 'imc"><img src=x onerror=window.__xss=1>']
        for h in hashes:
            n = len(errs)
            abrir(BASE + '#' + h)
            e = estado()
            check(f'hash #{h[:40]}', e['xss'] == 0 and len(errs) == n and e['app'] > 50 and not any(x in e['txt'] for x in ('undefined', 'NaN')),
                  f"xss={e['xss']} erros={errs[n:]} app={e['app']}")

        # 3. Dados salvos corrompidos ou maliciosos (localStorage e sessionStorage)
        casos = [
            ('cron com HTML no registro', 'cron', {'v': 1, 'mode': 'rcp', 'r': {'log': [{'t': 0, 'txt': XSS}], 'run': False}}, '#cron'),
            ('cron com tipos errados', 'cron', {'v': 1, 'mode': 'xyz', 's': {'laps': 'abc', 'run': 'sim'}, 'r': {'log': 'x', 'adr': {}, 'ami': None, 'rit': '<b>'},
                                                'u': {'list': 7, 'cur': 'a'}, 'm': {'on': True, 'bpm': -5}}, '#cron'),
            ('cron RCP com tipos errados', 'cron', {'v': 1, 'mode': 'rcp', 'r': {'log': [None, 5, {'t': 'a'}], 'adr': ['x'], 'run': True, 't0': 'a'},
                                                    'm': {'on': True, 'bpm': -5}}, '#cron'),
            ('cron dinâmica uterina com tipos errados', 'cron', {'v': 1, 'mode': 'du', 'u': {'list': [None, {'s': 'a'}], 'cur': {}}}, '#cron'),
            ('cron com __proto__', 'cron', json.loads('{"v":1,"mode":"simples","s":{"__proto__":{"run":true}}}'), '#cron'),
            ('cron simples com valores negativos', 'cron', {'v': 1, 'mode': 'simples', 's': {'acc': -99999, 'laps': [-5, 'x', 1000]}}, '#cron'),
            ('cron não é objeto', 'cron', '[1,2,3]', '#cron'),
            ('favoritos não lista', 'fav', {'a': 1}, '#fav'),
            ('favoritos não lista, página de ferramenta', 'fav', {'a': 1}, '#imc'),
            ('favoritos texto, página de ferramenta', 'fav', '"imc"', '#imc'),
            ('favoritos com HTML', 'fav', [XSS, 'imc', 5, None, 'imc'], '#fav'),
            ('tema inválido', 'theme', 'x" onload="window.__xss=1', '#'),
        ]
        for nome, k, v, h in casos:
            abrir(BASE)
            pg.evaluate('([k,v])=>localStorage.setItem(k,typeof v==="string"?v:JSON.stringify(v))', [k, v])
            n = len(errs)
            abrir(BASE + h, 700)
            e = estado()
            check(nome, e['xss'] == 0 and len(errs) == n and e['app'] > 50 and not any(x in e['txt'] for x in ('NaN', 'undefined', 'Invalid')),
                  f"xss={e['xss']} erros={errs[n:]} app={e['app']}")
            pg.evaluate('localStorage.clear()')
        abrir(BASE)
        pg.evaluate("localStorage.setItem('fav',JSON.stringify(['imc','imc',5,null,'tfg']))")
        abrir(BASE + '#fav', 500)
        itens = pg.evaluate("[...document.querySelectorAll('#app .item b')].map(b=>b.textContent)")
        check('favoritos válidos mantidos, sem repetição', itens == ['IMC', 'TFG (CKD-EPI 2021)'], str(itens))
        pg.evaluate('localStorage.clear()')
        abrir(BASE)
        pg.evaluate("localStorage.setItem('theme','x')")
        abrir(BASE, 500)
        check('tema inválido ignorado', pg.evaluate("document.documentElement.dataset.theme||''") in ('', 'light', 'dark'))
        pg.evaluate('localStorage.clear()')
        abrir(BASE)
        pg.evaluate("v=>sessionStorage.setItem('qs',JSON.stringify({home:v,med:v,cid10:v}))", '"><img src=x onerror=window.__xss=1>')
        for h in ['#', '#med', '#cid10']:
            pg.goto('about:blank')
            pg.goto(BASE + h)
            pg.wait_for_timeout(400)
            e = estado()
            check(f'busca salva maliciosa em {h}', e['xss'] == 0, f"xss={e['xss']}")
        for v in ['null', '5', '[1]', '{"home":5,"med":{},"cid10":[1]}', '{"home":null}']:
            pg.evaluate("v=>sessionStorage.setItem('qs',v)", v)
            for h in ['#', '#med', '#cid10']:
                n = len(errs)
                pg.goto('about:blank')
                pg.goto(BASE + h)
                pg.wait_for_timeout(300)
                e = estado()
                check(f'busca salva corrompida {v} em {h}', len(errs) == n and e['app'] > 50, f'erros={errs[n:]} app={e["app"]}')
        pg.evaluate('sessionStorage.clear()')

        # 4. Texto digitado nas buscas: sem XSS e o campo mantém exatamente o que foi digitado
        for h, sel in [('#', '#q'), ('#med', '#mq'), ('#cid10', '#cq')]:
            for txt in [XSS, '&lt;b&gt; &amp; "aspas" \'simples\'', 'a&quot;b', '&#39;x']:
                abrir(BASE + h)
                pg.fill(sel, txt)
                pg.wait_for_timeout(150)
                v = pg.input_value(sel)
                check(f'busca {sel} mantém {txt[:24]!r}', v == txt and pg.evaluate('window.__xss') == 0, f'ficou {v!r}')

        # 5. Campos numéricos de todas as ferramentas com texto malicioso
        n = len(errs)
        ids = pg.evaluate('TOOLS.map(t=>t.id)')
        ruins = []
        for t in ids:
            pg.evaluate('h=>location.hash=h', '#' + t)
            pg.wait_for_timeout(30)
            pg.evaluate("""v=>document.querySelectorAll('#app input.num').forEach(e=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))})""", XSS)
            pg.wait_for_timeout(20)
            if pg.evaluate('window.__xss'):
                ruins.append(t)
        check(f'campos numéricos com HTML ({len(ids)} ferramentas)', not ruins and len(errs) == n, f'{ruins} {errs[n:]}')

        # 6. Links externos abrem sem acesso à página (noopener)
        abrir(BASE + '#sobre')
        rels = pg.evaluate("[...document.querySelectorAll('a[target=_blank]')].map(a=>a.rel)")
        check('links externos com noopener', rels and all('noopener' in r for r in rels), str(rels))

        # 7. Nenhuma violação de CSP em nenhuma página nem no uso do cronômetro (nada legítimo bloqueado)
        viol = {}
        for h in [''] + ids + ['esp', 'calc', 'esc', 'med', 'med-0', 'cid10', 'cid10-c0', 'cid10-A00', 'cron', 'sobre', 'fav', 'instalar']:
            pg.evaluate('window.__csp=[]')
            pg.evaluate('h=>location.hash=h', '#' + h)
            pg.wait_for_timeout(30)
            for sel in ['#app button.ver', '#app .po button', '#app .seg button', '#app details summary']:
                for el in pg.query_selector_all(sel)[:2]:
                    try:
                        el.click(timeout=500)
                    except Exception:
                        pass
            c = pg.evaluate('window.__csp')
            if c:
                viol[h] = c
        abrir(BASE + '#cron', 800)
        for m in ['simples', 'rcp', 'du']:
            pg.click(f'.modes [data-m="{m}"]')
            for bt in ['#b1', '#b2', '#dA', '#dS', '#tm', '#bc', '#bc', '#cp2']:
                if pg.query_selector(bt):
                    pg.click(bt)
            pg.wait_for_timeout(200)
        if pg.evaluate('window.__csp'):
            viol['cron uso'] = pg.evaluate('window.__csp')
        check('nenhuma violação de CSP em todas as páginas', not viol, str(viol)[:300])

        # 8. Service worker
        sw = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
        check("instalação do service worker ignora o cache HTTP (cache:'reload')", "cache:'reload'" in sw)
        abrir(BASE, 2500)
        pg.reload()
        pg.wait_for_timeout(1200)
        check('service worker controla a página', pg.evaluate('!!navigator.serviceWorker.controller'))
        # páginas que não são o app (erro 404, outro arquivo do site) não podem substituir a cópia offline
        for url in [BASE + 'naoexiste.html', BASE + 'testes/', BASE + 'docs/']:
            pg.goto(url)
            pg.wait_for_timeout(500)
        guardada = pg.evaluate("u=>caches.match(u).then(r=>r?r.text():'')", BASE + 'index.html')
        check('cópia offline continua sendo o app', '<title>MedPrumo</title>' in guardada, guardada[:80])
        # sem servidor (offline de verdade: o modo offline do Playwright não vale para o service worker)
        srv.terminate()
        srv.wait()
        for url, alvo in [(BASE + '#tfg', 'TFG'), (BASE + 'naoexiste.html', ''), (BASE + 'index.html#imc', 'IMC')]:
            try:
                pg.goto(url)
                pg.wait_for_timeout(800)
                t = pg.title()
                h1 = pg.inner_text('.bar h1') if alvo else 'ok'
            except Exception as ex:
                t, h1 = 'erro', str(ex)[:80]
            check(f'sem internet abre o app em {url[len(BASE):] or "/"}', t == 'MedPrumo' and alvo in h1, f'{t} | {h1}')
        print('erros de página', errs[:10])
        b.close()
finally:
    srv.terminate()
print('falhas', len(falhas))
