define(["order!libs.underscore",
        "order!libs.jquery",
        "order!js/libs/externals/backbone-min.js"
    ], 
    function() {
        if (window.console) 
            console.log('backbone');
        return Backbone;
    }
);
