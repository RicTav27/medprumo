#!/usr/bin/env python3
"""Atualiza a versão do cache do service worker a partir do conteúdo dos arquivos.

Rodar depois de qualquer mudança, antes do commit: python3 tools/version.py
Assim quem já instalou o app recebe a atualização.
"""
import hashlib, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
files = ['index.html', 'manifest.webmanifest'] + sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'assets').rglob('*') if p.is_file())
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
