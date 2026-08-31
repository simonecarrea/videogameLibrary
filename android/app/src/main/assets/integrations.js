const GameShelfConfig={
  get rawgKey(){return localStorage.getItem('gameshelf-rawg-key')||''},
  set rawgKey(v){v?localStorage.setItem('gameshelf-rawg-key',v.trim()):localStorage.removeItem('gameshelf-rawg-key')},
  get itadKey(){return localStorage.getItem('gameshelf-itad-key')||''},
  set itadKey(v){v?localStorage.setItem('gameshelf-itad-key',v.trim()):localStorage.removeItem('gameshelf-itad-key')}
};

const RawgService={
  base:'https://api.rawg.io/api',
  enabled(){return !!GameShelfConfig.rawgKey},
  async request(path,params={}){
    if(!this.enabled()) throw new Error('RAWG_KEY_MISSING');
    const url=new URL(this.base+path); url.searchParams.set('key',GameShelfConfig.rawgKey);
    Object.entries(params).forEach(([k,v])=>v!==undefined&&v!==''&&url.searchParams.set(k,v));
    const r=await fetch(url); if(!r.ok) throw new Error(`RAWG_${r.status}`); return r.json();
  },
  map(g){
    const platforms=(g.platforms||[]).map(x=>x.platform?.name).filter(Boolean);
    return {id:`rawg-${g.id}`,rawgId:g.id,title:g.name,year:g.released?Number(g.released.slice(0,4)):null,released:g.released||null,
      genres:(g.genres||[]).map(x=>x.name),platforms,developer:'—',publisher:'—',rating:g.metacritic||Math.round((g.rating||0)*20),
      price:{},description:'Apri la scheda per caricare i dettagli completi.',cover:g.background_image||null,hero:g.background_image||null,source:'RAWG'};
  },
  async list(query=''){
    const data=await this.request('/games',{search:query||undefined,search_precise:query?true:undefined,page_size:24,ordering:query?undefined:'-added'});
    return (data.results||[]).map(this.map);
  },
  async detail(rawgId){
    const g=await this.request(`/games/${rawgId}`);
    const mapped=this.map(g); mapped.description=(g.description_raw||'').trim()||mapped.description;
    mapped.developer=(g.developers||[]).map(x=>x.name).join(', ')||'—';
    mapped.publisher=(g.publishers||[]).map(x=>x.name).join(', ')||'—';
    mapped.website=g.website||''; mapped.esrb=g.esrb_rating?.name||'';
    return mapped;
  }
};

const PriceService={
  enabled(){return !!GameShelfConfig.itadKey},
  async request(path,options={}){
    if(!this.enabled()) throw new Error('ITAD_KEY_MISSING');
    const headers={...(options.headers||{}),'ITAD-API-Key':GameShelfConfig.itadKey,'Content-Type':'application/json'};
    const r=await fetch(`https://api.isthereanydeal.com${path}`,{...options,headers}); if(!r.ok) throw new Error(`ITAD_${r.status}`); return r.json();
  },
  async current(title){
    const lookup=await this.request(`/games/lookup/v1?title=${encodeURIComponent(title)}`);
    if(!lookup?.found||!lookup.game?.id) return null;
    const rows=await this.request('/games/overview/v2?country=IT',{method:'POST',body:JSON.stringify([lookup.game.id])});
    const row=Array.isArray(rows)?rows[0]:null; if(!row) return null;
    const current=row.current||row.lowest||null, low=row.low||row.historyLow||null;
    return {current,historyLow:low,url:current?.url||row.url||null,source:'IsThereAnyDeal'};
  }
};