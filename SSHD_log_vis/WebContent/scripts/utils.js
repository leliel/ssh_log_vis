window.onload = setupOnLoad;

function setupOnLoad(){

	$("#universe").dateRangeSlider({
		arrows: true,
		bounds: {
			min : new Date(0),
			max : new Date(60000)},
		step : {seconds: 10},
		defaultValues : {
			min : new Date(10000),
			max : new Date(20000)}
	});

	$("#universe").on("valuesChanged" , function(f){
		var times = $("#universe").dateRangeSlider("values");
		var start = times.min;
		var end = times.max;
		//TODO replace timepicker with one that works. existing timepicker does not handle DST at all properly.
		$("#timelineStart").datetimepicker("setDate", start);
		$("#timelineEnd").datetimepicker("setDate", end);
		var size = $("#universe").dateRangeSlider("option", "step");
		performZoom(start.getTime(), end.getTime(), createLongFromStep(size), timelineGlobals.server);
	});


	$.ajax({
		 type: "POST",
		 async: false, //we really can't do anything else until we have the universe :/
		 url: "GetBeginAndEnd",
		 data: "",
		 success: function(data, textStatus, jqXHR){
				initSlider(parseInt(data.start), parseInt(data.end));
			},
		 dataType: "json"
	});

	$("#time").position({
		my: "left top",
		at: "right top+14",
		of: $("#controls")
	});

	$("#universe").position({
		my: "center bottom",
		at: "center top-14",
		of: $("#time")
	});

	$("#legend").position({
		my: "center bottom",
		at: "center bottom",
		of: $("#controls"),
		within: $("#controls")
	});

	$(window).resize(function(){
		$("#time").position({
			my: "left top",
			at: "right top",
			of: $("#controls")
		});

		$("#legend").position({//reposition legends
			my: "center bottom",
			at: "center bottom",
			of: $("#controls"),
			within: $("#controls")
		});

		var width = $("#time").width();
		var height = $("#time").height()/timelineGlobals.timelines.length;
		for (var i in timelineGlobals.timelines){
			timelineGlobals.timelines[i].redrawBins(width, height);
		}
	});

	$(window).on('statechange', loadDataFromHistory);

	var startTime = $("#timelineStart");
	startTime.datetimepicker({
		timeFormat : "HH:mm:ss",
		timezone : "z",
		showSeconds: true,
		/*onClose: function(dateText, inst) {
			if (endTime.val() != '') {
				var testStartDate = startTime.datetimepicker('getDate');
				var testEndDate = endTime.datetimepicker('getDate');
				if (testStartDate > testEndDate)
					endTime.datetimepicker('setDate', testStartDate);
			}
			else {
				endTime.val(dateText);
			}
		},*/
		/*onSelect: function (selectedDateTime){
			endTime.datetimepicker('option', 'minDateTime', startTime.datetimepicker('getDate'));
			endTime.datetimepicker('option', 'maxDateTime', new Date());
			startTime.datetimepicker('option', 'maxDateTime', new Date());
		}*/
	});

	var endTime = $("#timelineEnd");
	endTime.datetimepicker({
		timeFormat : "HH:mm:ss",
		timezone : "z",
		showSeconds: true,
		/*onClose: function(dateText, inst) {
			if (startTime.val() != '') {
				var testStartDate = startTime.datetimepicker('getDate');
				var testEndDate = endTime.datetimepicker('getDate');
				if (testStartDate > testEndDate)
					startTime.datetimepicker('setDate', testEndDate);
			}
			else {
				startTime.val(dateText);
			}
		},*/
		/*onSelect: function (selectedDateTime){
			startTime.datetimepicker('option', 'maxDateTime', endTime.datetimepicker('getDate'));
		}*/
	});

	$("#zoomButton").click(function(){
		var start = startTime.datetimepicker("getDate").getTime();
		var end = endTime.datetimepicker('getDate').getTime();
		var unit = $("#timelineUnits").val();
		var binLength = $("#binLength").val() * timelineGlobals.timeUnits[unit];
		var reqLength = end - start;
		//TODO clarify validity function, needs to integer divide one timeline with no remainder.
		if (Math.floor(reqLength/binLength) > timelineGlobals.timelines.length){
			if ((reqLength/binLength)%timelineGlobals.timelines.length == 0){
				$("#universe").slider("option", "step", createStepFromLong(binLength));
				$("#universe").slider("values", new Date(start), new Date(end));
			}
		} else {
			$("#timelineUnits").addClass("ui-state-error");
			$("#binLength").addClass("ui-state-error");
		}
	});


	var temp = $("#timelineUnits");
	$.each(timelineGlobals.timeUnits, function(key, value) {
		if (value == timelineGlobals.binLength){
			temp.append($("<option />").val(key).text(key + "s")).attr({'selected' : 'selected'});
		} else {
			temp.append($("<option />").val(key).text(key + "s"));
		}
	});

	if (window.location.search.length > 1) {
		var data = getObjFromQueryString(window.location.search);
		var start = parseInt(data.startTime);
		var end = parseInt(data.endTime);
		var length = parseInt(data.binLength);
		if (data.server != undefined && data.server != ""){
			timelineGlobals.server = data.server;
		}
		$("#universe").dateTimeSlider("option", "step", createStepFromLong(length));
		$("#universe").dateTimeSlider("values", new Date(start), new Date(end));
	} else {
		$("#universe").dateRangeSlider("option", "step", createStepFromLong(timelineGlobals.binLength));
		$("#universe").dateRangeSlider("values",new Date(timelineGlobals.timelines[0].getStart()),
				new Date(timelineGlobals.timelines[timelineGlobals.timelines.length -1].getEnd()));
		//requestAllTimelines();
	}


	/*$(function(){
		var startTime = $("#startTime"),
			endTime = $("#endTime"),
			chunk = $("#chunk"),
			units = $("#units"),
			hints = $("#hints"),
			allFields = $([]).add(startTime).add(endTime).add(chunk).add(units).add(hints);



		function checkExists(input, name){
			if (input.val() == undefined || input.val() == null){
				input.addClass("ui-state-error");
				return false;
			}
			return true;
		}

		function checkChosen(input, name){
			if (input.val() === "Please Select"){
				input.addClass("ui-state-error");
				return false;
			}
			return true;
		}

		function checkBinSize(inputs, binSize, times){
			if ((times[1] - times[0])/binSize < 4){
				$.each(inputs, function(idx, val){
					val.addClass("ui-state-error");
				});
				if((times[1] - times[0])%binSize != 0){
					$("#hints").text("Number of units must be an integer divisor of timeblock.");
				} else {
					$("#hints").text("Number of units must be at most 1/4 timeblock.");
				}
				return false;
			} else if ((times[1] - times[0])%binSize != 0){
				$("#hints").text("Number of units must be an integer divisor of timeblock.");
				return false;
			}
			return true;
		}

		$("#zoom_dialog").dialog({
			autoOpen: false,
			height: 300,
			width: 250,
			modal: true,
			buttons:{
				"Ok" : function() {
					var valid = true;

					valid = valid && checkExists(chunk, "Number of units");
					valid = valid && checkChosen(units, "Unit");

					var binSize = Number(chunk.val()) * timelineGlobals.timeUnits[units.val()];

					valid = valid && checkBinSize([chunk, units], binSize, [Number(startTime.val()), Number(endTime.val())]);
					if (valid){
						$("#universe").slider("option", "step", binSize);
						$("#universe").slider("values", [parseInt(startTime.val()), parseInt(endTime.val())]);
						//performZoom(Number(startTime.val()), Number(endTime.val()), binSize);
						$(this).dialog("close");
					};
				},
				Cancel: function(){
					$(this).dialog("close");
				}
				},
			close : function(event, ui){
				allFields.val("").removeClass("ui-state-error");
			},
		});
	});*/
}

function initSlider(start, end){
	timelineGlobals = new Globals(getPropertyNumberFromCSS(document.getElementById("time"), "width"), getPropertyNumberFromCSS(document.getElementById("time"), "height"));
	start -= start%timelineGlobals.binLength;
	end += timelineGlobals.binLength - end%timelineGlobals.binLength;

	$("#universe").dateRangeSlider("bounds", new Date(start), new Date(end));
}

function getObjFromQueryString(string){
	var data = {};
	for (var aItKey, nKeyId = 0, aCouples = window.location.search.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
		aItKey = aCouples[nKeyId].split("=");
		data[unescape(aItKey[0])] = aItKey.length > 1 ? unescape(aItKey[1]) : "";
	}
	return data;
}

function getPropertyNumberFromCSS(element, propertyName){
	var css = window.getComputedStyle(element);
	var ans = parseInt(css.getPropertyValue(propertyName));
	return ans;
}

function splitTimeBlock(block){
	if (block === timelineGlobals.timeUnits.month){
		return  timelineGlobals.timeUnits.week;
	} else if (block === timelineGlobals.timeUnits.week){
		return timelineGlobals.timeUnits.day;
	} else if (block === timelineGlobals.timeUnits.day){
		return timelineGlobals.timeUnits.hour;
	} else if (block === timelineGlobals.timeUnits.hour){
		return timelineGlobals.timeUnits.minute;
	} else if (block === timelineGlobals.timeUnits.minute){
		return timelineGlobals.timeUnits.second;
	}
}

function createStepFromLong(time){
	var res = {};
	if (time === 0) return res.seconds = 0;
	var temp = Object.getOwnPropertyNames(timelineGlobals.timeUnits);
	for (var i = temp.length; i >= 0; i--){
		if (Math.floor(time/timelineGlobals.timeUnits[temp[i]]) > 0){
			res[temp[i]] = Math.floor(time/timelineGlobals.timeUnits[temp[i]]);
			var remainder = time%timelineGlobals.timeUnits[temp[i]];
			if (remainder != 0){
					return recPrettyString(remainder, string);
			} else {
				return res;
			}
		}
	};
}

function createLongFromStep(step){
	var res = 0;
	for (var prop in step){
		res += step[prop] * timelineGlobals.timeUnits[prop];
	}
	return res;
}