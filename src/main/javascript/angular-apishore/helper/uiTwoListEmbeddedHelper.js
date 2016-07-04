/**
 * UI List Helper provides common code for generated js
 */
apishore.factory("uiTwoListEmbeddedHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, $rootScope) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		$scope.availableItems = { data: [] };

    		$scope.restApi = api;

    		$scope.availableQuery = {
				offset: 0,
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
				if(!$scope.itemsIdData)
				{
					$scope.itemsIdData = [];
				}
				$scope.itemsData.data.splice(0, 0, item);
				$scope.itemsIdData.splice(0, 0, item.data.id);
				$scope.availableItems.data.splice($index, 1);
			};
			$scope.removeItem = function(item, $index, $event)
			{
				if(!angular.isDefined($scope.availableItems.data))
				{
					$scope.availableItems.data = [];
				}
				$scope.availableItems.data.splice(0, 0, item);
				$scope.itemsData.data.splice($index, 1);
				$scope.itemsIdData.splice($index, 1);
				item.$progress = false;
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
				Array.prototype.push.apply($scope.itemsData.data, $scope.availableItems.data);
				$scope.availableItems.data = [];
				$scope.itemsIdData = [];
				for(var i=0;i<$scope.itemsData.data.length;i++)
				{
					$scope.itemsIdData.push($scope.itemsData.data[i].data.id);
				}
			};
			$scope.removeAll = function()
			{
				Array.prototype.push.apply($scope.availableItems.data, $scope.itemsData.data);
				$scope.itemsData.data = [];
				$scope.itemsIdData = [];
			};
			$scope.selectAll = function()
			{
				$scope.listStateName = $state.current.name;
				$scope.availableProgress = true;
				$scope.availableError = false;
				delete $scope.availableAlertId;
				api.listByState($scope.availableQuery).then(function(res)
				{
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					$scope.availableItems = res.data;
					var ids = {};
					if($scope.itemsIdData)
					{
						for(var i = 0; i < $scope.itemsIdData.length; i++)
						{
							ids[$scope.itemsIdData[i]] = true;
						}
					}
					for(var i=0;i<$scope.availableItems.data.length;i++)
					{
						if(ids[$scope.availableItems.data[i].data.id])
						{
							$scope.availableItems.data.splice(i, 1);
							i--;
						}
					}
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