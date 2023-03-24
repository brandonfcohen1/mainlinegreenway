var map = L.map("map").setView([40.02, -75.3], 14);

const tileLayer = (id) => {
  return L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWFpbmxpbmVncmVlbndheSIsImEiOiJja2MweDc5c3QwYnpzMnZqcmhrbmwydG81In0.G7NcipnfFMsmBrytk6SLrQ",
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

const MLGMapping = (mlgString) => {
  switch (mlgString) {
    case "Mainline Greenway":
      return {
        style: { color: "#023020" },
        description: "Main Line Greenway",
      };
    case "Existing City Avenue Trails":
      return {
        style: { color: "#8B008B" },
        description: "Existing City Avenue Trails",
      };
    case "Potential Trail Links":
      return {
        style: { color: "#1E90FF" },
        description: "Potential Trail Links",
      };
    case "Proposed City Avenue Trails":
      return {
        style: { color: "#FFC300" },
        description: "Proposed City Avenue Trails",
      };
    case "Under Construction":
      return {
        style: { color: "#FF5733" },
        description: "Under Construction",
      };
  }
};

var streets = tileLayer("streets-v11").addTo(map);
var satellite = tileLayer("satellite-v9");
var navigation = tileLayer("navigation-day-v1");

var mlg = L.geoJSON(trails, {
  style: (f) => {
    return {
      opacity: 0.8,
      weight: 4,
      color: MLGMapping(f.properties.MLG_Label)?.style.color,
    };
  },
})
  .bindPopup((layer) => {
    return layer.feature.properties.MLG_Label;
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

const legendItems = [
  "Mainline Greenway",
  "Existing City Avenue Trails",
  "Potential Trail Links",
  "Proposed City Avenue Trails",
  "Under Construction",
];

const makeLegendArray = (items) => {
  const descriptions = legendItems.map((item) => MLGMapping(item).description);
  const colors = legendItems.map((item) => MLGMapping(item).style.color);
  return [descriptions, colors];
};

map.on("overlayadd", (e) => {
  if (e.name === "Level of Traffic Stress") {
    mlg.bringToFront();

    map.removeControl(mapLegend);
    const [types, colors] = makeLegendArray(legendItems);
    mapLegend = addLegend(
      [...types, "LTS 1", "LTS 2", "LTS 3", "LTS 4", "Path"],
      [...colors, "#348939", "#FDBF02", "#FE7E03", "#9B1D1E", "#348939"]
    );
  }
});

map.on("overlayremove", () => {
  map.removeControl(mapLegend);
  mapLegend = addLegend(["Main Line Greenway"], ["#6BA1F8"]);
  // rebuild mapLegend with the values in MLGMapping
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

const legendArray = makeLegendArray(legendItems);
let mapLegend = addLegend(legendArray[0], legendArray[1]);

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
