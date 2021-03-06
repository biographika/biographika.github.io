<!-- +++++++++++++++++++ MAIN VARS ++++++++++++++++++++++++ -->
 var graph, node_types_graph, link_types_graph, backgrounds_graph, paper,
    node_types_paper, link_types_paper, backgrounds_paper, protein_node_type,
    organism_node_type, genome_element_type, selected_node_type,
    current_node_type_graph, current_node_type_paper;

 //.......paper panning related vars........
 /**
 Flag indicating whether the paper is being currently panned
 */
 var paperIsPanning = false;
 var pointerDownClientX;
 var pointerDownClientY;
 var lastPositionMouseX;
 var lastPositionMouseY;
 /**
 Flag indicating whether the selected cell is currently being dragged
 */
 var nodeIsBeingDragged = false;
 //.........................................
 //.......paper zooming related vars........
 /**
 Initial scale for the paper
 */
 var initialPaperScale = 1;
 /**
 Represents the current scale of the paper
 */
 var paperScale = initialPaperScale;
 /**
 Factor used to either decrease or increase the scale of the paper
 */
 var paperScaleFactor = 0.2;
 /**
 Initial width for the paper
 */
 var paperInitialWidth = 500;
 /**
 Initial height for the paper
 */
 var paperInitialHeight = 200;
 //.........................................

 //-----node types cells------------------------
 /**
 Node type cell height used in the node type selector
 */
 var nodeTypeCellHeight = 100;
 /**
 Node type x position used in the node type selector
 */
 var nodeTypeCellDefaultX = 15;
 /**
 Node type maximum width allowed for nodes in the node type selector
 */
 var nodeTypeCellMaxWidth = 80;
 //----------------------------------------------

 //-----link types cells------------------------
 /**
 Link type cell height used in the link type selector
 */
 var linkTypeCellHeight = 60;
 /**
 Link type x position used in the link type selector
 */
 var linkTypeCellDefaultX = 15;
 /**
 Link type y position used in the link type selector
 */
 var linkTypeCellDefaultY = 30;
 /**
 Link type maximum width allowed for links in the node type selector
 */
 var linkTypeCellMaxWidth = 120;
 //----------------------------------------------

 //-----background cells------------------------
 /**
 Background height used for cells in the background type selector
 */
 var backgroundCellHeight = 250;
 /**
 Background x position used in the background type selector
 */
 var backgroundCellDefaultX = 15;
 /**
 Background maximum width allowed for background cells in the background type selector
 */
 var backgroundCellMaxWidth = 500;
 /**
 Width value for the paper of the background selector
 */
 var backgroundPaperWidth = 500;
 /**
 Height value for the paper of the background selector
 */
 var backgroundPaperHeight = 300;
 //----------------------------------------------

 /**
 Node type currently selected that will be used when creating new nodes
 */
 var selectedNodeTypeCell;
 /**
 Link type currently selected that will be used when creating new links
 */
 var selectedLinkTypeCell;
 /**
 Background type currently selected that will be used when setting a new background
 */
 var selectedBackgroundCell;
 /**
 Node currently selected
 */
 var selectedNode;
 /**
 Link currently selected
 */
 var selectedLink;
 /**
 Last link selected
 */
 var lastSelectedLink;
 /**
 Flag indicating whether the application is in read-only mode or not. Read-only
 mode means that neither of the following operations is allowed:
 - Create new nodes
 - Delete existing nodes
 - Create new links
 - Delete existing links
 - Move/modify nodes
 - Move/modify links
 - Update nodes metadata
 - Rename node labels
 */
 var readOnlyMode = false;
 /**
 Flag indicating whether links can be modified by user interaction, that's to say: 
 deleted, updated, etc...
 */
 var modifiableLinks = false;
 /**
 Current background for the diagram (if any), null otherwise.
 */
 var currentBackgroundCell = null;
 /**
 Rect cell used to represent the selection of a node. It's always located behind
 the selected node. Its value is null in the case no node is currently selected.
 */
 var selectionRectCell = null;

 /**
 Flag used to identify the first time the background selector modal is shown
 */
 var backgroundsModalFirstTimeShown = true;

 /**
 Flag used to identify the first time the node type selector modal is shown
 */
 var nodeTypesModalFirstTimeShown = true;

 /**
 Flag used to identify the first time the link type selector modal is shown
 */
 var linkTypesModalFirstTimeShown = true;

 /**
 This variable holds the different type definitions (metadata properties for each node type)
 valid for the current theme.
 */
 var typeDefinitionsJSON;

 /**
 This variable holds the definition of all the themes available in the file Themes.json
 */
 var themesJSON;

 /**
 Factor used when rotating either to the left or to the right (number of degrees)
 */
 var rotateCellFactor = 10;

 /**
 This cell is used as a white background which is always behind all cells (nodes, bacground, links...)
 so that it can emulate the existence of the paper. That way the dimensions of the paper can be perceived
 by the contrast of this box with the greyish background.
 Events such as blank:pointerdown are no longer fired so they are emulated artificially
 when the user is clicking in the background box.
 */
 var backgroundBox;
 /**
 Control variable used to modify the alpaca form used to display/modify nodes metadata
 */
 var alpacaMetadataFormControl;
 var lastLinkSelectedStrokeWidth = 1;

 // Shortcuts.
 var rect = joint.shapes.basic.Rect;
 var path = joint.shapes.basic.Path;
 var circle = joint.shapes.basic.Circle;
 var ellipse = joint.shapes.basic.Ellipse;
 var polygon = joint.shapes.basic.Polygon;
 var polyline = joint.shapes.basic.Polyline;
 var text = joint.shapes.basic.Text;
 var link = joint.dia.Link;
 

 //=================Config vars=======================
 /**
 Maximun number of characters that a node label can have in the same line
 */
 var nodeLabelMaxLength;
 /**
 Maximun number of characters that a link label can have in the same line
 */
 var linkLabelMaxLength;
 /**
 Default size (width,height) for the paper
 */
 var paperDefaultSize;
 /**
 Default font size for labels in links
 */
 var linkDefaultFontSize;
 /**
 Indicates whether the application should be launched in read only mode or not
 */
 var launchInReadOnlyMode;
 //===================================================

 var themesFileURL = "data/Themes.json";
 var defaultTheme;
 var currentTheme;

 <!--+++++++++++++++++++++++++++++++++++++++++++++++++++++++ -->


 <!--===================DOCUMENT EVENT HANDLERS======================== -->
 $(document).mousemove(function( event ) {

   if(paperIsPanning){

     var tempClientX = event.clientX;
     var tempClientY = event.clientY;
     var differenceX = tempClientX - lastPositionMouseX;
     var differenceY = tempClientY - lastPositionMouseY;
     var currentScrollLeft = $("#graph-container").scrollLeft();
     var currentScrollTop = $("#graph-container").scrollTop();

     lastPositionMouseX += differenceX;
     lastPositionMouseY += differenceY;

     $("#graph-container").scrollLeft(currentScrollLeft + differenceX);
     $("#graph-container").scrollTop(currentScrollTop + differenceY);

   }

   if(nodeIsBeingDragged){
      $("#graph-container").css("cursor", "move");
      updateSelectionRectPosition();
   }

  });
 $(document).mouseup(function( event ) {
    //console.log("mouse up!");
    paperIsPanning = false;
    nodeIsBeingDragged = false;
    $("#graph-container").css("cursor", "pointer");
 });

 <!--===================================================================-->

  <!-- LOAD GRAPH BUTTON... -->
  $(document).on('change', '.btn-file :file', function() {
      var input = $(this);
      var file = input.get(0).files[0];
      var fileNameSplit = file.name.split(".");
      var fileType = fileNameSplit[fileNameSplit.length - 1];

      if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
  	      var contents = e.target.result;
          ////console.log(fileType);
          if(fileType != "json"){
              alert("Please select a .json file");
          }else{
             graph.fromJSON(JSON.parse(contents));

             //var bbox = graph.getBBox(graph.getElements());
             var contentBBox = paper.getContentBBox();
             paperInitialWidth = contentBBox.width + contentBBox.x;
             paperInitialHeight = contentBBox.height + contentBBox.y;

             //console.log("graph loaded!");

             updatePaperDimensionsTextInputs(paperInitialWidth, paperInitialHeight);

             deletePreviousBackgroundBox();
             initializeBackgroundBox(paperInitialWidth, paperInitialHeight);

             updatePaperDimensions(paperInitialWidth,paperInitialHeight);

             if(!modifiableLinks){
                makeLinksInteractive(false);
             }
             if(readOnlyMode){
              applyReadOnlyMode(true);
             }
             paper.render();
          }
        }
        reader.readAsText(file);
      } else {
        alert("Failed to load file");
      }
  });

  <!-- LOCK DIAGRAM CHECKBOX... -->
  $("#lockDiagramCheckBox").click( function(){      

      applyReadOnlyMode($(this).is(':checked'));
      
    }
  );

  <!-- MODIFY LINK ON CLICK CHECKBOX... -->
  $("#modifyLinkOnClickCheckBox").click( function(){
    //console.log("modifyLinkOnClick");
    if( $(this).is(':checked') ){

      //console.log("checked!");
      makeLinksInteractive(true); 
      modifiableLinks = true;    
      
      
    }else{

      //console.log("unchecked!");
      makeLinksInteractive(false);    
      modifiableLinks = false;
      
    }

    }
  );


  <!-- EXPORT BUTTONS... -->
  $("#exportDropDownMenu").on("click", "li", function(event){

    var buttonClicked = event.currentTarget.getElementsByTagName("a")[0].getAttribute("id");
    if(buttonClicked == "exportToJSONButton"){
        exportToJSON();
    }

  });

  <!-- THEMES DROPDOWN... -->
  $("#themesDropDownMenu").on("click", "li", function(event){

    var selectedThemeName = event.currentTarget.getElementsByTagName("a")[0].textContent;

    console.log("selectedThemeName",selectedThemeName);
    var selectedTheme = themesJSON[selectedThemeName];
    console.log("selectedTheme",selectedTheme);

    

  });

  <!-- MAKING NODE TYPES LIST ELEMENTS SELECTABLE -->
  $("ul li").click(function() {
    $(this).parent().children().removeClass("active");
    $(this).addClass("active");
  });

  <!-- BACKGROUNDS MODAL DIALOG -->
  $('#background_dialog').on('shown.bs.modal', function () {
    ////console.log("backgrounds! shown.bs.modal");
    if(backgroundsModalFirstTimeShown){
      ////console.log("backgroundsModalFirstTimeShown");
      initializeBackgroundsPaper(currentTheme.backgrounds);
    }else{
      loadBackgroundsTheme(currentTheme.backgrounds);
    }
    backgroundsModalFirstTimeShown = false;
  });

  <!-- NODE TYPES MODAL DIALOG -->
  $('#node_types_dialog').on('shown.bs.modal', function () {
    ////console.log("node types! shown.bs.modal");
    if(nodeTypesModalFirstTimeShown){
      ////console.log("nodeTypesModalFirstTimeShown");
      initializeNodeTypesPaper(currentTheme.elements);
    }else{
      loadNodeTypesTheme(currentTheme.elements);
    }
    nodeTypesModalFirstTimeShown = false;
  });

  <!-- LINK TYPES MODAL DIALOG -->
  $('#link_types_dialog').on('shown.bs.modal', function () {
    ////console.log("link types! shown.bs.modal");
    if(linkTypesModalFirstTimeShown){
      ////console.log("linkTypesModalFirstTimeShown");
      initializeLinkTypesPaper(currentTheme.links);
    }else{
      loadLinkTypesTheme(currentTheme.links);
    }
    linkTypesModalFirstTimeShown = false;
  });


  function initializeJoint(){
    initializeGraphPaper();
  }

  /**
  Initializes the graph object plus the main paper where the diagram is displayed.
  Listeners for events fired by the paper are declared also here.
  */
  function initializeGraphPaper(){
    ////console.log("initializeGraphPaper");

    graph = new joint.dia.Graph;

    paper = new joint.dia.Paper({
      el: $('#graph-container'),
      gridSize: 1,
      model: graph,
      width: paperInitialWidth,
      height: paperInitialHeight,
      defaultLink: getDefaultLink
    });

    //---update dimension values on text inputs
    $('#inputWidth').attr('value', paperInitialWidth);
    $('#inputHeight').attr('value', paperInitialHeight);

    paper.on("blank:pointerdown",
      function(evt, x, y){
          onStageDown(evt,x,y);
      }
    );

    paper.on("cell:mouseover",
      function(cellView, evt, x, y){
        if(cellView.model == backgroundBox){
          $(".element").css("cursor","pointer");
        }else{
          if(cellView.model.isLink()){
            $(".element").css("cursor","pointer");
          }else{
            if(selectedNode){
              if(cellView.id == selectedNode.id){
                $(".element").css("cursor","move");
              }
            }
          }  
        }
      }
    );
    paper.on("cell:mouseout",
      function(evt, x, y){
        ////console.log("cell mouse out!");
      }
    );
    paper.on('cell:pointerdown',
      function(cellView, evt, x, y){
        if(cellView.model == backgroundBox || cellView.model == currentBackgroundCell){
          onStageDown(evt,x,y);
        }else{
          if(!cellView.model.isLink()){            
            if(selectedNode){
              //console.log("selectedNode is true", selectedNode);
              if(selectedNode.model.id == cellView.model.id){
                //console.log("selectednode and the same");
                nodeIsBeingDragged = true;
              }
            }            
          }          
        }
      }
    );
    paper.on('cell:pointerclick',
      function(cellView, evt, x, y) {

        if(cellView.model.isLink()){
          //console.log("Cell is link! ");
          selectLinkCell(cellView, true);
        }else{
          if(cellView.model == backgroundBox){
            onBackgroundOrBackgroundBoxClick(evt,x,y);
          }else if(cellView.model == currentBackgroundCell){
            onBackgroundOrBackgroundBoxClick(evt,x,y);
          }else{

            if(selectedNode){
              if(cellView.id != selectedNode.id){
                selectNodeCell(selectedNode, false);
              }
            }
            selectNodeCell(cellView, true);

          }
        }
      }
    );

    paper.on('cell:pointerup', function(cellView) {
        if (cellView.model instanceof joint.dia.Link){
          var tempLink = cellView.model;
          if(isLinkInvalid(tempLink)){
            tempLink.remove();
          }else{
            selectLinkCell(cellView,true);
            if(!modifiableLinks){
              makeLinksInteractive(false);
            }
          }
        }
    });

    initializeBackgroundBox(paperInitialWidth, paperInitialHeight);

  }

  /**
  Initializes the white paper-sized rect cell that is permanently located behind
  all the rest of elements.
  */
  function initializeBackgroundBox(width, height){
    ////console.log("initializeBackgroundBox");
    backgroundBox  = createBackgroundBox(0, 0, width, height, '#FFFFFF');
    backgroundBox.findView(paper).options.interactive = false;
    /**This is a flag used so that the background box cell can be identified for
    example when importing a diagram file    */
    backgroundBox.prop("background_box","true");
    backgroundBox.toBack();
  }
  /**
  Initializes the paper where link types are shown.
  This paper is used to select the current link type that will be used when creating
  new links on the diagram.
  */
  function initializeLinkTypesPaper(themeURL){
    link_types_graph = new joint.dia.Graph;
    link_types_paper = new joint.dia.Paper({
      el: $('#link_types_list'),
      gridSize: 1,
      model: link_types_graph,
      width: $('#link_types_list').width(),
      height: $('#link_types_list').height(),
      interactive: false      });

      link_types_paper.on('cell:pointerclick',
        function(linkView, evt, x, y) {
            selectLinkType(linkView);
        }
      );
    loadLinkTypesTheme(themeURL);
  }
  /**
  Loads the link type theme specified by the JSON file at the URL provided
  @param {string} url - URL pointing to the theme file with the link types definition
  */
  function loadLinkTypesTheme(url){

    //----loading JSON WITH THEME-----------------------
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);

    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          link_types_graph.fromJSON(JSON.parse(xobj.responseText));
          calculateSizeOfLinkTypesPaper();
          positionLinkTypesOnPaper();
          makeLinkTypesNotInteractive();
          //select first link type
          selectLinkType(link_types_graph.getLinks()[0].findView(link_types_paper));
        }
    };
    xobj.send(null);
    //------------------------------------------------


  }

  function calculateSizeOfLinkTypesPaper(){
    var numberOfTypes = link_types_graph.getLinks().length;
    link_types_paper.setDimensions(linkTypeCellMaxWidth + linkTypeCellDefaultX, linkTypeCellHeight*numberOfTypes);
    link_types_paper.render();
  }

  function positionLinkTypesOnPaper(){

    var linkTypes = link_types_graph.getLinks();

    for(var i=0; i<linkTypes.length;i++){
      var currentLinkType = linkTypes[i];
      var currentY = (linkTypeCellHeight * i) + linkTypeCellDefaultY;
      currentLinkType.prop("source", {"x":linkTypeCellDefaultX,"y":currentY});
      currentLinkType.prop("target", {"x":120,"y":currentY});
    }
    link_types_paper.render();
  }

  function makeLinkTypesNotInteractive(){
    var linkTypes = link_types_graph.getLinks();
    for(var i=0; i<linkTypes.length;i++){
      var currentLinkType = linkTypes[i];
      link_types_paper.findViewByModel(currentLinkType).options.interactive = false
    }
    link_types_paper.render();
  }

  function initializeBackgroundsPaper(themeURL){
    ////console.log("initializeBackgroundsPaper");
    backgrounds_graph = new joint.dia.Graph;

    backgrounds_paper = new joint.dia.Paper({
      el: $('#backgrounds_list'),
      gridSize: 1,
      model: backgrounds_graph,
      width: backgroundPaperWidth,
      height: backgroundPaperHeight,
      interactive: false });

    backgrounds_paper.on('cell:pointerclick',
      function(cellView, evt, x, y) {
          selectBackgroundCell(cellView);
      }
    );

    loadBackgroundsTheme(themeURL);
    backgrounds_paper.render();

  }

  function initializeNodeTypesPaper(themeURL){

    node_types_graph = new joint.dia.Graph;

    node_types_paper = new joint.dia.Paper({
      el: $('#node_types_list'),
      gridSize: 1,
      model: node_types_graph,
      width: $('#node_types_list').width(),
      height: $('#node_types_list').height(),
      interactive: false      });

    node_types_paper.on('cell:pointerclick',
      function(cellView, evt, x, y) {
          selectNodeTypeCell(cellView);
      }
    );

    loadNodeTypesTheme(themeURL);
  }

  /**
  Loads the backgrounds theme specified by the JSON file at the URL provided
  @param {string} url - URL pointing to the theme file with the backgrounds definition
  */
  function loadBackgroundsTheme(url){
    ////console.log("loadBackgroundsTheme");
    //----loading JSON WITH THEME-----------------------
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);

    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          ////console.log("onreadystatechange (backgrounds)!");
          backgrounds_graph.fromJSON(JSON.parse(xobj.responseText));
          calculateSizeOfBackgroundsPaper();
          positionBackgroundsOnPaper();
          //select first node type
          selectBackgroundCell(backgrounds_graph.getElements()[0].findView(backgrounds_paper));
          backgrounds_paper.render();
        }
    };
    xobj.send(null);
    //------------------------------------------------
  }

  /**
  Loads the type defintions included in the JSON file located at 'url'
  @param {string} url - URL pointing to the JSON type definitions file
  */
  function loadTypeDefinitions(url){
    //----loading JSON WITH TYPE DEFINITIONS-----------------------
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);

    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          ////console.log(xobj.responseText);
          typeDefinitionsJSON = JSON.parse(xobj.responseText);
          ////console.log(typeDefinitionsJSON);
        }
    };
    xobj.send(null);
    //------------------------------------------------
  }
  /**
  Loads the node type theme specified by the JSON at the URL provided
  @param {string} url - URL pointing to the theme file with the definition of the node types
  */
  function loadNodeTypesTheme(url){
    ////console.log("loadNodeTypesTheme");
    //----loading JSON WITH THEME-----------------------
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);

    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          ////console.log(xobj.responseText);
          node_types_graph.fromJSON(JSON.parse(xobj.responseText));
          calculateSizeOfNodeTypesPaper();
          positionNodeTypesOnPaper();
          makeNodeTypesNotInteractive();
          //select first node type
          selectNodeTypeCell(node_types_graph.getElements()[0].findView(node_types_paper));
        }
    };
    xobj.send(null);
    //------------------------------------------------
  }

  function makeNodeTypesNotInteractive(){
    //console.log("makeNodeTypesNotInteractive");
    for(var i=0;i<node_types_graph.getElements().length;i++){
      var currentNodeType = node_types_graph.getElements()[i];
      currentNodeType.attr("image/magnet","");
      currentNodeType.attr("text/magnet","");
    }
  }

  function calculateSizeOfNodeTypesPaper(){
    var numberOfTypes = node_types_graph.getElements().length;
    node_types_paper.setDimensions(100, nodeTypeCellHeight*numberOfTypes);
    node_types_paper.render();
  }

  function positionNodeTypesOnPaper(){

    var nodeTypes = node_types_graph.getElements();
    for(var i=0; i<nodeTypes.length;i++){
      var currentNodeType = nodeTypes[i];
      var currentY = nodeTypeCellHeight * i;
      currentNodeType.prop("position", {"x":nodeTypeCellDefaultX,"y":currentY});
      var currentText = currentNodeType.attr("text/text");
      var brokenText = joint.util.breakText(currentText, { width: nodeTypeCellMaxWidth });
      ////console.log(currentText,brokenText);
      currentNodeType.attr("text/text", brokenText);
    }
    node_types_paper.render();
  }

  function calculateSizeOfBackgroundsPaper(){
    //console.log("calculateSizeOfBackgroundsPaper");
    var numberOfBackgrounds = backgrounds_graph.getElements().length;
    backgrounds_paper.setDimensions(500, backgroundCellHeight*numberOfBackgrounds);
  }

  function positionBackgroundsOnPaper(){
    //console.log("positionBackgroundsOnPaper");
    var backgrounds = backgrounds_graph.getElements();
    for(var i=0; i<backgrounds.length;i++){
      var currentBackground = backgrounds[i];
      var currentY = backgroundCellHeight * i;
      currentBackground.prop("position", {"x":backgroundCellDefaultX,"y":currentY});
      var currentText = currentBackground.attr("text/text");
      var brokenText = joint.util.breakText(currentText, { width: backgroundCellMaxWidth });
      ////console.log(currentText,brokenText);
      currentBackground.attr("text/text", brokenText);
    }
  }


  function exportToJSON(){
    if(selectedNode){
      selectNodeCell(selectedNode,false); // so that the selected node is not saved with bold-style text
    }
    if(selectedLink){
      selectLinkCell(selectedLink,false); // so that the selected link is not saved with bold-style text
    }
    downloadJSON(JSON.stringify(graph.toJSON()));
  }

  function selectLinkCell(cellView, flag){
    //console.log("selectLinkCell", flag);

    if(cellView.model.isLink()){     

      if(flag){

        // Deselecting current selected node so that both a link and a node are
        // not selected at the same time.
        if(selectedNode){
          selectNodeCell(selectedNode,false);
        }

        if(selectedLink && selectedLink.id == cellView.id){
          //console.log("same cell!");
        }else{

          var tempLabel = cellView.model.label(0);
            
        if(tempLabel){
          var currentFontSize = cellView.model.attr('text/font-size');
          if(!currentFontSize){
            currentFontSize = linkDefaultFontSize;
          }
          cellView.model.label(0,{ attrs: { text: { 'font-weight': 'bold', 'font-size': (currentFontSize*1.25) } } });
        }
        var currentStrokeWidth = cellView.model.attr('connection/stroke-width');
        if(!currentStrokeWidth){
          currentStrokeWidth = 1;
        }
        //console.log("currentStrokeWidth",currentStrokeWidth);
        cellView.model.attr({'.connection': { 'stroke-width': currentStrokeWidth*2 }});

        selectedLink = cellView;

        if(lastSelectedLink){
          var tempLabel = lastSelectedLink.model.label(0);
            
          if(tempLabel){
            var currentFontSize = lastSelectedLink.model.attr('text/font-size');            
            lastSelectedLink.model.label(0,{ attrs: { text: { 'font-weight': 'bold', 'font-size': (currentFontSize/1.25) } } });
          }
          var currentStrokeWidth = lastSelectedLink.model.attr('.connection/stroke-width');
          lastSelectedLink.model.attr({'.connection': { 'stroke-width': currentStrokeWidth/2 }});
        }

        
        lastSelectedLink = selectedLink;
          
        }        
       

      }else{
        var tempLabel = cellView.model.label(0);
            
        if(tempLabel){
           var currentFontSize = cellView.model.attr('text/font-size');            
           cellView.model.label(0,{ attrs: { text: { 'font-weight': 'bold', 'font-size': (currentFontSize/1.25) } } });
        }
        var currentStrokeWidth = cellView.model.attr('.connection/stroke-width');
        cellView.model.attr({'.connection': { 'stroke-width': currentStrokeWidth/2 }});

        selectedLink = null;
        lastSelectedLink = null;

      }      

      
    }
  }

  function selectNodeCell(cellView, flag){

    //console.log("selectedNodeCell", flag);

    var newCellSelected = true;
    if(selectedNode){
      newCellSelected = cellView.id != selectedNode.id;
    }

    var nodeCells = graph.getElements();

    for (var i = 0; i < nodeCells.length; i++) {
      var currentCell = nodeCells[i];
      if(currentCell.attributes.id == cellView.model.id){
          selectedNode = currentCell.findView(paper);
          if(flag){
            currentCell.attr('text/font-weight',"bold");
          }else{
            currentCell.attr('text/font-weight',"normal");
          }
        }
    }

    if(flag){
      if(newCellSelected){
        initializeSelectionRect();
      }
      if(selectedLink){
        selectLinkCell(selectedLink,false);
      }
    }else{
      if(selectionRectCell){
        selectionRectCell.remove();
        selectionRectCell = null;
        selectedNode = null;
      }
    }

  }

  function selectNodeTypeCell(cellView){

    ////console.log("selectNodeTypeCell");

    var nodeTypeCells = node_types_graph.getElements();
    for (var i = 0; i < nodeTypeCells.length; i++) {
      var currentCell = nodeTypeCells[i];
      if(currentCell.attributes.id == cellView.model.id){
          selectedNodeTypeCell = currentCell;
          ////console.log(selectedNodeTypeCell);
          currentCell.attr('text/font-weight',"bold");
      }else {
          currentCell.attr('text/font-weight',"normal");
      }
    }
  }

  function selectLinkType(cellView){
    ////console.log("selectLinkType!");
    var linkTypeCells = link_types_graph.getLinks();

    for (var i = 0; i < linkTypeCells.length; i++) {
      var currentCell = linkTypeCells[i];
      if(currentCell.attributes.id == cellView.model.id){

          selectedLinkTypeCell = currentCell;
          currentCell.label(0,{ attrs: { text: { 'font-weight': 'bold', 'font-size': 16 } } });
          link_types_paper.defaultLink = selectedLinkTypeCell;
          ////console.log("selected",currentCell.label(0));
      }else {
        currentCell.label(0,{ attrs: { text: { 'font-weight': 'normal', 'font-size': 10  } } });
        ////console.log("rest",currentCell.label(0));
      }
    }

    ////console.log(link_types_paper.options);
  }

  function selectBackgroundCell(cellView){

    ////console.log("selectBackgroundCell");

    var backgroundCells = backgrounds_graph.getElements();

    for (var i = 0; i < backgroundCells.length; i++) {

      var currentBackground = backgroundCells[i];

      if(currentBackground.attributes.id == cellView.model.id){
          selectedBackgroundCell = currentBackground;
          ////console.log(selectedNodeTypeCell);
          currentBackground.attr('text/font-weight',"bold");
      }else {
          currentBackground.attr('text/font-weight',"normal");
      }
    }

    ////console.log("done with select!");
  }

  <!-- ++++++++++++++++ NODE CREATION METHODS +++++++++++ -->
  var createBackgroundBox = function(x, y, widthValue, heightValue, fillValue) {
      var cell = new rect({
        position: { x: x, y: y },
        size: { width: widthValue, height: heightValue},
        attrs: {
          rect: { fill: fillValue}

          }
      });
      graph.addCell(cell);
      return cell;
  };

  /**
  Clones the cell provided at the position provided
  */
  function cloneCellAt(cell, x, y){
      var clonedCell = cell.clone();
      clonedCell.prop("position", {"x":x,"y":y});
      if(clonedCell.attr("image/width")){
        clonedCell.attr("image/magnet","true");
      }else{
        clonedCell.attr("text/magnet","true");
      }
      clonedCell.attr('text/font-weight',"normal");
      graph.addCell(clonedCell);
      clonedCell.toFront();
      return clonedCell;
  }

  /**
  Download a JSON file with the contents specifed by the parameter 'jsonContent'
  @param {string} jsonContent - Contents of the file to be downloaded
  */
  function downloadJSON(jsonContent){

    var blob = null,
        objectUrl = null,
        dataUrl = null,
        filename = "diagram.json";


    if(window.Blob){
      // use Blob if available
      blob = new Blob([jsonContent], {type: 'text/xml'});
      objectUrl = window.URL.createObjectURL(blob);
    }
    else {
      // else use dataURI
      dataUrl = 'data:text/csv;charset=UTF-8,' + encodeURIComponent(jsonContent);
    }

    if (navigator.msSaveBlob) { // IE11+ : (has Blob, but not a[download])
      navigator.msSaveBlob(blob, filename);
    } else if (navigator.msSaveOrOpenBlob) { // IE10+ : (has Blob, but not a[download])
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      // A-download
      var anchor = document.createElement('a');
      anchor.setAttribute('href', (window.Blob) ? objectUrl : dataUrl);
      anchor.setAttribute('download', filename || 'graph.' + extension);

      // Firefox requires the link to be added to the DOM before it can be clicked.
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }

    if (objectUrl) {
      setTimeout(function() { // Firefox needs a timeout
        window.URL.revokeObjectURL(objectUrl);
      }, 0);
    }

  }

  /**
  Method called when the body is loaded
  */
  function onBodyLoad(){
    //console.log("onBodyLoad");
    loadThemesJSON();
    loadConfigJSON();
    initializeJoint();    
  }
  /**
  Zooms in on the paper by increasing its scale value
  */
  function zoomIn(){
      paperScale += (paperScale * paperScaleFactor);
      paper.scale(paperScale, paperScale);
      paper.setDimensions(paperInitialWidth*paperScale, paperInitialHeight*paperScale);
  }
  /**
  Zooms out on the paper by decreasing its scale value
  */
  function zoomOut(){
    paperScale -= (paperScale * paperScaleFactor);
    paper.scale(paperScale, paperScale);
    paper.setDimensions(paperInitialWidth*paperScale, paperInitialHeight*paperScale);
  }
  /**
  Resets the scale to the initial value
  */
  function resetZoom(){
    paperScale = initialPaperScale;
    paper.scale(paperScale, paperScale);
    paper.setDimensions(paperInitialWidth*paperScale, paperInitialHeight*paperScale);
  }


  /**
  Provides the default link type used when the user creates new links
  */
  function getDefaultLink(){
    ////console.log("getDefaultLink");
    if(selectedLinkTypeCell){
      ////console.log("true");
      var tempLink = selectedLinkTypeCell.clone();
      tempLink.label(0,{ attrs: { text: { 'font-weight': 'normal', 'font-size': 10  } } });
      return tempLink;
    }else{
      ////console.log("false");
      return new joint.dia.Link();
    }

  }


  /**
  Makes all the links of the diagram interactive/passive according to the value
  of the parameter 'flag'
  @param {boolean} flag - Flag indicating whether diagram links should become either
  interactive or passive
  */
  function makeLinksInteractive(flag){

    //console.log("makeLinksInteractive")

    var links = graph.getLinks();

    if(!flag){
      $('.link-tools .tool-remove').css({"display":"none"});
      $('.link-tools .tool-options').css({"display":"none"});
    }else{
      $('.link-tools .tool-remove').css({"display":""});
      $('.link-tools .tool-options').css({"display":""});
    }

    //making links not editable
    for(var i=0; i<links.length;i++){
      var currentLink = links[i];
      var currentView = currentLink.findView(paper);

      //console.log("currentView",currentView);

      if(!flag){
        currentView.options.interactive = false;
      }else{
        currentView.options.interactive = true;
      }
    }
  }

  /**
  Makes all the nodes of the diagram interactive/passive according to the value
  of the parameter 'flag'
  @param {boolean} flag - Flag indicating whether diagram nodes should become either
  interactive or passive
  */
  function makeElementsInteractive(flag){

    //console.log("makeElementsInteractive");

    var nodes = graph.getElements();

    for(var i=0; i<nodes.length;i++){
      var currentNode = nodes[i];
      var currentView = currentNode.findView(paper);
      //console.log("currentNode", currentNode);
      //console.log("currentView", currentView);
      if(currentNode != backgroundBox && currentNode != currentBackgroundCell){
        if( !flag ){
          currentView.options.interactive = false;
          currentNode.attr("image/magnet","");
        }else{
          currentNode.attr("image/magnet","true");
          currentView.options.interactive = true;
        }
      }
    }
  }

  /**
  Checks whether the link that is attempted to be created is valid or not
  */
  function isLinkInvalid(link){
    var linkToBackgroundBox = link.prop('target/id') == backgroundBox.id;
    var linkToBackground = false;
    if(currentBackgroundCell){
      linkToBackground = link.prop('target/id') == currentBackgroundCell.id;
    }
    return (!link.prop('source/id') || !link.prop('target/id') || linkToBackgroundBox || linkToBackground);
  }

  /**
  Rotates the currently selected node to the right
  The number of degrees used for the rotation are those specified by the var [rotateCellFactor]
  */
  function rotateCellToTheRight(){
     ////console.log("rotateCellToTheRight");
     if(!readOnlyMode){
      if(selectedNode){

       var currentDegreesSt = selectedNode.model.attr("image/transform");
       var currentDegrees = 0;

       if(currentDegreesSt){
         currentDegrees = parseFloat(currentDegreesSt.split("(")[1].split(")")[0]);
       }
       var newDegrees = currentDegrees - rotateCellFactor;
       var rotationCenterPointX = selectedNode.model.attr("image/width")/2;
       var rotationCenterPointY = selectedNode.model.attr("image/height")/2;
       selectedNode.model.attr("image/transform","rotate("+newDegrees+","
            + rotationCenterPointX + "," + rotationCenterPointY + ")");
      }
     }
     
  }

  /**
  Rotates the currently selected node to the left
  The number of degrees used for the rotation are those specified by the var [rotateCellFactor] (transformed to negative)
  */
  function rotateCellToTheLeft(){
    ////console.log("rotateCellToTheLeft");

    if(selectedNode){
      if(!readOnlyMode){
        var currentDegreesSt = selectedNode.model.attr("image/transform");
        var currentDegrees = 0;

        if(currentDegreesSt){
          currentDegrees = parseFloat(currentDegreesSt.split("(")[1].split(")")[0]);
        }
        var newDegrees = currentDegrees + rotateCellFactor;
        var rotationCenterPointX = selectedNode.model.attr("image/width")/2;
        var rotationCenterPointY = selectedNode.model.attr("image/height")/2;
        selectedNode.model.attr("image/transform","rotate("+newDegrees+","
             + rotationCenterPointX + "," + rotationCenterPointY + ")");
      }      
    }
  }

  /**
  Brings the selected node to the front
  */
  function bringSelectedNodeToFront(){
    if(selectedNode){
      if(!readOnlyMode){
        if(selectionRectCell){
          selectionRectCell.toFront();
        }
        selectedNode.model.toFront();
      }      
    }
  }

  /**
  Brings the selected node to the back
  */
  function bringSelectedNodeToBack(){
    if(selectedNode){
      if(!readOnlyMode){
        selectedNode.model.toBack();
        if(selectionRectCell){
          selectionRectCell.toBack();
        }
        if(currentBackgroundCell){
          currentBackgroundCell.toBack();
        }
        backgroundBox.toBack();
        paper.render();
      }      
    }
  }

  /**
  Updates the dimensions of the paper according to the values currently held by
  the paper dimensions text inputs
  */
  function updatePaperDimensionsBasedOnTextInputs(){
    //---update dimension values on text inputs
    var tempWidth = $('#inputWidth').prop('value');
    var tempHeight = $('#inputHeight').prop('value');
    paperInitialWidth = tempWidth;
    paperInitialHeight = tempHeight;
    updatePaperDimensions(tempWidth, tempHeight);
  }

  /**
  Updates the dimensions of the paper according to the values passed as
  parameters
  */
  function updatePaperDimensions(tempWidth, tempHeight){
    ////console.log("updatePaperDimensions");
    paper.setDimensions(tempWidth,tempHeight);
    updateBackgroundBoxDimensions(tempWidth, tempHeight);
    paper.render();
  }

  /**
  Updates the dimensions of the background box according to the values passed as
  parameters
  */
  function updateBackgroundBoxDimensions(widthValue, heightValue){
      backgroundBox.prop("size", {"width":widthValue,"height":heightValue});
  }

  /**
  This method is called when the user clicks either in the background box or
  the background of the diagram.
  It emulates the logic that would otherwise be associated to blank:pointer_down events
  */
  function onStageDown(evt, x, y){
    ////console.log("onStageDown");

    pointerDownClientX = evt.clientX;
    pointerDownClientY = evt.clientY;

    lastPositionMouseX = pointerDownClientX;
    lastPositionMouseY = pointerDownClientY;

    if(readOnlyMode){
      paperIsPanning = true;
    }
  }

  /**
  This method is called when the user clicks either in the background box or
  the background of the diagram.
  It emulates the logic that would otherwise be associated to blank:click events
  */
  function onBackgroundOrBackgroundBoxClick(evt, x, y){
    ////console.log("onBackgroundOrBackgroundBoxClick");
    if(selectedNode){
        selectNodeCell(selectedNode, false);
    }
    if(!readOnlyMode){
      if(!selectedNodeTypeCell){
        alert("Please select a node type first");
        openDialogSelectNodeType();
      }else{
        var newCell = cloneCellAt(selectedNodeTypeCell,x,y);
        selectNodeCell(newCell.findView(paper), true);
      }
    }else{
       paperIsPanning = true;
    }
  }

  /**
  Updates the paper dimensions text inputs so that they reflect the values
  passed as parameter
  */
  function updatePaperDimensionsTextInputs(width, height){
    $('#inputWidth').prop('value',width);
    $('#inputHeight').prop('value',height);
  }


  function onSetBackgroundButtonClick(){
    if(!readOnlyMode){
      $('#background_dialog').modal({
         show: true
     });
    }    
  }

  /**
  Handler for clicks on metadata button
  */
  function onShowMetadataButtonClick(){
    if(!selectedNode && !selectedLink){
      alert("Please select a cell");
    }else{
      if(selectedNode){
        loadSelectedNodeMetadataIntoDialog();
      }else if(selectedLink){
        loadSelectedLinkMetadataIntoDialog();
      }
      
      $('#metadata_dialog').modal({
        show: true
      })
    }
  }

  /**
  Creates an alpaca form and loads into it the metadata information for the currently
  selected node.
  */
  function loadSelectedNodeMetadataIntoDialog(){
    if(selectedNode){

      var tempNodeType = selectedNode.model.prop("node_type");
      if(!tempNodeType){
        tempNodeType = selectedNode.model.attr("node_type");
      }

      var jsonForselectedNode = typeDefinitionsJSON.nodes[tempNodeType];
      //console.log("jsonForselectedNode",jsonForselectedNode);

      //cleaning previous form fields..
      var divContents = document.getElementById("metadata_form").childNodes;
      for(var i=0; i<divContents.length; i++){
        divContents[i].remove();
      }

      var schema = jsonForselectedNode.schema;
      var form = jsonForselectedNode.form;
      var data = selectedNode.model.prop("data");


      alpacaMetadataForm = $("#metadata_form").alpaca({
      "schema":schema,
      "data":data,
      "postRender": function(control) {
              alpacaMetadataFormControl = control;
              if(readOnlyMode){
                alpacaMetadataFormControl.disable();
              }
          }
      });

    }
  }

  /**
  Creates an alpaca form and loads into it the metadata information for the currently
  selected link.
  */
  function loadSelectedLinkMetadataIntoDialog(){
    //console.log("loadSelectedLinkMetadataIntoDialog")
    if(selectedLink){

      var tempLinkType = selectedLink.model.prop("link_type");
      //console.log("tempLinkType (before)",tempLinkType);
      if(!tempLinkType){
        tempLinkType = selectedLink.model.attr("link_type");
      }

      //console.log("tempLinkType (after)",tempLinkType);


      var jsonForselectedLink = typeDefinitionsJSON.links[tempLinkType];

      //console.log("jsonForselectedLink",jsonForselectedLink);

      //cleaning previous form fields..
      var divContents = document.getElementById("metadata_form").childNodes;
      for(var i=0; i<divContents.length; i++){
        divContents[i].remove();
      }

      var schema,form,data;
      if(jsonForselectedLink){
        schema = jsonForselectedLink.schema;
        form = jsonForselectedLink.form;
      }
      data = selectedLink.model.prop("data");

      //console.log("data",data);
      //console.log("schema",schema);
      //console.log("form",form);

      alpacaMetadataForm = $("#metadata_form").alpaca({
      "schema":schema,
      "data":data,
      "postRender": function(control) {
              alpacaMetadataFormControl = control;
              if(readOnlyMode){
                alpacaMetadataFormControl.disable();
              }
          }
      });

    }
  }

  /**
  Adds the selected background to the diagram
  */
  function setSelectedBackground(){
    $('#background_dialog').modal('hide');

    if(currentBackgroundCell){
      ////console.log("There already was a background for this diagram...");
      if(currentBackgroundCell.id != selectedBackgroundCell.id){
        ////console.log("The background selected is different from the current one");
        currentBackgroundCell.remove();
      }
    }
    ////console.log("let's create the new background cell!");

    var newBackgroundCell = selectedBackgroundCell.clone();
    var realSize = newBackgroundCell.prop("real_size");
    var realWidth = realSize.width;
    var realHeight = realSize.height;
    //var nodeType = newBackgroundCell.attr("node_type");
    ////console.log(realWidth, realHeight, realSize, nodeType);

    newBackgroundCell.prop("size", {"width":realWidth,"height":realHeight});
    newBackgroundCell.prop("position", {"x":0,"y":0});
    newBackgroundCell.attr("image/magnet","");
    newBackgroundCell.attr("image/width", realWidth);
    newBackgroundCell.attr("image/height", realHeight);
    newBackgroundCell.attr('text/font-weight',"normal");

    graph.addCell(newBackgroundCell);
    newBackgroundCell.toBack();
    backgroundBox.toBack();
    ////console.log(newBackgroundCell);
    currentBackgroundCell = newBackgroundCell;
    currentBackgroundCell.findView(paper).options.interactive = false;
    paper.render();
    ////console.log("done!");

  }

  /**
  Modifies any or both of the properties: width, height from the paper so that it
  fits to its contents.
  Applying this method can result both on either shrinking or expanding the paper.
  */
  function fitPaperToContents(){
    //first the background box is removed so that it does not influence the calculation
    //of the bbox
    backgroundBox.remove();
    paper.render();
    var bbox = paper.getContentBBox();
    ////console.log(bbox);
    var tempWidth = bbox.width + bbox.x;
    var tempHeight = bbox.height + bbox.y;
    ////console.log(tempWidth, tempHeight);
    $('#inputWidth').prop('value', tempWidth);
    $('#inputHeight').prop('value', tempHeight);
    paperInitialWidth = tempWidth;
    paperInitialHeight = tempHeight;
    updatePaperDimensions(paperInitialWidth, paperInitialHeight);
    initializeBackgroundBox(paperInitialWidth,paperInitialHeight);
  }

  /**
  Saves the current values of metadata for the selected node on the model.
  */
  function saveMetadataChanges(){
    $('#metadata_dialog').modal('hide');
    if(selectedNode){
      selectedNode.model.prop("data",alpacaMetadataFormControl.getValue());
    }else if(selectedLink){
      selectedLink.model.prop("data",alpacaMetadataFormControl.getValue());
    }
    
    ////console.log("saveMetadataChanges", selectedNode.model);
  }

  /**
  This is an utility method that deletes the 'previous' background box when imported
  a diagram JSON file.
  The method identifies such cell by means of the property "background_box" (true for
  the exported background box)
  */
  function deletePreviousBackgroundBox(){
    ////console.log("deletePreviousBackgroundBox");
    var nodes = graph.getElements();
    for(var i=0; i<nodes.length;i++){
      var currentNode = nodes[i];
      ////console.log("currentNode.background_box: " + currentNode.prop("background_box"));
      if( currentNode.prop("background_box") == "true"){
        ////console.log("remove previous background cell!! :D");
        currentNode.remove();
      }
    }
  }

  /**
  Updates the selected node label to the value specified by newLabel
  @param {string} newLabel - New label value that will be applied to the selected
  node
  */
  function renameSelectedNode(newLabel){
    selectedNode.model.attr("text/text",addNewLinesToTextWhenNeeded(newLabel, nodeLabelMaxLength));
  }

  /**
  Updates the selected link label to the value specified by newLabel
  @param {string} newLabel - New label value that will be applied to the selected
  node
  */
  function renameSelectedLink(newLabel){
    var tempText = addNewLinesToTextWhenNeeded(newLabel, linkLabelMaxLength);
    selectedLink.model.label(0,{ position: .5, attrs: { text: { text: tempText } } });    
  }

  /**
  Handler for clicks on the dialog button to apply the new label for the selected
  node
  */
  function applyRenameCell(){
    ////console.log("applyRenameCell");
    $('#rename_cell_dialog').modal('hide');
    if(selectedNode){
      renameSelectedNode(document.getElementById("inputCellName").value);
    }else if(selectedLink){
      renameSelectedLink(document.getElementById("inputCellName").value);
    }
    
  }

  /**
  Listener for clicks on 'Rename label' button.
  Shows the modal dialog where the label of a node can be modified
  */
  function onrenameCellButtonClick(){
    if(!readOnlyMode){
      if(!selectedNode && !selectedLink){
        alert("Please select a node or link");
      }else{

        $('#rename_cell_dialog').modal({
          show: true
        });
        var currentLabel;
        if(selectedNode){
          currentLabel = selectedNode.model.attr("text/text");
        }else if(selectedLink){
          var currentLabelObj = selectedLink.model.label(0);        
          //console.log("currentLabelObj",currentLabelObj);
          if(!currentLabelObj){
            currentLabel = "";
          }else{
            currentLabel = currentLabelObj.model.attr("text/text");
          }
            
          //console.log("currentLabel", currentLabel);
          
        }
         
        ////console.log("currentLabel", currentLabel);
        document.getElementById("inputCellName").value = currentLabel;
      }
    }    
  }

  /**
  Opens the modal dialog where the current node type can be selected
  */
  function openDialogSelectNodeType(){
    $('#node_types_dialog').modal({
         show: true
     });
  }
  /**
  Opens the modal dialog where the current link type can be selected
  */
  function openDialogselectLinkTypeType(){
    $('#link_types_dialog').modal({
         show: true
     });
  }

  function setSelectedNodeType(){
    $('#node_types_dialog').modal('hide');
    ////console.log("thumbnail prop:",selectedNodeTypeCell.prop("thumbnail"));
    $('#currentNodeTypeIcon').remove();
    $('#currentNodeTypeImage').attr("src",selectedNodeTypeCell.prop("thumbnail"));
    ////console.log("done!");
  }

  function setSelectedLinkType(){
    $('#link_types_dialog').modal('hide');
  }

  /**
  Initializes/creates the selection rect cell that is used to visually identify
  the node that is currently selected
  */
  function initializeSelectionRect(){

    ////console.log("initializeSelectionRect");

    if(selectedNode){

      //console.log("selectedNode = true");

      if(!selectionRectCell){

        var tempPosition = getPositionForSelectionRect();
        tempPosition.x -= 2;
        tempPosition.y -= 2;
        var tempSize = getSizeForSelectionRect();

        ////console.log("selectedNode",selectedNode.model);
        ////console.log("tempPosition", tempPosition);
        ////console.log("tempSize", tempSize);

        selectionRectCell = new rect({
            position: tempPosition,
            size: tempSize,
            attrs: {
                rect: { rx: 2, ry: 2, stroke: '#000000', 'stroke-width': 1, 'stroke-dasharray':"5,5" }
            }
        });
        ////console.log(selectionRectCell);
        graph.addCell(selectionRectCell);
        selectionRectCell.toBack();
        if(currentBackgroundCell){
          currentBackgroundCell.toBack();
        }
        backgroundBox.toBack();

      }else{
        updateSelectionRectPosition();
        selectionRectCell.prop("size", getSizeForSelectionRect());
      }
    }
  }

  /**
  Updates the selection rect position so that it stays together with the node
  that is currently selected
  */
  function updateSelectionRectPosition(){
    ////console.log("updateSelectionRectPosition");
    var positionForSelectionRect = getPositionForSelectionRect();
    ////console.log("positionForSelectionRect",positionForSelectionRect);
    selectionRectCell.prop("position", positionForSelectionRect);
  }

  /**
  Returns the position of the currently selected cell so that it can be used to
  properly position the selection rect
  */
  function getPositionForSelectionRect(){
    ////console.log("getPositionForSelectionRect");
    var tempPosition = selectedNode.model.prop('position');
    var newPosition = {x: tempPosition.x, y: tempPosition.y};
    return newPosition;
  }
  /**
  Calculates the size of the selection rect so that it propertly fits the node
  that is currently selected
  */
  function getSizeForSelectionRect(){
    ////console.log("getSizeForSelectionRect");
    var tempSize = selectedNode.model.prop('size');
    var newSize = {width: tempSize.width + 4, height: tempSize.height + 4};
    return newSize;
  }

  /**
  Loads the JSON file holding all the configuration values
  */
  function loadConfigJSON(){
    console.log("loadConfigJSON");
    var configJsonPath = "data/" + location.search.substr(1);
    console.log("configJsonPath",configJsonPath);
    $.getJSON(configJsonPath, function(json) {
        nodeLabelMaxLength = json.node_label_max_length;
        linkLabelMaxLength = json.link_label_max_length;
        linkDefaultFontSize = json.link_labels_default_font_size;

        paperDefaultSize = json.paper_defaul_size;
        //console.log("paperDefaultSize",paperDefaultSize);
        updatePaperDimensions(paperDefaultSize.width, paperDefaultSize.height);
        updatePaperDimensionsTextInputs(paperDefaultSize.width, paperDefaultSize.height);
        ////console.log(nodeLabelMaxLength);

        launchInReadOnlyMode = json.launch_in_read_only_mode;
        console.log("launchInReadOnlyMode",launchInReadOnlyMode);
        if(launchInReadOnlyMode == "true"){
          console.log("launchInReadOnlyMode")
          applyReadOnlyMode(true);

          //----removing elements that won't be used-----
          removeButtonsNotNeededInReadOnlyMode();
        }else{
          populateThemesList(json.themes);
        }
    });
  }

  function loadThemesJSON(){
    console.log("loadThemesJSON");
    $.getJSON(themesFileURL, function(json) {
      console.log("inside getJSON call!")
      themesJSON = json;
      console.log("themesJSON",themesJSON);
    });
  }

  function loadTheme(jsonThemeName){
    console.log("loadTheme");
    console.log("jsonThemeName",jsonThemeName);
    var jsonTheme = themesJSON[jsonThemeName];    
    console.log("jsonTheme",jsonTheme);
    currentTheme = jsonTheme;
    var typeDefinitionsURL = jsonTheme.type_definitions;
    console.log("typeDefinitionsURL",typeDefinitionsURL);
    loadTypeDefinitions(typeDefinitionsURL);
  }

  function populateThemesList(themesJSON){
    console.log("populateThemesList");
    //console.log("themesJSON",themesJSON);
    var setOfThemes = themesJSON.set;
    defaultTheme = themesJSON.default;
    loadTheme(defaultTheme);
    //console.log("setOfThemes",setOfThemes);
    //console.log("defaultTheme",defaultTheme);
    var themesDropDownMenu = document.getElementById("themesDropDownMenu");

    for(var i=0;i<setOfThemes.length;i++){

      var currentThemeSt = setOfThemes[i];
      var tempListItem = document.createElement("li");
      tempListItem.setAttribute("role","button");
      var tempAnchor = document.createElement("a");
      tempAnchor.appendChild(document.createTextNode(currentThemeSt));
      tempListItem.appendChild(tempAnchor);
      themesDropDownMenu.appendChild(tempListItem);

    }

  }

  function removeButtonsNotNeededInReadOnlyMode(){
    $("#lockDiagramCheckBox").prop("checked",true);
    $("#lockDiagramCheckBoxListItem").remove();
    $('#rotateRightButton').remove();
    $('#rotateLeftButton').remove();
    $('#bringToBackButton').remove();
    $('#bringToFrontButton').remove();
    $('#setBackgroundButton').remove();
    $('#deleteCellButton').remove();
    $('#fitPaperToContentsButton').remove();
    $('#selectNodeTypeButton').remove();
    $('#selectLinkTypeButton').remove();
    $('#modifyLinksOnClickCheckBoxListItem').remove();
    $('#renameCellButton').remove();
    $('#paperDimensionsListItem').remove();
    $('#themesListItem').remove();
  }

  /**
  This function adds new lines to the text provided according to the maximum line
  length passed as a parameter
  @param {string} textSt - Text to be modified when needed by adding new lines
  @param {string} maxLineLength - Maximum number of characters per line
  */
  function addNewLinesToTextWhenNeeded(textSt, maxLineLength){
    //console.log("addNewLinesToTextWhenNeeded");
    var lines = textSt.split('\n');
    var result = "";

    for(var i=0; i<lines.length; i++){
      var currentLine = lines[i];
      if(currentLine.length > maxLineLength){

        for(var j=0;j<(currentLine.length/maxLineLength);j++){
          var tempStart = j*maxLineLength;
          if(j<((currentLine.length/maxLineLength) -1)){
            //console.log("argh");
            result += currentLine.substr(tempStart, tempStart + maxLineLength) + '\n';
          }else{
            //console.log("buh!");
            result += currentLine.substr(tempStart, currentLine.length);
            result += '\n';
          }
        }

      }else{
        result += (currentLine + "\n");
      }
    }

    return result;
  }

  function deleteSelectedCell(){

    if(!readOnlyMode){
      if(selectedNode){
      
        graph.removeLinks(selectedNode.model);
        selectedNode.model.remove();
        selectedNode = null;
        if(selectionRectCell){
          selectionRectCell.remove();
          selectionRectCell = null;
        }
      }else if(selectedLink){
        selectedLink.model.remove();
        selectedLink = null;
      }
      paper.render();
    }
    
  }

  function takeSnapshot(){
    //console.log("takeSnapshot");
    window.print();
  }

  function applyReadOnlyMode(flag){
    console.log("applyReadOnlyMode");
    var saveChangesMetadataButton = document.getElementById('saveMetadataChangesButton');
    if(flag){
      readOnlyMode = true;
      if(alpacaMetadataFormControl){
        alpacaMetadataFormControl.enable();
      }
      if(saveChangesMetadataButton){
        saveChangesMetadataButton.style.visibility = 'hidden';
      }
    }else{
      readOnlyMode = false;
      if(alpacaMetadataFormControl){
        alpacaMetadataFormControl.disable();
      }
      if(saveChangesMetadataButton){
        saveChangesMetadataButton.style.visibility = 'visible';
      }
    }

    makeLinksInteractive(!readOnlyMode);
    makeElementsInteractive(!readOnlyMode);

    paper.render();
  }

