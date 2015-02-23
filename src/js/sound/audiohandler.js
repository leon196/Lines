/*

*/
define([
	'jquery'
	, 'sound/beatdetector'
	, 'sound/soundCloud'
	], function ($, BeatDetector, SoundCloud) {

		var AudioHandler = {

			soundBuffer: null
			, noiseBuffer: null
			, convolver: null
			, startOffset: 0
			, startTime: 0
			, context: null
			, isLoaded: false
			, bufferSize: 4096

			, initialize: function (callback) {
				var self = this;
				this.callback = callback;

				// console.log('audio intialisation');
				if (typeof AudioContext !== "undefined") {
					this.context = new AudioContext();
				} 
				else if (typeof webkitAudioContext !== "undefined") {
					this.context = new webkitAudioContext();
				} 
				else {
					throw new Error('AudioContext not supported. :(');
				}

				this.beatdetector = new BeatDetector();
				this.analyser = this.context.createAnalyser();


				this.callback && this.callback();

				return this;
			}

			, getMicroSource: function (callback) {
				var self = this;
				navigator.getUserMedia = ( navigator.getUserMedia ||
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia ||
				navigator.msGetUserMedia);

				if (navigator.getUserMedia) {
					navigator.getUserMedia (	
						{
							audio: true
							, video: false
						}
						, function (stream) {
							console.log('process stream');
							self.processStream(stream, callback);
						}
						, function (err) {
							console.log("The following error occured: " + err);
						}
					);
				} 
				else {
				   console.log("getUserMedia not supported");
				}
			}

			, processStream: function (stream, callback) {
				var self = this;
				this.source = this.context.createMediaStreamSource(stream);
				this.source.connect(this.context.destination);
				callback && callback();

			}

			, getSoundCloudSource: function () {
				this.soundCloud = SoundCloud.initialize(this);
				this.soundCloud.playTrack();
				return this.soundCloud.source;
			}

			, prepareDataSource: function () {
				var self = this;
				if(this.mode == 'microphone') {
					this.getMicroSource(function() {
						self.startAnalysis();
					});
				}
				
				else if (this.mode == 'mp3') {
					this.loadSound('audio/wondering2.mp3', function() {
						console.log('load sound ok');
						self.getMP3Source(function () {
							self.startAnalysis();
						});
					});
				}

				else if (this.mode == 'soundcloud') {
					this.source = this.getSoundCloudSource();
					this.startAnalysis();
				}

			}

			, getContext: function () {
				return this.context;
			}


			//Load our Sound using XHR
			, loadSound: function (url, callback) {
				var 
					self = this
					, request = new XMLHttpRequest()
				;
				request.open("GET", url, true);
				request.responseType = "arraybuffer";
				request.onload = function() {
					self.context.decodeAudioData(request.response, function(buffer) {
						self.isLoaded = true;
						self.soundBuffer = buffer;
						callback && callback();
					}, self.onError);
				};

				request.send();
			}

			, onError: function(e) {
				console.log("Error with decoding audio data" + e.err);
			}

			, update: function () {
				var self = this;
				this.beatdetector.sampleAudioStream(this);
				this.updateBeat();
				requestAnimFrame(function() {
					self.update();
				});
			}

			, updateBeat: function () {
				var light = $('#beat');
				// console.log("low: "+ this.beatdetector.heartBeatLow +", mid :"+ this.beatdetector.heartBeatMid +", high :"+ this.beatdetector.heartBeatHigh);
				// if (this.beatdetector.heartBeatLow > 100){
				// 	light.css({background:'yellow'});
				// }
				// else if (this.beatdetector.heartBeatLow > 0){
				// 	light.css({background:'green'});
				// }
				// else if (this.beatdetector.heartBeatMid > 0){
				// 	light.css({background:'red'});
				// }
				// else if (this.beatdetector.heartBeatHigh > 0){
				// 	light.css({background:'green'});
				// }
				if (this.beatdetector.volume > 13000){
					light.css({background:'yellow'});
				}
				else {
					light.css({background:'black'});
				}
			}

			, getMP3Source: function (callback) {
				var self = this;
				this.source = this.context.createBufferSource();
				this.source.buffer = this.soundBuffer;
				this.source.loop = true;
				this.source.connect(this.context.destination);
				this.source.start(0);

				callback && callback();
			}

			, analyseData: function () {
				this.source.connect(this.analyser);
				this.analyser.connect(this.context.destination);
				this.analyser.smoothingTimeConstant = 0.85;
			}

			, startAnalysis: function () {
				this.analyseData();
				this.update();
				console.log('starting sound analysis...');
			}

			, getSpectrum: function() {
				var freq = this.analyser.frequencyBinCount;
				var freqByteData = new Uint8Array(freq);
				this.analyser.getByteFrequencyData(freqByteData);
				return freqByteData;
			}
			
			, getDominantFrequency: function() {
				var freqByteData = this.getSpectrum();
				var highest = 0;
				var highestFreq = freqByteData[0];
				for(var i = 0; i < freqByteData.length; i++) {
					if (freqByteData[i] > highest) {
						highest = i;
						highestFreq = freqByteData[i];
					}
				}
				
				return highest;
			},
				
			getAverageFrequency: function(offset, count) {
				var freqByteData = this.getSpectrum();            
				
				count = count || freqByteData.length;
				offset = offset || 0;

				var sum = 0;
				for(var i = 0; i < count; i++) {
					sum += freqByteData[i+offset];
				}
				
				return sum / freqByteData.length;
			},
			
			getLowMidHighAverageFrequency: function() {
				var freqByteData = this.getSpectrum();            
				count = freqByteData.length;
				
				var numBands = Math.floor(count / 3);
				
				var lmht = {};

				var sum = 0;
				for(var a = 0; a < 3; a++) {
					var lsum = 0;
					for(var i = 0 ; i < numBands; i++) {
						var c = freqByteData[i + a * numBands];
						sum += c;
						lsum += c;
					}
					
					if (a == 0) {
						lmht.low = lsum / numBands;
					} else if (a == 1) {
						lmht.mid = lsum / numBands;
					} else {
						lmht.high = lsum / numBands;
					}
				}
				
				lmht.total = sum / freqByteData.length;
				return lmht;
			}

		};
	return AudioHandler;
});