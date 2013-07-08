var timelineGlobals;

window.onload = setupOnLoad;

function setupOnLoad(){

	timelineGlobals = new Globals(getPropertyNumberFromCSS(document.getElementById("time"), "width"), getPropertyNumberFromCSS(document.getElementById("time"), "height"));

	requestAllTimelines(timelineGlobals.day);
}

function TimeUnits() {
		this.second = 1000;
		this.minute = 60 * this.second; // milliseconds in a minute.
		this.hour = 60 * this.minute; // milliseconds in an hour.
		this.day = 24 * this.hour; // milliseconds in a day.
		this.week = 7 * this.day; // milliseconds in a week.
		this.month = 4 * this.week; //milliseconds in a standard month(28 days)
}

function Globals(width, height){
	this.timeUnits = new TimeUnits();

	this.minBinWidth = 30;
	this.maxBins = Math.floor((width-40)/this.minBinWidth);
	this.binHeight = 40;
	this.binLength = this.timeUnits.day;
	this.numLines = 4;
	this.rowHeight = height/this.numLines;

	this.range = [20, width-20];
	this.times = [{
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
	},
	{
		startTime : new Date(2013, 03, 05, 00, 00, 00),
		endTime : new Date(2013, 03, 12, 00, 00 ,00)
	}];

	//used in tracking which timeline we're building now.
	this.rowY = undefined;
	this.rowId = undefined;
	this.scaler = undefined;
}

function requestAllTimelines(){
	for (var idx in timelineGlobals.times){
		if (timelineGlobals.times[idx] == null || timelineGlobals.times[idx].timeScale == undefined){
			timelineGlobals.times[idx].timeScale = d3.time.scale()
			.range(timelineGlobals.range);
		}
		timelineGlobals.times[idx].timeScale.domain([timelineGlobals.times[idx].startTime, timelineGlobals.times[idx].endTime]);
		requestTimelineEvents(timelineGlobals.times[idx].startTime, timelineGlobals.times[idx].endTime, timelineGlobals.maxBins, timelineGlobals.binLength, idx);
	};
}


function requestTimelineEvents(startTime, endTime, maxBins, binLength, idx) {
	var data = "startTime=" + startTime.getTime() + "&endTime=" + endTime.getTime() + "&maxBins="
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
						renderBins(text, idx);
					} else if (response.status = 204) {
						renderBins([], idx);
					};
				};
			});
}

function datify(key, value){
	if (key.indexOf("Time") != -1 || key.indexOf("time") != -1){
		return new Date(Number(value));
	};
	return value;
}

function renderBins(element, idx) {

	//pick the right scaler and rowNumber
	timelineGlobals.scaler = timelineGlobals.times[idx].timeScale;
	timelineGlobals.rowY = timelineGlobals.rowHeight * idx;
	timelineGlobals.rowId = idx;

	var timeLineContainer = d3.select("#time");
	if (timeLineContainer.select("#timeline"+idx).empty()){
		timeLineContainer.append("svg:g")
		.attr("id", "timeline" + timelineGlobals.rowId);
	};

	var timeline = timeLineContainer.select("#timeline" + idx);
	var thisLine = timeline.selectAll(".bin")
		.data(element);
	thisLine.enter()
		.append("g")
		.attr("class", "bin");

	thisLine.attr("id",
			function(d) {
				return d.id;
			})
		.on("mouseover", showToolTip)
		.on("mouseout", hideToolTip)
		.on("dblclick", zoomElem)
		.attr("transform", getEventCoords);

	thisLine.selectAll(".binFailed")
		.data(function(d){
			return [d];
		})
		.enter()
		.append("svg:rect")
		.attr("class", "binFailed");
	thisLine.selectAll(".binFailed")
		.attr("width", getEventWidth)
		.attr("height", timelineGlobals.binHeight);

	thisLine.selectAll(".binAccepted")
		.data(function(d){return[d];})
		.enter()
		.append("svg:rect")
		.attr("class", "binAccepted");
	thisLine.selectAll(".binAccepted")
		.attr("width", getEventWidth)
		.attr("height",	getAcceptedPropAsHeight);


	thisLine.selectAll(".binDivider")
		.data(function(d){return [d];})
		.enter()
		.append("svg:line")
		.attr("class", "binDivider");
	thisLine.selectAll(".binDivider")
		.style("stroke-width", getNonConnectProp)
		.attr("x1", 0)
		.attr("y1", getDividerY)
		.attr("x2", getEventWidth)
		.attr("y2", getDividerY);

	 thisLine.exit().remove();

	 var axis = d3.svg.axis()
    	.scale(timelineGlobals.scaler)
    	.orient("bottom");
	 if (timeline.select(".axis").empty()){
		 timeline.append("g")
		 .attr("class", "axis");
	 };
	 timeline.select(".axis")
	 	.attr("transform", "translate(0, " + (timelineGlobals.rowY + timelineGlobals.binHeight) + ")")
		.call(axis);
}

function getDividerY(d, i){
	var temp = getAcceptedPropAsHeight(d, i) + 0.5*getNonConnectProp(d, i);
	return temp;
}

function getNonConnectProp(d, i){
	if (d.subElemCount != d.acceptedConn && d.subElemCount != d.failedConn && d.subElemCount != d.invalidAttempts) {
		var prop = (d.subElemCount - d.acceptedConn - d.failedConn - d.invalidAttempts)/d.subElemCount * timelineGlobals.binHeight;
		return prop > 2 ? prop : 2;
	} else {
		return 0;
	};
}

function getEventCoords(d, i){
	return "translate(" + timelineGlobals.scaler(getXforEvent(d, i)) + "," + timelineGlobals.rowY + ")";
}

function getEventWidth(d, i){
	if (d.endTime === d.startTime){
		return timelineGlobals.minBinWidth;
	} else {
		var temp1 = timelineGlobals.scaler(d.endTime);
		var temp2 = timelineGlobals.scaler(d.startTime);
		return temp1 - temp2;
	}
}

function getAcceptedPropAsHeight(d, i) {
	return timelineGlobals.binHeight * (d.acceptedConn / d.subElemCount);
}

function getXforEvent(d, i) {
	if (d.hasOwnProperty("startTime")){
		return d.startTime;
	} else {
		return d.time;
	}
}

function zoomElem(d, i){
	if (d.elem != null) {
		alert("Can't zoom in on a single event");
		return;
	}
	splitTimeBlock(d, timelineGlobals.binLength);
}

function performZoom(startTime, endTime, binLength){
	timelineGlobals.binLength = binLength;
	var chunk = (endTime - startTime)/timelineGlobals.numLines;
	var currentTime = new Date(startTime);
	for (var i = 0; i < timelineGlobals.numLines; i++){
		timelineGlobals.times[i].startTime = currentTime;
		currentTime = new Date(chunk + currentTime.getTime());
		timelineGlobals.times[i].endTime = currentTime;
	};

	requestAllTimelines();
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
			if (prop == "server"){
				text += prop + ": " + elem[prop].name + "<br>";
			} else {
				text += prop + ": " + elem[prop] + "<br>";
			};
		};
	};
	return text;
}

function hideToolTip(d) {
	d3.select(".tooltip").transition().duration(200).style("opacity", 0);
}