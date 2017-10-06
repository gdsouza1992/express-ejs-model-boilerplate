var selectedShape,
    map,
    heatmap;
var heatMapData = [];
var savedPolygons = [];
var currentGrid = null;
var showfullHeatMap = true;
var all_overlays = [];
var latSpacing = 0.05;
var lngSpacing = 0.05;
var polygonSavedData;


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 42.343, lng: -71.073},
            zoom: 11
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
            onCompletePolygon(e);
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

function initHeatMap(newheatMapData){
    if(heatmap && showfullHeatMap){
        heatmap.setMap(null);
    }

    var filterednewheatMapData = newheatMapData.filter((obj) => {
    	if(obj){
    		if(obj.weight == 0){
    			return false;
    		}
    		return true;
    	}else {
    		return false;
    	}
    });
    heatMapData = heatMapData.concat(filterednewheatMapData);
    if(showfullHeatMap){
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatMapData,
            radius: 15
        });
        heatmap.setMap(map);
    }
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
        heatmap.setData(heatMapData);
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

        console.log(mapState);
        saveDataForPolygon(mapState);
    }
}

function getGridForBounds(bounds){
    var NELat = bounds.getNorthEast().lat();
    var NELng = bounds.getNorthEast().lng();
    var SWLat = bounds.getSouthWest().lat();
    var SWLng = bounds.getSouthWest().lng();
    var spacingLat = latSpacing;
    var spacingLng = lngSpacing;
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

function filterGridWithPolygon(heatMapData, polygon){
    var filteredGrid = heatMapData.filter(function(point){
        return google.maps.geometry.poly.containsLocation(point.location, polygon.overlay)
    });
    return filteredGrid;
}

function onCompletePolygon(polygon){
    var filteredGrid = filterGridWithPolygon(heatMapData, polygon);
    heatmap.setData(filteredGrid);
    showfullHeatMap = false;
}

function googleLatLng2Json(latLonData){
    return latLonData.map(function(latLgn){
        return({
            'lat':parseFloat(latLgn.lat().toFixed(3)),
            'lng':parseFloat(latLgn.lng().toFixed(3))
        })
    });
}

function jsonLatLng2Google(latLonData){
    if(!latLonData)
        return null;

    return latLonData.map((dataPoints) => {
        if(dataPoints !== null)
        	return ({
        		"location": new google.maps.LatLng(dataPoints.lat, dataPoints.lng),
        		"weight": dataPoints.medianIncome
        	})
    })
}

function onGetGridDataSucess(data){
    if(typeof data.error != 'undefined'){
        alert("Area of interest too large.");
        return;
    }

    var newheatMapData = jsonLatLng2Google(data);
    if(newheatMapData){
        console.log("Got Data from server");

        initHeatMap(newheatMapData);

    }
}

function onGetPolygonsData(data){
    console.log(data);
}

function loadPreviousMap(buttonClicked){
    var mapId = $(buttonClicked.target).data('mapid')
    //Get the map with the selected id
    var mapToLoad = savedPolygons.filter((polygon) => {
    	return polygon._id == mapId.toString() ? true : false
    })[0];

    deleteAllShape();
    map.setCenter(new google.maps.LatLng(mapToLoad.mapLat, mapToLoad.mapLng));
    map.setZoom(mapToLoad.zoom);
    // Construct the polygon.
    if(typeof polygonToDraw != 'undefined'){
        polygonToDraw.setMap(null);
    }
    polygonToDraw = new google.maps.Polygon({
      paths: mapToLoad.polygon,
      strokeColor: '#000000',
      strokeWeight: 2,
      fillOpacity: 0.0
    });

    polygonToDraw.setMap(map);

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

function onSavePolygonSucess(){
    onGetAllSavedPolygonsSucess([polygonSavedData]);
}

function saveDataForPolygon(polygonMapState){
    polygonSavedData = polygonMapState;
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
    grid = getGridForBounds(map.getBounds());
    jsonLatLon = googleLatLng2Json(grid);
    currentGrid = jsonLatLon;
    getDataForGrid(jsonLatLon);
}



$(document).ready(function(){
    getAllSavedPolygons();
    $('#userPolygons').on('click', 'button', function(e){
        loadPreviousMap(e);
    })

    $('#lat-spacing').text(latSpacing.toString());
    $('#lng-spacing').text(lngSpacing.toString());

});
