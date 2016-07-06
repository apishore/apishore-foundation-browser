docs.controller("tables", ['$scope', function($scope) {
  $scope.greeting = 'Hola!';
  $scope.selectAll = function(arr, v)
  {
	  return _.each(arr, function(e){e.selected=v});
  };
  $scope.allSelected = function(arr)
  {
	  var v = _.find(arr, function(e){ return !e.selected}) == undefined;
	  return v;
  };
  
}]);
