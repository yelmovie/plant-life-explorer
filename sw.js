// Offline cache for classroom Wi-Fi drops. scripts/build.mjs rewrites CACHE_VERSION and APP_SHELL in dist/sw.js.
const CACHE_VERSION='0.5.0';
const CACHE=`green-garden-${CACHE_VERSION}`;
const APP_SHELL=['/','/index.html','/manifest.webmanifest','/src/app.js','/src/style.css'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('green-garden-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
const remember=(request,response)=>{if(response.ok&&response.type==='basic'){const copy=response.clone();void caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;};
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  // HTML: network first so a new deploy shows up, cache when offline.
  if(request.mode==='navigate'||request.destination==='document'){
    event.respondWith(fetch(request).then(response=>remember(request,response)).catch(()=>caches.match(request).then(hit=>hit||caches.match('/index.html'))));
    return;
  }
  // Everything else: cache first. A new CACHE_VERSION replaces the whole cache.
  event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(response=>remember(request,response))));
});
