"""App instalado e atualização: título da aba, cor da barra do sistema, aviso de versão nova,
abertura com rede lenta (cópia guardada, sem esperar a rede) e relógio dos cronômetros parado fora de uso.
Uso: python3 pwa2.py   (linhas 'FALHA ...' indicam erro)"""
import http.server, os, re, shutil, tempfile, threading, time
from playwright.sync_api import sync_playwright

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tmp = tempfile.mkdtemp()
for f in ['index.html', 'manifest.webmanifest', 'sw.js']:
    shutil.copy(os.path.join(R, f), tmp)
shutil.copytree(os.path.join(R, 'assets'), os.path.join(tmp, 'assets'))
LENTO = {'s': 0}


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=tmp, **k)

    def do_GET(self):
        if LENTO['s'] and self.path.split('#')[0].split('?')[0] in ('/', '/index.html'):
            time.sleep(LENTO['s'])
        try:
            super().do_GET()
        except (BrokenPipeError, ConnectionResetError):
            pass

    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()
U = f'http://127.0.0.1:{srv.server_address[1]}/'
falhas = 0


def ok(c, msg):
    global falhas
    if not c:
        falhas += 1
    print(('OK    ' if c else 'FALHA ') + msg, flush=True)


CONTA = "(()=>{const o=setTimeout;window.__n=0;window.setTimeout=function(f,t){if(t===50||t===250)window.__n++;return o.apply(this,arguments)}})()"
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, color_scheme='dark', has_touch=True, is_mobile=True, bypass_csp=True)
        ctx.add_init_script(CONTA)
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(U)
        pg.wait_for_function('navigator.serviceWorker.controller', timeout=20000)

        # título da aba
        ok(pg.title() == 'MedPrumo', 'título na tela inicial: ' + pg.title())
        pg.goto(U + '#curb'); pg.wait_for_selector('.bar h1')
        ok(pg.title() == 'CURB-65 · MedPrumo', 'título da ferramenta: ' + pg.title())
        pg.goto(U + '#cron'); pg.wait_for_selector('.bar h1')
        ok(pg.title() == 'Cronômetros · MedPrumo', 'título dos cronômetros: ' + pg.title())
        pg.goto(U + '#'); pg.wait_for_timeout(200)
        ok(pg.title() == 'MedPrumo', 'título ao voltar para a tela inicial: ' + pg.title())

        # cor da barra do sistema: sem escolha segue o sistema (2 meta com media); com escolha, a do tema do app
        cores = "[...document.querySelectorAll('meta[name=\"theme-color\"]')].map(m=>(m.media||'')+'|'+m.content)"
        ok(all('prefers-color-scheme' in x for x in pg.evaluate(cores)), 'sem tema salvo, a cor segue o sistema')
        pg.click('.thm2'); pg.wait_for_timeout(100)
        t = pg.evaluate('document.documentElement.dataset.theme')
        ok(t == 'light' and pg.evaluate(cores) == ['|#f2f4f8', '|#f2f4f8'], f'tema claro com sistema escuro: barra clara ({pg.evaluate(cores)})')
        pg.reload(); pg.wait_for_selector('.thm2')
        ok(pg.evaluate(cores) == ['|#f2f4f8', '|#f2f4f8'], 'cor mantida depois de atualizar a página')
        pg.click('.thm2'); pg.wait_for_timeout(100)
        ok(pg.evaluate(cores) == ['|#0e0f11', '|#0e0f11'], 'tema escuro: barra escura')
        css = open(os.path.join(R, 'assets/css/app.css'), encoding='utf-8').read()
        ok(re.search(r':root\{[^}]*--bg:#f2f4f8', css) and re.search(r'data-theme="dark"\]\{[^}]*--bg:#0e0f11', css), 'cores da barra iguais ao --bg dos dois temas')

        # relógio dos cronômetros: quase parado fora de uso, 50 ms na tela de cronômetros
        pg.goto(U + '#'); pg.wait_for_timeout(600)
        pg.evaluate('window.__n=0'); pg.wait_for_timeout(2000); n0 = pg.evaluate('window.__n')
        ok(n0 <= 12, f'tela inicial: {n0} batidas do relógio em 2 s (máx. 12)')
        pg.goto(U + '#cron'); pg.wait_for_timeout(600)
        pg.evaluate('window.__n=0'); pg.wait_for_timeout(2000); n1 = pg.evaluate('window.__n')
        ok(n1 >= 25, f'tela de cronômetros: {n1} batidas em 2 s (mín. 25)')

        # versão nova com o app aberto na tela de cronômetros: atualiza sozinho, mas só depois de sair da tela
        pg.evaluate("window.__marca=1;localStorage.setItem('mpv','0.0.1')")
        sw = os.path.join(tmp, 'sw.js')
        s = open(sw, encoding='utf-8').read()
        open(sw, 'w', encoding='utf-8').write(re.sub(r"const V='medprumo-[^']*'", "const V='medprumo-teste0001'", s))
        pg.evaluate('navigator.serviceWorker.getRegistration().then(r=>r.update())')
        pg.wait_for_function("caches.keys().then(k=>k.length===1&&k[0]==='medprumo-teste0001')", timeout=30000)
        pg.wait_for_timeout(800)
        ok(pg.evaluate('window.__marca')==1 and pg.query_selector('.upd') is None, 'na tela de cronômetros o app não atualiza')
        pg.evaluate("location.hash='#'"); pg.wait_for_selector('.upd', timeout=8000)
        ok(pg.evaluate('window.__marca') is None, 'ao sair dos cronômetros o app atualiza sozinho')
        t = pg.inner_text('.upd')
        ok('App atualizado para a versão' in t and 'Novidades' in t, 'aviso de app atualizado com botão Novidades')
        box = pg.eval_on_selector('.upd', 'e=>{const r=e.getBoundingClientRect();return [r.left,r.right,r.bottom,innerWidth,innerHeight]}')
        ok(box[0] >= 0 and box[1] <= box[3] and box[2] <= box[4], 'aviso dentro da tela')
        ok(all(x >= 44 for x in pg.eval_on_selector_all('.upd button', 'bs=>bs.flatMap(b=>{const r=b.getBoundingClientRect();return [r.width,r.height]})')), 'botões do aviso com 44 px ou mais')
        pg.click('.upd [data-a="y"]')
        pg.wait_for_selector('.dlg .chv', timeout=3000)
        ok(pg.query_selector('.upd') is None and 'Novidades' in pg.inner_text('.dlg'), 'botão Novidades fecha o aviso e abre a lista de mudanças')
        pg.click('.dlg .boxx')
        pg.reload(); pg.wait_for_selector('.bar h1, .hhead'); pg.wait_for_timeout(800)
        ok(pg.query_selector('.upd') is None, 'sem aviso ao só atualizar a página na mesma versão')

        # primeira instalação não mostra aviso
        c2 = b.new_context(bypass_csp=True); p2 = c2.new_page(); p2.goto(U)
        p2.wait_for_function('navigator.serviceWorker.controller', timeout=20000); p2.wait_for_timeout(500)
        ok(p2.query_selector('.upd') is None, 'primeira abertura não mostra aviso de versão'); c2.close()

        # rede lenta (servidor leva 8 s na página): o app abre na hora pela cópia guardada
        LENTO['s'] = 8
        t0 = time.time(); pg.goto(U + '#curb'); pg.reload(); pg.wait_for_selector('.bar h1'); dt = time.time() - t0
        ok(dt < 2.5 and pg.inner_text('.bar h1').strip().upper() == 'CURB-65', f'rede lenta: app aberto pela cópia guardada em {dt:.1f} s')
        LENTO['s'] = 0
        # servidor fora do ar: abre offline
        srv.shutdown(); srv.server_close()
        pg.reload(); pg.wait_for_selector('.bar h1')
        ok(pg.inner_text('.bar h1').strip().upper() == 'CURB-65', 'servidor fora do ar: app abre offline')
        ok(not errs, f'erros JS {errs}')
        b.close()
finally:
    try:
        srv.shutdown()
    except Exception:
        pass
    shutil.rmtree(tmp, ignore_errors=True)
print(f'falhas: {falhas}')
raise SystemExit(1 if falhas else 0)
