apishore.directive("apishoreImageUpload", function($http, apishoreUtils, apishoreImageUrl, apishoreImageToData) {
	return {
        restrict: 'E',
        //require : "^form",
        replace : true,
		scope : {
			model : '=',
            api : '=',
            field : '@'
		},
        templateUrl: '$ng/apishore/directives/media/image-upload.html',

        link : function ($scope, elem, attrs)
        {
			$scope.cropMode = false;
			$scope.imageSource='';
			$scope.modelVersion = new Date().getTime();
			$scope.croppedImage='';
			
			var handleFileSelect=function()
			{
				var url = $scope.api.buildUrl($scope.api.stateParams(), true) + '?field=' + $scope.field;
				$scope.imageSource= url + '&ts=' + $scope.modelVersion;
			};
			$scope.$watchGroup(['model', 'modelVersion'], function(newValue)
			{
				if(angular.isDefined(newValue[0]) && newValue[0])
				{
					handleFileSelect();
				}
			});
		    
            $scope.uploaded = function ($file, $message) {
                $scope.model = $message;
            };
            $scope.remove = function()
            {
            	$scope.model = "";
            };
            $scope.exitCropMode = function()
            {
            	$scope.cropMode=false;
            };
            $scope.toCropMode = function()
            {
            	$scope.cropMode=true;
            };
            $scope.crop = function()
            {
            	var req = {
            		method: 'PUT',
            		url: '/api/images/',
            		data: {
            			id: $scope.model,
            			data: $scope.croppedImage.replace(/^data:image\/(png|jpg);base64,/, "")
            		}
            	};
            	$http(req).success(function(data)
            	{
            		$scope.model = data;
            		$scope.modelVersion = new Date().getTime();
            		$scope.exitCropMode();
            	});
            };
			$scope.fileUploadSubmit =  function fileUploadSubmit($files, $event, $flow) {
				var url = $scope.api.buildUrl($scope.api.stateParams(), true) + '?field=' + $scope.field;
				console.log('File upload url: ' + url);
				$flow.opts.target = url;
				$flow.upload();
			};
        }
    };
});


