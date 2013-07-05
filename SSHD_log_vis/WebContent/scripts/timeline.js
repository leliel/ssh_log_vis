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
			rowHeight : 60,
			rowY : 0,
	};

	timelinePlacements.maxBins = Math.floor((getPropertyNumberFromCSS(document.getElementById("time"), "width")-20)/timelinePlacements.minBinWidth);

	locality = [{
				startTime : new Date(2013, 02, 15, 00, 00, 00),
				endTime : new Date(2013, 02, 22, 00, 00, 00)
			},
			{
				startTime : new Date(2013, 02, 22, 00, 00, 00),
				endTime : new Date (2013, 02, 29, 00, 00, 00)
			},
			{
				startTime : new Date(2013, 02, 29, 00, 00, 00),
				endTime : new Date(2013, 03, 05, 00, 00, 00)
			}
	];

	for (var place in locality){
		requestTimelineEvents(locality[place].startTime, locality[place].endTime, timelinePlacements.maxBins, day);
	};
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

	//TODO fix scaling.. use one request and chunk into rows?.
	//probably better, but will require co-ordinate rewriting based on rows.
	var range = [10, getPropertyNumberFromCSS(document.getElementById("time"), "width")-10];
	timeScale = d3.time.scale()
		.domain([locality.startTime, locality.endTime])
		.range(range);

	var timeLineContainer = d3.select(".timeline"); // get the timeline, to nest everything under
	timeLineContainer.selectAll(".bin")
		.data(element)
		.enter()
		.append("g")
		.attr("class", "bin")
		.attr("id",
			function(d) {
				return d.id;
		})
		.on("mouseover", showToolTip)
		.on("mouseout", hideToolTip)
		.on("dblclick", zoomElem)
		.attr("transform", getEventCoords);

	timeLineContainer.selectAll(".bin")
		.append("rect")
		.attr("class", "binFailed")
		.attr("width", getEventWidth)
		.attr("height", timelinePlacements.binHeight);

	timeLineContainer.selectAll(".bin")
		.append("rect")
		.attr("class", "binAccepted")
		.attr("width", getEventWidth)
		.attr("height",	getAcceptedPropAsHeight);

	timeLineContainer.selectAll(".bin")
		.append("line")
		.attr("class", "binDivider")
		.style("stroke-width", getNonConnectProp)
		.attr("x1", 0)
		.attr("y1", getDividerY)
		.attr("x2", getEventWidth)
		.attr("y2", getDividerY);

}

function zoomElem(d, i){
	//TODO implement zooming functions.
	alert("zooming to be implemented");
}

function getDividerY(d, i){
	var temp = getAcceptedPropAsHeight(d, i) + 0.5*getNonConnectProp(d, i);
	return temp;
}

function getNonConnectProp(d, i){
	if (d.subElemCount != d.acceptedConn && d.subElemCount != d.failedConn && d.subElemCount != d.invalidAttempts) {
		var prop = (d.subElemCount - d.acceptedConn - d.failedConn - d.invalidAttempts)/d.subElemCount * timelinePlacements.binHeight;
		return prop > 2 ? prop : 2;
	} else {
		return 0;
	}
}

function getEventCoords(d, i){
	var rowY = undefined;
	for (var i =0; i < locality.length; i++){
		if (locality[i].startTime <= d.startTime && locality[i].endTime <= d.endTime){
			rowY = timelinePlacements.rowHeight * i;
			break;
		}
	}
	if (rowY != undefined) {
		return "translate(" + timeScale(getXforEvent(d, i)) + "," + rowY + ")";
	} else {
		//TODO how do we handle being given a date not within the bounds of the timeline?
	}
}

function getEventWidth(d, i){
	if (d.endTime === d.startTime){
		return timelinePlacements.minBinWidth;
	} else {
		var temp1 = timeScale(d.endTime);
		var temp2 = timeScale(d.startTime);
		return temp1 - temp2;
	}
}

function getAcceptedPropAsHeight(d, i) {
	return timelinePlacements.binHeight * (d.acceptedConn / d.subElemCount);
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
			"Invalid Usernames: " + d.invalidAttempts + "<br>" +
			"Total events: " + d.subElemCount + "<br>"
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
