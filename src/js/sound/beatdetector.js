/*

*/
define([
	'sound/audiohandler'
	], function (AudioHandler) {
		var 
			LOW = 0
			, MID = 1
			, HIGH = 2
			, GLOBAL = 3
			, audiohandler = AudioHandler
		;

		var amplitudes = [];

		amplitudes.push(new Array());
		amplitudes.push(new Array());
		amplitudes.push(new Array());
		amplitudes.push(new Array());
		
		var BeatDetector = function (lowThreshold, midThreshold, highThreshold, globalThreshold, maxAmplitudesDomain) {
			this.lowThreshold = lowThreshold || 0.1;
			this.midThreshold = midThreshold || 0.7;
			this.highThreshold = highThreshold || 1.3;
			this.globalThreshold = globalThreshold || 1.1;

			this.maxAmplitudesDomain = maxAmplitudesDomain || 60;
			this.initializeEvents();
		}
		
		BeatDetector.prototype.initializeEvents = function () {
			this.globalDetected = function (global) {
				this.heartBeatGlobal = global;
			}

			this.lowDetected = function (low) {
				this.heartBeatLow = low;
			}

			this.midDetected = function (mid) {
				this.heartBeatMid = mid;
			}

			this.highDetected = function (high) {
				this.heartBeatHigh = high;
			}
		}

		BeatDetector.prototype.sampleAudioStream = function(audiohandler) {
			var streamData = audiohandler.getSpectrum();
			// calculate an overall volume value
			var total = 0;
			for (var i = 0; i < 80; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
				total += streamData[i];
			}
			this.volume = total;
    	}

		BeatDetector.prototype.computeBeatChanges = function (audiohandler) {
		var lmht = audiohandler.getLowMidHighAverageFrequency();
		amplitudes[LOW].push(lmht.low);
		amplitudes[MID].push(lmht.mid);
		amplitudes[HIGH].push(lmht.high);
		amplitudes[GLOBAL].push(lmht.total);

		for (var a = 0; a < amplitudes.length; a++) {
			if (amplitudes[a].length > this.maxAmplitudesDomain) {
				var sum = 0;

				for (var i = 0; i < amplitudes[a].length; i++) {
					sum += amplitudes[a][i];
				}

				var avg = sum / amplitudes[a].length;
				if (a == LOW && lmht.low > (avg * this.lowThreshold)) {
					if (this.lowDetected) { this.lowDetected(lmht.low); }
				} else if (a == LOW) {
					if (this.lowDetected) { this.lowDetected(0); }
				}

				if (a == MID && lmht.mid > (avg * this.midThreshold)) {
					if (this.midDetected) { this.midDetected(lmht.mid); }
				} else if (a == MID) {
					if (this.midDetected) { this.midDetected(0); }
				}

				if (a == HIGH && lmht.high > (avg * this.highThreshold)) {
					if (this.highDetected) { this.highDetected(lmht.high); }
				} else if (a == HIGH) {
					if (this.highDetected) { this.highDetected(0); }
				}

				if (a == GLOBAL && lmht.total > (avg * this.globalThreshold)) {
					if (this.globalDetected) { this.globalDetected(lmht.low); }
				} else if (a == GLOBAL) {
					if (this.globalDetected) { this.globalDetected(0); }
				}
				amplitudes[a].splice(0, 1);
			}
		}

		return lmht;
	}

	return BeatDetector;
});