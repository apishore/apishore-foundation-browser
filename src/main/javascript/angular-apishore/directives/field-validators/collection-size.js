function apishoreCollectionSize(obj)
{
	if(obj)
		return obj instanceof Array ? obj.length : _.values(obj).filter(function(a){return a}).length;
	else
		return 0;
}
apishore.directive('asMinSize', function() {
	return {
		require : 'ngModel',
		link : function(scope, elem, attr, ngModel) {
			ngModel.$validators.minSize = function(modelValue,
					viewValue) {
				var size = apishoreCollectionSize(viewValue);
				var v = !ngModel.$isEmpty(viewValue)
						&& size >= scope.$eval(attr.asMinSize);
				return v;
			};
		}
	};
});
apishore.directive('asMaxSize', function() {
	return {
		require : 'ngModel',
		link : function(scope, elem, attr, ngModel) {
			ngModel.$validators.maxSize = function(modelValue,
					viewValue) {
				var size = apishoreCollectionSize(viewValue);
				var v = !ngModel.$isEmpty(viewValue)
						&& size <= scope.$eval(attr.asMaxSize);
				return v;
			};
		}
	};
});
