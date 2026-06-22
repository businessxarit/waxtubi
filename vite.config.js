import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: false, // on garde notre manifest.json écrit à la main dans /public
      workbox: {
        // Précache les fichiers de build habituels (JS/CSS/HTML/icônes)
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        runtimeCaching: [
          {
            // Texte du Coran et liste des sourates (alquran.cloud) :
            // mis en cache automatiquement à la lecture, pas de bouton
            // nécessaire — l'app devient hors-ligne sur ce qui a déjà
            // été consulté. Léger (quelques Ko par sourate).
            urlPattern: /^https:\/\/api\.alquran\.cloud\/v1\/(surah|edition)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-text-cache',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 an — le texte du Coran ne change pas
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Horaires de prière et Hijri (Aladhan) : cache court, car
            // ça dépend du jour — on rafraîchit dès que le réseau revient.
            urlPattern: /^https:\/\/api\.aladhan\.com\/v1\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'prayer-times-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 jour
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Note : l'audio des sourates (cdn.islamic.network) n'est PAS
          // mis en cache ici par Workbox — il est géré manuellement via
          // IndexedDB (src/lib/audioDownloads.js) car les fichiers sont
          // trop volumineux pour le cache automatique et nécessitent un
          // contrôle explicite par l'utilisateur (téléchargement choisi).
        ],
      },
    }),
  ],
})
