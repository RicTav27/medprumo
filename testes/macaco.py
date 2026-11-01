# Teste aleatório ("macaco"): ações ao acaso num celular simulado, procurando erros de página e texto inválido
# Uso: python3 macaco.py [ações=3000] [semente=1]   (de dentro de testes/, depois de ./preparar.sh)
import os, random, sys
from playwright.sync_api import sync_playwright

N = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
rnd = random.Random(int(sys.argv[2]) if len(sys.argv) > 2 else 1)
f = 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'medcalc.html')
VALS = ['', '0', '-1', '1,5', '1.5', '1.000', '1.000,5', '2.500', '0,001', '99999999', 'abc', '<b>x</b>', '1e309', ' ', '12,3,4', '−5', '37', '120', '7,2']
TXT = ['a', 'ab', 'dor', 'J18', 'i21', 'dipirona', 'amox', '<img src=x onerror=window.__xss=1>', '&amp;', 'zzzz', 'insuf card', '  ', 'TFG']
PAD = ('undefined', 'NaN', '[object', 'Infinity', 'null ')

with sync_playwright() as p:
    b = p.chromium.launch()
    c = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    c.add_init_script('window.__xss=0')
    pg = c.new_page()
    pg.set_default_timeout(3000)
    errs, prob = [], []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: m.type == 'error' and 'ERR_' not in m.text and 'Failed to load resource' not in m.text and errs.append(m.text))
    pg.goto(f)
    pg.wait_for_timeout(500)
    ids = pg.evaluate('TOOLS.map(t=>t.id)') + ['', 'esp', 'calc', 'esc', 'med', 'med-0', 'med-1220', 'cid10', 'cid10-c3', 'cid10-I21', 'cron', 'sobre', 'fav', 'instalar']
    hist = []
    for i in range(N):
        a = rnd.random()
        try:
            if a < .12:
                h = rnd.choice(ids)
                pg.evaluate('h=>location.hash=h', '#' + h)
                hist.append('ir #' + h)
            elif a < .50:
                els = pg.query_selector_all('#app button:visible, #app a[href^="#"]:visible, #app label.opt:visible, #app summary:visible, #bar a:visible, #bar button:visible, .dlg button:visible')
                if els:
                    e = rnd.choice(els)
                    hist.append('clicar ' + (e.inner_text() or e.get_attribute('aria-label') or '?')[:30].replace('\n', ' '))
                    e.click(timeout=1500, force=True)
            elif a < .75:
                els = pg.query_selector_all('#app input.num:visible, #app input[type=date]:visible')
                if els:
                    e = rnd.choice(els)
                    v = rnd.choice(VALS) if e.get_attribute('type') != 'date' else rnd.choice(['2026-01-01', '', '1899-12-31', '2030-05-05'])
                    hist.append(f'digitar {v!r}')
                    e.fill(v)
            elif a < .85:
                els = pg.query_selector_all('#app input[type=search]:visible')
                if els:
                    v = rnd.choice(TXT)
                    hist.append(f'buscar {v!r}')
                    els[0].fill(v)
            elif a < .93:
                hist.append('voltar')
                pg.evaluate('history.back()')
            else:
                hist.append('esc')
                pg.keyboard.press('Escape')
            pg.wait_for_timeout(rnd.choice([0, 20, 60]))
        except Exception as ex:
            if not any(x in str(ex) for x in ('Timeout', 'not attached', 'detached', 'context was destroyed')):
                prob.append(f'{i} ação falhou: {str(ex)[:100]}')
        if not pg.url.startswith(f):  # voltar saiu do app (antes da 1ª página): reabre
            hist.append('reabrir')
            pg.goto(f)
            pg.wait_for_timeout(300)
        try:
            t = pg.evaluate("document.getElementById('app').innerText+' '+document.getElementById('bar').innerText")
        except Exception:
            continue
        ruim = [x for x in PAD if x in t]
        if ruim or pg.evaluate('window.__xss'):
            prob.append(f'{i} {ruim or "XSS"} após {hist[-3:]} em {pg.evaluate("location.hash")}')
        if errs:
            prob.append(f'{i} erro {errs[:2]} após {hist[-3:]} em {pg.evaluate("location.hash")}')
            errs.clear()
        if (i + 1) % 500 == 0:
            print(f'{i + 1} ações, problemas {len(prob)}', flush=True)
    b.close()
print('ações', N, 'problemas', len(prob))
for x in prob[:30]:
    print(' ', x)
