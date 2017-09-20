/*function loadData() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var trigger = document.getElementById('graph');
            var innerDoc = frame.contentDocument || frame.contentWindow.document;
            var graphLoc = innerDoc.getElementById('tester');
            document.getElementById("data").innerHTML = this.responseText;
        }
    };
    xhttp.open("GET", "http://localhost:8001/get_volume_year_link?year=2015&centreline_id=3154251", true);
    xhttp.send();
}*/

var volumeData = {
    "hh": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
           14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    "volume": [83, 65, 41, 33, 37, 82, 265, 581, 890, 817, 621, 589, 617,
               618, 637, 729, 806, 861, 796, 613, 452, 371, 293, 210, 38]
};

var trace1 = {
    x: volumeData.hh,
    y: volumeData.volume,
    name: 'Name of Trace 1',
    type: 'scatter'
};
var data = [trace1];
var layout = {
    autosize: true,
    margin: {
        l: 50,
        r: 20,
        b: 40,
        t: 40,
        pad: 4
    },
    title: 'Test',
    xaxis: {
        title: 'Time (hours)',
        titlefont: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
        }
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
Plotly.newPlot('tester', data, layout);