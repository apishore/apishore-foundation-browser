apishore.filter('asAmPm', function() {
    return function(input) {
        return input ? 'am' : 'pm';
    }
});

apishore.directive('asDateTimePickerHelper', function($timeout, $window)
{
	return {
         restrict: 'E',
         link: function(scope, $elem, $attrs)
         {
        	var fieldName = $attrs.field;
        	function f2(d)
        	{
        		return d < 10 ? "0"+d : ""+d;
        	}
        	function value()
        	{
        		var v = scope.itemData.data[fieldName];
        		return v ? moment(v) : moment();
        	}
        	if(scope.itemDataHelper == undefined)
        	{
        		scope.itemDataHelper = {};
        	}
        	scope["asDateTimePickerHelper_"+fieldName+"_am"] = function()
        	{
        		var m = value();
	        	m.hours(m.hours() + (m.hours() < 12 ? 12 : -12));
	        	scope.itemData.data[fieldName] = m.format("MM/DD/YYYY HH:mm");
	        }
        	function setEditors(m)
        	{
        		scope.itemDataHelper[fieldName+"_date"] = m.format("MM/DD/YYYY");
        		scope.itemDataHelper[fieldName+"_hours"] = f2(m.hours() % 12);
        		scope.itemDataHelper[fieldName+"_minutes"] = f2(m.minutes());
        		scope.itemDataHelper[fieldName+"_am"] = m.hours() < 12;
        	}
        	scope.$watch("itemData.data."+fieldName, function(nv, ov)
        	{
        		if (nv !== ov && nv != undefined)
        		{
	        		var m =  moment(nv);
	        		setEditors(m);
        		}
        	});
        	scope.$watch("itemDataHelper."+fieldName+"_date", function(nv, ov)
        	{
        		if (nv !== ov && nv != undefined)
        		{
	        		var n = moment(nv, "MM/DD/YYYY");
	        		var m = value();
	        		m.year(n.year());
	        		m.month(n.month());
	        		m.date(n.date());
	        		console.info(nv +" - n="+ n +" m="+m);
	        		scope.itemData.data[fieldName] = m.format("MM/DD/YYYY HH:mm");
        		}
        	});
        	scope.$watch("itemDataHelper."+fieldName+"_hours", function(nv, ov)
        	{
        		if (nv !== ov && nv != undefined)
        		{
        			var am = scope.itemDataHelper[fieldName+"_am"];
	        		var n = parseFloat(nv);
	        		var m = value();
	        		m.hours(n  + (am ? 0 : 12));
	        		scope.itemData.data[fieldName] = m.format("MM/DD/YYYY HH:mm");
        		}
        	});
        	scope.$watch("itemDataHelper."+fieldName+"_minutes", function(nv, ov)
        	{
        		if (nv !== ov && nv != undefined)
        		{
	        		var n = parseFloat(nv);
	        		var m = value();
	        		m.minutes(n);
	        		scope.itemData.data[fieldName] = m.format("MM/DD/YYYY HH:mm");
        		}
        	});
         }
	};
});

