apishore.directive("workflowStart", function($injector, $modal, apishoreUtils)
{
    console.log("workflowAction directive load");
    return {
        restrict: 'E',
        templateUrl : window.apishoreConfig.webappRoot+"/$ng/apishore/directives/workflow-start.html",
        scope: {
            model: '=',
            roles: '='
        },

        link: function ($scope, element, $attrs)
        {
            var api = $injector.get(apishoreUtils.apiName($attrs.api));
            var start = $scope.state = api[$attrs.workflow+'Start'];

            $scope.disabled = function (to)
            {
            	return !(to && to.access($scope.roles));
            };
            $scope.doTransition = function (to)
            {
                if(!angular.isDefined(to))
                {
                    console.log("Unknown transition:" + to);
                    return;
                }
                var submit = function(item, callback)
                {
                    item.id = $scope.model && $scope.model.id;
                    to.go(item, function(res)
                    {
                        $scope.model = res.data;
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
                    }, callback);
                };
                var templateUrl = to.templateUrl;
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
