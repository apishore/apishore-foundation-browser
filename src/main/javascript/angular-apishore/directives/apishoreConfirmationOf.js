apishore.directive("apishoreConfirmationOf", function()
{
    return {
        restrict: 'A',
        require: '^ngModel',
        link: function($scope, $elem, $attrs, $ctrl)
        {
            var validate = function(value)
            {
                var valid = angular.equals(value, $scope.itemData.data[$attrs.apishoreConfirmationOf]);
                $scope.formField.$setValidity('confirmation', valid);
            };
            $scope.$watch('itemData.data.' + $attrs.apishoreConfirmationOf, function(newValue)
            {
                if(angular.isDefined(newValue))
                {
                    validate($scope.model); // XXX: model is hardcoded here
                }
            });
            $ctrl.$parsers.push(function(value)
            {
                validate(value);
                return value;
            });
        }
    };
});
