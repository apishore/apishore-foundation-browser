docs.directive("sample", function(apishoreAuth, $rootScope, $http, $state) {

	return {
		restrict : 'E',
		replace : true,
		transclude: true,
		scope:{},
		templateUrl : window.apishoreConfig.webappRoot + "/js/app/sample.html",
        link : function($scope, $element)
        {
        	$scope.codemirror = $rootScope.codemirror;
        	var html = $element.find(".sample").html();
        	$scope.code = html;
        }
	};
});
