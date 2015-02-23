/*
 @file: main.js
 @author gregS
*/
require.config({
	paths : {
		'jquery': '../bower_components/jquery/dist/jquery'
		, 'pixi': '../bower_components/pixi.js/bin/pixi'
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
	'jquery'
	, 'gui'
	, 'lines'
	, 'circles'
	, 'sound/audiohandler'
	, 'sound/visualizer'

], function ($, GUI, LineHandler, CircleHandler, AudioHandler, Visualizer) {

	function initialize(callback) {
		
		var audioHandler = AudioHandler;
		
		audioHandler.mode = 'mp3';

		audioHandler.initialize(function () {
			var self = this;
			console.log('audiohandler ok');
			self.prepareDataSource();
			if (callback && typeof(callback) === "function") {
				callback();
			}
		});

	}

	initialize(function () {
		// LineHandler.initialize();
		CircleHandler.initialize();
		Visualizer.initialize();
	});

});
