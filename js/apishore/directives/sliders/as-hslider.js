apishore.directive("asHorizontalSlider", function($state, $rootScope) {
	return {
		restrict : 'E',
		replace: true,
		templateUrl : window.apishoreConfig.webappRoot+"/$ng/apishore/directives/sliders/as-hslider.html",
		scope:{
			value: '=',
			minValue: '=',
			maxValue: '=',
		},
		link : function($scope, elem, attrs, apishoreShiftContainer) {
			
			$scope.clickHolder = function($event)
			{
				$scope.value = $scope.setSlider($event);
			}
			$scope.onMouseMove = function($event)
			{
				if($event.buttons == 1)
				{
					$scope.value = $scope.setSlider($event);
				}
			}
			$scope.sliderPosition = function()
			{
				var norm =  Math.min($scope.maxValue, Math.max($scope.minValue, $scope.value));
				var width = elem.find(".as-input-slider").width();
				var px = ((norm - $scope.minValue) * width) / ($scope.maxValue-$scope.minValue);
				return px;
			}
			$scope.setSlider = function($event)
			{
				var slider = elem.find(".as-input-slider");
				var offsetX = $event.pageX - slider.offset().left;
				var width = slider.width();
				console.info();
				var offsetX = Math.min(width, Math.max(0, offsetX)); 
				var val = (offsetX * ($scope.maxValue-$scope.minValue)) / width + $scope.minValue;
				return Math.round(val);
			}
		}
	}
});