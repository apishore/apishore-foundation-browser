'use strict';
angular.module('apishore').factory('apishoreQAinterceptor', ['$q', '$injector'
    , function($q, $injector)
    {
        function checkPendingRequests()
        {
            var $http = $injector.get('$http');
            if($http && window.apishoreQA)
            {
                window.apishoreQA.apiRequesting = $http && $http.pendingRequests.length > 1;
                console.log('QA requesting: ' + window.apishoreQA.apiRequesting);
            }
        }

        return {
            'response': function(response)
            {
                checkPendingRequests();
                return response || $q.when(response);
            },
            'responseError': function(rejection)
            {
                checkPendingRequests();
                return $q.reject(rejection);
            }
        };
    }
]).config(['$httpProvider',
    function($httpProvider)
    {
        $httpProvider.interceptors.push('apishoreQAinterceptor');
    }
]);
