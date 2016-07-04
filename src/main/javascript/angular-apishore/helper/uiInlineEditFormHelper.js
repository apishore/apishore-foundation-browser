/**
 * UI Edit Form Helper provides common code for generated js
 */
apishore.factory("uiInlineEditFormHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    return {
    	init : function(api, $scope, elem, attrs)
        {
    			uiEntityHelper.init(api,$scope, elem, attrs);

            $scope.serverError = false;
            $scope.permissions = {};
            $scope.accessViolation = false;
            $scope.submitting = false;
            $scope.itemDataCopy = angular.copy($scope.itemData.data);
            $scope.onFieldChange = function(fieldId)
            {
            		if($scope.onFormFieldChange) $scope.onFormFieldChange(fieldId);
            };
			$scope.onDropDownSelect = function(){};
			$scope.deleteItem = function()
			{
				api.removeByState($scope.itemData.data.id).then(
				function(){
					if($scope.onDelete) $scope.onDelete({id:$scope.itemData.data.id});
				},
				function(){
					if($scope.onDelete) $scope.onDelete({id:$scope.itemData.data.id});
				});
			};
            $scope.submitForm = function(form)
            {
                form = form || $scope.itemForm;
                window.apishoreQA.submitting = true;
                $scope.serverError = false;
                $scope.topFormIsSubmitted = true;
                for(var f in form)
                {
                    if(form[f] && form[f].$error && form[f].$error.server)
                    {
                        delete form[f].$error.server;
                    }
                }
                form.$setSubmitted(true);
                if(!form.$valid)
                {
                		$scope.scrollToFirstError();
                    window.apishoreQA.submitting = false;
                    return false;
               	}

                var item = {};
                item.id = $scope.itemData.data.id;
                api.transform($scope.itemData.data, item);
                $scope.submitting = true;
                if($scope.onBeforeSave) $scope.onBeforeSave({itemData:$scope.itemData});
                api.updateByStateAndId(item).then(function(res){
                    $scope.submitting = false;
                    $scope.afterSave(res.data);
                    window.apishoreQA.submitting = false;
                    $scope.topFormIsSubmitted = false;
                    $scope.$emit('changed$' + api.view,
                        {
                            type: 'update',
                            item: res.data.data,
                            permissions: res.data.permissions,
                            roles: res.data.roles
                        });
                    if(res.data.changes)
                    {
                        $scope.$emit('DataChanges', res.data.changes, {
                            view: api.name,
                            item: res.data.data,
                            roles: res.data.roles
                        });
                    }
                }, function(data)
                {
                    $scope.submitting = false;
                    window.apishoreQA.submitting = false;
                    $scope.topFormIsSubmitted = true;
                    form.$setSubmitted(false);
                    var error = data.data.error;
                    if (error)
                    {
                        $scope.serverError = true;
                    }
                    for(var f in data.data)
                    {
                        if(form[f])
                        {
                            form[f].$setValidity('server', false);
                            form[f].$error.server = data.data[f];
                        }
                    }
                });
            };
			$scope.submitFromEmbeddedForm = function()
			{
				this.$parent.submitFromEmbeddedForm();
			};
            $scope.afterSave = function(item)
            {
            		if($scope.onSave) $scope.onSave({itemData:item});
            };
            $scope.cancel = function()
            {
            		$scope.itemData.data = $scope.itemDataCopy;
            		if($scope.onCancel) $scope.onCancel({itemData:$scope.itemData});
            };
            $scope.clearItemForm = function()
            {
                $scope.itemData = { data: {} };
            };
        }
	};
});