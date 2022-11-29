//Guide/Unguide layer

var total_layers = an.getDocumentDOM().getTimeline().getSelectedLayers().length;
var selected_layer = an.getDocumentDOM().getTimeline().getSelectedLayers();
var replace_selection = true;
var selection_direction = -1;

function getNewSelectedLayerIndex () {
	var sel_layer_index = selected_layer*1;
	if(sel_layer_index>0) {
		return sel_layer_index+selection_direction;
	} else {
		return sel_layer_index;
	}
}

an.getDocumentDOM().getTimeline().setSelectedLayers(getNewSelectedLayerIndex(), replace_selection);