const $=s=>document.querySelector(s);
const content=$('#content'), search=$('#search'), pf=$('#platformFilter'), sf=$('#statusFilter'), stats=$('#stats');

const memoryStore={};
const storage={
  get(k){try{return window.localStorage.getItem(k)}catch(e){return memoryStore[k]??null}},
  set(k,v){try{window.localStorage.setItem(k,v)}catch(e){memoryStore[k]=v}},
  del(k){try{window.localStorage.removeItem(k)}catch(e){delete memoryStore[k]}}
};

let view='library';
let activePlatform=null;
let library;
try{
  const raw=storage.get('gameshelf-library');
  const parsed=raw?JSON.parse(raw):null;
  library=Array.isArray(parsed)&&parsed.length?parsed:DEFAULT_LIBRARY.map(x=>({...x}));
}catch(e){
  library=DEFAULT_LIBRARY.map(x=>({...x}));
}
storage.set('gameshelf-library',JSON.stringify(library));

const save=()=>storage.set('gameshelf-library',JSON.stringify(library));
const game=id=>CATALOG.find(g=>g.id===id)||library.find(x=>x.gameId===id)?.snapshot;
const platformLabel=p=>p==='PS5'?'PlayStation 5':p;
const supported=g=>[...new Set((g.platforms||[]).filter(p=>['PS5','Steam','Switch 2'].includes(p)))];
const money=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(n);
const cover=g=>g.cover||(g.steamAppId?`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.steamAppId}/library_600x900_2x.jpg`:null);
const hero=g=>g.hero||(g.steamAppId?`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.steamAppId}/library_hero.jpg`:null);
const initials=t=>t.split(/\s+/).filter(Boolean).slice(0,3).map(x=>x[0]).join('').toUpperCase();

function setActiveNav(name){
  document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===name));
}

function updateCounts(){
  const c=p=>library.filter(x=>x.platform===p).length;
  $('#psCount').textContent=`${c('PS5')} giochi`;
  $('#steamCount').textContent=`${c('Steam')} giochi`;
  $('#switchCount').textContent=`${c('Switch 2')} giochi`;
}

function renderStats(){
  const src=activePlatform?library.filter(x=>x.platform===activePlatform):library;
  stats.innerHTML=[['Giocati',src.filter(x=>x.status==='Giocati').length],['In corso',src.filter(x=>x.status==='In corso').length],['Da giocare',src.filter(x=>x.status==='Da giocare').length],['Totale',src.length]].map(([l,v])=>`<div class="stat"><span>${l}</span><b>${v}</b></div>`).join('');
}

function renderHero(){
  const h=$('#hero');
  if(window.innerWidth<=720){h.innerHTML='';h.style.backgroundImage='';return;}
  const src=activePlatform?library.filter(x=>x.platform===activePlatform):library;
  const entry=src.find(x=>x.status==='In corso')||src[0];
  const g=entry&&game(entry.gameId);
  if(!g){h.innerHTML='';return;}
  const bg=hero(g);
  h.style.backgroundImage=bg?`linear-gradient(90deg,#090b11f2 0%,#090b1190 55%,#090b1110),url('${bg}')`:'';
  h.innerHTML=`<div class="hero-content"><div class="hero-kicker">CONTINUA A GIOCARE</div><h2>${g.title}</h2><p>${g.description||''}</p></div>`;
}

function gameCard(g,entry,addMode=false){
  const img=cover(g);
  const price=Object.values(g.price||{});
  const priceText=price.length?`da ${money(Math.min(...price))}`:'Prezzo non disponibile';
  const plat=entry?.platform||supported(g)[0]||'—';
  return `<article class="card" data-id="${g.id}">
    <div class="game-cover">${img?`<img src="${img}" alt="${g.title}" loading="lazy" onerror="this.style.display='none'">`:''}<span class="cover-fallback">${initials(g.title)}</span>${entry?`<span class="status-badge">${entry.status}</span>`:''}</div>
    <div class="card-body"><div class="title">${g.title}</div><div class="meta">${plat} · ${g.year||'TBA'}</div><div class="chips">${(g.genres||[]).slice(0,2).map(x=>`<span class="chip">${x}</span>`).join('')}</div><div class="price">${priceText}</div>${addMode?`<button class="quick-add" data-quick-add="${g.id}">Aggiungi +</button>`:''}</div>
  </article>`;
}

function rows(){
  if(view==='catalog') return CATALOG.map(g=>({g,entry:null}));
  let src=view==='wishlist'?library.filter(x=>x.status==='Da giocare'):library;
  if(activePlatform) src=src.filter(x=>x.platform===activePlatform);
  return src.map(entry=>({g:game(entry.gameId),entry})).filter(x=>x.g);
}

function updateChrome(){
  const platformMode=!!activePlatform;
  $('#platformLibraries').style.display=view==='library'&&!platformMode?'grid':'none';
  pf.style.display=view==='catalog'||platformMode?'none':'';
  sf.style.display=view==='catalog'?'none':'';
  if(view==='catalog'){
    $('#viewEyebrow').textContent='AGGIUNGI GIOCHI';
    $('#viewTitle').textContent=activePlatform?`Aggiungi a ${platformLabel(activePlatform)}`:'Aggiungi un gioco';
    $('#sectionTitle').textContent='Catalogo';
    search.placeholder='Cerca un gioco…';
  }else if(view==='wishlist'){
    $('#viewEyebrow').textContent='BACKLOG';$('#viewTitle').textContent='Da giocare';$('#sectionTitle').textContent='La tua lista';search.placeholder='Cerca nei giochi da giocare…';
  }else if(activePlatform){
    $('#viewEyebrow').textContent='LIBRERIA';$('#viewTitle').textContent=platformLabel(activePlatform);$('#sectionTitle').textContent='I tuoi giochi';search.placeholder=`Cerca in ${platformLabel(activePlatform)}…`;
  }else{
    $('#viewEyebrow').textContent='LA TUA COLLEZIONE';$('#viewTitle').textContent='Bentornato, Simone';$('#sectionTitle').textContent='I tuoi giochi';search.placeholder='Cerca nella tua libreria…';
  }
}

function render(){
  updateChrome();updateCounts();renderStats();renderHero();
  const q=(search.value||'').trim().toLowerCase();
  let list=rows();
  if(q) list=list.filter(({g})=>g.title.toLowerCase().includes(q)||(g.developer||'').toLowerCase().includes(q));
  if(view!=='catalog'&&!activePlatform&&pf.value!=='all') list=list.filter(({entry})=>entry?.platform===pf.value);
  if(view!=='catalog'&&sf.value!=='all') list=list.filter(({entry})=>entry?.status===sf.value);
  if(view==='catalog'&&activePlatform) list=list.filter(({g})=>supported(g).includes(activePlatform));
  content.innerHTML=list.length?list.map(({g,entry})=>gameCard(g,entry,view==='catalog')).join(''):`<div class="empty">Nessun gioco trovato.</div>`;
  $('#resultCount').textContent=`${list.length} ${list.length===1?'gioco':'giochi'}`;
  document.querySelectorAll('.card').forEach(c=>c.addEventListener('click',e=>{if(e.target.closest('.quick-add'))return;openDetail(c.dataset.id)}));
  document.querySelectorAll('.quick-add').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();quickAdd(b.dataset.quickAdd)}));
}

function addToLibrary(g,p){
  if(!p)return;
  if(!library.some(x=>x.gameId===g.id&&x.platform===p)) library.push({gameId:g.id,platform:p,status:'Da giocare'});
  save(); activePlatform=p; view='library'; search.value=''; setActiveNav('library'); render();
}

function quickAdd(id){
  const g=game(id); if(!g)return;
  const choices=activePlatform?[activePlatform]:supported(g);
  if(choices.length===1){addToLibrary(g,choices[0]);return;}
  openDetail(id,true);
}

function openDetail(id,forceAdd=false){
  const g=game(id);if(!g)return;
  const entries=library.filter(x=>x.gameId===id);
  const entry=!forceAdd?(activePlatform?entries.find(x=>x.platform===activePlatform):entries[0]):null;
  const choices=supported(g);
  $('#detailContent').innerHTML=`<div class="detail-hero" style="${hero(g)?`background-image:linear-gradient(90deg,#080a0fe8,#080a0f55),url('${hero(g)}')`:''}"><div class="detail-hero-inner"><p class="eyebrow">${(g.genres||[]).join(' · ')}</p><h2>${g.title}</h2><div class="meta">${g.year||'TBA'} · ★ ${g.rating||'—'}/100</div></div></div><div class="detail-body"><div><p>${g.description||''}</p><div class="actions">${entry?['In corso','Giocati','Da giocare'].map(s=>`<button data-status="${s}" class="${entry.status===s?'primary':''}">${s}</button>`).join(''):`<div class="add-to-libraries"><small>Scegli la piattaforma</small>${choices.map(p=>`<button class="primary" data-add-platform="${p}">+ ${platformLabel(p)}</button>`).join('')}</div>`}${entry?'<button id="removeLib">Rimuovi</button>':''}</div></div><div class="kv"><div><small>Sviluppatore</small>${g.developer||'—'}</div><div><small>Publisher</small>${g.publisher||'—'}</div><div><small>Piattaforme</small>${(g.platforms||[]).join(', ')}</div></div></div>`;
  $('#detail').showModal();
  document.querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>{entry.status=b.dataset.status;save();$('#detail').close();render()});
  document.querySelectorAll('[data-add-platform]').forEach(b=>b.onclick=()=>{$('#detail').close();addToLibrary(g,b.dataset.addPlatform)});
  if(entry&&$('#removeLib')) $('#removeLib').onclick=()=>{library=library.filter(x=>x!==entry);save();$('#detail').close();render()};
}

function openPlatform(p){activePlatform=p;view='library';search.value='';pf.value='all';sf.value='all';setActiveNav('library');render()}

$('#closeDetail').onclick=()=>$('#detail').close();
search.oninput=render; pf.oninput=render; sf.oninput=render;
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>{view=b.dataset.view;activePlatform=null;search.value='';setActiveNav(view);render()});
document.querySelectorAll('[data-open-platform],.platform-link').forEach(b=>b.onclick=e=>{e.stopPropagation();openPlatform(b.dataset.openPlatform||b.dataset.platform)});
document.querySelectorAll('.platform-library').forEach(c=>c.onclick=()=>openPlatform(c.dataset.platform));
$('#settingsButton').onclick=()=>$('#settings').showModal();
$('#closeSettings').onclick=()=>$('#settings').close();
$('#saveSettings').onclick=()=>{$('#settingsStatus').textContent='Configurazione salvata.'};

render();
