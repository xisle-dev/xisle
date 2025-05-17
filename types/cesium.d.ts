// types/cesium.d.ts

/**
 * Declare the existence of the global CESIUM_BASE_URL variable
 * expected by the CesiumJS library when used as an npm package.
 */
interface Window {
    CESIUM_BASE_URL: string;
  }