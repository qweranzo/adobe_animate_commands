//Guide/Unguide layer

var total_layers = an.getDocumentDOM().getTimeline().layerCount;
var selected_layer = an.getDocumentDOM().getTimeline().getSelectedLayers();
var replace_selection = true;
var selection_direction = 1;

function getNewSelectedLayerIndex () {
	var sel_layer_index = selected_layer*1;
	if(sel_layer_index<total_layers-1) {
		return sel_layer_index+selection_direction;
	} else {
		return sel_layer_index;
	}
}

an.getDocumentDOM().getTimeline().setSelectedLayers(getNewSelectedLayerIndex(), replace_selection);
