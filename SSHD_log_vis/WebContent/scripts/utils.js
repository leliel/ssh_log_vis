window.onload = setupOnLoad;
var setID;

function setupOnLoad() {

	$.ajax({
		type : "POST",
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
		timelineGlobals.updateUIandZoom(timelineGlobals.timelines[0].getStart(),
				timelineGlobals.timelines[timelineGlobals.timelines.length-1].getEnd(), timelineGlobals.binLength, timelineGlobals.server);
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

	$("#rawLines").dialog({
		autoOpen: false,
		width: "auto",
		closeOnEscape: true,
		position: {
			my: "center center",
			at: "center center",
			of: $("#time")},
		title: "Raw Log lines"
	});

	setID = makeCommentDialog();
}

function makeCommentDialog(){
	 var comment = $( "#commentText" ),
	 id = null,
	 allFields = $( [] ).add( comment );

	$("#comment").dialog({
		autoOpen: false,
		width: "auto",
		modal: true,
		closeOnEscape: true,
		position: {
			my: "center center",
			at: "center center",
			of: $("#time")},
		title: "Please Enter comment",
		 buttons: {
			 "Save": function() {
				 allFields.removeClass( "ui-state-error" );
			 	if ( comment.val().length > 0 ) {
					$.post("MakeComment", {
						entry_id: id,
						comment: comment.val()
						}, function(data, statusText, jqXHR){
							if (jqXHR.status >= 200 && jqXHR.status < 300 ){
								alert("Comment successfully added");
							} else if (jqXHR.status == 400 || jqXHR.status == 500){
								alert("Error entering comment");
							} else {
								alert("Comment entry failed");
							}
						}
					);
					$( this ).dialog( "close" );
			 	};
			 },
			 Cancel: function() {
			 	$( this ).dialog( "close" );
			 }
		},
		close: function() {
			id = null;
			allFields.val( "" ).removeClass( "ui-state-error" );
		}
	});

	return function setId(entry_id){
		 id = entry_id;
	};
}

function initPage(start, end) {
	timelineGlobals = new Globals(getPropertyNumberFromCSS(document
			.getElementById("time"), "width"), getPropertyNumberFromCSS(
			document.getElementById("time"), "height"));

	var sel = d3.select("#binColours");
	sel.select(".binFailed")
		.attr("fill", timelineGlobals.colours.failed);
	sel.select(".binAccepted")
		.attr("fill", timelineGlobals.colours.accepted);
	sel.select(".binDivider")
		.attr("fill", timelineGlobals.colours.divider);	
	sel.select(".binInvalid")
		.attr("fill", timelineGlobals.colours.invalid);
	

	var debounce = $.debounce(50, function(event) {
		var times = $("#universe").dragslider("values");
		var start = times[0];
		var end = times[1];
		if (event.originalEvent != undefined){
			timelineGlobals.performZoom(start, end, timelineGlobals.binLength,
					timelineGlobals.server);
		}
	});

	timelineGlobals.universeStart = start;
	timelineGlobals.universeEnd = end;
	var length = end - start;
	start -= start % length;
	end += length - end % length;

	$('#universe').dragslider({
		animate : true, // Works with animation.
		range : true, // Must have a range to drag.
		rangeDrag : true, // Enable range dragging.
		max : end,
		min : start,
		step : timelineGlobals.timeUnits.months,
		values : [ timelineGlobals.timelines[0].getStart(), timelineGlobals.timelines[timelineGlobals.timelines.length -1].getEnd() ],
		stop : debounce
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

	$(window).on("statechange", timelineGlobals.loadDataFromHistory);

	var startTime = $("#timelineStart");
	startTime.datetimepicker({
		timeFormat : "HH:mm:ss",
		showSeconds : true
	});

	var endTime = $("#timelineEnd");
	endTime.datetimepicker({
		timeFormat : "HH:mm:ss",
		showSeconds : true
	});

	$("#zoomButton")
			.click(
					function() {
						var start = startTime.datetimepicker("getDate")
								.getTime();
						var end = endTime.datetimepicker('getDate').getTime();
						var reqLength = end - start;
						var univ = {
							max : timelineGlobals.universeEnd + reqLength - timelineGlobals.universeEnd%reqLength,
							min : timelineGlobals.universeStart - timelineGlobals.universeStart%reqLength,
							step : reqLength,
							values : [start, end]
						};
						$("#universe").dragslider("option", univ);
						timelineGlobals.performZoom(start, end, timelineGlobals.binLength, timelineGlobals.server);

					});

	$("#reBinButton")
		.click(
				function(){
					var unit = $("#timelineUnits").val();
					var num = parseInt($("#binLength").val());
					var length = num * timelineGlobals.timeUnits[unit];
					if ((timelineGlobals.timelines[0].getEnd() - timelineGlobals.timelines[0].getStart())
							%length === 0){ //is this really the condition we want to ensure it's appropriate?
						timelineGlobals.performZoom(timelineGlobals.timelines[0].getStart(), timelineGlobals.timelines[timelineGlobals.timelines.length - 1].getEnd(), length, timelineGlobals.server);
					} else {
						alert("an integer number of timebins must fit on each timeline");
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

	var startSel, endSel;
	if (window.location.search.length > 1) {
		var data = getObjFromQueryString(window.location.search);
		startSel = parseInt(data.startTime);
		endSel = parseInt(data.endTime);
		var length = parseInt(data.binLength);
		if (data.server != undefined && data.server != "") {
			timelineGlobals.server = data.server;
		}
		timelineGlobals.updateUIandZoom(startSel, endSel, length, timelineGlobals.server);
	} else {
		var idx = timelineGlobals.timelines.length -1;
		endSel = timelineGlobals.timelines[idx].getEnd();
		startSel = timelineGlobals.timelines[0].getStart();
		timelineGlobals.updateUIandZoom(startSel, endSel, timelineGlobals.binLength, timelineGlobals.server);
	}
}

function setUITimeUnits(length){
	if (length/timelineGlobals.timeUnits.years >=1) {
		$("#binLength").val(twoPlaces(length/timelineGlobals.timeUnits.years));
		$("#timelineUnits").val("years");
	} else if (length/timelineGlobals.timeUnits.months >=1){
		$("#binLength").val(twoPlaces(length/timelineGlobals.timeUnits.months));
		$("#timelineUnits").val("months");
	} else if (length/timelineGlobals.timeUnits.weeks >=1){
		$("#binLength").val(twoPlaces(length/timelineGlobals.timeUnits.weeks));
		$("#timelineUnits").val("Weeks");
	} else if (length/timelineGlobals.timeUnits.days >=1){
		$("#binLength").val(twoPlaces(length/timelineGlobals.timeUnits.days));
		$("#timelineUnits").val("days");
	} else if (length/timelineGlobals.timeUnits.hours >=1){
		$("#binLength").val(twoPlaces(length/timelineGlobals.timeUnits.hours));
		$("#timelineUnits").val("hours");
	} else if (length/timelineGlobals.timeUnits.minutes >=1){
		$("#binLength").val(twoPlaces(length/timelineGlobals.timeUnits.minutes));
		$("#timelineUnits").val("minutes");
	}else if (length/timelineGlobals.timeUnits.seconds >=1){
		$("#binLength").val(twoPlaces(length/timelineGlobals.timeUnits.seconds));
		$("#timelineUnits").val("seconds");
	}
}

function twoPlaces(number){
	var res = number*100;
	res = Math.round(res);
	return res/100;
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

function addComment(){
	var id = this.id.substring("line".length);
	setID(parseInt(id));
	$("#comment").dialog("open");
}

