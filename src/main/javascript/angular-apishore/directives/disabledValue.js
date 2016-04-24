// this directive is applied to input by apishoreUtils.adjustFormGroupTemplateInput from disabled-value attribute
apishore.directive('apishoreDisabledValue', function()
{
    return {
        restrict: 'A',
        require: ['^ngModel'],
        compile: function($elem, $attrs)
        {
            return {
                post: function($scope)
                {
                    if(!angular.isDefined($attrs.ngDisabled))
                    {
                        return;
                    }
                    // watch disable expression
                    $scope.$watch($attrs.ngDisabled, function(newValue, oldValue)
                    {
                        if(!!newValue)
                        {
                            $scope.apishoreDisabledValue = $scope.model;
                            $scope.model = $scope.$eval($attrs.apishoreDisabledValue);
                        }
                        else if(angular.isDefined($scope.apishoreDisabledValue))
                        {
                            $scope.model = $scope.apishoreDisabledValue;
                        }
                    });
                    $scope.$watch('model', function(newValue, oldValue)
                    {
                        var disabled = $scope.$eval($attrs.ngDisabled);
                        var value = $scope.$eval($attrs.apishoreDisabledValue);
                        if (!!disabled && value != newValue)
                        {
                            $scope.apishoreDisabledValue = $scope.model;
                            $scope.model = value;
                        }
                    });
                }
            }
        }
    }
});