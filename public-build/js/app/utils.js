define(["order!libs.jquery","order!libs.underscore","libs.json2","libs.date","constants"],function(a,b,c,d,e){return{log:function(a){window.console&&console.log(a)},getDateAgo:function(a){return Date.today().add({days:-a})},getTimeStr:function(a,b){var c=new Date,d=a.clone().clearTime(),e=c.clone().clearTime(),f=d.equals(Date.today()),g=d.equals(Date.today().add(-1).day()),h=c.getTime()-a.getTime(),i=h/1e3/60,j;return i<2?j="just now":i<15?j=Math.round(i)+" min ago":f?j=a.toString("HH:mm"):b?g?j="yesterday":j=a.toString("d. MM."):g?j="yesterday "+a.toString("HH:mm"):j=a.toString("d. MMM. HH:mm"),j},isRecentTime:function(a){var b=new Date,c=b.getTime()-a.getTime(),d=c/1e3/60;return d<15},likeSong:function(b,c){a.post("api/likes/"+b,{user:c},function(a){SidebarPopularSongs.fetchPopularFromServer(e.sidebarDaysAgo,10),UserLikes.fetchLikedFromServer(c,15)})},facebookInit:function(a){var b="274629705912895",c="//trackservice.localhost.com:3000/channel.html";window.location.hostname.indexOf("localhost")!=-1&&(b="252955554753527",c="//trackservice.localhost.com:3000/channel.html"),fbAsyncInit=function(){FB.init({appId:b,channelURL:c,status:!0,cookie:!0,oauth:!0,xfbml:!0}),CurrentUser&&CurrentUser.check()};var d,e="facebook-jssdk";if(a.getElementById(e))return;d=a.createElement("script"),d.id=e,d.async=!0,d.src="//connect.facebook.net/en_US/all.js",a.getElementsByTagName("head")[0].appendChild(d)}}})