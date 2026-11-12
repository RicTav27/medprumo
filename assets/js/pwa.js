/* Registro do service worker (uso offline) */
if('serviceWorker' in navigator){
  const sw=navigator.serviceWorker,had=!!sw.controller;
  addEventListener('load',()=>sw.register('sw.js').catch(()=>{}));
  /* Versão nova instalada com o app aberto: atualiza sozinho (os campos preenchidos voltam, ver app.js).
     Na tela de cronômetros espera a saída da tela, para não interromper a contagem */
  let going=false;
  const go=()=>{if(going)return;if(location.hash==='#cron'){addEventListener('hashchange',go,{once:true});return}
    going=true;location.reload()};
  sw.addEventListener('controllerchange',()=>{if(had)go()});
  /* Depois de atualizar: aviso com botão para ver as novidades. Compara com a última versão aberta neste aparelho */
  addEventListener('load',()=>{try{
    const old=localStorage.getItem('mpv');localStorage.setItem('mpv',APP_VERSION);
    if(!old||old===APP_VERSION)return;
    const d=document.createElement('div');d.className='upd';d.setAttribute('role','status');
    d.innerHTML='<span>App atualizado para a versão '+APP_VERSION+'</span><button type="button" data-a="y">Novidades</button><button type="button" data-a="n" aria-label="Fechar aviso">×</button>';
    d.onclick=e=>{const a=e.target.closest('button');if(!a)return;d.remove();if(a.dataset.a==='y')novidades(null,old)};
    document.body.appendChild(d)}catch(e){}});
  /* App instalado: pede ao navegador para não apagar os dados offline quando faltar espaço */
  addEventListener('load',()=>{try{const inst=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
    if(inst&&navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{})}catch(e){}});
}
