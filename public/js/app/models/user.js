define(["order!libs.jquery",
        "order!libs.underscore",
        "order!libs.backbone",
        "utils",
],
function($, _, Backbone, utils) {  
  
    var User = Backbone.Model.extend({
        
        setUserData: function() {
            var user = this;
            FB.api('/me', function(response) {
                utils.log('user logged in');
                utils.log(response);
                user.set({
                   'username': response.name,
                   'id': response.id,
                   'isLoggedIn': true
                });
                
                UserLikes.fetchLikedFromServer(response.id, 15);
                
                $('#login').hide();
                $('#logout').show();
                
                $('#username').text('Hallo, ' + response.first_name + '!');
            });
        },

        check: function() {
            var user = this;
            FB.getLoginStatus(function(response) {
                if (response.authResponse) {
                    user.setUserData();
                }
                else {
                    utils.log('unknown user');
                    user.set({
                       'username': null,
                       'id': null,
                       'isLoggedIn': false
                    });
                    
                    $('#login').show();
                    $('#logout').hide();
                }
            });
        },

        login: function() {
            var user = this;
            FB.login(function(response) {
               if (response.authResponse) {
                   user.setUserData();
               }
               else {
                   utils.log('user cancelled login');
               }
            });
        },

        logout: function() {
            var user = this;
            FB.logout(function(response) {
                user.set({
                   'username': null,
                   'id': null,
                   'isLoggedIn': false
                });
                $('#login').show();
                $('#logout').hide();
            });
        } 
    });

    return User;
});
