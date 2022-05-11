var map = L.map("map").setView([40.02, -75.3], 13);

const tileLayer = (id) => {
  return L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    {
      maxZoom: 18,
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: "mapbox/" + id,
      tileSize: 512,
      zoomOffset: -1,
    }
  );
};

const LTSMapping = (ltsString) => {
  switch (ltsString) {
    case "LTS 1":
      return {
        style: { color: "#348939" },
        description: "Relaxing, suitable for most riders",
      };
    case "LTS 2":
      return {
        style: { color: "#FDBF02" },
        description: "Comfortable for most adults",
      };
    case "LTS 3":
      return {
        style: { color: "#FE7E03" },
        description: "Comfortable for confident bicyclists",
      };
    case "LTS 4":
      return {
        style: { color: "#9B1D1E" },
        description: "Uncomfortable for most",
      };
    case "Off-road trail/path":
      return {
        style: { color: "#348939" },
        description: "Off-road trail/path",
      };
  }
};

var streets = tileLayer("streets-v11").addTo(map);
var satellite = tileLayer("satellite-v9");
var navigation = tileLayer("navigation-day-v1");

var mlg = L.geoJSON(trails, { style: { weight: 4, opacity: 0.8 } })
  .bindPopup((layer) => {
    return "Main Line Greenway";
  })
  .addTo(map);

var lts = L.geoJSON(lts, {
  style: (f) => {
    return {
      opacity: 0.7,
      weight: 2,
      color: LTSMapping(f.properties.linklts).style.color,
    };
  },
}).bindPopup((f) => {
  var p = f.feature.properties;
  var popupText =
    "<b>Street Class: </b>" +
    LTSMapping(p.linklts)?.description +
    "<br><b>Bike Facilities: </b>" +
    p.bikefacili +
    "<br><b>Number of Lanes: </b>" +
    p.numlanes +
    "<br><b>Avg Traffic Speed: </b>" +
    p.speed;
  return popupText;
});

map.on("overlayadd", (e) => {
  if (e.name === "Level of Traffic Stress") {
    mlg.bringToFront();

    map.removeControl(mapLegend);
    mapLegend = addLegend(
      [
        "Main Line Greenway",
        "LTS 1: Relaxing",
        "LTS 2: For Everyone",
        "LTS 3: For Confident Cyclists",
        "LTS 4: Uncomfortable",
        "Path",
      ],
      ["#6BA1F8", "#348939", "#FDBF02", "#FE7E03", "#9B1D1E", "#348939"]
    );
  }
});

map.on("overlayremove", () => {
  map.removeControl(mapLegend);
  mapLegend = addLegend(["Main Line Greenway"], ["#6BA1F8"]);
});

const addLegend = (types, colors) => {
  let legend = new L.Control();

  legend.options.position = "bottomleft";

  legend.onAdd = function (map) {
    let div = L.DomUtil.create("div", "info legend");

    for (let i = 0; i < types.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        colors[i] +
        '">&nbsp&nbsp&nbsp&nbsp</i> ' +
        types[i] +
        "<br>";
    }
    div.style = "background-color: lightgrey; padding:2px; border-radius:2px;";
    return div;
  };

  legend.addTo(map);

  return legend;
};

let mapLegend = addLegend(["Main Line Greenway"], ["#6BA1F8"]);

var baseMaps = {
  Streets: streets,
  Imagery: satellite,
  Navigaton: navigation,
};

var overlayMaps = {
  "Main Line Greenway": mlg,
  "Level of Traffic Stress": lts,
};

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
