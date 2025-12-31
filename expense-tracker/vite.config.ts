/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    legacy(),

    // ✅ PWA Plugin
    VitePWA({
      registerType: 'autoUpdate',

      // use the manifest you already have in /public
      manifest: {
        name: 'Expense Tracker',
        short_name: 'Expenses',
        description: 'Offline-first expense tracker',
        theme_color: '#3880ff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },

      // ✅ cache app shell + assets
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
      },

      // ✅ needed for dev testing
      devOptions: {
        enabled: true,
      },
    }),
  ],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
