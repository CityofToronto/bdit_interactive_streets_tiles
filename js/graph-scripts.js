// loadVolData(geo_id) loads data from conterline_hourly_group12 table view via Hug api using Jquery.
//  returns a json string which contains the volume data of a specified geo_id.
function loadVolData(geo_id) {
    var api_url = "http://localhost:8001/get_volume_year_link?year=2015&centreline_id=" + geo_id;
    console.log(api_url);
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

// createVolGraph(label, geo_id) produces a Plotly.js graph of a street's geo_id and a given label.
//  Volume data is retrieved by using the geo_id and is displayed on the graph.
function createVolGraph(label, geo_id) {
    var volumeData = loadVolData(geo_id);
    console.log(JSON.stringify(volumeData));
    var trace1 = {
        x: volumeData.hh,
        y: volumeData.volume,
        name: 'Name of Trace 1',
        type: 'scatter'
    };
    var data = [trace1];
    var selectorOptions = {
        buttons: [{
            step: '1h',
            stepmode: 'backward',
            count: 1,
            label: '1h'
        }, {
            step: '12h',
            stepmode: 'backward',
            count: 6,
            label: '12h'
        },  {
            step: 'all',
        }],
    };

    var layout = {
        autosize: true,
        margin: {
            l: 50,
            r: 20,
            b: 40,
            t: 100,
            pad: 4
        },
        title: label,
        xaxis: {
            title: 'Time (hours)',
            titlefont: {
                family: 'Courier New, monospace',
                size: 18,
                color: '#7f7f7f'
            },
            // range selector
            rangeselector: selectorOptions,
            rangeslider: {}
        },
        yaxis: {
            title: 'Volume',
            titlefont: {
                family: 'Courier New, monospace',
                size: 18,
                color: '#7f7f7f'
            }
        },
        legend: {"orientation": "h"}
    };
    var frame = document.getElementById('graph');
    var innerDoc = frame.contentDocument || frame.contentWindow.document;
    var graphLoc = innerDoc.getElementById('tester');
    Plotly.newPlot(graphLoc, data, layout);
}