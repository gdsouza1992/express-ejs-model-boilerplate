var selectedShape;
all_overlays = [];

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -34.397, lng: 150.644},
            zoom: 8
          });

          var drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.MARKER,
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: ['polygon']
            },
            polygonOptions:{
                editable: true
            }
          });
      drawingManager.setMap(map);

      google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
            definePolygonRegion(e);
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


      google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
      google.maps.event.addListener(map, 'click', clearSelection);
      google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', deleteSelectedShape);

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

function getPolygonBounds(polygon){
    var bounds = new google.maps.LatLngBounds();
    polygon.overlay.getPath().forEach(function(element,index){ bounds.extend(element); });

}
