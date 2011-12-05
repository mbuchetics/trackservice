require.config({
    paths: {
        "libs.json2":       "libs/require_json2",
        "libs.jquery":      "libs/require_jquery",
        "libs.underscore":  "libs/require_underscore",
        "libs.handlebars":  "libs/require_handlebars",
        "libs.backbone":    "libs/require_backbone",
        "libs.date":        "libs/require_date",
        "main":             "app/main",
        "models":           "app/models",
        "views":            "app/views",
        "utils":            "app/utils",        
        "constants":        "app/constants"
    }
});

require([ "main" ],
    function(app) {
        app.init();
    }
);
