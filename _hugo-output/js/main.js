(() => {
  // <stdin>
  document.addEventListener("DOMContentLoaded", function(event) {
    initCesium();
    console.log(">" + window.location.host);
    console.log(">" + window.location.path);
    htmx.on("htmx:afterSettle", function(evt) {
      if (evt.target.id === "nav") {
        var swiper = new Swiper(".swiper", {
          direction: "horizontal",
          slidesPerView: "1",
          spaceBetween: 30,
          centeredSlides: false,
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
          },
          pagination: {
            el: ".swiper-pagination",
            clickable: true
          },
          breakpoints: {
            "@0.00": {
              slidesPerView: 3,
              spaceBetween: 10
            },
            "@0.50": {
              slidesPerView: 6,
              spaceBetween: 20
            },
            "@1.00": {
              slidesPerView: 9,
              spaceBetween: 40
            },
            "@1.50": {
              slidesPerView: 12,
              spaceBetween: 50
            }
          }
        });
      }
    });
  });
  function initCesium() {
    console.log("Initializing CesiumJS...");
    htmx.on("htmx:afterRequest", (evt) => {
      console.log("Navigate to " + evt.detail.pathInfo.requestPath);
      if (evt.srcElement.dataset) {
        if (evt.srcElement.dataset.loc) {
          console.log(JSON.parse(evt.srcElement.dataset.loc));
          const location = JSON.parse(evt.srcElement.dataset.loc);
          const view2 = location.view;
          console.log(view2);
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              view2.longitude,
              view2.latitude,
              view2.height
            ),
            // Seattle area
            orientation: {
              heading: Cesium.Math.toRadians(view2.heading),
              pitch: Cesium.Math.toRadians(view2.pitch),
              roll: Cesium.Math.toRadians(view2.roll)
            }
          });
        }
      }
    });
    Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZjVhODYyOS04NjBlLTQ5MDUtOWI4MC1hMGRiNWUwYTU0NGQiLCJpZCI6NTY2NCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0Mzg5MzE5Nn0.5VoO3hPjqXGjUQg0mF8Mt0JyeVwUKqytjrCtLvxGNw0";
    var terrain = Cesium.Terrain.fromWorldTerrain();
    console.log("Create Viewer");
    const viewer = new Cesium.Viewer("cesiumContainer", {
      useBrowserRecommendedResolution: false,
      terrain,
      animation: false,
      timeline: false,
      infoBox: false,
      navigationHelpButton: false,
      baseLayerPicker: false,
      homeButton: false,
      sceneModePicker: false,
      resolutionScale: 1
      // Set resolution scale to 1.0 for better performance
    });
    var views = [
      {
        latitude: 48.830054,
        longitude: -123.758148,
        height: 1e3,
        heading: 300,
        pitch: -45,
        roll: 0
      },
      {
        latitude: 48.830054,
        longitude: -123.758148,
        height: 1e3,
        heading: 300,
        pitch: -30.5,
        roll: 0
      },
      {
        latitude: 48.830054,
        longitude: -123.758148,
        height: 1e3,
        heading: 300,
        pitch: -15,
        roll: 0
      }
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
      roll: Cesium.Math.toRadians(view.roll)
    };
    viewer.camera.setView({
      destination: position,
      orientation
    });
    Cesium.GeoJsonDataSource.load("/pins/locations.json", {
      clampToGround: true
    }).then((dataSource) => {
      viewer.dataSources.add(dataSource);
      const entities = dataSource.entities.values;
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        let labelText = "";
        if (Cesium.defined(entity.properties) && Cesium.defined(entity.properties.title)) {
          labelText = entity.properties.title.getValue();
        } else {
          labelText = entity.id;
        }
        entity.billboard.image = "/images/npsPictograph_0231b.png";
        entity.billboard.scale = 0.4;
        entity.label = {
          //showBackground: true,
          //backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
          text: labelText,
          font: "14pt sans-serif",
          fillColor: Cesium.Color.YELLOW,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 1,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -29),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
          // Keep label visible even when "behind" terrain
        };
        const pixelRange = 15;
        const minimumClusterSize = 2;
        const enabled = true;
        dataSource.clustering.enabled = enabled;
        dataSource.clustering.pixelRange = pixelRange;
        dataSource.clustering.minimumClusterSize = minimumClusterSize;
      }
    });
    const latitudeSpan = document.getElementById("latitude");
    const longitudeSpan = document.getElementById("longitude");
    const altitudeSpan = document.getElementById("altitude");
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    viewer.selectedEntityChanged.addEventListener(function(selectedEntity) {
      if (Cesium.defined(selectedEntity)) {
        if (Cesium.defined(selectedEntity.properties)) {
          if (Cesium.defined(selectedEntity.properties.link)) {
            var link = selectedEntity.properties.link.getValue() + "summary.txt ";
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
              if (this.readyState == 4 && this.status == 200) {
                document.getElementById("htmlSummaryContainer").setHTMLUnsafe(this.responseText);
                document.getElementById("htmlSummaryContainer").style.display = "block";
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
    handler.setInputAction(function(event) {
      var ray = viewer.camera.getPickRay(event.position);
      if (ray) {
        var mousePosition = viewer.scene.globe.pick(ray, viewer.scene);
        if (Cesium.defined(mousePosition)) {
          var cartographic = Cesium.Cartographic.fromCartesian(mousePosition);
          var mouseLat = Cesium.Math.toDegrees(cartographic.latitude);
          var mouseLon = Cesium.Math.toDegrees(cartographic.longitude);
          var mouseHeight = cartographic.height;
          var camera = viewer.scene.camera;
          var position2 = camera.positionCartographic;
          var orientation2 = { heading: 0, roll: 0, pitch: 0 };
          orientation2.heading = camera.heading;
          orientation2.pitch = camera.pitch;
          orientation2.roll = camera.roll;
          var view2 = {
            latitude: Cesium.Math.toDegrees(position2.latitude),
            longitude: Cesium.Math.toDegrees(position2.longitude),
            height: position2.height,
            heading: Cesium.Math.toDegrees(orientation2.heading),
            pitch: Cesium.Math.toDegrees(orientation2.pitch),
            roll: Cesium.Math.toDegrees(orientation2.roll)
          };
          var json = {
            location: {
              latitude: mouseLat,
              longitude: mouseLon,
              elevation: mouseHeight
            },
            view: view2
          };
          navigator.clipboard.writeText(JSON.stringify(json));
          const longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(
            4
          );
          const latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(
            4
          );
          const altitude = cartographic.height.toFixed(2);
          latitudeSpan.textContent = `${latitude}\xB0`;
          longitudeSpan.textContent = `${longitude}\xB0`;
          altitudeSpan.textContent = `${altitude} m`;
          console.log(JSON.stringify(json));
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-122.39, 47.56, 15e5),
      // Seattle area
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: Cesium.Math.toRadians(0)
      }
    });
    window.addEventListener("resize", () => {
      viewer.container.style.width = "100vw";
      viewer.container.style.height = "100vh";
      viewer.resize();
    });
  }
})();
