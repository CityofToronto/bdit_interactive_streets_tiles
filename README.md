# Interactive Web Map
The purpose of this web map is to be able to turn the static volume map into a more portable, digital version that would be easier to update and access. 

Current View of the Webpage
![woops](https://github.com/CityofToronto/bdit_interactive_streets_tiles/blob/master/img/Capture.PNG "Current Webpage")

## Current Features
- Bi-directional lines of each road segment with one-directional segments having only one line
- Colour and width representation of volume on each road segment
- Loading topographic data of segments from `scene.yaml` to JS
- Using topographic data to query day volume profile from `hug` API of `prj_volume.centreline_hourly_group12`
- Representation of day volume profile on `Plotly` charts
- Ability to download volume data of a selected road segment
- Ability to turn on/off basemap, expressways, and ramps on web map.

## Possible Future Features
- Transisition to [`Dash`](https://plot.ly/products/dash/) to easily control the flow of data in addition to using [`React.js`](https://reactjs.org/) to create the webmap in as a component. Similar to the [King Street Pilot Public Dashboard](https://github.com/CityofToronto/bdit_king_pilot_dashboard/tree/public-dashboard-layout).
- Refinement of web map `scene.yaml` using more of the features provided with it.
- Addition of another page which provides more details on a road segment.
- Location search on web map. Leaflet has a few [plugins](http://leafletjs.com/plugins.html#search--popups) that can enable it.

## Usage
### Requirements
[`python`](https://www.python.org/) You'll need to create your own python environment
[`hug`](http://www.hug.rest/)
[Mapzen's Vector Tile Service](https://mapzen.com/documentation/vector-tiles/#use-mapzens-vector-tile-service)

### Running the web map locally
Run the following bash commands assuming you have installed the neccessary requirements and files. (Note: these instructions are relative to my current file structure, yours may be different)
```
$ source hug_env/bin/activate                               # start hug environment
$ hug -f get_volume_link_api.py -p 8001                     # start volume API
Ctrl + Z to suspend process
$ bg                                                        # start process again in background
$ deactivate                                                # end hug environment
$ source env/bin/activate                                   # start python environment
$ python tileserver/__init__.py config.yaml                 # start Tileserver
Ctrl + Z to suspend process
$ bg
$ cd bdit_intereactive_streets_tiles                        # move to directory containing your `index.html`
$ python -m SimpleHTTPServer 8000                           # start hosting web page
```
You can then access the web page on your browser by going to [`http://localhost:8000/`](http://localhost:8000/)
## How the map works
## Front End
### Leaflet
[Leaflet](http://leafletjs.com/) is used to create the map window in `JS`. It provides us with lots of useful features and is open-source which has a lot of [documentation](http://leafletjs.com/reference-1.2.0.html).

### Plotly.js
[Plotly.js](https://plot.ly/plotly-js-scientific-d3-charting-library/) is used to create the charts that show the day profile of a line segment. 

## Backend
### Vector Tile Service
The data for the streets centrelines is stored in PostgreSQL. In order to load it into a webmap we use Mapzen's [Vector Tile Service](https://mapzen.com/projects/vector-tiles/) to load the data from the server into a Web API which parses the data into a `GeoJSON` format. To read up on how to setup a Vector Tile Service, read the [documentation](https://github.com/CityofToronto/bdit_interactive_streets_tiles/blob/master/tilezen/README.md) for how we first set up it up and got it to run. Below are the various files that are to be modified for the web maps needs.

#### config.yaml
This file is used to login into the PostgreSQL server. Simply copy the file found [here](https://github.com/CityofToronto/bdit_interactive_streets_tiles/blob/master/tilezen/config.yaml) and enter your `username` and `password` for access to the server.

#### streets.jinja2
The `streets.jinja2` is used to query and load data from the PostgreSQL server. The file can be found [here](https://github.com/CityofToronto/bdit_interactive_streets_tiles/blob/master/tilezen/streets.jinja2). Below is the explanation of the file which behaves like a SQL query:
```
{% block query %}
SELECT
  id AS __id__,                                                 # must be a unique identifier found in the table
  {% filter geometry %}geom{% endfilter %} AS __geometry__,     # tells which column contains the geometry
  NULL::bytea AS __label__,
  jsonb_build_object(                                           # topology found in the table
      'geo_id', centreline_id,                                  # only the columns that are needed a included in the query
      'min_zoom', min_zoom,
      'oneway_dir_code', oneway_dir_code,
      'dir_bin', dir_bin,
      'functional_type', feature_code_desc,
      'name', linear_name_full,
      'name_id', linear_name_id,
      'volume', volume,
      'year', year,
      'direction', direction
  ) AS __roads_properties__

FROM
  some_schema.streets_tiled_offset                              # table found in the database
WHERE
  {{ bounds['line']|bbox_filter('geom', 3857) }}                # features are loaded if they are within the users view/minimum
  AND min_zoom <= {{ zoom }}                                    # bounding box and are within the minimum zoom.
{% endblock %}
```

#### scene.yaml
The `scene.yaml` file is used to control and stylize what is displayed on the layer which it produces. The link we produce from creating a Vector Tile Service is then used in our Leaflet map via the `scene.yaml` file. To read more on `scene.yaml` click [here](https://github.com/CityofToronto/bdit_interactive_streets_tiles/blob/master/SceneYamlGuide.md). 

To load the Web API in JS follow this example:
```
var map = L.map('map');                   // create Leaflet map
var streetLayer = Tangram.leafletLayer({  // layer that contains the geometry from the Web API
    scene: 'scene.yaml',
    events: {                             // various functionality used to interact with the geometry
        click: onMapClick,
        hover: onMapHover,
    },
    selectionRadius: 25
});
streetLayer.addTo(map);                   // add the layer to the map
```

The advantage of using a Vector Tile Service is that it breaks up the layer(s) into 'tiles' which are loaded onto the map. This way the user only downloads the tiles they see.

### Hug API
The Vector Tile Service is only able to house the information that it is provided and it must be tied to geometry. As a result, it alone is not enough for the web map's needs as it needs someway to access volume data. To overcome this, another Web API is used and is done so using [`hug`](http://www.hug.rest/). Follow hug's [documentation](http://www.hug.rest/website/quickstart) on how to install and run a hug API.

For this map, copy `get_volume_link_api.py` into your file system in Unix then run the following bash commands:
```
$ source hug_env/bin/activate             # start the hug environment
$ hug -f get_volume_link_api.py -p 8001   # start the API that hosts the data
```
This data will then be hosted at `localhost:8001` and can be accessed there. To access this API in `JS` follow this example which is used to load the data into the web pages graph's.
```
function loadVolData(geo_id) {
    var api_url = "http://localhost:8001/get_volume_year_link?year=2015&centreline_id=" + geo_id;
    var volumeData = (function () {
        var json = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': api_url,
            'dataType': "json",
            'success': function (data) {
                json = data;
            }
        });
        return json;
    })();
    return volumeData;
}
```
This function works by getting a `geo_id` which is the unique id attached to each `street_centreline` and appends it to the `api_url`. We then use `AJAX` to fetch the data and return it to us.

### PostgreSQL
For both the Web API's the data is sourced from the `bdit_server`.

For the Vector Tile Service it pulls from a table called `streets_tiled_offset` which can be created in your own schema using the SQL code at [`streets_tiled_offset.sql`](https://github.com/CityofToronto/bdit_interactive_streets_tiles/blob/master/sql/streets_tiled_offset.sql). This code is dependant on the existing tables `prj_volume.centreline`, `gis.streets_zoomlevels`, and `prj_volume.centreline_aadt_group12`. This code is used to duplicate the rows in `centerline` and offset them to produce bi-directional lines in addition to assigning a direction to each line. The `centreline_aadt_group12` table is then used to load volume data into the centrelines which distinct to that line and direction. This volume data is used to scale the width of the lines where higher volume roads are thicker. Finally, `streets_zoomlevels` is used to assign a zoom level to each road classification. This zoom level is used by the Tileserver to determine what roads segments should be displayed at the zoom level a user is at on the web map.

Below is a table on the current zoom levels for each road classification

| Classification | Min zoom level |
|---|---|
| Expressway | 8 |
| Expressway Ramp | 8 |
| Major Arterial | 9 |
| Major Arterial Ramp | 9 |
| Minor Arterial | 12 |
| Minor Arterial Ramp | 12 |
| Collector | 15 |
| Collector ramp | 15 |
| Local | 15 |
| Pending | 17 |

For the `hug` API it simply pulls from the `prj_volume.centreline_hourly_group12` which contains hourly volume data.
