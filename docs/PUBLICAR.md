# Manutenção do MedPrumo

## Estrutura

```
index.html              página principal (só a estrutura)
manifest.webmanifest    nome, cores e ícones para instalar
sw.js                   cache offline (gerado por tools/version.py)
assets/
  css/app.css           visual do app, temas claro e escuro
  js/app.js             ferramentas, telas e navegação
  js/viewport.js        altura fixa da tela (teclado não reajusta)
  js/pwa.js             registro do service worker
  data/medicamentos.js  lista CMED/ANVISA + tipo de receita
  data/cid10.js         CID-10 oficial DATASUS
  data/growth.js        tabelas LMS da OMS
  icons/                ícones do app
tools/
  version.py            atualiza o cache do service worker
  bundle.py             gera um HTML único (dist/medprumo.html)
docs/
  PUBLICAR.md           este arquivo
```

## Atualizar o app

1. Edite os arquivos em `assets/`
2. Aumente `APP_VERSION` no topo de `assets/js/app.js` (aparece no Sobre), no formato X.Y.Z:
   - **Z** (1.1.0 → 1.1.1): correções e ajustes de texto ou visual
   - **Y** (1.1.1 → 1.2.0): ferramentas ou telas novas
   - **X** (1.2.0 → 2.0.0): mudança grande no app ou nos dados
3. Rode `python3 tools/version.py`
4. Faça o commit e o push para `main`

O GitHub Pages publica em 1 a 2 minutos. Quem já instalou recebe a versão nova na próxima abertura com internet.

## Publicação

GitHub Pages: Settings > Pages > Deploy from a branch > `main` > `/ (root)`.

O arquivo `.nojekyll` evita processamento extra do GitHub.

## HTML único

`python3 tools/bundle.py` junta tudo em `dist/medprumo.html`, sem o service worker. Útil para testar ou enviar o app como um arquivo só. A pasta `dist/` não vai para o repositório.

## Padrões do app

- **iPhone primeiro**: a maioria usa iPhone. Testar no tamanho do iPhone, com a barra do Safari e instalado (área segura do notch e da barra inferior).
- Campos numéricos são `type="text"` com `inputmode="decimal"`: o teclado do iPhone em português usa vírgula, e o `type="number"` do Safari rejeita vírgula.
- Fonte dos campos com pelo menos 16 px, para o iPhone não dar zoom.
- Ícones desenhados em SVG, nunca símbolos que o iPhone transforma em emoji (☀, ⚠ etc.).
- Tela inicial cabe na tela sem rolar.
- Campos começam vazios, opções em botões, nada pré-selecionado.
- Resultados mostram risco, probabilidade ou classificação, sem conduta clínica.
- Sem travessões nem setas nos textos.
