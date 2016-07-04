/**
 * UI List Helper provides common code for generated js
 */
apishore.factory("uiEmbeddedListHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, $rootScope, uiGridHelper) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		$scope.deleteItem = function(itemData, $index, $event)
    		{
    			$scope.itemsData.data.splice($index, 1);
    			if($event) event.preventDefault();
    		};
    		
			$scope.newItem = function($index, $event)
			{
	    		var newItem = {data:{}};
	    		api.setDefaults(newItem.data);
				if(!angular.isDefined($scope.itemsData.data))
				{
					$scope.itemsData.data = [];
				}
	    		$scope.itemsData.data.splice($index, 0, newItem);
    			if($event) event.preventDefault();
			};
			$scope.duplicateItem = function(itemData, $index, $event)
			{
	    		var newItem = angular.copy(itemData);
	    		$scope.itemsData.data.splice($index, 0, newItem);
    			if($event) event.preventDefault();
			};
		}
    };
});