<template>
    <div id="cesiumContainer" ref="cesiumContainer"></div>
  </template>
  
  <script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  // Import the entire Cesium library as a namespace to avoid export issues
  import * as Cesium from 'cesium';
  
  // Import Cesium's default CSS styles
  import 'cesium/Build/Cesium/Widgets/widgets.css';
  
  const cesiumContainer = ref<HTMLElement | null>(null);
  // Use the Cesium.Viewer type for better TypeScript support
  let viewer: Cesium.Viewer | null = null;
  // Declare a variable for the screen space event handler
  let handler: Cesium.ScreenSpaceEventHandler | null = null;
  // Declare a variable for the GeoJSON data source
  let geoJsonDataSource: Cesium.GeoJsonDataSource | null = null;
  
  
  // IMPORTANT: Replace 'YOUR_CESIUM_ION_ACCESS_TOKEN' with your actual token
  // Get your free token from https://cesium.com/ion/
  const cesiumIonAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZjVhODYyOS04NjBlLTQ5MDUtOWI4MC1hMGRiNWUwYTU0NGQiLCJpZCI6NTY2NCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0Mzg5MzE5Nn0.5VoO3hPjqXGjUQg0mF8Mt0JyeVwUKqytjrCtLvxGNw0';
  
  // --- Function to Create SVG Icon Data URL ---
  function createSvgIcon(color = 'blue', size = 32): string {
    // Simple circle SVG for the icon
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                         <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="${color}"/>
                       </svg>`;
    // Encode the SVG string as a Base64 data URL
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  }
  // --- End Function to Create SVG Icon Data URL ---
  
  
  onMounted(async () => { // Made onMounted async to await terrain provider promise and GeoJSON loading
    // Ensure the container element is available and we are on the client side
    if (cesiumContainer.value && import.meta.client) {
      try {
        // Set the Cesium Ion access token using the Cesium namespace
        // This is necessary if you use Cesium Ion assets like World Terrain or default imagery
        if (cesiumIonAccessToken === 'YOUR_CESIUM_ION_ACCESS_TOKEN') {
          console.error('ERROR: Please replace "YOUR_CESIUM_ION_ACCESS_TOKEN" with your actual Cesium Ion token.');
          // You might want to stop initialization or show an error message to the user
          return; // Stop here if the token is not set
        }
        Cesium.Ion.defaultAccessToken = cesiumIonAccessToken;
        console.log('Cesium Ion Access Token set.');
  
        // --- Create Terrain Provider Async ---
        // Create the World Terrain provider asynchronously
        const terrainProvider = await Cesium.createWorldTerrainAsync();
        console.log('Cesium World Terrain Provider created:', terrainProvider);
        // --- End Create Terrain Provider Async ---
  
  
        // Initialize the Cesium Viewer within the mounted hook
        // This ensures the DOM element exists and we are in the browser environment
        viewer = new Cesium.Viewer(cesiumContainer.value, {
          // Configure viewer options
          // Set the terrain provider to the awaited result
          terrainProvider: terrainProvider,
  
          // Optional: Disable default base layer picker if you want to control base layers manually
          // If you set baseLayerPicker: false, you MUST add an imagery layer manually below.
          // baseLayerPicker: false,
  
          // Optional: Other viewer options you might want to configure
          // animation: false,
          // timeline: false,
          // geocoder: false,
          // sceneModePicker: false,
          // navigationHelpButton: false,
          // infoBox: false,
          // creditsDisplay: false, // Be mindful of Cesium Ion terms if removing credits
        });
  
        // If you disabled baseLayerPicker: false above, uncomment the line below
        // to add a default base imagery layer (OpenStreetMap).
        // viewer.scene.imageryLayers.addImageryProvider(new Cesium.OpenStreetMapImageryProvider());
  
        // Log the terrain provider after initialization to confirm it's set on the scene
        console.log('Viewer scene terrainProvider:', viewer.scene.terrainProvider);
  
  
        // Set the initial camera view to Vancouver Island
        // Using flyTo for a smooth animated transition
        viewer.camera.flyTo({
          // Approximate coordinates for a central point on Vancouver Island (near Nanaimo)
          // Longitude, Latitude, Height (meters above terrain)
          destination: Cesium.Cartesian3.fromDegrees(-123.9401, 49.1659, 50000), // Adjust height as needed
          orientation: {
            heading: Cesium.Math.toRadians(0.0), // North
            pitch: Cesium.Math.toRadians(-90.0), // Looking straight down
            roll: Cesium.Math.toRadians(0.0)
          },
          duration: 3 // Duration of the flight in seconds
        });
  
        // --- Load and Display GeoJSON Data from External File ---
        try {
          console.log('Attempting to fetch GeoJSON data from /paragliderZones.json');
          // Fetch the external GeoJSON file
          const response = await fetch('/paragliderZones.json'); // Assuming the file is in the public directory
  
          if (!response.ok) {
             // Log the response status and text if the fetch was not successful
             const errorText = await response.text();
             console.error(`Failed to fetch GeoJSON: ${response.status} ${response.statusText}`);
             console.error('Response text:', errorText); // Log the actual response content
             throw new Error(`Failed to fetch GeoJSON: ${response.status} ${response.statusText}`);
          }
  
          const geoJsonData = await response.json();
          console.log('GeoJSON data fetched successfully.');
  
          // Load the fetched GeoJSON data asynchronously
          geoJsonDataSource = await Cesium.GeoJsonDataSource.load(geoJsonData, {
              // Optional: Configure styling for the GeoJSON entities
              stroke: Cesium.Color.BLACK,
              fill: Cesium.Color.BLUE.withAlpha(0.5),
              strokeWidth: 3,
              clampToGround: true // Clamp points to the terrain surface
          });
  
          // Add the data source to the viewer
          viewer.dataSources.add(geoJsonDataSource);
  
          // Customize the appearance of the entities (e.g., use custom icons)
          const entities = geoJsonDataSource.entities.values;
          for (let i = 0; i < entities.length; i++) {
              const entity = entities[i];
              const entityType = entity.properties?.type?.getValue(); // Get the 'type' property (takeoff/landing)
  
              // Ensure the entity has a point or billboard graphic
              if (entity.billboard) {
                   // Determine icon color based on type
                  const iconColor = entityType === 'takeoff' ? 'green' : 'red';
                  // Set the billboard image to the custom SVG icon
                  entity.billboard.image = createSvgIcon(iconColor);
                  entity.billboard.width = 32; // Set icon size
                  entity.billboard.height = 32;
  
                  // Optional: Add a label for the name
                  if (entity.properties?.name?.getValue()) {
                       entity.label = {
                          text: entity.properties.name.getValue(),
                          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                          pixelOffset: new Cesium.Cartesian2(0, -20),
                          disableDepthTestDistance: Number.POSITIVE_INFINITY, // Always show label
                          style: Cesium.LabelStyle.FILL, // Changed from FILL_AND_OUTLINE
                          // Removed outlineWidth and outlineColor
                          fillColor: Cesium.Color.WHITE
                      };
                  }
  
              } else if (entity.point) {
                   // If it's a point graphic, you could style it here too
                   const pointColor = entityType === 'takeoff' ? Cesium.Color.GREEN : Cesium.Color.RED;
                   entity.point.color = pointColor;
                   entity.point.pixelSize = 10;
                   entity.point.outlineColor = Cesium.Color.BLACK;
                   entity.point.outlineWidth = 2;
                   entity.point.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND; // Clamp to ground
  
                   // Optional: Add a label for the name
                   if (entity.properties?.name?.getValue()) {
                       entity.label = {
                          text: entity.properties.name.getValue(),
                          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                          pixelOffset: new Cesium.Cartesian2(0, -15),
                          disableDepthTestDistance: Number.POSITIVE_INFINITY,
                          style: Cesium.LabelStyle.FILL, // Changed from FILL_AND_OUTLINE
                          // Removed outlineWidth and outlineColor
                          fillColor: Cesium.Color.WHITE
                      };
                  }
              }
          }
  
          console.log('GeoJSON data loaded and added to viewer.');
  
        } catch (error) {
          console.error('Error loading or processing GeoJSON data:', error);
        }
        // --- End Load and Display GeoJSON Data ---
  
  
        // --- Add Click Event Handler ---
        // Create a ScreenSpaceEventHandler to handle mouse events
        handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  
        // Define the action for a RIGHT click
        handler.setInputAction(function(movement: any) {
          // Get the Cartesian3 position of the click on the globe
          const ray = viewer!.camera.getPickRay(movement.position);
          const cartesian = viewer!.scene.globe.pick(ray!, viewer!.scene);
  
          if (cartesian) {
            // Convert the Cartesian3 position to Geographic coordinates (Longitude, Latitude, Height)
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const longitude = Cesium.Math.toDegrees(cartographic.longitude);
            const latitude = Cesium.Math.toDegrees(cartographic.latitude);
            const height = cartographic.height; // Height in meters
  
            // Format the coordinates
            const formattedCoords = `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}, Height: ${height.toFixed(2)}m`;
  
            // Copy the coordinates to the clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(formattedCoords)
                .then(() => {
                  console.log('Coordinates copied to clipboard:', formattedCoords);
                  // Optional: Display a temporary message to the user (using a better UI element than alert)
                  // For example, a simple message overlay
                })
                .catch(err => {
                  console.error('Failed to copy coordinates:', err);
                  // Optional: Display an error message
                });
            } else {
              // Fallback for browsers that don't support navigator.clipboard
              console.warn('Clipboard API not available. Coordinates:', formattedCoords);
            }
          }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK); // Changed from LEFT_CLICK
        // --- End Click Event Handler ---
  
  
        // You can now interact with the viewer instance (add entities, etc.)
        console.log('Cesium Viewer initialized:', viewer);
  
      } catch (error) {
        console.error('Error initializing Cesium Viewer:', error);
        // You might want to display an error message to the user
      }
    }
  });
  
  onUnmounted(() => {
    // Clean up the viewer instance, event handler, and data source when the component is unmounted
    // This is important to prevent memory leaks and release WebGL context
    if (viewer) {
      viewer.destroy();
      viewer = null;
      console.log('Cesium Viewer destroyed');
    }
    if (handler) {
      handler.destroy();
      handler = null;
      console.log('ScreenSpaceEventHandler destroyed');
    }
     if (geoJsonDataSource && viewer && !viewer.isDestroyed()) {
       viewer.dataSources.remove(geoJsonDataSource, true); // Remove and destroy the data source
       geoJsonDataSource = null;
       console.log('GeoJSON DataSource removed');
     }
  });
  </script>
  
  <style scoped>
  #cesiumContainer {
    width: 100%;
    height: 100%;
    /*
      This makes the container fill its direct parent.
      To make the map full screen, ensure ALL parent elements,
      up to <html> and <body>, also have width: 100% and height: 100%.
    */
  }
  
  /*
    Add global styles (e.g., in your main app.vue or a global CSS file)
    to ensure html and body take up the full viewport height.
  */
  /*
    These styles should be placed in a global CSS file or an unscoped style block in app.vue
  */
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    /* Uncommenting this line will prevent scrollbars if the content overflows */
    overflow: hidden;
  }
  
  
  /*
    Also ensure the root Nuxt app div (#__nuxt) and any layout/page containers
    between the body and #cesiumContainer have height: 100%.
  */
  /*
    This style should also be placed in a global CSS file or an unscoped style block in app.vue
  */
  #__nuxt {
    width: 100%;
    height: 100%;
  }
  
  </style>
  