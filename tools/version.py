#!/usr/bin/env python3
"""Atualiza a versão e o changelog do app (a partir do CHANGELOG.md) e a versão do cache do service worker.

Rodar depois de qualquer mudança, antes do commit: python3 tools/version.py
Assim quem já instalou o app recebe a atualização.
"""
import hashlib, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Changelog dentro do app (Sobre > toque na versão): copiado do CHANGELOG.md
log = []
for line in (ROOT / 'CHANGELOG.md').read_text(encoding='utf-8').splitlines():
    m = re.match(r'^## (\S+)(?: Beta)? \((\d{4}-\d{2}-\d{2})\)', line)
    if m:
        log.append([m.group(1), m.group(2), []])
    elif line.startswith('- ') and log:
        log[-1][2].append(line[2:].strip())
app = ROOT / 'assets/js/app.js'
js = app.read_text(encoding='utf-8')
js = re.sub(r"^const APP_VERSION='[^']*';$", f"const APP_VERSION='{log[0][0]}';", js, count=1, flags=re.M)
js = re.sub(r"^const CHANGES=.*;$", 'const CHANGES=' + json.dumps(log, ensure_ascii=False, separators=(',', ':')) + ';', js, count=1, flags=re.M)
files = ['index.html', 'manifest.webmanifest'] + sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'assets').rglob('*') if p.is_file())
# Tamanho do app instalado (página Instalar), em MB decimais como mostram os celulares
for _ in range(2):
    mb = sum((ROOT / f).stat().st_size for f in files) / 1e6
    js = re.sub(r'ocupa cerca de [\d,]+ MB', 'ocupa cerca de ' + f'{mb:.1f}'.replace('.', ',') + ' MB', js)
    app.write_text(js, encoding='utf-8')
h = hashlib.sha1()
for f in files:
    h.update((ROOT / f).read_bytes())
ver = h.hexdigest()[:8]
sw = ROOT / 'sw.js'
txt = sw.read_text(encoding='utf-8')
txt = re.sub(r"const V='medprumo-[^']*';", f"const V='medprumo-{ver}';", txt)
core = ',\n  '.join(["'./'"] + [f"'{f}'" for f in files])
txt = re.sub(r"const CORE=\[.*?\];", f"const CORE=[\n  {core}\n];", txt, flags=re.S)
sw.write_text(txt, encoding='utf-8')
print('cache', ver, '|', len(files), 'arquivos')
