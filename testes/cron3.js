const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage();
await p.addInitScript(()=>{window.__f=[];const O=window.AudioContext;window.AudioContext=class extends O{createOscillator(){const o=super.createOscillator();const self=this;const st=o.start.bind(o);o.start=t=>{window.__f.push(+(t-self.currentTime).toFixed(2));st(t)};return o}}});
await p.goto('file://'+process.argv[2]+'#cron');await p.waitForTimeout(300);
await p.click('.modes [data-m="rcp"]');await p.click('#tm');await p.waitForTimeout(1000);
await p.evaluate(()=>{const e=Date.now()+3000;while(Date.now()<e){} __f=[]});await p.waitForTimeout(150);
const f=await p.evaluate(()=>__f);console.log('após 3 s travado: bipes agendados em 150 ms =',f.length,'atrasos',JSON.stringify(f));
await b.close()})();
