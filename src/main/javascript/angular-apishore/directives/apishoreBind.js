
apishore.directive("apishoreBind", function($injector, apishoreUtils) {
	return {
		restrict : 'A',
		transclude: false,
		scope: false,
		link: function($scope, element, attrs)
		{
			apishoreUtils.compileApishoreBind($scope, attrs.apishoreBind, $scope.$eval(attrs.apishoreBindQuery), $scope.$eval(attrs.apishoreBindParams));
		}
	};
});
