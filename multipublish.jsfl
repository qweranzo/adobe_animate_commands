//SETS PUBLISH PROFILES FOR ALL OPENED DOCUMENTS

var profiles_folder_path, folderContents, publish_profiles_arr, publish_profiles_obj;


profiles_folder_path = fl.configURI+"Publish Profiles/" // flash path to profiles folder
folderContents = FLfile.listFolder(profiles_folder_path).toString();

publish_profiles_arr = folderContents.split(","); // array of profiles names with extensions (AdFox.apr, AdRiver.apr, Default.xml etc)

//leave only lowercase names without extension
function getCleanProfileNames (arr) {
	for (var i=0; i<arr.length; i++) {
		arr[i] = arr[i].replace(".apr", "").replace(".xml", "");
	}
}

getCleanProfileNames(publish_profiles_arr);


publish_profiles_obj = {};

function profilesObject (obj_fill_to, names_array, value_URI) {
	for(name in names_array) {
		if(names_array[name]!="default") {
			obj_fill_to[names_array[name].toLowerCase()]=value_URI+names_array[name]+".apr"
		} else {
			obj_fill_to[names_array[name].toLowerCase()]=value_URI+names_array[name]+".xml"
		}
	}
}

profilesObject(publish_profiles_obj, publish_profiles_arr, profiles_folder_path);



function getObjLength (obj) {
	var obj_len=0;
	for (key in obj) {
		obj_len++
	}
	return obj_len;
}


function selectPublishProfile (profile_name) {
	profile_name = profile_name.toLowerCase();
	
	if(profile_name==="help") {
		showHelp();
	} else if (profile_name.length>0){
		
		var opened_docs = fl.documents;
		for (doc in opened_docs) {
			opened_docs[doc].importPublishProfile(publish_profiles_obj[profile_name]);
		}
		
		publish();
		
	} else {
		alert("wrong profile name");
	}
	
}


function showAvailableProfiles () {
	fl.outputPanel.clear();
	fl.trace("AVAILABLE PROFILES: \n");
	for (var key in publish_profiles_obj) {
		fl.trace(key);
	}
}

function showHelp () {	
	fl.outputPanel.clear();
	
	fl.trace("SHOW HIDDEN FOLDERS/FILES:\n\nMacOS - Cmd+Shift+."+"\nWindows - https://helpx.adobe.com/x-productkb/global/show-hidden-files-folders-extensions.html")
	
	fl.trace("\n\n\nPROFILES INSTALLATION FOLDER: "+
	"\n\nMacOS - /Users/<username>/Library/Application\\ Support/Adobe/Animate\\ CC\\ <version>/<language>/Configuration/Publish\\ Profiles"+
	"\nWindows - C:\\Users\\<username>\\AppData\\Local\\Adobe\\Animate CC <version>\\<language>\\Configuration\\Publish Profiles");
}

var opened_docs_arr = fl.documents;
function publish () {
	fl.outputPanel.clear();
	if(confirm("Publish now?")===true) {
		getOpenDocsPaths ();
	} 
}


var opened_docs_paths = [];
function getOpenDocsPaths () {
	for(qwe in opened_docs_arr) {
		var originalDocID = opened_docs_arr[qwe].id;
		var targetDoc = fl.findDocumentDOM(originalDocID);
		opened_docs_paths.push(targetDoc.pathURI);
		saveAllDocs(targetDoc);
	}
	openPublishCloseSingleDoc(opened_docs_paths)
}

function saveAllDocs (doc) {
	fl.saveDocument(doc);
}

function openPublishCloseSingleDoc(docs_URI) {
	for(path in docs_URI) {
		fl.openDocument(docs_URI[path]);
		fl.trace(fl.getDocumentDOM().name);
		fl.getDocumentDOM().publish();
	}
	
}

showAvailableProfiles();
selectPublishProfile(prompt("Input profile name \nor 'help' to get installation help"));

