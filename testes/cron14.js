// conduta por ritmo nos cards: inícios e trocas de ritmo
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
const st=async p=>p.evaluate(()=>['dA','dM','dS'].map(id=>{const d=document.getElementById(id);return d.querySelector('.dn').textContent.slice(0,5)+':'+d.querySelector('.dt').textContent+(d.dataset.state?'['+d.dataset.state+']':'')+(d.dataset.off==='true'?'(off)':'')}).join('  '));
const S=[
 ['Sem ritmo',[]],
 ['Início AESP',['n']],
 ['AESP + adrenalina',['n','A']],
 ['AESP → FV',['n','A','c']],
 ['AESP → FV, choque',['n','A','c','S']],
 ['Início FV',['c']],
 ['FV: choque 1',['c','S']],
 ['FV mantida (checagem)',['c','S','c']],
 ['FV: choque 2',['c','S','c','S']],
 ['FV: choque 2 + adrenalina',['c','S','c','S','A']],
 ['FV: choque 3',['c','S','c','S','A','c','S']],
 ['FV: choque 3 + amiodarona',['c','S','c','S','A','c','S','M']],
 ['FV (1 choque) → assistolia',['c','S','n']],
 ['FV (3 choques, adr, amio) → AESP',['c','S','c','S','A','c','S','M','n']],
 ['AESP → FV → AESP',['n','A','c','S','n']],
 ['Choque sem ritmo marcado',['S']],
 ['Adrenalina sem ritmo',['A']],
];
for(const [nome,seq] of S){const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errs.push(e.message));await p.clock.install();await p.goto('file://'+process.argv[2]+'#cron');await p.clock.runFor(300);await p.click('.modes [data-m="rcp"]');await p.click('#b1');await p.clock.runFor(1000);
 for(const k of seq){if(k==='c'||k==='n')await p.click(`#rit [data-k="${k}"]`);else await p.click('#d'+k);await p.clock.runFor(1000)}
 console.log(nome.padEnd(34),'|',await st(p));await p.close()}
console.log('erros',errs);await b.close()})();
