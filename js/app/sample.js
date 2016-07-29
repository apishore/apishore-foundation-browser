docs.directive("sample", function(apishoreAuth, $rootScope, $http, $state, $timeout) {

	return {
		restrict : 'E',
		replace : true,
		transclude: true,
		scope:{},
		templateUrl : window.apishoreConfig.webappRoot + "/js/app/sample.html",
		link: function($scope, element, attrs, ctrl, transclude) {
			$timeout(function() {
				$scope.codemirror = $rootScope.codemirror;
        	   var html = element.find(".sample").html();
        	   var r = new RegExp(
        			    '<!--[\\s\\S]*?(?:-->)?'
        			    + '<!---+>?'  // A comment with no body
        			    + '|<!(?![dD][oO][cC][tT][yY][pP][eE]|\\[CDATA\\[)[^>]*>?'
        			    + '|<[?][^>]*>?',  // A pseudo-comment
        			    'g');
        	   html = html.replace(r, "");
        	   $scope.code = html;
           });
       }
	};
});
