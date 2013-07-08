var timelineGlobals;

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
	this.binLength = this.timeUnits.day;
	this.minBinWidth = 30;
	this.padding = 20;
	this.maxBins = Math.floor((width-this.padding*2)/this.minBinWidth);
	this.numLines = 4;
	this.rowHeight = height/this.numLines;
	this.binHeight = this.rowHeight - 10;
	
	this.timelines = [new timeline(0, [this.padding, width-this.padding], [new Date(2013, 02, 15, 00, 00, 00), new Date(2013, 02, 22, 00, 00, 00)], this.binHeight),
	                  new timeline(1, [this.padding, width-this.padding], [new Date(2013, 02, 22, 00, 00, 00), new Date (2013, 02, 29, 00, 00, 00)], this.binHeight),
	                  new timeline(2, [this.padding, width-this.padding], [new Date(2013, 02, 29, 00, 00, 00), new Date(2013, 03, 05, 00, 00, 00)], this.binHeight),
	                  new timeline(3, [this.padding, width-this.padding], [new Date(2013, 03, 05, 00, 00, 00), new Date(2013, 03, 12, 00, 00 ,00)], this.binHeight)];
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

function timeline(idx, range, domain, height){
	var rowY = height * idx;
	var xScaler = d3.time.scale().domain(domain).range(range);
	var yScaler = d3.time.scale().range([height-10, 0]);
	var binHeight = height-10;
	var selection = d3.select("#time")
		.append("svg:g")
		.attr("id", "timeline" + idx); 
	
	this.updateTimeline = function(startTime, endTime){
		xScaler.domain([new Date(startTime), new Date(endTime)]);
	};
	
	this.updateHeight = function(height){
		yScaler.range([height-10, 0]);
	};
	
	this.updateWidth = function(width, padding){
		xScaler.range([padding, width-padding]);
	};
	
	this.getStart = function(){
		return xScaler.domain()[0].getTime();
	};
	
	this.getEnd = function(){
		return xScaler.domain()[1].getTime();
	};
	
	this.renderBins = function(element) {

		//update yScale domain;
		yScaler.domain(d3.extent(element, function(d){ return d.subElemCount;}));
		
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
			.attr("height", function(d, i){ return yScaler(d.subElemCount);})
			.attr("y", function(d, i){
				return binHeight - yScaler(d.subElemCount);});

		thisLine.selectAll(".binAccepted")
			.data(function(d){return[d];})
			.enter()
			.append("svg:rect")
			.attr("class", "binAccepted");
		thisLine.selectAll(".binAccepted")
			.attr("width", getEventWidth)
			.attr("height", function(d){ return binHeight;})
			.attr("y",	function(d){
				return binHeight - getAcceptedPropAsY(d);});


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
    		.scale(xScaler)
    		.orient("bottom");
		if (selection.select(".axis").empty()){
			selection.append("g")
			.attr("class", "axis");
		};
		selection.select(".axis")
	 		.attr("transform", "translate(0, " + (rowY + binHeight) + ")")
	 		.call(axis);
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
		return "translate(" + xScaler(getXforEvent(d, i)) + "," + rowY + ")";
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
	timelineGlobals.binLength = binLength;
	var chunk = (endTime - startTime)/timelineGlobals.numLines;
	var currentTime = startTime;
	var starts , ends;
	for (var i = 0; i < timelineGlobals.numLines; i++){
		starts = currentTime;
		currentTime += chunk;
		ends = currentTime;
		timelineGlobals.timelines[i].updateTimeLine(starts, ends);
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