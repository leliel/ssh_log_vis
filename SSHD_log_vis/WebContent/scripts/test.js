var minute = 60000; // milliseconds in a minute.
var hour = 60 * minute; // milliseconds in an hour.
var day = 24 * hour; // milliseconds in a day.
var locality;
var timeScale;
var timelinePlacements;

window.onload = setupOnLoad;

function setupOnLoad(){
	
	timelinePlacements = {
			minBinWidth : 30,
			maxBins : undefined,
			binHeight : 40,
			numOnLine : 3,
			rowsx : 10,
			rowHeight : 60
	};
	
	timelinePlacements.maxBins = getPropertyNumberFromCSS(document.getElementById("time"), "width")/timelinePlacements.minBinWidth;
	
	locality = {
			startTime : new Date(2013, 02, 16, 08, 26, 06),
			endTime : new Date(2013, 02, 24, 12, 00, 00)
	};
		
	requestTimelineEvents(locality.startTime, locality.endTime, timelinePlacements.maxBins, day);
}


function requestTimelineEvents(startTime, endTime, maxBins, binLength) {
	data = "startTime=" + startTime.getTime() + "&endTime=" + endTime.getTime() + "&maxBins="
			+ maxBins + "&binLength=" + binLength;

	d3.xhr("getEntries").mimeType("application/json")
		.header("Content-type",	"application/x-www-form-urlencoded")
		.post(encodeURI(data),
			function(error, response) {
				if (error) {
					// TODO handle error codes nicely.
				} else {
					if (response.status == 200) {
						var text = response.responseText;
						text = JSON.parse(text, datify);
						renderBins(text);
					} else if (response.status = 204) {
						// TODO handle displaying lack of data in requested
						// range
						// nicely.
						alert("No data for requested range");
					}
					;
				}
				;
			});
}

function datify(key, value){
	if (key.indexOf("Time") != -1 || key.indexOf("time") != -1){
		return new Date(Number(value));
	};
	return value;
}

function renderBins(element) {
	var range = [10, getPropertyNumberFromCSS(document.getElementById("time"), "width")-10];
	timeScale = d3.time.scale()
		.domain([locality.startTime, locality.endTime])
		.range(range);

	var timeLineContainer = d3.select(".timeline"); // get the timeline, to nest
	// everything under
	var vis = timeLineContainer.selectAll(".bin"); // get all the bins, we'll
	// reuse this selection
	// several times.
	vis.data(element)
		.enter()
		.append("g")
		.attr("class", "bin")
		.attr("id",
			function(d) {
				return d.id;
		})
		.on("mouseover", showToolTip)
		.on("mouseout", hideToolTip)
		.attr("transform", getEventCoords);
	
	timeLineContainer.selectAll(".bin")
		.append("rect")
		.attr("class", "binFailed")
		.attr("width", getEventWidth)
		.attr("height", timelinePlacements.binHeight);

	timeLineContainer.selectAll(".bin")
		.append("rect")
		.attr("class", "binAccepted")
		.attr("width", timelinePlacements.binWidth)
		.attr("height",	getAcceptedPropAsHeight);

	timeLineContainer.selectAll(".bin")
		.append("line")
		.attr("class", ".binDivider")
		.attr("y1", getAcceptedPropAsHeight)
		.attr("x2", getEventWidth)
		.attr("y2", getAcceptedPropAsHeight);
}

function getEventCoords(d, i){
	var x = timeScale(getXforEvent(d, i));
	var y = getYforEvent(d, i);
	return "translate(" + x + "," + y + ")";
}

function getEventWidth(d, i){
	if (d.endTime === d.startTime){
		return timelinePlacements.minBinWidth;
	} else {
		var scaleStart = timeScale(d.startTime);
		var scaleEnd = timeScale(d.endTime);
		return scaleEnd - scaleStart;
	}
}

function getAcceptedPropAsHeight(d, i) {
	var temp = timelinePlacements.binHeight
			* (d.acceptedConn / (d.acceptedConn + d.failedConn + d.invalidAttempts));
	return temp;
}

function getYforEvent(d, i) {
	var temp = Math.ceil(i * 1.0 / timelinePlacements.numOnLine);
	return timelinePlacements.rowHeight*temp;
}

function getXforEvent(d, i) {
	if (d.hasOwnProperty("startTime")){
		return d.startTime;
	} else {
		return d.time;
	}
}

function showToolTip(d) {
	var selection = d3.select(".tooltip");
	selection = selection.style("left", (d3.event.pageX + 10) + "px");
	selection = selection.style("top", d3.event.pageY + "px");
	var html;
	if (d.elem == null){
		html = "Start Time: " + d.startTime.toLocaleString() + "<br>" +
			"End Time: " + d.endTime.toLocaleString() + "<br>" +
			"Accepted Connections: " + d.acceptedConn + "<br>" +
			"Failed Connections: " + d.failedConn + "<br>" +
			"Invalid Usernames: " + d.invalidAttempts + "<br>"
			//TODO how do we print flags?
			;
	} else {
		html = tooltipText(d.elem);
	}
	selection.html(html);
	selection.transition().duration(200).style("opacity", .9);
}

function tooltipText(elem){
	var text = "";
	for (var prop in elem){
		if (elem.hasOwnProperty(prop) && prop != "rawLine"){
			text += prop + ": " + elem[prop] + "<br>";
		};
	};
}

function hideToolTip(d) {
	d3.select(".tooltip").transition().duration(200).style("opacity", 0);
}
