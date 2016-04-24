apishore.directive("devPanel", function (ApishoreTicketApi, apishoreAuth, LoginAsPersonalApi, $http, $state, $location) {

	return {
		restrict : 'E',
		replace : true,
		templateUrl : window.apishoreConfig.webappRoot+"/$ng/apishore/directives/dev-panel.html",
        link : function($scope) {
        	$scope.devStatus = function()
        	{
        		return $state.current.data ? $state.current.data.devStatus : {};
        	}
        	$scope.userData = function()
        	{
        		return apishoreAuth.user;
        	}
        	$scope.pageId = function()
        	{
        		return $state.current.name;
        	}
        	$scope.pageI18N = function()
        	{
        		return $state.current.name.replace(/\./g,'_');
        	}
        	$scope.state = $state;
        	$scope.sending = false;
        	var factory = ApishoreTicketApi;
			
        	$scope.itemData = {};
			$scope.submitForm = function(form)
			{
				form.$setSubmitted();
				if(!form.$valid) return false;
				
				$scope.sending = true;
				var item = {};
				$scope.itemData.data.pageState = $scope.pageId();
				$scope.itemData.data.url = $location.$$absUrl;
				
				factory.transform($scope.itemData, item);
				factory.insert(item).then(function(data){
					$scope.itemData.data.summary = "";
					$scope.itemData.data.details = "";
					form.$setPristine(true);
					$scope.sending = false;
				}, function()
				{
					$scope.sending = false;
				});
			};
			$scope.cancel = function(item)
			{
				this.showDevPanel = false;
			};
			$scope.loginItems = [];
			function updateLoginItems() {
				LoginAsPersonalApi.select().then(function (resp) {
					$scope.loginItems = resp.data.data;
				});
			}
			updateLoginItems();
			$scope.selectLoginItem = function (item) {
				LoginAsPersonalApi.custom.select(item, function(data){
					apishoreAuth.getUserInfo();
					$state.go(".", {}, {reload: true});
				});
			}
        }
	};
});
