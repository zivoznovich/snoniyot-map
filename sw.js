// App shell: versioned cache. Map tiles: long-lived cache, cache-first, so they work without signal.
const APP='mm-app-v20', TILES='mm-tiles-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(APP).then(c=>c.addAll(['./','index.html','manifest.webmanifest','icon.png'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==APP&&n!==TILES).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.hostname==='server.arcgisonline.com'){
    e.respondWith(caches.open(TILES).then(async c=>{
      const hit=await c.match(e.request.url); if(hit) return hit;
      const r=await fetch(e.request.url,{mode:'cors'}); if(r.ok) c.put(e.request.url,r.clone()); return r;}));
    return;
  }
  // App files: newest version when online, saved copy when offline.
  if(e.request.method==='GET' && u.origin===location.origin){
    e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{ if(r.ok){ const c=r.clone(); caches.open(APP).then(x=>x.put(e.request,c)); } return r; })
      .catch(()=>caches.match(e.request,{ignoreSearch:true})));
  }
});
