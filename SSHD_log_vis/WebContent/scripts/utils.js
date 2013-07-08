function getPropertyNumberFromCSS(element, propertyName){
	var css = window.getComputedStyle(element);
	var ans = parseInt(css.getPropertyValue(propertyName));
	return ans;
}

function splitTimeBlock(d, block){
	if (block === timelineGlobals.month){
		performZoom(d, timelineGlobals.week);
	} else if (block === timelineGlobals.week){
		performZoom(d, timelineGlobals.day);
	} else if (block === timelineGlobals.day){
		performZoom(d, timelineGlobals.hour);
	} else if (block === timelineGlobals.hour){
		performZoom(d, timelineGlobals.minute * 10);
	} else if (block === timelineGlobals.minute*10){
		performZoom(d, timelineGlobals.minute);
	} else if (block === timelineGlobals.minute){
		performZoom(d, timelineGlobals.second*30);
	} else {
		makeUserRequest(d, "How would you like to divide up: ", block);
	}
}

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

function makeUserRequest(d, message, time) {

	//TODO lookup open event in jquery to set message.
	var startTime = $("#startTime"),
		endTime = $("#endTime"),
		chunk = $("#chunk"),
		units = $("#units"),
		allFields = $([]).add(startTime).add(endTime).add(chunk).add(units);
	$("zoom_dialog").dialog({
		autoOpen: false,
		height: 300,
		width: 250,
		modal: true,
		buttons:{
			"Ok" : function() {
				var valid = true;

				valid = valid && checkExists(chunk, "Number of units");
				valid = valid && checkChosen(units, "Unit");
				if (valid){
					var binSize = Number(chunk.val()) * timelineGlobals.timeUnits[units.val()];
					performZoom(Number(startTime.val()), Number(endTime.val()), binSize);
				};
			},
			Cancel : function(){
				$(this).dialog("close");
			},
			Close : function(){
				allFields.val("").removeClass("ui-state-error");
			}
		}
	});

	/*d3.select("#message")
		.html(message + "<br>" + toPrettyTimeString(time));
	var temp = d3.select("#popupForm");
	document.getElementById("ok").onclick = function() {parseTimeUnits(1);};
	document.getElementById("cancel").onclick = function() {parseTimeUnits(0);};
	temp.select("#startTime")
		.attr("value", d.startTime.getTime());
	temp.select("#endTime")
	.attr("value", d.endTime.getTime());
	showPopup(); */
}

function parseTimeUnits(ok){
	if (Number(ok)){


	};
}

/*function showPopup(){
	var popup = document.getElementById("overlay");
	popup.style.visibility = (popup.style.visibility == "visible") ? "hidden" : "visible";
}*/

function toPrettyTimeString(time){
	//TODO implement long->pretty string conversion
	var result = "";
	var temp = Object.getOwnPropertyNames(timelineGlobals.timeUnits);
	for (var i = temp.length; i >= 0; i--){
		if (Math.floor(time/timelineGlobals.timeUnits[temp[i]]) > 0){
			result += temp[i] + ": " + Math.floor(time/timelineGlobals.timeUnits[temp[i]]) + "<br>";
		}
	};
	return result;
}