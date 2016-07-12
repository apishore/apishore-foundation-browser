String.prototype.countCharacters=function(c) {
    var result = 0, i = 0;
    for(i;i<this.length;i++)if(this[i]==c)result++;
    return result;
};

var docs = angular.module('docs', [
    //core
    'ngAnimate',
    'ngSanitize',
    'ui.router',
    'ct.ui.router.extras.sticky',
    'ct.ui.router.extras.dsr',
    'ct.ui.router.extras.statevis',
    'ui.bootstrap',
    'textAngular',
    'ngCookies',
    //opt
    'ui.mask',
    'textAngular',
    'timer',
    'ngTable',
    'ngTouch',
    'angularSpinner',
    'ui.codemirror',
//    'agGrid',
    //ga
    //'angulartics',
    //'angulartics.google.analytics',
    //highlight
    //'hljs',
    //app
    //'angular-inview',
    'chart.js',
//    'demo-generic-api',
//    'demo-generic-ui',
    'apishore'
]);
docs.config([ 'ChartJsProvider', function(ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
        colours : [ '#FF5252', '#FF8A80' ],
        responsive : false
    });
    // Configure all line charts
    ChartJsProvider.setOptions('Line', {
        datasetFill : false
    });
} ]);
docs.run([ '$rootScope', '$state', '$stateParams','$location','$anchorScroll','apishoreAuth','$timeout',
    function($rootScope, $state, $stateParams, $location, $anchorScroll, apishoreAuth, $timeout) {

        // It's very handy to add references to $state and $stateParams to
        // the $rootScope
        // so that you can access them from any scope within your
        // applications.For example,
        // <li ng-class="{ active: $state.includes('contacts.list') }"> will
        // set the <li>
        // to active whenever 'contacts.list' or one of its decendents is
        // active.
        window.scrollTo(0,1);
        var defaultSidebarShow = false;
        $rootScope.topMenu = {
        	title: ""
        };
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.stateParams = $stateParams;
        //sidebar
        $rootScope.sidebar = {show:defaultSidebarShow, topMenu:false};
        $rootScope.sidebar.toggle = function()
        {
            $rootScope.sidebar.show = !$rootScope.sidebar.show;
        };
        $rootScope.sidebar.on = function()
        {
            $rootScope.sidebar.show = true;
            console.log("sidebar.on");
        };
        //sidebar
        $rootScope.interactiveHelp = {show:false};
        $rootScope.interactiveHelp.toggle = function()
        {
            $rootScope.interactiveHelp.show = !$rootScope.interactiveHelp.show;
        };
        $rootScope.codemirror = {
    			xml: {
    		        lineWrapping : true,
    		        lineNumbers: true,
    		        readOnly: 'nocursor',
    		        scrollbarStyle: "null",
    		        mode: 'xml',
    		    },
    		    javascript: {
    		        lineWrapping : true,
    		        lineNumbers: true,
    		        readOnly: 'nocursor',
    		        scrollbarStyle: "null",
    		        mode: 'javascript',
    		    },
    		    java: {
    		        lineWrapping : true,
    		        lineNumbers: true,
    		        readOnly: 'nocursor',
    		        scrollbarStyle: "null",
    		        mode: {
    		        	name: 'clike',
    		        	keywords : {
    		        		'class' : '',
    		        		'enum' : '',
    		        		'public' : '',
    		        		'protected' : '',
    		        		'private' : '',
    		        		'final' : '',
    		        		'static' : '',
    		        		'extends' : '',
    		        		'boolean' : '',
    		        		'byte' : '',
    		        		'short' : '',
    		        		'char' : '',
    		        		'int' : '',
    		        		'float' : '',
    		        		'long' : '',
    		        		'double' : '',
    		        		'if' : '',
    		        		'else' : '',
    		        		'do' : '',
    		        		'while' : '',
    		        		'for' : '',
    		        		'return' : '',
    		        		'new' : '',
    		        		'null' : '',
    		        		'super' : '',
    		        		'switch' : '',
    		        		'case' : '',
    		        		'default' : '',
    		        		'try' : '',
    		        		'catch' : '',
    		        		'finally' : '',
    		        		'this' : '',
    		        	}
    		        }
    		    },
    		    css: {
    		        lineWrapping : true,
    		        lineNumbers: true,
    		        readOnly: 'nocursor',
    		        scrollbarStyle: "null",
    		        mode: 'text/x-scss',
    		    },
    		    scss: {
    		        lineWrapping : true,
    		        lineNumbers: true,
    		        readOnly: 'nocursor',
    		        scrollbarStyle: "null",
    		        mode: 'text/x-scss',
    		    },
    		    html: {
    		        lineWrapping : true,
    		        lineNumbers: true,
    		        readOnly: 'nocursor',
    		        scrollbarStyle: "null",
    		        mode: 'htmlmixed',
    		    },
    		
    		}
        window.apishoreQA.angularIsloaded = true;
        $(".as-app-loader").remove();

        function clearSelection() {
            console.info("clear selection")
            if(document.selection && document.selection.empty) {
                document.selection.empty();
            } else if(window.getSelection) {
                var sel = window.getSelection();
                sel.removeAllRanges();
            }
        }

        $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
            $rootScope.interactiveHelp.show = false;
            $(".as-app-loader").remove();
            if(toState.defaultChild)
            {
                $state.go(toState.name+'.'+toState.defaultChild);
            }
            else
            {
                $anchorScroll(0);
                $rootScope.sidebar.show = defaultSidebarShow;
                $rootScope.sidebar.topMenu = false;
                clearSelection();
                $timeout(function(){window.apishoreQA.stateIsLoaded = true;});
                //TODO: Hack
                if(toState.name.indexOf("wild.info") > 0 )
                {
                    $rootScope.infoPanel.on();
                }
            }
        });
        $rootScope.$on("$stateNotFound", function(event, unfoundState, fromState, fromParams) {
            event.preventDefault();
            $rootScope.sidebar.show = false;
            $location.path('/root');
            $state.go('error.unknown');
        });
        $rootScope.$on("$stateChangeError", console.error.bind(console));
        $rootScope.forceMode = function(mode)
        {
        	if(mode == 'default')
        	{
        		$rootScope.setMode();
        		return;
        	}
        	var di = $rootScope.asDevice = {};
        	var b = $('body');
        	b.removeClass('as-device-phone as-device-tablet as-device-desktop as-device-wide-desktop as-device-phone-portrait as-device-phone-landscape');
        	di.isPhone = false;
        	di.isTablet = false;
        	di.isDesktop = false;
        	di.isPhoneLandscape = false;
        	di.isPhonePortrait = false;
        	switch(mode)
        	{
        		case 'desktop':
        		{
        	        b.addClass('as-device-desktop as-device-emulation');
        	    	di.isDesktop = true;
        	    	return;
        		}
        		case 'wide-desktop':
        		{
        	        b.addClass('as-device-wide-desktop as-device-emulation');
        	    	di.isDesktop = true;
        	    	return;
        		}
        		case 'tablet':
        		{
        	        b.addClass('as-device-tablet as-device-emulation');
        	    	di.isTablet = true;
        	    	return;
        		}
        		case 'phone-portrait':
        		{
        	        b.addClass('as-device-phone as-device-emulation');
        	    	di.isPhone = true;
        	    	di.isPhonePortrait = true;
        	    	return;
        		}
        		case 'phone-landscape':
        		{
        	        b.addClass('as-device-phone as-device-emulation');
        	    	di.isPhone = true;
        	    	di.isPhonePortrait = true;
        	    	return;
        		}
        	};
    		$rootScope.setMode();
        }
        
    } ]);

