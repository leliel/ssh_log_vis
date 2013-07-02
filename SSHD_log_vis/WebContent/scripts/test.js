var temp = d3.xhr("getEntries");
temp.mimeType("application/json");
temp.header("Content-type", "application/x-www-form-urlencoded");
// temp.header("Accept-Encoding", "gzip");

temp.post(
		"startTime=2013-03-16+08:26:06&endTime=2013-03-18+08:26:06&maxBins=10",
		function(error, response) {
			renderBin(JSON.parse(response.responseText));
		});
// d3.json("getEntries?startTime=2013-03-16%2008:26:06&endTime=2013-03-16%2008:26:06&maxBins=1",
// displayJson);

function displayJson(text) {
	var obj = JSON.parse(text);
	var data = [];
	var columns = [ "Attribute", "Value" ];

	var i = 0;
	for ( var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			data[i++] = {
				Attribute : prop,	
				Value : obj[prop]
			};
		}
	}

	var table = d3.select("body").append("table"), thead = table
			.append("thead"), tbody = table.append("tbody");

	// append the header row
	thead.append("tr").selectAll("th").data(columns).enter().append("th").text(
			function(column) {
				return column;
			});

	// create a row for each object in the data
	var rows = tbody.selectAll("tr").data(data).enter().append("tr");

	// create a cell in each row for each column
	rows.selectAll("td").data(function(row) {
		return columns.map(function(column) {
			return {
				column : column,
				value : row[column]
			};
		});
	}).enter().append("td").text(function(d) {
		return d.value;
	});

}

function renderBin(element){
	var vis = d3.select(".timeline");
	vis.data(element)
	.enter()
	.append("g")
	.attr("id", function(d){
		return d.id;
	})
	.selectAll("rect")
	.append("rect")
	.attr("width", 100)
	.attr("height", function(d, i){
		return (d.acceptedConn/d.subElemCount)*100;
	})
	.style("fill", function(d, i){
		return "#ffoooo";
	});
}

function makeRect(width, height, colour){
	return 
}

