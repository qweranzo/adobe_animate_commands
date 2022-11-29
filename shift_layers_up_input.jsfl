var timeline = document.getTimeline();
var timelines = fl.getDocumentDOM().timelines;
var sel_layers = timeline.getSelectedLayers();
var sel_layersRev = timeline.getSelectedLayers().reverse();
var sel_layersRand = [];
var playheadPos = timeline.currentFrame;

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
	return array;
}




var randOffset = 0; //offset int random | GUI


function shiftFrames(dir) {
	
	var playheadPosB = playheadPos;
	
	sel_layersRand = shuffleArray(timeline.getSelectedLayers());
	if (dir=="up" || dir=="down" || dir=="rand") {

		for (var i=0; i<sel_layers.length+1; i++) {
			var rnd = Math.round(Math.random()*randOffset+1);
			
			timeline.insertFrames(i*numOfFrames*rnd-numOfFrames, false, playheadPos);
			if (i<sel_layers.length) {
				if (dir=="down") {
					timeline.setSelectedLayers(sel_layers[i], false);
				} else if (dir=="up") {
					timeline.setSelectedLayers(sel_layersRev[i], false);
				} else if (dir=="rand") {
					//alert(sel_layersRand);
					timeline.setSelectedLayers(sel_layersRand[i], true);
				} 
			}
		}
	} else {
		alert("undefined direction");
	}
	
	timeline.insertFrames(0, false, playheadPosB);
	timeline.currentFrame = playheadPosB;
	
	if (dir=="up") {
	
		for (var k=0; k<sel_layers.length; k++) {
		timeline.setSelectedLayers(sel_layers[k], false);
		if (k==(sel_layers.length-1)) {
			//alert("if");
			timeline.setSelectedLayers(sel_layers[0], false)
			timeline.setSelectedLayers(sel_layers[0], false)
		}
	} 
	
	} else if (dir=="down") {
		for (var l=0; l<sel_layers.length; l++) {
			timeline.setSelectedLayers(sel_layers[l], false);
			if (l==(sel_layers.length-1)) {
				//alert("if");
				timeline.setSelectedLayers(sel_layers[sel_layers.length-1], false)
				timeline.setSelectedLayers(sel_layers[sel_layers.length-1], false)
			}
		} 
	}
}
	

if(timeline.getSelectedLayers().length<=1){
	alert("Please select at least 2 layers");
} else {
	var numOfFrames = prompt("Number of frames to shift in Upstairs:  ");
	numOfFrames = parseInt(numOfFrames);
	if (isNaN(numOfFrames)) {
		alert("Type an integer number ");
	} else {
		shiftFrames("up");
	}
}















