apishore.directive("apishoreView", function($injector, apishoreUtils, $location, $state, $stateParams)
{
    return {
        restrict: 'E',
        scope: {
            view: '@',

            //useState : '=',
            data: '=',
            itemId: '=',

            headerText: '=',
            deleteState: '@',
            editState: '@',
            cancelState: '@'
        },
        replace: true,
        transclude: true,

        template: '<div ng-transclude="child"></div>',
        //templateUrl: '$ng/apishore/directives/ViewDirective.html',
        compile: function($element, attrs)
        {

            return {
                post: function($scope, $element, attrs, ctrl, $transclude)
                {
                    var factory = $injector.get(apishoreUtils.apiName($scope.view));
                    $scope.options = {
                        showHeader: angular.isDefined(attrs.headerText),
                        showDelete: angular.isDefined(attrs.deleteState),
                        showEdit: angular.isDefined(attrs.editState),
                        showCancel: angular.isDefined(attrs.cancelState),
                        headerText: attrs.headerText
                    };
                    $scope.permissions = {};
                    $scope.accessViolation = false;

                    if(angular.isDefined(attrs.data))
                    {
                        //use data attribute as source
                        $scope.itemData = $scope.data ? $scope.data : {};
                    }
                    else
                    {
                        $scope.itemData = {};
                        //if(angular.isDefined(attrs.useState))
                        //$scope.itemData.data.id = $stateParams.{{stateParamItemId}};
                        // use item-id as source
                        $scope.itemData.data.id = $scope.itemId || attrs.itemId;
                        apishoreUtils.applyFactory(factory, $scope);
                    }

                    $scope.deleteItem = function()
                    {
                        if(angular.isDefined($scope.deleteState))
                        {
                            $state.go($scope.deleteState);
                        }
                    };

                    $scope.editItem = function()
                    {
                        if(angular.isDefined($scope.editState))
                        {
                            $state.go($scope.editState);
                        }
                    };
                    $scope.cancelItem = function()
                    {
                        if(angular.isDefined($scope.cancelState))
                        {
                            $state.go($scope.cancelState);
                        }
                    };
                }
            }
        }
    };
});
