
apishore.factory("apishoreDataUtils", function($injector, $http, $stateParams, $state, $window, $timeout, $location) {
    var utils;
	return utils = {
		merge : function(ov, nv)
		{
			if(!ov) return nv;
			if(nv instanceof Array)
			{
				var oi = 0, ni = 0;
				//merge array elements
				for(oi = 0; oi < ov.length;)
				{
					if(ni == nv.length)
					{
						//remove tail of old data
						ov.splice(oi, ov.length-oi);
						break;
					}
					var ovv = ov[oi];
					var nvv = nv[ni];
					if(this.equalIds(ovv, nvv))
					{
						this.merge(ovv, nvv);
						oi++;
						ni++;
					}
					else
					{
						var old = this.findAndRemoveById(ov, oi, this.getId(nvv));
						if(old)
						{
							ov.splice(oi, 0, old);
							ovv = old;
							this.merge(ovv, nvv);
							oi++;
							ni++;
						}
						else
						{
							ov.splice(oi, 1, nvv);
							oi++;
							ni++;
						}
					}
				}
				//add tail of new elements
				for(; ni < nv.length; ni++)
				{
					ov.push(nv[ni]);
				}
				return ov;
			}
			else if(nv instanceof Object)
			{
				//remove deletions
				for (var key in ov)
				{
					if (ov.hasOwnProperty(key) && !nv[key]) delete ov[key];
				}
				for (var key in nv)
				{
					var ovv = ov[key];
					var nvv = nv[key];
					if(ovv == undefined)
					{
						//new properties
						ov[key] = nvv;
					}
					else if(ovv != nvv)
					{
						//change & merge
						ov[key] = this.merge(ovv, nvv);
					}
				}
				return ov;
			}
			return nv;
		},
		equalIds : function(a, b)
		{
			if(a == undefined || b == undefined) return false;
			if(a.hasOwnProperty("id") && b.hasOwnProperty("id"))
			{
				return a.id == b.id;
			}
			else if(a.hasOwnProperty("data") && b.hasOwnProperty("data"))
			{
				return this.equalIds(a.data, b.data);
			}
		},
		findAndRemoveById : function(a, idx, id)
		{
			if(a == undefined) return undefined;
			for(; idx < a.length; idx++)
			{
				var item = a[idx];
				if(id == this.getId(item))
				{
					a.splice(idx, 1);
					return item;
				}
			}
			return undefined;
		},
		getId : function(a)
		{
			if(a == undefined) return undefined;
			if(a.hasOwnProperty("id"))
			{
				return a.id;
			}
			else if(a.hasOwnProperty("data") && a.data.hasOwnProperty("id"))
			{
				return a.data.id;
			}
		}
	};
});
