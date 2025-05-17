// plugins/cesium.client.ts

import { defineNuxtPlugin } from '#app';
// Optional: Import Cesium here if you want to set the Ion token globally in the plugin
// import * as Cesium from 'cesium';

export default defineNuxtPlugin(() => {
  // Define the base URL where Cesium's static assets will be served from your public directory.
  // This path must match the configuration in your nuxt.config.ts (Step 4).
  const cesiumBaseUrl = '/cesium/';

  // Use import.meta.client to ensure this code only runs in the browser environment.
  if (import.meta.client) {
    // Set the global variable that CesiumJS looks for to find its assets.
    window.CESIUM_BASE_URL = cesiumBaseUrl;

    // Optional: Set your Cesium Ion access token globally here if you use Cesium Ion services.
    // Get your free token from https://cesium.com/ion/
    // if (typeof Cesium !== 'undefined' && Cesium.Ion) { // Check if Cesium is available (if imported above)
    //   Cesium.Ion.defaultAccessToken = 'YOUR_CESIUM_ION_ACCESS_TOKEN'; // Replace with your token
    // }
    // Alternatively, if you didn't import Cesium here but know it's available globally:
    // if ((window as any).Cesium && (window as any).Cesium.Ion) {
    //   (window as any).Cesium.Ion.defaultAccessToken = 'YOUR_CESIUM_ION_ACCESS_TOKEN';
    // }
  }
});
