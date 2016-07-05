docs.directive("apishoreShiftMenuTop", function(apishoreAuth, $rootScope, $http, $state) {

	return {
		restrict : 'E',
		replace : true,
		scope:{},
		templateUrl : "/js/app/sidebar-top-menu.html",
        link : function($scope) {
        }
	};
});
