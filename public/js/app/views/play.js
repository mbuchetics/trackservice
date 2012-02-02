define(["order!libs.jquery",
        "order!libs.underscore",
        "order!libs.backbone",
        "libs.handlebars",
        "libs.json2", 
        "utils",
],
function($, _, Backbone, Handlebars, json2, utils) {  
    var PlayView = Backbone.View.extend({
        tagName:  "tr",
        className: "",
        template: Handlebars.compile($('#play_template').html()),
        templateRecent: Handlebars.compile($('#play_template_recent').html()),
        events: {
            "click .button-plus": "like"
        }, 
        initialize: function() {
            this.model.on('change', this.render, this);
        },
        render: function() {            
            if (this.model.get('isRecent')) {
                this.$el.html(this.templateRecent(this.model.toJSON()));
            }
            else {
                this.$el.html(this.template(this.model.toJSON()));
            }
            
            return this;
        },
        like: function(e) {
            e.preventDefault();
            this.model.like();
        }
    });
    
    var PlaysView = Backbone.View.extend({
        tagName: "table",
        initialize: function() {
            this.model.on('add', this.add, this);
            this.model.on('remove', this.remove, this);
            this.model.on('reset', this.render, this);
        },
        render: function() {
            var table = this.$el;
            table.empty();
            
            this.model.each(function(play) {
               var view = new PlayView({model: play});
               table.append(view.render().el);
            });
            
            return this;
        },
        add: function(play, playList) {
            var index = playList.indexOf(play),
                table = this.$el,
                view = new PlayView({model: play}),
                row = $(view.render().el);
                         
            if (index == 0) {
                row.fadeIn('slow');
                table.prepend(row);
            } 
            else {
                row.fadeIn('fast');
                table.append(row);
            }
        },
        remove: function(play, playList) {
            var index = playList.indexOf(play),
                table = this.$el;
            
            table.find('tr').eq(index).remove();
        }
    });

    return {
        PlayView: PlayView,
        PlaysView: PlaysView
    }
});
