/******************************************
 *  Author : Nabeel Qazi
 *  Created On : Fri Apr 17 2020
 *  File : logic.js
 *******************************************/

var states_outlines = "./static/data/us_states.geojson";
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
    center: [44.828175, -102.5795],
    zoom: 4
});


L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY,
}).addTo(myMap);

// Make US map prominent
var defaultStyle = {
    "color": "#FFFFFF",
    "weight": 1.25,
    "opacity": 1,
    "stroke": true,
    "fill": true,
    "fillOpacity": 1,
    "fillColor": "#008080"
};

var highlightStyle = {
    "color": '#FFFFFF',
    "weight": 2.5,
    opacity: 1,
    "stroke": true,
    "fill": true,
    "fillOpacity": 1,
    "fillOpacity": 1,
    "fillColor": '#800000'
};

d3.json(states_outlines, function (data) {
    console.log(data);
    L.geoJson(data, {

        style: defaultStyle,
        onEachFeature: function (feature, Layer) {
            Layer.on('mouseover', function () {
                this.setStyle(highlightStyle)
                this.bindTooltip("<h3>" + feature.properties.name + "</h3>").openTooltip();
            });
            Layer.on('mouseout', function () {
                this.setStyle(defaultStyle)
            });
        }
    }).addTo(myMap);
});

d3.json(earthquake_url, function (eqData) {
    // console.log(eqData.features);
    console.log(eqData.features[0]);
    // console.log(eqData.features.length);


    for (var i = 0; i < eqData.features.length; i++) {
        var eqCoordinates = eqData.features[i].geometry.coordinates.slice(0, 2);
        var eqLatLon = [eqCoordinates[1], eqCoordinates[0]]
        var eqMagnitude = eqData.features[i].properties.mag;

        L.circle(eqLatLon, {
            fillOpacity: 0.5,
            color: "None",
            fillColor: "orange",
            radius: eqMagnitude * 10000
        }).bindPopup("<h1>" + "TEST" + "</h1> <hr> <h3>Population: " + "Magnitude?" + "</h3>").addTo(myMap);

    }

})
