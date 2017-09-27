// very inefficient
/*var id = (window.location.search).substring((window.location.search).indexOf('=') + 1, (window.location.search).indexOf('&'));
var label = (window.location.search).substring((window.location.search).lastIndexOf('=') + 1);*/

// better, but not sure if supported by all browsers
var url_string = window.location
var url = new URL(url_string);
var label = url.searchParams.get("label");
var id = url.searchParams.get("geoid");

if (id !== null){
    document.getElementById('download').style.visibility = "visible";
    createVolGraph(label, id);
    updateDataLink(id, label);
}

function updateDataLink(geo_id) {
    var linkLoc = document.getElementById('link');
    linkLoc.href = "data.html?geoid=" + geo_id + "&label=" + label;
    linkLoc.style.visibility = "visible";
}

// loadVolData(geo_id) loads data from conterline_hourly_group12 table view via Hug api using Jquery.
//  returns a json string which contains the volume data of a specified geo_id.
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

// dataToCSV() converts data from API to a downloadable CSV format
function dataToCSV() {
    var volumeData = loadVolData(id);
    var dataArr = [];
    // convert JSON to JS array
    dataArr = volumeData.map(function (e, hh) {
        return [e.centreline_id, e.dir_bin, volumeData[hh].volume, e.hh, e.year];
    });
    // add key property names to top of array
    dataArr.unshift(Object.keys(data));
    // establish csv
    var csvContent = "data:text/csv;charset=utf-8,";
    // load data into csv
    dataArr.forEach(function(infoArray, index){
        dataString = infoArray.join(",");
        csvContent += index < dataArr.length ? dataString+ "\n" : dataString;
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", id + label + ".csv");
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".
}

// createVolGraph(label, geo_id) produces a Plotly.js graph of a street's geo_id and a given label.
//  Volume data is retrieved by using the geo_id and is displayed on the graph.
function createVolGraph(label, geo_id) {
    var volumeData = loadVolData(geo_id);
    var vol = [];
    var hh = [];
    console.log(JSON.stringify(volumeData));
    for (var i = 0; i < volumeData.length; i++) {
        if (volumeData[i].dir_bin == 1) {
            vol.push(volumeData[i].volume);
            hh.push(volumeData[i].hh);
        }
    }
    console.log(vol);
    var trace1 = {
        x: hh,
        y: vol,
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
    var frame = document.getElementById('graphFrame');
    Plotly.newPlot(frame, data, layout);
    window.onresize = function() {
        Plotly.Plots.resize(frame);
    };
}