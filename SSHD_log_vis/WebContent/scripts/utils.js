window.onload = setupOnLoad;

function setupOnLoad(){

	timelineGlobals = new Globals(getPropertyNumberFromCSS(document.getElementById("time"), "width"), getPropertyNumberFromCSS(document.getElementById("time"), "height"));

	requestAllTimelines();
	
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
				$("#hints").text("Number of units must be at most 1/4 timeblock");
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
			open : function(event, ui){
				$.each(timelineGlobals.timeUnits, function(key, value) {
					units.append($("<option />").val(key).text(key + "s"));
				});
			}
		});
	});
}

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
		$("#startTime").val(d.startTime.getTime());
		$("#endTime").val(d.endTime.getTime());
		$("#message").html("Choose bin size for: " + toPrettyTimeString(block));
		$("#zoom_dialog").dialog('open');
	}
}

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