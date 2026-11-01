const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{const d=w.document;
 for(const q of ['lesão','lesao renal','IRA','kdigo','infarto','sepse','queimadura','avc','gravidez','criança','pneumonia']){w.location.hash='';w.eval('route()');w.eval(`home(${JSON.stringify(q)})`);console.log(q.padEnd(12),[...d.querySelectorAll('#app .item b')].map(b=>b.textContent).slice(0,6).join(' | '))}
 for(const q of ['clonazepam','tramadol','amoxicilina','dipirona']){w.eval(`med('q:${q}')`);const a=d.querySelector('.item[href^="#med-"]');w.location.hash=a.getAttribute('href');w.eval('route()');console.log(q,'=>',d.querySelector('.rx2')?.textContent.replace(/\s+/g,' '))}
 console.log('errors',errs);process.exit(0)},500);
