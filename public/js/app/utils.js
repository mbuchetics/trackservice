define(["order!libs.jquery",
        "order!libs.underscore",
        "libs.json2", 
        "libs.date",
        "constants",
],
function($, _, json2, date, constants) { return {

    log: function(obj) {
        if (window.console) {
            console.log(obj);
        }
    },

    getDateAgo: function(daysAgo) {
        return Date.today().add({days: -daysAgo});
    },

    getTimeStr: function(time, short) {
        var now = new Date(),
            day = time.clone().clearTime(),
            today = now.clone().clearTime(),
            isToday = day.equals(Date.today()),
            isYesterday = day.equals(Date.today().add(-1).day()),
            timeDiff = now.getTime() - time.getTime(),
            timeDiffInMinutes = timeDiff / 1000 / 60,
            timeStr;

        if (timeDiffInMinutes < 2) {
            timeStr = 'just now';
        }	
        else if (timeDiffInMinutes < 15) {
            timeStr = Math.round(timeDiffInMinutes) + ' min ago';
        }
        else if (isToday) {
            timeStr = time.toString('HH:mm');
        }
        else if (short) {
            if(isYesterday) {
            	timeStr = 'yesterday';
            }
            else {
            	timeStr = time.toString('d. MM.');
            }
        }
        else {
            if(isYesterday) {
            	timeStr = 'yesterday ' + time.toString('HH:mm');
            }
            else {
            	timeStr = time.toString('d. MMM. HH:mm');
            }
        }		

        return timeStr;
    },

    isRecentTime: function(time) {
        var now = new Date(),
            timeDiff = now.getTime() - time.getTime(),
            timeDiffInMinutes = timeDiff / 1000 / 60;

        return timeDiffInMinutes < 15;			
    },

    likeSong: function(songId, userId) {
        $.post('api/likes/' + songId, { user: userId }, function(data) {
           SidebarPopularSongs.fetchPopularFromServer(constants.sidebarDaysAgo, 10);
           UserLikes.fetchLikedFromServer(userId, 15);
        });
    },

    facebookInit: function(d) {
        var appId = '274629705912895',
            channelURL = '//trackservice.localhost.com:3000/channel.html';

        if (window.location.hostname.indexOf("localhost") != -1) {
            appId = '252955554753527';
            channelURL = '//trackservice.localhost.com:3000/channel.html';
        }

        fbAsyncInit = function() {
            FB.init({
                appId      : appId,
                channelURL : channelURL,
                status     : true, // check login status
                cookie     : true, // enable cookies to allow the server to access the session
                oauth      : true, // enable OAuth 2.0
                xfbml      : true  // parse XFBML
            });

            if (CurrentUser) {
                CurrentUser.check();
            }
        };

        var js, id = 'facebook-jssdk'; 
        if (d.getElementById(id)) {return;}
        js = d.createElement('script'); js.id = id; js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        d.getElementsByTagName('head')[0].appendChild(js);
    }

}});
