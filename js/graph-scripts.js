// very inefficient
/*var id = (window.location.search).substring((window.location.search).indexOf('=') + 1, (window.location.search).indexOf('&'));
var label = (window.location.search).substring((window.location.search).lastIndexOf('=') + 1);*/

// better, but not sure if supported by all browsers
var url_string = window.location
var url = new URL(url_string);

var name = url.searchParams.get("name");
var id = url.searchParams.get("geoid");
var ftype = url.searchParams.get("ftype");

createVolGraph(name, id);
createVolTable(id);

if (id !== '0'){
    document.getElementById('download').disabled = false;
    updateDataLink(id, name);
    document.getElementById("road").innerHTML = name + " " + id + " " + ftype;
//    document.getElementById("road-name").innerHTML = label;
//    document.getElementById("road-geoid").innerHTML = id;
//    document.getElementById("road-fntype").innerHTML = ftype;
}

function updateDataLink(geo_id) {
    var linkLoc = document.getElementById('link');
    linkLoc.href = "data.html?geoid=" + geo_id + "&name=" + name;
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
    var data = loadVolData(id);
    var dataArr = [];
    // convert JSON to JS array
    dataArr = data.map(function (e, hh) {
        return [e.centreline_id, e.dir_bin, data[hh].volume, e.hh, e.year];
    });
    // add key property names to top of array
    dataArr.unshift(Object.getOwnPropertyNames(data[0]));
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
    link.setAttribute("download", id + name + ".csv");
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".
}

// createVolGraph(name, geo_id) produces a Plotly.js graph of a street's geo_id and a given name.
//  Volume data is retrieved by using the geo_id and is displayed on the graph.
function createVolGraph(name, geo_id) {
    var volumeData = loadVolData(geo_id);
    var volPos = [];
    var hhPos = [];
    var volNeg = [];
    var hhNeg = [];
    for (var i = 0; i < volumeData.length; i++) {
        if (volumeData[i].dir_bin == 1) {
            volPos.push(volumeData[i].volume);
            hhPos.push(volumeData[i].hh);
        } else if (volumeData[i].dir_bin == -1) {
            volNeg.push(volumeData[i].volume);
            hhNeg.push(volumeData[i].hh);
        }
    }
    var trace1 = {
        x: hhPos,
        y: volPos,
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
            t: 40,
            pad: 4
        },
        title: "North/East Bound Volume",
        xaxis: {
            title: 'Time (hour)',
            titlefont: {
                family: 'Courier New, monospace',
                size: 18,
                color: '#7f7f7f'
            },
            linecolor: 'lightgray',
            linewidth: 2,
            mirror: true
        },
        yaxis: {
            title: 'Volume',
            titlefont: {
                family: 'Courier New, monospace',
                size: 18,
                color: '#7f7f7f'
            },
            linecolor: 'lightgray',
            linewidth: 2,
            mirror: true
        },
        legend: {"orientation": "h"}
    };
    var frame = document.getElementById('graphNEB');
    Plotly.newPlot(frame, data, layout);
    var frame2 = document.getElementById('graphSWB');
    var trace2;
    layout.title = "South/West Bound Volume"
    trace2 = {
        x: hhNeg,
        y: volNeg,
        name: 'Name of Trace 2',
        type: 'scatter'
    };
    var data2 = [trace2];
    Plotly.newPlot(frame2, data2, layout);

    window.onresize = function() {
        Plotly.Plots.resize(frame);
        Plotly.Plots.resize(frame2);
    };
}

function createVolTable(geo_id) {
    var table = $('#vol-table');
    $('#vol-table tr').remove();
    var volumeData = loadVolData(geo_id);
    table.append("<tr id="+i+">"
                 +"<th>"+"Time (hour)"+"</th>"
                 +"<th>"+"Volume"+"</th>"
                 +"</tr>");
    for (var i = 0; i < volumeData.length; i++) {
        if (volumeData[i].dir_bin == 1) {
            table.append("<tr id="+i+">"
                         +"<td>"+volumeData[i].hh+"</td>"
                         +"<td>"+volumeData[i].volume+"</td>"
                         +"</tr>");
        }
    }
}