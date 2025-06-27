document.addEventListener("DOMContentLoaded", function (event) {
  initCesium();
});

function initCesium() {
  console.log("Initializing CesiumJS...");

  htmx.on("htmx:afterRequest", (evt) => {
    console.log("Navigate to " + evt.detail.pathInfo.requestPath);
  });

  // CesiumJS access token (replace with your own if you have one)
  // You can get a free token from https://cesium.com/ion/
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZjVhODYyOS04NjBlLTQ5MDUtOWI4MC1hMGRiNWUwYTU0NGQiLCJpZCI6NTY2NCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0Mzg5MzE5Nn0.5VoO3hPjqXGjUQg0mF8Mt0JyeVwUKqytjrCtLvxGNw0";

  var terrain = Cesium.Terrain.fromWorldTerrain();

  console.log("Create Viewer");
  // Initialize the Cesium Viewer
  const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: terrain,
    animation: false,
    timeline: false,
    infoBox: false,
    baseLayerPicker: false,
    homeButton: false,
    sceneModePicker: false,
  });

  var views = [
    {
      latitude: 48.830054,
      longitude: -123.758148,
      height: 1000,
      heading: 300,
      pitch: -45,
      roll: 0,
    },
    {
      latitude: 48.830054,
      longitude: -123.758148,
      height: 1000,
      heading: 300,
      pitch: -30.5,
      roll: 0,
    },
    {
      latitude: 48.830054,
      longitude: -123.758148,
      height: 1000,
      heading: 300,
      pitch: -15,
      roll: 0,
    },
  ];
  var view = views[0];

  var position = new Cesium.Cartesian3.fromDegrees(
    view.longitude,
    view.latitude,
    view.height
  );
  var orientation = {
    heading: Cesium.Math.toRadians(view.heading),
    pitch: Cesium.Math.toRadians(view.pitch),
    roll: Cesium.Math.toRadians(view.roll),
  };

  viewer.dataSources.add(
    Cesium.GeoJsonDataSource.load("/locations.json", {
      stroke: Cesium.Color.HOTPINK,
      fill: Cesium.Color.PINK,
      strokeWidth: 3,
      markerSymbol: "?",
    })
  );

  // Optional: Add a click event listener to the Cesium map
  // to update the info div with clicked coordinates
  const latitudeSpan = document.getElementById("latitude");
  const longitudeSpan = document.getElementById("longitude");
  const altitudeSpan = document.getElementById("altitude");

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  viewer.selectedEntityChanged.addEventListener(function (selectedEntity) {
    if (Cesium.defined(selectedEntity)) {
      if (Cesium.defined(selectedEntity.properties)) {
        if (Cesium.defined(selectedEntity.properties.link)) {
          var link = selectedEntity.properties.link.getValue() + "summary.txt ";
          var xhttp = new XMLHttpRequest();
          xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
              document
                .getElementById("htmlSummaryContainer")
                .setHTMLUnsafe(this.responseText);
              document.getElementById("htmlSummaryContainer").style.display =
                "block";
              viewer.flyTo(selectedEntity);
            }
          };

          xhttp.open("GET", link, true);
          xhttp.send();
        }
      } else {
        console.log("Unknown entity selected.");
        document.getElementById("htmlSummaryContainer").style.display = "none";
      }
    } else {
      document.getElementById("htmlSummaryContainer").style.display = "none";
      console.log("Deselected.");
    }
  });

  handler.setInputAction(function (event) {
    var ray = viewer.camera.getPickRay(event.position);
    var mousePosition = viewer.scene.globe.pick(ray, viewer.scene);

    if (Cesium.defined(mousePosition)) {
      var cartographic = Cesium.Cartographic.fromCartesian(mousePosition);
      var mouseLat = Cesium.Math.toDegrees(cartographic.latitude);
      var mouseLon = Cesium.Math.toDegrees(cartographic.longitude);
      var mouseHeight = cartographic.height;

      var camera = viewer.scene.camera;
      var position = camera.positionCartographic;
      var orientation = { heading: 0, roll: 0, pitch: 0 };
      orientation.heading = camera.heading;
      orientation.pitch = camera.pitch;
      orientation.roll = camera.roll;
      var view = {
        latitude: Cesium.Math.toDegrees(position.latitude),
        longitude: Cesium.Math.toDegrees(position.longitude),
        height: position.height,
        heading: Cesium.Math.toDegrees(orientation.heading),
        pitch: Cesium.Math.toDegrees(orientation.pitch),
        roll: Cesium.Math.toDegrees(orientation.roll),
      };
      var json = {
        title: "new pin",
        location: {
          latitude: mouseLat,
          longitude: mouseLon,
          elevation: mouseHeight,
        },
        view: view,
      };
      navigator.clipboard.writeText(  JSON.stringify( json ) );

      //navigator.clipboard.writeText(JSON.stringify(json));
      //console.log(JSON.stringify(json));
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // handler.setInputAction(function (movement) {
  //   const ray = viewer.camera.getPickRay(movement.position);
  //   if (ray) {
  //     const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
  //     if (cartesian) {
  //       const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  //       const longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(
  //         4
  //       );
  //       const latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(
  //         4
  //       );
  //       const altitude = cartographic.height.toFixed(2);

  //       latitudeSpan.textContent = `${latitude}°`;
  //       longitudeSpan.textContent = `${longitude}°`;
  //       altitudeSpan.textContent = `${altitude} m`;
  //     }
  //   }
  // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

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
