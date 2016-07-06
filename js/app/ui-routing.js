
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
			$stateProvider.state('root.modules', {
				url : "/modules",
				defaultChild: "box",
				template : '<div ui-view></div>',
				data: {breadcrumbTitle : 'Modules'}
			});
			$stateProvider.state('root.modules.box', {
				url : "/box",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/box.html',
				data: {breadcrumbTitle : 'Box'}
			});
			$stateProvider.state('root.modules.floating', {
				url : "/floating",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/floating.html',
				data: {breadcrumbTitle : 'floating'}
			});
			$stateProvider.state('root.modules.gridsystem', {
				url : "/grid-system",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/grid-system.html',
				data: {breadcrumbTitle : 'grid-system'}
			});
			$stateProvider.state('root.modules.gutter', {
				url : "/gutter",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/gutter.html',
				data: {breadcrumbTitle : 'gutter'}
			});
			$stateProvider.state('root.modules.responsive', {
				url : "/responsive",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/responsive.html',
				data: {breadcrumbTitle : 'responsive'}
			});
			$stateProvider.state('root.modules.scrollable', {
				url : "/scrollable",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/scrollable.html',
				data: {breadcrumbTitle : 'scrollable'}
			});
			//TYPOGRAPHY
			$stateProvider.state('root.modules.text_panel', {
				url : "/text-panel",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/text-panel.html',
				data: {breadcrumbTitle : 'Text panel'}
			});
			$stateProvider.state('root.modules.typography', {
				url : "/typography",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/typography.html',
				data: {breadcrumbTitle : 'Typography'}
			});

			$stateProvider.state('root.modules.panel', {
				url : "/panel",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/panel.html',
				data: {breadcrumbTitle : 'scrollable'}
			});
			$stateProvider.state('root.modules.table_basic', {
				url : "/table-basic",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/table/table-basic.html',
				data: {breadcrumbTitle : 'Table: Basic'}
			});
			$stateProvider.state('root.modules.table_data', {
				url : "/table-data",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/table/table-data.html',
				data: {breadcrumbTitle : 'Table: Data'}
			});

//
//			//redirects
			$urlRouterProvider.otherwise('/docs');
		} ]);
