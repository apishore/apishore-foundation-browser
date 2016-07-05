apishore.directive('apishoreDisableHide', function(apishoreUtils)
{
    return {
        restrict: 'A',
        compile: function($element, $attrs)
        {
            var disabled = apishoreUtils.disabledExpression($attrs);
            return {
                post: function($scope, $element)
                {
                    $scope.$watch(disabled, function(newValue)
                    {
                        if(!newValue)
                        {
                            $element.removeClass('ng-hide');
                        }
                        else
                        {
                            $element.addClass('ng-hide');
                        }
                    });
                }
            }
        }
    }
});