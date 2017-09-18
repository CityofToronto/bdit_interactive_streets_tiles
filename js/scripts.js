var map = L.map('map');

L.control.scale().addTo(map);

var bounds = new L.LatLngBounds(new L.LatLng(43.5327, -79.6621), new L.LatLng(43.8742, -79.0462));

var baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxBounds: bounds
});

var streetLayer = Tangram.leafletLayer({
    scene: 'scene.yaml',
    events: {
        click: onMapClick,
        hover: onMapHover
    },
    selectionRadius: 25
});

var sidebar = L.control.sidebar('sidebar').addTo(map);
map.setMaxBounds(bounds);

baseLayer.addTo(map);
streetLayer.addTo(map);

map.setView([43.653908, -79.384293], 18);

// Update table info
var roadName = document.getElementById("road-name");
var roadFnType = document.getElementById("road-fntype");
var roadLabel = document.getElementById("road-label");

// Interactivity
var popup = L.popup();

function showPopup(latlng, label) {
    popup
        .setLatLng(latlng)
        .setContent('<p>' + label + '</p>')
        .openOn(map);        
}

// select road feature
function onMapClick(selection) {
    if (selection.feature) {
        roadName.innerHTML = selection.feature.properties.__roads_properties__.name;
        roadFnType.innerHTML = selection.feature.properties.__roads_properties__.functional_type;
        roadLabel.innerHTML = selection.feature.properties.__roads_properties__.label;

        var latlng = selection.leaflet_event.latlng;
        var label = selection.feature.properties.__roads_properties__.name;
        dataPreview(label);
        console.log(JSON.stringify(selection.feature.gid));
        showPopup(latlng, label);
        highlightUnit(selection.feature.properties.__roads_properties__.gid);
    } else {
        highlightUnit(false);
    }
}

function onMapHover(selection) {
    document.getElementById('map').style.cursor = selection.feature ? 'pointer' : '';
}

// highlight selection
function highlightUnit(symbol) {
    streetLayer.scene.config.global._highlight = symbol;
    streetLayer.scene.updateConfig();
}

function dataPreview(label) {
    var trace1 = {
        x: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        y: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        name: 'Name of Trace 1',
        type: 'scatter'
    };
    var trace2 = {
        x: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        y: [1, 0, 3, 2, 5, 4, 7, 6, 8],
        name: 'Name of Trace 2',
        type: 'scatter'
    };
    var data = [trace1, trace2];
    var layout = {
        autosize: true,
        margin: {
            l: 10,
            r: 10,
            b: 10,
            t: 40,
            pad: 4
        },
        title: label,
        xaxis: {
            title: 'x Axis',
            titlefont: {
                family: 'Courier New, monospace',
                size: 18,
                color: '#7f7f7f'
            }
        },
        yaxis: {
            title: 'y Axis',
            titlefont: {
                family: 'Courier New, monospace',
                size: 18,
                color: '#7f7f7f'
            }
        },
        legend: {"orientation": "h"}
    };
    Plotly.newPlot('tester', data, layout);
}

var baseOn = true;
function toggleBase() {
    if(baseOn) {
        map.removeLayer(baseLayer);
    } else {
        map.addLayer(baseLayer);
        
    }
    baseOn = !baseOn;
}