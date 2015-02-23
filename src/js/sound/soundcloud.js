/*

*/
define([
	'jquery'
	, 'sound/beatdetector'
	], function ($, AudioHandler) {
		var SoundCloud = {
			client_id: "616195748c5a9989a9b09d16275dbe1b"
			, client_secret: "415744c1f0a26ffcfcc928890d11511a"
			, i: 0

			, initialize: function (AudioHandler) {
				var self = this;
				this.context  = AudioHandler.getContext();
				this.tracks = [];
				SC.initialize({
					client_id: this.client_id,
					redirect_uri: "http://localhost:8000/toto/"
				});

				//////////
				var set_url = "http://soundcloud.com/gregory-semah/sets/myplays";
				SC.get('/resolve', { url: set_url }, function(set) {
					self.url = set;
				});
				///////

				this.audio = new Audio();
				this.audio.src = this.url;
				this.source = this.context.createMediaElementSource(this.audio);

				return this;
			}
			, play: function () {
				this.source.connect(this.context.destination);
				this.source.mediaElement.play();
			}
			, playTrack: function () {
				var self = this;
				SC.stream(this.url);

			}
		};
	return SoundCloud;
});