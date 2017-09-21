// Setting map properties
var map = L.map('map');

L.control.scale().addTo(map);

var bounds = new L.LatLngBounds(new L.LatLng(43.5327, -79.6621), new L.LatLng(43.8742, -79.0462));

var baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
    maxZoom: 20,
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

// Adds a sidebar
var sidebar = L.control.sidebar('sidebar').addTo(map);

// Resize contents of sidebar
function resizeGraph(obj) {
    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
}

sidebar.on('shown', function() {
    sidebar.setContent('test');
});

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
        var geo_id = selection.feature.properties.__roads_properties__.geo_id;
        console.log(geo_id);
        var latlng = selection.leaflet_event.latlng;
        var label = selection.feature.properties.__roads_properties__.name;
        createVolGraph(label, geo_id);
        var graph = document.getElementById("graph");
        resizeGraph(graph);
        //       console.log(JSON.stringify(selection.feature.gid));
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

// Allows the user to turn the basemap on/off
var baseOn = true;
function toggleBase() {
    if(baseOn) {
        map.removeLayer(baseLayer);
    } else {
        map.addLayer(baseLayer);

    }
    baseOn = !baseOn;
}

