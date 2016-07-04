apishore.directive("asSelect", function(apishoreAuth, $rootScope, $http, $state, $window, $injector) {

	return {
		restrict : 'E',
		replace : true,
		transclude: true,
		scope:{
			name: '=',
			model: '=',
			options : '=',
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
			asTitleField: '@'
		},
		templateUrl : "$ng/apishore/directives/select/as-select.html",
        link : function($scope, $elem, $attrs) {
        	
        	function init()
        	{
	        	var select = $elem.find("select");
	        	select.attr("name", $scope.name);
	        	
	        	if(angular.isDefined($scope.asOptionsApi))
	        	{
	        		select = select.select2({
	        			tags : !!$scope.asChips,
	        			ajax:
	        			{
		        			transport: function (params, success, failure) {
		        				var api = $injector.get($scope.asOptionsApi);
		        				var query = {
		        					query: params.data.q
		        				};
		        				api.listByState(query, "list").then(function(hresponse)
		        				{
		        					var res = hresponse.data.data;
		        					success(res);
		        				},
		        				function()
		        				{
		        					failure();
		        				}
		        				);
		        			},
		        			processResults: function (data)
		        			{
		        				if(angular.isDefined(data))
		        				{
			        				var res = [];
			        				for(var i=0; i < data.length; i++)
			        				{
			        					var src = data[i].data;
			        					res[i] = {
			        							id: src.id,
			        							text: src[$scope.asTitleField]
			        					};
			        				}
			        			    return { results: res };
		        				}
		        				else
		        				{
		        					return { result: []};
		        				}
		        		    }
	        			},
		        		minimumResultsForSearch: $scope.asSearchAfter
		        	});
	        	}
	        	else if($scope.asChips)
	        	{
	        		select.attr('multiple', 'true');
	            	$scope.model = [];
	        		select = select.select2({
	        			tags : $scope.asOptions,
		        		minimumResultsForSearch: $scope.asSearchAfter
		        	});
	        	}
	        	else
	        	{
	        		select = select.select2({
		        		data : $scope.asOptions,
		        		minimumResultsForSearch: $scope.asSearchAfter
		        	});
	        	}
	        	
	        	var selectionTag = select.next(".select2").find(".select2-selection");
	        	selectionTag.focus(function() {
	        		$scope.$apply(function () {
	        			$scope.asFocus();
	                });
	        	});
	        	selectionTag.blur(function() {
	        		$scope.$apply(function () {
	        			$scope.asBlur();
	                });
	        	});
	        	
	        	select.on('change', function(e){
	        		$scope.$apply(function () {
	        			var nv = select.val();
	        			if(angular.isDefined(nv))
	        			{
	        				$scope.model = select.val();
	        				$scope.asChange();
	        			}
	                });
	        	});
        	};
        	
        	init();
        	
        	$scope.$watch('model', function(nv,ov)
        	{
        		if(angular.isDefined(nv) && !angular.equals(nv, ov))
        		{
        			$window.setTimeout(function(){ $elem.find("select").val(nv).trigger("change");});
        		}
        	});
        	
        	$scope.$watch('asDisabled', function(nv,ov)
        	{
        		if(angular.isDefined(nv))
        		{
        			$window.setTimeout(function(){ $elem.find("select").val(nv).prop("disabled", nv);});
        		}
        	});
        	
        }
	};
});