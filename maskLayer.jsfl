//Mask/Unmask layer
var current_layer_type = an.getDocumentDOM().getTimeline().getLayerProperty('layerType');
if(current_layer_type === "normal") {
	an.getDocumentDOM().getTimeline().setLayerProperty('layerType', 'mask');
} else if(current_layer_type === "mask") {
	an.getDocumentDOM().getTimeline().setLayerProperty('layerType', 'normal');
}