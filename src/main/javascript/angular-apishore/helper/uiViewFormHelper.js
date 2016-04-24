/**
 * UI View Form Helper provides common code for generated js
 */
apishore.factory("uiViewFormHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		uiEntityHelper.init(api,$scope, elem, attrs);
    		$scope.settings = {data:{}};
			$scope.options = {
				showHeader : angular.isDefined(attrs.headerText),
				showDelete : angular.isDefined(attrs.deleteState),
				showEdit : angular.isDefined(attrs.editState),
				showCancel : angular.isDefined(attrs.cancelState),
				headerText : attrs.headerText
			};
			$scope.permissions = {};
			$scope.itemUI = {};
			$scope.accessViolation = false;
			
			$scope.toggleSettings = function($event)
			{
				$scope.showSettings = !$scope.showSettings;
				if($event) $event.stopPropagation();
			};
			
			$scope.reload = function()
			{
				if(angular.isDefined(attrs.data))
				{
					//use data attribute as source
					$scope.itemData = $scope.data ? $scope.data : { data: {}};
				}
				else
				{
					$scope.itemData = {data: {}};
					$scope.progress = true;
					api.getByState("view").then(function(res){
						$scope.itemData = res.data;
						$scope.permissions = res.data.permissions;
						$scope.dataRoles = res.data.roles;
						$scope.dashboard = res.data.dashboard;
						$scope.settings.data = res.data.settings || $scope.settings;
						
						$scope.progress = false;
					}, function(res) {
						$scope.itemData = { data:{}};
						$scope.accessViolation = true;
						$scope.permissions = {};
						$scope.dataRoles = [];
						$scope.progress = false;
					});
				}
			};
			
			$scope.deleteItem = function(){
				api.remove();
			};
			$scope.editItem = function(){
				if(angular.isDefined($scope.editState))
				{
					$state.go($scope.editState);
				}
			};
			$scope.cancelItem = function(){
				if(angular.isDefined($scope.cancelState))
				{
					$state.go($scope.cancelState);
				}
			};
			$scope.goToState = function(state, stateParams, options) {
				$state.go(state, stateParams, options);
			}; 
    	}
    };
});