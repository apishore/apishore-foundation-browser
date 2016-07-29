var apishore = angular.module('apishore', ['ngSanitize', 'ui.bootstrap', 'ui.mask',
    'timer', 'ui.router', 'ngTable', 'angularSpinner', 'textAngular']);

apishore.run(['$window', '$rootScope', '$timeout', 'apishoreNumbers', function($window, $rootScope, $timeout, apishoreNumbers)
{
    $rootScope.apishoreNumbers = apishoreNumbers;

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

