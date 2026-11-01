const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.clock.install({time:new Date('2026-10-25T10:00:00')});
await p.addInitScript(()=>{window.__beeps=0;const O=window.AudioContext;window.AudioContext=class extends O{createOscillator(){window.__beeps++;return super.createOscillator()}}});
await p.goto('file://'+process.argv[2]+'#cron');await p.clock.runFor(500);
const T=async s=>(await p.innerText(s)).replace(/\s+/g,' ');const go=ms=>p.clock.runFor(ms);
// SIMPLES
await p.click('#b1');await go(65000);console.log('simples 65s:',await T('#w'),'| b1',await T('#b1'),'| beeps',await p.evaluate(()=>__beeps));
await p.click('#b2');await go(10000);await p.click('#b2');console.log('voltas:',await T('#laps'));
await p.click('#tb');await go(60000);console.log('bipe on 1 min, beeps',await p.evaluate(()=>__beeps));
await p.click('#b1');const a=await T('#w');await go(5000);console.log('pausado:',a,'->',await T('#w'),'| b1',await T('#b1'),'b2',await T('#b2'));
await p.click('#b2');await go(100);console.log('dialog:',await p.locator('.dlg').count());await p.click('.dlg [data-a="y"]');await go(100);console.log('zerado:',await T('#w'),'| voltas:',await T('#laps')||'(vazio)');
// navegar e voltar com cronômetro rodando
await p.click('#b1');await go(3000);await p.evaluate(()=>location.hash='#imc');await go(2000);await p.evaluate(()=>location.hash='#cron');await go(300);console.log('volta à tela, simples:',await T('#w'));
// RCP
await p.click('.modes [data-m="rcp"]');await go(200);
await p.click('#b1');await go(1000);await p.click('#dA');await go(119000);
console.log('RCP 2 min:',await T('#w'),'| ciclo',await T('#cr'),'| log',await T('#log'));
await go(61000);console.log('adrenalina 3 min:',await T('#dA'));await go(120000);console.log('adrenalina 5 min:',await T('#dA'));
await p.click('#dM');await p.click('#dM');await p.click('#dM');console.log('amio:',await T('#dM'));
await p.click('#b2');await go(500);console.log('novo ciclo:',await T('#cr'));
await p.click('#tm');await go(3000);const bb=await p.evaluate(()=>__beeps);await go(6000);console.log('metrônomo 110 em 6 s, beeps:',await p.evaluate(()=>__beeps)-bb);
await p.click('#tm');
await p.click('#b1');const pr=await T('#w');await go(5000);console.log('RCP pausada:',pr,'->',await T('#w'),await T('#b1'));
// DU
await p.click('.modes [data-m="du"]');await go(200);
for(let i=0;i<7;i++){await p.click('#bc');await go(60000);await p.click('#bc');await go(240000);}
console.log('DU após 35 min:',await T('#du'));
for(let i=0;i<20;i++){await p.click('#bc');await go(30000);await p.click('#bc');await go(60000);}
console.log('DU após mais 30 min:',await T('#du'));
console.log('erros',errs);await b.close()})();
