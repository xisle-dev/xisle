document.addEventListener("DOMContentLoaded", function(event) {
  initCesium();
})

function initCesium() {
  console.log("Initializing CesiumJS...");

  htmx.on("htmx:afterRequest", (evt) => {
    console.log("Navigate to " + evt.detail.pathInfo.requestPath);
  });

  // CesiumJS access token (replace with your own if you have one)
  // You can get a free token from https://cesium.com/ion/
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZjVhODYyOS04NjBlLTQ5MDUtOWI4MC1hMGRiNWUwYTU0NGQiLCJpZCI6NTY2NCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0Mzg5MzE5Nn0.5VoO3hPjqXGjUQg0mF8Mt0JyeVwUKqytjrCtLvxGNw0";

  console.log("Create Viewer");
  // Initialize the Cesium Viewer
  const viewer = new Cesium.Viewer("cesiumContainer", {
    // Disable default toolbar for a cleaner look if desired
    // baseLayerPicker: false,
    // geocoder: false,
    // homeButton: false,
    // infoBox: false,
    // navigationHelpButton: false,
    // sceneModePicker: false,
    // timeline: false,
    // animation: false,
  });

  // Optional: Add a click event listener to the Cesium map
  // to update the info div with clicked coordinates
  const latitudeSpan = document.getElementById("latitude");
  const longitudeSpan = document.getElementById("longitude");
  const altitudeSpan = document.getElementById("altitude");

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (movement) {
    const ray = viewer.camera.getPickRay(movement.position);
    if (ray) {
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(
          4
        );
        const latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(
          4
        );
        const altitude = cartographic.height.toFixed(2);

        latitudeSpan.textContent = `${latitude}°`;
        longitudeSpan.textContent = `${longitude}°`;
        altitudeSpan.textContent = `${altitude} m`;
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // Set initial camera view
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-122.39, 47.56, 1500000), // Seattle area
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: Cesium.Math.toRadians(0.0),
    },
  });

  // Ensure the Cesium viewer resizes correctly with the window
  window.addEventListener("resize", () => {
    viewer.container.style.width = "100vw";
    viewer.container.style.height = "100vh";
    viewer.resize();
  });
}
