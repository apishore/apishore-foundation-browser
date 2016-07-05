'use strict';
apishore.factory('errorInterceptor', ['$injector', '$q', '$rootScope',
    function($injector, $q, $rootScope)
    {
        return {
            'request': function(config)
            {
                return config || $q.when(config);
            },
            'response': function(response)
            {
                return response || $q.when(response);
            },
            'responseError': function(rejection)
            {
            	if(!$rootScope.publicSite)
            	{
	                switch(rejection.status)
	                {
	                    case 401:
	                    case 403:
	                        var apishoreAuth = $injector.get('apishoreAuth');
	                        apishoreAuth.login();
	                        break;
	                }
            	}
                return $q.reject(rejection);
            }
        };
    }
]).config(['$httpProvider',
    function($httpProvider)
    {
        $httpProvider.interceptors.push('errorInterceptor');
    }
]);
