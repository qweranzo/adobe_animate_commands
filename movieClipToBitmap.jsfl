// String "includes()" polyfill


if (!String.prototype.includes) {
	String.prototype.includes = function(search, start) {
		'use strict';
		if (typeof start !== 'number') {
			start = 0;
		}
		if (start + search.length > this.length) {
			return false;
		} else {
			return this.indexOf(search, start) !== -1;
		}
	};
}
  
  
  // String "startsWith()" polyfill
  
if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(searchString, position) {
		position = position || 0;
		return this.indexOf(searchString, position) === position;
	};
}
  

var doc = fl.getDocumentDOM();
var filePathURI = doc.pathURI;
var dirPathURI = filePathURI.replace(doc.name, "");


fl.outputPanel.clear();


function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

var UI_props = {
	status: undefined,
	name: undefined,
	scale: undefined,
	extension: undefined,
	undo: undefined
}

var cfg_xmlFile_name = 'MovieClipToBitmap_menu.xml';
var cfg_xmlFile = fl.configURI+'Commands/'+cfg_xmlFile_name;

// XUL UI
function getUIProps () {

	if(!FLfile.exists(cfg_xmlFile)) {
		if(confirm(cfg_xmlFile_name+" hasn't been found, create it?")) {
			//var doc_text = '<dialog title=\"Movie clips to bitmaps\" buttons=\"accept, cancel\">\n\t<vbox>\n\t\t<label value=\"Instance name of movie clip\" />\n        <textbox id=\"mc_name\" value=\"to_bitmap\"/>\n        <separator/> \n        <label value=\"Upscale factor\"/>\n        <textbox id=\"scale\" value=\"1.5\" size=\"3\"/>\n        <separator/> \n        <label value=\"UNDO?\"/>\n        <checkbox id=\"undo\" checked=\"false\"/>\n        <separator/> \n\t</vbox>\n</dialog>'
			var doc_text = '<dialog title=\"Movie clips to bitmaps\" buttons=\"accept, cancel\">\n\t<vbox>\n\t\t<label value=\"Instance name of movie clip\" />\n        <textbox id=\"mc_name\" value=\"to_bitmap\"/>\n        <separator/> \n        <label value=\"Upscale factor\"/>\n        <textbox id=\"scale\" value=\"1.5\" size=\"3\"/>\n        <separator/>\n        <label value=\"extension\"/>\n        <radiogroup id=\"extension\">\n            <radio id=\"png\" label=\"png\"/>\n            <radio id=\"jpg\" selected=\"true\" label=\"jpg\"/>\n        </radiogroup>\n        <separator/>\n        <label value=\"UNDO?\"/>\n        <checkbox id=\"undo\" checked=\"false\"/>\n        <separator/> \n\t</vbox>\n</dialog>';
			if(FLfile.write(cfg_xmlFile, doc_text)) {
				alert("file has been successfully created, run script again"); 
			} else {
				alert("Can't create file");
			}
		}
		
	} else {
		
		var xml_doc = doc.xmlPanel(cfg_xmlFile);
	
		UI_props.name = xml_doc["mc_name"];
		if(UI_props.name.length===0) {
			alert("Empty name string");
			return;
		}
		
		UI_props.scale = clamp(xml_doc["scale"]*1, 1, 3);
		if(xml_doc["scale"].length===0) {
			alert("Empty scale string");
			return;
		} else if (isNaN(UI_props.scale)) {
			alert("Scale property is not a number");
			return;
		}
		
		UI_props.extension = xml_doc["extension"];
		
		UI_props.undo = xml_doc["undo"];
		if(UI_props.undo == "false") {
			UI_props.undo = false;
		} else {
			UI_props.undo = true;
		}
		
		UI_props.status = xml_doc["dismiss"];
		
		return UI_props;
		
	}
}




if(getUIProps()) {
	if(UI_props.status == "accept") {
		
		if(UI_props.undo) {
			MCs_TO_PICS(true);
		} else {
			MCs_TO_PICS(false);
		}
		
	} else {
		// CANCEL
		//fl.trace(UI_props.extension);
	}	
}


	
function MCs_TO_PICS (_undo) {

	//temporary folder location for images exported as jpeg's
	var tmp_bitmap_dir = dirPathURI+"~tmp_/";

	var search_name = UI_props.name;

	var generated_bitmaps_lib_folder = "_generated_images";
	
	var elems_arr = [];
	
	var upscale_factor = UI_props.scale;
	
	var image_extension = "."+UI_props.extension;
	
	//fl.trace(image_extension);
	
	
	var MC_pos_arr_deltaX = [];
	var MC_pos_arr_deltaY = [];

	// make array with only unique and correct* elements 
	// *if library item we're looking for usage count more than 1 it returns incorrect element object 

	function getArrayOfMCsWithInstanceName (_name) {
		var all_found_elems_arr = fl.findObjectInDocByName(_name, doc);
		var elems_names = [];
		for (var i=0; i<all_found_elems_arr.length; i++) {
			
			// try catch to avoid error that stops script
			try {
				
				// sort by properties exist (wrong elems doesn't have props)
				if(all_found_elems_arr[i].obj) {
					
					// push only if element doesn't exist in array
					// 'elems_names' array kinda KOSTIL' :) but it's ok
					all_found_elems_arr.forEach(function (elem, id){
						if(elems_names.indexOf(all_found_elems_arr[i].obj.libraryItem.name)===-1) {
							elems_names.push(all_found_elems_arr[i].obj.libraryItem.name);
							elems_arr.push(all_found_elems_arr[i]);
						}
					})
					
				}
			} catch (err) {};
		}
		return elems_arr;
	}
	
	getArrayOfMCsWithInstanceName(search_name);


	// move new created bitmaps to 'generated_images' folder
	function moveToGeneratedImagesFolder () {		doc.library.newFolder(generated_bitmaps_lib_folder);
		doc.library.items.forEach(function (item, id){
			if ((item.name.startsWith("Bitmap") || item.name.startsWith("Растровое изображение")) && item.itemType == "bitmap") {
				doc.library.moveToFolder(generated_bitmaps_lib_folder, item.name);
			}
		})
	}

	// remove unused items from _generated_images folder
	function removeUnused () {
		doc.library.unusedItems.forEach(function (item){
			if(generated_bitmaps_lib_folder+"/") {
				doc.library.deleteItem(item.name);
			}
		})
	}
	
	
	
	if(!_undo) {

		function duplicateHighResMCLayers () {

			for (var i=0; i<elems_arr.length; i++) {
				
				var elem = elems_arr[i];

				var child_tl = elem.obj.libraryItem.timeline;
				
				var new_bitmap_layer_name = "_______bitmap_image";
				
				if(child_tl.layers.length<2 || child_tl.layers[0].name==new_bitmap_layer_name) {
					
					fl.selectElement(elem, true);
					if(child_tl.layers[0].name == new_bitmap_layer_name) {
						child_tl.deleteLayer(0);
					}
					
					processing_layer_name = child_tl.layers[0].name;
					child_tl.layers[0].locked = true;
					child_tl.layers[0].visible = false;
					child_tl.layers[0].layerType = "guide";
					child_tl.duplicateLayers();
					child_tl.layers[0].locked = false;
					child_tl.layers[0].visible = true;
					child_tl.layers[0].layerType = "normal";
					child_tl.layers[0].name = new_bitmap_layer_name;
					
					doc.selectAll();
					
					
					// upscale 
					var before_align_x = doc.selection[0].x;
					var before_align_y = doc.selection[0].y;
				
					doc.align("left", true);
					doc.align("top", true);
				
					var after_align_x = doc.selection[0].x;
					var after_align_y = doc.selection[0].y;
					
					MC_pos_arr_deltaX.push(after_align_x - before_align_x);
					MC_pos_arr_deltaY.push(after_align_y - before_align_y);
					
					doc.selection[0].x += MC_pos_arr_deltaX[i];
					doc.selection[0].y += MC_pos_arr_deltaY[i];
					
					doc.selection[0].scaleX *= upscale_factor;
					doc.selection[0].scaleY *= upscale_factor;
					
					doc.convertSelectionToBitmap();
					
				} else {
					fl.trace("ONLY 1 LAYER SHOULD BE INSIDE MOVIECLIP: "+elem.obj.name);
				}
			}
			
			removeUnused();

		}

		duplicateHighResMCLayers();
		moveToGeneratedImagesFolder();
		
		if(image_extension == ".jpg") {

		
			var bitmaps_names_arr = [];
			function exportBitmapsAsJpegsToFS () {
				
				FLfile.createFolder(tmp_bitmap_dir);
				
				doc.library.items.forEach(function (item, id){
					
					if(item.name.startsWith("_generated_images/")) {						
						var item_to_export = doc.library.findItemIndex(item.name);
						var path = tmp_bitmap_dir + item.name + image_extension;
						var libItem = doc.library.items[item_to_export];
						
						libItem.exportToFile(path, 100);
						
						bitmaps_names_arr.push(libItem.name);
					}
				})
			}

			exportBitmapsAsJpegsToFS();

			function importExportedJpegs () {
				bitmaps_names_arr.forEach(function (image_name){
					doc.importFile(tmp_bitmap_dir+image_name+image_extension, true, false, false);
				});
			}

			importExportedJpegs();
			moveToGeneratedImagesFolder();
			
			function swapBitmapsToJpegBitmaps () {
				for (var i=0; i<elems_arr.length; i++) {

					fl.selectElement(elems_arr[i], true);
					doc.selectAll();
					
					doc.swapElement(doc.selection[0].libraryItem.name+image_extension);
					
					doc.selection[0].scaleX *= 1/upscale_factor;
					doc.selection[0].scaleY *= 1/upscale_factor;
					
					doc.align("left", true);
					doc.align("top", true);
					
					doc.selection[0].x -= MC_pos_arr_deltaX[i];
					doc.selection[0].y -= MC_pos_arr_deltaY[i];
					
					
					if(doc.selection[0].width <= 1 || doc.selection[0].height <= 1) {
						alert('Unable to create bitmap in ' + '"' + elems_arr[i].timeline.name + '"' + ' make sure the mask covers image');
						doc.library.deleteItem(doc.selection[0].libraryItem.name);
					}
					
				}
				
				//FLfile.remove(tmp_bitmap_dir);
			}
			
			swapBitmapsToJpegBitmaps();
			
		} else {
			// if png
			for (var i=0; i<elems_arr.length; i++) {
				fl.selectElement(elems_arr[i], true);
				doc.selectAll();
				
				doc.selection[0].scaleX = 1/upscale_factor;
				doc.selection[0].scaleY = 1/upscale_factor;
				
				doc.align("left", true);
				doc.align("top", true);
				
				doc.selection[0].x -= MC_pos_arr_deltaX[i];
				doc.selection[0].y -= MC_pos_arr_deltaY[i];
				
				if(doc.selection[0].width <= 1 || doc.selection[0].height <= 1) {
					alert('Unable to create bitmap in ' + '"' + elems_arr[i].timeline.name + '"' + ' make sure the mask covers image');
					doc.library.deleteItem(doc.selection[0].libraryItem.name);
				}
			}
		}
		
		removeUnused();
		
	} else {
		// remove duplicated layer. unguide, unlock, make visible orig layer

		function unduplicateLayers () {

			for (var i=0; i<elems_arr.length; i++) {
				var elem = elems_arr[i];

				var child_tl = elem.obj.libraryItem.timeline;
				
				var new_bitmap_layer_name = "_______bitmap_image";
				
				if(child_tl.layers[0].name == new_bitmap_layer_name) {
				
					fl.selectElement(elem, true);
					
					child_tl.layers[1].locked = false;
					child_tl.layers[1].visible = true;
					child_tl.layers[1].layerType = "normal";
					child_tl.deleteLayer(0);
					
				} else {
					fl.trace("bitmap layer is already deleted");
				}
					
			}
			
			removeUnused();
			
		}
		
		unduplicateLayers();

	}
	
	// refresh viewport
	doc.zoomFactor = 2;
	doc.zoomFactor = 1;
		
}











