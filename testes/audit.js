const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});w.requestAnimationFrame=f=>f();const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{const d=w.document;const T=w.eval('TOOLS'),S=w.eval('SCORE_IDS'),C=w.eval('CATS'),K=w.eval('KW');
 const ids=T.map(t=>t.id);const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);
 console.log('ferramentas',ids.length,'ids duplicados',dup);
 console.log('SCORE_IDS inexistentes',S.filter(x=>!ids.includes(x)),'duplicados em SCORE_IDS',S.filter((x,i)=>S.indexOf(x)!==i));
 console.log('categorias fora de CATS',[...new Set(T.map(t=>t.cat))].filter(c=>!C.includes(c)),'CATS vazias',C.filter(c=>!T.some(t=>t.cat===c)));
 console.log('sem KW',ids.filter(i=>!K[i]));
 console.log('sem fonte/sub',T.filter(t=>!t.src||!t.sub).map(t=>t.id));
 const dupEl=[],howErr=[];
 for(const t of T){w.location.hash='#'+t.id;w.eval('route()');const a=d.getElementById('app');const el=[...a.querySelectorAll('[id]')].map(e=>e.id);const dd=el.filter((x,i)=>el.indexOf(x)!==i);if(dd.length)dupEl.push([t.id,[...new Set(dd)]]);
  try{const h=t.how();if(!h||/undefined|NaN/.test(h))howErr.push(t.id)}catch(e){howErr.push(t.id+':'+e.message)}}
 console.log('ids repetidos dentro da página',dupEl);console.log('how com problema',howErr);
 console.log('erros',errs);process.exit(0)},300);
