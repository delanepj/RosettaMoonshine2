/*************************************************************************************
*                                  AJAX Wrapper v0.1                                 *
*   Page Title:   AJAX Wrapper Functions                                             *
*   Page Version: 0.1                                                                *
*   Author:       Tyler Klein (w/ help from O'Reilly's AJAX Hacks - Bruce Perry)     *
*   Date:         5/08/2006                                                          *
*************************************************************************************/

// ---------------------------- Ajax Layer 1 Functions ---------------------------- \\
// Description:
// Ajax layer 1 defines the direct wrappers for the XMLHttpRequest object. These
// functions keep track of multipe simultaneous requests and their associated return
// functions.
//
// Public Functions:
//
// ---ajaxServerRequest()---
// Sends args to server script (specified by url) and runs respFunction. The
// system passes respObj and the returned object from script to respFunction.
// i.e. respFunction( respObj, returnedObj )
//
// Usage: ajaxServerRequest( url, args, asynch, respFunction, respObj )
// url: page to send information
// args: specifies arguments to be passed to the page "a=foo&b=bar"
// asynch: send asynchronously (true) or synchronously (false)
// respFunction: function that processes data once loaded
// respObj: an object to be passed with the respFunction.
//
// Dependencies:
// A Global status bar must be defined in the page. It should be the last div on the
// so it is displayed on top of everything else. Use the following code:
// <div id="GlobalStatusBar" style="visibility:hidden; position:absolute; top:0px; right:0px; width:75px; height:20px; background:#FAA; border:1px SOLID #F00;">
//     <div id="GlobalStatusBar_progress" style="position:absolute; top:0px; left:0px; background:#F00; height:20px; width:0px;"></div>
//     <div id="GlobalStatusBar_status" style="position:absolute; top:0px; left:0px; color:#FFF;">Loading...</div>
// </div>
//
// ajaxObject:
// [0]: Status (true - in use. false - not in use)
// [1]: XMLHttpRequest object
// [2]: Response Function Handle
// [3]: Response Object Reference

var ajaxObjects = [];      // Array containing request objects and associated response objects
var totalAjaxRequests = 0; // Holds a value to use as the maximum requests for the status bar

var statusFile = "ajaxScripts/checkStatus.php";

// Looks for an free request object. If it can't find one, it creates a new one
function getNewAjaxObj(){
	for( var i=0; i<ajaxObjects.length; i++){
		if( ajaxObjects[i][0] == false ) break;
	}
	ajaxObjects[i] = new Array(); // Clear out the current entry
	ajaxObjects[i][0] = true;     // Indicates whether reqObject is being used
	ajaxObjects[i][1] = null;     // Pointer to request object
	ajaxObjects[i][2] = null;     // Pointer to response function handle
	ajaxObjects[i][3] = null;     // Pointer to response object
	
	totalAjaxRequests++;           // Increase the number of total requests
	updateGlobalStatus();         // Update the Global progress bar
	return( i );
}

// Returns the request object from the list associated with the passed id
function getAjaxRequestObject( id ){
	return ajaxObjects[id][1];
}

// Returns the response function from the list associated with the passed id
function getAjaxResponseFunction( id ){
	return ajaxObjects[id][2];
}

// Returns the response object from the list associated with the passed id
function getAjaxResponseObject( id ){
	return ajaxObjects[id][3];
}

// Marks the entry as being available for a new request
function delAjaxObj( id ){
	ajaxObjects[id][0] = false; // Mark this object as usable again
	updateGlobalStatus();        // Update the global status bar
}

// Returns the number of open ajax requests
function numOpenAjaxRequests(){
	var openRequests = 0;
	for( var i=0; i < ajaxObjects.length; i++ ){
		if( ajaxObjects[i][0] ) openRequests++;
	}
	return( openRequests );
}

// --- Send request to the server ---
function ajaxServerRequest( url, args, respFunction, respObj ){
	var ajaxObjId = getNewAjaxObj();
	if( window.XMLHttpRequest ){       // Mozilla-based browsers
		ajaxObjects[ajaxObjId][1] = new XMLHttpRequest();
	} else if( window.ActiveXObject ){ // MS IE Browsers
		ajaxObjects[ajaxObjId][1] = new ActiveXObject("Msxml2.XMLHTTP");
		if( !ajaxObjects[ajaxObjId][1] ){                // Old MS IE Browsers
			ajaxObjects[ajaxObjId][1] = new ActiveXObject("Microsoft.XMLHTTP");
		}
	}
	if( ajaxObjects[ajaxObjId][1] ){
		try {
			ajaxObjects[ajaxObjId][1].onreadystatechange = new Function("ajaxServerResponse("+ajaxObjId+");"); //Always pass back through ajaxServerResponse
			if( args != null ){
				ajaxObjects[ajaxObjId][1].open( "POST", url, true );
				ajaxObjects[ajaxObjId][1].setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
				ajaxObjects[ajaxObjId][1].send(args);
			} else {
				ajaxObjects[ajaxObjId][1].open( "GET", url, true );
				ajaxObjects[ajaxObjId][1].send(null);
			}
		} catch( errv ) { alert(url + "\n Can't contact the server now. Please try back later... \n Error Detail:"+errv); }
	} else {                       // Your browser is totally SOL
		alert("Your browser doesn't support the features of this site");
	}
	ajaxObjects[ajaxObjId][2] = respFunction; //Assign the response function to the ajaxObject
	ajaxObjects[ajaxObjId][3] = respObj;      //Assign the response object to the ajaxObject
	return ajaxObjId;
}

// Callback function for ajaxServerRequest
function ajaxServerResponse( ajaxObjId ){
	var request = getAjaxRequestObject( ajaxObjId );
	if( request.readyState == 4 ){
		if( request.status == 200 ){
			// Determine if we have an error... (non JSON response)
			if( request.responseText.slice(0,1) != "{" ){
				document.getElementById( "GlobalStatusBar_status").innerHTML = "<font color='#000' size='1'>" + request.responseText + "</font><br>";
				return;
			} else {
				// If no error, run the callback function
				var fn = new Function("return " + request.responseText);
				var resultsObject = fn();
				
				var responseFunction = getAjaxResponseFunction( ajaxObjId );
				var responseObject   = getAjaxResponseObject( ajaxObjId );

				if( responseFunction != null ){
					responseFunction( responseObject, resultsObject );
				}
				
				delAjaxObj( ajaxObjId );			
			}
		}
	}
}

// Looks for open requests. Displays "loading..." message if they exist.
function updateGlobalStatus(){
	var numAjaxRequests = numOpenAjaxRequests()
	if( numAjaxRequests > 0 ){ // Show Loading status bar
		var progress = 1 - numAjaxRequests / totalAjaxRequests;
		var fullWidth = document.getElementById( "GlobalStatusBar" ).style.width.slice(0,-2) //get width, trim off "px"
		document.getElementById("GlobalStatusBar_progress").style.width = progress * fullWidth;
		document.getElementById("GlobalStatusBar_progress").innerHTML = "Loading...";
		document.getElementById( "GlobalStatusBar" ).style.visibility = "visible";
	} else {                   // Hide Loading status bar
		totalAjaxRequests = 0; // Reset the counter
		document.getElementById( "GlobalStatusBar" ).style.visibility = "hidden";
	}
}

// ---------------------------- Ajax Layer 2 Functions ---------------------------- \\
// Description:
// Ajax layer 2 defines the wrappers for the ajaxServerRequest function defined above.
// These should be used directly by the HTML code on the page.
//
// Public Functions:
//
// ---updateDatabaseField()---
// Takes information from a field on the page, sends it to the server to update the
// associated database, and sends a new value back to put into the original field.
// Also, GUI indicators show the field's status. When still in process, the field is
// yellow. Once complete, it goes back to white.
//
// Usage: updateDatabaseField( obj, rowId, url )
// obj: an object reference to the field being updated.
// id: the id of the row in the database being updated.
// url: the script that performs the update.
//
// Dependencies:
// The name of the object must be the same as the associated field in the database.
// Here is an example:
// <input type="text" name="text1" value="<?=$rowValue?>" onBlur="updateDatabaseField(this, <?=$rowId?>, 'ajaxUpdateField.php');">
//
// ---runServerOperation()---
// Runs a server-side script, and then runs callbackFunction once it is finished. If obj
// is passed, it should be a string containing the status bar's prefix.
//
// Usage: runServerOperation( url, args, callbackFunction, statusBarPrefix )
// url: the script that performs the update.
// args: the arguments to pass to the server-side script
// callbackFunction: the function to run once complete
// statusBarPrefix: a string containing the prefix of the status bar. (see dependencies)
//
// Dependencies:
// If a statusBarPrefix is passed, the following code should be used. Note that 
// "_progress" and "_status" are appended onto "imageUpload". In this case, "imageUpload" is
// the statusBarPrefix that should be passed:
// <div id="imageUpload" style="position:absolute; top:150px; left:0px; width:300px; height:20px; background:#AAF; border:1px SOLID #000;">
//    <div id="imageUpload_progress" style="position:absolute; top:0px; left:0px; background:#00F; width:0px; height:20px;"></div>
//    <div id="imageUpload_status" style="position:absolute; top:0px; left:0px; color:#FFF;">Loading...</div>
// </div>

// Updates a field on the server
function updateDatabaseField( obj, rowId, url, callbackFN, callbackObj ){
	obj.style.background = "#FFA"; // Change the background color of the field to yellow
	var args = "action=update";    // Encode arguments to pass back to the server
	args    += "&name=" + encodeURIComponent(obj.name);   //Note: name must be the same as the db field name
	args    += "&value=" + encodeURIComponent(obj.value); //Value: value to update with
	args    += "&id=" + encodeURIComponent(rowId);        //id: Row id in the database

	ajaxServerRequest( url, args, updateDatabaseField_Callback, {obj:obj, cbFN:callbackFN, cbObj:callbackObj} ); // Call the update function
}

// Callback function for the updateDatabaseField function
function updateDatabaseField_Callback( responseObject, returnObject ){
	responseObject.obj.style.background = "";
	responseObject.obj.value = returnObject.newValue;
	if( responseObject.cbFN ){
		if( responseObject.callbackObj ){
			responseObject.cbFN(responseObject.cbObj);
		} else {
			responseObject.cbFN();
		}
	}
}

// Runs an operation on the server and executes callbackFunction
function runServerOperation( url, args, callbackFunction, responseObject, statusBarPrefix ){
	ajaxServerRequest( url, args, callbackFunction, responseObject ); // Call the update function
	if( statusBarPrefix != null ){
		setTimeout("updateStatus('"+statusBarPrefix+"')", 1000);//Tell status bar to update in one second
	}
}

// Updates the statusBar div to reflect the progress and status
function updateStatusBarWidget( statusBarPrefix, progress, info ){
	if( !document.getElementById( statusBarPrefix ) ) return;
	fullWidth = document.getElementById( statusBarPrefix ).style.width.slice(0,-2);
	document.getElementById(statusBarPrefix+"_progress").style.width = progress * fullWidth / 100;
	document.getElementById(statusBarPrefix+"_status").innerHTML = info;
}

// Requests the server's status
function updateStatus( statusBarPrefix ){
	ajaxServerRequest( statusFile, null, updateStatus_Callback, statusBarPrefix );
}

// Callback function for status request
function updateStatus_Callback( statusBarPrefix, returnObject ){
	updateStatusBarWidget( statusBarPrefix, returnObject.progress, returnObject.progress + "% - " + returnObject.info );
	if( returnObject.progress < 100 ){
		setTimeout("updateStatus('"+statusBarPrefix+"')", 500); //update status bar every half second.
	}
}