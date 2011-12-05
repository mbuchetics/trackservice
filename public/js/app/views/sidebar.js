define(["order!libs.jquery",
        "order!libs.underscore",
        "order!libs.backbone",
        "libs.handlebars",
        "libs.json2", 
        "utils",
],
function($, _, Backbone, Handlebars, json2, utils) {  

    var ItemView = Backbone.View.extend({
        tagName:  "tr",
        className: "",
        templateSong: Handlebars.compile($('#sidebar_song_template').html()),
        templateLike: Handlebars.compile($('#sidebar_like_template').html()),
        initialize: function() {
            this.model.bind('change', this.render, this);
        },
        render: function() {
            var json = this.model.toJSON();
            
            if (this.model.has('count')) {
                $(this.el).html(this.templateSong(json));
            }
            else {
                $(this.el).html(this.templateLike(json));
            }
            
            return this;
        }
    });
    
    var ItemsView = Backbone.View.extend({
        tagName: "table",
        initialize: function() {
            this.model.bind('change', this.render, this);        
            this.model.bind('add', this.render, this);
            this.model.bind('remove', this.render, this);
            this.model.bind('reset', this.render, this);
        },
        render: function() {
            var viewType = this.viewType,
                table = this.el;
                
            $(table).empty();
           
            this.model.each(function(item) {
               var view = new ItemView({model: item });
               $(table).append(view.render().el);
            });
            
            return this;
        },
    });

    return {
        ItemView: ItemView,
        ItemsView: ItemsView
    }
});
