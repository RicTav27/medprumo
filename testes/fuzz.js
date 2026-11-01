const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});w.requestAnimationFrame=f=>f();const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{const d=w.document,T=w.eval('TOOLS').map(t=>t.id),LIM=w.eval('LIM');const bad=[];
 for(const id of T)for(const mode of [0,1,2]){w.location.hash='#'+id;w.eval('route()');const a=d.getElementById('app');
  a.querySelectorAll('.seg').forEach(s=>{const b=s.querySelectorAll('button');b[mode%b.length].click()});
  a.querySelectorAll('.po').forEach(po=>{const b=po.querySelectorAll('button');b[mode===0?0:mode===1?b.length-1:Math.floor(b.length/2)].click()});
  a.querySelectorAll('input.num').forEach(i=>{const L=LIM[i.id]||[0,100];const v=mode===0?L[0]:mode===1?Math.min(L[1],L[0]+Math.abs(L[1]-L[0])*0.9):(L[0]+L[1])/2;i.value=String(+v.toFixed(2)).replace('.',',');i.dispatchEvent(new w.Event('input'))});
  if(mode===1)a.querySelectorAll('input[type=checkbox]').forEach(c=>{c.checked=true;c.dispatchEvent(new w.Event('change'))});
  a.querySelectorAll('fieldset').forEach(f=>{const r=f.querySelectorAll('input[type=radio]');if(r.length){const x=r[mode===1?r.length-1:0];x.checked=true;x.dispatchEvent(new w.Event('change'))}});
  const t=d.getElementById('out').textContent;if(/Não foi possível|NaN|undefined|Infinity/.test(t))bad.push(id+'#'+mode+': '+t.slice(0,90))}
 console.log('ferramentas',T.length,'problemas',bad.length);bad.forEach(x=>console.log(' ',x));console.log('erros',errs);process.exit(0)},300);
