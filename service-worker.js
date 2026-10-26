/* FF Companion: relativ zum GitHub-Pages-Projektpfad und nur öffentliche App-Dateien. */
const CACHE='ff-companion-v2-2026-10-26';
const SHELL=['./','./index.html','./assets/styles.css','./assets/app.js','./assets/offline-seed.js','./assets/app-icon.svg','./app.webmanifest','./data/manifest.json'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
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
