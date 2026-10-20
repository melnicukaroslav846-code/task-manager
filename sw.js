const CACHE_NAME = 'mshub-cache-v' + Date.now(); // Кожен білд матиме унікальний кеш

self.addEventListener('install', (event) => {
  // Миттєво активувати новий Service Worker, не чекаючи закриття вкладок
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Видаляємо всі старі кеші автоматично
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Стратегія Network First для HTML: спершу беремо свіжу версію з мережі!
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Для решти ресурсів: шукаємо в кеші, якщо немає — вантажимо з мережі
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});