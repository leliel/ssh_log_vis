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
	this.display = {
			acceptedConn : true,
			failedConn : true,
			invalidAttempts : true,
			other : true
	};
	this.dataset = 1;
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
		if (timelineGlobals.user !== null){
			dat.user = timelineGlobals.user;
		}
		if (timelineGlobals.dataset !== null){
			dat.dataset = timelineGlobals.dataset;
		}

		$.get("getEntries", dat, function(data, textStatus, jqXHR){
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
			if (timelineGlobals.server !== null){
				dat.serverName = timelineGlobals.server;
			}
			if (timelineGlobals.IP !== null){
				dat.source = timelineGlobals.IP;
			}
			if (timelineGlobals.user !== null){
				dat.user = timelineGlobals.user;
			}
			if (timelineGlobals.dataset !== null){
				dat.dataset = timelineGlobals.dataset;
			}
			$.get("GetRawlines", dat, timelineGlobals.showRawlines, "json");
			return;
		} else {
			timelineGlobals.updateUIandZoom(d.startTime.getTime(), d.endTime.getTime(), splitTimeBlock(d.endTime.getTime() - d.startTime.getTime()));
		}
	};

	this.updateUIandZoom = function(start, end, length){
		var times = this.updateUI(start, end, length);
		this.performZoom(times[0], times[1], length);
	};

	function setUnivEnd(end, reqLength){
		var univEnd = timelineGlobals.universeEnd;
		if (univEnd <= end){
			return end;
		} else {
			if ((univEnd - end)%reqLength !== 0){
				var newEnd = end;
				while (newEnd < univEnd){
					newEnd += reqLength;
				}
				return newEnd;
			} else {
				return univEnd;
			}
		}
	}

	function setUnivStart(start, reqLength){
		var univStart = timelineGlobals.universeStart;
		if (start <= univStart){
			return start;
		} else {
			if ((start - univStart)%reqLength !== 0){
				var newStart = start;
				while (newStart > univStart){
					newStart -= reqLength;
				}
				return newStart;
			} else {
				return univStart;
			}
		}
	}

	this.updateUI = function(start, end, length){
		var reqLength = end - start;
		var univStart = setUnivStart(start, reqLength);
		var univEnd = setUnivEnd(end, reqLength);
		var univ = {
			max : univEnd,
			min : univStart,
			step : reqLength,
			values : [start, end]
		};
		$("#universe").dragslider("option", univ);
		var realStarts = $("#universe").dragslider("values");
		$("#timelineStart").datetimepicker("setDate", new Date(realStarts[0]));
		$("#timelineEnd").datetimepicker("setDate", new Date(realStarts[1]));
		setUITimeUnits(length);
		if($("#servers").val() !== "" && $("#servers").val() != timelineGlobals.server){
			$("#servers").val(timelineGlobals.server);
		}
		if($("#IP").val() !== timelineGlobals.IP){
			$("#IP").val(timelineGlobals.IP);
		}
		if($("#user").val() !== timelineGlobals.user){
			$("#user").val(timelineGlobals.user);
		}
		if($("#acceptedConn").prop("checked") !== timelineGlobals.display.acceptedConn){
			$("#acceptedConn").prop("checked", timelineGlobals.display.acceptedConn);
		}
		if($("#failedConn").prop("checked") !== timelineGlobals.display.failedConn){
			$("#failedConn").prop("checked", timelineGlobals.display.failedConn);
		}
		if($("#invalidAttempts").prop("checked") !== timelineGlobals.display.invalidAttempts){
			$("#invalidAttempts").prop("checked", timelineGlobals.display.invalidAttempts);
		}
		if($("#other").prop("checked") !== timelineGlobals.display.other){
			$("#other").prop("checked", timelineGlobals.display.other);
		}
		$("[name=dataset]").filter("[value='"+timelineGlobals.dataset +"']").prop("checked", true);
		return realStarts;
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
		var types = "";
		for (var prop in timelineGlobals.display){
			if(!timelineGlobals.display[prop]){
				types += prop.substring(0, 1);
			}
		}
		if (types !== ""){
			url += "&types=" + encodeURIComponent(types);
		}
		if (timelineGlobals.dataset !== undefined){
			url += "&dataset=" + encodeURIComponent(timelineGlobals.dataset);
		}
		//TODO generate bookmark metadata -set title argument to a string.
		History.pushState(null, null, url);
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
			if (data.types !== undefined) {
				if (data.types.indexOf("a") != -1){
					timelineGlobals.display.acceptedConn = false;
				}
				if (data.types.indexOf("f") != -1){
					timelineGlobals.display.failedConn = false;
				}
				if (data.types.indexOf("i") != -1){
					timelineGlobals.display.invalidAttempts = false;
				}
				if (data.types.indexOf("o") != -1){
					timelineGlobals.display.other = false;
				}
			}
			if (data.dataset != undefined) {
				timelineGlobals.dataset = data.dataset;
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

	 function subElemSum(d){
		 var sum = 0;
		 for (var prop in timelineGlobals.display){
			 if (timelineGlobals.display[prop]){
				 sum += d[prop];
			 }
		 }
		 d.displayTotals = sum;
	 }

	 this.updateDisplays = function(){
		selection.selectAll(".bin")
		 	.each(updateDatum);
		if (timelineGlobals.maxima[idx] === undefined) {
			timelineGlobals.maxima[idx] = [0];
		}
		var domain = [0, timelineGlobals.maxima[idx][0]];
		yScaler.domain(domain);
		selection.selectAll("rect")
		 	.each(subElemSum);

		placeRectsandAxes(domain[1]);

	 };

	 function placeRectsandAxes(max){
			selection.selectAll(".binAccepted")
			.attr("width", getEventWidth)
			.attr("height", function(d){
				return timelineGlobals.binHeight - yScaler((timelineGlobals.display.acceptedConn) ? d.acceptedConn : 0);})
			.attr("y",	function(d){return yScaler(d.displayTotals);});

		selection.selectAll(".binFailed")
			.attr("width", getEventWidth)
			.attr("height", function(d, i){
				return timelineGlobals.binHeight - yScaler((timelineGlobals.display.failedConn) ? d.failedConn : 0);})
			.attr("y", function(d, i){
				return yScaler((timelineGlobals.display.failedConn) ? d.failedConn : 0);});

		selection.selectAll(".binInvalid")
			.attr("width", getEventWidth)
			.attr("height", function(d){
				return timelineGlobals.binHeight - yScaler((timelineGlobals.display.invalidAttempts) ? d.invalidAttempts : 0);
			})
			.attr("y", function(d){
				return yScaler(((timelineGlobals.display.failedConn) ? d.failedConn : 0) + ((timelineGlobals.display.invalidAttempts) ? d.invalidAttempts : 0));
			});

		selection.selectAll(".binDivider")
			.attr("width", getEventWidth)
			.attr("height", function(d){
				return timelineGlobals.binHeight - yScaler((timelineGlobals.display.other) ? d.other : 0);})
			.attr("y", function(d){return yScaler(d.displayTotals - ((timelineGlobals.display.acceptedConn) ? d.acceptedConn : 0));});

		selection.selectAll(".flags")
			.attr("y", function(d){return yScaler(d.displayTotals)-2;})//-2 offset to float above bin by a small margin
			.text(buildText);

		var xAxis = d3.svg.axis()
		.scale(xScaler)
		.orient("bottom");

		var format = (max >= 1000) ? ".2s" : ",d";
		var yAxis = d3.svg.axis()
			.scale(yScaler)
			.orient("left")
			.ticks(4)
			.tickFormat(yScaler.tickFormat(4, format));

		selection.select("#xAxis")
 		.attr("transform", "translate(0, " + timelineGlobals.binHeight + ")")
 		.call(xAxis);

		selection.select("#yAxis")
		.attr("transform", "translate(" + timelineGlobals.padding.left + ", 0)")
		.call(yAxis);
	 }

	 function updateDatum(d, i){
		subElemSum(d);
		if (timelineGlobals.maxima[idx] === undefined || d.displayTotals > timelineGlobals.maxima[idx]){
			timelineGlobals.maxima[idx] = [d.displayTotals];
		}
	 }

	this.renderBins = function(element) {
		var max = d3.max(element, function(d){ subElemSum(d); return d.displayTotals;});
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
				return [d];
			})
			.enter()
			.append("svg:rect")
			.attr("class", "binFailed")
			.attr("fill", timelineGlobals.colours.failed);

		thisLine.selectAll(".binAccepted")
			.data(function(d){
				return[d];
			})
			.enter()
			.append("svg:rect")
			.attr("class", "binAccepted")
			.attr("fill", timelineGlobals.colours.accepted);

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


		thisLine.selectAll(".binDivider")
			.data(function(d){
				return [d];
			})
			.enter()
			.append("svg:rect")
			.attr("class", "binDivider")
			.attr("fill", timelineGlobals.colours.divider);

		thisLine.selectAll(".flags")
			.data(function(d){
				return [d];
			})
			.enter()
			.append("svg:text")
			.attr("class", "flags");

		thisLine.exit().remove();

		if (selection.select("#xAxis").empty()){
			selection.append("svg:g")
			.attr("class", "axis")
			.attr("id", "xAxis");
		};

		if (selection.select("#yAxis").empty()){
			selection.append("svg:g")
			.attr("class", "axis")
			.attr("id", "yAxis");
		};

		placeRectsandAxes(max);
	};

	this.redrawBins = function(width, height){
		rowY = height * idx;
		xScaler = xScaler.range([timelineGlobals.padding.left, width-timelineGlobals.padding.right]);
		yScaler = yScaler.range([height-timelineGlobals.padding.vertical, timelineGlobals.padding.vertical]);

		selection.attr("transform", "translate(0, " + rowY + ")");
		selection.selectAll(".bin")
			.on("mouseover", timelineGlobals.showToolTip)
			.on("mouseout", timelineGlobals.hideToolTip)
			.on("dblclick", timelineGlobals.zoomElem)
			.attr("transform", getEventCoords);

		placeRectsandAxes(timelineGlobals.maxima[idx][0]);
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