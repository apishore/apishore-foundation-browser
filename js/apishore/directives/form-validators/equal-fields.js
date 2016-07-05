apishore.directive('apishoreFormValidatorEqualFields', function (){ 
   return {
      require: 'ngModel',
      link: function(scope, elem, attr, ngModel) {
    	  var cfg = scope.$eval(attr.apishoreFormValidatorEqualFields);
    	  
          function cl()
          {
        	  var test = undefined;
        	  var result = true;
        	  for(var p in cfg)
              {
            	  var n = scope.$eval(cfg[p]);
            	  if(test != undefined)
            	  {
            		  result = result && (n == test);
            	  }
            	  else
            	  {
            		  test = n;
            	  }
              }
        	  ngModel.$setViewValue(""+result);
        	  ngModel.$commitViewValue();
          }
          cl();
          for(var p in cfg)
          {
        	  scope.$watch(cfg[p], cl);
          }
          //For DOM -> model validation
          ngModel.$parsers.unshift(function(value) {
             var valid = value == "true";
             ngModel.$setValidity('equalFields', valid);
             return valid ? value : undefined;
          });

          //For model -> DOM validation
          ngModel.$formatters.unshift(function(value) {
             ngModel.$setValidity('equalFields', value == "true");
             return value;
          });
      }
   };
});
