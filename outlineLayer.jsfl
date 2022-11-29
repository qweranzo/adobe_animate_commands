//Mask/Unmask layer
var current_layer_type = an.getDocumentDOM().getTimeline().getLayerProperty('layerType');
if(an.getDocumentDOM().getTimeline().getLayerProperty("outline")===false) {
	an.getDocumentDOM().getTimeline().setLayerProperty('outline', true);
} else if(an.getDocumentDOM().getTimeline().getLayerProperty("outline")===true) {
	an.getDocumentDOM().getTimeline().setLayerProperty('outline', false);;
}