// El nombre de nuestro "almacén" (caché)
const CACHE_NAME = 'mis-finanzas-cache-v1';

// La lista de archivos que queremos guardar
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'js/chart.min.js',
  'img/logo.png'
];

// Evento 'install': Se dispara cuando el Service Worker se instala por primera vez.
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Abriendo caché y guardando archivos de la app');
        // Agrega todos los archivos de nuestra lista al caché
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Forza al nuevo Service Worker a activarse inmediatamente
        self.skipWaiting(); 
      })
  );
});

// Evento 'fetch': Se dispara cada vez que la app pide un recurso (una imagen, el html, etc.)
self.addEventListener('fetch', event => {
  console.log('Service Worker: Interceptando fetch para:', event.request.url);
  
  event.respondWith(
    // 1. Busca el recurso en el caché
    caches.match(event.request)
      .then(response => {
        if (response) {
          // 2. Si está en el caché, lo devuelve desde ahí
          console.log('Service Worker: Devolviendo desde caché:', event.request.url);
          return response;
        }
        
        // 3. Si no está en el caché, va a internet a buscarlo
        console.log('Service Worker: Buscando en red:', event.request.url);
        return fetch(event.request);
      })
  );
});

// Evento 'activate': Se dispara cuando el Service Worker se activa.
// Aquí podríamos limpiar cachés viejos si tuviéramos una 'v2', 'v3', etc.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activado.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Elimina cachés que no sean el actual (ej: 'mis-finanzas-cache-v0')
          return cacheName.startsWith('mis-finanzas-cache-') &&
                 cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  // Le dice al SW que tome control de la página inmediatamente
  return self.clients.claim(); 
});