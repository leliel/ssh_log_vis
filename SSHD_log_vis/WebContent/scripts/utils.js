window.onload = setupOnLoad;
window.onunload = tearDown;

function setupOnLoad() {

	$.ajax({
		type : "POST",
		async : true, // we really can't do anything else until we have the
						// universe :/
		url : "GetBeginAndEnd",
		data : "",
		success : function(data, textStatus, jqXHR) {
			initPage(parseInt(data.start), parseInt(data.end));
		},
		dataType : "json"
	});
	
	function setServer(event){
		if (this.value === ""){
			timelineGlobals.server = null;
		} else {
			timelineGlobals.server = this.value;
		}
	}
	
	$.post("GetServers", "", function(data, textStatus, jqXHR){
		if (jqXHR.status == 200){
			$("#servers").change(setServer);
			$("#servers").append($("<option />").val("").text("All Servers"));
			for (var d in data){
				$("#servers").append($("<option />").val(data[d].name).text(data[d].name));
			}
		}
	}, "json");
}

function tearDown() {
	$("#universe").dateRangeSlider("destroy");
}

function initPage(start, end) {
	timelineGlobals = new Globals(getPropertyNumberFromCSS(document
			.getElementById("time"), "width"), getPropertyNumberFromCSS(
			document.getElementById("time"), "height"));

	var debounce = $.debounce(50, function(event) {
		var times = $("#universe").dragslider("values");
		var start = times[0];
		var end = times[1];
		// TODO replace timepicker with one that works. existing timepicker does not handle DST or timezones at all properly.
		$("#timelineStart").datetimepicker("setDate", (new Date(start)).toUTCString());
		$("#timelineEnd").datetimepicker("setDate", (new Date(end)).toUTCString());
		if (event.originalEvent != undefined){
			performZoom(start, end, timelineGlobals.binLength,
					timelineGlobals.server);
		}
	});

	start -= start % timelineGlobals.binLength;
	end += timelineGlobals.binLength - end % timelineGlobals.binLength;

	$('#universe').dragslider({
		animate : true, // Works with animation.
		range : true, // Must have a range to drag.
		rangeDrag : true, // Enable range dragging.
		max : end,
		min : start,
		step : timelineGlobals.timeUnits.weeks,
		values : [ start, start + timelineGlobals.timeUnits.weeks ],
		change : debounce
	});

	$("#time").position({
		my : "left top",
		at : "right top+15",
		of : $("#controls")
	});

	$("#universe").position({
		my : "center bottom",
		at : "center top",
		of : $("#time")
	});

	$("#legend").position({
		my : "center bottom",
		at : "center bottom",
		of : $("#controls"),
		within : $("#controls")
	});

	$(window).resize(function() {
		$("#time").position({
			my : "left top",
			at : "right top",
			of : $("#controls")
		});

		$("#legend").position({// reposition legends
			my : "center bottom",
			at : "center bottom",
			of : $("#controls"),
			within : $("#controls")
		});

		var width = $("#time").width();
		var height = $("#time").height() / timelineGlobals.timelines.length;
		for ( var i in timelineGlobals.timelines) {
			timelineGlobals.timelines[i].redrawBins(width, height);
		}
	});

	$(window).on('statechange', loadDataFromHistory);

	var startTime = $("#timelineStart");
	startTime.datetimepicker({
		timeFormat : "HH:mm:ss Z",
        timezone: "z",
		showSeconds : true
	});

	var endTime = $("#timelineEnd");
	endTime.datetimepicker({
		timeFormat : "HH:mm:ss Z",
		timezone : "z",
		showSeconds : true
	});

	$("#zoomButton")
			.click(
					function() {
						var start = startTime.datetimepicker("getDate")
								.getTime();
						var end = endTime.datetimepicker('getDate').getTime();
						var unit = $("#timelineUnits").val();
						var binLength = $("#binLength").val()
								* timelineGlobals.timeUnits[unit];
						var reqLength = end - start;
						if ((reqLength/4)%binLength == 0) {
							$("#universe").dragslider("option", "step", end - start);
							$("#universe").dragslider("values", [ start, end ]);
							performZoom(start, end, binLength, timelineGlobals.server);
						}
						else {
							$("#timelineUnits").addClass("ui-state-error");
							$("#binLength").addClass("ui-state-error");
						}
					});

	var temp = $("#timelineUnits");
	$.each(timelineGlobals.timeUnits, function(key, value) {
		if (value == timelineGlobals.binLength) {
			temp.append($("<option />").val(key).text(key)).attr({
				'selected' : 'selected'
			});
		} else {
			temp.append($("<option />").val(key).text(key));
		}
	});

	if (window.location.search.length > 1) {
		var data = getObjFromQueryString(window.location.search);
		var start = parseInt(data.startTime);
		var end = parseInt(data.endTime);
		var length = parseInt(data.binLength);
		if (data.server != undefined && data.server != "") {
			timelineGlobals.server = data.server;
		}
		$("#universe").dragslider("option", "step", end - start);
		$("#universe").dragslider("values", [ start, end ]);
		performZoom(start, end, length, data.server);
	} else {
		var step = timelineGlobals.timelines[0].getEnd()
				- timelineGlobals.timelines[timelineGlobals.timelines.length -1].getStart();
		$("#universe").dragslider("option", "step", step);
		$("#universe").dragslider(
				"values",
				[ timelineGlobals.timelines[0].getStart(),
						timelineGlobals.timelines[timelineGlobals.timelines.length -1].getEnd() ]);
		performZoom(timelineGlobals.timelines[0].getStart(), 
				timelineGlobals.timelines[timelineGlobals.timelines.length-1].getEnd(),
				timelineGlobals.binLength, 
				timelineGlobals.server);
	}
}

function getObjFromQueryString(string) {
	var data = {};
	for ( var aItKey, nKeyId = 0, aCouples = window.location.search.substr(1)
			.split("&"); nKeyId < aCouples.length; nKeyId++) {
		aItKey = aCouples[nKeyId].split("=");
		data[unescape(aItKey[0])] = aItKey.length > 1 ? unescape(aItKey[1])
				: "";
	}
	return data;
}

function getPropertyNumberFromCSS(element, propertyName) {
	var css = window.getComputedStyle(element);
	var ans = parseInt(css.getPropertyValue(propertyName));
	return ans;
}

function splitTimeBlock(block) {
	if (block === timelineGlobals.timeUnits.months) {
		return timelineGlobals.timeUnits.weeks;
	} else if (block === timelineGlobals.timeUnits.weeks) {
		return timelineGlobals.timeUnits.days;
	} else if (block === timelineGlobals.timeUnits.days) {
		return timelineGlobals.timeUnits.hours;
	} else if (block === timelineGlobals.timeUnits.hours) {
		return timelineGlobals.timeUnits.minutes;
	} else if (block === timelineGlobals.timeUnits.minutes) {
		return timelineGlobals.timeUnits.seconds;
	} else {
		return timelineGlobals.timeUnits.seconds; //default, 1 second is always a valid division
		//allows server to set it's own binSize where client can't guess something sensible.
	}
}

function createStepFromLong(time) {
	var res = {};
	if (time === 0)
		return res.seconds = 0;
	var temp = Object.getOwnPropertyNames(timelineGlobals.timeUnits);
	for ( var i = temp.length; i >= 0; i--) {
		if (Math.floor(time / timelineGlobals.timeUnits[temp[i]]) > 0) {
			res[temp[i]] = Math
					.floor(time / timelineGlobals.timeUnits[temp[i]]);
			var remainder = time % timelineGlobals.timeUnits[temp[i]];
			if (remainder != 0) {
				return recPrettyString(remainder, string);
			} else {
				return res;
			}
		}
	}
	;
}

function createLongFromStep(step) {
	var res = 0;
	for ( var prop in step) {
		res += step[prop] * timelineGlobals.timeUnits[prop];
	}
	return res;
}

function addComment(){
	return;
}