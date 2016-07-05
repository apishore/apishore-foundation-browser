apishore.factory("apishoreAuth", function($timeout, $rootScope, $state, $http, $injector, $location, $cookies) {
	console.info("apishoreAuth init");
    $rootScope.userAuthorized = false;
    $rootScope.user = { roles: {} };
	var service = {
		logout : function(callback)
		{
			var thus = this;
            var config = window.apishoreConfig;
            var cfg = {
            	withCredentials: true
            };
            
			$http.post(config.localUrl + "/api/account/logout", {}, cfg).success(function() {
				$location.url("/");
				$window.location.reload();
			});
		},
        login : function(returnUrl)
        {
            var loc = returnUrl || window.location.href;
            //TODO: config service
            var config = window.apishoreConfig;
            if (!config.oauth)
            {
                console.log("not configured: " + JSON.stringify(config));
                return;
            }
            var redirect = config.callback + "?return=" + encodeURIComponent(loc);
            var url = config.oauth + "/login?redirect_uri=" + encodeURIComponent(redirect)
                + "&client_id=" + config.clientId
                + "&local_uri=" + config.localUrl
                + "&response_type=code";
            window.location.href = url;
        },
		getUserInfo: function(callback)
        {
        	var thus = this;
            return $injector.get('UserProfileApi').get("").success(function (data) {
				thus.user = data.data;
				if (thus.user && thus.user.login || !!thus.user.authorized) {
                    $rootScope.user = data.data;
					$rootScope.userAuthorized = thus.authorized = true;
				} else {
                    $rootScope.user = { roles: {} };
					$rootScope.userAuthorized = thus.authorized = false;
					console.log(data);
				}
				if (thus.user.roles) {
					thus.user.roles.$all = function () {
						for (var i = 0; i < arguments.length; i++) {
							var v = arguments[i];
							if (angular.isString(v)) {
								if (!thus.user.roles[v]) {
									return false;
								}
							} else if (!v) {
								return false;
							}
						}
						return true;
					};
					thus.user.roles.$any = function () {
						if (arguments.length === 0)
						{
							return true;
						}
						for (var i = 0; i < arguments.length; i++) {
							var v = arguments[i];
							if (angular.isString(v)) {
								if (thus.user.roles[v]) {
									return true;
								}
							} else if (v) {
								return true;
							}
						}
						return false;
					}
				}
				if (!angular.equals(thus.oldUser, thus.user)) {
					console.log("permissions updated", thus.user);
					service.user = thus.oldUser = thus.user;
					$rootScope.$broadcast("permissionsUpdated", thus.user);
					if(angular.isFunction(callback))
					{
						callback(service.user);
					}
					else if(angular.isString(callback))
					{
						$state.go(callback);
					}
					else if(angular.isDefined($state.current) && !angular.isDefined($state.current.abstract))
					{
						$timeout(function ()
						{
							$state.reload();
						});
					}
					else
					{
						var deregister = $rootScope.$on('$stateChangeSuccess', function ()
						{
							deregister();
							$state.reload();
						});
					}
				}
				else if(angular.isFunction(callback))
				{
					callback(service.user);
				}
				else if(angular.isString(callback))
				{
					$state.go(callback);
				}
            }).error(function (data) {
                $rootScope.userAuthorized = thus.authorized = false;
                $rootScope.user = thus.user = { roles: {} };
                console.log(data);
            });
        },
		getRoles: function () {
			return service.user && service.user.roles;
		},
		hasRole : function(required, dataRoles)
		{
			if (!service.user || !service.user.roles)
			{
				// FIXME: this is workaround for missing authorization
				return true;
			}
			if (angular.isString(required))
			{
				required = [required];
			}
			if (required.length === 0)
			{
				return true;
			}
			for(var i = 0; i<required.length; i++)
			{
				var roleToCheck = required[i];
				if(service.user.roles[roleToCheck])
				{
					return true;
				}
				if (dataRoles && dataRoles[roleToCheck])
				{
					return true;
				}
			}
			//roles specified in state MUST fit
			return false;
		},
        isAllowedState : function(state, params)
        {
			if(angular.isDefined(state) && state != null)// in docs state can be null
        	{
				if(state.name == 'account.register')
				{
					// FIXME: this is workaround for register form available to logged user
					return !this.hasRole(['logged']);
				}
	        	if(state.data && state.data.roles)
	        	{
					var dataRoles = this.collectStateDataRoles(state);
					return this.hasRole(state.data.roles, dataRoles);
	        	}
	        	var ld = state.name.lastIndexOf('.');
	        	if(ld >= 0)
	        	{
	        		var parentName = state.name.substring(0, ld);
	        		return this.isAllowedState($state.get(parentName));
	        	}
        	}
        	//visible by default
        	return true;
        },
		collectStateDataRoles: function(start, previous)
		{
			var state = start;
			var roles = previous || {};
			if(state.data && state.data.dataRoles)
			{
				angular.extend(roles, state.data.dataRoles);
			}
			var ld = state.name.lastIndexOf('.');
			if(ld >= 0)
			{
				var parentName = state.name.substring(0, ld);
				return this.collectStateDataRoles($state.get(parentName), roles);
			}
			return roles;
		}
	};

	$timeout(service.getUserInfo);
	
	return service;
});
