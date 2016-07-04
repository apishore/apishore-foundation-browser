apishore.directive('asDefaultImage', function ($q) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            attrs.$observe('ngSrc', function (ngSrc) {
                var deferred = $q.defer();
                var image = new Image();
                image.onerror = function () {
                	deferred.resolve(false);
                	switch(attrs.asDefaultImage)
                	{
                		case "$hide":
                		{
                			element.hide();
                			break;
                		}
                		default:
                		{
                			element.attr('src', attrs.asDefaultImage); // set default image
                		}
                	}
                };
                image.onload = function () {
                    deferred.resolve(true);
                };
                image.src = ngSrc;
                return deferred.promise;
            });
        }
    };
});