
apishore.factory("apishoreUtils", function($injector, $http, $stateParams, $state, $window, $timeout, $location) {
    var utils;
	return utils = {
		escapeRegExp: function (string) {
		    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
		},
		replaceAll: function(string, find, replace) {
			  return string.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
		},
		redirectToUrl: function(urlTemplate, params)
		{
			var url = urlTemplate;
			for(var name in params)
			{
				url = this.replaceAll(url, "{"+name+"}", params[name]);
				url = this.replaceAll(url, ":"+name, params[name]);
			}
			angular.element($window.document.body).addClass("apishore-redirect-in-process");
			$timeout(function(){
				//give browser chance to show redirect notice
				window.location = url;//$location.path(url).replace();
			});
		},
		redirectToState: function(state, params)
		{
			$state.go(state, params);
		},
		apiName: function(str)
		{
			return this.toClassName(str)+"Api";
		},
		compileApishoreBind : function($scope, src, query, params, loadListener)
		{
			var i=src.indexOf("as");
			var viewName =  this.apiName(src.substring(0,i).trim());
			var localName = src.substring(i+2).trim();
			var obj = $scope[localName] = {
				state: "loading",
				items:[]
			};
			var func = $injector.get(viewName).listByState || $injector.get(viewName).list;
			func(query, params).then(function(data){
				obj.state = "loaded";
				obj.items = data.data.data;
				for(var i=0; i< obj.items.length; i++)
				{
					obj.items[i].$index = i;
				}
				if(loadListener) loadListener(obj);
			}, function(data){
				obj.state = "failed";
				obj.items = [];
			});

			return obj;
		},
		toClassName: function(str)
		{
			str = str.replace(/_([a-z])/g, function (m, w) {
			    return w.toUpperCase();
			});
			return str.substring(0,1).toUpperCase()+str.substring(1);
		},
		toFieldName: function(str)
		{
			return angular.isString(str) ? str.replace(/_([a-z])/g, function (m, w) {
			    return w.toUpperCase();
			}) : str;
		},
		getDefaultDateTime : function(strategy)
		{
			switch (strategy) {
			case 'now':
				return this.getNow().toDate();
			case 'tomorrow':
				return this.getNextDayStart().toDate();
			case 'next_week':
				return this.getNextWeekStart().toDate();
			case 'next_month':
				return this.getNextMonthsStart().toDate();
			case 'next_2months':
				return this.getNextMonthsStart(2).toDate();
			case 'next_3months':
				return this.getNextMonthsStart(3).toDate();
			case 'next_6months':
				return this.getNextMonthsStart(6).toDate();
			default:
				return undefined;
			}
		},
		getNow : function () {
			var today = moment();
			today.millisecond(0);
			today.second(0);
			return today;
		},
		getToday : function () {
			var today = this.getNow();
			today.minute(0);
			today.hour(9);
			return today;
		},
		getNextDayStart : function () {
            var today = this.getToday();
            var nextDay = today.add('days', 1);

            return nextDay;
        },
		getNextWeekStart : function () {
			var today = this.getToday();
            var daystoMonday = 0 - (1 - today.isoWeekday()) + 7;

            var nextMonday = today.subtract('days', daystoMonday);

            return nextMonday;
        },

		getNextWeekEnd: function() {
            var nextMonday = GetNextWeekStart();
            var nextSunday = nextMonday.add('days',6);

            return nextSunday;
        },

        getLastWeekStart: function () {
			var today = this.getToday();
            var daystoLastMonday = 0 - (1 - today.isoWeekday()) + 7;

            var lastMonday = today.subtract('days', daystoLastMonday);

            return lastMonday;
        },

        getLastWeekEnd : function () {
            var lastMonday = GetLastWeekStart();
            var lastSunday = lastMonday.add('days', 6);

            return lastSunday;
        },
		getNextMonthsStart : function (number) {
			var today = this.getToday();
			today.date(1);
			return today.add('month', number || 1);
		},
        adjustFormGroupCheckTemplate : function(html, attrs)
        {
        	var id = attrs.controlId,
        		input = html.find("input");

        	//checkbox is inside label
        	// adjust input tag
	    	if(input.length)
	    	{
				this.adjustFormGroupTemplateInput(input, attrs);
	    	}
        },
		adjustFormGroupTemplate: function(html, attrs, labelValue)
        {
        	var id = attrs.controlId,
        		label = html.find("label"),
        		input = html.find("input"),
        		select = html.find("select"),
        		textarea = html.find("textarea"),
        		rich = html.find("text-angular"),
        		btn = html.find("button");

        	// add for & content to label
        	label.attr("for", id);
			if(angular.isDefined(labelValue))
			{
				label.text(attrs.label || labelValue);
			}
			// adjust input tag
        	if(input.length)
        	{
				this.adjustFormGroupTemplateInput(input, attrs);
				input.attr('placeholder', attrs.placeholder);
        	}
        	if(textarea.length)
        	{
				this.adjustFormGroupTemplateInput(textarea, attrs);
				input.attr('placeholder', attrs.placeholder);
        	}
        	if(rich.length)
        	{
				this.adjustFormGroupTemplateInput(rich, attrs);
				input.attr('placeholder', attrs.placeholder);
			}
        	if(select.length)
        	{
				this.adjustFormGroupTemplateInput(select, attrs);
        	}
        	if(btn.length)
        	{
				this.adjustFormGroupTemplateInput(btn, attrs);
        		btn.attr("id", id+"-btn");
        	}
        },
		disabledExpression: function(attrs)
		{
			var disabled;
			if(angular.isDefined(attrs.readonly))
			{
				disabled = attrs.readonly;
			}
			if(angular.isDefined(attrs.disableExpression))
			{
				if(disabled)
				{
					disabled += ' || (' + attrs.disableExpression + ')';
				}
				else
				{
					disabled = attrs.disableExpression;
				}
			}
            if(angular.isDefined(attrs.enableExpression))
            {
                if(disabled)
                {
                    disabled += ' || !(' + attrs.enableExpression + ')';
                }
                else
                {
                    disabled = '!(' + attrs.enableExpression + ')';
                }
            }
            if(angular.isDefined(attrs.apishoreEnableExpression))
            {
                disabled = disabled ? disabled + ' || ' : '';
                disabled += '!(' + attrs.apishoreEnableExpression + ')';
            }
			return disabled;
		},
		adjustFormGroupTemplateInput: function(input, attrs)
		{
			input.attr("id", attrs.controlId);
			input.attr("name", attrs.controlId);
			input.attr('ng-readonly', attrs.readonly);
			var disabled = this.disabledExpression(attrs);
			if(disabled)
			{
				input.attr("ng-disabled", disabled);
				if(angular.isDefined(attrs.disabledValue))
				{
					input.attr("apishore-disabled-value", attrs.disabledValue);
				}
				if(angular.isDefined(attrs.required))
				{
					input.attr('ng-required', attrs.required + ' && !(' + disabled + ')');
				}
			}
			else if(angular.isDefined(attrs.required))
			{
				input.attr('ng-required', attrs.required);
			}
			if(angular.isDefined(attrs.confirmationOf))
			{
				input.attr('apishore-confirmation-of', attrs.confirmationOf);
			}
		},

		applyUniqueFunction: function($scope, attrs)
		{
			var f = attrs.uniqueFunction && $scope.$parent[attrs.uniqueFunction];
			if (f)
			{
				$scope.formField.$parsers.push(function (value) {
					var result = value && f(value);
					if (result && result.then) {
						result.then(function (data) { //For promise type result object
							$scope.formField.$setValidity('unique', data.data);
						}, function (error) {
							$scope.formField.$setValidity('unique', false);
						});
					}
					return value;
				});
			}

		},
		workflowRead: function (url, item, callback, errors)
		{
			if (item && item.id)
			{
				url += item.id;
			}
			var promise = $http.get(url).success(function (res)
			{
				if(angular.isDefined(callback))
				{
					callback(res);
				}
			});
			if (errors) promise.error(errors);
		},
		workflowCreate: function (url, item, callback, errors)
		{
			if (item && item.id)
			{
				url += item.id;
			}
			var promise = $http.post(url, item).success(function (res)
			{
				if(angular.isDefined(callback))
				{
					callback(res);
				}
			});
			if (errors) promise.error(errors);
		},
		workflowUpdate: function (url, item, callback, errors)
		{
			if (item && item.id)
			{
				url += item.id;
			}
			var promise = $http.put(url, item).success(function (res)
			{
				if(angular.isDefined(callback))
				{
					callback(res);
				}
			});
			if (errors) promise.error(errors);
		},
		workflowDelete: function (url, item, callback, errors)
		{
			if (item && item.id)
			{
				url += item.id;
			}
			var promise = $http.delete(url).success(function (res)
			{
				if(angular.isDefined(callback))
				{
					callback(res);
				}
			});
			if (errors) promise.error(errors);
        },
        firstInOthers: function()
        {
            if(arguments.length < 2)
            {
                return false;
            }
            var first = arguments[0];
            for(var i = 1; i < arguments.length; i++)
            {
                if(first == arguments[i])
                {
                    return true;
                }
            }
            return false;
        },
        createInputScope: function(elem, attrs, label, defaultValue)
        {
            this.adjustFormGroupTemplate(elem, attrs, label);
            return {
                post: function($scope, elem, attrs, formCtrl)
                {
                    // console.log(name + ': post link'+formCtrl);
                    $scope.formField = formCtrl[attrs.controlId];
                    $scope.form = formCtrl;
                    if(angular.isDefined(defaultValue) && angular.isDefined(attrs.creationTime))
                    {
                        $scope.model = defaultValue;
                    }
                    $scope.onSuggestion = function(value, label)
                    {
                        $scope.model = value;
                        if(angular.isDefined(attrs.pullSuggestionLabelTo))
                        {
                            $scope.itemData.data[attrs.pullSuggestionLabelTo] = label;
                        }
                    };
                    utils.applyUniqueFunction($scope, attrs);
                }
            };
        },
        createInputRangeScope: function(elem, attrs, label, defaultMin, defaultMax)
        {
            this.adjustFormGroupTemplate(elem, attrs, label);
            return {
                post: function($scope, elem, attrs, formCtrl)
                {
                    // console.log(name + ': post link'+formCtrl);
                    $scope.formField = formCtrl[attrs.controlId];
                    $scope.form = formCtrl;
                    if(angular.isDefined(attrs.creationTime))
                    {
                        $scope.model = {};
                        if(angular.isDefined(defaultMin) || angular.isDefined(defaultMax))
                        {
                            $scope.model.min = defaultMin;
                            $scope.model.max = defaultMax;
                        }
                    }
                    $scope.onSuggestion = function(value, label)
                    {
                        $scope.model = value;
                        if(angular.isDefined(attrs.pullSuggestionLabelTo))
                        {
                            $scope.itemData.data[attrs.pullSuggestionLabelTo] = label;
                        }
                    };
                    utils.applyUniqueFunction($scope, attrs);
                }
            };
        },
//        pageFunctions: function($scope)
//        {
//            $scope.setPage = function(p)
//            {
//                var q = $scope.query;
//                q.offset = p.offset;
//                $scope.selectAll();
//            };
//            $scope.prevPage = function()
//            {
//                var q = $scope.query;
//                if(q.offset < $scope.pagination.pageSize)
//                {
//                    return;
//                }
//                q.offset = q.offset-$scope.pagination.pageSize;
//                $scope.selectAll();
//            };
//            $scope.nextPage = function()
//            {
//                var q = $scope.query;
//                if(q.offset + $scope.pagination.pageSize > $scope.pagination.totalItems)
//                {
//                    return;
//                }
//                q.offset = q.offset+$scope.pagination.pageSize;
//                $scope.selectAll();
//            };
//        },
        selectByParent: function selectByParent(query, structure, subParentName, subParent, parentName, parent)
        {
            var url = '/api/';
            if (parent)
            {
                url += parentName+'/'+parent+'/';
            }
            if (subParent)
            {
                url += subParentName+'/'+subParent+'/';
            }
            url += structure+'/';
            return select(query, url)
        },
        select: function select(query, url)
        {
            query = query || {};

            var config = {};
            config.method = 'GET';
            config.url = url;
            config.url += '/{{xml.name}}';
            config.params = {};
            if(query.query)
            {
                config.params.query = query.query;
            }
            if(query.limit)
            {
                config.params.limit = query.limit;
            }
            if(query.offset)
            {
                config.params.offset = query.offset;
            }
            if(query.sortField)
            {
                config.params.sort = query.sortField;
            }
            if(query.sortDirection)
            {
                config.params.dir = query.sortDirection;
            }
            if(query.typeahead)
            {
                config.params.typeahead = query.typeahead;
            }
            if(query.unique)
            {
                config.params.unique = query.unique;
            }
            if(query.filters)
            {
                config.params.filters = query.filters;
            }
            return $http(config);
        }
	};
});
