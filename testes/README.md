# Testes do MedPrumo

Scripts de teste usados no desenvolvimento. Não fazem parte do app nem entram no cache offline.

## Preparar
```
./preparar.sh      # instala dependências (uma vez) e gera testes/medcalc.html
```
Playwright e Chromium precisam estar instalados no sistema.

## Checagem rápida (recomendado)
```
python3 testes/checar.py              # ~20 s: lógica, páginas, lint, código morto e hash do cache
python3 testes/checar.py --completo   # ~2,5 min: + temas, celular, cores, segurança, offline, atualização do app
python3 testes/checar.py --tudo       # + aparelhos e macaco (~25 min)
```
Roda `tools/version.py` (versão e hash do cache em `sw.js`), gera o bundle, roda os testes em paralelo (`--seguido` roda um por vez) e junta tudo em `testes/relatorio.html` (filtro por Erro, Aviso e Limpeza, busca por texto, arquivo:linha copiável, log de cada teste). Também imprime o resumo no terminal e grava `relatorio.json`. Sai com código 1 se houver Erro.
- **Erro:** bloqueia envio (teste falhou, lint com erro, lista citando ferramenta inexistente).
- **Aviso:** conferir (sinônimo da CID-10 que não acha código, cor fora dos tokens, alvo de toque pequeno).
- **Limpeza:** código morto (função ou ícone sem uso, seletor CSS sem uso, declaração CSS sobrescrita na mesma regra).
- Itens intencionais ficam em `LINT_OK` e `CORES_OK` no `checar.py`. `node limpeza.js` roda só a parte de código morto (saída JSON).
- Não pega ícone cujo nome também é usado como texto em outro lugar (ex.: rota).

## O que cada modo roda
| Modo | Testes | Para quê |
|---|---|---|
| rápido | `audit`, `allpages`, `fuzz`, `numero`, `nenhum`, `dom19`, `dom20`, `ref`, lint, `limpeza` | lógica das ferramentas, páginas, código morto |
| `--completo` | + `telas`, `antigos`, `temas`, `cores`, `cron17`, `seguranca`, `pwatest`, `pwa2` | o que se exige antes de enviar |
| `--tudo` | + `telas --todos` (45 aparelhos), `macaco` | antes de versão grande |

## Testes de interface
| Comando | O que testa |
|---|---|
| `python3 telas.py` | 19 telas (celular, deitado, tablet, computador): tela inicial cabe e não vaza; todas as páginas em 11 larguras (uma de cada lado de cada ponto de quebra do CSS): vazamento lateral, texto cortado, campo com fonte < 16 px, alvo de toque < 32 px; contraste do texto nos dois temas (WCAG). `--todos`: 45 aparelhos. `--fotos`: capturas em `telas_shots/` |
| `python3 antigos.py` | roda `dom3` a `dom18`, `rev`, `fmt2`, `formato`, `meem` e `busca` e compara a saída com `golden/`. Só mostra o que mudou. `--aceitar` grava a nova referência |
| `node temas.js "$PWD/medcalc.html" shoot.py` | layout igual entre tema claro e escuro |
| `python3 colors.py` | cores fora dos tokens |
| `python3 pwa2.py`, `pwatest.py`, `seguranca.py` | PWA, offline e segurança |
| `python3 macaco.py [ações] [semente]` | ações aleatórias em celular simulado |

## Só à mão
| Comando | Quando |
|---|---|
| `node cron.js "$PWD/medcalc.html"` (e `cron2` a `cron16`) | mexeu no cronômetro; a saída varia em 1 s, comparar a olho. O `cron17` é o que roda no `checar.py` |
| `python3 fmtaudit.py "$PWD/medcalc.html" shoot.py` | auditoria de formatação (saída longa) |
| `node dump.js`, `node medchk.js [nomes]` | exportar textos para revisão; consultar a base de medicamentos |

## Cuidado
- Não regravar `medcalc.html` enquanto o `checar.py` roda.
