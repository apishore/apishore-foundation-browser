apishore.config(function($provide){
    $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions){
        // $delegate is the taOptions we are decorating
        // register the tool with textAngular
        taRegisterTool('variables', {
            iconclass: "fa fa-tag",
            display: "<apishore-add-variable-menu></apishore-add-variable-menu>",
            action: function(){
            }
        });
        // add the button to the default toolbar definition
        taOptions.toolbar[3].push('variables');
        return taOptions;
    }]);
});

apishore.directive('apishoreAddVariableMenu', function(taSelection, $timeout) {
	return {
		restrict : 'E',
		scope: {
			
		},
		template: "<div dropdown is-open='isopen'><a class='btn-link dropdown-toggle' dropdown-toggle>Variables</a>"+
		"<ul class='dropdown-menu' role='menu'><li><a ng-repeat='v in variables' ng-click='action2(v, $event)'>{{v.l}}</a></li></ul></div>",
		//<div><a ng-repeat='v in variables' ng-click='action2(v, $event)'>{{v.l}}</a></div>",
		link : function($scope, element, attrs) {
			console.info("apishoreAddVariableMenu");
			$timeout(function(){
				var e = element.parents('apishore-add-variable-menu');
				e.removeClass("btn");
				var t = element.parents('text-angular');
				$scope.variables = $scope.$eval(t.attr('apishore-text-angular-variables'));
			});
			$scope.action2= function(v, $event){
				$scope.isopen = false;
            	var editor = $scope.$parent.$editor();
                editor.wrapSelection('inserthtml', v.v);
                if($event) $event.stopPropagation();
                if($event) $event.preventDefault();
            };
			
		}
	};
});
