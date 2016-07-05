var apishore = angular.module('apishore', ['ngSanitize', 'ui.bootstrap', 'ui.mask',
    'timer', 'ui.router', 'ngTable', 'angularSpinner', 'textAngular']);

apishore.run(['$window', '$rootScope', '$timeout', 'apishoreNumbers', function($window, $rootScope, $timeout, apishoreNumbers)
{
    var wnd = $($window);
    var di = $rootScope.asDevice = {};
    $rootScope.apishoreNumbers = apishoreNumbers;
    function setMode()
    {
        var md = new MobileDetect(window.navigator.userAgent);
        var w = wnd.width(), h = wnd.height();

        function variants()
        {
            di.isWide = di.isTablet || di.isDesktop;
            di.isMobile = di.isPhone || di.isTablet;
        }

        $('body').removeClass('as-device-phone as-device-tablet as-device-desktop as-device-wide-desktop as-device-phone-portrait as-device-phone-landscape');
        di.isPhone = false;
        di.isTablet = false;
        di.isDesktop = false;
        di.isPhoneLandscape = false;
        di.isPhonePortrait = false;
        if(w < 600 || md.phone())
        {
            $('body').addClass('as-device-phone');
            di.mode = "phone";
            di.isPhone = true;
            di.isPhoneLandscape = w > h;
            di.isPhonePortrait = !di.isLandscape;
            if(di.isPhoneLandscape) $('body').addClass('as-device-phone-landscape');
            if(di.isPhonePortrait) $('body').addClass('as-device-phone-portrait');
        }
        else if(w < 960 || md.tablet())
        {
            $('body').addClass('as-device-tablet');
            di.mode = "tablet";
            di.isTablet = true;
        }
        else if(w < 1900 || md.tablet())
        {
            $('body').addClass('as-device-desktop');
            di.mode = "desktop";
            di.isDesktop = true;
        }
        else
        {
            $('body').addClass('as-device-wide-desktop');
            di.mode = "desktop";
            di.isDesktop = true;
        }
        variants();
    }

    setMode();
    wnd.on('resize', function()
    {
        $rootScope.$apply(setMode)
    });

    window.apishoreQA = {
        appReady: false,
        apiRequesting: false,
        stateChanging: false,
        submitting: false,
        state: '',
        isReady: function apishoreQAisReady()
        {
            return window.apishoreQA.appReady
                && !window.apishoreQA.apiRequesting
                && !window.apishoreQA.stateChanging
                && !window.apishoreQA.submitting;
        },
        waitReady: function apishoreQAwaitReady(callback)
        {
            var el = document.querySelector('body');
            var browser = angular.element(el).injector().get('$browser');
            if(browser && browser.notifyWhenNoOutstandingRequests)
            {
                browser.notifyWhenNoOutstandingRequests(function()
                {
                    var res = window.apishoreQA.appReady
                        && !window.apishoreQA.apiRequesting
                        && !window.apishoreQA.stateChanging;
                    console.log('QA notify no outstanding requests');
                    callback(''+res)
                });
            } else {
                var res = window.apishoreQA.appReady
                    && !window.apishoreQA.apiRequesting
                    && !window.apishoreQA.stateChanging;
                callback(''+res)
            }
        }
    };

    $timeout(function appLoaded()
    {
        window.apishoreQA.appReady = true;
        console.log('QA app ready');
    }, 100);

    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams)
    {
        window.apishoreQA.stateChanging = true;
        window.apishoreQA.state = toState.name;
    });

    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams)
    {

        $timeout(function appLoaded()
        {
            window.apishoreQA.stateChanging = false;
            console.log('QA state change ready');
        }, 200);
    });
}]);

