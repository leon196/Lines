var canvas, context, frame, aspectRatio, tick, perlin, gui;
var prop = {};

function init() 
{
    tick = 0;
    canvas = document.getElementById("lines");
    frame = rect(window.innerWidth, window.innerHeight);
    aspectRatio = frame.width / frame.height;
    canvas.width = 128;
    canvas.height = 128;
    console.log(canvas.width, canvas.height);
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
    prop.frequence1 = 1;
    prop.frequence2 = 2.6;
    prop.frequence3 = 0.6;
    prop.scale1 = 0.045;
    prop.scale2 = 0.07;
    prop.scale3 = 0.07;
    prop.speed1 = 0.104;
    prop.speed2 = 0.62;
    prop.speed3 = 0.062;
    prop.waveHeight = canvas.height / 2;
    prop.lineWidth = 1;
    prop.lineCount = 32;
    prop.lineSpace = 1;
    prop.segmentCount = 16;
    prop.gravity = 0;
    prop.light = 0;
    prop.color = 0;

    gui = new dat.GUI();    
    gui.remember(prop);
    gui.domElement.id = 'gui';
    gui.add(prop, 'frequence1');
    gui.add(prop, 'frequence2');
    gui.add(prop, 'frequence3');
    gui.add(prop, 'scale1');
    gui.add(prop, 'scale2');
    gui.add(prop, 'scale3');
    gui.add(prop, 'speed1');
    gui.add(prop, 'speed2');
    gui.add(prop, 'speed3');
    gui.add(prop, 'waveHeight');
    gui.add(prop, 'lineWidth');
    gui.add(prop, 'lineCount');
    gui.add(prop, 'lineSpace');
    gui.add(prop, 'segmentCount');
    gui.add(prop, 'gravity', 0, 1);
    gui.add(prop, 'light', 0, 1);
    gui.add(prop, 'color', 0, 1);
    // gui.close();
}

function start() 
{
    init();
    requestAnimFrame( update );
}

function update() 
{
    ++tick;
    context.clearRect(0, 0, canvas.width, canvas.height);
    var x = 0, y = 0, prevX = -32, prevY = 0;
    var middleY = canvas.height / 2;
    var segmentWidth = Math.floor(canvas.width / prop.segmentCount);

    // lines
    for (var line = 0; line < prop.lineCount; ++line) 
    {        
        prevX = -32;
        prevY = 0;
        // color
        var lineRatio = 1 - clamp(line / prop.lineCount, 0.01, 1);

        // segments
        for (var i = 0; i <= prop.segmentCount; ++i) 
        {
            // animation cool 1
//            perlin = noise(vec3(
//                (tick * prop.speed1 + i * prop.frequence1) * prop.scale1, 
//                (tick * prop.speed2 + (i + line) * prop.frequence2) * prop.scale2, 
//                0)); 
            // animation cool 2
//            perlin = noise(vec3(
//                (i * prop.frequence1) * prop.scale1, 
//                (i * prop.frequence1 + line * prop.frequence2 + tick * prop.speed2) * prop.scale2, 
//                 0)); 
            
            perlin = noise(vec3(
                (tick * prop.speed1 + i * prop.frequence1) * prop.scale1, 
                (tick * prop.speed2 + (i + line) * prop.frequence2) * prop.scale2, 
                (tick * prop.speed3 + line * prop.frequence3) * prop.scale3));

            // position
            x = i * segmentWidth;
            perlin = mix(perlin, (perlin * 0.5 + 0.5), prop.gravity);
            var wave = perlin * prop.waveHeight * prop.lineSpace;
            var ground = lineRatio * wave;
            y = mix(middleY - wave, canvas.height - ground, prop.gravity);

            // color
//            var ratio = clamp(i / prop.segmentCount, 0, 0.99);
            // Color from the angle of segment
            var dotRatio = Math.abs(dot(normalize(vec2(x - prevX, y - prevY)), vec2(0, 1)));
            
            var shadeRatio = mix(1 - lineRatio, dotRatio, prop.light);
            
            // start line
            context.beginPath();
            context.moveTo(prevX, prevY);
            context.strokeStyle = Color.GetRainbow(shadeRatio);
            context.lineWidth = prop.lineWidth;

            // draw line
            context.lineTo(x, y);
            // render
            context.stroke();

            // save previous
            prevX = x; prevY = y;
        }

    }
    requestAnimFrame( update );
}
function oscillationNormalized(rad)
{
    return Math.sin(rad) * 0.5 + 0.5;
}
    // Oho
//    ctx.save();
//    ctx.rotate(Math.PI);
//    drawSomething();
//    ctx.restore();