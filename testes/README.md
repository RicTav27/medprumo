# Testes do MedPrumo

Scripts de teste usados no desenvolvimento. Não fazem parte do app nem entram no cache offline.

## Preparar
```
./preparar.sh      # instala dependências (uma vez) e gera testes/medcalc.html
```
Playwright e Chromium precisam estar instalados no sistema.

## Checagem rápida (recomendado)
```
python3 testes/checar.py              # ~30 s: lógica, páginas, lint e código morto
python3 testes/checar.py --completo   # ~5 min: + temas, celular, cores, segurança, offline
python3 testes/checar.py --tudo       # + aparelhos e macaco (~25 min)
```
Gera o bundle sozinho, roda os testes e junta tudo em `testes/relatorio.html` (filtro por Erro, Aviso e Limpeza, busca por texto, arquivo:linha copiável, log de cada teste). Também imprime o resumo no terminal e grava `relatorio.json`. Sai com código 1 se houver Erro.
- **Erro:** bloqueia envio (teste falhou, lint com erro, lista citando ferramenta inexistente).
- **Aviso:** conferir (sinônimo da CID-10 que não acha código, cor fora dos tokens, alvo de toque pequeno).
- **Limpeza:** código morto (função ou ícone sem uso, seletor CSS sem uso, declaração CSS sobrescrita na mesma regra).
- Itens intencionais ficam em `LINT_OK` e `CORES_OK` no `checar.py`. `node limpeza.js` roda só a parte de código morto (saída JSON).
- Não pega ícone cujo nome também é usado como texto em outro lugar (ex.: rota).

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
| `node limpeza.js` | código morto e listas inconsistentes (JSON) |
| `python3 checar.py` | todos acima juntos, com relatório |

## Cuidado
- `cssclean.js` grava o CSS limpo no arquivo passado como argumento. Nunca passar `medcalc.html` nem `app.css`.
