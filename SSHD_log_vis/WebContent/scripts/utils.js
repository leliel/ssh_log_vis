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
}

function tearDown() {
	$("#universe").dateRangeSlider("destroy");
}

function initPage(start, end) {
	timelineGlobals = new Globals(getPropertyNumberFromCSS(document
			.getElementById("time"), "width"), getPropertyNumberFromCSS(
			document.getElementById("time"), "height"));

	var debounce = $.debounce(50, function(f) {
		 var times = $("#universe").dragslider("values");
		var start = times[0];
		var end = times[1];
		// TODO replace timepicker with one that works. existing timepicker does
		// not handle DST or timezones at all properly.
		$("#timelineStart").datetimepicker("setDate", new Date(start));
		$("#timelineEnd").datetimepicker("setDate", new Date(end));
		var size = $("#universe").dragslider("option", "step");
		//TODO sort out bin length issues.
		performZoom(start, end, splitTimeBlock(size),
				timelineGlobals.server);
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

	/*
	 * $("#universe").dateRangeSlider({ arrows: true, bounds: { min : new
	 * Date(start), max : new Date(end)}, //step : {weeks : 1}, //defaultValues: {
	 * //min : new Date(start), //max : new Date(start +
	 * timelineGlobals.timeUnits.weeks)} });
	 *
	 * $("#universe").on("valuesChanged" , function(f){ var times =
	 * $("#universe").dateRangeSlider("values"); var start = times.min; var end =
	 * times.max; //TODO replace timepicker with one that works. existing
	 * timepicker does not handle DST or timezones at all properly.
	 * $("#timelineStart").datetimepicker("setDate", start);
	 * $("#timelineEnd").datetimepicker("setDate", end); var size =
	 * $("#universe").dateRangeSlider("option", "step");
	 * performZoom(start.getTime(), end.getTime(), createLongFromStep(size),
	 * timelineGlobals.server); });
	 */

	$("#time").position({
		my : "left top",
		at : "right top+14",
		of : $("#controls")
	});

	$("#universe").position({
		my : "center bottom",
		at : "center top-14",
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
		timeFormat : "HH:mm:ss",
		timezone : "z",
		showSeconds : true,
	/*
	 * onClose: function(dateText, inst) { if (endTime.val() != '') { var
	 * testStartDate = startTime.datetimepicker('getDate'); var testEndDate =
	 * endTime.datetimepicker('getDate'); if (testStartDate > testEndDate)
	 * endTime.datetimepicker('setDate', testStartDate); } else {
	 * endTime.val(dateText); } },
	 */
	/*
	 * onSelect: function (selectedDateTime){ endTime.datetimepicker('option',
	 * 'minDateTime', startTime.datetimepicker('getDate'));
	 * endTime.datetimepicker('option', 'maxDateTime', new Date());
	 * startTime.datetimepicker('option', 'maxDateTime', new Date()); }
	 */
	});

	var endTime = $("#timelineEnd");
	endTime.datetimepicker({
		timeFormat : "HH:mm:ss",
		timezone : "z",
		showSeconds : true,
	/*
	 * onClose: function(dateText, inst) { if (startTime.val() != '') { var
	 * testStartDate = startTime.datetimepicker('getDate'); var testEndDate =
	 * endTime.datetimepicker('getDate'); if (testStartDate > testEndDate)
	 * startTime.datetimepicker('setDate', testEndDate); } else {
	 * startTime.val(dateText); } },
	 */
	/*
	 * onSelect: function (selectedDateTime){ startTime.datetimepicker('option',
	 * 'maxDateTime', endTime.datetimepicker('getDate')); }
	 */
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
						// TODO clarify validity function, needs to integer
						// divide one timeline with no remainder.
						if (Math.floor(reqLength / binLength) > timelineGlobals.timelines.length) {
							if ((reqLength / binLength)
									% timelineGlobals.timelines.length == 0) {
								$("#universe").dragslider("option", "step",
										end - start);
								$("#universe").dragslider("values", [ start, end ]);
							}
						} else {
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
	} else {
		var step = timelineGlobals.timelines[0].getEnd()
				- timelineGlobals.timelines[0].getStart();
		$("#universe").dragslider("option", "step", step);
		$("#universe").dragslider(
				"values",
				[ timelineGlobals.timelines[0].getStart(),
						timelineGlobals.timelines[0].getEnd() ]);
	}

	/*
	 * $(function(){ var startTime = $("#startTime"), endTime = $("#endTime"),
	 * chunk = $("#chunk"), units = $("#units"), hints = $("#hints"), allFields =
	 * $([]).add(startTime).add(endTime).add(chunk).add(units).add(hints);
	 *
	 *
	 *
	 * function checkExists(input, name){ if (input.val() == undefined ||
	 * input.val() == null){ input.addClass("ui-state-error"); return false; }
	 * return true; }
	 *
	 * function checkChosen(input, name){ if (input.val() === "Please Select"){
	 * input.addClass("ui-state-error"); return false; } return true; }
	 *
	 * function checkBinSize(inputs, binSize, times){ if ((times[1] -
	 * times[0])/binSize < 4){ $.each(inputs, function(idx, val){
	 * val.addClass("ui-state-error"); }); if((times[1] - times[0])%binSize !=
	 * 0){ $("#hints").text("Number of units must be an integer divisor of
	 * timeblock."); } else { $("#hints").text("Number of units must be at most
	 * 1/4 timeblock."); } return false; } else if ((times[1] -
	 * times[0])%binSize != 0){ $("#hints").text("Number of units must be an
	 * integer divisor of timeblock."); return false; } return true; }
	 *
	 * $("#zoom_dialog").dialog({ autoOpen: false, height: 300, width: 250,
	 * modal: true, buttons:{ "Ok" : function() { var valid = true;
	 *
	 * valid = valid && checkExists(chunk, "Number of units"); valid = valid &&
	 * checkChosen(units, "Unit");
	 *
	 * var binSize = Number(chunk.val()) *
	 * timelineGlobals.timeUnits[units.val()];
	 *
	 * valid = valid && checkBinSize([chunk, units], binSize,
	 * [Number(startTime.val()), Number(endTime.val())]); if (valid){
	 * $("#universe").slider("option", "step", binSize);
	 * $("#universe").slider("values", [parseInt(startTime.val()),
	 * parseInt(endTime.val())]); //performZoom(Number(startTime.val()),
	 * Number(endTime.val()), binSize); $(this).dialog("close"); }; }, Cancel:
	 * function(){ $(this).dialog("close"); } }, close : function(event, ui){
	 * allFields.val("").removeClass("ui-state-error"); }, }); });
	 */
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