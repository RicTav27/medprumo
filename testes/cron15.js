// adrenalina: próxima dose guiada pela última, com trocas de ritmo (W = esperar ms)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
const st=async p=>p.evaluate(()=>['dA','dM','dS'].map(id=>{const d=document.getElementById(id);return d.querySelector('.dn').textContent.slice(0,5)+':'+d.querySelector('.dt').textContent+(d.dataset.state?'['+d.dataset.state+']':'')+(d.dataset.off==='true'?'(off)':'')}).join('  '));
const S=[
 ['AESP, adr, 1 min',['n','A',59000]],
 ['AESP, adr, 1 min → FV',['n','A',59000,'c']],
 ['AESP, adr, 3 min → FV',['n','A',180000,'c']],
 ['AESP, adr, 5 min',['n','A',300000]],
 ['FV 2 choques, adr, 2 min → AESP',['c','S','c','S','A',120000,'n']],
 ['FV 2 choques, adr, 4 min → AESP',['c','S','c','S','A',240000,'n']],
 ['FV → AESP sem adr → adr → 2 min → FV',['c','S','n','A',120000,'c']],
 ['AESP 2 adr (2ª há 1 min) → FV',['n','A',200000,'A',60000,'c']],
 ['FV 3 choques, amio → AESP → FV',['c','S','c','S','A','c','S','M',60000,'n',60000,'c']],
];
for(const [nome,seq] of S){const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errs.push(e.message));await p.clock.install();await p.goto('file://'+process.argv[2]+'#cron');await p.clock.runFor(300);await p.click('.modes [data-m="rcp"]');await p.click('#b1');await p.clock.runFor(1000);
 for(const k of seq){if(typeof k==='number')await p.clock.runFor(k);else if(k==='c'||k==='n')await p.click(`#rit [data-k="${k}"]`);else await p.click('#d'+k);await p.clock.runFor(1000)}
 console.log(nome.padEnd(40),'|',await st(p));await p.close()}
console.log('erros',errs);await b.close()})();
