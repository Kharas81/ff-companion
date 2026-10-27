/* Final Fantasy 100% Companion — bewusst ohne Framework und Tracking. */
(() => {
  'use strict';
  const VERSION = 1;
  const KEY = 'ff-companion-v1';
  const FONT_KEY = 'ff-companion-reading-size-v1';
  const FONT_STEPS = [1,1.12,1.25,1.4];
  let fontStep = 0;
  try {
    const savedFont = Number(localStorage.getItem(FONT_KEY));
    if (Number.isInteger(savedFont) && savedFont >= 0 && savedFont < FONT_STEPS.length) fontStep = savedFont;
  } catch (err) { /* Schriftgröße funktioniert auch ohne lokalen Speicher. */ }
  const applyFontSize = () => {
    document.documentElement.style.setProperty('--read-scale', String(FONT_STEPS[fontStep]));
    const indicator = document.getElementById('font-indicator');
    if (indicator) indicator.textContent = Math.round(FONT_STEPS[fontStep] * 100) + '%';
    const sheetIndicator=document.getElementById('sheet-font-indicator');
    if(sheetIndicator)sheetIndicator.textContent=Math.round(FONT_STEPS[fontStep]*100)+'%';
    const decrease = document.querySelector('[data-action="text-smaller"]');
    const increase = document.querySelector('[data-action="text-larger"]');
    if (decrease) decrease.disabled = fontStep === 0;
    if (increase) increase.disabled = fontStep === FONT_STEPS.length - 1;
    document.querySelectorAll('[data-action="text-smaller"]').forEach(b=>b.disabled=fontStep===0);
    document.querySelectorAll('[data-action="text-larger"]').forEach(b=>b.disabled=fontStep===FONT_STEPS.length-1);
  };
  const changeFontSize = direction => {
    fontStep = Math.max(0,Math.min(FONT_STEPS.length-1,fontStep+direction));
    try { localStorage.setItem(FONT_KEY,String(fontStep)); } catch(err) { /* Kein Speicherdienst verfügbar. */ }
    applyFontSize();
  };
  const MODE_KEY='ff-companion-layout-v1';
  let layoutMode='auto';
  try { const saved=localStorage.getItem(MODE_KEY);if(['auto','desktop','couch'].includes(saved))layoutMode=saved; }catch(e){}
  const applyLayoutMode=()=>{
    document.documentElement.dataset.layoutMode=layoutMode;
    document.querySelectorAll('#view-mode,#sheet-view-mode').forEach(el=>el.value=layoutMode);
  };
  const setLayoutMode=mode=>{
    if(!['auto','desktop','couch'].includes(mode))return;
    layoutMode=mode;try{localStorage.setItem(MODE_KEY,mode)}catch(e){}
    applyLayoutMode();
  };
  const SEED = window.FF_COMPANION_SEED;
  const byId = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeUrl = raw => { try { const u = new URL(raw); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : ''; } catch { return ''; } };
  const CATEGORY = {'story':'Story','preparation':'Vorbereitung','chest':'Truhe','bestiary':'Bestiarium','boss':'Boss','key-item':'Schlüsselitem','misc':'Sonstiges','jobs':'Jobs','blue-magic':'Blaumagie','summons':'Beschwörungen','minigames':'Minispiele'};
  const isRequired = c => c.requiredFor100 !== false && c.optional !== true;
  const canonicalKey = (p,s,c) => c.referenceTo || [p.gameId,p.chapter.id,s.id,c.id].join('/');
  const textPriority = c => c.missable?'⚠️ Verpassbar':c.priority==='key'?'⭐ Wichtig':c.priority==='urgent'?'🔴 Jetzt erledigen':c.priority==='recommended'?'🟡 Empfohlen':c.priority==='optional'?'◯ Optional':'🟢 Nachholbar';
  const defaultState = () => ({schemaVersion:VERSION,selectedGame:'ff1-pr',selectedChapter:'ff1-01',progress:{},imports:[],activeSlots:{},slots:{},positions:{},view:'guide'});
  const slotId = (game,slot) => game+':'+slot;
  const activeSlot = game => state.activeSlots?.[game] || 1;
  const ensureSlots = () => {
    state.activeSlots ||= {}; state.slots ||= {}; state.positions ||= {};
    for(const game of manifest.games){
      const current=activeSlot(game.id);
      for(let slot=1;slot<=3;slot++){
        const id=slotId(game.id,slot);
        state.slots[id] ||= {name:'Spielstand '+slot,progress:{},position:null};
      }
      state.activeSlots[game.id]=current;
    }
  };
  const saveActiveSlot = () => {
    ensureSlots();
    const game=state.selectedGame,id=slotId(game,activeSlot(game));
    state.slots[id].progress=Object.fromEntries(Object.entries(state.progress).filter(([k])=>k.startsWith(game+'/')));
  };
  const hydrateSlot = (game,slot) => {
    ensureSlots();
    state.progress=Object.fromEntries(Object.entries(state.progress).filter(([k])=>!k.startsWith(game+'/')));
    Object.assign(state.progress,state.slots[slotId(game,slot)].progress||{});
    state.activeSlots[game]=slot;
  };
  const readState = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (raw && raw.schemaVersion === VERSION && raw.progress && typeof raw.progress === 'object' && Array.isArray(raw.imports)) return {...defaultState(),...raw};
    } catch(e) { console.warn('Gespeicherter Stand nicht lesbar:',e); }
    return defaultState();
  };
  let state = readState();
  let manifest = SEED.manifest;
  ensureSlots();
  // Ältere Speicherstände automatisch in Slot 1 übernehmen.
  if(!state.slotsMigrated){
    for(const game of manifest.games)state.slots[slotId(game.id,1)].progress=Object.fromEntries(Object.entries(state.progress).filter(([k])=>k.startsWith(game.id+'/')));
    state.slotsMigrated=true;
    try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}
  }
  const allChapters = new Map();
  let equipmentCatalog=null;
  let magicCatalog=null;
  let magicSchoolFilter='all';
  let magicLevelFilter='all';
  let search = '';
  let filter = 'all';
  let toastHandle = null;
  const persist = () => {
    saveActiveSlot();
    try { localStorage.setItem(KEY,JSON.stringify(state)); return true; }
    catch(err){notify('Speicher voll oder deaktiviert. Bitte eine Sicherung exportieren.',true);return false;}
  };
  const notify = (msg,error=false) => {
    const toast=byId('toast');toast.textContent=msg;toast.className='toast visible'+(error?' error':'');
    if (toastHandle) clearTimeout(toastHandle);
    toastHandle=setTimeout(()=>toast.className='toast',4600);
  };
  const validateDocument = doc => {
    if (!doc || doc.format !== 'ff-companion-chapter' || doc.schemaVersion !== 1) throw new Error('Kein gültiges Companion-Kapitelformat (Version 1).');
    if (typeof doc.gameId !== 'string' || !manifest.games.some(g=>g.id===doc.gameId)) throw new Error('Spiel-ID fehlt oder ist nicht bekannt.');
    const ch=doc.chapter;
    if (!ch || typeof ch.id !== 'string' || ch.id.length > 90 || typeof ch.title !== 'string' || !Number.isInteger(ch.number)) throw new Error('Ungültige Kapitelangaben.');
    if (!Array.isArray(ch.sections) || !ch.sections.length || ch.sections.length > 80) throw new Error('Kapitel benötigt 1–80 Abschnitte.');
    const seen=new Set();
    for(const s of ch.sections){
      if(!s || typeof s.id !== 'string' || !s.id || !Array.isArray(s.checks) || s.checks.length>250 || !Array.isArray(s.steps))throw new Error('Ungültiger Abschnitt.');
      for(const check of s.checks){
        if(!check || typeof check.id !== 'string' || typeof check.title !== 'string' || check.title.length>500 || !CATEGORY[check.category || 'misc'])throw new Error('Ungültige Checkliste oder Kategorie.');
        const identity = s.id+'::'+check.id;
        if(seen.has(identity))throw new Error('Doppelte Aufgaben-ID: '+identity);
        seen.add(identity);
      }
    }
    return doc;
  };
  const chapterKey = p => p.gameId + '/' + p.chapter.id;
  const register = (p, origin) => { validateDocument(p); allChapters.set(chapterKey(p),{document:p,origin}); };
  const getChapters = gameId => [...allChapters.values()].filter(v=>v.document.gameId===gameId)
    .sort((a,b)=>a.document.chapter.number-b.document.chapter.number||a.document.chapter.id.localeCompare(b.document.chapter.id));
  const getCurrent = () => getChapters(state.selectedGame).find(p=>p.document.chapter.id===state.selectedChapter) || getChapters(state.selectedGame)[0] || null;
  const getTaskKey = (p,s,c) => canonicalKey(p,s,c);
  const getTasks = p => [...new Set(p.chapter.sections.flatMap(s=>s.checks.filter(isRequired).map(c=>getTaskKey(p,s,c))))];
  const stats = keys => {const done=keys.reduce((n,k)=>n+(state.progress[k]===true?1:0),0);return {done,total:keys.length,percent:keys.length?Math.round(done/keys.length*100):0};};
  const getStats = p => stats(getTasks(p));
  const gameStats = gameId => stats([...new Set(getChapters(gameId).flatMap(o=>getTasks(o.document)))]);
  const findGame = gameId => manifest.games.find(g=>g.id===gameId);
  const firstChapterSelection = () => {
    if (!manifest.games.some(g=>g.id===state.selectedGame))state.selectedGame=manifest.games[0]?.id||'ff1-pr';
    const chapters=getChapters(state.selectedGame);
    if (chapters.length && !chapters.some(o=>o.document.chapter.id===state.selectedChapter))state.selectedChapter=chapters[0].document.chapter.id;
  };
  const setMobileMenu = open => {
    const inner=byId('sidebar-inner'),button=byId('mobile-menu-toggle');
    if(!inner||!button)return;
    inner.classList.toggle('open',open);
    button.setAttribute('aria-expanded',String(open));
    const icon=byId('mobile-menu-icon');if(icon)icon.textContent=open?'▲':'▼';
  };
  const renderMobileProgress = () => {
    const bar=byId('mobile-progress');if(!bar)return;
    const selected=getCurrent();
    if(!selected){bar.hidden=true;return;}
    const st=getStats(selected.document);
    bar.hidden=false;
    byId('mobile-progress-pct').textContent=st.percent+'%';
    byId('mobile-progress-summary').textContent=st.done+' von '+st.total+' erledigt';
    byId('mobile-progress-fill').style.width=st.percent+'%';
    byId('mobile-progress').querySelector('[role="progressbar"]').setAttribute('aria-valuenow',String(st.percent));
  };
  const currentPosition = () => state.slots[slotId(state.selectedGame,activeSlot(state.selectedGame))]?.position;
  const setPosition = sectionId => {
    ensureSlots();
    const current=getCurrent()?.document;if(!current)return;
    state.slots[slotId(state.selectedGame,activeSlot(state.selectedGame))].position={chapterId:current.chapter.id,sectionId};
    persist();render();notify('📍 Deine Position wurde gespeichert.');
  };
  const slotData = () => {ensureSlots();return state.slots[slotId(state.selectedGame,activeSlot(state.selectedGame))];};
  const deferredKeys = () => {const slot=slotData();slot.deferred ||= [];return slot.deferred;};
  const viewEntries = () => getChapters(state.selectedGame).flatMap(({document:p})=>p.chapter.sections.flatMap(section=>section.checks.map(c=>({p,section,c,key:getTaskKey(p,section,c)}))));
  const dedupEntries = entries => [...new Map(entries.map(e=>[e.key,e])).values()];
  const setView = view => {state.view=view;persist();render();setMobileMenu(false);byId('main').scrollIntoView({behavior:'smooth',block:'start'});};
  const goToEntry = e => {
    state.selectedChapter=e.p.chapter.id;state.view='guide';search='';filter='all';persist();renderSidebar();renderMain(new Set([e.section.id]));
    const target=[...document.querySelectorAll('[data-task-key]')].find(x=>x.dataset.taskKey===e.key);
    (target||[...document.querySelectorAll('.chapter-section')].find(x=>x.dataset.section===e.section.id))?.scrollIntoView({behavior:'smooth',block:'center'});
  };
  const resume = () => {
    const where=currentPosition();
    if(where && getChapters(state.selectedGame).some(x=>x.document.chapter.id===where.chapterId)){
      state.selectedChapter=where.chapterId;state.view='guide';persist();renderSidebar();renderMain(new Set([where.sectionId]));
      const section=[...document.querySelectorAll('.chapter-section')].find(x=>x.dataset.section===where.sectionId);
      section?.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    state.view='guide';render();nextOpen();
  };
  const renderDashboard = () => {
    const game=findGame(state.selectedGame),all=dedupEntries(viewEntries()),required=all.filter(e=>isRequired(e.c));
    const categories=[['chest','📦 Truhen'],['bestiary','🐉 Bestiarium'],['boss','👑 Bosse'],['key-item','⭐ Schlüsselgegenstände'],['story','📖 Story'],['other','📋 Sonstige']];
    const grouped=categories.map(([id,label])=>{
      const relevant=required.filter(e=>id==='other'?!['chest','bestiary','boss','key-item','story'].includes(e.c.category):e.c.category===id);
      const done=relevant.filter(e=>state.progress[e.key]===true).length;
      return {id,label,relevant,done};
    });
    const finished=required.filter(e=>state.progress[e.key]===true).length;
    byId('main').innerHTML='<div class="breadcrumbs">'+esc(game?.title||'')+' / SAMMLUNG</div><div class="hero"><div class="hero-content"><span class="eyebrow">GESAMTÜBERSICHT</span><h1>Dein 100-%-Überblick</h1><p class="hero-description">Fortschritt der bisher veröffentlichten Kapitel – keine Aussage über 100 % des gesamten Spiels.</p><div class="action-row"><button class="btn btn-primary" data-action="guide">← Zum Guide</button></div></div></div><div class="dashboard-stats"><div class="overview-stat"><strong>'+finished+'/'+required.length+'</strong><span>Pflichtaufgaben</span></div><div class="overview-stat"><strong>'+grouped.find(x=>x.id==='chest').done+'/'+grouped.find(x=>x.id==='chest').relevant.length+'</strong><span>Truhen</span></div><div class="overview-stat"><strong>'+grouped.find(x=>x.id==='bestiary').done+'/'+grouped.find(x=>x.id==='bestiary').relevant.length+'</strong><span>Gegner</span></div></div>'+grouped.map(group=>'<section class="overview-group"><h2>'+group.label+' · '+group.done+'/'+group.relevant.length+'</h2>'+(group.relevant.filter(e=>state.progress[e.key]!==true).map(e=>'<div class="overview-task"><span>'+esc(e.c.title)+'<small>Kapitel '+e.p.chapter.number+' · '+esc(e.section.location||e.section.title)+'</small></span><button class="btn btn-quiet" data-action="goto-entry" data-key="'+esc(e.key)+'">Fundort</button></div>').join('')||'<p class="step-done">✓ In den veröffentlichten Kapiteln alles erledigt</p>')+'</section>').join('');
  };
  const renderStepMode = () => {
    const entries=dedupEntries(viewEntries()).filter(e=>isRequired(e.c));
    const defer=new Set(deferredKeys());
    const next=entries.find(e=>state.progress[e.key]!==true&&!defer.has(e.key))||entries.find(e=>state.progress[e.key]!==true);
    const game=findGame(state.selectedGame);
    if(!next){byId('main').innerHTML='<section class="step-panel"><h2>🎉 Alle bisher veröffentlichten Pflichtaufgaben erledigt</h2><button class="btn btn-primary" data-action="dashboard">Zur Gesamtübersicht</button></section>';return;}
    const num=entries.findIndex(e=>e.key===next.key)+1;
    byId('main').innerHTML='<div class="breadcrumbs">'+esc(game?.title||'')+' / SPIELMODUS</div><section class="step-panel"><div class="step-counter">🎯 Aufgabe '+num+' von '+entries.length+' · Kapitel '+next.p.chapter.number+'</div><h2>'+esc(next.c.title)+'</h2><p>'+esc(next.c.detail||next.section.intro||'')+'</p><p>📍 '+esc(next.section.location||next.section.title)+'</p><div class="callout">'+esc(next.section.steps?.[0]||'')+'</div><div class="step-controls"><button class="btn btn-primary" data-action="step-done" data-key="'+esc(next.key)+'">✓ Erledigt</button><button class="btn" data-action="step-later" data-key="'+esc(next.key)+'">⏳ Später</button><button class="btn" data-action="goto-entry" data-key="'+esc(next.key)+'">📖 Zum Abschnitt</button></div><p class="collection-note">„Später“ verschiebt die Aufgabe nur. Sie bleibt für 100 % offen.</p><button class="btn btn-quiet" data-action="dashboard">Alle Aufgaben anzeigen</button></section>';
  };
  const renderCollections = () => {
    const game=findGame(state.selectedGame),all=dedupEntries(viewEntries());
    const kinds=[['bestiary','🐉 Bestiarium'],['chest','📦 Schatztruhen'],['key-item','⭐ Schlüsselgegenstände'],['boss','👑 Bosse'],['jobs','🧙 Jobs'],['blue-magic','🔷 Blaumagie'],['summons','✨ Beschwörungen'],['minigames','🎲 Minispiele']];
    const special=(game?.collections||[]);
    for(const item of special)if(!kinds.some(x=>x[0]===item.id))kinds.push([item.id,item.title||item.id]);
    byId('main').innerHTML='<div class="hero"><div class="hero-content"><span class="eyebrow">SPIELABHÄNGIGE SAMMLUNGEN</span><h1>Sammlungen</h1><p class="hero-description">Nur vorhandene Daten werden gezählt. Jobs, Blaumagie und Beschwörungen erscheinen automatisch, sobald ihre Kapitel diese Kategorien enthalten.</p><button class="btn btn-primary" data-action="guide">← Zum Guide</button></div></div>'+kinds.map(([id,label])=>{const entries=all.filter(e=>e.c.category===id);const found=entries.filter(e=>state.progress[e.key]===true).length;return '<section class="overview-group"><h2>'+label+' · '+found+'/'+entries.length+'</h2>'+(entries.length?entries.filter(e=>!state.progress[e.key]).map(e=>'<div class="overview-task"><span>'+esc(e.c.title)+'</span><button class="btn" data-action="goto-entry" data-key="'+esc(e.key)+'">Ansehen</button></div>').join('')||'<p class="step-done">✓ Alle Einträge erledigt</p>':'<p class="collection-note">Für diesen FF-Teil noch keine Einträge veröffentlicht.</p>')+'</section>'}).join('');
  };
  const CLASS_OPTIONS=[['warrior','Krieger'],['thief','Dieb'],['monk','Mönch'],['red-mage','Rotmagier'],['white-mage','Weißmagier'],['black-mage','Schwarzmagier']];
  const renderParty = () => {
    const slot=slotData();slot.party ||= ['warrior','monk','white-mage','black-mage'];
    return '<section class="party-panel"><h3>🛒 Deine Gruppe für Kaufempfehlungen</h3><p>Die vier Klassen bestimmen, welche Shopangebote angezeigt werden. Nur eine Empfehlung, kein Pflichtkauf.</p><div class="party-slots">'+slot.party.map((value,i)=>'<label class="party-slot">Figur '+(i+1)+'<select data-party-slot="'+i+'">'+CLASS_OPTIONS.map(([key,name])=>'<option value="'+key+'" '+(key===value?'selected':'')+'>'+name+'</option>').join('')+'</select></label>').join('')+'</div></section>';
  };
  const renderPurchasePlanner = catalog => {
    if(!catalog)return '';
    const slot=slotData();slot.purchasePlan ||= {};
    const party=slot.party||['warrior','monk','white-mage','black-mage'];
    const labelOf=(kind,x)=>x.name+' · '+x.price+' Gil';
    let sum=0;
    const rows=party.map((classId,i)=>{
      let picks=slot.purchasePlan[i]||{};
      const possible=(items)=>items.filter(x=>Array.isArray(x.classes)&&x.classes.includes(classId));
      const menu=(kind,items)=>{
        const options=possible(items),chosen=options.find(x=>x.id===picks[kind]);if(chosen)sum+=chosen.price;
        return '<label class="purchase-field">'+(kind==='weapon'?'Waffe':'Rüstung')+'<select data-purchase-char="'+i+'" data-purchase-kind="'+kind+'"><option value="">Keine kaufen · 0 Gil</option>'+options.map(x=>'<option value="'+esc(x.id)+'" '+(chosen?.id===x.id?'selected':'')+'>'+esc(labelOf(kind,x))+'</option>').join('')+'</select></label>';
      };
      const spells=possible(catalog.magic||[]).map(x=>{
        const checked=Array.isArray(picks.magic)&&picks.magic.includes(x.id);
        if(checked)sum+=x.price;
        return '<label class="purchase-spell"><input type="checkbox" data-purchase-char="'+i+'" data-purchase-kind="magic" value="'+esc(x.id)+'" '+(checked?'checked':'')+'><span>'+esc(x.name)+' · '+x.price+' Gil</span></label>';
      }).join('');
      return '<section class="purchase-character"><strong>Figur '+(i+1)+' · '+esc(CLASS_OPTIONS.find(x=>x[0]===classId)?.[1]||classId)+'</strong><div class="purchase-fields">'+menu('weapon',catalog.weapons||[])+menu('armor',catalog.armor||[])+'</div>'+(spells?'<div class="purchase-spells">'+spells+'</div>':'')+'</section>';
    }).join('');
    return '<section class="party-panel" aria-label="Einkaufsrechner"><h3>💰 Cornelia-Einkaufsrechner</h3><p>Wähle nur die Sachen, die du kaufen möchtest. Ausrüstung wird nach Klasse gefiltert. Zauber werden pro Figur berechnet; bereits vorhandene Gegenstände bitte nicht auswählen.</p>'+rows+'<div class="purchase-total"><span>Geplante Gesamtkosten</span><strong id="purchase-total">'+sum+' Gil</strong></div><button type="button" class="btn btn-quiet" data-action="clear-purchase">Auswahl zurücksetzen</button><p class="collection-note">Planung, kein Kauf im Spiel. Vorhandenes Gil und Zauberplätze werden nicht automatisch ermittelt.</p></section>';
  };
  const renderSidebar = () => {
    ensureSlots();
    const selector=byId('save-selector');
    if(selector){
      selector.innerHTML=[1,2,3].map(n=>'<option value="'+n+'">'+esc(state.slots[slotId(state.selectedGame,n)].name)+'</option>').join('');
      selector.value=String(activeSlot(state.selectedGame));
    }
    for(const [id,view] of [['dashboard-link','dashboard'],['step-link','steps'],['collections-link','collections']])byId(id)?.classList.toggle('active',state.view===view);
    const bestiaryLink=byId('bestiary-link');
    if(bestiaryLink)bestiaryLink.classList.toggle('active',state.view==='bestiary');
    const quickGame=byId('quick-game'),quickChapter=byId('quick-chapter');
    if(quickGame){quickGame.innerHTML=manifest.games.map(g=>'<option value="'+esc(g.id)+'">'+esc(g.title)+'</option>').join('');quickGame.value=state.selectedGame;}
    if(quickChapter){const all=getChapters(state.selectedGame);quickChapter.innerHTML=all.length?all.map(x=>'<option value="'+esc(x.document.chapter.id)+'">'+esc(x.document.chapter.title)+'</option>').join(''):'<option value="">Noch keine Kapitel</option>';quickChapter.value=state.selectedChapter;quickChapter.disabled=!all.length;}
    const chapterIds=getChapters(state.selectedGame).map(x=>x.document.chapter.id);
    const chapterIndex=chapterIds.indexOf(state.selectedChapter);
    const previousButton=byId('quick-prev'),nextButton=byId('quick-next');
    if(previousButton)previousButton.disabled=chapterIndex<=0;
    if(nextButton)nextButton.disabled=chapterIndex<0||chapterIndex>=chapterIds.length-1;
    byId('game-list').innerHTML=manifest.games.map(g => {
      const count=getChapters(g.id).length;
      const abbr=g.title.replace('Final Fantasy ','');
      return `<button type="button" data-action="game" data-id="${esc(g.id)}" class="game-item ${g.id===state.selectedGame?'active':''}" aria-pressed="${g.id===state.selectedGame}"><span class="game-icon">${esc(abbr)}</span><span><span class="game-name">${esc(g.title)}</span><span class="game-sub">${esc(count?g.edition+' · '+count+' Kapitel':'Geplant · '+g.edition)}</span></span></button>`;
    }).join('');
    const chapters=getChapters(state.selectedGame);
    byId('chapter-count').textContent=chapters.length+' Kapitel';
    byId('chapter-list').innerHTML=chapters.map(({document:p})=>{
      const st=getStats(p);return `<button type="button" class="chapter-item ${p.chapter.id===state.selectedChapter?'active':''}" data-action="chapter" data-id="${esc(p.chapter.id)}" aria-pressed="${p.chapter.id===state.selectedChapter}"><span class="chapter-num">${String(p.chapter.number).padStart(2,'0')}</span><span style="flex:1;min-width:0"><span class="game-name">${esc(p.chapter.title)}</span><span class="game-sub">${st.done}/${st.total} erledigt · ${st.percent}%</span><span class="mini-progress"><span style="width:${st.percent}%"></span></span></span></button>`;
    }).join('') || '<p class="game-sub" style="padding:0 12px">Noch keine Kapitel vorhanden.</p>';
  };
  const visibleChecks = checks => checks.filter(c => filter==='all'||filter==='open' ? filter==='all'||!state.progress[c.key] : c.category===filter);
  const filterSection = (s,p) => {
    const hay = [s.title,s.location,s.intro,...s.steps,...(s.tips||[]),...s.checks.map(c=>c.title+' '+(c.detail||''))].join(' ').toLocaleLowerCase('de');
    if(search && !hay.includes(search.toLocaleLowerCase('de')))return false;
    if(filter === 'all')return true;
    return s.checks.some(c=>filter==='open'?!state.progress[getTaskKey(p,s,c)]:c.category===filter);
  };
  const renderChecks = (p,s) => s.checks.map(c => ({...c,key:getTaskKey(p,s,c)})).filter(c => filter==='all'||(filter==='open'?!state.progress[c.key]:c.category===filter)).map(c => {
    const done=state.progress[c.key]===true;
    return `<label class="task ${done?'checked':''}" data-task-key="${esc(c.key)}"><input type="checkbox" data-task="${esc(c.key)}" ${done?'checked':''}><span class="task-text"><strong><span class="category ${esc(c.category||'misc')}">${esc(CATEGORY[c.category]||CATEGORY.misc)}</span>${esc(c.title)}</strong><small>${esc(textPriority(c))}${c.requiredFor100===false?' · nicht für Kapitelpflichten':''}</small>${c.detail?`<small>${esc(c.detail)}</small>`:''}</span></label>`;
  }).join('');
  const renderSection = (s,i,p,openSections) => {
    const st=stats(s.checks.filter(isRequired).map(c=>getTaskKey(p,s,c)));
    const tips=(s.tips||[]).map(t=>`<div class="callout"><strong>💡 TIPP</strong>${esc(t)}</div>`).join('');
    const later=(s.later||[]).map(t=>`<div class="callout later"><strong>↺ SPÄTER WIEDERKOMMEN</strong>${esc(t)}</div>`).join('');
    const steps=(s.steps||[]).map(step=>`<li>${esc(step)}</li>`).join('');
    const location=currentPosition();
    const isHere=location?.chapterId===p.chapter.id && location.sectionId===s.id;
    const misses=s.checks.filter(c=>c.missable===true || c.category==='missable');
    const warning=misses.length?'<div class="callout missable"><strong>⚠️ VERPASSBAR</strong>'+misses.map(c=>esc(c.title)).join(' · ')+'</div>':'';
    const bookmark='<div class="bookmark-row"><button type="button" class="btn btn-quiet btn-bookmark '+(isHere?'current':'')+'" data-action="bookmark" data-id="'+esc(s.id)+'">'+(isHere?'📍 Du bist hier':'📍 Hier bin ich')+'</button></div>';
    return `<details class="chapter-section" data-section="${esc(s.id)}" ${openSections.has(s.id)?'open':''}><summary><span class="section-index">${String(i+1).padStart(2,'0')}</span><span class="section-title"><strong>${esc(s.title)}</strong><small>⌖ ${esc(s.location||'Spielgebiet')}</small></span><span class="section-count">${st.done} / ${st.total}</span><span class="chev">⌄</span></summary><div class="section-body">${bookmark}<p class="lead">${esc(s.intro||'')}</p><ol class="step-list">${steps}</ol>${warning}${tips}${later}<div class="checks-head">CHECKLISTE · ${st.total} AUFGABEN</div><div class="check-grid">${renderChecks(p,s)||'<p class="lead">Keine Aufgaben im gewählten Filter.</p>'}</div></div></details>`;
  };
  const renderReference = () => {
    renderMobileProgress();
    const kind=state.referenceType||'classes';
    const titles={classes:'Klassen',weapons:'Waffen',armor:'Rüstungen',magic:'Magie','key-item':'Schlüsselgegenstände',shops:'Shops'};
    const chapters=getChapters(state.selectedGame).map(x=>x.document);
    const items=chapters.flatMap(p=>{
      const cat=p.chapter.shopCatalog;
      if(!cat)return [];
      if(kind==='weapons')return (cat.weapons||[]).map(x=>({title:x.name,desc:'Angriff +'+x.attack+(x.accuracy===undefined?'':' · Präzision +'+x.accuracy)+' · '+x.price+' Gil',classes:x.classes}));
      if(kind==='armor')return (cat.armor||[]).map(x=>({title:x.name,desc:'Abwehr +'+x.defense+' · Gewicht +'+x.weight+' · '+x.price+' Gil',classes:x.classes}));
      if(kind==='magic')return (cat.magic||[]).map(x=>({title:x.name,desc:x.price+' Gil · '+(x.effect||'Wirkung noch nicht bestätigt'),classes:x.classes}));
      return [];
    });
    if(kind==='key-item')chapters.forEach(p=>p.chapter.sections.forEach(sec=>sec.checks.filter(c=>c.category==='key-item').forEach(c=>items.push({title:c.title,desc:p.chapter.title}))));
    if(kind==='shops')chapters.forEach(p=>(p.chapter.shops||[]).forEach(shop=>items.push({title:shop.location,desc:p.chapter.title,chapterId:p.chapter.id})));
    if(kind==='classes')chapters.forEach(p=>(p.chapter.classReference||[]).forEach(x=>{if(!items.some(a=>a.id===x.id))items.push({title:x.name+' → '+x.promoted,desc:x.role+' Magie: '+x.magic,id:x.id,classes:[]});}));
    if(kind==='magic'&&state.selectedGame==='ff1-pr'&&magicCatalog?.spells?.length===64){
      items.length=0;
      magicCatalog.spells.forEach(x=>items.push({title:x.nameDe||x.englishName,desc:'Stufe '+x.level+' · '+(x.school==='white'?'Weißmagie':'Schwarzmagie')+' · '+x.priceGil.toLocaleString('de-DE')+' Gil · '+x.locations.join(', ')+' · '+x.effectDe,classes:x.classes.filter(id=>CLASS_OPTIONS.some(c=>c[0]===id)),school:x.school,level:x.level,unverified:x.nameStatus!=='player-confirmed',english:x.englishName}));
    }
    const magicFilters=kind==='magic'&&magicCatalog?.spells?.length===64?'<div class="reference-filter"><label>Magieart <select id="magic-school-filter"><option value="all">Alle</option><option value="white" '+(magicSchoolFilter==='white'?'selected':'')+'>Weißmagie</option><option value="black" '+(magicSchoolFilter==='black'?'selected':'')+'>Schwarzmagie</option></select></label><label>Stufe <select id="magic-level-filter"><option value="all">Alle Stufen</option>'+Array.from({length:8},(_,i)=>'<option value="'+(i+1)+'" '+(magicLevelFilter===String(i+1)?'selected':'')+'>'+(i+1)+'</option>').join('')+'</select></label></div>':'';
    if((kind==='weapons'||kind==='armor')&&state.selectedGame==='ff1-pr'&&equipmentCatalog?.items?.length){
      const byName=new Set(items.map(x=>x.title.toLowerCase()));
      const reportedToClass={'Krieger':'warrior','Dieb':'thief','Mönch':'monk','Rotmagier':'red-mage','Weißmagier':'white-mage','Schwarzmagier':'black-mage'};
      for(const x of equipmentCatalog.items.filter(x=>x.kind===(kind==='weapons'?'weapon':'armor'))){
        if(byName.has(x.nameDe.toLowerCase()))continue;
        items.push({title:x.nameDe,desc:x.englishName+' · '+x.descriptionDe+' · Forschungsstand: nicht abschließend geprüft',classes:x.classesReported.includes('Alle')?CLASS_OPTIONS.map(y=>y[0]):x.classesReported.map(c=>reportedToClass[c]).filter(Boolean),unverified:true,equipmentDraft:true});
      }
    }
    const filterable=['weapons','armor','magic'].includes(kind);
    const selectedFilter=state.referenceClassFilter||'all';
    const visibleItems=items.filter(x=>(!filterable||selectedFilter==='all'||(x.classes||[]).includes(selectedFilter))&&(kind!=='magic'||(magicSchoolFilter==='all'||x.school===magicSchoolFilter)&&(magicLevelFilter==='all'||String(x.level)===magicLevelFilter)));
    const filterHtml=filterable?'<label class="reference-filter">Nur für Klasse: <select id="reference-class-filter" aria-label="Ausrüstung nach Klasse filtern"><option value="all">Alle Klassen</option>'+CLASS_OPTIONS.map(([id,name])=>'<option value="'+esc(id)+'" '+(selectedFilter===id?'selected':'')+'>'+esc(name)+'</option>').join('')+'</select></label>':'';
    const className=id=>CLASS_OPTIONS.find(x=>x[0]===id)?.[1]||id;
    byId('main').innerHTML='<div class="breadcrumbs">NACHSCHLAGEWERK / '+esc(titles[kind])+'</div><div class="hero"><div class="hero-content"><span class="eyebrow">📚 REFERENZ</span><h1>'+esc(titles[kind])+'</h1><p>Veröffentlichte Daten des ausgewählten Spiels. Fehlende Einträge werden später ergänzt.</p><button type="button" class="btn btn-quiet" data-action="guide">← Zum Walkthrough</button></div></div><div class="reference-grid">'+(items.length?items.map(x=>'<article class="reference-card"><h3>'+esc(x.title)+'</h3>'+(x.unverified?'<small>'+(x.equipmentDraft?'Ausrüstungsdaten noch ungeprüft':'Deutsche Bezeichnung noch ungeprüft')+'</small>':'')+'<p>'+esc(x.desc)+'</p>'+(x.classes?.length?'<small>Klassen: '+esc(x.classes.map(className).join(', '))+'</small>':'')+(x.chapterId?'<button type="button" class="btn btn-quiet" data-action="chapter" data-id="'+esc(x.chapterId)+'">Kapitel öffnen</button>':'')+'</article>').join(''):'<p>Für diese Kategorie sind noch keine geprüften Einträge veröffentlicht.</p>')+'</div>';
  };
  const renderMain = (restoreOpened) => {
    renderMobileProgress();
    const current=getCurrent(); const game=findGame(state.selectedGame);
    if(state.view==='reference'){renderReference();return;}
    if(state.view==='bestiary'){renderBestiary();return;}
    if(state.view==='dashboard'){renderMobileProgress();renderDashboard();return;}
    if(state.view==='steps'){renderMobileProgress();renderStepMode();return;}
    if(state.view==='collections'){renderMobileProgress();renderCollections();return;}
    if(!current){byId('main').innerHTML=`<div class="breadcrumbs">BIBLIOTHEK / ${esc(game?.title||'')}</div><div class="empty"><span class="eyebrow">IN VORBEREITUNG</span><h2>${esc(game?.title||'Spiel')}</h2><p>Das standardisierte Gerüst steht. Für diesen Teil ist noch kein Kapitel veröffentlicht. Importiere später passende JSON-Dateien – das Layout bleibt gleich.</p><label class="btn btn-primary" for="import-input">Kapiteldatei importieren</label></div>`;return;}
    const p=current.document,ch=p.chapter,st=getStats(p),totalGame=gameStats(p.gameId);
    const where=currentPosition();
    const resumeHtml=where&&getChapters(state.selectedGame).some(x=>x.document.chapter.id===where.chapterId)?'<div class="resume-cta"><span>📍 Zuletzt gemerkt: '+esc(getChapters(state.selectedGame).find(x=>x.document.chapter.id===where.chapterId)?.document.chapter.title||'Kapitel')+'</span><button class="btn btn-primary" type="button" data-action="resume">Dort fortsetzen</button></div>':'';
    const opened = restoreOpened || new Set([where?.chapterId===ch.id?where.sectionId:(ch.sections.find(x=>x.defaultOpen===true)||ch.sections[0])?.id]);
    const matchSections=ch.sections.map((s,i)=>({s,i})).filter(({s})=>filterSection(s,p));
    const last = getChapters(p.gameId);
    const index=last.findIndex(o=>o.document.chapter.id===ch.id);
    const next=last[index+1]?.document;
    const dash=ch.dashboard||{};
    const selectedClasses=slotData().party||['warrior','monk','white-mage','black-mage'];
    const shopHtml=(ch.shops||[]).map(shop=>{
      const columns=[['mustBuy','✅ Nützlich / Voraussetzung'],['optional','🟡 Optional'],['skip','⏭️ Meist überspringen']];
      return '<details class="chapter-section"><summary><span class="section-title"><strong>🛒 Shop: '+esc(shop.location)+'</strong></span></summary><div class="section-body">'+columns.map(([k,label])=>!shop[k]?.length?'':'<h3>'+label+'</h3>'+shop[k].filter(x=>!Array.isArray(x.classes)||x.classes.some(c=>selectedClasses.includes(c))).map(x=>'<p class="lead"><strong>'+esc(x.item)+'</strong> '+esc(x.when||'')+' – '+esc(x.reason||'')+'</p>').join('')).join('')+'</div></details>';
    }).join('');
    const catalog=ch.shopCatalog;
    const catalogHtml=catalog?'<details class="chapter-section shop-catalog"><summary><span class="section-title"><strong>🛍️ Cornelia – deutsche Preise & Werte</strong></span></summary><div class="section-body"><p class="lead">Direkt aus der deutschen Spielversion abgelesen. Preise in '+esc(catalog.currency||'Gil')+'.</p>'+
    '<h3>Waffen</h3><div class="catalog-list">'+(catalog.weapons||[]).map(x=>'<div class="catalog-item"><strong>'+esc(x.name)+'</strong><span>'+esc(x.price)+' Gil · Angriff +'+esc(x.attack)+(x.accuracy===undefined?'':' · Präzision +'+esc(x.accuracy))+'</span></div>').join('')+'</div>'+
    '<h3>Rüstung</h3><div class="catalog-list">'+(catalog.armor||[]).map(x=>'<div class="catalog-item"><strong>'+esc(x.name)+'</strong><span>'+esc(x.price)+' Gil · Abwehr +'+esc(x.defense)+' · Gewicht +'+esc(x.weight)+'</span></div>').join('')+'</div>'+
    '<h3>Weißmagie · Stufe 1</h3><div class="catalog-list">'+(catalog.magic||[]).filter(x=>x.school==='white').map(x=>'<div class="catalog-item"><strong>'+esc(x.name)+'</strong><span>'+esc(x.price)+' Gil · '+esc(x.effect||'Wirkung noch offen')+'</span></div>').join('')+'</div>'+
    '<h3>Schwarzmagie · Stufe 1</h3><div class="catalog-list">'+(catalog.magic||[]).filter(x=>x.school==='black').map(x=>'<div class="catalog-item"><strong>'+esc(x.name)+'</strong><span>'+esc(x.price)+' Gil · '+esc(x.effect||'⚠️ Wirkung noch nicht bestätigt')+'</span></div>').join('')+'</div></div></details>':'';
    const sources=(ch.sources||[]).filter(s=>safeUrl(s.url)).map(s=>`<a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`).join('');
    byId('main').innerHTML=`
      <div class="breadcrumbs">BIBLIOTHEK / ${esc(game.title)} / <b>Kapitel ${esc(ch.number)}</b></div>
      ${resumeHtml}
      <article class="hero"><div class="hero-content"><span class="eyebrow">${esc(game.edition)} · KAPITEL ${String(ch.number).padStart(2,'0')}</span><h1>${esc(ch.title)}</h1><div class="hero-sub">${esc(ch.subtitle||'')}</div><p class="hero-description">${esc(ch.summary||'')}</p><div class="pill-row"><span class="pill gold">✦ 100%-Checkliste</span><span class="pill">${esc(ch.difficulty||'Guide')}</span><span class="pill">${ch.sections.length} Teilabschnitte</span>${dash.recommendedLevel?'<span class="pill">Level-Empfehlung: '+esc(dash.recommendedLevel)+'</span>':''}<span class="pill">${totalGame.done}/${totalGame.total} Spiel-Aufgaben</span></div>
      <div class="progress-card"><div class="progress-head"><div><span>Kapitel-Fortschritt</span><br><strong>${st.percent}%</strong></div><span>${st.done} von ${st.total} Aufgaben erledigt</span></div><div class="progress-track" role="progressbar" aria-label="Kapitel-Fortschritt" aria-valuenow="${st.percent}" aria-valuemin="0" aria-valuemax="100"><span style="width:${st.percent}%"></span></div><div class="progress-foot"><span>Dein Fortschritt bleibt im Browser</span><span>${st.percent===100?'✓ Kapitel vollständig':'Noch '+(st.total-st.done)+' offen'}</span></div></div>
      ${where?.chapterId===ch.id?'<div class="position-note"><span>📍 Gemerkt: '+esc(ch.sections.find(s=>s.id===where.sectionId)?.title||'Abschnitt')+'</span><button class="btn btn-quiet" type="button" data-action="jump-position">Zur Stelle springen</button></div>':''}
      <div class="action-row"><button type="button" class="btn btn-primary" data-action="next-open">➜ Nächste offene Aufgabe</button><button type="button" class="btn btn-quiet" data-action="backup">↓ Fortschritt sichern</button><button type="button" class="btn btn-quiet" data-action="reset">↺ Kapitel zurücksetzen</button><button type="button" class="btn btn-quiet" data-action="story-finish">📖 Story fertig &amp; weiter</button><button type="button" class="btn finish-chapter" data-action="complete-chapter">✅ Alle Pflichtaufgaben abhaken &amp; weiter</button></div></div></article>
      <div class="section-toolbar"><div><h2>Dein Weg durchs Kapitel</h2><p>Aufgaben abhaken, Abschnitt öffnen und direkt weiterspielen.</p></div><div class="filters"><button type="button" class="btn btn-quiet section-toggle" data-action="expand-all">Alle öffnen</button><button type="button" class="btn btn-quiet section-toggle" data-action="collapse-all">Alle schließen</button><input class="search-input" id="guide-search" type="search" placeholder="Im Kapitel suchen …" value="${esc(search)}" aria-label="Im Kapitel suchen"><select class="filter-select" id="guide-filter" aria-label="Aufgaben filtern"><option value="all" ${filter==='all'?'selected':''}>Alle Aufgaben</option><option value="open" ${filter==='open'?'selected':''}>Nur offene</option>${Object.entries(CATEGORY).map(([id,name])=>`<option value="${esc(id)}" ${filter===id?'selected':''}>${esc(name)}</option>`).join('')}</select></div></div>
      <div id="section-list">${matchSections.map(({s,i})=>renderSection(s,i,p,opened)).join('')||'<div class="empty"><p>Keine passenden Abschnitte gefunden. Suchbegriff oder Filter zurücksetzen.</p></div>'}</div>
      ${renderParty()}
      ${renderPurchasePlanner(catalog)}
      ${shopHtml}
      ${catalogHtml}
      <div class="checkpoint"><h3>✓ Checkpoint: Kapitel ${esc(ch.number)}</h3><p>${esc(ch.checkpoint||'Abschnitt abgeschlossen.')}</p><div class="action-row">${next?`<button type="button" class="btn btn-primary" data-action="chapter" data-id="${esc(next.id)}">Weiter zu Kapitel ${esc(next.number)} →</button>`:'<span class="pill">Nächstes Kapitel folgt als JSON-Update</span>'}</div></div>
      ${sources?`<details class="sources"><summary>Quellen & Abgleich für dieses Kapitel</summary>${sources}</details>`:''}`;
  };
  const render = () => {firstChapterSelection();renderSidebar();renderMain();};
  const download = (filename, payload) => {
    const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const switchSlot = slot => {
    const n=Number(slot);if(!Number.isInteger(n)||n<1||n>3)return;
    saveActiveSlot();hydrateSlot(state.selectedGame,n);persist();render();
    notify('Spielstand '+n+' geladen.');
  };
  const renderBestiary = () => {
    renderMobileProgress();
    const game=findGame(state.selectedGame);
    const entries=getChapters(state.selectedGame).flatMap(o=>o.document.chapter.sections.flatMap(section=>section.checks.filter(c=>c.category==='bestiary').map(c=>({p:o.document,section,c,key:getTaskKey(o.document,section,c)}))));
    const unique=[...new Map(entries.map(x=>[x.key,x])).values()];
    const done=unique.filter(x=>state.progress[x.key]).length;
    byId('main').innerHTML='<div class="breadcrumbs">BIBLIOTHEK / '+esc(game?.title||'')+' / BESTIARIUM</div><div class="hero"><div class="hero-content"><span class="eyebrow">🐉 GEGNERKATALOG</span><h1>Bestiarium</h1><p class="bestiary-summary">Alle bisher veröffentlichten Gegner dieses Spiels · '+done+' von '+unique.length+' gefunden. Häkchen gelten nur für deinen aktiven Spielstand.</p><div class="action-row"><button class="btn btn-primary" data-action="guide">← Zurück zum Guide</button></div></div></div><div class="bestiary-filters"><input id="bestiary-search" class="search-input" type="search" placeholder="Gegner suchen …" aria-label="Gegner suchen"><select id="bestiary-filter" class="filter-select"><option value="all">Alle Gegner</option><option value="missing">Nur fehlende</option></select></div><div class="bestiary-list" id="bestiary-list"></div>';
    renderBestiaryEntries(unique);
  };
  const renderBestiaryEntries = entries => {
    const host=byId('bestiary-list');if(!host)return;
    const q=byId('bestiary-search')?.value.toLocaleLowerCase('de')||'';
    const missing=byId('bestiary-filter')?.value==='missing';
    const subset=entries.filter(x=>(!missing||!state.progress[x.key])&&[x.c.title,x.c.detail,x.p.chapter.title].join(' ').toLocaleLowerCase('de').includes(q));
    host.innerHTML=subset.map(x=>'<article class="bestiary-card"><label class="task '+(state.progress[x.key]?'checked':'')+'"><input type="checkbox" data-bestiary-task="'+esc(x.key)+'" '+(state.progress[x.key]?'checked':'')+'><span class="task-text"><strong>🐉 '+esc(x.c.title)+'</strong>'+ (x.c.detail?'<small>'+esc(x.c.detail)+'</small>':'')+'</span></label><div class="bestiary-meta"><span class="pill">Kapitel '+esc(x.p.chapter.number)+': '+esc(x.p.chapter.title)+'</span><button type="button" class="bestiary-source" data-action="bestiary-location" data-chapter="'+esc(x.p.chapter.id)+'" data-section="'+esc(x.section.id)+'">Fundort anzeigen</button></div></article>').join('')||'<div class="empty"><p>Keine passenden Gegner gefunden.</p></div>';
  };
  const storyFinish = () => {
    const current=getCurrent()?.document;if(!current)return;
    const chapters=getChapters(state.selectedGame),idx=chapters.findIndex(x=>x.document.chapter.id===current.chapter.id),next=chapters[idx+1]?.document;
    if(!confirm('Story in diesem Kapitel als beendet markieren? Alle offenen Truhen und Bestiarium-Einträge bleiben unverändert.'))return;
    state.storyCompleted ||= {};
    state.storyCompleted[slotId(state.selectedGame,activeSlot(state.selectedGame))+'/'+current.chapter.id]=true;
    persist();
    if(next)selectChapter(next.chapter.id);else render();
    notify('📖 Story abgeschlossen. Sammelaufgaben bleiben unverändert.');
  };
  const completeChapter = () => {
    const current=getCurrent()?.document;if(!current)return;
    const keys=getTasks(current),remaining=keys.filter(k=>state.progress[k]!==true).length;
    if(!confirm('Kapitel „'+current.chapter.title+'“ komplett abhaken? '+remaining+' offene Aufgaben werden als erledigt markiert. Dies betrifft nur diesen Spielstand.'))return;
    for(const key of keys)state.progress[key]=true;
    persist();
    const chapters=getChapters(state.selectedGame),n=chapters.findIndex(x=>x.document.chapter.id===current.chapter.id),next=chapters[n+1]?.document;
    if(next){selectChapter(next.chapter.id);notify('✅ Kapitel abgeschlossen – weiter mit Kapitel '+next.chapter.number+'.');}
    else{render();notify('✅ Kapitel vollständig abgeschlossen. Das nächste Kapitel ist noch nicht veröffentlicht.');}
  };
  const backup = () => {saveActiveSlot();download('ff-companion-sicherung-'+new Date().toISOString().slice(0,10)+'.json',
    {format:'ff-companion-backup',schemaVersion:VERSION,exportedAt:new Date().toISOString(),state});};
  const selectGame = id => {if(!findGame(id))return;saveActiveSlot();state.selectedGame=id;hydrateSlot(id,activeSlot(id));state.selectedChapter=getChapters(id)[0]?.document.chapter.id||'';search='';filter='all';state.view='guide';persist();render();setMobileMenu(false);};
  const selectChapter = id => {if(!getChapters(state.selectedGame).some(o=>o.document.chapter.id===id))return;state.selectedChapter=id;search='';filter='all';state.view='guide';persist();render();setMobileMenu(false);byId('main').scrollIntoView({behavior:'smooth',block:'start'});};
  const nextOpen = () => {
    const p=getCurrent()?.document;if(!p)return;
    const unfinished=getTasks(p).find(k=>state.progress[k]!==true);
    if(!unfinished){notify('Kapitel vollständig abgehakt! 🎉');return;}
    search='';filter='all';renderMain(new Set([unfinished.split('/')[2]]));
    const task=[...document.querySelectorAll('[data-task-key]')].find(n=>n.dataset.taskKey===unfinished);
    if(task){task.scrollIntoView({behavior:'smooth',block:'center'});task.style.outline='2px solid #ebd08a';setTimeout(()=>task.style.outline='',1800);}
  };
  const reset = () => {
    const p=getCurrent()?.document;if(!p)return;
    if(!confirm('Wirklich alle Häkchen in „'+p.chapter.title+'“ entfernen?'))return;
    for(const k of getTasks(p))delete state.progress[k];persist();render();notify('Kapitel-Fortschritt zurückgesetzt.');
  };
  const importJson = async files => {
    let count=0, backedUp=false;
    for(const file of files){
      try{
        if(file.size>5*1024*1024)throw new Error('Datei größer als 5 MB.');
        const obj=JSON.parse(await file.text());
        if(obj.format==='ff-companion-backup'&&obj.schemaVersion===VERSION){
          if(!confirm('Diese Sicherung ersetzt deine derzeitigen Häkchen und lokal importierten Kapitel. Fortfahren?'))continue;
          if(!obj.state || !obj.state.progress || !Array.isArray(obj.state.imports))throw new Error('Sicherung unvollständig.');
          const incoming={...defaultState(),...obj.state};
          incoming.imports.forEach(validateDocument);
          state=incoming;ensureSlots();backedUp=true;count++;continue;
        }
        let docs=[];
        if(obj.format==='ff-companion-pack' && Array.isArray(obj.chapters)){
          if(obj.chapters.length>50)throw new Error('Maximal 50 Kapitel pro Paket.');
          docs=obj.chapters;
        } else docs=[obj];
        docs.forEach(validateDocument);
        for(const p of docs){
          const existing=state.imports.findIndex(x=>chapterKey(x)===chapterKey(p));
          if(existing<0)state.imports.push(p);else state.imports[existing]=p;
          count++;
        }
      } catch(e){notify('„'+file.name+'“: '+e.message,true);}
    }
    if(!count)return;
    allChapters.clear();
    for(const p of SEED.chapters)register(p,'seed');
    for(const p of remoteDocs)register(p,'public');
    for(const p of state.imports)register(p,'import');
    persist();render();
    notify(backedUp?'Sicherung erfolgreich eingelesen.':'Importiert: '+count+' Kapitel. Bestehende Häkchen bleiben erhalten.');
  };
  let remoteDocs=[];
  const loadPublished = async () => {
    if(location.protocol==='file:')return;
    try{
      const r=await fetch('data/manifest.json',{cache:'no-cache'});
      if(!r.ok)throw new Error('Manifest nicht geladen');
      const obj=await r.json();
      if(obj.format!=='ff-companion-manifest'||obj.schemaVersion!==1||!Array.isArray(obj.games))throw new Error('Manifest ungültig');
      manifest=obj;
      remoteDocs=[];
      const paths=obj.games.flatMap(g => (g.chapterFiles||[]).map(path=>({gameId:g.id,path})));
      for(const entry of paths){
        if(!/^data\/[a-z0-9/-]+\.json$/.test(entry.path))continue;
        try{
          const response=await fetch(entry.path,{cache:'no-cache'});
          if(!response.ok)throw new Error('HTTP '+response.status);
          const d=await response.json();validateDocument(d);
          if(d.gameId!==entry.gameId)throw new Error('Spiel-ID passt nicht zum Manifest');
          remoteDocs.push(d);
        }catch(e){console.warn('Kapitel nicht ladbar: '+entry.path,e);}
      }
      allChapters.clear();
      for(const p of SEED.chapters)register(p,'seed');
      for(const p of remoteDocs)register(p,'public');
      for(const p of state.imports)register(p,'import');
      render();
    }catch(e){console.warn('Öffentliche Daten nicht ladbar, Offline-Startdaten verwendet.',e);}
  };
  document.addEventListener('click',event=>{
    const btn=event.target.closest('[data-action]');if(!btn)return;
    switch(btn.dataset.action){
      case 'reference':state.referenceType=btn.dataset.refType||'classes';state.view='reference';persist();renderMain();setMobileMenu(false);break;
      case 'previous-chapter':
      case 'next-chapter':{
        const chapters=getChapters(state.selectedGame);
        const index=chapters.findIndex(x=>x.document.chapter.id===state.selectedChapter);
        const target=chapters[index+(btn.dataset.action==='next-chapter'?1:-1)];
        if(target)selectChapter(target.document.chapter.id);
        break;
      }
      case 'dashboard':setView('dashboard');break;
      case 'collections':setView('collections');break;
      case 'step-mode':setView('steps');break;
      case 'resume':resume();break;
      case 'goto-entry':{const entry=dedupEntries(viewEntries()).find(x=>x.key===btn.dataset.key);if(entry)goToEntry(entry);break;}
      case 'step-done':{
        const entry=dedupEntries(viewEntries()).find(x=>x.key===btn.dataset.key);
        if(entry){state.progress[entry.key]=true;const slot=slotData();slot.position={chapterId:entry.p.chapter.id,sectionId:entry.section.id};slot.deferred=(slot.deferred||[]).filter(x=>x!==entry.key);persist();renderStepMode();}
        break;
      }
      case 'step-later':{
        const slot=slotData(),key=btn.dataset.key;slot.deferred||=[];if(!slot.deferred.includes(key))slot.deferred.push(key);persist();renderStepMode();break;
      }
      case 'clear-purchase':slotData().purchasePlan={};persist();renderMain();break;
      case 'open-settings':byId('settings-dialog')?.showModal();break;
      case 'close-settings':byId('settings-dialog')?.close();break;
      case 'text-smaller':changeFontSize(-1);break;
      case 'text-larger':changeFontSize(1);break;
      case 'expand-all':document.querySelectorAll('.chapter-section').forEach(d=>d.open=true);break;
      case 'collapse-all':document.querySelectorAll('.chapter-section').forEach(d=>d.open=false);break;
      case 'complete-chapter':completeChapter();break;
      case 'story-finish':storyFinish();break;
      case 'bookmark':setPosition(btn.dataset.id);break;
      case 'jump-position':{
        const where=currentPosition();if(!where)return;
        const section=[...document.querySelectorAll('.chapter-section')].find(e=>e.dataset.section===where.sectionId);
        if(section){section.open=true;section.scrollIntoView({behavior:'smooth',block:'start'});}
        break;
      }
      case 'rename-save':{
        const id=slotId(state.selectedGame,activeSlot(state.selectedGame)),old=state.slots[id].name;
        const name=prompt('Name dieses Spielstands:',old);
        if(name!==null && name.trim()){state.slots[id].name=name.trim().slice(0,55);persist();renderSidebar();}
        break;
      }
      case 'bestiary':state.view='bestiary';persist();renderMain();setMobileMenu(false);break;
      case 'guide':state.view='guide';persist();render();break;
      case 'bestiary-location':{
        state.view='guide';state.selectedChapter=btn.dataset.chapter;
        search='';filter='all';persist();renderMain(new Set([btn.dataset.section]));renderSidebar();
        const section=[...document.querySelectorAll('.chapter-section')].find(x=>x.dataset.section===btn.dataset.section);
        if(section)section.scrollIntoView({behavior:'smooth',block:'start'});
        break;
      }
      case 'mobile-menu':setMobileMenu(!byId('sidebar-inner').classList.contains('open'));break;
      case 'game':selectGame(btn.dataset.id);break;
      case 'chapter':selectChapter(btn.dataset.id);break;
      case 'backup':backup();break;
      case 'next-open':nextOpen();break;
      case 'reset':reset();break;
    }
  });
  document.addEventListener('change',event=>{
    if(event.target.matches('[data-task]')){
      const key=event.target.dataset.task;
      const p=getCurrent()?.document;
      if(!p||!p.chapter.sections.some(section=>section.checks.some(check=>getTaskKey(p,section,check)===key)))return;
      state.progress[key]=event.target.checked;
      persist();
      const expanded=new Set([...document.querySelectorAll('.chapter-section[open]')].map(x=>x.dataset.section));
      renderSidebar();renderMain(expanded);
    }
    if(event.target.matches('[data-purchase-char]')){
      const i=Number(event.target.dataset.purchaseChar),kind=event.target.dataset.purchaseKind;
      if(!Number.isInteger(i)||i<0||i>3)return;
      const current= getCurrent()?.document?.chapter?.shopCatalog;
      if(!current)return;
      const slot=slotData();slot.purchasePlan||={};slot.purchasePlan[i]||={};
      const pool=kind==='weapon'?current.weapons:kind==='armor'?current.armor:current.magic;
      const allowed=(pool||[]).filter(x=>x.classes?.includes(slot.party[i]));
      if(kind==='magic'){
        const selections=new Set(slot.purchasePlan[i].magic||[]);
        if(!allowed.some(x=>x.id===event.target.value))return;
        event.target.checked?selections.add(event.target.value):selections.delete(event.target.value);
        slot.purchasePlan[i].magic=[...selections];
      }else if(kind==='weapon'||kind==='armor'){
        if(event.target.value&&!allowed.some(x=>x.id===event.target.value))return;
        slot.purchasePlan[i][kind]=event.target.value;
      }
      persist();const expanded=new Set([...document.querySelectorAll('.chapter-section[open]')].map(e=>e.dataset.section));renderMain(expanded);return;
    }
    if(event.target.matches('[data-party-slot]')){
      const slot=slotData(),i=Number(event.target.dataset.partySlot);
      if(i>=0&&i<4&&CLASS_OPTIONS.some(x=>x[0]===event.target.value)){slot.party[i]=event.target.value;slot.purchasePlan||={};delete slot.purchasePlan[i];persist();const opened=new Set([...document.querySelectorAll('.chapter-section[open]')].map(e=>e.dataset.section));renderMain(opened);}
      return;
    }
    if(event.target.id==='magic-school-filter'){magicSchoolFilter=event.target.value;renderReference();return;}
    if(event.target.id==='magic-level-filter'){magicLevelFilter=event.target.value;renderReference();return;}
    if(event.target.id==='reference-class-filter'){state.referenceClassFilter=event.target.value;renderReference();return;}
    if(event.target.id==='quick-game'){selectGame(event.target.value);return;}
    if(event.target.id==='quick-chapter'){selectChapter(event.target.value);return;}
    if(event.target.id==='save-selector'){switchSlot(event.target.value);return;}
    if(event.target.matches('[data-bestiary-task]')){
      state.progress[event.target.dataset.bestiaryTask]=event.target.checked;
      persist();renderBestiary();return;
    }
    if(event.target.id==='bestiary-filter'){
      const entries=getChapters(state.selectedGame).flatMap(o=>o.document.chapter.sections.flatMap(section=>section.checks.filter(c=>c.category==='bestiary').map(c=>({p:o.document,section,c,key:getTaskKey(o.document,section,c)}))));
      renderBestiaryEntries(entries);return;
    }
    if(event.target.id==='guide-filter'){
      filter=event.target.value;
      const expanded=new Set([...document.querySelectorAll('.chapter-section[open]')].map(x=>x.dataset.section));
      renderMain(expanded);
    }
    if(event.target.id==='import-input'){
      importJson([...event.target.files]);event.target.value='';
    }
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='bestiary-search'){
      const entries=getChapters(state.selectedGame).flatMap(o=>o.document.chapter.sections.flatMap(section=>section.checks.filter(c=>c.category==='bestiary').map(c=>({p:o.document,section,c,key:getTaskKey(o.document,section,c)}))));
      renderBestiaryEntries(entries);return;
    }
    if(event.target.id!=='guide-search')return;
    const newSearch=event.target.value;
    search=newSearch;
    const pos=event.target.selectionStart;
    const expanded=new Set([...document.querySelectorAll('.chapter-section[open]')].map(x=>x.dataset.section));
    renderMain(expanded);
    const input=byId('guide-search');input.focus();input.setSelectionRange(pos,pos);
  });
  try{for(const p of SEED.chapters)register(p,'seed');for(const p of state.imports)register(p,'import');}catch(e){console.error('Startdaten:',e);state.imports=[];}
  const sheetLabel=byId('sheet-import-label');
  if(sheetLabel)sheetLabel.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();byId('import-input')?.click();}
  });
  const chooser=byId('import-input');
  if(chooser)chooser.addEventListener('change',()=>{if(byId('settings-dialog')?.open)byId('settings-dialog').close();});
  if('serviceWorker' in navigator && location.protocol==='https:')navigator.serviceWorker.register('./service-worker.js').catch(e=>console.warn('Offline nicht aktiv:',e));
  document.addEventListener('change',event=>{if(event.target.matches('#view-mode,#sheet-view-mode'))setLayoutMode(event.target.value);});
  const loadMagic=async()=>{try{const res=await fetch('data/ff1/magic.json',{cache:'no-cache'});if(!res.ok)throw Error('HTTP '+res.status);const data=await res.json();if(data.format==='ff-companion-magic'&&data.spells?.length===64){magicCatalog=data;if(state.view==='reference'&&state.referenceType==='magic')renderReference();}}catch(e){console.warn('Magiedaten nicht ladbar:',e);}};
  const loadEquipment=async()=>{try{const res=await fetch('data/ff1/equipment.json',{cache:'no-cache'});if(!res.ok)throw Error('HTTP '+res.status);const data=await res.json();if(data.format==='ff-companion-equipment'&&Array.isArray(data.items)){equipmentCatalog=data;if(state.view==='reference'&&['weapons','armor'].includes(state.referenceType))renderReference();}}catch(e){console.warn('Ausrüstungsdaten nicht ladbar:',e);}};
  applyFontSize();applyLayoutMode();
  render();loadPublished();if(location.protocol!=='file:'){loadMagic();loadEquipment();}
})();
