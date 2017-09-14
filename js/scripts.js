var map = L.map('map');

L.control.scale().addTo(map);

var layer = Tangram.leafletLayer({
    scene: 'scene.yaml',
    attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
});

var sidebar = L.control.sidebar('sidebar').addTo(map);

layer.addTo(map);

map.setView([43.653908, -79.384293], 15);

// Interactivity
var popup = L.popup();

function showPopup(latlng, label) {
    popup
        .setLatLng(latlng)
        .setContent('<p>' + label + '</p>')
        .openOn(map);        
}

function onMapClick(selection) {
    if (selection.feature) {
        var latlng = selection.leaflet_event.latlng;
        var label = selection.feature.properties.label;
        showPopup(latlng, label);
    }
}

function onMapHover(selection) {
    document.getElementById('map').style.cursor = selection.feature ? 'pointer' : '';
}

var scene;
//Listener
map.on('tangramloaded', function(e) {
    var tangramLayer = e.tangramLayer;
    scene = tangramLayer.scene;

    tangramLayer.setSelectionEvents({
        click: onMapClick,
        hover: onMapHover
    });
});