/* MedPrumo: cache offline. A lista e a versão são geradas por tools/version.py */
const V='medprumo-e944626f';
const CORE=[
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/css/app.css',
  'assets/data/cid10.js',
  'assets/data/growth.js',
  'assets/data/medicamentos.js',
  'assets/fonts/atkinson-hyperlegible-OFL.txt',
  'assets/fonts/atkinson-hyperlegible-latin-400.woff2',
  'assets/fonts/atkinson-hyperlegible-latin-700.woff2',
  'assets/fonts/barlow-condensed-OFL.txt',
  'assets/fonts/barlow-condensed-latin-600.woff2',
  'assets/fonts/barlow-condensed-latin-700.woff2',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/favicon-32.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon.svg',
  'assets/icons/maskable-512.png',
  'assets/js/app.js',
  'assets/js/pwa.js',
  'assets/js/viewport.js'
];
/* Instalação: arquivos baixados do servidor (cache:'reload'), sem reaproveitar cópia antiga guardada pelo navegador */
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
/* Página do app (início ou index.html): abre na hora pela cópia guardada, com ou sem internet. A versão nova chega pelo próprio
   service worker (o navegador confere o sw.js a cada abertura), que baixa tudo de novo e o app avisa (pwa.js).
   Outro endereço do site: rede; sem internet, abre o app guardado */
const APP=new URL('./',location).pathname;
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(r.mode==='navigate'){const app=u.origin===location.origin&&(u.pathname===APP||u.pathname===APP+'index.html');
    e.respondWith(app?caches.match('index.html').then(c=>c||fetch(r)):fetch(r).catch(()=>caches.match('index.html')));return}
  if(u.origin===location.origin){
    e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res})))}
});
