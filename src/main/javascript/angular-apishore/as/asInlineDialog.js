apishore.service("asInlineDialog", function($timeout, $animate, asAnimation) {
	var i={};
	i.init = function($scope, elem, attrs)
	{
		var dialog = {};
		dialog.callback = {};
		dialog.isOpened = false;
		
		dialog.open = function($event)
		{
			elem.addClass("asa-show");
			elem.find(".as-dialog").addClass("as-transition-out")
			$timeout(function(){				
				elem.addClass("asa-transition-in");
				elem.find(".as-dialog").addClass("asa-transition-in");
			});
		}
		dialog.action = function(actionId, $event)
		{
			dialog.close($event);
			var fn = dialog.callback[actionId];
			if(fn) $timeout(fn);
		}
		dialog.close = function($event)
		{
			elem.find(".as-dialog").removeClass("as-transition-in").addClass("as-transition-out");
			elem.removeClass("asa-transition-in");
			elem.removeClass("asa-show");
		}
		elem.find(".as-dialog-holder-inner-closer").on("click", dialog.close);
		return dialog;
	}
	return i;
});
