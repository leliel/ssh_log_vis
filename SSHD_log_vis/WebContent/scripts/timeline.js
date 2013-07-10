var timelineGlobals;

function TimeUnits() {
		this.second = 1000;
		this.minute = 60 * this.second; // milliseconds in a minute.
		this.hour = 60 * this.minute; // milliseconds in an hour.
		this.day = 24 * this.hour; // milliseconds in a day.
		this.week = 7 * this.day; // milliseconds in a week.
		this.month = 4 * this.week; //milliseconds in a standard month(28 days)
}

function zoomLevel(start, end, length) {
	this.startTime = start;
	this.endTime = end;
	this.binLength = length;
}

function Globals(width, height){
	this.timeUnits = new TimeUnits();
	this.binLength = this.timeUnits.day;
	this.minBinWidth = 30;
	var numLines = 4;
	this.rowHeight = height/numLines;
	this.padding = {
			vertical : 20,
			left : 25,
			right : 20
	};
	this.maxBins = Math.floor((width-this.padding.left - this.padding.right)/this.minBinWidth);
	this.binHeight = this.rowHeight;

	this.timelines = [new timeline(0, [this.padding.left, width-this.padding.right], [new Date(2013, 02, 15, 00, 00, 00), new Date(2013, 02, 22, 00, 00, 00)], this.binHeight, this.padding),
	                  new timeline(1, [this.padding.left, width-this.padding.right], [new Date(2013, 02, 22, 00, 00, 00), new Date (2013, 02, 29, 00, 00, 00)], this.binHeight, this.padding),
	                  new timeline(2, [this.padding.left, width-this.padding.right], [new Date(2013, 02, 29, 00, 00, 00), new Date(2013, 03, 05, 00, 00, 00)], this.binHeight, this.padding),
	                  new timeline(3, [this.padding.left, width-this.padding.right], [new Date(2013, 03, 05, 00, 00, 00), new Date(2013, 03, 12, 00, 00 ,00)], this.binHeight, this.padding)];
	
	this.history = new Array();
}

function requestAllTimelines(){
	for (var i = 0; i < timelineGlobals.timelines.length; i++){
		requestTimelineEvents(timelineGlobals.timelines[i].getStart(),
				timelineGlobals.timelines[i].getEnd(), timelineGlobals.maxBins, timelineGlobals.timelines[i]);
	};
}


function requestTimelineEvents(startTime, endTime, maxBins, timeline) {
	var data = "startTime=" + startTime + "&endTime=" + endTime + "&maxBins="
			+ maxBins + "&binLength=" + timelineGlobals.binLength;
	timeline.updateTimeline(startTime, endTime);
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
						timeline.renderBins(text);
					} else if (response.status = 204) {
						timeline.renderBins([]);
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

function timeline(idx, range, domain, height, padding){
	var pad = padding;
	var rowY = height * idx;
	var xScaler = d3.time.scale().domain(domain).range(range);
	var yScaler = d3.scale.linear().range([height-pad.vertical, pad.vertical]);
	var binHeight = height-pad.vertical;
	var selection = d3.select("#time")
		.append("svg:g")
		.attr("id", "timeline" + idx)
		.attr("transform", "translate(0, " + rowY + ")");

	this.updateTimeline = function(startTime, endTime){
		xScaler.domain([new Date(startTime), new Date(endTime)]);
	};

	this.updateHeight = function(height){
		yScaler.range([height-pad.vertical, pad.vertical]);
	};

	this.updateWidth = function(width, padding){
		pad = padding;
		xScaler.range([pad.left, width-pad.right]);
	};

	this.getStart = function(){
		return xScaler.domain()[0].getTime();
	};

	this.getEnd = function(){
		return xScaler.domain()[1].getTime();
	};

	this.renderBins = function(element) {

		//TODO set sensible tick counts.
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
			.attr("height", function(d, i){ return binHeight - yScaler(d.failedConn + d.invalidAttempts);})
			.attr("y", function(d, i){return yScaler(d.failedConn + d.invalidAttempts);});

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
			.attr("height", function(d){return binHeight - yScaler(d.subElemCount - d.acceptedConn - d.failedConn - d.invalidAttempts);})
			.attr("y", function(d){return yScaler(d.subElemCount - d.acceptedConn);});

		thisLine.exit().remove();

		var xAxis = d3.svg.axis()
    		.scale(xScaler)
    		.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(yScaler)
			.orient("left")
			.ticks("4");

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
			.attr("transform", "translate(" + pad.left + ", 0)")
			.call(yAxis);
	};

	function getDividerY(d, i){
		var temp = getAcceptedPropAsY(d, i);
		var temp2 =  0.5*getNonConnectProp(d, i);
		return temp + temp2;
	}

	function getNonConnectProp(d, i){
		if (d.subElemCount != d.acceptedConn && d.subElemCount != d.failedConn && d.subElemCount != d.invalidAttempts) {
			var prop = (d.subElemCount - d.acceptedConn - d.failedConn - d.invalidAttempts)/d.subElemCount * binHeight;
			return prop > 2 ? prop : 2;
		} else {
			return 0;
		};
	}

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

	function getAcceptedPropAsY(d, i) {
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
	timelineGlobals.history.push(new zoomLevel(timelineGlobals.timelines[0].getStart(), 
			timelineGlobals.timelines[timelineGlobals.timelines.length -1].getEnd(), 
			timelineGlobals.binLength));
	zoom(startTime, endTime, binLength);
}

function performUnZoom(){
	var past = timelineGlobals.history.pop();
	if (past != null && past != undefined){
		zoom(past.startTime, past.endTime, past.binLength);
	};
}

function zoom(startTime, endTime, binLength){
	timelineGlobals.binLength = binLength;
	var chunk = (endTime - startTime)/timelineGlobals.timelines.length;
	var currentTime = startTime;
	var starts , ends;
	for (var i = 0; i < timelineGlobals.timelines.length; i++){
		starts = currentTime;
		currentTime += chunk;
		ends = currentTime;
		timelineGlobals.timelines[i].updateTimeline(starts, ends);
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