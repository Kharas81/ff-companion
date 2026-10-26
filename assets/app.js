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
    const decrease = document.querySelector('[data-action="text-smaller"]');
    const increase = document.querySelector('[data-action="text-larger"]');
    if (decrease) decrease.disabled = fontStep === 0;
    if (increase) increase.disabled = fontStep === FONT_STEPS.length - 1;
  };
  const changeFontSize = direction => {
    fontStep = Math.max(0,Math.min(FONT_STEPS.length-1,fontStep+direction));
    try { localStorage.setItem(FONT_KEY,String(fontStep)); } catch(err) { /* Kein Speicherdienst verfügbar. */ }
    applyFontSize();
  };
  const SEED = window.FF_COMPANION_SEED;
  const byId = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeUrl = raw => { try { const u = new URL(raw); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : ''; } catch { return ''; } };
  const CATEGORY = {'story':'Story','preparation':'Vorbereitung','chest':'Truhe','bestiary':'Bestiarium','boss':'Boss','key-item':'Schlüsselitem','misc':'Sonstiges'};
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
  const renderSidebar = () => {
    ensureSlots();
    const selector=byId('save-selector');
    if(selector){
      selector.innerHTML=[1,2,3].map(n=>'<option value="'+n+'">'+esc(state.slots[slotId(state.selectedGame,n)].name)+'</option>').join('');
      selector.value=String(activeSlot(state.selectedGame));
    }
    const bestiaryLink=byId('bestiary-link');
    if(bestiaryLink)bestiaryLink.classList.toggle('active',state.view==='bestiary');
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
  const renderMain = (restoreOpened) => {
    renderMobileProgress();
    const current=getCurrent(); const game=findGame(state.selectedGame);
    if(state.view==='bestiary'){renderBestiary();return;}
    if(!current){byId('main').innerHTML=`<div class="breadcrumbs">BIBLIOTHEK / ${esc(game?.title||'')}</div><div class="empty"><span class="eyebrow">IN VORBEREITUNG</span><h2>${esc(game?.title||'Spiel')}</h2><p>Das standardisierte Gerüst steht. Für diesen Teil ist noch kein Kapitel veröffentlicht. Importiere später passende JSON-Dateien – das Layout bleibt gleich.</p><label class="btn btn-primary" for="import-input">Kapiteldatei importieren</label></div>`;return;}
    const p=current.document,ch=p.chapter,st=getStats(p),totalGame=gameStats(p.gameId);
    const where=currentPosition();
    const opened = restoreOpened || new Set([where?.chapterId===ch.id?where.sectionId:(ch.sections.find(x=>x.defaultOpen===true)||ch.sections[0])?.id]);
    const matchSections=ch.sections.map((s,i)=>({s,i})).filter(({s})=>filterSection(s,p));
    const last = getChapters(p.gameId);
    const index=last.findIndex(o=>o.document.chapter.id===ch.id);
    const next=last[index+1]?.document;
    const dash=ch.dashboard||{};
    const shopHtml=(ch.shops||[]).map(shop=>{
      const columns=[['mustBuy','✅ Nützlich / Voraussetzung'],['optional','🟡 Optional'],['skip','⏭️ Meist überspringen']];
      return '<details class="chapter-section"><summary><span class="section-title"><strong>🛒 Shop: '+esc(shop.location)+'</strong></span></summary><div class="section-body">'+columns.map(([k,label])=>!shop[k]?.length?'':'<h3>'+label+'</h3>'+shop[k].map(x=>'<p class="lead"><strong>'+esc(x.item)+'</strong> '+esc(x.when||'')+' – '+esc(x.reason||'')+'</p>').join('')).join('')+'</div></details>';
    }).join('');
    const sources=(ch.sources||[]).filter(s=>safeUrl(s.url)).map(s=>`<a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`).join('');
    byId('main').innerHTML=`
      <div class="breadcrumbs">BIBLIOTHEK / ${esc(game.title)} / <b>Kapitel ${esc(ch.number)}</b></div>
      <article class="hero"><div class="hero-content"><span class="eyebrow">${esc(game.edition)} · KAPITEL ${String(ch.number).padStart(2,'0')}</span><h1>${esc(ch.title)}</h1><div class="hero-sub">${esc(ch.subtitle||'')}</div><p class="hero-description">${esc(ch.summary||'')}</p><div class="pill-row"><span class="pill gold">✦ 100%-Checkliste</span><span class="pill">${esc(ch.difficulty||'Guide')}</span><span class="pill">${ch.sections.length} Teilabschnitte</span>${dash.recommendedLevel?'<span class="pill">Level-Empfehlung: '+esc(dash.recommendedLevel)+'</span>':''}<span class="pill">${totalGame.done}/${totalGame.total} Spiel-Aufgaben</span></div>
      <div class="progress-card"><div class="progress-head"><div><span>Kapitel-Fortschritt</span><br><strong>${st.percent}%</strong></div><span>${st.done} von ${st.total} Aufgaben erledigt</span></div><div class="progress-track" role="progressbar" aria-label="Kapitel-Fortschritt" aria-valuenow="${st.percent}" aria-valuemin="0" aria-valuemax="100"><span style="width:${st.percent}%"></span></div><div class="progress-foot"><span>Dein Fortschritt bleibt im Browser</span><span>${st.percent===100?'✓ Kapitel vollständig':'Noch '+(st.total-st.done)+' offen'}</span></div></div>
      ${where?.chapterId===ch.id?'<div class="position-note"><span>📍 Gemerkt: '+esc(ch.sections.find(s=>s.id===where.sectionId)?.title||'Abschnitt')+'</span><button class="btn btn-quiet" type="button" data-action="jump-position">Zur Stelle springen</button></div>':''}
      <div class="action-row"><button type="button" class="btn btn-primary" data-action="next-open">➜ Nächste offene Aufgabe</button><button type="button" class="btn btn-quiet" data-action="backup">↓ Fortschritt sichern</button><button type="button" class="btn btn-quiet" data-action="reset">↺ Kapitel zurücksetzen</button><button type="button" class="btn btn-quiet" data-action="story-finish">📖 Story fertig &amp; weiter</button><button type="button" class="btn finish-chapter" data-action="complete-chapter">✅ Alle Pflichtaufgaben abhaken &amp; weiter</button></div></div></article>
      <div class="section-toolbar"><div><h2>Dein Weg durchs Kapitel</h2><p>Aufgaben abhaken, Abschnitt öffnen und direkt weiterspielen.</p></div><div class="filters"><button type="button" class="btn btn-quiet section-toggle" data-action="expand-all">Alle öffnen</button><button type="button" class="btn btn-quiet section-toggle" data-action="collapse-all">Alle schließen</button><input class="search-input" id="guide-search" type="search" placeholder="Im Kapitel suchen …" value="${esc(search)}" aria-label="Im Kapitel suchen"><select class="filter-select" id="guide-filter" aria-label="Aufgaben filtern"><option value="all" ${filter==='all'?'selected':''}>Alle Aufgaben</option><option value="open" ${filter==='open'?'selected':''}>Nur offene</option>${Object.entries(CATEGORY).map(([id,name])=>`<option value="${esc(id)}" ${filter===id?'selected':''}>${esc(name)}</option>`).join('')}</select></div></div>
      <div id="section-list">${matchSections.map(({s,i})=>renderSection(s,i,p,opened)).join('')||'<div class="empty"><p>Keine passenden Abschnitte gefunden. Suchbegriff oder Filter zurücksetzen.</p></div>'}</div>
      ${shopHtml}
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
      if(!p||!getTasks(p).includes(key))return;
      state.progress[key]=event.target.checked;
      persist();
      const expanded=new Set([...document.querySelectorAll('.chapter-section[open]')].map(x=>x.dataset.section));
      renderSidebar();renderMain(expanded);
    }
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
  applyFontSize();
  render();loadPublished();
})();
