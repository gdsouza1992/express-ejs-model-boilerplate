var selectedShape;
var map, heatmap;
var savedPolygons = [];
var currentGrid = null;
all_overlays = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 37.775, lng: -122.434},
            zoom: 15
        });

          var drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: ['polygon']
            },
            polygonOptions:{
                fillOpacity: 0.0,
                editable: true
            }
          });
      drawingManager.setMap(map);

      google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
            getPolygonBounds(e);
            all_overlays.push(e);
            if (e.type != google.maps.drawing.OverlayType.MARKER) {
            // Switch back to non-drawing mode after drawing a shape.
            drawingManager.setDrawingMode(null);
            // Add an event listener that selects the newly-drawn shape when the user
            // mouses down on it.
            var newShape = e.overlay;
            newShape.type = e.type;
            google.maps.event.addListener(newShape, 'click', function() {
              setSelection(newShape);
            });
            setSelection(newShape);
          }
        });



      google.maps.event.addListener(map, 'tilesloaded', newTilesLoaded);
      google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
      google.maps.event.addListener(map, 'click', clearSelection);
      google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', deleteSelectedShape);
      google.maps.event.addDomListener(document.getElementById('save-button'), 'click', saveSelectedShape);
      google.maps.event.addDomListener(document.getElementById('toggle-heatmap-button'), 'click', toggleHeatmap);

}

function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}


function initHeatMap(heatMapData){
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatMapData,
        radius: 15
    });
    heatmap.setMap(map);
}

function clearSelection() {
  if (selectedShape) {
    selectedShape.setEditable(false);
    selectedShape = null;
  }
}

function setSelection(shape) {
  console.log("Shape selected");
  clearSelection();
  selectedShape = shape;
  shape.setEditable(true);
  // selectColor(shape.get('fillColor') || shape.get('strokeColor'));
}

function deleteAllShape() {
    for (var i=0; i < all_overlays.length; i++){
        all_overlays[i].overlay.setMap(null);
    }
    all_overlays = [];
}


function deleteSelectedShape() {
    if (selectedShape) {
        selectedShape.setMap(null);
    }
}

function saveSelectedShape() {
    if(selectedShape){
        var vertices = selectedShape.getPath();
        var latLgnVertices = [];

        for (var i = 0; i < vertices.getLength(); i++) {
                latLgnVertices.push({
                    "lat": vertices.getAt(i).lat(),
                    "lng": vertices.getAt(i).lng()
                })
        }

        var mapState = {
        	"zoom": map.zoom,
        	"mapLat" : map.center.lat(),
        	"mapLng": map.center.lng(),
            "polygon": latLgnVertices
        }

        // var polygonMapState = {
        //     mapState,
        //     latLgnVertices
        // }
        console.log(mapState);
        saveDataForPolygon(mapState);
    }
}


function getGridForBounds(bounds){
    var NELat = bounds.getNorthEast().lat();
    var NELng = bounds.getNorthEast().lng();
    var SWLat = bounds.getSouthWest().lat();
    var SWLng = bounds.getSouthWest().lng();
    var spacingLat = 0.005;
    var spacingLng = 0.005;
    var minLat = Math.min(NELat,SWLat);
    var maxLat = Math.max(NELat,SWLat);

    var minLng = Math.min(NELng,SWLng);
    var maxLng = Math.max(NELng,SWLng);


    var grid = [];
    for(var i = minLat ; i < maxLat ; i += spacingLat){
    	for(var j = minLng; j < maxLng ; j += spacingLng ){
            grid.push(new google.maps.LatLng(i, j))
    	}
    }

    return grid;
}

function filterGridWithPolygon(grid, polygon){
    var filteredGrid = grid.filter(function(point){
      return google.maps.geometry.poly.containsLocation(point, polygon.overlay)
    });
    return filteredGrid;
}

function getPolygonBounds(polygon){
    var bounds = new google.maps.LatLngBounds();
    polygon.overlay.getPath().forEach(function(element,index){ bounds.extend(element); });
    var grid = getGridForBounds(bounds);
    var filteredGrid = filterGridWithPolygon(grid, polygon);
    var jsonLatLon = googleLatLng2Json(filteredGrid);
    getDataForGrid(jsonLatLon)
}

function googleLatLng2Json(latLonData){
    return latLonData.map(function(latLgn){
        return({
            'lat':latLgn.lat(),
            'lng':latLgn.lng()
        })
    });
}

function jsonLatLng2Google(latLonData){
    return latLonData.map((dataPoints) => {
    	return ({
    		"location": new google.maps.LatLng(dataPoints.lat, dataPoints.lng),
    		"weight": dataPoints.medianIncome
    	})
    })
}

function onGetGridDataSucess(data){
    var heatMapData = jsonLatLng2Google(data);
    console.log("Got Data from server");
    initHeatMap(heatMapData);
}

function onGetPolygonsData(data){
    console.log(data);
}

function loadPreviousMap(buttonClicked){
    var mapId = $(buttonClicked.target).data('mapid')
    //Get the map with the selected id
    var mapToLoad = savedPolygons.filter((polygon) => {
    	return polygon._id == mapId.toString() ? true : false
    })[0]
    console.log(mapToLoad);
}

function onGetAllSavedPolygonsSucess(data){
    var list = $("#userPolygons");
    savedPolygons = data;
    data.map((polygonMapState) => {
        list.append(`
            <li>
                <div>
                    <p>Location</p>
                    <ul>
                        <li>Latitude : ${polygonMapState.mapLat}</li>
                        <li>Longitude : ${polygonMapState.mapLng}</li>
                    </ul>
                    <p>Zoom: ${polygonMapState.zoom}</p>
                </div>
                <button data-mapId=${polygonMapState._id}>Load this map</button>
            </li>
        `);

        // $(`#loadMapBtn-${polygonMapState._id}`).onclick = loadPreviousMap(polygonMapState._id);
    })
}

function getDataForGrid(grid){
    $.ajax({
        type: "POST",
        data :JSON.stringify(grid),
        url: "api/getData",
        contentType: "application/json",
        success: function(result){
            onGetGridDataSucess(result);
        }
    });
}


function saveDataForPolygon(polygonMapState){
    $.ajax({
        type: "POST",
        data :JSON.stringify(polygonMapState),
        url: "api/savePolygon",
        contentType: "application/json",
        success: function(result){
            onSavePolygonSucess(result);
        }
    });
}


function getAllSavedPolygons(){
    $.ajax({
        type: "GET",
        url: "api/getPolygons",
        contentType: "application/json",
        success: function(result){
            onGetAllSavedPolygonsSucess(result);
        }
    });
}

function newTilesLoaded(){
    // console.log("New Tiles Loaded");
    var grid = getGridForBounds(map.getBounds());
    var jsonLatLon = googleLatLng2Json(grid);
    getDataForGrid(jsonLatLon);
}



$(document).ready(function(){
    getAllSavedPolygons();
    $('#userPolygons').on('click', 'button', function(e){
        loadPreviousMap(e);
    })

});
