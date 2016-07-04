(function() {
	function parseStateRef(ref, current) {
		var preparsed = ref.match(/^\s*({[^}]*})\s*$/), parsed;
		if (preparsed)
			ref = current + '(' + preparsed[1] + ')';
		parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);
		if (!parsed || parsed.length !== 4)
			throw new Error("Invalid state ref '" + ref + "'");
		return {
			state : parsed[1],
			paramExpr : parsed[3] || null
		};
	}
	function stateContext(el) {
		var stateData = el.parent().inheritedData('$uiView');

		if (stateData && stateData.state && stateData.state.name) {
			return stateData.state;
		}
	}
	apishore.directive("uiSref", function($injector, $state, apishoreAuth) {
		return {
			restrict : 'A',
			transclude : false,
			require : [ '?^uiSrefAcl', '?^uiSrefAclEq' ],
			scope : false,
			link : function($scope, $element, $attrs, uiSrefAcl) {
				var ref = parseStateRef($attrs.uiSref, $state.current.name);
				var params = null, url = null, base = stateContext($element)
						|| $state.$current;

				var activeDirective = uiSrefAcl[1] || uiSrefAcl[0];
				if (activeDirective) {
					activeDirective.$$setStateInfo(ref.state, params);
				}
			}
		};
	});
	apishore.directive("uiSrefAcl", function($injector, $state, apishoreAuth) {
		return {
			restrict : 'A',
			transclude : false,
			scope : false,
			controller : function($scope, $element, $attrs) {
				var state, params, activeClass;

				// There probably isn't much point in $observing this
				// uiSrefActive and uiSrefActiveEq share the same directive
				// object
				// with some
				// slight difference in logic routing
				var disableClass = 'disable-by-user-roles';

				// Allow uiSref to communicate with uiSrefActive[Equals]
				this.$$setStateInfo = function(newState, newParams) {
					state = $state.get(newState, stateContext($element));
					params = newParams;
					update();
				};

				$scope.$on('permissionsUpdated', update);

				// Update route state
				function update() {
					if (apishoreAuth.isAllowedState(state, params)) {
						$element.removeClass(disableClass);
					} else {
						$element.addClass(disableClass);
					}
				}
			}
		};
	});
})();