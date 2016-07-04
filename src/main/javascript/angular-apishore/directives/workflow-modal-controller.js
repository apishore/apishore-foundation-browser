apishore.controller('apishoreWorkflowModalController', function($scope, $modalInstance, submit)
{
    $scope.itemData = {};

    $scope.submitForm = function(form)
    {
        submit($scope.itemData, function(data)
        {
            var error = data.error;
            if (error)
            {
                $scope.serverError = true;
            }
            for(var f in data)
            {
                if(form[f])
                {
                    form[f].$setValidity('server', false);
                    form[f].$error.server = data[f];
                }
            }
        });
    };

    $scope.cancel = function()
    {
        $modalInstance.dismiss('cancel');
    };

});