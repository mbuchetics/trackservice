define(["order!js/libs/externals/jquery-1.7.1.min.js",
	    "order!js/libs/externals/jquery.timeago.js" 
    ], 
    function() {
        if (window.console) 
            console.log('jquery');
        return window.$;
    }
);
