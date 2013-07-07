function getPropertyNumberFromCSS(element, propertyName){
	var css = window.getComputedStyle(element);
	var ans = parseInt(css.getPropertyValue(propertyName));
	return ans;
}

function splitTimeBlock(d, block){
	var temp = makeUserRequest("How would you like to divide up: ", toPrettyTimeString(block));
	if (temp != null){
		performZoom(d, temp);
	} else if (block === timelineGlobals.month){
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
	}
}

function makeUserRequest(message, time, callback) {
	//TODO prompt user for customised time breakdown, return -1 for letting machine chose.
	d3.select("#message")
		.html(message + "<br>" + toPrettyTimeString(time));
	d3.select("#popupForm").selectAll("input")
		.on("click", callback);
	d3.select("#timeBlock")
		.attr("value", time);
	showPopup();
}

function parseTimeUnits(form){
	var many = form.chunk.value;
	if (many == null || many == undefined){
		var html = d3.select("#message")
			.html();
		d3.select("#message")
			.html(html + "<br> a number of units must be provided");
		d3.select("#chunk")
			.style("color", "#ff0000");
		return;
	}
	var unit = form.units.value;
	if (unit == "Please choose"){
		var html = d3.select("#message")
			.html();
		d3.select("#message")
			.html(html + "<br> a unit must be chosen");
		d3.select("#units")
			.style("color", "#ff0000");
	return;
	}
	showPopup();
	return form.timeBlock/timelineGlobals.timeUnits[unit];
}

function showPopup(){
	var popup = document.getElementById("overlay");
	popup.style.visibility = (popup.style.visibility == "visible") ? "hidden" : "visible";
}

function toPrettyTimeString(time){
	//TODO implement long->pretty string conversion
	var result = "";
	for (var prop in timelineGlobals.timeUnits){
		if (timelineGlobals.hasOwnProperty(prop)){
			if (Math.floor(time/timelineGlobals.timeUnits[prop]) > 0){
				result += prop + ": " + Math.floor(time/timelineGlobals.timeUnits[prop]) + "<br>";
			}
		};
	};
	return result;
}