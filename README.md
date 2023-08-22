This is not really made for ease of use, but mainly for my personal usage. But feel free to try to use it.

It needs an export of all tracks listened to from lastfm. I've used my tool [listening-habits](https://github.com/antonin-lebrard/listening-habits) to generate it.  
I don't remember why I'm using all tracks instead of the list of artists, but there must be a reason 😅.

There is no automatic process, the songkick API does not have a way to subscribe to an artist via it. But I would not have used it because the main reason this tool exists,
is because I find the implementation of the lastfm-songkick relationship not done well on last.fm.  
It needs to be an artist that lastfm knows well and that is attached to a musicbrainz id when you scrobbled it to be added to the list of artist to watch for in your https://www.last.fm/events page.

So the way the process is done, is the program compile all artists that are present in your scrobbled tracks, search for its name in the songkick API, 
and if it has found a precise match return the songkick url to the artsist for the first search result.

Each search add a line in a res.txt file to be analysed by you after. Open it in your terminal on Linux or in Notepad++ on Windows and 
you should be able to click each link and open a browser tab for each correct result.

I've done this process 3 times now, and its why I open 2 scrobbled exports that I keep in memory to ignore its artists, then read the third scrobbled export to search for new artists to subscribe to.
