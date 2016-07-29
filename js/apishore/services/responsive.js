/**
 * 
 */
apishore.factory("apishoreResponsive", ['$window', '$rootScope', '$timeout', function($window, $rootScope, $timeout) {
	var wnd = $($window);
	var di = $rootScope.asDevice = {};
    
    function setMode(mode)
    {
        function variants()
        {
            di.isWide = di.isTablet || di.isDesktop;
            di.isMobile = di.isPhone || di.isTablet;
        }
        var b = $('body');
        b.removeClass('as-device-phone as-device-tablet as-device-desktop as-device-wide-desktop as-device-phone-portrait as-device-phone-landscape');
        di.isPhone = false;
        di.isTablet = false;
        di.isDesktop = false;
        di.isPhoneLandscape = false;
        di.isPhonePortrait = false;
        switch(mode)
        {
        	case "phone-landscape":
        	{
        		b.addClass('as-device-phone as-device-phone-landscape');
	            di.mode = "phone";
	            di.isPhone = true;
	            di.isPhoneLandscape = true;
	            break;
        	}
        	case "phone-portrait":
        	{
        		b.addClass('as-device-phone as-device-phone-portrait');
	            di.mode = "phone";
	            di.isPhone = true;
	            di.isPhonePortrait = true;
	            break;
        	}
        	case "tablet":
        	{
        		b.addClass('as-device-tablet');
	            di.mode = "phone";
	            di.isTablet = true;
	            break;
        	}
        	case "desktop":
        	{
	            b.addClass('as-device-desktop');
	            di.mode = "desktop";
	            di.isDesktop = true;
        	}
        	case "wide-desktop":
        	{
	            b.addClass('as-device-wide-desktop');
	            di.mode = "desktop";
	            di.isDesktop = true;
        	}
        }
        variants();
    };
    
    function detectMode()
    {
    	if(di.isForced) return;
    	
        var md = new MobileDetect(window.navigator.userAgent);
        var w = wnd.width(), h = wnd.height();

        if(w < 600 || md.phone())
        {
        	setMode(w > h ? 'phone-landscape' : 'phone-portrait');
        }
        else if(w < 960 || md.tablet())
        {
        	setMode('tablet');
        }
        else if(w < 1900 || md.tablet())
        {
        	setMode('desktop');
        }
        else
        {
            setMode('wide-desktop');
        }
    }

    wnd.on('resize', function()
    {
        $rootScope.$apply(detectMode);
    });
    
    //first run
    detectMode();
    // return service
	return {
		/**
		 * Force responsive mode for test and demo purposes
		 */
		force : function(mode)
		{
			if(mode)
			{
				di.isForced = true;
				setMode(mode);
			}
			else
			{
				di.isForced = false;
				detectMode();
			}
		}
	};
}]);
apishore.run(["apishoreResponsive", function(apishoreResponsive){}]);