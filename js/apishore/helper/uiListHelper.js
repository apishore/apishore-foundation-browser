/**
 * UI List Helper provides common code for generated js
 */
apishore.factory("uiListHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, $rootScope, uiGridHelper, asInlineDialog, apishoreDataUtils) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		uiGridHelper.init(api, $scope, elem, attrs);
    		$scope.settings = {data:{}};
    		//set default scope variables
    		$scope.items = [];
    		$scope.restApi = api;
    		$scope.api = api;
    		$scope.listStateName = $state.current.name;
    		$scope.query = {
    				offset: 0,
    				sortDir : "asc"
    		};
			$scope.permissions = {};
			$scope.pagination = {};
			$scope.accessViolation = false;
			$scope.showSettings = false;
			
			$scope.selectViewModeLayout = function(layout, $event)
			{
				$scope.layout = layout;
				$scope.showViewModeMenu = false;
				if($event) $event.stopPropagation();
			};
			$scope.showDashboard = function()
			{
				return $scope.layout != 'grid' && !$scope.progress;
			};
			$scope.hideSettings = function($event)
			{
				if($scope.showSettings) $scope.toggleSettings();
			};
			$scope.toggleSettings = function($event)
			{
				$scope.showSettings = !$scope.showSettings;
				switch($scope.layout)
				{
					case 'list' : break;
					case 'grid' : 
					{
						$scope.showGridSettings = $scope.showSettings;
						break;
					}
					case 'card' : break;
				}
				if($event) $event.stopPropagation();
			};
			$scope.toggleLayout = function($event)
			{
				switch($scope.layout)
				{
					case 'list' : $scope.layout = 'grid';break;
					case 'grid' : $scope.layout = 'card';break;
					case 'card' : $scope.layout = 'list';break;
				}
			};
			$scope.selectViewModeLayout("list");
			//$scope.toggleSettings();
						
			$scope.navigateBack = function($event)
			{
				if(angular.isDefined($scope.cancelState))
				{
					$state.go($scope.cancelState);
				}
				else if(angular.isDefined($scope.backState))
				{
					$state.go($scope.backState);
				}
				else if(!$window.history.back())
				{
		    	}
			};
			$scope.toggleInteractiveHelp = function()
			{
				$rootScope.interactiveHelp.toggle();
			};
			//sort
			var defaultSort = elem.data("as-default-sort");
			if(defaultSort != null)
			{
				$scope.query.sortField = defaultSort.field;
				$scope.query.sortDir = defaultSort.dir;
			}
			$scope.sortBy = function(fieldId, $event)
			{
				$scope.showSortMenu = false;
				if($scope.query.sortField == fieldId)
				{
					$scope.query.sortDir = $scope.query.sortDir == "asc" ? "desc" : "asc";
				}
				else
				{
					$scope.query.sortDir = $scope.query.sortDir = "asc";
					$scope.query.sortField = fieldId;
				}
				$scope.selectAll();
			};
    		// watch filters
			if (angular.isDefined(attrs.filters)) {
				$scope.query.filters = $scope.filters;
				$scope.$watch("filters", function(newValue) {
					if ($scope.query.filters !== newValue) {
						$scope.query.filters = newValue;
						delete $scope.query.filter_parameter;
						$scope.selectAll();
					}
				});
			}
			{
				var defs = elem.data("navigation");
				if(defs)
				{
					$scope.filterParameterItemData = {};
					$scope.currentFilter = defs.filters[defs.default];
					$scope.query.filters = defs.default;
					$scope.applyNavigation = function(filterId)
					{
						var def = defs.filters[filterId];
						var newFilter = $scope.currentFilter != def;
						$scope.currentFilter = def;
						if(def.all)
						{
							delete $scope.query.filters;
							delete $scope.query.filter_parameter;
							delete $scope.filterParameterDialog;
						}
						else if(newFilter)
						{
							$scope.query.filters = filterId;
							delete $scope.query.filter_parameter;
							delete $scope.filterParameterDialog;
							var modalElem = elem.find("#named_filter_modal_"+filterId);
							if(modalElem && modalElem.length > 0)
							{
								$scope.filterParameterDialog = asInlineDialog.init($scope, modalElem, attrs);
								$scope.filterParameterDialog.callback.applyFilter = function applyFilterParameterDialog(arg)
								{
									console.log('apply');
									if($scope.filterParameterItemData && $scope.filterParameterItemData.data)
									{
										$scope.query.filter_parameter = JSON.stringify($scope.filterParameterItemData.data);
									}
									else
									{
										delete $scope.query.filter_parameter;
									}
									$scope.selectAll();
								};
							}
						}
						if($scope.filterParameterDialog)
						{
							$scope.filterParameterDialog.open();
						}
						else
						{
							$scope.selectAll();
						}
					};
				}
			}
			$scope.toggleInfoPanel = function($event)
			{
				if($rootScope.infoPanel.show)
				{
					$rootScope.infoPanel.show = false;
					$scope.go($scope.listStateName);
				}
				else
				{
					$rootScope.infoPanel.show = true;
					if($scope.items && $scope.items.length>0)
					{
						var item = ($scope.selectedItem) ? $scope.selectedItem : $scope.items[0];
						$scope.selectedItem = item;
						$scope.selectedItemId = item.data.id;
						$rootScope.infoPanel.show = true;
						$scope.go($scope.infoState, item);
					}
					else
					{
						$scope.selectedItem = undefined;
						$scope.selectedItemId = undefined;
					}
				}
				if($event) $event.stopPropagation();
			};
			$scope.clickItem = function(item, force, $event)
			{
				$scope.selectItem(item, $event);
				if(!$rootScope.asDevice.isDesktop || force)
				{
					$scope.viewItem(item, $event);
				}
			};
			$scope.selectItem = function(item, $event)
			{
				$scope.selectedItem = item;
				$scope.selectedItemId = item.data.id;
				$scope.infoItem(item, $event);
				if($scope.onSelectItem)
				{
					$scope.onSelectItem({id: item.data.id, item: item});
				}
			};
			$scope.infoItem = function(item, $event)
			{
				if(angular.isDefined($scope.infoState))
				{
					$rootScope.infoPanel.show = true;
					$scope.go($scope.infoState, item);
				}
				if($event) $event.stopPropagation();
			};
			// ui handlers
			$scope.viewItem = function(item, $event){
				if(!item.permissions.update) {
					$scope.go($scope.viewState, item);
				}
				else {
					$scope.go($scope.defaultState, item);
				}
				if($event) $event.stopPropagation();
			};
			
			$scope.editItem = function(item, $event){
				$scope.go($scope.editState, item);
				if($event) $event.stopPropagation();
			};
			
			$scope.deleteItem = function(item, $event){
				factory.removeByState(item.id).then(function(){
					$scope.selectAll();
				});
				if($event) $event.stopPropagation();
			};
			$scope.createItem = function()
			{
				if(angular.isDefined($scope.createState))
				{
					$scope.go($scope.createState);
				} else
				{
					$scope.onCreate();
				}
			};
			$scope.afterCreate = function(id, item, scrollDown)
			{
				$scope.selectAll().then(function(){
					if(scrollDown)
					{
						$timeout(function()
						{
							var s = elem.find('.as-vscroll');
							s[0].scrollTop = s[0].scrollHeight;
				        });
					}
				});
				if($scope.onAfterCreate)
				{
					$scope.onAfterCreate({id:id, item:item});
				}
			};

			$scope.isComplexQuery = function()
			{
				if($scope.query.query) return true;
				var defs = elem.data("navigation");
				if(defs)
				{
					return !$scope.currentFilter || ($scope.currentFilter.id != defs.default);
				}
				return false;
			};
			// api call
			$scope.reload = function(automatic)
			{
				$scope.selectAll(automatic);
			};
			$scope.selectAll = function(automatic)
			{
				if(!automatic)
				{
					$scope.progress = true;
					$scope.error = false;
					delete $scope.alertId;
				}
				$scope.listStateName = $state.current.name;
				if($scope.onBeforeLoad) $scope.onBeforeLoad();
				var promise = api.listByState($scope.query).then(function(res){
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					$scope.itemsData = apishoreDataUtils.merge($scope.itemsData, res.data);
					$scope.items = apishoreDataUtils.merge($scope.items,res.data.data);
					$scope.roles = apishoreDataUtils.merge($scope.roles,res.data.roles);
					$scope.permissions = apishoreDataUtils.merge($scope.permissions,res.data.permissions);
					$scope.dashboard = apishoreDataUtils.merge($scope.dashboard,res.data.dashboard);
					$scope.settings.data = apishoreDataUtils.merge($scope.settings.data,res.data.settings || $scope.settings);
					{
						var p = $scope.pagination = apishoreDataUtils.merge($scope.pagination,res.data.pagination);
						p.currentPage = p.offset / p.pageSize;
						var tmp = p.pages = [];
						if(p.totalPages == 1)
						{
							p.info = p.totalItems +" items";
						}
						else
						{
							var last = (p.offset+p.pageSize) < p.totalItems ? (p.offset+p.pageSize) : p.totalItems;
							p.info = (p.offset+1) +" - " + last + " of " + p.totalItems +" items";
						}
						var start = p.currentPage < 5 ? 0 : p.currentPage - 5;
						for(var i = start, j=0; i < p.totalPages && j < 10; i++, j++)
						{
							tmp.push({ page: i+1, offset: i*p.pageSize, active : i==p.currentPage});
						}
						p.noLeft = p.currentPage == 0;
						p.noRight = p.currentPage + 1 == p.totalPages;
					}
					$scope.progress = false;
					$scope.alertId = !$scope.items || $scope.items.length == 0 ? ($scope.isComplexQuery() ? "noMatch" : "empty") : undefined;

					uiGridHelper.onResultOk(api, $scope, elem, attrs, res.data);
					
					if(!automatic)
					{
						if($rootScope.infoPanel.show && $scope.items && $scope.items.length>0)
						{
							var item = $scope.items[0];
							$scope.selectedItem = item;
							$scope.selectedItemId = item.id;
							$scope.infoItem(item);
						}
						else
						{
							$scope.selectedItem = undefined;
							$scope.selectedItemId = undefined;
						}
						if($scope.onSelect) $scope.onSelect();
					}
					if($scope.onLoad) $scope.onLoad();
					$scope.scheduleDataReload();
				}, function(res) {
					if($scope.listStateName != $state.current.name) return;//prevent unexpected back if state is changed
					if(automatic) return; // fail of auto reload should change nothings
					$scope.itemsData = {data:[]};
					$scope.items = [];
					uiGridHelper.onResultFail($scope);
					$scope.dashboard = {error:true};
					$scope.query.offset = 0;
					$scope.pagination = {};
					$scope.pages = [];
					$scope.accessViolation = true;
					$scope.permissions = {};
					$scope.progress = false;
					$scope.error = true;
					$scope.alertId = "apiError";
					$scope.scheduleDataReload();
				});
				return promise;
			};
			$scope.scheduleDataReload = function()
			{
				if($scope.reloadDataInterval > 0)
				{
					if($scope.reloadState && $scope.reloadState != $state.current)
					{
						return;
					}
					if(!$scope.reloadState)
					{
						 $scope.reloadState = $state.current;
					}
					//console.info("schedule reload in " + $scope.reloadDataInterval + " seconds");
					function onTimeout()
					{
						$scope.reload(true);
					};
					$scope.reloadDataTimeout = $timeout(onTimeout, $scope.reloadDataInterval*1000);
				};
			}
			// search
			$scope.onSearchModify = function(delay, minLength)
			{
				if($scope.query && $scope.query.query && $scope.query.query.length < minLength) return;
				if($scope.timer) $timeout.cancel($scope.timer);
				$scope.timer = $timeout(function(){
					delete $scope.timer;
					$scope.selectAll();
				}, delay);
			};
			//expandable search
			$scope.showSearch = function()
			{
				$scope.showSearchBar = true;
				$timeout(function(){
					elem.find(".as-appbar-search-area-input").focus();
				})
			};
			$scope.clearSearch = function()
			{
				if($scope.query.query)
				{
					$scope.query.query = '';
					$scope.search();
				}
				$scope.showSearchBar = false;
			};
			$scope.search = function()
			{
				$scope.query.offset = 0;
				$scope.selectAll();
			};
			//page functions
            $scope.setPage = function(p)
            {
                var q = $scope.query;
                q.offset = p.offset;
                $scope.selectAll();
            };
            $scope.prevPage = function()
            {
                var q = $scope.query;
                if(q.offset < $scope.pagination.pageSize)
                {
                    return;
                }
                q.offset = q.offset-$scope.pagination.pageSize;
                $scope.selectAll();
            };
            $scope.nextPage = function()
            {
                var q = $scope.query;
                if(q.offset + $scope.pagination.pageSize > $scope.pagination.totalItems)
                {
                    return;
                }
                q.offset = q.offset+$scope.pagination.pageSize;
                $scope.selectAll();
            };			
			//fix header for scrollable body
			$scope.fixTable = function()
			{
				$timeout($scope.fixTableNow);
			};
			$scope.fixTableNow = function()
			{
				var headers = $(elem).find(".as-data-table-header-to-fix th");
				$(elem).find(".as-data-table-header-correct th").each(function(idx, el)
				{
					$(headers[idx]).width($(el).width());
				});
			};
		    $($window).on("resize", function()
		    {
//				if($scope.fixTableTimer) $timeout.cancel($scope.fixTableTimer);
//				$scope.fixTableTimer = $timeout(function(){
//					delete $scope.timer;
//		    		$scope.fixTable();
//				}, 300);
		    });
			$rootScope.$on('DataChanges', function(event, changes, data)
			{
				if(data.view === api.name && data.item)
				{
					$scope.selectAll();
				}
			});
			$scope.goToState = function(state, stateParams, options) {
				$state.go(state, stateParams, options);
			}; 
		}
    };
});