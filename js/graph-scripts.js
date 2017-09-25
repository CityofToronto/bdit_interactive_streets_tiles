function updateDataLink(label, geo_id) {
    var frame = document.getElementById('graph');
    var innerDoc = frame.contentDocument || frame.contentWindow.document;
    var linkLoc = innerDoc.getElementById('link');
    linkLoc.href = "data.html?geoid=" + geo_id;
    console.log(linkLoc.href);
    linkLoc.style.visibility = "visible";
}

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

// dataToCSV() converts data from API to a downloadable CSV format
function dataToCSV(geo_id) {
    var volumeData = loadVolData(geo_id)
    var arrHH = volumeData.hh;
    var arrVol = volumeData.volume;
    var dataArr = [];
    // convert JSON to JS array
    dataArr = arrHH.map(function (e, hh) {
        return [e, arrVol[hh]];
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
    link.setAttribute("download", id + ".csv");
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".
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
    var graphLoc = innerDoc.getElementById('graphFrame');
    Plotly.newPlot(graphLoc, data, layout);

    /*    var table = innerDoc.getElementById('volData');
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    for (var i = 0; i < volumeData.hh.length; i++){
        var tr = document.createElement('tr');   

        var td1 = document.createElement('td');
        var td2 = document.createElement('td');

        var text1 = document.createTextNode(volumeData.hh[i]);
        var text2 = document.createTextNode(volumeData.volume[i]);

        td1.appendChild(text1);
        td2.appendChild(text2);
        tr.appendChild(td1);
        tr.appendChild(td2);

        table.appendChild(tr);
    }*/
}