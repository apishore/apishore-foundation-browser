apishore.directive("asAvatarImg", function(apishoreAuth, $rootScope, $http, $state) {

	return {
		restrict : 'C',
		scope: false,
        link : function($scope, elem) {
        	elem.css({opacity: 0});
        	elem.bind('load', function() {
        		elem.css({opacity: 1});
            });
        	elem.bind('error', function(){
            });
        }
	};
});
