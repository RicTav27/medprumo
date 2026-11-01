// amiodarona: 300 mg após o 3º choque, 150 mg após o 5º (2 choques depois da 1ª dose)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
const st=async p=>p.evaluate(()=>['dA','dM','dS'].map(id=>{const d=document.getElementById(id);return d.querySelector('.dn').textContent.slice(0,5)+':'+d.querySelector('.dc').textContent+' '+d.querySelector('.dt').textContent+(d.dataset.state?'['+d.dataset.state+']':'')+(d.dataset.off==='true'?'(off)':'')}).join('  '));
const F=['c','S','c','S','A','c','S','M'];
const S=[
 ['choque 3 + amio 300',F],
 ['choque 4',[...F,'c','S']],
 ['choque 5',[...F,'c','S','c','S']],
 ['choque 5 + amio 150',[...F,'c','S','c','S','M']],
 ['choque 6 (amio completa)',[...F,'c','S','c','S','M','c','S']],
 ['amio 300 tardia no choque 5',['c','S','c','S','c','S','c','S','c','S','M']],
 ['  … choque 6',['c','S','c','S','c','S','c','S','c','S','M','c','S']],
 ['  … choque 7',['c','S','c','S','c','S','c','S','c','S','M','c','S','c','S']],
 ['choque 5 mas ritmo AESP',[...F,'c','S','c','S','n']],
 ['AESP → FV no choque 5',[...F,'c','S','n','c','S']],
];
for(const [nome,seq] of S){const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errs.push(e.message));await p.clock.install();await p.goto('file://'+process.argv[2]+'#cron');await p.clock.runFor(300);await p.click('.modes [data-m="rcp"]');await p.click('#b1');await p.clock.runFor(1000);
 for(const k of seq){if(typeof k==='number')await p.clock.runFor(k);else if(k==='c'||k==='n')await p.click(`#rit [data-k="${k}"]`);else await p.click('#d'+k);await p.clock.runFor(1000)}
 console.log(nome.padEnd(30),'|',await st(p));if(nome==='choque 5 + amio 150')console.log('   log:',await p.evaluate(()=>[...document.querySelectorAll('#log div')].slice(0,3).map(d=>d.textContent).join(' | ')));await p.close()}
console.log('erros',errs);await b.close()})();
