
docs.config([
		"$stateProvider",
		"$stickyStateProvider",
		"$urlRouterProvider",
		"$locationProvider",
		"apishoreStateTemplateUrlProvider",
		function($stateProvider, $stickyStateProvider, $urlRouterProvider, $locationProvider, apishoreStateTemplateUrlProvider) {
			console.info('configure ui-routing');
			//$stickyStateProvider.enableDebug(true);
			//$locationProvider.html5Mode(true);
			function apishoreStateTemplateUrl(name, url)
			{
				return function()
				{
					return apishoreStateTemplateUrlProvider.$get()(name, url);
				}
			}

			$urlRouterProvider.when('', '/docs');
			$urlRouterProvider.when('/', '/docs');

			//
			$stateProvider.state('root', {
				url : "/docs",
				templateUrl : window.apishoreConfig.webappRoot+'/root.html',
				defaultChild: "introduction",
				data: {breadcrumbTitle : 'ACSS'}
			});
			$stateProvider.state('root.introduction', {
				url : "/introduction",
				templateUrl : window.apishoreConfig.webappRoot+'/introduction.html',
				data: {breadcrumbTitle : 'Introduction'}
			});
			$stateProvider.state('root.structure', {
				url : "/structure",
				templateUrl : window.apishoreConfig.webappRoot+'/structure.html',
				data: {breadcrumbTitle : 'Framework structure'}
			});
			$stateProvider.state('root.core', {
				url : "/core-modules",
				defaultChild: "normalize",
				template : '<div ui-view></div>',
				data: {breadcrumbTitle : 'Core modules'}
			});
			$stateProvider.state('root.core.normalize', {
				url : "/normalize",
				templateUrl : window.apishoreConfig.webappRoot+'/core-modules/normalize.html',
				data: {breadcrumbTitle : 'Normalize'}
			});
			$stateProvider.state('root.core.palette', {
				url : "/palette",
				templateUrl : window.apishoreConfig.webappRoot+'/core-modules/palette.html',
				data: {breadcrumbTitle : 'Material palettes'}
			});
//
//			//redirects
			$urlRouterProvider.otherwise('/docs');
		} ]);
