apishore.directive('asDigitsRestriction', [function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
        	var len = attr.asDigitsRestriction;
            function fromUser(text) {
                if (!text)
                    return text;
                
                var c = text.replace(/\D*/g, "");
                if(c.length > len)
                {
                	c = c.substring(0, len);
               	}
                if (c != text)
                {
                    ngModel.$setViewValue(c);
                    ngModel.$commitViewValue();
                    ngModel.$render();
                }
                return text;
            }
            ngModel.$parsers.push(fromUser);
        }
    };
}]);
