// Procura código morto e listas inconsistentes. Saída: JSON em stdout (usado pelo checar.py).
const fs = require('fs'), path = require('path');
const postcss = require('postcss'), sp = require('postcss-selector-parser');
const R = path.join(__dirname, '..') + '/';
const APP = 'assets/js/app.js', CSS = 'assets/css/app.css';
const app = fs.readFileSync(R + APP, 'utf8');
const css = fs.readFileSync(R + CSS, 'utf8');
const src = [APP, 'assets/js/viewport.js', 'assets/js/pwa.js', 'index.html'].map(f => fs.readFileSync(R + f, 'utf8')).join('\n');
const lineOf = (txt, i) => txt.slice(0, i).split('\n').length;
const out = [];
const add = (grupo, arquivo, linha, msg, dica) => out.push({ grupo, arquivo, linha, msg, dica });

// 1) Ícones do objeto ICON sem uso
const ia = app.indexOf('const ICON={');
if (ia >= 0) {
  let d = 0, ib = ia;
  for (let i = app.indexOf('{', ia); i < app.length; i++) { if (app[i] === '{') d++; else if (app[i] === '}') { d--; if (!d) { ib = i; break } } }
  const block = app.slice(ia, ib), rest = app.slice(0, ia) + app.slice(ib);
  for (const m of block.matchAll(/(?:^|[,{]\s*)([A-Za-z_]\w*)\s*:/g)) {
    const k = m[1];
    if (!new RegExp(`['"\`]${k}['"\`]|ICON\\.${k}\\b|ICON\\[['"]${k}`).test(rest))
      add('Limpeza', APP, lineOf(app, ia + m.index), `Ícone "${k}" sem uso no objeto ICON`, 'Apagar a entrada do ICON.');
  }
}

// 2) Ids de ferramenta citados em listas que não existem
const ids = new Set([...app.matchAll(/\{id:'([^']+)'/g)].map(m => m[1]));
for (const nome of ['TIPO_ESP', 'KW']) {
  const a = app.indexOf(`const ${nome}={`); if (a < 0) continue;
  const b = app.indexOf('}', a), blk = app.slice(a, b);
  for (const m of blk.matchAll(/([A-Za-z_]\w*)\s*:/g))
    if (!ids.has(m[1])) add('Erro', APP, lineOf(app, a + m.index), `${nome} cita a ferramenta "${m[1]}", que não existe`, 'Corrigir o id ou apagar a entrada.');
}

// 3) Sinônimos da CID-10 que não acham nenhum código
const ca = app.indexOf('const CID_SIN=');
if (ca >= 0) {
  const cb = app.indexOf('};', ca);
  const CID_SIN = eval('(' + app.slice(ca + 14, cb + 1) + ')');
  const ctx = {}; new Function('ctx', fs.readFileSync(R + 'assets/data/cid10.js', 'utf8') + ';ctx.C=CID10')(ctx);
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/([a-z0-9])-(?=[a-z0-9])/g, '$1');
  const W = s => ' ' + norm(s).replace(/[^a-z0-9]+/g, ' ');
  const rows = ctx.C.map(r => W(r[1]));
  for (const [k, v] of Object.entries(CID_SIN)) {
    for (const p of v) if (!rows.some(t => t.includes(W(p))))
      add('Aviso', APP, lineOf(app, app.indexOf(`'${k}':`, ca)), `Sinônimo CID-10 "${k}" → "${p}" não acha nenhum código`, 'Trocar o trecho por um que exista na tabela ou apagar.');
  }
}

// 3b) Sinônimos de Medicamentos que não acham nenhum princípio ativo (começo de palavra, como na busca)
const ma = app.indexOf('const MED_SIN=');
if (ma >= 0) {
  const mb = app.indexOf('};', ma);
  const MED_SIN = eval('(' + app.slice(ma + 14, mb + 1) + ')');
  const ctxM = {}; new Function('ctx', fs.readFileSync(R + 'assets/data/medicamentos.js', 'utf8') + ';ctx.M=MED')(ctxM);
  const normM = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/([a-z0-9])-(?=[a-z0-9])/g, '$1');
  const names = ctxM.M.d.map(m => ' ' + normM(m[0]));
  for (const [k, v] of Object.entries(MED_SIN)) {
    if (k !== normM(k)) add('Aviso', APP, lineOf(app, app.indexOf(`'${k}':`, ma)), `Sinônimo de medicamento "${k}" tem acento ou maiúscula`, 'A chave tem que estar sem acento e em minúsculas.');
    for (const p of v) if (!names.some(t => t.includes(' ' + p)))
      add('Aviso', APP, lineOf(app, app.indexOf(`'${k}':`, ma)), `Sinônimo de medicamento "${k}" → "${p}" não acha nenhum princípio ativo`, 'Trocar o trecho por um que exista na CMED ou apagar.');
  }
}

// 4) CSS: seletores com classe/id sem uso e declarações sobrescritas na mesma regra
const root = postcss.parse(css);
const isUsed = c => new RegExp('(^|[^A-Za-z0-9_-])' + c.replace(/-/g, '\\-') + '($|[^A-Za-z0-9_-])').test(src);
const inKf = r => r.parent.type === 'atrule' && /keyframes/.test(r.parent.name);
root.walkRules(r => {
  if (inKf(r)) return;
  for (const s of r.selectors) {
    const dead = [];
    sp(sel => { sel.walkClasses(c => { if (!isUsed(c.value)) dead.push('.' + c.value) }); sel.walkIds(c => { if (!isUsed(c.value)) dead.push('#' + c.value) }) }).processSync(s);
    if (dead.length) add('Limpeza', CSS, r.source.start.line, `Seletor "${s}" usa ${dead.join(', ')} que não aparece no código`, 'Apagar o seletor.');
  }
});
const ctxOf = n => { let s = [], p = n.parent; while (p && p.type !== 'root') { if (p.type === 'atrule') s.unshift('@' + p.name + ' ' + p.params); p = p.parent } return s.join('|') };
const rules = []; root.walkRules(r => { if (!inKf(r)) rules.push(r) });
const key = r => ctxOf(r) + '§' + r.selectors.map(s => s.replace(/\s+/g, ' ').trim()).join(',');
for (let i = 0; i < rules.length; i++) for (let j = i + 1; j < rules.length; j++) {
  if (key(rules[i]) !== key(rules[j])) continue;
  const bp = new Map(); rules[j].walkDecls(d => bp.set(d.prop, d));
  rules[i].walkDecls(d => {
    const e = bp.get(d.prop);
    if (e && (!d.important || e.important)) add('Limpeza', CSS, d.source.start.line, `"${rules[i].selector}" ${d.prop}: ${d.value} é sobrescrito na linha ${e.source.start.line} (${e.value})`, 'Apagar a declaração da linha indicada.');
  });
}

console.log(JSON.stringify(out));
