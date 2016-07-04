apishore.directive("asSelectSimple", function(apishoreAuth, $rootScope, $http, $state, $window, $injector, $timeout) {

	return {
		restrict : 'E',
		replace : true,
		transclude: true,
		scope:{
			name: '=',
			model: '=',
			asOptions: '=',
			// asRequired
			asDisabled: '=',
			// disabled,
			asFocus: '&',
			asBlur: '&',
			asChange: '&',
			undefinedMenuLabel: '@',
		},
		templateUrl : "$ng/apishore/directives/select/as-select-simple.html",
        link : function($scope, $elem, $attrs) {
        	//
        	$scope.keydown = function($event)
        	{
        		console.info("keyCode = " + $event.keyCode);
        		$scope.localPristine = false;
        		switch($event.keyCode)
        		{
        			case 40:
        			{
        				if($scope.selectedIndex+1 < $scope.asOptions.length)
        				{
        					$scope.selectedIndex++;
        					var option = $scope.asOptions[$scope.selectedIndex];
        					var itemDom = $elem.find("[item-id='"+option.id+"']");
        					var contentDom = $elem.find(".as-dropdown-select-popup-content");
        					var itemPos = itemDom.position().top + itemDom.height();
        					if(itemPos > contentDom.height())
        					{
        						itemDom[0].scrollIntoView();
        					}
        				}
        				if($event) $event.stopPropagation();
        				return false;
        			}
        			case 38:
        			{
        				if($scope.selectedIndex > 0)
        				{
        					$scope.selectedIndex--;
        					var option = $scope.asOptions[$scope.selectedIndex];
        					var itemDom = $elem.find("[item-id='"+option.id+"']");
        					var contentDom = $elem.find(".as-dropdown-select-popup-content");
        					var itemPos = itemDom.position().top;
        					if(itemPos < 0)
        					{
        						itemDom[0].scrollIntoView();
        					}
        				}
        				if($event) $event.stopPropagation();
        				return false;
        			}
	        		case 13:
	        		{
	        			if($scope.isOpened)
	        			{
		        			$scope.selectedIndex = $scope.selectedIndex < 0 ? 0 : $scope.selectedIndex;
		        			$scope.selectItem($scope.asOptions[$scope.selectedIndex]);
	        			} else {
	        				$scope.openPopup();
	        			}

	        			if($event) $event.stopPropagation();
	        			if($event) $event.preventDefault();
	        			return false;
	        		}
        			case 27:
        			{
        				$scope.cancel();
        			}
        		}
        	};
        	$scope.keypress = function($event)
        	{
        		console.info("charCode = " + $event.charCode)
        	};
        	$scope.openPopup = function()
        	{
        		if($scope.isOpened || $scope.asDisabled) return false;
        		var popup = $elem.find(".as-dropdown-select-popup");
        		$scope.popupRect = popup.offset();
        		$scope.popupRect.width = popup.width();
        		$scope.popupRect.height = popup.height();
        		$scope.isOpened = true;
        		$scope.localPristine = true;
        		$scope.selectedIndex = -1;
        	};
        	$scope.cancel = function()
        	{
        		$scope.label = $scope.initialLabel;
        		$scope.model = $scope.initialValue;
        		$scope.closePopup();
        	};
        	$scope.closePopup = function()
        	{
        		$timeout(function(){$scope.popupRect = undefined;});
        		$scope.isOpened = false;
        		if(angular.isUndefined($scope.model)) $scope.label = undefined;
        	};
        	$scope.getLabel = function(id)
        	{
        		var label = _.find($scope.asOptions, function(opt){ return opt.id == id;}).text;
        		return label;
        	};
        	$scope.$watch("model", function(nv, ov)
        	{
        		if(!angular.isDefined(nv))
        		{
        			$scope.label = undefined;
        		}
        		else if(!$scope.dirty)
        		{
        			$scope.initialValue = nv;
        			$scope.initialLabel = $scope.label = $scope.getLabel(nv);
        		}
        	});
        	$scope.selectItem = function(item)
        	{
        		if(item) {
        			$scope.initialValue = $scope.model = item.id;
        			$scope.initialLabel = $scope.label = item.text;
        			$scope.dirty = true;
				}
				else {
					$scope.initialValue = $scope.model = undefined;
					$scope.initialLabel = $scope.label = undefined;
					$scope.dirty = true;
				}
        		$scope.closePopup();
				$timeout(function(){
					if($scope.asChange) $scope.asChange();
				});
			};
		// end link
        }
	};
});