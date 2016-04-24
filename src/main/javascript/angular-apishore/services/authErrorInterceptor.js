'use strict';
apishore.factory('errorInterceptor', ['$injector', '$q',
    function($injector, $q)
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
                switch(rejection.status)
                {
                    case 401:
                    case 403:
                        var apishoreAuth = $injector.get('apishoreAuth');
                        apishoreAuth.login();
                        break;
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
