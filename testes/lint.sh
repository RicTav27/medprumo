#!/bin/sh
# ESLint sobre os scripts do app concatenados (1 aviso intencional de atribuição em condição)
set -e
cd "$(dirname "$0")"
A=../assets
cat $A/data/growth.js $A/data/cid10.js $A/data/medicamentos.js $A/js/viewport.js $A/js/app.js > all.js
npx eslint --no-eslintrc -c .eslintrc.json all.js
rm -f all.js
