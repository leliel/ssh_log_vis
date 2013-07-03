var temp = d3.xhr("getEntries");
temp.mimeType("application/json");
temp.header("Content-type", "application/x-www-form-urlencoded");

var timelinePlacements = {
		maxBins : 0,
		numBins : 0,
		binWidth: 100,
		binHeight : 40,
		numOnLine : 3,
		rowsx : 10,
		row1y : 40,
		row2y : 100,
		row3y : 160
};

temp.post(
		"startTime=2013-03-16+08:26:06&endTime=2013-03-18+08:26:06&maxBins=10",
		function(error, response) {
			if (error){
				//TODO handle error codes nicely.
			} else {
				if (response.status == 200){
					renderBins(JSON.parse(response.responseText));
				} else if (response.status = 204){
					//TODO handle displaying lack of data in requested range nicely.
				}
			}
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

function preComputeBinPlacements(count){

}

function renderBins(element){
	preComputeBinPlacements(element.length);
	var timeLineContainer = d3.select(".timeline"); //get the timeline, to nest everything under
	var vis = timeLineContainer.selectAll(".bin"); //get all the bins, we'll reuse this selection several times.
	vis.data(element)
	.enter()
	.append("g")
	.attr("id", function(d){
		return d.id;
	})
	.append("rect")
	.attr("x", getXforRect)
	.attr("y", getYforRect)
	.attr("width", timelinePlacements.binWidth)
	.attr("height", timelinePlacements.binHeight);
	//.each(entryEnter); //create bin groups with appropriate ID's, we'll need these later.
}

function entryEnter(d, i){
	var vis = d3.selectAll(".binFailed") //create rectangles for the failed logins
	.data(d)
	.enter()
	.append("rect")
	.attr("x", getXforRect)
	.attr("y", getYforRect)
	.attr("width", timelinePlacements.binWidth)
	.attr("height", timelinePlacements.binHeight);

	vis.selectAll(".binAccepted") //create rectangles for succeeded logins
	.data(d)
	.enter()
	.append("rect")
	.attr("x", getXforRect)
	.attr("y", getYforRect)
	.attr("width", timelinePlacements.binWidth)
	.attr("height", getAcceptedPropAsHeight);

	vis.selectAll(".binDivider") //create divider lines.
	.data(d)
	.enter()
	.append("line")
	.attr("x1", getXforRect)
	.attr("y1", getYforDiv)
	.attr("x2", function(d, i){
		return getXforRect(d, i) + timelinePlacements.binWidth;
	})
	.attr("y2", getYforDiv);
}

function getYforDiv(d, i){
	var temp = getYforRect(d, i) + getAcceptedPropAsHeight(d, i)
	return temp;
}

function getAcceptedPropAsHeight(d, i){
	var temp = timelinePlacements.binHeight*(d.acceptedConn/d.subElemCount);
	return temp;
}

function getYforRect(d, i){
	var temp;
	switch (i/timelinePlacements.numOnLine)
	{
	case 1:
		temp = timelinePlacements.row1y;
		return temp;
	case 2:
		temp = timelinePlacements.row2y;
		return temp;
	case 3:
		temp = timelinePlacements.row3y;
		return temp;
	}
}

function getXforRect(d, i){
	return timelinePlacements.rowsx + (i%timelinePlacements.numOnLine)*timelinePlacements.binWidth;
}

