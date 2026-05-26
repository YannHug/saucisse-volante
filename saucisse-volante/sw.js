// ─────────────────────────────────────────────────────────────────────────────
// sw.js — Service Worker : met l'app en cache pour le mode hors-ligne
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_NAME = "saucisse-v1";

// Fichiers à mettre en cache au premier chargement
const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/config.js",
  "./js/logic.js",
  "./js/storage.js",
  "./js/components.js",
  "./js/canvas.js",
  "./js/app.js",
  "./js/main.js",
  "./assets/saucisse.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/favicon.png",
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
];

// Installation : mise en cache
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

// Interception : cache d'abord, réseau ensuite
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
