const fs=require('fs'),postcss=require('postcss'),sp=require('postcss-selector-parser');
const R=require('path').join(__dirname,'..')+'/';
const css=fs.readFileSync(R+'assets/css/app.css','utf8');
const src=['assets/js/app.js','assets/js/viewport.js','assets/js/pwa.js','index.html'].map(f=>fs.readFileSync(R+f,'utf8')).join('\n');
const used=new Map();const isUsed=c=>{if(!used.has(c))used.set(c,new RegExp('(^|[^A-Za-z0-9_-])'+c.replace(/[-]/g,'\\-')+'($|[^A-Za-z0-9_-])').test(src));return used.get(c)};
const root=postcss.parse(css);
const ctx=n=>{let s=[],p=n.parent;while(p&&p.type!=='root'){if(p.type==='atrule')s.unshift('@'+p.name+' '+p.params);p=p.parent}return s.join('|')};
let rmSel=0,rmRule=0,rmDecl=0;const unusedSeen=new Set();
// 1) seletores com classe/id sem uso
root.walkRules(r=>{if(r.parent.type==='atrule'&&/keyframes/.test(r.parent.name))return;
  const keep=[];for(const s of r.selectors){let dead=false;sp(sel=>{sel.walkClasses(c=>{if(!isUsed(c.value)){dead=true;unusedSeen.add('.'+c.value)}});sel.walkIds(c=>{if(!isUsed(c.value)){dead=true;unusedSeen.add('#'+c.value)}})}).processSync(s);
    if(dead)rmSel++;else keep.push(s)}
  if(!keep.length){r.remove();rmRule++}else if(keep.length<r.selectors.length)r.selectors=keep});
// 2) declarações sobrescritas pela mesma regra (mesmo seletor e contexto) mais adiante
const rules=[];root.walkRules(r=>{if(r.parent.type==='atrule'&&/keyframes/.test(r.parent.name))return;rules.push(r)});
const key=r=>ctx(r)+'§'+r.selectors.map(s=>s.replace(/\s+/g,' ').trim()).join(',');
for(let i=0;i<rules.length;i++){const a=rules[i];const k=key(a);
  for(let j=i+1;j<rules.length;j++){const b=rules[j];if(key(b)!==k)continue;
    const bp=new Map();b.walkDecls(d=>bp.set(d.prop,d.important));
    a.walkDecls(d=>{if(bp.has(d.prop)&&(!d.important||bp.get(d.prop))){d.remove();rmDecl++}})}}
root.walkRules(r=>{if(!r.nodes.length){r.remove();rmRule++}});
root.walkAtRules(a=>{if(a.nodes&&!a.nodes.length){a.remove()}});
fs.writeFileSync(process.argv[2]||'app.clean.css',root.toString());
console.log({rmSel,rmRule,rmDecl,unused:[...unusedSeen].sort().join(' ')});
