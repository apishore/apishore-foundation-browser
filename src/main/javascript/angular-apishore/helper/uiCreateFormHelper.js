/**
 * UI Create Form Helper provides common code for generated js
 */
apishore.factory("uiCreateFormHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, uiEntityHelper) {
    var helper = {
    	init : function(api, $scope, elem, attrs)
    	{
    		uiEntityHelper.init(api, $scope, elem, attrs);
    		
            $scope.itemData = {
                data: {}
            };
            $scope.serverError = false;
            $scope.submitting = false;
            $scope.topFormIsSubmitted = false;

            api.setDefaults($scope.itemData.data);
            $scope.options = {
                    showHeader: angular.isDefined(attrs.headerText),
                    saveStateDefined: angular.isDefined(attrs.saveState),
                    saveStateParameterDefined: angular.isDefined(attrs.saveStateParameter),
                    cancelStateDefined: angular.isDefined(attrs.cancelState)
                };
            $scope.onFieldChange = function(fieldId)
            {
            	if($scope.onFormFieldChange) $scope.onFormFieldChange(fieldId);
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
                api.transform($scope.itemData.data, item);
                $scope.submitting = true;
                var promise = $scope.createCopy ? api.createCopy(item, $scope.saveState) : api.createByState(item, $scope.saveState);
                promise.then(function(res)
                {
                	api.setDefaults($scope.itemData.data);
                    $scope.submitting = false;
                    form.$setSubmitted(false);
                    $scope.topFormIsSubmitted = false;
                    $scope.afterSave(res.data.data, form);
                    window.apishoreQA.submitting = false;
                	form.$setPristine();
                    $scope.$emit('changed$' + api.name,
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
                    form.$setSubmitted(false);
                    $scope.topFormIsSubmitted = true;
                    var error = data.data.error;
                    if(error)
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
            $scope.afterSave = function(item, form)
            {
                if($scope.options.saveStateDefined)
                {
                    // TODO: #187 clear sensitive data on submit
                    //$scope.clearItemForm();
                    var p = {};
                    if($scope.options.saveStateParameterDefined)
                    {
                        p[$scope.saveStateParameter] = item.id;
                    }
                    $state.go($scope.saveState, p);
                }
                $scope.onSave({id: item.id, item: item});
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
                $scope.itemData = {
                    data: {}
                };
            };
            if($scope.realtimeCustomEval)
            {
                var realtimeEvalRequest = null;
                function getRealtimeEval()
                {
                    if(realtimeEvalRequest)
                    {
                        return;
                    }
                    var item = {};
                    api.transform($scope.itemData.data, item);
                    realtimeEvalRequest = api.customCreateOperation("realtime_custom", item, $scope.saveState);
                    realtimeEvalRequest.then(function realtimeCustomResponse(res){
                        console.log(res);
                        if(res.data.data)
                        {
                            $scope.realtimeCustomEval(res.data.data);
                        }
                        realtimeEvalRequest = undefined;
                    }, function realtimeCustomError(res){
                        console.log(res);
                        realtimeEvalRequest = undefined;
                    });
                }
                $scope.$watch("itemData.data", function (nv, ov) {
                    getRealtimeEval();
                }, true);
            }
    	},
        initNamedFilter : function(api, $scope, elem, attrs)
        {
            helper.init(api, $scope, elem, attrs);
            $scope.submitForm = function(form)
            {
                var item = {};
                api.transform($scope.itemData.data, item);
                $scope.query.filter_parameter = JSON.stringify(item);
                $scope.onSave(item);
            };
        }
    };
    return helper;
});