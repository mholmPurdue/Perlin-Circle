var nodes = 120;
var prevLines = 5;
var oldLines = new Array(prevLines);
var fps = 60;
var distance = 150;
var amplitude = 20;
var variation = 2;
var magicNumbers = Math.PI * 2
var timeScale = .0003;
var afterImages = true;
var react = true;
var frameNum = 0;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();
var meter;
var time = 0;
var line;
var notFirst = false;
var notSecond = false;

var lPx = [];
var lPy = [];

populateLookupTable();

setInterval(logFPS,1000);

window.onload = function() {
	if(react){
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		audioContext = new AudioContext();
		try {
		navigator.getUserMedia =
	        	navigator.getUserMedia ||
	        	//navigator.webkitGetUserMedia ||
	        	navigator.mozGetUserMedia;
		navigator.getUserMedia(
		         {
		            "audio": {
		                "mandatory": {
		                    "googEchoCancellation": "false",
		                    "googAutoGainControl": "false",
		                    "googNoiseSuppression": "false",
		                    "googHighpassFilter": "false"
		                },
		                "optional": []
		            },
		        }, function(stream) {
		         	mediaStreamSource = audioContext.createMediaStreamSource(stream);

				    meter = createAudioMeter(audioContext);
				    mediaStreamSource.connect(meter);
	    			console.log(meter.volume);
	    			setInterval(renderPath, 1000/fps);
		         },function(err){
		         	react = false;
					renderPath();
		         });
		} catch(e){
			react = false;
			renderPath();
		}
	}else{
		renderPath();
	}
}

function logFPS(){
	console.log(frameNum);
	frameNum = 0;
}

function point(dist, num){
	// this.x = Math.cos(num * (magicNumbers / nodes)) * dist + distance * 2;
	// this.y = Math.sin(num * (magicNumbers / nodes)) * dist + distance * 2;
	this.x = lPx[num] * dist + distance * 2;
	this.y = lPy[num] * dist + distance * 2;

}

function populateLookupTable(){
	for(var i = 0; i < nodes; i++){
		lPx.push(Math.cos(i * magicNumbers/nodes));
		lPy.push(Math.sin(i * magicNumbers/nodes));
	}
}

function populate() {
	line = [];
	for(var i = 0; i < nodes; i++){
		// line.push(new point(noise.perlin3(Math.cos(i * magicNumbers/nodes) * variation,
		// 									Math.sin(i * magicNumbers/nodes) * variation,
		// 									time+=timeScale)
		// 								 * amplitude + distance, i));
		line.push(new point(noise.perlin3(lPx[i] * variation,
										  lPy[i] * variation,
											time+=timeScale)
										 * amplitude + distance, i));
	}
}

function renderPath(){
	populate();
	frameNum++;
	var c=document.getElementById("canvass");
	var ctx=c.getContext("2d");
	ctx.moveTo(line[0].x, line[0].y);
	ctx.clearRect(0, 0, c.width, c.height);
	if(react){
		variation = meter.volume * 30 + 2;
		amplitude = meter.volume * 150 + 20;
	}
	if(afterImages){
		ctx.beginPath();
		ctx.strokeStyle = '#999';
		ctx.lineWidth = 1;
		if(notSecond){
			for(var j = 0; j < nodes; j++){
				ctx.lineTo(oldestLines[j].x, oldestLines[j].y);
			}
		} else {

		}
		ctx.closePath();
		ctx.stroke();


		oldestLines = oldLines;
		//draw old paths
		ctx.beginPath();
		ctx.strokeStyle = '#555';
		ctx.lineWidth = 1;
		if(notFirst){
			for(var j = 0; j < nodes; j++){
				ctx.lineTo(oldLines[j].x, oldLines[j].y);

			}
		}
		ctx.closePath();
		ctx.stroke();

		oldLines = line;
		if(notFirst){
			notSecond = true;
		}
		notFirst = true;
	}
	ctx.beginPath();
	ctx.strokeStyle = '#FFF';
	ctx.lineWidth = 1;
	for(var i = 0; i < nodes; i++){
		ctx.lineTo(line[i].x, line[i].y);
	}
	ctx.lineTo(line[0].x, line[0].y);
	ctx.closePath();
	ctx.stroke();
	if(!react)
		requestAnimationFrame(renderPath);
}