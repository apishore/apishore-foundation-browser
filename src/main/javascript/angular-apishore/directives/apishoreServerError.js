// old deprecate validation for directive per type 
apishore.directive("apishoreServerError", function() {
    return {
        restrict : 'A',

        link: function($scope)
        {
            $scope.$watch('model', function() {
                if($scope.formField && $scope.formField.$error && $scope.formField.$error.server)
                {
                    delete $scope.formField.$error.server;
                    $scope.formField.$setValidity('server', true);
                }
            });
        }
    };
});

// new validation for inline 
apishore.directive("apishoreInputServerError", function() {
    return {
        restrict : 'A',
        require: '?ngModel',
        link: function(scope, element, attrs, ctrl)
        {
        	function fn()
        	{
        		ctrl.$setValidity('server', true);
        		ctrl.$setValidity('unique', true);//TODO:remove after refactoring of server validators
        	}
        	element.bind('change', fn);
        }
    };
});
