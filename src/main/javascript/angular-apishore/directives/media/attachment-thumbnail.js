apishore.directive("apishoreAttachmentThumbnail", function($http, apishoreUtils, apishoreImageUrl, apishoreImageToData) {
	return {
        restrict: 'E',
        replace : true,
		scope : {
			fileId : '='
		},
        templateUrl: '$ng/apishore/directives/media/attachment-thumbnail.html',

        link : function ($scope, elem, attrs)
        {
			$scope.imageSource='';
			$scope.$watch('fileId', function(newValue)
			{
				var id = newValue;
				if(!!id)
				{
					$http.get("/api/images/"+id+"?info=true").then(function(data){
		                $scope.filename = data.data.filename;
		                $scope.isImage = data.data.isImage;
		                $scope.size = data.data.size;
		                $scope.loaded = true;
		                if($scope.isImage)
		                {
		                	$scope.imageSource=apishoreImageUrl(id, $scope.modelVersion);
		                }
					});
				}
			})
        }
    };
});


