// compara layout entre tema claro e escuro: posição, tamanho, fonte, bordas e texto de cada elemento
const {chromium}=require('playwright');const fs=require('fs');
const FILL=fs.readFileSync(process.argv[3],'utf8').split('FILL="""')[1].split('"""')[0];
const SNAP=`()=>{const out=[];const els=[...document.querySelectorAll('#bar *, #app *, .dlg *')];
 for(const e of els){if(e.closest('.thm,.thm2'))continue;const r=e.getBoundingClientRect();if(!r.width&&!r.height)continue;const s=getComputedStyle(e);
  out.push([e.tagName+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\\s+/).join('.'):''),Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height),s.fontSize,s.fontWeight,s.fontFamily.split(',')[0],s.borderTopWidth,s.borderLeftWidth,s.paddingTop,s.paddingLeft,s.display,s.visibility,s.opacity==='0'?'0':'',e.children.length?'':e.textContent.trim().slice(0,40)].join('|'))}
 return out}`;
(async()=>{const b=await chromium.launch();const res=[];let pages=0;
for(const w of [320,390,768,1280]){
 const p=await b.newPage({viewport:{width:w,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.argv[2]);await p.addStyleTag({content:'*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}'});await p.waitForTimeout(300);
 const ids=await p.evaluate(()=>TOOLS.map(t=>t.id));
 const views=['','esp','calc','esc','med','med-0','med-973','cid10','cid10-c0','cid10-A00','fav','sobre','instalar','cron',...ids];
 const extra=[['cron:rcp',async()=>{await p.click('.modes [data-m="rcp"]')}],['cron:du',async()=>{await p.click('.modes [data-m="du"]')}],['sobre:novidades',async()=>{await p.click('#verbt')}],['sobre:compartilhar',async()=>{await p.click('#shbt')}],['cron:zerar',async()=>{await p.click('.modes [data-m="rcp"]');await p.click('#rz')}]];
 const cmp=async(name)=>{const snap={};for(const t of ['light','dark']){await p.evaluate(t=>{document.documentElement.dataset.theme=t;document.querySelectorAll('.thm,.thm2').forEach(x=>x.innerHTML=themeIcon())},t);await p.waitForTimeout(20);snap[t]=await p.evaluate(new Function('return ('+SNAP+')()'))}
   pages++;const A=snap.light,B=snap.dark;if(A.length!==B.length){res.push(`${w}px ${name}: número de elementos ${A.length} x ${B.length}`);return}
   for(let i=0;i<A.length;i++)if(A[i]!==B[i]){res.push(`${w}px ${name}: ${A[i]}  ≠  ${B[i]}`);if(res.length>400)return}};
 for(const h of views){await p.evaluate(h=>{document.querySelector('.dlg')?.remove();location.hash='#'+h},h);await p.waitForTimeout(30);if(ids.includes(h)){await p.evaluate(new Function('('+FILL+')()'));await p.waitForTimeout(30)}await cmp(h||'home')}
 for(const [n,f] of extra){await p.evaluate(()=>{document.querySelector('.dlg')?.remove();location.hash='#imc'});await p.waitForTimeout(30);await p.evaluate(h=>location.hash=h,'#'+n.split(':')[0]);await p.waitForTimeout(60);await f();await p.waitForTimeout(80);await cmp(n)}
 if(errs.length)res.push(`${w}px erros JS: ${errs.join('; ')}`);await p.close()}
console.log('telas comparadas:',pages,'| diferenças:',res.length);res.slice(0,60).forEach(x=>console.log(x.slice(0,260)));await b.close()})();
