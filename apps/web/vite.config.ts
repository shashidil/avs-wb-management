import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    // @weighbridge/shared is a workspace symlink, so Vite serves it raw via
    // /@fs/ instead of pre-bundling it. Its compiled output is CommonJS
    // (required by the NestJS backend), so it needs to go through esbuild's
    // CJS->ESM interop to expose named exports in the browser.
    include: ['@weighbridge/shared'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,jpeg,svg,ico}'],
      },
      includeAssets: ['favicon-32x32.png', 'favicon-48x48.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'AVS WB Management',
        short_name: 'AVS WB',
        description: 'Clients, agreements, licences, and expiry reminders.',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
