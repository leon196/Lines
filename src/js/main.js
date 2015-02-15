/*
 @file: main.js
 @author gregS
*/
require.config({
	paths : {
		'jquery': '../bower_components/jquery/dist/jquery'
		, 'gui': '../bower_components/dat-gui/build/dat.gui'
		}
		, shim : {
			'bootstrap': {
				deps: ['jquery']
				, exports: '$'
			}
		}
});

define([
	'gui'
	, 'lines'
	, 'sound/audiohandler'
	, 'sound/beatdetector'

], function (GUI, LineHandler, AudioHandler, BeatDetector) {

	function initialize(callback) {

		var audioHandler = AudioHandler.initialize('audio/wondering2.mp3', function () {
			this.play();
		});

		if (callback && typeof(callback) === "function") {
			callback();
		}
	}

	initialize(function () {
		LineHandler.initialize();
	});

});
