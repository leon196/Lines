define([
	'jquery'
	, 'sound/audiohandler'
	], function ($, AudioHandler) {

		var Visualizer = {

			width: $(window).width()
			, height: $(window).height()

			// Interesting parameters to tweak!
			, SMOOTHING: 0.8
			, FFT_SIZE: 2048

			, initialize: function () {
				this.analyser = AudioHandler.analyser;
				this.context = AudioHandler.getContext();
				this.analyser.minDecibels = -140;
				this.analyser.maxDecibels = 0;

				this.freqs = new Uint8Array(this.analyser.frequencyBinCount);
				this.times = new Uint8Array(this.analyser.frequencyBinCount);
				this.draw();
			}

			, draw: function() {
				var self = this;	
				this.analyser.smoothingTimeConstant = this.SMOOTHING;
				this.analyser.fftSize = this.FFT_SIZE;

				// Get the frequency data from the currently playing music
				this.analyser.getByteFrequencyData(this.freqs);
				this.analyser.getByteTimeDomainData(this.times);

				var width = Math.floor(1/this.freqs.length, 10);

				var canvas = document.getElementById("lines");
				var drawContext = canvas.getContext("2d");
				canvas.width = this.width;
				canvas.height = this.height;
				// Draw the frequency domain chart.
				for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
					var value = this.freqs[i];
					var percent = value / 256;
					var height = this.height * percent;
					var offset = this.height - height - 1;
					var barWidth = this.width/this.analyser.frequencyBinCount;
					var hue = i/this.analyser.frequencyBinCount * 360;
					drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
					drawContext.fillRect(i * barWidth, offset, barWidth, height);
				}

				// Draw the time domain chart.
				for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
					var value = this.times[i];
					var percent = value / 256;
					var height = this.height * percent;
					var offset = this.height - height - 1;
					var barWidth = this.width/this.analyser.frequencyBinCount;
					drawContext.fillStyle = 'white';
					drawContext.fillRect(i * barWidth, offset, 1, 2);
				}

				requestAnimFrame(function() {
					self.draw();  
				});
			}

			, getFrequencyValue: function(freq) {
				var nyquist = this.context.sampleRate/2;
				var index = Math.round(freq/nyquist * this.freqs.length);
				return this.freqs[index];
			}
		};
	return Visualizer;
});
