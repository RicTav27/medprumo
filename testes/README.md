# Testes do MedPrumo

Scripts de teste usados no desenvolvimento. Não fazem parte do app nem entram no cache offline.

## Preparar
```
./preparar.sh      # instala dependências (uma vez) e gera testes/medcalc.html
```
Playwright e Chromium precisam estar instalados no sistema.

## Rodar (de dentro de testes/)
| Comando | O que testa |
|---|---|
| `node fuzz.js` | todas as ferramentas com entradas aleatórias |
| `node audit.js` | ids repetidos e textos de interpretação |
| `node allpages.js` | todas as páginas abrem sem erro |
| `node nenhum.js` | botão "Nenhum se aplica" |
| `node ref.js` | valores esperados de referência |
| `node numero.js` | leitura dos números digitados (vírgula, ponto, milhar como 1.000, texto inválido) |
| `node rev.js`, `node fmt2.js`, `node formato.js` | formatação de resultados |
| `node meem.js` | Mini-Mental |
| `node medchk.js [nomes]` | base de medicamentos |
| `node dom3.js` a `node dom17.js` | casos específicos de ferramentas |
| `node cron.js "$PWD/medcalc.html"` (e cron2 a cron16) | cronômetros; cron4 pede uma pasta de saída como 2º argumento |
| `node temas.js "$PWD/medcalc.html" shoot.py` | layout igual entre temas claro e escuro |
| `node disp.js "$PWD/medcalc.html" shoot.py` | 6 celulares simulados |
| `python3 aparelhos.py` | 55 aparelhos e 33 larguras |
| `python3 mobile.py`, `bordas.py`, `colors.py`, `busca.py`, `kb.py`, `novos.py` | celular, bordas, cores, busca, teclado, ferramentas novas |
| `python3 pwatest.py` | funcionamento offline |
| `python3 seguranca.py` | segurança no site servido localmente: CSP, endereços e dados salvos maliciosos ou corrompidos, buscas, service worker sem internet |
| `python3 macaco.py [ações] [semente]` | ações aleatórias em celular simulado (padrão 3.000) |
| `python3 fmtaudit.py "$PWD/medcalc.html" shoot.py` | auditoria de formatação |
| `node dump.js` | exporta textos das ferramentas para `rev/` (revisão) |
| `./lint.sh` | ESLint (1 aviso intencional de atribuição em condição) |

## Cuidado
- `cssclean.js` grava o CSS limpo no arquivo passado como argumento. Nunca passar `medcalc.html` nem `app.css`.
