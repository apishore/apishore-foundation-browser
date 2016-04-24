apishore.directive("apishoreExpandableText", function($injector, $modal, userRoles, apishoreUtils, apishoreAuth)
{
    return {
        restrict: 'E',
        templateUrl : window.apishoreConfig.webappRoot+"/$ng/apishore/directives/expandable-text.html",
        scope: {
            model: '=',
        },
        link: function ($scope, element, $attrs)
        {
        	function fn(n,o)
        	{
        		n = n || $scope.model;
        		$scope.expandable = (n && n.length > 500);
        		$scope.expanded = false;
        	}
        	fn();
        	$scope.$watch('model', fn);
        	$scope.toggle = function()
        	{
        		$scope.expanded = !$scope.expanded;
        	}
        }
    };
});
