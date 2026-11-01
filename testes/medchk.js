const fs=require('fs'),vm=require('vm');const s=fs.readFileSync(require('path').join(__dirname,'../assets/data/medicamentos.js'),'utf8');
const MED=vm.runInNewContext(s+';MED');const d=MED.d;
console.log('total princípios',d.length,'marcas',d.reduce((a,x)=>a+x[2].length,0));
const norm=x=>x.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const want=process.argv.slice(2);
for(const w of want){const W=norm(w);const hits=d.filter(x=>{const n=norm(x[0]);return n===W||n.split(/[ +]+/).includes(W)||n.includes(W)});
 const set=[...new Set(hits.map(h=>h[3][0]+'|'+h[3][3]+'|'+h[3][1].slice(0,40)))];console.log(w.padEnd(16),hits.length,set.slice(0,4).join('  //  ')||'—');}
