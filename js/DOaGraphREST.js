<!-- ============TEMPORAL VARS FOR SERVER COMMUNICATION============ -->



function initDatabase(serverURL){

	var query = {
	    "statements" : [ ]
	};
	query.statements.push({"statement":"CREATE INDEX ON :Node(internal_id)"});
	query.statements.push({"statement":"CREATE INDEX ON :Network(internal_id)"});
	query.statements.push({"statement":"CREATE INDEX ON :Background(internal_id)"});
	var xhr = new XMLHttpRequest();    
	xhr.onloadend = function () {
	    console.log(xhr.responseText);
	};
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));

}

function createNode(nodeType, nodeTypeJSON, networkName, graphical_data, serverURL, onLoadEnd){
	console.log("networkName",networkName);
	//console.log("nodeTypeJSON",nodeTypeJSON);
	var properties = Object.keys(nodeTypeJSON.schema.properties);
	var propertiesSt = "{";

	var internal_id = uuid();
	propertiesSt += "internal_id:\"" + internal_id + "\",";
	propertiesSt += "graphical_data:\"" + graphical_data + "\"";
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

	var statementSt = "CREATE (n:Node:";
	statementSt += nodeType + ":" + networkName + " ";
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

function createEdge(edgeType, edgeTypeJSON, graphical_data, serverURL, node1_id, node2_id, onLoadEnd){

	var properties = Object.keys(edgeTypeJSON.schema.properties);
	var propertiesSt = "{";

	var internal_id = uuid();
	propertiesSt += "graphical_data:\"" + graphical_data + "\",";
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

function deleteNode(internalID, serverURL, onLoadEnd){
	var query = {
	    "statements" : [ ]
	};

	var statementSt1 = "MATCH (n:Node { internal_id: '" + internalID + "'})-[r]-() DELETE r";
	var statementSt2 = "MATCH (n:Node { internal_id: '" + internalID + "'}) DELETE n";

	query.statements.push({"statement":statementSt1});
	query.statements.push({"statement":statementSt2});

	var xhr = new XMLHttpRequest();    
	xhr.onloadend = onLoadEnd;
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));
}

function deleteNetwork(networkName, serverURL, onLoadEnd){
	var query = {
	    "statements" : [ ]
	};

	var statementSt1 = "MATCH (n:" + networkName + ")-[r]-() DELETE r";
	var statementSt2 = "MATCH (n:" + networkName + ") DELETE n";
	var statementSt3 = "MATCH (n:Network {name: '" + networkName + "'}) DELETE n";

	console.log("statementSt1",statementSt1,"statementSt2",statementSt2,"statementSt3",statementSt3);

	query.statements.push({"statement":statementSt1});
	query.statements.push({"statement":statementSt2});
	query.statements.push({"statement":statementSt3});

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

function updateNetworkStageSize(networkName, width, height, serverURL, onLoadEnd){
	var query = {
	    "statements" : [ ]
	};

	var statementSt = "MATCH (n:Network) WHERE n.name = '" + networkName + "' SET n.width = " 
						+ width + ", n.height = " + height;

	query.statements.push({"statement":statementSt});

	var xhr = new XMLHttpRequest();    
	xhr.onloadend = onLoadEnd;
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));
}

function getNetworKStageSize(networkName, serverURL, onLoadEnd){
	var query = {
	    "statements" : [ ]
	};

	var statementSt = "MATCH (n:Network) WHERE n.name = '" + networkName + "' RETURN n.width AS width, n.height AS height";

	//console.log("statementSt",statementSt);

	query.statements.push({"statement":statementSt});

	var xhr = new XMLHttpRequest();    
	xhr.onloadend = onLoadEnd;
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));
}

function getNetworkData(networkName, serverURL, onLoadEnd){
	var query = {
	    "statements" : [ ]
	};

	var statementSt1 = "MATCH (node:Node:" + networkName + ")-[r]-() " 
					+ "RETURN node, r";
	var statementSt2 = "MATCH (node:Node:" + networkName + ") " 
					+ "RETURN node";
	var statementSt3 = "MATCH (b:Background:" + networkName + ") "
					+ "RETURN b";

	query.statements.push({"statement":statementSt1});
	query.statements.push({"statement":statementSt2});
	query.statements.push({"statement":statementSt3});

	var xhr = new XMLHttpRequest();    
	xhr.onloadend = onLoadEnd;
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));
}

function getNetworks(serverURL, onLoadEnd){
	var query = {
	    "statements" : [ ]
	};

	var statementSt = "MATCH (n:Network) RETURN n";

	query.statements.push({"statement":statementSt});

	var xhr = new XMLHttpRequest();    
	xhr.onloadend = onLoadEnd;
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));
}

function createNetwork(networkName, stageDefaultSize, serverURL, onLoadEnd){

	var propertiesSt = "{ name:\"" + networkName + "\", ";
	propertiesSt += "creation_time: \"" + getCurrentTime() + "\",";
	propertiesSt += "width:\"" + stageDefaultSize.width + "\", ";
	propertiesSt += "height:\"" + stageDefaultSize.height + "\", ";


	var internal_id = uuid();
	propertiesSt += "internal_id:\"" + internal_id + "\"}";

	var statementSt = "CREATE (n:Network ";
	statementSt += propertiesSt;
	statementSt += ") RETURN n";

	var query = {
	   "statements" : [ ]
	};

	query.statements.push({"statement":statementSt});

	var xhr = new XMLHttpRequest();    
	xhr.onloadend = onLoadEnd;
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));
}

function deleteBackground(internal_id, serverURL, onLoadEnd){
	var query = {
	    "statements" : [ ]
	};

	var statementSt1 = "MATCH (n:Background { internal_id: '" + internalID + "'})-[r]-() DELETE r";
	var statementSt2 = "MATCH (n:Background { internal_id: '" + internalID + "'}) DELETE n";

	query.statements.push({"statement":statementSt1});
	query.statements.push({"statement":statementSt2});

	var xhr = new XMLHttpRequest();    
	xhr.onloadend = onLoadEnd;
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));

}

function createBackground(networkName, graphical_data, serverURL, onLoadEnd){
	var query = {
	    "statements" : [ ]
	};

	var propertiesSt = "{";

	var internal_id = uuid();
	propertiesSt += "internal_id:\"" + internal_id + "\",";
	propertiesSt += "graphical_data:\"" + graphical_data + "\"";	
	propertiesSt += "}";

	var statementSt1 = "CREATE (b:Background:";
	statementSt1 += networkName + " ";
	statementSt1 += propertiesSt;
	statementSt1 += ") RETURN b";

	var statementSt2 = "MATCH (n:Network {name: '" + networkName + "'}), " +
					  "(b:Background {internal_id: '" + internal_id + "'}) " +
					  "CREATE (n)-[e:network_background]->(b) RETURN e";

	query.statements.push({"statement":statementSt1});
	query.statements.push({"statement":statementSt2});

	var xhr = new XMLHttpRequest();    
	xhr.onloadend = onLoadEnd;
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));
}

function updateBackground(internalID,graphical_data, serverURL, onLoadEnd){
	var query = {
	    "statements" : [ ]
	};

	var statementSt = "MATCH (b:Background) WHERE b.internal_id = '" + internalID + "' SET " +
					" graphical_data = '" + graphical_data + "' RETURN b";

	query.statements.push({"statement":statementSt});

	var xhr = new XMLHttpRequest();    
	xhr.onloadend = onLoadEnd;
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));

}

function updateNodeProperties(internalID, serverURL, newProperties, onLoadEnd){
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

	//console.log("statementSt",statementSt);

	query.statements.push({"statement":statementSt});

	var xhr = new XMLHttpRequest();    
	xhr.onloadend = onLoadEnd;
	xhr.open("POST", serverURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(query));
}

function updateEdgeProperties(internalID, serverURL, newProperties, onLoadEnd){
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

function getCurrentTime(){
	var currentdate = new Date(); 
	var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    return datetime;
}