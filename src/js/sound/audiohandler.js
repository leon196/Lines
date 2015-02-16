/*

*/
define([
	'jquery'
	, 'sound/beatdetector'
	], function ($, BeatDetector) {

		var AudioHandler = {

			soundBuffer: null
			, noiseBuffer: null
			, convolver: null
			, startOffset: 0
			, startTime: 0
			, context: null
			, isLoaded: false
			, bufferSize: 4096

			, initialize: function (url, callback) {
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

				this.loadSound(url);
				this.filterLowPass = this.context.createBiquadFilter();
				this.filterLowPass.type = this.filterLowPass.LOWPASS;
				this.filterLowPass.frequency.value = 100;
				this.analyser = this.context.createAnalyser();
				this.beatdetector = new BeatDetector(this);

				this.initializeEvents();

				return this;
			}

			, getContext: function () {
				return this.context;
			}

			, initializeEvents: function () {
				this.beatdetector.globalDetected = function (global) {
					this.heartBeatGlobal = global;
				}

				this.beatdetector.lowDetected = function (low) {
					this.heartBeatLow = low;
				}

				this.beatdetector.midDetected = function (mid) {
					this.heartBeatMid = mid;
				}

				this.beatdetector.highDetected = function (high) {
					this.heartBeatHigh = high;
				}
			}


			//Load our Sound using XHR
			, loadSound: function (url) {
				var 
					self = this
					, request = new XMLHttpRequest()
				;
				// console.log('audio loading with url: ' + url);
				request.open("GET", url, true);
				request.responseType = "arraybuffer";
				request.onload = function() {
					self.context.decodeAudioData(request.response, function(buffer) {
						self.isLoaded = true;
						self.soundBuffer = buffer;
						self.callback && self.callback();
					}, self.onError);
				};

				request.send();
			}

			, onError: function(e) {
				console.log("Error with decoding audio data" + e.err);
			}

			, update: function () {
				var self = this;
				this.beatdetector.computeBeatChanges();
				this.updateBeat();
				requestAnimFrame(function() {self.update()});
			}

			, updateBeat: function () {
				var light = $('#beat');
				// var text = $('#text');
				// text.html("LOW :"+parseInt(this.beatdetector.heartBeatLow)+"\nMID :"+parseInt(this.beatdetector.heartBeatMid)+"\nHIGH :"+parseInt(this.beatdetector.heartBeatHigh));
				if (this.beatdetector.heartBeatLow > 100) {
					light.css({background:'red'});
				}
				// else if (this.beatdetector.heartBeatMid > 0){
				// 	light.css({background:'blue'});
				// }
				// else if (this.beatdetector.heartBeatHigh > 0){
				// 	light.css({background:'green'});
				// }
				else {
					light.css({background:'black'});
				}
			}

			, updateFilter: function (value) {

				if(this.source) {
					this.source.disconnect();
					if (value < 100) {
						this.source.connect(this.context.destination);
					}
					else if (value == 100) {
						this.source.connect(this.filterLowPass);
						this.filterLowPass.connect(this.context.destination);
					}
				}
			}

			, play: function () {
				var self = this;
				this.startTime = this.context.currentTime;
				this.source = this.context.createBufferSource();
				this.source.buffer = this.soundBuffer;
				this.source.loop = true;
				this.source.connect(this.context.destination);
				this.source.start(0, this.startOffset % this.source.buffer.duration);
				this.analyseData();
				this.update();

			}

			, pause: function() {
				var self = this;
				this.source.stop();
				startOffset += this.context.currentTime - startTime;
				console.log('audio pause');
			}

			, getSpectrum: function() {
	            var freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
	            this.analyser.getByteFrequencyData(freqByteData);
	            return freqByteData;
	        },
	        
	        getDominantFrequency: function() {
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

			, analyseData: function () {
				this.source.connect(this.analyser);
				this.analyser.connect(this.context.destination);
				this.analyser.smoothingTimeConstant = 0.85;
			} 
		};
	return AudioHandler;
});