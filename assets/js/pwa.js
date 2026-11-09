/* Registro do service worker (uso offline) */
if('serviceWorker' in navigator){
  const sw=navigator.serviceWorker,had=!!sw.controller;
  addEventListener('load',()=>sw.register('sw.js').catch(()=>{}));
  /* Versão nova instalada com o app aberto: avisa e deixa o usuário escolher a hora de atualizar.
     Na tela de cronômetros o aviso espera a saída da tela */
  let asked=false;
  const show=()=>{if(asked)return;if(location.hash==='#cron'){addEventListener('hashchange',show,{once:true});return}
    asked=true;const d=document.createElement('div');d.className='upd';d.setAttribute('role','status');
    d.innerHTML='<span>Nova versão disponível</span><button type="button" data-a="y">Atualizar</button><button type="button" data-a="n" aria-label="Fechar aviso">×</button>';
    d.onclick=e=>{const a=e.target.closest('button');if(!a)return;if(a.dataset.a==='y')location.reload();else d.remove()};
    document.body.appendChild(d)};
  sw.addEventListener('controllerchange',()=>{if(had)show()});
  /* App instalado: pede ao navegador para não apagar os dados offline quando faltar espaço */
  addEventListener('load',()=>{try{const inst=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
    if(inst&&navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{})}catch(e){}});
}
