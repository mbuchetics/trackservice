define(["order!libs.jquery",
        "order!libs.underscore",
        "order!libs.backbone",
        "libs.handlebars",
        "libs.json2", 
        "utils",
],
function($, _, Backbone, Handlebars, json2, utils) {  

    var SongView = Backbone.View.extend({
        tagName:  "tr",
        className: "",
        template: Handlebars.compile($('#song_template').html()),
        events: {
            "click .button-plus": "like"
            // mouseover
        }, 
        initialize: function() {
            this.model.on('change', this.render, this);
        },
        render: function() {
            var json = this.model.toJSON();
            this.$el.html(this.template(json));
            return this;
        },
        like: function(e) {
            e.preventDefault();
            this.model.like();
        }
    });

    var SongsView = Backbone.View.extend({
        tagName: "table",
        initialize: function() {
            this.model.on('change', this.render, this);        
            this.model.on('add', this.render, this);
            this.model.on('remove', this.render, this);
            this.model.on('reset', this.render, this);
        },
        render: function() {
            var table = this.$el;
                
            table.empty();
            
            this.model.each(function(song) {
               var view = new SongView({model: song });
               table.append(view.render().el);
            });

            return this;
        },
    });

    return {
        SongView: SongView,
        SongsView: SongsView
    }
});
