/**
 * UI List Helper provides common code for generated js
 */
apishore.factory("uiTwoListHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, $rootScope) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		$scope.currentItems = { data: [] };
    		$scope.availableItems = { data: [] };
    		$scope.restApi = api;

    		$scope.currentQuery = {
				offset: 0,
				sortDir : "asc"
    		};
    		$scope.availableQuery = {
				offset: 0,
				insertOptions: true,
				sortDir : "asc"
    		};

			$scope.navigateBack = function($event)
			{
				if(!$window.history.back())
				{
		    		if(angular.isDefined($scope.cancelState))
					{
						$state.go($scope.cancelState);
					}
			    	if(angular.isDefined($scope.backState))
			    	{
						$state.go($scope.backState);
					}
		    	}
			};
			$scope.toggleInteractiveHelp = function()
			{
				$rootScope.interactiveHelp.toggle();
			};

			$scope.addItem = function(item, $index, $event)
			{
				$scope.currentItems.data.splice(0, 0, item);
				$scope.availableItems.data.splice($index, 1);
				item.$progress = true;
				api.createByState(item.data, $state.current.name).then(function(res){
					item.$progress = false;
					item.data.id = res.data.data.id;
				}, function(res)
				{
					item.$progress = false;
				});
			};
			$scope.removeItem = function(item, $index, $event)
			{
				if(!angular.isDefined($scope.availableItems.data))
				{
					$scope.availableItems.data = [];
				}
				$scope.availableItems.data.splice(0, 0, item);
				$scope.currentItems.data.splice($index, 1);
				item.$progress = true;
				api.removeByState(item.data.id, $state.current.name).then(function(res){
					item.$progress = false;
				}, function(res)
				{
					item.$progress = false;
				});
			};

			// api call
			$scope.reload = function()
			{
				$scope.selectAll();
			};
			$scope.isComplexQuery = function(q)
			{
				if(q.query) return true;
				return false;
			};
			$scope.addAll = function()
			{
				var query = {
					query: $scope.searchAvailable,
					filters: $scope.availableQuery.filters
				};
				$scope.currentProgress = true;
				api.addAllByState(query).then(function(){
					$scope.searchCurrent = undefined;
					$scope.searchAvailable = undefined;
					$scope.searchCurrent = undefined;
					$scope.selectAll();
				}, function()
				{
					$scope.currentProgress = false;
				});
			};
			$scope.removeAll = function()
			{
				var query = {
					query: $scope.searchCurrent,
					filters: $scope.currentQuery.filters
				};
				$scope.currentProgress = true;
				api.removeAllByState(query).then(function(){
					$scope.searchCurrent = undefined;
					$scope.searchAvailable = undefined;
					$scope.currentProgress = false;
					$scope.selectAll();
				}, function()
				{
					$scope.currentProgress = false;
				});
			};
			$scope.selectAll = function()
			{
				$scope.listStateName = $state.current.name;
				$scope.currentProgress = true;
				$scope.currentError = false;
				delete $scope.currentAlertId;
				api.listByState($scope.currentQuery).then(function(res)
				{
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					$scope.currentItems = res.data;
					if(!$scope.currentItems.data)
					{
						$scope.currentItems.data = [];
					}
					$scope.currentProgress = false;
					$scope.currentError = false;
					$scope.currentAlertId = !$scope.items || $scope.items.length == 0 ? ($scope.isComplexQuery($scope.currentQuery) ? "noMatch" : "empty") : undefined;
				}, function(res) {
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					$scope.currentItems = {data:[]};
					$scope.currentProgress = false;
					$scope.currentError = true;
					$scope.currentAlertId = "apiError";
				});
				$scope.availableProgress = true;
				$scope.availableError = false;
				delete $scope.availableAlertId;
				api.listByState($scope.availableQuery).then(function(res)
				{
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					$scope.availableItems = res.data;
					$scope.availableProgress = false;
					$scope.availableError = false;
					$scope.availableAlertId = !$scope.items || $scope.items.length == 0 ? ($scope.isComplexQuery($scope.availableQuery) ? "noMatch" : "empty") : undefined;
				}, function(res) {
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					$scope.availableItems = {data:[]};
					$scope.availableProgress = false;
					$scope.availableError = true;
					$scope.availableAlertId = "apiError";
				});
			};
			// search
			$scope.onSearchModify = function(delay, minLength)
			{
				if($scope.query && $scope.query.query && $scope.query.query.length < minLength) return;
				if($scope.timer) $timeout.cancel($scope.timer);
				$scope.timer = $timeout(function(){
					delete $scope.timer;
					$scope.selectAll();
				}, delay);
			};
					
			$rootScope.$on('DataChanges', function(event, changes, data)
			{
				if(data.view === api.name && data.item)
				{
					$scope.selectAll();
				}
			});
			$scope.goToState = function(state, stateParams, options) {
				$state.go(state, stateParams, options);
			}; 
		}
    };
});