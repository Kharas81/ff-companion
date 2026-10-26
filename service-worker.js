/* FF Companion: relativ zum GitHub-Pages-Projektpfad und nur öffentliche App-Dateien. */
const CACHE='ff-companion-v3-2026-10-26';
const SHELL=['./','./index.html','./assets/styles.css','./assets/app.js','./assets/offline-seed.js','./assets/app-icon.svg','./app.webmanifest','./data/manifest.json'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(SHELL);
    try{
      const manifest=await (await cache.match('./data/manifest.json')).json();
      const paths=manifest.games.flatMap(game=>game.chapterFiles||[]).filter(path=>/^data\/[a-z0-9/-]+\.json$/.test(path));
      await Promise.all(paths.map(path=>cache.add('./'+path).catch(error=>console.warn('Kapitel nicht vorab gespeichert:',path,error))));
    }catch(error){console.warn('Kapitel für Offline-Modus noch nicht vollständig zwischengespeichert:',error);}
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ff-companion-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const response=await fetch(request);
      if(response.ok){cache.put(request,response.clone()).catch(()=>{});}
      return response;
    }catch(e){
      const cached=await cache.match(request,{ignoreSearch:true});
      if(cached)return cached;
      if(request.mode==='navigate')return await cache.match('./index.html')||Response.error();
      return Response.error();
    }
  })());
});
