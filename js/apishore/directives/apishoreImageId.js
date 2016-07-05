apishore.directive("apishoreImageId", function(apishoreImageUrl) {
	return {
		restrict : 'A',
		scope : {
			apishoreImageId:'='
		},
		
		link: function($scope, element, attrs)
		{
			$scope.$watch('apishoreImageId', function(newValue){
				//console.info("apishoreImageId="+newValue);
				if(newValue)
					attrs.$set('src', apishoreImageUrl(newValue));
				else
					attrs.$set('src', attrs.apishoreImageDefault);
			})
		}
	};
});
apishore.directive("apishoreDownloadId", function(apishoreImageUrl) {
	return {
		restrict : 'A',
		scope : {
			apishoreDownloadId:'='
		},
		link: function($scope, element, attrs)
		{
			attrs.$set("target", "_self");
			$scope.$watch('apishoreDownloadId', function(newValue){
				//console.info("apishoreImageId="+newValue);
				if(newValue)
					attrs.$set('href', apishoreImageUrl(newValue,undefined,true));
				else
					attrs.$set('href', attrs.apishoreImageDefault);
			})
		}
	};
});
apishore.directive("apishoreBackgroundImageId", function(apishoreImageUrl) {
	return {
		restrict : 'A',
		scope : {
			apishoreBackgroundImageId:'='
		},
		
		link: function($scope, element, attrs)
		{
			$scope.$watch('apishoreBackgroundImageId', function(newValue){
				//console.info("apishoreImageId="+newValue);
				if(newValue)
					element.css('background-image', "url('"+apishoreImageUrl(newValue)+"')"); 
				else
					element.css('background-image', attrs.apishoreImageDefault); 
			})
		}
	};
});
apishore.constant("apishoreImageUrl", function(id, post, forceDownload) {
	if (id && id.indexOf('http') === 0)
	{
		return id;
	}
	var url = '/api/images/'+id;
	var p = false;
	if(post)
	{
		url+=p ? "&" : '?';
		url+="ts="+post;
		p = true;
	}
	if(forceDownload)
	{
		url+=p ? "&" : '?';
		url+="download=true";
		p = true;
	}
	return url; 
});

apishore.constant("apishoreImageToData", function(id, func) {
	var img = new Image();
	img.onload = function()
	{
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0);
		var dataUrl = canvas.toDataURL('image/png');
		func(dataUrl);//.replace(/^data:image\/(png|jpg);base64,/, ""));
	};
	img.src = '/api/images/'+id;
});