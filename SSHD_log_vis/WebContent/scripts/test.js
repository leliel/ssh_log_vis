var temp = d3.xhr("getEntries");
temp.mimeType("application/json");
temp.header("Content-type", "application/x-www-form-urlencoded");
var minute = 60000; //milliseconds in a minute.
var hour = 60 * minute; //milliseconds in an hour.
var day = 24 * hour; //milliseconds in a day.

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
		"startTime=2013-03-16+08:26:06&endTime=2013-03-24+12:00:00&maxBins=10&binLength=" + day,
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
	.attr("class", "bin")
	.attr("id", function(d){
		return d.id;
	})
	.on("mouseover", showToolTip)
	.on("mouseout", hideToolTip)
	.append("rect")
	.attr("class", "binFailed")
	.attr("x", getXforRect)
	.attr("y", getYforRect)
	.attr("width", timelinePlacements.binWidth)
	.attr("height", timelinePlacements.binHeight);

	timeLineContainer.selectAll(".bin")
	.append("rect")
	.attr("class", "binAccepted")
	.attr("x", getXforRect)
	.attr("y", getYforRect)
	.attr("width", timelinePlacements.binWidth)
	.attr("height", getAcceptedPropAsHeight);

	timeLineContainer.selectAll(".bin")
	.append("line")
	.attr("x1", getXforRect)
	.attr("y1", getYforDiv)
	.attr("x2", function(d, i){
		return getXforRect(d, i) + timelinePlacements.binWidth;
	})
	.attr("y2", getYforDiv);
}

function getYforDiv(d, i){
	var temp = getYforRect(d, i) + getAcceptedPropAsHeight(d, i);
	return temp;
}

function getAcceptedPropAsHeight(d, i){
	var temp = timelinePlacements.binHeight*(d.acceptedConn/d.subElemCount);
	return temp;
}

function getYforRect(d, i){
	var temp;
	switch (i/timelinePlacements.numOnLine) //this math needs fixing.
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

function showToolTip(d){
	var x = d3.event.pageX;
	var y = d3.event.pageY;
	var selection = d3.select(".tooltip");
	selection = selection.style("left", (d3.event.pageX + 10) + "px");
	selection = selection.style("top", d3.event.pageY + "px");
	/*selection.html("Name: " + d.NAME  + "<br>" + //TODO rewrite to use actual element details.
						"Mass: " + (Number(d.MASS) == 0.0 ? "Unknown<br>" : trimDecimal(Number(d.MASS), 3) + " Jupiter Masses<br>") +
						"Radius: " + (Number(d.R) == 0.0 ? "Unknown<br>" : trimDecimal(Number(d.R), 3) + " Jupiter Radii<br>") +
						"Orbit Distance: " + (Number(d.SEP) == 0.0 ? "Unknown<br>" : trimDecimal(Number(d.SEP), 3) + "AU<br>") +
						"Orbit Period: " + (Number(d.PER) == 0.0 ? "Unknown<br>" : trimDecimal(Number(d.PER), 3) + " Days<br>") +
						"Distance: " + trimDecimal(Number(d.DIST)*3.261563777, 1)+" Lightyears"); */
	selection.transition()
				.duration(200)
				.style("opacity", .9);
}

function hideToolTip(d){
		d3.select(".tooltip")
			.transition()
			.duration(200)
			.style("opacity", 0);
}

