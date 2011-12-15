define([
    "app/views/like",
    "app/views/play",
    "app/views/song",
    "app/views/sidebar"
], function(views_like, views_play, views_song, views_sidebar, main) { 
    return { 
        Like: views_like.LikeView,
        Likes: views_like.LikesView,
        Play: views_play.PlayView,
        Plays: views_play.PlaysView,
        Song: views_song.SongView,
        Songs: views_song.SongsView,        
        SidebarItem: views_sidebar.ItemView,
        SidebarItems: views_sidebar.ItemsView
    }
});
