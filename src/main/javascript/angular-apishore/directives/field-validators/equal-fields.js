apishore.directive('apishoreFormValidatorEquals', function (){ 
   return {
      require: 'ngForm',
      link: function(scope, elem, attr, ngForm) {
    	  
          function validate(value)
          {
              var v = scope.$eval(attr.fields) == value;
        	  return v;
          }
          //For DOM -> model validation
          ngForm.$parsers.unshift(function(value) {
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
