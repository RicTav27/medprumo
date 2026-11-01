const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});
setTimeout(()=>{const d=w.document;const S=w.eval('SCORES');const T=w.eval('TOOLS');const res=[];
 for(const t of T){if(!S.includes(t.id))continue;w.location.hash='#'+t.id;w.eval('route()');const a=d.getElementById('app');
  const lab=e=>(e.closest('label')?.textContent||'').trim().replace(/\s+/g,' ');
  const nums=[...a.querySelectorAll('input.num')].map(lab);
  const pre=[...a.querySelectorAll('input:checked')].map(e=>lab(e)||e.id);
  const prp=[...a.querySelectorAll('[aria-pressed="true"],[aria-checked="true"]')].map(e=>e.textContent.trim());
  const selv=[...a.querySelectorAll('select')].filter(s=>s.value!=='').map(s=>s.id+'='+s.value);
  res.push({id:t.id,name:t.name,nums,pre,prp,selv})}
 for(const r of res){if(r.nums.length||r.pre.length||r.prp.length||r.selv.length)console.log(JSON.stringify(r))}
 console.log('total',res.length);process.exit(0)},300);
