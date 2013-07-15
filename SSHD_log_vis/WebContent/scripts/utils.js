window.onload = setupOnLoad;

function setupOnLoad(){

	timelineGlobals = new Globals(getPropertyNumberFromCSS(document.getElementById("time"), "width"), getPropertyNumberFromCSS(document.getElementById("time"), "height"));

	var time = 	$("#time");

	time.position({
		my: "left top",
		at: "right top",
		of: $("#controls")
	});

	$("#legend").position({
		my: "center bottom",
		at: "center bottom",
		of: $("#controls"),
		within: $("#controls")
	});

	$(window).resize(function(){ //javascript really needs an onresize even for each element. using window resize event to handle most cases.
		$("#time").position({ //reposition timelines.
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

	$("#undoZoom").click(performUnZoom);

	var startTime = $("#timelineStart");
	startTime.datetimepicker({
		timeFormat : "HH:mm:ss",
		timezone : "z",
		showSeconds: true,
		onClose: function(dateText, inst) {
			if (endTime.val() != '') {
				var testStartDate = startTime.datetimepicker('getDate');
				var testEndDate = endTime.datetimepicker('getDate');
				if (testStartDate > testEndDate)
					endTime.datetimepicker('setDate', testStartDate);
			}
			else {
				endTime.val(dateText);
			}
		},
		onSelect: function (selectedDateTime){
			endTime.datetimepicker('option', 'minDateTime', startTime.datetimepicker('getDate'));
			endTime.datetimepicker('option', 'maxDateTime', new Date());
			startTime.datetimepicker('option', 'maxDateTime', new Date());
		}
	});

	var endTime = $("#timelineEnd");
	endTime.datetimepicker({
		timeFormat : "HH:mm:ss",
		timezone : "z",
		showSeconds: true,
		onClose: function(dateText, inst) {
			if (startTime.val() != '') {
				var testStartDate = startTime.datetimepicker('getDate');
				var testEndDate = endTime.datetimepicker('getDate');
				if (testStartDate > testEndDate)
					startTime.datetimepicker('setDate', testEndDate);
			}
			else {
				startTime.val(dateText);
			}
		},
		onSelect: function (selectedDateTime){
			startTime.datetimepicker('option', 'maxDateTime', endTime.datetimepicker('getDate'));
		}
	});

	$("#zoomButton").click(function(){
		var start = startTime.datetimepicker("getDate").getTime();
		var end = endTime.datetimepicker('getDate').getTime();
		var unit = $("#timelineUnits").val();
		var millis = timelineGlobals.timeUnits[unit];
		var binLength = $("#binLength");
		binLength = binLength.val();
		binLength *= millis;
		var reqLength = end - start;
		if (Math.floor(reqLength/binLength) > timelineGlobals.timelines.length){
			/*var mod1 = reqLength%binLength;
			mod1 = mod1 == 0;*/
			var mod2 = (reqLength/binLength)%timelineGlobals.timelines.length;
			mod2 = mod2 == 0;
			if (mod2){
				performZoom(start, end, binLength);
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

	$.each(timelineGlobals.timeUnits, function(key, value) {
		$("#units").append($("<option />").val(key).text(key + "s"));
	});

	//TODO process querystring then reload data based on values.
	if (window.location.search.length > 1) {
		var data = {};
		for (var aItKey, nKeyId = 0, aCouples = window.location.search.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
			aItKey = aCouples[nKeyId].split("=");
			data[unescape(aItKey[0])] = aItKey.length > 1 ? unescape(aItKey[1]) : "";
		}
		var temp = data;
	} else {
		requestAllTimelines();
	}


	$(function(){
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
						performZoom(Number(startTime.val()), Number(endTime.val()), binSize);
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
	});
}

function getPropertyNumberFromCSS(element, propertyName){
	var css = window.getComputedStyle(element);
	var ans = parseInt(css.getPropertyValue(propertyName));
	return ans;
}

function splitTimeBlock(d, block){
	if (block === timelineGlobals.timeUnits.month){
		performZoom(d.startTime.getTime(), d.endTime.getTime(),  timelineGlobals.timeUnits.week);
	} else if (block === timelineGlobals.timeUnits.week){
		performZoom(d.startTime.getTime(), d.endTime.getTime(), timelineGlobals.timeUnits.day);
	} else if (block === timelineGlobals.timeUnits.day){
		performZoom(d.startTime.getTime(), d.endTime.getTime(), timelineGlobals.timeUnits.hour);
	} else if (block === timelineGlobals.timeUnits.hour){
		performZoom(d.startTime.getTime(), d.endTime.getTime(), timelineGlobals.timeUnits.minute);
	} else if (block === timelineGlobals.timeUnits.minute){
		performZoom(d.startTime.getTime(), d.endTime.getTime(), timelineGlobals.timeUnits.second);
	} else {
		$("#startTime").val(d.startTime.getTime());
		$("#endTime").val(d.endTime.getTime());
		$("#message").html("Choose bin size for " + toPrettyTimeString(block));
		$("#zoom_dialog").dialog('open');
	}
}

function toPrettyTimeString(time){
	return recPrettyString(time, "");
}

function recPrettyString(time, string){
	if (time === 0) return string;
	var temp = Object.getOwnPropertyNames(timelineGlobals.timeUnits);
	for (var i = temp.length; i >= 0; i--){
		if (Math.floor(time/timelineGlobals.timeUnits[temp[i]]) > 0){
			string += Math.floor(time/timelineGlobals.timeUnits[temp[i]]) + ": " + temp[i] + "<br>";
			var remainder = time%timelineGlobals.timeUnits[temp[i]];
			if (remainder != 0){
				return recPrettyString(remainder, string);
			} else {
				return string;
			}
		}
	};
	return string; //should never happen, but just in case, JS is weird like that
}