import { defineNuxtConfig } from 'nuxt/config';
import path from 'path'; // Import the 'path' module

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    cacheDir: ".vite"
  },
  nitro: {
    publicAssets: [
      {
        // This baseURL must match the cesiumBaseUrl set in your plugin (e.g., '/cesium/')
        baseURL: '/cesium/',
        // Specify the directory within node_modules to serve
        dir: path.resolve(__dirname, 'node_modules/cesium/Build/Cesium'),
        // Optional: Cache assets aggressively
        maxAge: 60 * 60 * 24 * 365
      }
    ]
  },
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true }
})
