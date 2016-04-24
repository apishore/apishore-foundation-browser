apishore.directive("workflowAction", function($injector, $modal, userRoles, apishoreUtils, apishoreAuth)
{
    console.log("workflowAction directive load");
    return {
        restrict: 'E',
        templateUrl : window.apishoreConfig.webappRoot+"/$ng/apishore/directives/workflow-action.html",
        scope: {
            model: '=',
            roles: '=',
            show: '=',
            workflow: '='
        },

        link: function ($scope, element, $attrs)
        {
            //console.log("workflowAction directive link");
            var api = $injector.get($attrs.api);
            var workflowField = 'workflow'+apishoreUtils.toClassName($attrs.workflow)+'State';
            
            function apply()
            {
            	$scope.stateApi = api[$attrs.workflow][$scope.model.data[workflowField]];
            	$scope.state = api[$attrs.workflow+'States'][$scope.model.data[workflowField]];
            }
            apply();
            
            $scope.$watch("model.data."+workflowField, apply);
            
            $scope.hidden = function (to){
            	var mode = $scope.stateApi[to + 'DisableMode'];
                if(mode == "hidden")
                {
                    return $scope.disabled(to);
                }
                return false;
            };
            $scope.allowed = function allowed(to)
            {
                var config = $scope.stateApi[to + 'Config'];

                var fn = $scope.stateApi[to + 'Access'];
                if(fn)
                {
                    return fn($scope.roles);
                }
                else
                {
                    //console.error("Unknown transition:"+to);
                    //TODO: rebuild list before check disable
                    return false;
                }
            };
            $scope.disabled = function disabled(to)
            {
                var enableExpr = $scope.stateApi[to + 'Enabled'];
                if(enableExpr)
                {
                	if(!enableExpr($scope.model.data, $scope.roles)) return true;
               	};
                var config = $scope.stateApi[to + 'Config'];
                var disabled = !$scope.allowed(to);
                if(disabled)
                {
                    if(config && config.roles)
                    {
                        for(var i in config.roles)
                        {
                            var role = config.roles[i];
                            if(userRoles._getRoleGrant(role))
                            {
                                return false; // user can get role by some action
                            }
                        }
                    }
                }
                return disabled;
            };
            $scope.doTransition = function (to)
            {
                var transition = $scope.stateApi[to];
                var config = $scope.stateApi[to+'Config'];

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
                    return;
                }
                if(!angular.isDefined(transition))
                {
                    console.log("Unknown transition:" + to);
                    return;
                }
                var submit = function(item, callback)
                {
                    item.id = $scope.model.data.id;
                    transition(item, function(res)
                    {
                        $scope.model = res;
                        $scope.roles = res.roles;
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
                    submit($scope.model.data);
                }
            };
        }
    };
});
