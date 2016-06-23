apishore.directive('uniqueField', function()
{
   return {
      require: 'ngModel',
      scope: {
         uniqueField: '&'
      },
      link: function($scope, elem, attr, ngModel)
      {
         console.log('link uniqueField', $scope.uniqueField, ngModel);
         ngModel.$parsers.unshift(function(value)
         {
            console.log('uniqueField validate ', value);
            if($scope.uniqueField)
            {
               $scope.uniqueField({value: value})(value).then(function(res)
               {
                  console.log(res);
                  var items = res && res.data && res.data.data;
               });
            }
            return value;
         });
      }
   };
});
