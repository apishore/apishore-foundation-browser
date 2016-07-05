apishore.filter('percent', function() {
	return function(value)
	{
		return value ? value+"%" : "0%";
	};
});