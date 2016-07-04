/**
 * UI List Helper provides common code for generated js
 */
function GridFilterString() {}

// mandatory methods
GridFilterString.prototype.init = function (params)
{
	this.colDef = params.colDef;
	this.filterChangedCallback = params.filterChangedCallback;
    this.filterModifiedCallback = params.filterModifiedCallback;
    var $scope= this.$scope = params.$scope;

	$scope.search = function()
	{
		params.filterChangedCallback();
	};
	$scope.search = function()
	{
		params.filterChangedCallback();
	};
	$scope.hide = function()
	{
		$scope.gridOptions.columnApi.hideColumn(params.colDef.field, true);
		params.filterChangedCallback();
	};
	$scope.sort = function(dir)
	{
		var sort = [ {colId: params.colDef.field, sort: dir} ];
		$scope.gridOptions.api.setSortModel(sort);
		params.filterChangedCallback();
	};
}
GridFilterString.prototype.getGui = function ()
{
	return $("#gridColumnMenu_"+this.colDef.field).text();
}
GridFilterString.prototype.isFilterActive = function()
{
	return false;
}
GridFilterString.prototype.doesFilterPass = function (params)
{
	return true;
}
GridFilterString.prototype.getApi = function ()
{
	return {};
}

// optional methods
GridFilterString.prototype.afterGuiAttached = function(params) {}
GridFilterString.prototype.onNewRowsLoaded = function () {}
GridFilterString.prototype.onAnyFilterChanged = function () {}
    
apishore.factory("uiGridHelper", function($injector, $http, $stateParams, $state, $window, $timeout, $location, $window, $rootScope) {
    return {
    	init : function(api, $scope, elem, attrs)
    	{
    		$scope.gridOptions = elem.data("grid");
    		if($scope.gridOptions)
    		{
	    		_($scope.gridOptions.columnDefs).each(function(col){
	    			col.filter = GridFilterString;
	    		});
    		}
    	},
    	onResultOk : function(api, $scope, elem, attrs, data)
    	{
    		if($scope.gridOptions)
    		{
	    		var rowData = _.map($scope.items, function(data){return data.data;});
	    		$scope.gridOptions.rowData = rowData;
	    		$scope.gridOptions.columnDefs = data.settings.gridColumns;
	    		$scope.gridOptions.allPinnedColumnCount = data.settings.gridPin;
				if($scope.gridOptions.api)
				{
					$scope.gridOptions.api.setRowData(rowData);

					var count=0;
	        		for(var i=0; i< $scope.gridOptions.allPinnedColumnCount;i++)
	        		{
	        			if(!$scope.gridOptions.columnDefs[i].hide) count++;
	        		}
	        		$scope.gridOptions.pinnedColumnCount = count;
	        		$scope.gridOptions.columnApi.setPinnedColumnCount(count);
	        		$scope.gridOptions.api.setColumnDefs($scope.gridOptions.columnDefs);
	        		$scope.gridOptions.api.refreshView();
	        		// get the grid to space out it's columns
	        		$scope.gridOptions.columnApi.sizeColumnsToFit();
				}
    		}
    	},
    	onResultFail : function($scope)
    	{
    		if($scope.gridOptions)
    		{
				$scope.gridOptions.rowData = [];
				if($scope.gridOptions.api)
				{
					$scope.gridOptions.api.refreshView();
					// get the grid to space out it's columns
					$scope.gridOptions.columnApi.sizeColumnsToFit();
				}
    		}
		}
    };
});