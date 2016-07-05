apishore.filter('asIncludesOptions', function() {
	return function(value, options, defValue, defLabel)
	{
		var res = [];
		var set = {};
		res.push({id:defValue, text:defLabel});
		if(angular.isDefined())
		{
			if(options instanceof Array)
			{
				res = _.filter(value, function(opt){
					return opt.id != defValue && _contains(options, opt.id);
				});
			}
		}
		return res;
	};
});