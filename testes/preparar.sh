#!/bin/sh
# Instala dependências (uma vez) e gera testes/medcalc.html a partir do código atual
set -e
cd "$(dirname "$0")"
[ -d node_modules ] || npm i --silent
cd ..
python3 tools/version.py
python3 tools/bundle.py testes/medcalc.html
