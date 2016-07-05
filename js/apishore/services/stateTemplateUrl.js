apishore.factory("apishoreStateTemplateUrl", function($state, $stateParams, apishoreAuth) {
	return function(stateName, url) {
		var config = window.apishoreConfig;
		if(!apishoreAuth.isAllowedState($state.get(stateName), $stateParams))
	    {
	    	// TODO: Change to $stateChangeStart
	    	// SEE: https://github.com/angular-ui/ui-router/issues/178
	    	console.info("access.error:"+stateName);
	    	return config.appPath+"/error/access.html";
	    }
	    else
	    {
	    	console.info("access.ok:"+stateName);
	    	return url;
	    }
	};
});
