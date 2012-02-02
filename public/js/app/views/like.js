define(["order!libs.jquery",
        "order!libs.underscore",
        "order!libs.backbone",
        "libs.handlebars",
        "libs.json2", 
        "utils",
],
function($, _, Backbone, Handlebars, json2, utils) {  
   
    var LikeView = Backbone.View.extend({
        tagName:  "tr",
        className: "",
        template: Handlebars.compile($('#like_template').html()),
        events: {
        }, 
        initialize: function() {
            this.model.on('change', this.render, this);
        },
        render: function() {
            var json = this.model.toJSON();
            this.$el.html(this.template(json));
            return this;
        },
    });
    
    var LikesView = Backbone.View.extend({
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
            
            this.model.each(function(like) {
               var view = new LikeView({model: like });
               table.append(view.render().el);
            });

            return this;
        },
    });

    return {
        LikeView: LikeView,
        LikesView: LikesView
    }
});
