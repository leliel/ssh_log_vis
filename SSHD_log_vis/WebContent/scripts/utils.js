function getPropertyNumberFromCSS(element, propertyName){
	var css = window.getComputedStyle(element);
	var ans = parseInt(css.getPropertyValue(propertyName));
	return ans;
}