<!-- ============TEMPORAL VARS FOR SERVER COMMUNICATION============ -->



function initDatabase(serverURL){

	var query = {
	    "statements" : [ ]
	};
	query.statements.push({"statement":"CREATE INDEX ON :Node(internal_id)"});
	var xhr = new XMLHttpRequest();    
	xhr.onloadend = function () {
	    console.log(xhr.responseText);
	};
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));

}

function createNode(nodeType, nodeTypeJSON, serverURL, onLoadEnd){
	//console.log("nodeType",nodeType);
	//console.log("nodeTypeJSON",nodeTypeJSON);
	var properties = Object.keys(nodeTypeJSON.schema.properties);
	var propertiesSt = "{";

	var internal_id = uuid();
	propertiesSt += "internal_id:\"" + internal_id + "\",";

	//console.log("properties",properties);
	for(var i=0; i<properties.length;i++){
		propertiesSt += properties[i] + ":\"\"";
		if(i<properties.length -1){
			propertiesSt += ",";
		}
	}
	propertiesSt += "}";
	//console.log("propertiesJSON",propertiesJSON);

	var statementSt = "CREATE (n:Node:";
	statementSt += nodeType + " ";
	statementSt += propertiesSt;
	statementSt += ") RETURN n";

	//console.log("statementSt", statementSt);

	var query = {
	    "statements" : [ ]
	};

	query.statements.push({"statement":statementSt});

	//console.log("query", query);
	//console.log("query st", JSON.stringify(query));

	var xhr = new XMLHttpRequest();    
	xhr.onloadend = onLoadEnd;
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));
}

function createEdge(edgeType, edgeTypeJSON, serverURL, node1_id, node2_id, onLoadEnd){

	var properties = Object.keys(edgeTypeJSON.schema.properties);
	var propertiesSt = "{";

	var internal_id = uuid();
	propertiesSt += "internal_id:\"" + internal_id + "\"";
	if(properties.length > 0){
		propertiesSt += ",";
	} 

	//console.log("properties",properties);
	for(var i=0; i<properties.length;i++){
		propertiesSt += properties[i] + ":\"\"";
		if(i<properties.length -1){
			propertiesSt += ",";
		}
	}
	propertiesSt += "}";
	//console.log("propertiesJSON",propertiesJSON);

	var statementSt = "MATCH (n1:Node),(n2:Node) WHERE n1.internal_id = '" + node1_id  
		+ "' AND n2.internal_id = '" + node2_id + "' CREATE (n1)-[e:";
	statementSt += edgeType + " ";
	statementSt += propertiesSt;
	statementSt += " ]->(n2) RETURN e";

	console.log("statementSt", statementSt);

	var query = {
	    "statements" : [ ]
	};

	query.statements.push({"statement":statementSt});

	//console.log("query", query);
	//console.log("query st", JSON.stringify(query));

	var xhr = new XMLHttpRequest();    
	xhr.onloadend = onLoadEnd;
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));

}

function getNodeData(internalID, serverURL, onLoadEnd){

	var query = {
	    "statements" : [ ]
	};

	var statementSt = "MATCH (n) WHERE n.internal_id = '" + internalID + "' RETURN n";

	query.statements.push({"statement":statementSt});

	var xhr = new XMLHttpRequest();    
	xhr.onloadend = onLoadEnd;
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));

}

function updateNodeProperties(internalID, serverlURL, newProperties, onLoadEnd){
	var query = {
	    "statements" : [ ]
	};

	var statementSt = "MATCH (n) WHERE n.internal_id = '" + internalID + "' SET ";

	var propsArray = Object.keys(newProperties);
	for(var i=0; i<propsArray.length;i++){
		statementSt += "n." + propsArray[i] + " = '" + newProperties[propsArray[i]] +  "'" ;
		if(i<propsArray.length -1){
			statementSt += ",";
		}
	}

	statementSt += "RETURN n";

	console.log("statementSt",statementSt);

	query.statements.push({"statement":statementSt});

	var xhr = new XMLHttpRequest();    
	xhr.onloadend = onLoadEnd;
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));
}

function uuid() {

  // credit: http://stackoverflow.com/posts/2117523/revisions

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
     var r = Math.random() * 16|0;
     var v = c == 'x' ? r : (r&0x3|0x8);
     return v.toString(16);
   });
}