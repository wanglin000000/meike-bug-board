// Service Worker — 网络优先，永保最新
const CACHE_NAME = 'meike-board-v20260728';

self.addEventListener('fetch', function(event) {
  // 仅处理同源 GET 请求（主页面和静态资源）
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    // 策略：网络优先，失败则用缓存
    fetch(event.request)
      .then(function(networkResponse) {
        // 网络成功——克隆响应并更新缓存
        if (networkResponse.ok) {
          var cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, cloned);
          });
        }
        return networkResponse;
      })
      .catch(function() {
        // 网络失败，降级到缓存
        return caches.match(event.request);
      })
  );
});

// 新 SW 安装时立即激活并清理旧缓存
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
});