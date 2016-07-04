apishore.factory("apishoreNumbers", function($state, apishoreUtils)
{
    return {
		round: function(v)
		{
			// see http://0.30000000000000004.com/
			var t = 1000000000;
			return Math.round(v * t) / t;
		},
    	increment: function(value, limits, values, max)
    	{
    		for(var i=0; i< limits.length; i++)
    		{
    			var limit = limits[i];
    			if(limit == undefined || Math.abs(value) < limit)
    			{
					return this.round(Math.min(value + values[i], max));
    			}
    		}
			var number2 = Math.min(value, max);
            return number2;
    	},
    	decrement: function(value, limits, values, min)
    	{
    		for(var i=0; i< limits.length; i++)
    		{
    			var limit = limits[i];
    			if(limit == undefined || Math.abs(value) < limit)
    			{
					return this.round(Math.max(value - values[i], min));
    			}
    		}
			return this.round(Math.max(value, min));
    	}
    }
});