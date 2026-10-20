#!/usr/bin/env python3
"""Gera um único HTML com CSS, JS e dados embutidos (usado no artefato do Claude).

Uso: python3 tools/bundle.py [saida.html]
Padrão: dist/medprumo.html
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'dist' / 'medprumo.html'
html = (ROOT / 'index.html').read_text(encoding='utf-8')

def css(m):
    return '<style>\n' + (ROOT / m.group(1)).read_text(encoding='utf-8') + '</style>'

def js(m):
    if m.group(1).endswith('pwa.js'):
        return ''  # service worker não funciona fora do site
    return '<script>\n' + (ROOT / m.group(1)).read_text(encoding='utf-8') + '</script>'

html = re.sub(r'<link rel="stylesheet" href="(assets/[^"]+)">', css, html)
html = re.sub(r'<script src="(assets/[^"]+)"></script>', js, html)
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(html, encoding='utf-8')
print(f'{out} ({out.stat().st_size // 1024} KB)')
