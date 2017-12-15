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
        hover: onMapHover,
    },
    selectionRadius: 25
});

//$("#map").height($(window).height() * 0.94).width($(window).width() * 0.66);
setTimeout(function() {
    map.invalidateSize();
}, 100)


$( window ).resize(function() {
    $("#map").height($(window).height() * 0.94).width($(window).width() * 0.66);
});

// Resize contents of sidebar
function resizeGraph(obj) {
    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
}

map.setMaxBounds(bounds);

baseLayer.addTo(map);
streetLayer.addTo(map);

map.setView([43.653908, -79.384293], 18);

map.on("zoomend", function(){
    console.log(map.getZoom());
});


// Update table info
var roadName = document.getElementById("road-name");
var roadFnType = document.getElementById("road-fntype");
var roadgeoid = document.getElementById("road-geo_id");

// Interactivity
var popup = L.popup();

// Map options
var options = L.control();

options.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'options');
    this.update();
    return this._div;
};

options.update = function(properties) {
    this._div.innerHTML = '<h4>Map Options</h4>' +
        '<table>' +
        '<tr><td>Basemap</td>' +
        '<td><label class="switch">' +
        '<input id="toggleBase" type="checkbox" checked="" onchange="toggleBase()"/>' +
        '<span class="slider round"></span>' +
        '</label></td><tr>' +
        '<tr><td>Expressways</td>' +
        '<td><label class="switch">' +
        '<input id="toggleExpressway" type="checkbox" checked="" onchange="toggleExpressway()"/>' +
        '<span class="slider round"></span>' +
        '</label</td><tr>' +
        '<tr><td>Ramps</td>' +
        '<td><label class="switch">' +
        '<input id="toggleRamps" type="checkbox" checked="" onchange="toggleRamps()"/>' +
        '<span class="slider round"></span>' +
        '</label></td><tr>' +
        '</table>'
};

options.addTo(map);

// Road info
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function(properties) {
    this._div.innerHTML = '<h4>Road Info</h4>' + (properties ? '<b>' + properties.name 
                                                  + '</b><br />' + properties.functional_type 
                                                  + '<br />' + properties.direction
                                                  + '<br />' + (properties.volume ? "Volume :" + properties.volume : "")
                                                  : 'Hover over a road');
};

info.addTo(map);

// Legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 2500, 5000, 10000, 25000, 50000, 75000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    div.innerHTML +=
        '<i style="background:#D0AAF3"></i> 0&ndash;2500<br>' +
        '<i style="background:#C495F0"></i> 2500&ndash;5000<br>' +
        '<i style="background:#AD6AEA"></i> 5000&ndash;10000<br>' +
        '<i style="background:#8A2BE2"></i> 10000&ndash;25000<br>' +
        '<i style="background:#601E9E"></i> 25000&ndash;50000<br>' +
        '<i style="background:#451571"></i> 50000&ndash;75000<br>' +
        '<i style="background:#290C43"></i> 75000+<br>' +
        '<i style="background:#FFFFFF;border:"></i> Unknown<br>';

    return div;
};

legend.addTo(map);

// select road feature
function onMapClick(selection) {
    if (selection.feature) {
        var geo_id = selection.feature.properties.__roads_properties__.geo_id;
        var latlng = selection.leaflet_event.latlng;
        var name = selection.feature.properties.__roads_properties__.name;
        var ftype = selection.feature.properties.__roads_properties__.functional_type;
        var volume = selection.feature.properties.__roads_properties__.volume;
        var direction = selection.feature.properties.__roads_properties__.direction;
        console.log(direction);
        var graph = document.getElementById("graph");
        graph.setAttribute('src', "graphs.html?geoid=" + geo_id + "&name=" + name + "&ftype=" + ftype);
        //        resizeGraph(graph);
        //       console.log(JSON.stringify(selection.feature.gid));
        //showPopup(latlng, label);
        highlightSelect(selection.feature.properties.__roads_properties__.geo_id);
    } else {
        highlightSelect(false);
    }
}

function onMapHover(selection) {
    document.getElementById('map').style.cursor = selection.feature ? 'pointer' : '';
    if (selection.feature) {
        info.update(selection.feature.properties.__roads_properties__);
    } else {
        info.update(false);
    }

    //    if (selection.feature) {
    //        highlightHover(selection.feature.properties.__roads_properties__.geo_id);
    //    } else {
    //        highlightHover(false);
    //    }
}

// highlight selection
function highlightSelect(symbol) {
    streetLayer.scene.config.global._highlightSelect = symbol;
    streetLayer.scene.updateConfig();
}

//function highlightHover(symbol) {
//    streetLayer.scene.config.global._highlightHover = symbol;
//    streetLayer.scene.updateConfig();
//}

// Options
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

// Allows the user to turn the expressways on/off
var expresswayOn = true;
function toggleExpressway() {
    if (expresswayOn) {
        streetLayer.scene.config.global._expressway = false;
    } else {
        streetLayer.scene.config.global._expressway = true;
    }
    expresswayOn = !expresswayOn;
    streetLayer.scene.updateConfig();
}

// Allows the user to turn ramps on/off
var rampsOn = true;
function toggleRamps() {
    if (rampsOn) {
        streetLayer.scene.config.global._ramps = false;
    } else {
        streetLayer.scene.config.global._ramps = true;
    }
    rampsOn = !rampsOn;
    streetLayer.scene.updateConfig();
}

// Updates the dimensions of sidebar graph to fit contents
$('#graph').each(function(){
    var inner = $(this).find('p');
    $(this).height(inner.outerHeight(true));
    $(this).width(inner.outerWidth(true)); 
});