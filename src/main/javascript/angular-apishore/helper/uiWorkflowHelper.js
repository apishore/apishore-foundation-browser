apishore.factory("uiWorkflowHelper", function($injector, $modal, userRoles, apishoreUtils, apishoreAuth)
{
    console.log("uiWorkflowHelper directive load");
    return {
        //restrict: 'E',
        //templateUrl : window.apishoreConfig.webappRoot+"/$ng/apishore/directives/workflow-action.html",
        //scope: {
        //    model: '=',
        //    roles: '=',
        //    show: '=',
        //    workflow: '='
        //},

        init: function(api, workflowName, $scope, element, $attrs)
        {
            //console.log("workflowAction directive link");
            function apply()
            {
            	// workflow directive can be initialized before server response
            	if($scope.workflow)
            	{
	                var state = $scope.workflow.state;
	                $scope.state = state && api[workflowName + 'States'][state];
	                $scope.stateApi = state && api[workflowName][state];
            	}
            }
            
            apply();

            $scope.$watch("workflow", apply);
            $scope.$watch("workflow.state", apply);

            $scope.hidden = function(to)
            {
                var transition = $scope.workflow.transitions[to];
                return !! (transition && transition.hidden);
            };
            $scope.allowed = function allowed(to)
            {
                var transition = $scope.workflow.transitions[to];
                return !(transition && transition.enabled);
            };
            $scope.disabled = function disabled(to)
            {
                var transition = $scope.workflow.transitions[to];
                return !(transition && transition.enabled);
            };
            $scope.doTransition = function(to)
            {
                var transition = $scope.stateApi[to];
                var config = $scope.stateApi[to + 'Config'];

                if(config && config.roles)
                {
                    var hasAnyRole = false;
                    for(var i in config.roles)
                    {
                        var role = config.roles[i];
                        var hasRole = apishoreAuth.hasRole(role, $scope.roles);
                        hasAnyRole |= hasRole;
                        if(!hasRole && userRoles._getRoleGrant(role))
                        {
                            userRoles._getRoleGrant(role).go();
                            return;
                        }
                    }
                }
                if(!hasAnyRole)
                {
                    // TODO: uncomment when we have roles
                    //return;
                }
                if(!angular.isDefined(transition))
                {
                    console.log("Unknown transition:" + to);
                    return;
                }
                var submit = function(item, callback)
                {
                    item.id = $scope.model.id;
                    transition(item, function(res)
                    {
                        $scope.model = res.data;
                        $scope.roles = res.roles;
                        $scope.workflow = res.workflow[workflowName];
                        apply();
                        if(modalInstance)
                        {
                            modalInstance.close();
                        }
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
                        var postScript = $scope.stateApi[to + 'Script'];
                        if(postScript)
                        {
                            postScript($scope.model, res.workflowResponse);
                        }
                    }, callback);
                };
                var templateUrl = config && config.templateUrl;
                if(angular.isDefined(templateUrl))
                {
                    var modalInstance = $modal.open({
                        templateUrl: templateUrl,
                        controller: 'apishoreWorkflowModalController',
                        resolve: {
                            submit: function()
                            {
                                return submit;
                            }
                        }
                    });
                }
                else
                {
                    submit($scope.model);
                }
            };
        }
    };
});
