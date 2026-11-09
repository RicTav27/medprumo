#!/usr/bin/env python3
"""Roda as checagens do MedPrumo e junta tudo num relatório só.

Uso (de qualquer pasta):
  python3 testes/checar.py              rápido (~30 s): lógica, páginas, lint, código morto
  python3 testes/checar.py --completo   + temas, celular, cores, segurança, offline (~3 min)
  python3 testes/checar.py --seguido    um teste por vez (mais lento; para máquina fraca ou resultado instável)

Os testes rodam em paralelo (dois por núcleo, até 4; a maior parte do tempo é espera). Cada um usa sua própria porta e só lê os arquivos do app.
  python3 testes/checar.py --tudo       + aparelhos e macaco (~25 min)

Saída: resumo no terminal + testes/relatorio.html (abrir no navegador) + testes/relatorio.json.
Código de saída 1 se houver Erro (bloqueia envio).
"""
import html, json, os, re, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

T = os.path.dirname(os.path.abspath(__file__))
R = os.path.dirname(T)
MODO = 'tudo' if '--tudo' in sys.argv else 'completo' if '--completo' in sys.argv else 'rapido'
HTMLF = os.path.join(T, 'medcalc.html')

# Avisos do lint que são intencionais (regra, trecho da linha)
LINT_OK = [('no-cond-assign', '')]

# Cores fora dos tokens já conhecidas: logo (svg), fundo translúcido das etiquetas, borda translúcida dos campos
CORES_OK = r'\|(svg|path|rect):fill$|SPAN\.tag:backgroundColor$|INPUT:border\w*Color$'

itens, logs = [], []


def add(grupo, origem, msg, arquivo='', linha=0, dica=''):
    itens.append(dict(grupo=grupo, origem=origem, msg=msg, arquivo=arquivo, linha=linha, dica=dica))


def run(nome, cmd, timeout=900):
    t0 = time.time()
    try:
        p = subprocess.run(cmd, cwd=T, shell=True, capture_output=True, text=True, timeout=timeout)
        out, rc = p.stdout + p.stderr, p.returncode
    except subprocess.TimeoutExpired:
        out, rc = f'(tempo esgotado em {timeout} s)', -1
    dt = time.time() - t0
    logs.append(dict(nome=nome, cmd=cmd, rc=rc, seg=round(dt), out=out[-20000:]))
    print(f'  {nome:<12} {dt:5.0f} s', flush=True)
    if rc not in (0, None) and nome not in ('lint',):
        add('Erro', nome, f'Script terminou com código {rc}', dica='Ver o log do teste no fim do relatório.')
    return out


def listas_cheias(nome, out):
    """Linhas no formato 'rótulo [...]' ou 'problemas N' com conteúdo viram Erro."""
    for ln in out.splitlines():
        if ln.startswith('OK '):
            continue
        if ln.startswith('FALHA'):
            add('Erro', nome, ln[6:].strip()[:400])
            continue
        for m in re.finditer(r'([\wÀ-ú /]+?)\s*(\[[^\]]+\])', ln):
            if m.group(2) != '[]':
                add('Erro', nome, f'{m.group(1).strip()}: {m.group(2)[:400]}')
        m = re.search(r'(problemas|falhas|diferenças)\s*:?\s*(\d+)', ln) or re.search(r'(^|,)\s*(\d+)\s+(?:problemas|falhas|diferenças)\b', ln)
        if m and m.group(2) != '0':
            add('Erro', nome, ln.strip()[:400])


# ---------------------------------------------------------------- preparar
print(f'MedPrumo, checagem {MODO}')
if not os.path.isdir(os.path.join(T, 'node_modules')):
    run('npm', 'npm i --silent', 600)
# Versão, tela Novidades e hash do cache (sw.js): gerados antes do bundle para o commit nunca sair com cache antigo
run('version', f'python3 {R}/tools/version.py')
run('bundle', f'python3 {R}/tools/bundle.py {HTMLF}')


def cache_ok():
    """O hash em sw.js tem que ser o dos arquivos atuais (mesma conta do tools/version.py)."""
    import hashlib
    arqs = ['index.html', 'manifest.webmanifest'] + sorted(
        os.path.relpath(os.path.join(d, f), R).replace(os.sep, '/') for d, _, fs in os.walk(os.path.join(R, 'assets')) for f in fs)
    h = hashlib.sha1()
    for f in arqs:
        h.update(open(os.path.join(R, f), 'rb').read())
    sw = open(os.path.join(R, 'sw.js'), encoding='utf-8').read()
    m = re.search(r"const V='medprumo-([0-9a-f]+)'", sw)
    if not m or m.group(1) != h.hexdigest()[:8]:
        add('Erro', 'cache', f"sw.js com hash {m.group(1) if m else '?'}, esperado {h.hexdigest()[:8]}", 'sw.js', 2,
            'Rodar python3 tools/version.py antes do commit.')
    for f in arqs:
        if f"'{f}'" not in sw:
            add('Erro', 'cache', f'Arquivo fora da lista offline do sw.js: {f}', 'sw.js', 0, 'Rodar python3 tools/version.py.')


cache_ok()

# ---------------------------------------------------------------- lógica
LOGICA = ['audit', 'allpages', 'fuzz', 'numero', 'nenhum', 'dom19', 'dom20']

# ---------------------------------------------------------------- lint com linha no arquivo original
FONTES = ['assets/data/growth.js', 'assets/data/cid10.js', 'assets/data/medicamentos.js', 'assets/js/viewport.js', 'assets/js/app.js']
mapa, ini = [], 1
partes = []
for f in FONTES:
    txt = open(os.path.join(R, f), encoding='utf-8').read()
    if not txt.endswith('\n'):
        txt += '\n'
    n = txt.count('\n')
    mapa.append((ini, ini + n - 1, f))
    ini += n
    partes.append(txt)
allp = os.path.join(T, 'all.js')
open(allp, 'w', encoding='utf-8').write(''.join(partes))

# ---------------------------------------------------------------- roda tudo (em paralelo) e depois lê as saídas
FILA = [(n, f'node {n}.js', 900) for n in LOGICA] + [
    ('ref', 'node ref.js', 900),  # informativo: compara esperado x app
    ('lint', 'npx eslint --no-eslintrc -c .eslintrc.json -f json all.js', 900),
    ('limpeza', 'node limpeza.js', 900)]
if MODO in ('completo', 'tudo'):
    FILA += [('temas', f'node temas.js "{HTMLF}" shoot.py', 900), ('seguranca', 'python3 seguranca.py', 900),
             ('mobile', 'python3 mobile.py', 900), ('cron17', f'node cron17.js "{HTMLF}"', 900),
             ('cores', 'python3 colors.py', 900), ('pwatest', 'python3 pwatest.py', 900), ('pwa2', 'python3 pwa2.py', 900)]
if MODO == 'tudo':
    FILA += [('aparelhos', 'python3 aparelhos.py', 1800), ('macaco', 'python3 macaco.py', 1800)]
N = 1 if '--seguido' in sys.argv else max(1, min(4, 2 * (os.cpu_count() or 1)))
t_ini = time.time()
with ThreadPoolExecutor(N) as ex:
    fut = {n: ex.submit(run, n, c, t) for n, c, t in FILA}
OUT = {n: f.result() for n, f in fut.items()}
print(f'  total        {time.time() - t_ini:5.0f} s ({N} por vez)', flush=True)
ordem = ['version', 'bundle'] + [n for n, _, _ in FILA]
logs.sort(key=lambda l: ordem.index(l['nome']) if l['nome'] in ordem else -1)
os.remove(allp)
for n in LOGICA:
    listas_cheias(n, OUT[n])
next(l for l in logs if l['nome'] == 'ref')['nota'] = 'Informativo: conferir se o valor do app bate com o esperado.'
out = OUT['lint']
try:
    res = json.loads(out[out.index('['):])
    srcl = ''.join(partes).splitlines()
    for m in res[0]['messages']:
        l = m.get('line', 0)
        f, lf = next(((f, l - a + 1) for a, b, f in mapa if a <= l <= b), ('?', l))
        txt = srcl[l - 1] if 0 < l <= len(srcl) else ''
        if any(m.get('ruleId') == r and s in txt for r, s in LINT_OK):
            continue
        g = 'Erro' if m['severity'] == 2 else ('Limpeza' if m.get('ruleId') == 'no-unused-vars' else 'Aviso')
        add(g, 'lint', f"{m['message']} ({m.get('ruleId')})", f, lf,
            'Apagar se não for usado.' if g == 'Limpeza' else '')
except Exception as e:  # noqa
    add('Erro', 'lint', f'Não consegui ler a saída do ESLint: {e}')

# ---------------------------------------------------------------- código morto e listas
out = OUT['limpeza']
try:
    for x in json.loads(out.strip().splitlines()[-1]):
        add(x['grupo'], 'limpeza', x['msg'], x['arquivo'], x['linha'], x['dica'])
except Exception as e:  # noqa
    add('Erro', 'limpeza', f'Falha ao ler limpeza.js: {e}')

# ---------------------------------------------------------------- interface (completo)
if MODO in ('completo', 'tudo'):
    out = OUT['temas']
    listas_cheias('temas', out)
    out = OUT['mobile']
    for ln in out.splitlines():
        if re.search(r'vazamento lateral: (?!nenhum)', ln) or re.search(r'fonte < 16px.*: (?!nenhum)', ln):
            add('Erro', 'mobile', ln.strip())
        if 'erros JS' in ln and '[]' not in ln:
            add('Erro', 'mobile', ln.strip())
        m = re.search(r'alvos de toque < 32px: (\d+)', ln)
        if m and m.group(1) != '0':
            add('Aviso', 'mobile', ln.strip(), dica='Rodar python3 testes/mobile.py para ver a lista.')
        if re.search(r'altura \d+ (?!OK)|largura (?!OK)', ln):
            add('Erro', 'mobile', ln.strip())
    out = OUT['cron17']
    for ln in out.splitlines():
        if ln.startswith('ERRO '):
            add('Erro', 'cron17', ln[5:].strip()[:400])
    out = OUT['cores']
    for ln in out.splitlines():
        if 'NAO-TOKEN' in ln and not all(re.search(CORES_OK, x) for x in re.findall(r"'([^']*)'", ln)):
            add('Aviso', 'cores', 'Cor fora dos tokens: ' + ln.strip()[:300], dica='Trocar por var(--...) se não for intencional.')
    for n in ['seguranca', 'pwatest', 'pwa2']:
        listas_cheias(n, OUT[n])

if MODO == 'tudo':
    listas_cheias('aparelhos', OUT['aparelhos'])
    listas_cheias('macaco', OUT['macaco'])

# ---------------------------------------------------------------- relatório
ORD = {'Erro': 0, 'Aviso': 1, 'Limpeza': 2}
itens.sort(key=lambda x: (ORD[x['grupo']], x['arquivo'], x['linha']))
cont = {g: sum(1 for x in itens if x['grupo'] == g) for g in ORD}
json.dump(dict(modo=MODO, data=time.strftime('%d/%m/%Y %H:%M'), contagem=cont, itens=itens),
          open(os.path.join(T, 'relatorio.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

e = html.escape
COR = {'Erro': '#b3261e', 'Aviso': '#946000', 'Limpeza': '#0b6e79'}
linhas = ''.join(
    f'<tr data-g="{x["grupo"]}"><td><span class="g" style="background:{COR[x["grupo"]]}">{x["grupo"]}</span></td>'
    f'<td>{e(x["origem"])}</td><td class="loc">{e(x["arquivo"])}{":" + str(x["linha"]) if x["linha"] else ""}</td>'
    f'<td>{e(x["msg"])}{"<div class=d>" + e(x["dica"]) + "</div>" if x["dica"] else ""}</td></tr>' for x in itens)
logh = ''.join(
    f'<details><summary>{e(l["nome"])} · {l["seg"]} s · código {l["rc"]}</summary>'
    f'{"<p>" + e(l["nota"]) + "</p>" if l.get("nota") else ""}<code>{e(l["cmd"])}</code><pre>{e(l["out"])}</pre></details>' for l in logs)
btn = ''.join(f'<button data-f="{g}">{g} ({cont[g]})</button>' for g in ORD)
pagina = f'''<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MedPrumo · checagem</title><style>
body{{font:15px system-ui,sans-serif;margin:0;padding:16px;background:#f4f7f8;color:#10181b}}
h1{{font-size:1.2rem;margin:0 0 4px}}.sub{{color:#5b6b71;margin-bottom:12px}}
.res{{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}}
button{{font:inherit;border:1px solid #c9d5d9;background:#fff;border-radius:99px;padding:6px 14px;cursor:pointer}}
button.on{{background:#0b6e79;color:#fff;border-color:#0b6e79}}
input{{font:inherit;padding:8px 10px;border:1px solid #c9d5d9;border-radius:8px;width:100%;box-sizing:border-box;margin-bottom:12px}}
table{{border-collapse:collapse;width:100%;background:#fff;border-radius:12px;overflow:hidden}}
td{{padding:8px 10px;border-top:1px solid #e3eaec;vertical-align:top}}
.g{{color:#fff;border-radius:6px;padding:2px 8px;font-size:.8rem;font-weight:600}}
.loc{{font-family:ui-monospace,monospace;font-size:.85rem;white-space:nowrap;cursor:copy}}
.d{{color:#5b6b71;font-size:.85rem;margin-top:2px}}.ok{{padding:24px;text-align:center;background:#fff;border-radius:12px}}
details{{background:#fff;border-radius:8px;margin:6px 0;padding:8px 12px}}pre{{white-space:pre-wrap;font-size:.8rem;max-height:400px;overflow:auto}}
</style></head><body>
<h1>Checagem MedPrumo</h1><div class="sub">{time.strftime('%d/%m/%Y %H:%M')} · modo {MODO} · clique no arquivo:linha para copiar</div>
<div class="res"><button data-f="" class="on">Todos ({len(itens)})</button>{btn}</div>
<input id="q" placeholder="Filtrar por texto, arquivo ou teste">
{'<table>' + linhas + '</table>' if itens else '<div class="ok">Nenhum problema encontrado.</div>'}
<h2 style="font-size:1rem;margin-top:24px">Logs dos testes</h2>{logh}
<script>
let f='';const q=document.getElementById('q');
const pinta=()=>document.querySelectorAll('tr').forEach(r=>r.hidden=(f&&r.dataset.g!==f)||!r.textContent.toLowerCase().includes(q.value.toLowerCase()));
document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{{f=b.dataset.f;document.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('on',x===b));pinta()}});
q.oninput=pinta;
document.querySelectorAll('.loc').forEach(c=>c.onclick=()=>navigator.clipboard&&navigator.clipboard.writeText(c.textContent));
</script></body></html>'''
open(os.path.join(T, 'relatorio.html'), 'w', encoding='utf-8').write(pagina)

print(f"\nErros {cont['Erro']} · Avisos {cont['Aviso']} · Limpeza {cont['Limpeza']}")
for x in itens:
    loc = f"{x['arquivo']}:{x['linha']}" if x['linha'] else x['origem']
    print(f"  [{x['grupo'][:3]}] {loc:<28} {x['msg'][:110]}")
print(f'\nRelatório: {os.path.join(T, "relatorio.html")}')
sys.exit(1 if cont['Erro'] else 0)
