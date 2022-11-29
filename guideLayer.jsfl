//Guide/Unguide layer
var current_layer_type = an.getDocumentDOM().getTimeline().getLayerProperty('layerType');
if(current_layer_type === "normal") {
	an.getDocumentDOM().getTimeline().setLayerProperty('layerType', 'guide');
} else if(current_layer_type === "guide") {
	an.getDocumentDOM().getTimeline().setLayerProperty('layerType', 'normal');
}