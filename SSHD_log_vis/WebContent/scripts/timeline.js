var timelineGlobals;

function TimeUnits() {
		this.seconds = 1000;
		this.minutes = 60 * this.seconds; // milliseconds in a minute.
		this.hours = 60 * this.minutes; // milliseconds in an hour.
		this.days = 24 * this.hours; // milliseconds in a day.
		this.weeks = 7 * this.days; // milliseconds in a week.
		this.months = 4 * this.weeks; //milliseconds in a standard month(28 days)
		this.years = 365 * this.days; //milliseconds in a standard year (365 days, ignores leapyears.)
}

function Globals(width, height){
	this.timeUnits = new TimeUnits();
	this.binLength = this.timeUnits.days;
	this.server = null;
	this.IP = null;
	this.user = null;
	this.universeStart = null;
	this.universeEnd = null;
	this.minBinWidth = 50;
	this.padding = {
			vertical : 20,
			left : 50,
			right : 20
	};
	this.colours = {
		accepted : "#0000ff",
		failed : "#ff0000",
		divider : "#000000",
		invalid : "#ff00ff"
	};
	this.maxBins = Math.floor((width-this.padding.left - this.padding.right)/this.minBinWidth);
	this.binHeight = (height/4)-this.padding.vertical;

	this.timelines = [new timeline(0, [this.padding.left, width-this.padding.right], [new Date(2013, 02, 15, 00, 00, 00), new Date(2013, 02, 22, 00, 00, 00)], height/4, this.padding),
	                  new timeline(1, [this.padding.left, width-this.padding.right], [new Date(2013, 02, 22, 00, 00, 00), new Date(2013, 02, 29, 00, 00, 00)], height/4, this.padding),
	                  new timeline(2, [this.padding.left, width-this.padding.right], [new Date(2013, 02, 29, 00, 00, 00), new Date(2013, 03, 05, 00, 00, 00)], height/4, this.padding),
	                  new timeline(3, [this.padding.left, width-this.padding.right], [new Date(2013, 03, 05, 00, 00, 00), new Date(2013, 03, 13, 00, 00 ,00)], height/4, this.padding)];
	this.maxima = new Array(4);

	this.renderIndicators = function (){
		var scale = d3.scale.log()
			.domain([1, d3.max(this.maxima, function(d, i){
				return d[0];
				})])
			.range([this.binHeight - this.padding.vertical, this.padding.vertical]);
		var selection = d3.select("#time")
			.selectAll(".timeline")
			.selectAll(".indicator");
		selection = selection.data(function(d, i){
			return timelineGlobals.maxima[i];
			});
		selection.enter()
			.append("svg:rect")
			.attr("class", "indicator")
			.attr("width", 15);
		selection.attr("y", function(d){
				return (d == 0) ? 0 : scale(d);})
			.attr("height", function(d){
				return (d == 0) ? 0 : timelineGlobals.binHeight - scale(d);});
	};

	this.requestAllTimelines = function (){
		this.maxima = new Array(4);
		for (var i = 0; i < timelineGlobals.timelines.length; i++){
			requestTimelineEvents(timelineGlobals.timelines[i].getStart(),
					timelineGlobals.timelines[i].getEnd(), timelineGlobals.maxBins, timelineGlobals.timelines[i]);
		};
	};

	function requestTimelineEvents(startTime, endTime, maxBins, timeline) {
		timeline.updateTimeline(startTime, endTime);
		var dat = {
			"startTime" : startTime,
			"endTime" : endTime,
			"maxBins" : maxBins,
			"binLength" : timelineGlobals.binLength,
		};
		if (timelineGlobals.server !== null) {
			 dat.serverName = timelineGlobals.server;
		}
		if (timelineGlobals.IP !== null) {
			dat.source = timelineGlobals.IP;
		}

		$.post("getEntries", dat, function(data, textStatus, jqXHR){
			if (jqXHR.status == 200) {
				var json = JSON.parse(data, datify);
				if (this.binLength != json[0].endTime.getTime() - json[0].startTime.getTime()){
					this.binLength = json[0].endTime.getTime() - json[0].startTime.getTime();
					setUITimeUnits(this.binLength);
				}
				timeline.renderBins(json);
				if(noUndefs(this.maxima)){
					timelineGlobals.renderIndicators();
				}
			} else if (jqXHR.status == 204) {
				timeline.renderBins([]);
				if(noUndefs(this.maxima)){
					timelineGlobals.renderIndicators();
				}
			} else {
				alert(textStatus);
			};
		}, "text");
	}

	function noUndefs(){
		for (var i = 0; i < timelineGlobals.maxima.length; i++){
			if (timelineGlobals.maxima[i] === undefined){
				return false;
			}
		}
		return true;
	}

	function datify(key, value){
		if (key === "startTime" || key === "endTime" || key === "time"){
			return new Date(Number(value));
		};
		return value;
	}

	this.zoomElem = function(d, i){
		if (d.elem != null) {
			alert("Can't zoom in on a single event");
			return;
		} else if ((d.endTime.getTime() - d.startTime.getTime()) == timelineGlobals.timeUnits.seconds) {
			var dat = {
					startTime : d.startTime.getTime(),
					endTime : d.endTime.getTime()
			};
			if (timelineGlobals.server !== null && timelineGlobals.server != ""){
				dat.serverName = timelineGlobals.server;
			}
			if (timelineGlobals.IP !== null && timelineGlobals.IP !== ""){
				dat.source = timelineGlobals.IP;
			}
			$.post("GetRawlines", dat, timelineGlobals.showRawlines, "json");
			return;
		} else {
			timelineGlobals.updateUIandZoom(d.startTime.getTime(), d.endTime.getTime(), splitTimeBlock(d.endTime.getTime() - d.startTime.getTime()));
		}
	};

	this.updateUIandZoom = function(start, end, length){
		var times = this.updateUI(start, end, length);
		this.performZoom(times[0], times[1], length);
	};

	this.updateUI = function(start, end, length){
		var reqLength = end - start;
		var univStart = timelineGlobals.universeStart - timelineGlobals.universeStart%reqLength;
		var univEnd = timelineGlobals.universeEnd + reqLength - timelineGlobals.universeEnd%reqLength;
		var univ = {
			max : univEnd,
			min : univStart,
			step : reqLength,
			values : [start, end]
		};
		$("#universe").dragslider("option", univ);
		univ = $("#universe").dragslider("values");
		$("#timelineStart").datetimepicker("setDate", new Date(start));
		$("#timelineEnd").datetimepicker("setDate", new Date(end));
		setUITimeUnits(length);
		if($("#servers").val() !== "" && $("#servers").val() != timelineGlobals.server){
			$("#servers").val(timelineGlobals.server);
		}
		if($("#IP").val() !== timelineGlobals.IP){
			$("#IP").val(timelineGlobals.IP);
		}
		return univ;
	};

	this.performZoom = function (startTime, endTime, binLength){
		var url;
		var location = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
		location = encodeURIComponent(location);
		url = location + "?startTime=" + encodeURIComponent(startTime) + "&endTime=" + encodeURIComponent(endTime) + "&binLength=" + encodeURIComponent(binLength);
		if (timelineGlobals.server !== null) {
			url += "&serverName=" + encodeURIComponent(timelineGlobals.server);
		}
		if(timelineGlobals.IP !== null){
			url += "&source=" + encodeURIComponent(timelineGlobals.IP);
		}
		if(timelineGlobals.user !== null){
			url += "&user=" + encodeURIComponent(timelineGlobals.user);
		}
		//TODO generate bookmark metadata -set title argument to a string.
		window.History.pushState(null, null, url);
	};

	this.loadDataFromHistory = function(e){
		var state = History.getState();
		var url = state.url.substring(state.url.lastIndexOf("?") + 1);
		if (url != state.url){
			var data = getObjFromQueryString(url);
			var start = parseInt(data.startTime);
			var end = parseInt(data.endTime);
			var length = parseInt(data.binLength);
			if (data.serverName !== undefined && data.serverName !== timelineGlobals.server){
				timelineGlobals.server = data.serverName;
			}
			if (data.source !== undefined && data.source !== timelineGlobals.IP){
				timelineGlobals.IP = data.source;
			}
			if (data.user !== undefined && data.user !== timelineGlobals.user){
				timelineGlobals.user = data.user;
			}
			var times = timelineGlobals.updateUI(start, end, length);
			timelineGlobals.zoom(times[0], times[1], length);
		} else {
			window.location.reload(true);
		};
	};

	this.zoom = function (startTime, endTime, binLength){
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
		timelineGlobals.requestAllTimelines();
	};

	this.showRawlines = function(data, textStatus, jqXHR){
		if (jqXHR.status == 204){
			alert("No log entries in this time period");
		} else if (jqXHR.status == 200) {
			var tooltip = $("#rawLines");
			tooltip.empty();
					for (var e in data){
				tooltip.append("<span id=line" + data[e].id + ">" + data[e].id + " : " + data[e].rawLine + "</span><br>");
				//$("#line"+data[e].id).on("dblclick", addComment); //removed to disable commenting for evaluation.
			}
			tooltip.dialog("open");
		}
	};

	this.showToolTip = function(d) {
		var selection = d3.select("#tooltip");
		selection = selection.style("left", (d3.event.pageX + 10) + "px");
		selection = selection.style("top", d3.event.pageY + "px");
		var html;
		if (d.elem == null){
			html = "Start Time: " + d.startTime.toString() + "<br>" +
				"End Time: " + d.endTime.toString() + "<br>" +
				"Accepted Connections: " + d.acceptedConn + "<br>" +
				"Failed Connections: " + d.failedConn + "<br>" +
				"Invalid Usernames: " + d.invalidAttempts + "<br>" +
				"Total events: " + d.subElemCount + "<br>";
				if (d.flags != undefined && d.flags != null){
					if (d.flags.T !== undefined) {
						html += "Unusual Times: " + d.flags.T + "<br>";
					}
					if (d.flags.L !== undefined) {
						html += "Unusual Places: " + d.flags.L + "<br>";
					}
					if (d.flags.R !== undefined) {
						html += "Failed Root Logins: " + d.flags.R + "<br>";
					}
					if (d.flags.E !== undefined) {
						html += "Server Errors: " + d.flags.E + "<br>";
					}
				}
		} else {
			html = timelineGlobals.tooltipText(d.elem);
		}
		selection.html(html);
		selection.transition().duration(200).style("opacity", .9);
	};

	this.tooltipText = function(elem){
		/*var text = "";
		for (var prop in elem){
			if (elem.hasOwnProperty(prop) && prop != "rawLine"){
				if (prop == "server"){
					text += prop + ": " + elem[prop].name + "<br>";
				} else if (prop == "time") {
					text += prop + ": " + elem[prop].toString() + "<br>";
				} else if (prop === "freqTime" || prop === "freqLoc"){
					text += (elem[prop] != "0") ? prop + ": true<br>" : prop + ": false<br>";
				} else {
					text += prop + ": " + elem[prop] + "<br>";
				};
			};
		};*/
		return elem.rawLine;
	};

	this.hideToolTip = function (d) {
		d3.select("#tooltip").transition().duration(200).style("opacity", 0);
	};
}

function timeline(idx, range, domain, height, padding){
	var rowY = height * idx;
	var xScaler = d3.time.scale().domain(domain).range(range);
	var yScaler = d3.scale.linear().range([height-padding.vertical, padding.vertical]);
	var selection = d3.select("#time")
		.append("svg:g")
		.attr("class", "timeline")
		.attr("id", "timeline" + idx)
		.attr("transform", "translate(0, " + rowY + ")");

	this.updateTimeline = function(startTime, endTime){
		xScaler.domain([new Date(startTime), new Date(endTime)]);
	};

	this.updateHeight = function(height){
		rowY = height * idx;
		timelineGlobals.binHeight = height-timelineGlobals.padding.vertical;
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
		var max = d3.max(element, function(d){ return d.subElemCount;});
		timelineGlobals.maxima[idx] = (max === undefined) ? [0] : [max];
		yScaler.domain([0, max]);

		var thisLine = selection.selectAll(".bin")
			.data(element);
		thisLine.enter()
			.append("g")
			.attr("class", "bin");

		thisLine.attr("id",
			function(d) {
				return d.id;
			})
			.on("mouseover", timelineGlobals.showToolTip)
			.on("mouseout", timelineGlobals.hideToolTip)
			.on("dblclick", timelineGlobals.zoomElem)
			.attr("transform", getEventCoords);

		thisLine.selectAll(".binFailed")
			.data(function(d){
				return [{startTime : d.startTime,
						endTime : d.endTime,
						failedConn : d.failedConn}];
			})
			.enter()
			.append("svg:rect")
			.attr("class", "binFailed")
			.attr("fill", timelineGlobals.colours.failed);
		thisLine.selectAll(".binFailed")
			.attr("width", getEventWidth)
			.attr("height", function(d, i){
				return timelineGlobals.binHeight - yScaler(d.failedConn);})
			.attr("y", function(d, i){return yScaler(d.failedConn);});

		thisLine.selectAll(".binAccepted")
			.data(function(d){
				return[{startTime : d.startTime,
						endTime : d.endTime,
						acceptedConn : d.acceptedConn,
						subElemCount : d.subElemCount}];
			})
			.enter()
			.append("svg:rect")
			.attr("class", "binAccepted")
			.attr("fill", timelineGlobals.colours.accepted);
		thisLine.selectAll(".binAccepted")
			.attr("width", getEventWidth)
			.attr("height", function(d){
				return timelineGlobals.binHeight - yScaler(d.acceptedConn);})
			.attr("y",	function(d){return yScaler(d.subElemCount);});

		thisLine.selectAll(".binInvalid")
			.data(function(d){
				return [{
					startTime : d.startTime,
					endTime : d.endTime,
					invalidAttempts : d.invalidAttempts,
					failedConn : d.failedConn
				}];
			})
			.enter()
			.append("svg:rect")
			.attr("class", "binInvalid")
			.attr("fill", timelineGlobals.colours.invalid);
		thisLine.selectAll(".binInvalid")
			.attr("width", getEventWidth)
			.attr("height", function(d){
				return timelineGlobals.binHeight - yScaler(d.invalidAttempts);
			})
			.attr("y", function(d){
				return yScaler(d.failedConn + d.invalidAttempts);
			});

		thisLine.selectAll(".binDivider")
			.data(function(d){
				return [{
					startTime : d.startTime,
					endTime : d.endTime,
					other : d.other,
					subElemCount : d.subElemCount,
					acceptedConn : d.acceptedConn
				}];
			})
			.enter()
			.append("svg:rect")
			.attr("class", "binDivider")
			.attr("fill", timelineGlobals.colours.divider);
		thisLine.selectAll(".binDivider")
			.attr("width", getEventWidth)
			.attr("height", function(d){
				return timelineGlobals.binHeight - yScaler(d.other);})
			.attr("y", function(d){return yScaler(d.subElemCount - d.acceptedConn);});

		thisLine.selectAll(".flags")
			.data(function(d){
				return [{flags : d.flags,
						count : d.subElemCount,
						startTime : d.startTime,
						endTime : d.endTime}];
			})
			.enter()
			.append("svg:text")
			.attr("class", "flags");
		thisLine.selectAll(".flags")
			.attr("y", function(d){return yScaler(d.count)-2;})//-2 offset to float above bin by a small margin
			.text(buildText)
			.attr("textLength", function(d){
				if (this.getComputedTextLength() > getEventWidth(d)){
					return getEventWidth(d);
				} else {
					return this.getComputedTextLength();
				}
			})
			.attr("lengthAdjust", "spacingAndGlyphs");

		thisLine.exit().remove();

		var xAxis = d3.svg.axis()
    		.scale(xScaler)
    		.orient("bottom");

		var format = (max >= 1000) ? ".2s" : ",d";
		var yAxis = d3.svg.axis()
			.scale(yScaler)
			.orient("left")
			.ticks(4)
			.tickFormat(yScaler.tickFormat(4, format));

		if (selection.select("#xAxis").empty()){
			selection.append("svg:g")
			.attr("class", "axis")
			.attr("id", "xAxis");
		};
		selection.select("#xAxis")
	 		.attr("transform", "translate(0, " + timelineGlobals.binHeight + ")")
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
			.on("mouseover", timelineGlobals.showToolTip)
			.on("mouseout", timelineGlobals.hideToolTip)
			.on("dblclick", timelineGlobals.zoomElem)
			.attr("transform", getEventCoords);

		thisLine.selectAll(".binFailed")
		.attr("width", getEventWidth)
		.attr("height", function(d, i){ return timelineGlobals.binHeight - yScaler(d.failedConn);})
		.attr("y", function(d, i){return yScaler(d.failedConn);});

		thisLine.selectAll(".binAccepted")
		.attr("width", getEventWidth)
		.attr("height", function(d){return timelineGlobals.binHeight - yScaler(d.acceptedConn);})
		.attr("y",	function(d){return yScaler(d.subElemCount);});

		thisLine.selectAll(".binDivider")
		.attr("width", getEventWidth)
		.attr("height", function(d){return timelineGlobals.binHeight - yScaler(d.subElemCount - d.acceptedConn - d.failedConn);})
		.attr("y", function(d){return yScaler(d.subElemCount - d.acceptedConn);});

		thisLine.selectAll(".binInvalid")
		.attr("width", getEventWidth)
		.attr("height", function(d){return timelineGlobals.binHeight - yScaler(d.invalidAttempt);})
		.attr("y", function(d){return yScaler(d.failedConn + d.invalidAttempt);});

		thisLine.selectAll(".flags")
		.attr("y", function(d){return yScaler(d.count)-2;}); //-2 offset to float above bin by a small margin

		var xAxis = d3.svg.axis()
		.scale(xScaler)
		.orient("bottom");

		var yAxis = d3.svg.axis()
		.scale(yScaler)
		.orient("left")
		.ticks(4)
		.tickFormat(yScaler.tickFormat(4, ",d"));

		selection.select("#xAxis")
 		.attr("transform", "translate(0, " + timelineGlobals.binHeight + ")")
 		.call(xAxis);

		selection.select("#yAxis")
		.attr("transform", "translate(" + timelineGlobals.padding.left + ", 0)")
		.call(yAxis);
	};

	function buildText(d, i){
		var res = "";
		for (var t in d.flags){
			res += t + ": " + d.flags[t] + " ";
		}
		return res.trim();
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
		return xScaler(d.endTime) - xScaler(d.startTime);
	}
}

