apishore.directive("apishoreHideInputHelper", function() {
	return {
		restrict : 'A',
		scope: {
			apishoreHideInputHelper: '&'
        },
		link: function($scope, element, attrs)
		{
			element.keydown(function(event) {
				$scope.$apply(function () {
					if(event.keyCode == 27)
					{
						$scope.apishoreHideInputHelper();
					}
					else if(element.val() == "" && (event.keyCode == 8 || event.keyCode == 13))
					{
						$scope.apishoreHideInputHelper();
					}
				});
			});
		}
	};
});