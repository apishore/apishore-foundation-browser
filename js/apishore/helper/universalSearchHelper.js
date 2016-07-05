/**
 * Provides common code for generated js
 */
apishore.factory("universalSearchHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, $rootScope) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		$scope.query = {
    			query : ""
    		};
    		$scope.close = function()
    		{
    			$scope.itemsData = {data:[]};
				$scope.progress = false;
				$scope.error = false;
				$scope.results = false;
				$scope.query.query ="";
    		}
    		$scope.clickItem = function(itemData, $event)
    		{
    			$state.go(itemData.data.uiState, itemData.data.uiStateParams);
    		}
			$scope.search = function()
			{
				if($scope.query.query && $scope.query.query.length>0)
				{
					$scope.progress = true;
					$scope.error = false;
					$scope.results = true;
					api.listByState($scope.query).then(function(res)
							{
								if($scope.progress)
								{
									$scope.itemsData = res.data;
									if(!$scope.itemsData.data)
									{
										$scope.itemsData.data = [];
									}	
									$scope.progress = false;
								}
							}, function(res) {
								if($scope.progress)
								{
									$scope.itemsData = {data:[]};
									$scope.progress = false;
									$scope.error = true;
								}
							});
				}
				else
				{
					$scope.progress = false;
					$scope.error = false;
					$scope.results = false;
					$scope.itemsData = {data:[]};
				}
			};
			
			$scope.goToState = function(state, stateParams, options) {
				$state.go(state, stateParams, options);
			}; 
		}
    };
});