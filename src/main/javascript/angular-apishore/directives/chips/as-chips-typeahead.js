apishore.directive("asChipsTypeahead", function(apishoreAuth, $rootScope, $http, $state, $window, $injector, $timeout) {

	return {
		restrict : 'E',
		replace : true,
		transclude: true,
		scope:{
			name: '=',
			model: '=',
			modelEmbedded: '=',
			options : '=',
			// filters : '=',
			asChips : '=',
			// asRequired
			asDisabled: '=',
			// disabled,
			asFocus: '&',
			asBlur: '&',
			asChange: '&',
			asOptions: '=',
			asOptionsApi: '@',
			asSearchAfter: '@',
			asTitleField: '@',
			undefinedMenuLabel: '@',
			filters: '@',
			filtersOptions: '=',
			defaultFilter:'@'
		},
		templateUrl : "$ng/apishore/directives/chips/as-chips-typeahead.html",
        link : function($scope, $elem, $attrs) {
        	//
        	var api = $injector.get($scope.asOptionsApi);
        	$scope.items = [];
        	$scope.serverSearchIsRequired = true;//initial value
			$scope.currentFilter = $scope.defaultFilter;
        	$scope.keydown = function($event)
        	{
        		console.info("keyCode = " + $event.keyCode);
        		$scope.localPristine = false;
        		switch($event.keyCode)
        		{
        			case 40:
        			{
        				if($scope.selectedIndex+1 < $scope.items.length)
        				{
        					$scope.selectedIndex++;
        					var item = $scope.items[$scope.selectedIndex];
        					var itemDom = $elem.find("[item-id='"+item.data.id+"']");
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
        					var item = $scope.items[$scope.selectedIndex];
        					var itemDom = $elem.find("[item-id='"+item.data.id+"']");
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
        			case 27:
        			{
        				$scope.cancel();
        			}
        		}
        	};
        	$scope.keypress = function($event)
        	{
        		console.info("charCode = " + $event.charCode);
        		switch($event.keyCode)
        		{
	        		case 13:
	        		{
	        			if($scope.isOpened)
	        			{
		        			$scope.selectedIndex = $scope.selectedIndex < 0 ? 0 : $scope.selectedIndex;
		        			$scope.selectItem($scope.items[$scope.selectedIndex]);
	        			} else {
	        				$scope.openPopup();
	        			}
	        			
	        			if($event) $event.stopPropagation();
	        			if($event) $event.preventDefault();
	        			return false;
	        		}
	        		default:
	        		{
	        			$scope.openPopup();
	        		}
        		}
        	};
			$scope.openPopupByClick = function()
			{
				$scope.initialLabel = $scope.label;
				$scope.initialValue = $scope.value;
				$scope.label = "";
				$scope.openPopup();
			};
        	$scope.openPopup = function()
        	{
        		if($scope.isOpened) return;
        		$scope.updateRect();

				$scope.isOpened = true;
        		$scope.localPristine = true;
        		$scope.selectedIndex = -1;
        	};
        	$scope.updateRect = function()
        	{
        		var popup = $elem.find(".as-dropdown-select-popup");
        		$scope.popupRect = popup.offset();
        		$scope.popupRect.width = popup.width();
				var wh = $($window).height();
				$scope.popupRect.height = Math.min(popup.height(), wh * 2 / 3);
				if(($scope.popupRect.top + $scope.popupRect.height) > wh)
				{
					$scope.popupRect.top = wh - $scope.popupRect.height - 16;
				}
        	};
        	$(window).resize(function() {
        		$timeout.cancel(window.resizedFinished);
        	    $scope.closePopup();
        	    window.resizedFinished = $timeout(function(){
            	    $scope.openPopup();
            	    delete window.resizedFinished;
        	    }, 250);
        	});
        	$scope.cancel = function()
        	{
        		$scope.label = $scope.initialLabel;
        		$scope.initialValue = $scope.value;
        		$scope.closePopup();
        	};
        	$scope.closePopup = function()
        	{
        		$timeout(function(){$scope.popupRect = undefined;});
        		$scope.isOpened = false;
        		if(angular.isUndefined($scope.model)) $scope.label = undefined;
        	};
        	$scope.$watch("label", function()
        	{
        		$scope.search();
        	});
        	$scope.$watch("model", function(nv, ov)
        	{
        		if(!angular.isDefined(nv))
        		{
        			$scope.label = undefined;
        		}
        		else if(!$scope.dirty)
        		{
        			$scope.initialValue = nv;
        			api.getByIdAndState(nv).then(function(resp){
        				var item = resp.data.data || {};
        				$scope.label = item[$scope.asTitleField];
        				$scope.initialLabel = $scope.label;
        			});
        		}
        	});
        	$scope.removeItem = function(itemData, $index, $event)
        	{
        		$scope.model.splice($index, 1);
				$scope.modelEmbedded.data.splice($index, 1);
        	}
        	$scope.selectItem = function(item)
        	{
				if(item) {
					$scope.model.push(item.data.id);
					$scope.modelEmbedded.data.push(item);
					$scope.dirty = true;
				}
        		$scope.closePopup();
        	};
			$scope.setFilter = function(filterId)
			{
				$scope.currentFilter = filterId;
				$scope.serverSearchIsRequired = true;
				$scope.search();
			};
        	$scope.search = function()
        	{
				var query = {
					query: $scope.label || "",
					filters: $scope.currentFilter,
					excludedIds: $scope.model
				};
				if($scope.serverSearchIsRequired && $scope.timer == undefined)
				{
					$scope.timer = $timeout(function(){$scope.searchInProgress = true;}, 300);
					api.listByState(query, "list").then(
						function(resp)
						{
							var items = $scope.items = resp.data.data || [];
							if(query.query.length == 0)
							{
								$scope.serverSearchIsRequired = resp.data.pagination.totalPages;
							}
							for(var i=0; i < items.length; i++)
							{
								// underscore name is safe to use among server response
								items[i].as_typeahead_item_title = items[i].data[$scope.asTitleField];
							}
							$timeout.cancel($scope.timer);
							$scope.timer = undefined;
							$scope.searchInProgress = false;
							$scope.selectedIndex = -1;
						},
						function()
						{
							$scope.items = [];
							$scope.serverSearchIsRequired = true;
							$timeout.cancel($scope.timer);
							$scope.timer = undefined;
							$scope.searchInProgress = false;
							$scope.selectedIndex = -1;
						}
					);
				}
			};
			$scope.search();
		// end link
        }
	};
});