/**
 * UI Edit Form Helper provides common code for generated js
 */
apishore.factory("uiEmbeddedEditFormHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    return {
    	init : function(api, $scope, elem, attrs, itemId)
        {
    		uiEntityHelper.init(api,$scope, elem, attrs);

            $scope.serverError = false;
            $scope.permissions = {};
            $scope.accessViolation = false;
            $scope.submitting = false;

            $scope.onFieldChange = function(fieldId)
            {
            	if($scope.onFormFieldChange) $scope.onFormFieldChange(fieldId);
            }
            $scope.submitForm = function(form)
            {
                return false;
            };
			$scope.submitFromEmbeddedForm = function()
			{
				this.$parent.submitFromEmbeddedForm();
			}            
            $scope.afterSave = function(item)
            {
            };
            $scope.cancel = function(item)
            {
             
            };
            $scope.clearItemForm = function()
            {
                $scope.itemData = { data: {} };
            };
        }
	};
});