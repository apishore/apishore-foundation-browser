//console.info("Declare categoryPublicListDirective");
apishore.directive("apishoreListAll", function($injector, apishoreUtils, $location, $state)
{
    return {
        restrict: 'E',
        scope: {
            useState: '=',
            viewName: '@view',
            parentId: '=',
            query: '='
        },
        replace: true,
        transclude: true,

        templateUrl: '$ng/apishore/directives/ListAllDirective.html',
        compile: function()
        {

            return {
                post: function($scope, $element, attrs)
                {
                    console.info("Link apishore-list-all");
                    var factory = $injector.get(apishoreUtils.apiName($scope.viewName));
                    //init
                    $scope.options = {
                        createEnabled: angular.isDefined(attrs.onCreate) || angular.isDefined($scope.createState),
                        enableSorting: true
                    };
                    $scope.permissions = {};
                    $scope.accessViolation = false;

                    $scope.items = [];
                    if(!$scope.query) $scope.query = { limit: 0 };

                    $scope.go = function(state, item)
                    {
                        if(angular.isDefined(state))
                        {
                            var p = {};
                            //define parameter only if item is exist
                            if(item)
                            {
                                p.category_id = item.id;
                            }
                            $state.go(state, p);
                        }
                    };
                    $scope.viewItem = function(item)
                    {
                        $scope.go($scope.viewState, item);
                    };
                    $scope.editItem = function(item)
                    {
                        $scope.go($scope.editState, item);
                    };
                    $scope.createItem = function()
                    {
                        if(angular.isDefined($scope.createState))
                        {
                            $scope.go($scope.createState);
                        }
                        else
                        {
                            $scope.onCreate();
                        }
                    };

                    var promise;
                    if($scope.useState)
                    {
                        promise = factory.selectByState($scope.query);
                    }
                    else if(angular.isDefined(factory.selectByParent) && angular.isDefined($scope.parentId))
                    {
                        promise = factory.selectByParent($scope.query, $scope.parentId);
                    }
                    else
                    {
                        promise = factory.select($scope.query, "view");
                    }
                    promise.then(function(res)
                    {
                        $scope.items = res.data.data;
                        $scope.roles = res.data.roles;
                        $scope.permissions = res.data.permissions;
                    }, function(res)
                    {
                        $scope.items = [];
                        $scope.query.offset = 0;
                        $scope.pagination = {};
                        $scope.pages = [];
                        $scope.accessViolation = true;
                        $scope.permissions = {};
                    });
                }
            }
        }
    };
});
