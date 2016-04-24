/**
 * UI View Form Helper provides common code for generated js
 */
apishore.factory("uiEmbeddedViewFormHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		uiEntityHelper.init(api,$scope, elem, attrs);
			
			$scope.deleteItem = function(){
			};
			$scope.editItem = function(){
			};
			$scope.cancelItem = function(){
			};
			$scope.goToState = function(state, stateParams, options){
			};
    	}
    };
});