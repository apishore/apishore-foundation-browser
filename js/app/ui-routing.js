
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
			$stateProvider.state('root.modules.text_align', {
				url : "/text-align",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/text-align.html',
				data: {breadcrumbTitle : 'Text alignment'}
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
			//navigation
			$stateProvider.state('root.modules.bottom_navigation', {
				url : "/bottom-navigation",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/bottom-navigation.html',
				data: {breadcrumbTitle : 'Bottom navigation'}
			});
			$stateProvider.state('root.modules.bottom_sheets', {
				url : "/bottom-sheets",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/bottom-sheets.html',
				data: {breadcrumbTitle : 'Bottom navigation'}
			});
			$stateProvider.state('root.modules.sidebar', {
				url : "/sidebar",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/sidebar.html',
				data: {breadcrumbTitle : 'Sidebar'}
			});
			//actions
			$stateProvider.state('root.modules.button', {
				url : "/button",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/button.html',
				data: {breadcrumbTitle : 'Buttons'}
			});
			$stateProvider.state('root.modules.button_dropdown', {
				url : "/button-dropdown",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/button-dropdown.html',
				data: {breadcrumbTitle : 'Drop down buttons'}
			});
			$stateProvider.state('root.modules.button_fa', {
				url : "/button-fa",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/button-fa.html',
				data: {breadcrumbTitle : 'Floating actions'}
			});
			//cards
			$stateProvider.state('root.modules.card_layout', {
				url : "/card-layout",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/card-layout.html',
				data: {breadcrumbTitle : 'Card lyouts'}
			});
			$stateProvider.state('root.modules.card', {
				url : "/card",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/card.html',
				data: {breadcrumbTitle : 'Cards'}
			});
			//controls
			$stateProvider.state('root.modules.chips', {
				url : "/chips",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/chips.html',
				data: {breadcrumbTitle : 'Chips'}
			});
			$stateProvider.state('root.modules.control_checkbox', {
				url : "/control-checkbox",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/control-checkbox.html',
				data: {breadcrumbTitle : 'Checkboxes'}
			});
			$stateProvider.state('root.modules.control_radio', {
				url : "/control-radio",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/control-radio.html',
				data: {breadcrumbTitle : 'Radio'}
			});
			$stateProvider.state('root.modules.control_input', {
				url : "/control-input",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/control-input.html',
				data: {breadcrumbTitle : 'Text input'}
			});
			$stateProvider.state('root.modules.control_select', {
				url : "/control-select",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/control-select.html',
				data: {breadcrumbTitle : 'Select/dropdown'}
			});
			$stateProvider.state('root.modules.control_date', {
				url : "/control-date",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/control-date.html',
				data: {breadcrumbTitle : 'Date pickers'}
			});
			$stateProvider.state('root.modules.control_time', {
				url : "/control-time",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/control-time.html',
				data: {breadcrumbTitle : 'Time pickers'}
			});
			$stateProvider.state('root.modules.control_slider', {
				url : "/control-slider",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/control-slider.html',
				data: {breadcrumbTitle : 'Sliders'}
			});
			//dialogs
			$stateProvider.state('root.modules.dialog', {
				url : "/dialog",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/dialog.html',
				data: {breadcrumbTitle : 'Dialog'}
			});
			$stateProvider.state('root.modules.dialog_inplace', {
				url : "/dialog-inplace",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/dialog-inplace.html',
				data: {breadcrumbTitle : 'Inplace Dialog'}
			});
			//panels
			$stateProvider.state('root.modules.expansion_panel', {
				url : "/expansion-panel",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/expansion-panel.html',
				data: {breadcrumbTitle : 'Expansion Panels'}
			});
			//lists
			$stateProvider.state('root.modules.list', {
				url : "/list",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/list.html',
				data: {breadcrumbTitle : 'Normal lists'}
			});
			$stateProvider.state('root.modules.list_small', {
				url : "/list-small",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/list-small.html',
				data: {breadcrumbTitle : 'Small lists'}
			});
			//menus
			$stateProvider.state('root.modules.menu_popup', {
				url : "/menu-popup",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/menu-popup.html',
				data: {breadcrumbTitle : 'Popup menus'}
			});
			$stateProvider.state('root.modules.menu_text_panel', {
				url : "/menu-text-panel",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/menu-text-panel.html',
				data: {breadcrumbTitle : 'Text panel top menu'}
			});
			
			$stateProvider.state('root.modules.menu_bar', {
				url : "/menu-context",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/menu-bar.html',
				data: {breadcrumbTitle : 'Menu bar'}
			});
			//progress & activity
			$stateProvider.state('root.modules.progress', {
				url : "/progress",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/progress.html',
				data: {breadcrumbTitle : 'Progress'}
			});
			$stateProvider.state('root.modules.activity', {
				url : "/activity",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/activity.html',
				data: {breadcrumbTitle : 'Activity'}
			});
			//workflows
			$stateProvider.state('root.modules.stepper', {
				url : "/stepper",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/stepper.html',
				data: {breadcrumbTitle : 'Steppers'}
			});
			$stateProvider.state('root.modules.wizard', {
				url : "/wizard",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/wizard.html',
				data: {breadcrumbTitle : 'Wizards'}
			});
			//headers
			$stateProvider.state('root.modules.subheader', {
				url : "/subheader",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/subheader.html',
				data: {breadcrumbTitle : 'Subheaders'}
			});
			$stateProvider.state('root.modules.tab', {
				url : "/tab",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/tab.html',
				data: {breadcrumbTitle : 'Tabs'}
			});
			$stateProvider.state('root.modules.toolbar', {
				url : "/toolbar",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/toolbar.html',
				data: {breadcrumbTitle : 'Toolbars'}
			});
			$stateProvider.state('root.modules.tooltip', {
				url : "/tooltip",
				templateUrl : window.apishoreConfig.webappRoot+'/modules/tooltip.html',
				data: {breadcrumbTitle : 'Tooltips'}
			});
			
			
			
//
//			//redirects
			$urlRouterProvider.otherwise('/docs');
		} ]);
