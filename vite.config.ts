import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/travel-planner/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pic/**/*'],
      manifest: {
        name: '動森旅行規劃',
        short_name: '旅行規劃',
        description: '團體旅遊規劃 Web App - 動森手帳風格',
        theme_color: '#78A153',
        background_color: '#F7F4EB',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/travel-planner/',
        icons: [
          {
            src: 'pic/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pic/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pic/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-storage-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
