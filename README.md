# bdit_interactive_streets_tiles
Testing Tilezen and Mapzen's Tangram to create an interactive layer of the [City of Toronto Streets Centreline](https://www1.toronto.ca/wps/portal/contentonly?vgnextoid=9acb5f9cd70bb210VgnVCM1000003dd60f89RCRD) 

See the Tilezen folder [README](tilezen/README.md) for instructions on setting up Tilezen with the Centreline layer as well as the configuration files we used for our server.

## `scene.yaml`
The scene file organizes all of the elements Tangram uses to draw a map. It is used to control which layers are displayed and how they are displayed.

### Options
#### `sources`
A required element of the scene file. It is used to define a sources block which takes in source name parameters which contain a data type and a url to a tileserver. Multiple sources can be specified and displayed.
```
sources:
    mapzen: #s ource name
        type: GeoJSON #data type, can be any of TopoJSON, GeoJSON, MVT, Raster
        url: http://localhost:8080/all/{z}/{x}/{y}.json
        max_zoom: 17 #zoom specifies the level of detail that is to be rendered
        min_zoom: 8
```

#### `import`
Allows for other .yaml files that follow Tangram scene blocks to be added to the scene file. This is done using `import: layer1.yaml` for one or `import: [layer1.yaml, layer2.yaml]` for multiple.

#### `layers`
A required element in the scene file. It groups together the individual layers with specified layer names.
```
layers:
    roads:
```
The following are avaliable parameters of the layers:

##### `data`
Required parameter that refers the previously created source name in sources.
```
layers:
    roads:
        data: { source: mapzen }
```

##### `filter`
A filter element can be included once in any layer/sublayer. Only features matching the filter will be included in the layer and it's sublayer.
```
layers:
    roads: # layer
        expressway: # sublayer
            filter: function () {
                        return (feature.__roads_properties__.functional_type == 'Expressway');
                    } # a filter using JS. It is possible to make very complex filters using JS.
```
It is also possible to filter using:
```
filter:
    roads:
        expressway:
            filter:
                functional_type: Expressway
                # though this method doesn't seem to work properly with our tileserver
```
Filters refer to the specific properties of the source. In this case, our tilserver contains the the following properties:

| Property | Field in gis.streets_tiled |
|---|---|
| gid | gid |
| min_zoom | min_zoom |
| name | lf_name |
| functional_type | fcode_desc |
| label | lf_name |

It is possible to add more properties to the tilserver by modifying the `streets.jinja2` file and is avaliable on the table it refers to.

Filters can also be used to filter specific types of geometry from a source.
```
filter: { $geometry: polygon } # only filter polygons
filter: { $geometry: [point, line] } # filter both point and line
filter: function() { return $geometry === 'point' || $geometry === 'line' } # ditto but in JS
```
Filters can also be used to filter layers if a datasource has multiple layers
```
data: { source: mapzen, layer: [roads, highways] } # purely as an example
roads-only:
    filter { $layer: roads }
```
Filters can be used to display layers at specific zoom levels
```
filter: { $zoom: 14 } # the layer will only display when the map's zoom level is 14
filter: { $zoom: { min: 10, max: 15 } } # only when zoom level is at 10-15
filter: function() { return $zoom >= 10 && $zoom <= 15 } # ditto but in JS
```

#### `draw`
draw is an optional element in a layer or sublayer. It is used to create one or more draw groups for rendering features that match layer above it.
```
layers:
    roads:
        data: { source: mapzen }
        draw: # draw element
            lines: # draw group, the name `lines` is interpreted as the style
                color: gray
```
Tangram has 5 built in draw styles: `polygons lines points text raster`.
##### `lines`
Lines can be drawn from a datasource that contain line features. Lines require a `color` and `width` parameter in order to be drawn. It also has optional paramters of `join`, `cap`, `interactive`, and `outline`.
###### `color`
All features have a color parameter. Colors can be specified using any of W3C's CSS formats including named, hex, RGB, and HSL. Below is are a few example on its usage.
```
draw:
    lines:
        color: [.7, .7, .7] # sea blue in RGB
        color: '#ff00ff' # violet in hex
        color: blue # named value
        color: function() { return [$zoom, .5, .5]; } # specifying color using JS which is based on zoom level
```

###### `width`
Determine the width of the line. Accepts units in metres `m` or pixels `px`. Metres are default units.
```
draw:
    lines:
        width: 4px
        width: 18m
        width: function() { return $zoom / 4 * $meters_per_pixel; }
```
###### `join`
Controls how corners of line segments are displayed. They can be any of `miter`, `round`, or `bevel`.
```
draw:
    lines:
        join: round
```
###### `cap`
Controls how the ends of line segments are displayed. They can be any of `butt`, `round`, or `square`.
```
draw:
    lines:
        cap: round
```
Both `cap` and `join` follow the [SVG protocol](https://www.w3.org/TR/SVG/painting.html#StrokeLinecapProperty).

###### `interactive`
All features have an interactive property that can be toggled `true` or `false`. With the default setting of `false`. If `true` then it activates Feature Selection which can be queried via the JS Api.
`scene.yaml` component:
```
global:
    _highlight: false
layers:
    roads:
        data: { source: mapzen }
        draw:
            lines:
                color: gray
                width: 8
                cap: round
                interactive: true
        road_highlight:
            filter: function () { return (feature.__roads_properties__.gid == global._highlight); }
            draw:
                lines:
                    order: 11
                    color: blue
                    cap: round
```
`scripts.js` component:
```
var streetLayer = Tangram.leafletLayer({
    scene: 'scene.yaml',
    events: {
        click: onMapClick,
    }
});
function onMapClick(selection) {
    if (selection.feature) {
        highlightUnit(selection.feature.properties.__roads_properties__.gid);
    } else {
        highlightUnit(false);
    }
}
function highlightUnit(symbol) {
    streetLayer.scene.config.global._highlight = symbol;
    streetLayer.scene.updateConfig();
}
```
Selection works by the user clicking a feature on the map, this event gets a property of the feature (in this case the `gid`) and assigns the global variable `_highlight` in `scene.yaml` to `gid`. `scene.yaml` is then updated and the drawgroup `road_highlight` filters the features using the provided `gid`. This causes the feature that fufills the feature to be highlighted.

###### `outline`
Draws an outline around the line elements.
```
draw:
    lines:
        outline:
            width: 1px
            color: blue
```

##### `text`
Another possible draw group of `draw`. This group is based on the `text_source` parameter which comes from a data source.
```
layers:
    roads:
        data: { source: mapzen }
        draw:
            text:
                text_source: function () { return feature.__roads_properties__.name; }
```
As you can see, text_source works similarly to filter getting a property of a feature.
`text` has many parameters, below is a table showing these parameters:

| parameter | description |
|---|---|
| font  | Sets font’s typeface, style, size, color, and outline. |
| text_source | Determines label text, defaults to the feature’s name property. |
| priority  | Sets the priority of the label relative to other labels and points/sprites. |
| align | Controls text alignment. |
| anchor | Controls text’s relative positioning. |
| offset | Controls text’s position offset. |
| text_wrap  | Sets number of characters before text wraps to multiple lines. |
| repeat_distance | Sets the distance beyond which label text may repeat. |
| repeat_group | Optional grouping mechanism for fine-grained control over text repetition. |
| collide  | Sets whether label collides with other labels or points/sprites. |
| move_into_tile | Increases number of labels that will display, by moving some to fit within tile bounds (JS-only) |

For more details on the usage of these parameters please refer to [Mapzen's Style Overview](https://mapzen.com/documentation/tangram/Styles-Overview/#text_1)

###### `priority`
Sets the priority of the label relative to other labels. Therefore, labels with a lower value will have a higher priority and will be loaded before other labels.
```
draw:
    text:
        priority: 1
```

###### `repeat_group`
Optional grouping mechanism for fine-grained control over text repetition. Used with `repeat_distance`.
```
roads:
   draw:
      text:
         repeat_group: roads-fewer-labels
   major_roads:
      filter: { kind: major_road }
      draw:
         text:
            ...
   minor_roads:
      filter: { kind: minor_road }
      draw:
         text:
            ...
```
This layer's labels will not repeat near each other since they are in the same `repeat_group`

###### `repeat_distance`
Sets the distance beyond which label text may repeat.
```
draw:
   text:
      repeat_distance: 100px # label can repeat every 100 pixels
```

##### `order`
Specifies the layer order of the current layer. A layer with a higher order will appear above layers with a lower layer on the map
```
layers:
    roads:
        expressway:
            draw:
                lines:
                    order: 2
        major_arterial:
            draw:
                lines:
                    order: 1
    # expressway will appear above major_arterial
```

These are only the most relevant abilities of the `scene.yaml` file. However, the project is not exclusive of the other capabilities provided by Tangram such as 3d view, lighting, camera views and more. For further reading see [Tangram's documentation](https://mapzen.com/documentation/tangram/#).