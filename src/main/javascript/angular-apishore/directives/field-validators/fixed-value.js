apishore.directive('apishoreValidatorFixedValue', function (){ 
   return {
      require: 'ngModel',
      link: function(scope, elem, attr, ngModel) {
    	  
          function validate(value)
          {
              var v = scope.$eval(attr.apishoreValidatorFixedValue) == value;
        	  return v;
          }
          //For DOM -> model validation
          ngModel.$parsers.unshift(function(value) {
             var valid = validate(value);
             ngModel.$setValidity('fixedValue', valid);
             return valid ? value : undefined;
          });

          //For model -> DOM validation
          ngModel.$formatters.unshift(function(value) {
             ngModel.$setValidity('fixedValue', validate(value));
             return value;
          });
      }
   };
});
