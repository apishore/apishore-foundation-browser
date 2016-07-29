docs.directive("deviceSample", function($rootScope, $http, $state, $timeout) {

	return {
		restrict : 'ACE',
		replace : true,
		transclude: true,
		scope: {},
		templateUrl : window.apishoreConfig.webappRoot + "/js/app/device-sample.html",
		link: function($scope, $element, attrs, ctrl, transclude) {
			
			$scope.setDeviceMode = function(mode)
	        {
				$scope.deviceMode = mode;
	        	var di = $rootScope.asDevice = {};
	        	var b = $('.as-device-emulator');
	        	b.removeClass('as-device-phone as-device-tablet as-device-desktop as-device-wide-desktop as-device-phone-portrait as-device-phone-landscape');
	        	di.isPhone = false;
	        	di.isTablet = false;
	        	di.isDesktop = false;
	        	di.isPhoneLandscape = false;
	        	di.isPhonePortrait = false;
	        	switch(mode)
	        	{
	        		case 'desktop':
	        		{
	        	        b.addClass('as-device-desktop as-device-emulation');
	        	    	di.isDesktop = true;
	        	    	return;
	        		}
	        		case 'tablet':
	        		{
	        	        b.addClass('as-device-tablet as-device-emulation');
	        	    	di.isTablet = true;
	        	    	return;
	        		}
	        		case 'phone':
	        		{
	        	        b.addClass('as-device-phone as-device-emulation');
	        	    	di.isPhone = true;
	        	    	di.isPhonePortrait = true;
	        	    	return;
	        		}
	        	};
	        };
			$scope.setDeviceMode('desktop');
			
			$timeout(function() {
				$scope.codemirror = $rootScope.codemirror;
				var html = $element.find(".as-device-emulator-content").html();
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
