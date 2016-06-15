/**
 * UI Edit Form Helper provides common code for generated js
 */
apishore.factory("uiEditFormHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    return {
    	init : function(api, $scope, elem, attrs, itemId)
        {
    			uiEntityHelper.init(api,$scope, elem, attrs);

            $scope.options ={
                showHeader : angular.isDefined(attrs.headerText),
                saveStateDefined : angular.isDefined(attrs.saveState),
                cancelStateDefined : angular.isDefined(attrs.cancelState)
            };
            $scope.serverError = false;
            $scope.permissions = {};
            $scope.accessViolation = false;
            $scope.submitting = false;
            $scope.topFormIsSubmitted = false;

            if(angular.isDefined(attrs.data))
            {
                //use data attribute as source
                $scope.itemData = $scope.data ? $scope.data : { data: {}};
            }
            else
            {
	            	api.getByState("edit").then(function(data)
	    			{
	            		$scope.itemData = data.data;
	            		$scope.permissions = data.data.permissions;
	    			});
            }
			$scope.onDropDownSelect = function(){};

            $scope.onFieldChange = function(fieldId)
            {
            	if($scope.onFormFieldChange) $scope.onFormFieldChange(fieldId);
            };
			$scope.submitFromEmbeddedForm = function()
			{
				this.submitForm(this.itemForm);
			};
            $scope.submitForm = function(form)
            {
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
            $scope.afterSave = function(item)
            {
            	$scope.navigateBack();
//                if($scope.options.saveStateDefined)
//                {
//                    //$scope.clearItemForm();
//                    $state.go($scope.saveState);
//                }
//                $scope.onSave({id: item.id, item: item});
            };
            $scope.cancel = function(item)
            {
                if($scope.options.cancelStateDefined)
                {
                    //$scope.clearItemForm();
                    $state.go($scope.cancelState);
                }
                $scope.onSave({id: item.id, item: item});
            };
            $scope.clearItemForm = function()
            {
                $scope.itemData = { data: {} };
            };
        }
	};
});