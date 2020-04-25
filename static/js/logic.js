/******************************************
 *  Author : Nabeel Qazi
 *  Created On : Fri Apr 17 2020
 *  File : logic.js
 *******************************************/

// source: https://datahub.io/core/geo-countries#resource-countries
var countryOutlines = "./static/data/countries.geojson";
var earthquake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
async function getData(url) {
    let response = await fetch(url);
    let json = await response.json();
    return json;
};

var maxBounds = L.latLngBounds(
    L.latLng(5.499550, -167.276413), //Southwest
    L.latLng(83.162102, -52.233040)  //Northeast
);

var myMap = L.map("map", {
    center: [30, 0],
    zoom: 3
});

var maxRadius = 100000;
var minRadius = 10000;

// Normalizes the given magnitude between lo <-> hi for 
// better visualization of markers
function getMarkerRadius(val, minVal, maxVal, lo, hi) {
    // Normalize magnitude between 0 to 1
    var normalizedValue = ((val - minVal) / (maxVal - minVal));

    return (lo + normalizedValue * (hi - lo));
}

L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY,
}).addTo(myMap);

var defaultStyle = {
    "color": "#000000",
    "weight": 0.1,
    "opacity": 1,
    "stroke": true,
    "fill": true,
    "fillOpacity": 0,
    "fillColor": "#C0C0C0"
};

var highlightStyle = {
    "color": '#000000',
    "weight": 1,
    opacity: 1,
    "stroke": true,
    "fill": true,
    "fillOpacity": 0,
    "fillColor": '#008080'
};

// Adding country boundries and enabling hover feature
d3.json(countryOutlines, function (data) {
    // console.log(data);
    L.geoJson(data, {

        style: defaultStyle,
        onEachFeature: function (feature, Layer) {
            Layer.on('mouseover', function () {
                this.setStyle(highlightStyle)
                this.bindTooltip("<h3>" + feature.properties.ADMIN + "</h3>").openTooltip();
            });
            Layer.on('mouseout', function () {
                this.setStyle(defaultStyle)
            });
        }
    }).addTo(myMap);
});

// Adding Equator Line
L.polyline([[0, -360], [0, 360]], {
    color: "teal",
    weight: 2,
    dashArray: '10, 10'
}).addTo(myMap);

// Borrowing colorScale function from Project 2
// colorScale function
function getColor(d) {
    return d > 5 ? 'rgb(240,107,107)' :
        d > 4 ? 'rgb(240,167,107)' :
            d > 3 ? 'rgb(243,186,77)' :
                d > 2 ? 'rgb(243,219,77)' :
                    d > 1 ? 'rgb(225,243,77)' :
                        'rgb(183,243,77)';
}
// Adding markers for earthquake locations
d3.json(earthquake_url, function (eqData) {

    var arrayOfMagnitudes = [];
    Object.entries(eqData.features).forEach(function ([keys, values]) {
        arrayOfMagnitudes.push(values.properties.mag)
    });
    var minimumMagnitude = Math.min.apply(Math, arrayOfMagnitudes);
    var maximumMagnitude = Math.max.apply(Math, arrayOfMagnitudes);

    // var lowest = Math.min.apply(null, keys.map(function(x) { return obj[x]} ));


    for (var i = 0; i < eqData.features.length; i++) {
        var eqCoordinates = eqData.features[i].geometry.coordinates.slice(0, 2);
        var eqLatLon = [eqCoordinates[1], eqCoordinates[0]]
        var eqMagnitude = (eqData.features[i].properties.mag);
        var markerRadius = getMarkerRadius(eqMagnitude,
            minimumMagnitude,
            maximumMagnitude,
            0,
            4);
        // console.log(2 ** markerRadius);


        if (Math.sign(eqMagnitude) > 0) {
            L.circle(eqLatLon, {
                fillOpacity: 0.75,
                color: getColor(eqMagnitude),//getColor(markerRadius),
                // fillColor: "orange",
                fillColor: getColor(eqMagnitude),
                radius: (2 ** markerRadius) * minRadius
            }).bindPopup("<h1>" + "TEST" + "</h1> <hr> <h3>Population: " + "Magnitude?" + "</h3>").addTo(myMap);
        }
        if (Math.sign(eqMagnitude) < 0) {
            // console.log(eqMagnitude);
            L.circle(eqLatLon, {
                fillOpacity: 1,
                color: "black",//getColor(markerRadius),
                // fillColor: "orange",
                fillColor: "black",//getColor(markerRadius),
                radius: (2 ** markerRadius) * minRadius
            }).bindPopup("<h1>" + "TEST" + "</h1> <hr> <h3>Population: " + "Magnitude?" + "</h3>").addTo(myMap);
        }

    }

})


// Set up the legend
var legend = L.control({ position: "bottomright" });
legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    var limits = geojson.options.limits;
    var colors = geojson.options.colors;
    var labels = [];

    // Add min & max
    var legendInfo = "<h1>Median Income</h1>" +
        "<div class=\"labels\">" +
        "<div class=\"min\">" + limits[0] + "</div>" +
        "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
        "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function (limit, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
};

// Adding legend to the map
legend.addTo(myMap);