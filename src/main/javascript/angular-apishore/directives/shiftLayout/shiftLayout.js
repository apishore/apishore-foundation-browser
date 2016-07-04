apishore.directive("apishoreShiftContainer", function($state) {
	return {
		restrict : 'E',
		transclude : true,
		replace: true,
		templateUrl : window.apishoreConfig.webappRoot+"/$ng/apishore/directives/shiftLayout/shiftLayout.html",
		scope:{
			collapseState:'@'
		},
		controller: function($scope){ this.collapseState = $scope.collapseState;},
		link : function($scope, element, attrs) {
			$scope.disabled = function()
			{
				return false;
			}
		}
	}
});
apishore.directive("apishoreShiftMenu", function($state, $rootScope) {
	return {
		restrict : 'E',
		transclude : true,
		replace: true,
		templateUrl : window.apishoreConfig.webappRoot+"/$ng/apishore/directives/shiftLayout/shiftLayoutMenu.html",
		scope:{
		},
		link : function($scope, element, attrs, apishoreShiftContainer) {
			$scope.disabled = function()
			{
				var container = element.next();
				var innerMenu = container.find(".apishore-shift-menu");
				return innerMenu.length != 0;
			}
			$scope.isExpanded = function()
			{
				return $scope.expanded || $rootScope.sidebar.show;
			}
			$scope.toogle = function()
			{
				$scope.expanded = !$scope.expanded; 
			}
			$scope.hideSidebar = function()
			{
				$rootScope.sidebar.show = false;
				$rootScope.sidebar.topMenu = false;
			}
            $rootScope.$on('$stateChangeStart', function() {
            	$scope.expanded = false;
            });

		}
	}
});

apishore.directive("apishoreShiftContent", function($state) {
	return {
		restrict : 'E',
		replace: true,
		transclude: true,
		require: "^apishoreShiftContainer",
		templateUrl : window.apishoreConfig.webappRoot+"/$ng/apishore/directives/shiftLayout/shiftLayoutContent.html",
		scope:{
			collapseState:'@'
		},
		link : function($scope, element, attrs, apishoreShiftContainer) {
			$scope.disabled = function()
			{
				return false;
			}
		}
	}
});