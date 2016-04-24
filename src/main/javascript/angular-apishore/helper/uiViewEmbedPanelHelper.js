/**
 * UI View Form Helper provides common code for generated js
 */
apishore.factory("uiViewEmbedPanelHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
			$scope.itemData = {};
			if(angular.isDefined(attrs.itemId))
			{
				$scope.$watch("itemId", function(newValue, oldvalue){
					api.get(newValue).then(function(data){
						$scope.itemData = data;
					});
				});
			}
			if(angular.isDefined(attrs.data))
			{
				$scope.$watch("data", function(newValue, oldvalue){
					$scope.itemData.data = newValue;
				});
			}
    	}
    };
});