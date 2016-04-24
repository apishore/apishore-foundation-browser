/**
 * UI Edit Form Helper provides common code for generated js
 */
apishore.factory("uiEntityHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, $rootScope, apishoreNumbers, asInlineDialog) {
    return {
    	init : function(api, $scope, elem, attrs)
        {
    		//helper allows to store temporary values for editors without creation of additional angular scopes
    		if($scope.itemDataHelper == undefined)
    		{
    			$scope.itemDataHelper = {};
    		}
			if(!$scope.itemData || !$scope.itemData.data)
			{
				$scope.itemData = {data:{}};
			}
    		$scope.apishoreNumbers = apishoreNumbers;
            // stick current top fieldset, todo combine create, edit, table with sections.
            var scrollable = $(elem).find('.as-vscroll');
            if(scrollable.length == 0)
            {
            	//find top scrollable
            	scrollable = $(elem).parents('.as-vscroll');
           	}
            var tops = $($(elem).find(".as-fieldset-top").get());
            
			$scope.deleteDialog = asInlineDialog.init($scope, elem.find(".id-delete-dialog"), attrs);
			$scope.sliderPosition = function(value, min, max)
			{
				var norm =  Math.min(max, Math.max(min, value));
				var width = elem.find(".as-input-slider").width();
				var px = ((norm - min) * width) / (max-min);
				return px;
			}
			$scope.moveSlider = function($event, val, min, max)
			{
				if($event.buttons == 1)
				{
					var gap = 24;//TODO: 
					var width = elem.find(".as-input-slider").width();
					var offsetX = Math.min(width, Math.max(0, $event.offsetX - gap)); 
					val = (offsetX * (max-min)) / width + min;
				}
				return val;
			}			
			$scope.setSlider = function($event, min, max)
			{
				var gap = 24;
				var width = elem.find(".as-input-slider").width();
				var offsetX = Math.min(width, Math.max(0, $event.offsetX - gap)); 
				var val = (offsetX * (max-min)) / width + min;
				return val;
			}
			$scope.dialogs = {};
			$scope.dialogHelper = function(id)
			{
				var d = $scope.dialogs[id];
				if(!angular.isDefined(d))
				{
					d = asInlineDialog.init($scope, $(id), attrs);
					$scope.dialogs[id] = d;
				}
				return d;
			};
			$scope.deleteDialog.callback.delete = function()
			{
				api.removeByState();
				$state.go($scope.listState);
			};
			$scope.toggleInteractiveHelp = function()
			{
				$rootScope.interactiveHelp.toggle();
			};
            $scope.navigateBack = function($event)
            {
            	if(!$window.history.back())
            	{
            		if(angular.isDefined($scope.cancelState))
    				{
    					$state.go($scope.cancelState);
    				}
            		if(angular.isDefined($scope.backState))
    				{
    					$state.go($scope.backState);
    				}
            	}
            };
            $scope.getScrollableInfo = function()
            {
            	$timeout(function(){
            		$scope.scrollableHeight = scrollable.height();
            		if(tops.length>0)
                    {
                     	$(tops[tops.length-1]).css("minHeight", $scope.scrollableHeight+"px"); 
                    }
            	});
            };
            $scope.getScrollableInfo();
            
            $scope.scrollToFirstError = function()
            {
            	var errors = elem.find(".has-error, .asa-has-error");//TODO: remove .has-error after killing bootstrap 
            	if(errors.length>0)
            	{
            		var error = $(errors[0]);
            		error[0].scrollIntoView();
	            	error.find("input").focus();
            	}
            };

            if(tops.length>0)
            {
	            $scope.scrollToFieldset = function(id)
	            {
	            	document.getElementById(id).scrollIntoView({behavior:"smooth"});
	            	$scope.findTopFieldset();
	            };
	            $scope.findTopFieldset = function() {
	            	delete $scope.topFieldset;
	            	tops.each(function(idx, el)
	            	{
	            		var fs = $(el);
	            		var bottom = (fs.offset().top - scrollable.offset().top)+fs.height();
	            		if(bottom > 1 && !$scope.topFieldset)
	            		{
	            			$scope.topFieldset = el.id;
	            			console.log("active="+el.id)
	            		}
	            	});
	            };
				$scope.findTopFieldset();
	            scrollable.on('scroll', function(e) {
	                if ($scope.scrollTimer) return;
	                $scope.scrollTimer = $timeout(function() {
	                	$scope.findTopFieldset();
	                	$timeout.cancel($scope.scrollTimer);
	                	delete $scope.scrollTimer;
	                }, 200);
	            });
            }
		}
	};
});