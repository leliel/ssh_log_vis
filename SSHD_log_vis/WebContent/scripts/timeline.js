var timelineGlobals;

function TimeUnits() {
		this.second = 1000;
		this.minute = 60 * this.second; // milliseconds in a minute.
		this.hour = 60 * this.minute; // milliseconds in an hour.
		this.day = 24 * this.hour; // milliseconds in a day.
		this.week = 7 * this.day; // milliseconds in a week.
		this.month = 4 * this.week; //milliseconds in a standard month(28 days)
		this.year = 365 * this.day; //milliseconds in a standard year (365 days, ignores leapyears.)
}

function Globals(width, height){
	this.timeUnits = new TimeUnits();
	this.binLength = this.timeUnits.day;
	this.server = null;
	this.minBinWidth = 30;
	this.padding = {
			vertical : 20,
			left : 50,
			right : 20
	};
	this.maxBins = Math.floor((width-this.padding.left - this.padding.right)/this.minBinWidth);

	this.timelines = [new timeline(0, [this.padding.left, width-this.padding.right], [new Date(Date.UTC(2013, 02, 15, 00, 00, 00)), new Date(Date.UTC(2013, 02, 22, 00, 00, 00))], height/4, this.padding),
	                  new timeline(1, [this.padding.left, width-this.padding.right], [new Date(Date.UTC(2013, 02, 22, 00, 00, 00)), new Date(Date.UTC(2013, 02, 29, 00, 00, 00))], height/4, this.padding),
	                  new timeline(2, [this.padding.left, width-this.padding.right], [new Date(Date.UTC(2013, 02, 29, 00, 00, 00)), new Date(Date.UTC(2013, 03, 05, 00, 00, 00))], height/4, this.padding),
	                  new timeline(3, [this.padding.left, width-this.padding.right], [new Date(Date.UTC(2013, 03, 05, 00, 00, 00)), new Date(Date.UTC(2013, 03, 12, 00, 00 ,00))], height/4, this.padding)];
}

function requestAllTimelines(){
	for (var i = 0; i < timelineGlobals.timelines.length; i++){
		requestTimelineEvents(timelineGlobals.timelines[i].getStart(),
				timelineGlobals.timelines[i].getEnd(), timelineGlobals.maxBins, timelineGlobals.timelines[i]);
	};
}

function requestTimelineEvents(startTime, endTime, maxBins, timeline, server) {
	timeline.updateTimeline(startTime, endTime);
	var dat;
	if (arguments.length == 5) {
		 dat = {
					"startTime" : startTime,
					"endTime" : endTime,
					"maxBins" : maxBins,
					"binLength" : timelineGlobals.binLength,
					"serverName" : server
				};
	} else {
		 dat = {
					"startTime" : startTime,
					"endTime" : endTime,
					"maxBins" : maxBins,
					"binLength" : timelineGlobals.binLength
				};
	}

	$.post("getEntries", dat, function(data, textStatus, jqXHR){
		if (jqXHR.status == 200) {
			var json = JSON.parse(data, datify);
			if (timelineGlobals.binLength != json[0].endTime.getTime() - json[0].startTime.getTime()){
				timelineGlobals.binLength = json[0].endTime.getTime() - json[0].startTime.getTime();
			}
			timeline.renderBins(json);
		} else if (jqXHR.status = 204) {
			timeline.renderBins([]);
		} else {
			alert(textStatus);
		};
	}, "text");
}

function datify(key, value){
	if (key.indexOf("Time") != -1 || key.indexOf("time") != -1){
		return new Date(Number(value));
	};
	return value;
}

function timeline(idx, range, domain, height, padding){
	var rowY = height * idx;
	var xScaler = d3.time.scale.utc().domain(domain).range(range);
	var yScaler = d3.scale.linear().range([height-padding.vertical, padding.vertical]);
	var binHeight = height-padding.vertical;
	var selection = d3.select("#time")
		.append("svg:g")
		.attr("id", "timeline" + idx)
		.attr("transform", "translate(0, " + rowY + ")");

	this.updateTimeline = function(startTime, endTime){
		xScaler.domain([new Date(startTime), new Date(endTime)]);
	};

	this.updateHeight = function(height){
		rowY = height * idx;
		binHeight = height-timelineGlobals.padding.vertical;
		yScaler = yScaler.range([height-timelineGlobals.padding.vertical, timelineGlobals.padding.vertical]);
	};

	this.updateWidth = function(width){
		xScaler = xScaler.range([timelineGlobals.padding.left, width-timelineGlobals.padding.right]);
	};

	this.getStart = function(){
		return xScaler.domain()[0].getTime();
	};

	this.getEnd = function(){
		return xScaler.domain()[1].getTime();
	};

	this.renderBins = function(element) {
		//TODO create scale indicator as small box to left of timeline.
		//use log scale as only needs to be indicative of relative weight.
		yScaler.domain([0, d3.max(element, function(d){ return d.subElemCount;})]);

		var thisLine = selection.selectAll(".bin")
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
			.attr("height", function(d, i){ return binHeight - yScaler(d.failedConn);})
			.attr("y", function(d, i){return yScaler(d.failedConn);});

		thisLine.selectAll(".binAccepted")
			.data(function(d){return[d];})
			.enter()
			.append("svg:rect")
			.attr("class", "binAccepted");
		thisLine.selectAll(".binAccepted")
			.attr("width", getEventWidth)
			.attr("height", function(d){return binHeight - yScaler(d.acceptedConn);})
			.attr("y",	function(d){return yScaler(d.subElemCount);});


		thisLine.selectAll(".binDivider")
			.data(function(d){return [d];})
			.enter()
			.append("svg:rect")
			.attr("class", "binDivider");
		thisLine.selectAll(".binDivider")
			.attr("width", getEventWidth)
			.attr("height", function(d){return binHeight - yScaler(d.subElemCount - d.acceptedConn - d.failedConn);})
			.attr("y", function(d){return yScaler(d.subElemCount - d.acceptedConn);});

		thisLine.exit().remove();

		var xAxis = d3.svg.axis()
    		.scale(xScaler)
    		.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(yScaler)
			.orient("left")
			.ticks(4)
			.tickFormat(yScaler.tickFormat(4, ".1s"));

		if (selection.select("#xAxis").empty()){
			selection.append("svg:g")
			.attr("class", "axis")
			.attr("id", "xAxis");
		};
		selection.select("#xAxis")
	 		.attr("transform", "translate(0, " + binHeight + ")")
	 		.call(xAxis);

		if (selection.select("#yAxis").empty()){
			selection.append("svg:g")
			.attr("class", "axis")
			.attr("id", "yAxis");
		};
		selection.select("#yAxis")
			.attr("transform", "translate(" + timelineGlobals.padding.left + ", 0)")
			.call(yAxis);
	};

	this.redrawBins = function(width, height){
		rowY = height * idx;
		binHeight = height - padding.vertical;
		xScaler = xScaler.range([timelineGlobals.padding.left, width-timelineGlobals.padding.right]);
		yScaler = yScaler.range([height-timelineGlobals.padding.vertical, timelineGlobals.padding.vertical]);

		selection.attr("transform", "translate(0, " + rowY + ")");
		var thisLine = selection.selectAll(".bin")
			.on("mouseover", showToolTip)
			.on("mouseout", hideToolTip)
			.on("dblclick", zoomElem)
			.attr("transform", getEventCoords);

		thisLine.selectAll(".binFailed")
		.attr("width", getEventWidth)
		.attr("height", function(d, i){ return binHeight - yScaler(d.failedConn);})
		.attr("y", function(d, i){return yScaler(d.failedConn);});

		thisLine.selectAll(".binAccepted")
		.attr("width", getEventWidth)
		.attr("height", function(d){return binHeight - yScaler(d.acceptedConn);})
		.attr("y",	function(d){return yScaler(d.subElemCount);});

		thisLine.selectAll(".binDivider")
		.attr("width", getEventWidth)
		.attr("height", function(d){return binHeight - yScaler(d.subElemCount - d.acceptedConn - d.failedConn);})
		.attr("y", function(d){return yScaler(d.subElemCount - d.acceptedConn);});

		var xAxis = d3.svg.axis()
		.scale(xScaler)
		.orient("bottom");

		var yAxis = d3.svg.axis()
		.scale(yScaler)
		.orient("left")
		.ticks(4)
		.tickFormat(yScaler.tickFormat(4, ".2s"));

		selection.select("#xAxis")
 		.attr("transform", "translate(0, " + binHeight + ")")
 		.call(xAxis);

		selection.select("#yAxis")
		.attr("transform", "translate(" + timelineGlobals.padding.left + ", 0)")
		.call(yAxis);
	};

	function getEventCoords(d, i){
		return "translate(" + xScaler(getXforEvent(d, i)) + ", 0)";
	}

	function getXforEvent(d, i) {
		if (d.hasOwnProperty("startTime")){
			return d.startTime;
		} else {
			return d.time;
		}
	}

	function getEventWidth(d, i){
		if (d.endTime === d.startTime){
			return timelineGlobals.minBinWidth;
		} else {
			return xScaler(d.endTime) - xScaler(d.startTime);
		}
	}

}

function zoomElem(d, i){
	if (d.elem != null) {
		alert("Can't zoom in on a single event");
		return;
	} else if ((d.endTime.getTime() - d.startTime.getTime()) == timelineGlobals.timeUnits.second) {
		alert("Data limited to 1 second blocks, cannot zoom in further");
		return;
	}
	performZoom(d.startTime.getTime(), d.endTime.getTime(), splitTimeBlock(timelineGlobals.binLength));
}

function performZoom(startTime, endTime, binLength, server){
	var url;
	var location = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
	location = encodeURIComponent(location);
	if (server != undefined && server != null && server != ""){
		timelineGlobals.server = server;
	}
	if (timelineGlobals.server != undefined && timelineGlobals.server != null) {
		url = location + "?startTime=" + encodeURIComponent(startTime) + "&endTime=" + encodeURIComponent(endTime) + "&binLength=" + encodeURIComponent(binLength) + "&serverName=" + encodeURIComponent(timelineGlobals.server);
	} else {
		url = location + "?startTime=" + encodeURIComponent(startTime) + "&endTime=" + encodeURIComponent(endTime) + "&binLength=" + encodeURIComponent(binLength);
	}
	//TODO generate bookmark metadata if possible.
	if (url != History.getState().url.substring(History.getState().url.lastIndexOf("/") + 1)){ //not an attempt to zoom back to where we are now.
		window.History.pushState(null, null, url);
		$("#universe").slider("option", "step", binLength);
		$("#universe").slider("values", [startTime, endTime]);
		zoom(startTime, endTime, binLength, timelineGlobals.server);
	};
}

function loadDataFromHistory(){
	var state = History.getState();
	var url = state.url.substring(state.url.lastIndexOf("?") + 1);
	if (url != null && url != undefined && url != state.url){
		var data = getObjFromQueryString(url);
		var start = parseInt(data.startTime);
		var end = parseInt(data.endTime);
		var length = parseInt(data.binLength);
		performZoom(start, end, length, data.server);
	};
}

function zoom(startTime, endTime, binLength, server){
	/*if (startTime == timelineGlobals.timelines[0].getStart() &&
		endTime == timelineGlobals.timelines[timelineGlobals.timelines.length - 1].getEnd() &&
		binLength == timelineGlobals.binLength &&
		server == timelineGlobals.server){
		return; //we're zooming back to here, prevent an infinite loop.
	} else {
		/*these functions really belong elsewhere :/*/
		timelineGlobals.binLength = binLength;
		if (server != undefined && server != null){
			timelineGlobals.server = server;
		}
		var chunk = (endTime - startTime)/timelineGlobals.timelines.length;
		var currentTime = startTime;
		var starts , ends;
		for (var i = 0; i < timelineGlobals.timelines.length; i++){
			starts = currentTime;
			currentTime += chunk;
			ends = currentTime;
			timelineGlobals.timelines[i].updateTimeline(starts, ends);
		};
	//};
	requestAllTimelines();
}

function showToolTip(d) {
	var selection = d3.select(".tooltip");
	selection = selection.style("left", (d3.event.pageX + 10) + "px");
	selection = selection.style("top", d3.event.pageY + "px");
	var html;
	if (d.elem == null){
		html = "Start Time: " + d.startTime.toUTCString() + "<br>" +
			"End Time: " + d.endTime.toUTCString() + "<br>" +
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
			} else if (prop == "time") {
				text += prop + ": " + elem[prop].toUTCString() + "<br>";
			}else {
				text += prop + ": " + elem[prop] + "<br>";
			};
		};
	};
	return text;
}
function hideToolTip(d) {
	d3.select(".tooltip").transition().duration(200).style("opacity", 0);
}