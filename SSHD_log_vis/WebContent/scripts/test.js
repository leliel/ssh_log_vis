//var temp = d3.xhr("getEntries");
//temp.mimeType("application/json");
//temp.header("Accept-Encoding", "gzip");
//temp.post("startTime=1970-03-15%2020:26:06&endTime=1970-03-15%2020:26:06&maxBins=1", displayJson);
d3.json("getEntries?=startTime=1970-03-15%2020:26:06&endTime=1970-03-15%2020:26:06&maxBins=1", displayJson);

function displayJson(text) {
	var obj = JSON.parse(text);
	var sel = d3.select("table");
	var data = [];

	for (prop in obj) {
		data[i] = {
			prop : obj[prop]
		};
	}

	sel.data(data)
	.enter()
	.append("tr");

	sel = sel.selectAll("td")
	.data()
	.enter()
	.append("td")
	.text(function(d, i){return d[i];});

}
// display this somehow. not sure yet how to.
