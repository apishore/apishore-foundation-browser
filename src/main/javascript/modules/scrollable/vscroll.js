angular.module("your-module").directive('asVscroll', function(taSelection, $timeout) {
	return {
		restrict : 'C',
		scope: false,
		link : function($scope, element, attrs) {
			//TODO: configure custom scroll here
		}
	}
});