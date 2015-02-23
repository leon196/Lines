/*

*/
define([
	'gui'
	, 'utils'
	, 'sound/audiohandler'
	], function (GUI, Utils, AudioHandler) {

		var canvas, context, frame, aspectRatio, tick, perlin, gui;

		var LineHandler = {

			initialize: function () {
				console.log('lines ok');
				tick = 0;
				canvas = document.getElementById("lines");
				frame = rect(window.innerWidth, window.innerHeight);
				aspectRatio = frame.width / frame.height;
				canvas.width = 128;
				canvas.height = 128;
				context = canvas.getContext("2d");
				var scaleFactor = 1;
				if ('devicePixelRatio' in window) {
					if (window.devicePixelRatio > 1) {
						scaleFactor = window.devicePixelRatio;
						if (scaleFactor > 1) {
							canvas.width = canvas.width * scaleFactor;
							canvas.height = canvas.height * scaleFactor;
						}
					}
				}
				this.beatDetector = AudioHandler.beatdetector;
				this.frequence1 = 1;
				this.frequence2 = 2.6;
				this.frequence3 = 0.6;
				this.scale1 = 0.045;
				this.scale2 = 0.07;
				this.scale3 = 0.07;
				this.speed1 = 0.104;
				this.speed2 = 0.62;
				this.speed3 = 0.062;
				this.waveHeight = canvas.height / 2;
				this.lineWidth = 1;
				this.lineCount = 20;
				this.lineSpace = 1;
				this.segmentCount = 16;
				this.gravity = 0;
				this.light = 0;
				this.color = 0;

				// gui = new dat.GUI();    
				// gui.remember(this);
				// gui.domElement.id = 'gui';
				// gui.add(this, 'frequence1');
				// gui.add(this, 'frequence2');
				// gui.add(this, 'frequence3');
				// gui.add(this, 'scale1');
				// gui.add(this, 'scale2');
				// gui.add(this, 'scale3');
				// gui.add(this, 'speed1');
				// gui.add(this, 'speed2');
				// gui.add(this, 'speed3');
				// gui.add(this, 'waveHeight');
				// gui.add(this, 'lineWidth');
				// gui.add(this, 'lineCount');
				// gui.add(this, 'lineSpace');
				// gui.add(this, 'segmentCount');
				// gui.add(this, 'gravity', 0, 1);
				// gui.add(this, 'light', 0, 1);
				// gui.add(this, 'color', 0, 1);
				// gui.close();
				this.update();

				return context;

			}

			, update: function () {
				
				var 
					self = this
					, segmentWidth = Math.floor(canvas.width / this.segmentCount)
					, x = 0
					, y = 0
					, prevX = -32
					, prevY = 0
					, middleY = canvas.height / 2
				;

				//GREG CUSTOM
				// this.frequence2 = newFreq;
				// this.frequence3 = newFreq;
				// this.scale1 = newFreq;
				// this.scale2 = newFreq;
				// this.scale3 = newFreq;
				// this.speed1 = newFreq;
				// this.speed2 = newFreq;
				// this.speed3 = newFreq;

				if(this.beatDetector.heartBeatGlobal > 100) {
					var newFreq1 = this.beatDetector.heartBeatGlobal/50;
					this.frequence1 = newFreq1;
				}
				else {
					this.frequence1 = 1;
				}
				// if(this.beatDetector.heartBeatMid > 0) {
				//     var newFreq2 = this.beatDetector.heartBeatMid/50;
				//     this.frequence3 = newFreq2;
				// }
				// if(this.beatDetector.heartBeatHigh > 0) {
				//     var newFreq3 = this.beatDetector.heartBeatHigh/50;
				//     this.frequence2 = newFreq3;
				// }
				/////////////////

				++tick;
				context.clearRect(0, 0, canvas.width, canvas.height);

				// lines
				for (var line = 0; line < this.lineCount; ++line) 
				{        
					prevX = -32;
					prevY = 0;
					// color
					var lineRatio = 1 - clamp(line / this.lineCount, 0.01, 1);

					// segments
					for (var i = 0; i <= this.segmentCount; ++i) 
					{
						// animation cool 1
			//            perlin = noise(vec3(
			//                (tick * this.speed1 + i * this.frequence1) * this.scale1, 
			//                (tick * this.speed2 + (i + line) * this.frequence2) * this.scale2, 
			//                0)); 
						// animation cool 2
			//            perlin = noise(vec3(
			//                (i * this.frequence1) * this.scale1, 
			//                (i * this.frequence1 + line * this.frequence2 + tick * this.speed2) * this.scale2, 
			//                 0)); 
						
						perlin = noise(vec3(
							(tick * this.speed1 + i * this.frequence1) * this.scale1, 
							(tick * this.speed2 + (i + line) * this.frequence2) * this.scale2, 
							(tick * this.speed3 + line * this.frequence3) * this.scale3));

						// position
						x = i * segmentWidth;
						perlin = mix(perlin, (perlin * 0.5 + 0.5), this.gravity);
						var wave = perlin * this.waveHeight * this.lineSpace;
						var ground = lineRatio * wave;
						y = mix(middleY - wave, canvas.height - ground, this.gravity);

						// color
			//            var ratio = clamp(i / this.segmentCount, 0, 0.99);
						// Color from the angle of segment
						var dotRatio = Math.abs(dot(normalize(vec2(x - prevX, y - prevY)), vec2(0, 1)));
						
						var shadeRatio = mix(1 - lineRatio, dotRatio, this.light);
						
						// start line
						context.beginPath();
						context.moveTo(prevX, prevY);
						context.strokeStyle = Color.GetRainbow(shadeRatio);
						context.lineWidth = this.lineWidth;

						// draw line
						context.lineTo(x, y);
						// render
						context.stroke();

						// save previous
						prevX = x; prevY = y;
					}
				}

				requestAnimFrame(function() {
				  self.update();  
				});

			}


			, oscillationNormalized: function (rad) {
				return Math.sin(rad) * 0.5 + 0.5;
			}
		};

	return LineHandler;
});
