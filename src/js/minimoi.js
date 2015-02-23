/*

*/
define([
	'jquery'
	, 'underscore'
	, 'sound/audiohandler'
	], function ($, AudioHandler) {

		var MiniMoi = function (){};

		_.extend(MiniMoi.prototype, {
			
			initialize: function () {
				var self = this;
				console.log('yo');
				return this;
			}
		});

	return MiniMoi;
});