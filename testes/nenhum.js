const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});w.requestAnimationFrame=f=>f();const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{const d=w.document,T=w.eval('TOOLS').map(t=>t.id),txt=()=>d.getElementById('out').textContent.replace(/\s+/g,' ');const com=[],bad=[];
 for(const id of T){w.location.hash='#'+id;w.eval('route()');const b=d.getElementById('nonebt');if(!b)continue;com.push(id);
  b.click();const t1=txt();if(/Preencha|Faltam/.test(t1))bad.push(id+': '+t1);
  const c=d.querySelector('#app input[type=checkbox]');c.checked=true;c.dispatchEvent(new w.Event('change'));if(b.getAttribute('aria-pressed')!=='false')bad.push(id+' botão não soltou');
  b.click();if(c.checked)bad.push(id+' não desmarcou');b.click();if(!/Preencha/.test(txt()))bad.push(id+' não voltou');
  if(id==='aspects'||id==='ottawat'||id==='qsofa'||id==='cspine'){b.click();console.log(id.padEnd(8),txt().slice(0,110))}}
 console.log('com botão',com.length,com.join(' '));console.log('problemas',bad,'erros',errs);process.exit(0)},300);
