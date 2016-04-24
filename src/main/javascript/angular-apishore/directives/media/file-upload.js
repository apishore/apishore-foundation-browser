apishore.directive("apishoreFileUpload", function($http, apishoreUtils, apishoreImageUrl) {
	return {
        restrict: 'E',
        require : "^form",
        replace : true,
		scope : {
			model : '='
		},
        templateUrl: '$ng/apishore/directives/media/file-upload.html',

        link : function ($scope, elem, attrs)
        {
			$scope.imageSource='';
			$scope.modelVersion = new Date().getTime();
			
			//$scope.$watchGroup(['model', 'modelVersion'], function(newValue)
			//{
			//	var id = newValue[0];
			//	if(!!id)
			//	{
			//		$scope.imageSource=apishoreImageUrl(id, $scope.modelVersion);
			//		$http.get("/api/image/"+id+"?info=true").then(function(data){
		     //           $scope.model = data.id;
		     //           $scope.filename = data.filename;
		     //           $scope.isImage = data.isImage;
			//		});
			//	}
			//});
		    
            $scope.uploaded = function ($file, $message) {
                $scope.model = $message;
                $scope.filename = $file.name;
                $scope.isImage = false; //data.isImage;
            };
            $scope.remove = function()
            {
            	$scope.model = "";
            }
        }
    };
});


