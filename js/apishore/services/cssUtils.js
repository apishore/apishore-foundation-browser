
apishore.factory("apishoreCssUtils", function($injector, $http, $stateParams, $state, $window, $timeout, $location) {
	var styleSheetElement = document.createElement('style');
	styleSheetElement.type = 'text/css';
	styleSheetElement.id = "apishoreCssUtils";
	document.getElementsByTagName('head')[0].appendChild(styleSheetElement);
	var styleSheet = styleSheetElement.sheet;
	
	//
	var utils;
	return utils = {
		update: function(selector, style)
		{
			for (i = 0; i < styleSheet.rules.length; i++)
			{
				if(styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase()==selector.toLowerCase())
				{
					styleSheet.rules[i].style.cssText = style;
					return;
				}
			}
			styleSheet.insertRule(selector + '{' + style + '}', styleSheet.cssRules.length);
		}
	};
});
