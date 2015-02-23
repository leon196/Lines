/*

*/
define([
	'jquery'
	, 'gui'
	, 'utils'
	, 'sound/audiohandler'
	, 'pixi'
	], function ($, GUI, Utils, AudioHandler, PIXI) {

		function random(min, max) {
			return Math.floor((Math.random() * max) + min);
		}

		function randomColor() {
			return '#'+(function lol(m,s,c){return s[m.floor(m.random() * s.length)] +
	  		(c && lol(m,s,c-1));})(Math,'0123456789ABCDEF',4);
		}

		var 
			lasers = []
			, type = 0
		;

		var CircleHandler = {
			
			initialize: function () {
				this.viewWidth = $(window).width();
				this.viewHeight = $(window).height();
				this.beatDetector = AudioHandler.beatdetector;
				this.renderer = new PIXI.CanvasRenderer(this.viewWidth, this.viewHeight);
				this.renderer.view.className = "rendererView";
				document.body.appendChild(this.renderer.view);
				this.stage = new PIXI.Stage(0x000000);
				this.animate();

			}
			, animate: function () {
				var self = this;
				if (this.beatDetector.volume > 13000) {

					var laser = new PIXI.Sprite.fromImage("img/lasers/laser0"+( (type%5)+1 )+".png");
					type++;
					laser.life = 0;

					if(type % 2)
					{

						var pos1 = new PIXI.Point(-20, Math.random() * this.viewHeight);
						var pos2 = new PIXI.Point(this.viewWidth, Math.random() * this.viewHeight + 20);

					}
					else
					{
						var pos1 = new PIXI.Point(Math.random() * this.viewWidth, -20);
						var pos2 = new PIXI.Point(Math.random() * this.viewWidth, this.viewHeight + 20);
					}

					var distX = pos1.x - pos2.x;
					var distY = pos1.y - pos2.y;

					var dist = Math.sqrt(distX * distX + distY * distY) + 40;
					laser.scale.x = dist /20; 
					laser.anchor.y = 0.5;
					laser.position.x = pos1.x;//viewWidth/2;
					laser.position.y = pos1.y;//this.viewHeight/2;
					laser.blendMode = PIXI.blendModes.ADD;

					laser.rotation = Math.atan2(distY, distX) + Math.PI

					lasers.push(laser);
					
					this.stage.addChild(laser);
					
				}

				for (var i = 0; i < lasers.length; i++) 
				{
					var laser = lasers[i];
					laser.life++;
					if(laser.life > 60 * 0.3)
					{
						laser.alpha *= 0.9;
						laser.scale.y = laser.alpha;
						if(laser.alpha < 0.01)
						{
							lasers.splice(i, 1);
							this.stage.removeChild(laser);	
							i--;
						}
					}
				}
				this.renderer.render(this.stage);

				requestAnimFrame(function() {
					self.animate();  
				});
			}
		};

	return CircleHandler;
});
