"""Testes antigos que só imprimem valores (dom3 a dom18, rev, fmt2, formato, meem, busca).
Compara a saída de cada um com a cópia guardada em golden/. Só mostra o que mudou.
  python3 antigos.py            compara
  python3 antigos.py --aceitar  grava a saída atual como a nova referência (depois de conferir a mudança)
"""
import difflib, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
T = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(T, 'golden')
NOMES = [f'dom{i}' for i in range(3, 19)] + ['rev', 'fmt2', 'formato', 'meem', 'busca']


def roda(n):
    cmd = ['python3', 'busca.py'] if n == 'busca' else ['node', n + '.js']
    try:
        p = subprocess.run(cmd, cwd=T, capture_output=True, text=True, timeout=300)
        return n, p.stdout + p.stderr
    except subprocess.TimeoutExpired:
        return n, '(tempo esgotado)'


os.makedirs(G, exist_ok=True)
with ThreadPoolExecutor(4) as ex:
    res = list(ex.map(roda, NOMES))
mud = 0
for n, out in res:
    f = os.path.join(G, n + '.txt')
    if '--aceitar' in sys.argv or not os.path.exists(f):
        open(f, 'w', encoding='utf-8').write(out)
        continue
    old = open(f, encoding='utf-8').read()
    if old == out:
        continue
    mud += 1
    d = [l for l in difflib.unified_diff(old.splitlines(), out.splitlines(), lineterm='', n=0) if l[:1] in '+-' and l[:3] not in ('+++', '---')]
    print(f'MUDOU {n}: {len(d)} linhas')
    for l in d[:8]:
        print('   ' + l[:220])
print(f'testes antigos: {len(res)} | com saída diferente: {mud}')
