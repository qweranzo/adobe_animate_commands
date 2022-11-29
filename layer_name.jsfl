// rename layer
var old_name = an.getDocumentDOM().getTimeline().getLayerProperty('name');
var new_name = prompt("input layer name", old_name);
an.getDocumentDOM().getTimeline().setLayerProperty('name', new_name || old_name);