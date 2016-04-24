apishore.directive('apishoreDateTypeHelper', function() {
	return {
		restrict : 'A',
		link: function($scope, element, attrs)
		{
			$scope.openApishoreFormPopup = function(name, $event)
			{
				$event.stopPropagation();
				$event.preventDefault();
				$scope.apishoreFormPopups = {};//close othe popups in form
				$scope.apishoreFormPopups[name] = true;
			}
		}
	};
});