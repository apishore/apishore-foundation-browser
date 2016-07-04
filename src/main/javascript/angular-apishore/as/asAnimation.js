apishore.service("asAnimation", function($timeout) {
	var i={};
	i.whichTransitionEvent = function()
	{
	    var t;
	    var el = document.createElement('fakeelement');
	    var transitions = {
	      'transition':'transitionend',
	      'OTransition':'oTransitionEnd',
	      'MozTransition':'transitionend',
	      'WebkitTransition':'webkitTransitionEnd'
	    }

	    for(t in transitions){
	        if( el.style[t] !== undefined ){
	            return transitions[t];
	        }
	    }
	}
	i.onEnd = function(elem, delay, callback)
	{
		if(i.whichTransitionEvent())
		{
			elem.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", callback);
		}
		else
		{
			$timeout(callback, delay | 300);
		}
	}
	return i;
});