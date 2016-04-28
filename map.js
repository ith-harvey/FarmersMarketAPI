$(function() {
    
 var marketId = [];
 var allLatlng = [];
 var allMarkers = [];
 var marketName = [];
 var infowindow = null;
 var pos;
 var userCords;
 var tempMarkerHolder = [];
    
    //start geolocation
    
    if (navigator.geolocation) {
        
        function error(err) {
            console.warn('ERROR(' + err.code + '): ' +err.message);
        }
        
        //on success we'll assign the coords to the userCords variable
        
        function success(pos){
            userCords = pos.coords;
            console.log("got the zip");
        }
        
        //Get the user's current position
        navigator.geolocation.getCurrentPosition(success, error);
        
    } else {
        alert('Geolocation is not supported in your browser');
    }
        

    //map options
    var mapOptions = {
        zoom: 5,
        center: new google.maps.LatLng(37.09024, -100.712891),
        panControl: false,
        panControlOptions: {
            position: google.maps.ControlPosition.BOTTOM_LEFT
    }, 
        zoomControl: true,
        zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.RIGHT_CENTER
    },          
    scaleControl: true,
        scaleControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER
        }
    
};
                  
//adding infowindow option
    infowindow = new google.maps.InfoWindow({
        content: "holding..."
});

//fire up google maps - pull ID map canvas
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    
    $('#chooseZip').submit(function () {
   
    //pull zip code value
    var userZip = $('#textZip').val();
    
    //declare variable
    var accessURL;
    
    if (userZip){
        accessURL = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + userZip;
        console.log('we have a zip code');
    } else {
        accessURL = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=" + userCords.latitude + "&lng=" + userCords.longitude;
        console.log('we do not have a zip');
    }

    
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: accessURL,
        dataType: 'jsonp',
        success: function (data) {
        
            $.each(data.results, function (i,val) {
        
            marketId.push(val.id);
            marketName.push(val.marketname);
    });
    
    //console.log(marketName);
    //console.log(marketId);
    
    var counter = 0;
    
    $.each(marketId, function (k, v){
        $.ajax ({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            //submit a get request to the restful service mktDetail.
            url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + v,
            dataType: 'jsonp',
            success: function (data) {
            
            //on success we'll grab all the results and break them apart
            for (var key in data) {
            
                var results = data[key];
            
                //The results contain a google maps link, but we just want the lat and lng to plot the points
                //console.log(results);
            
                var googleLink = results['GoogleLink'];
                var latLong = decodeURIComponent(googleLink.substring(googleLink.indexOf("=")+1, googleLink.lastIndexOf("(")));
            
                var split = latLong.split(',');
                var latitude = parseFloat(split[0]);
                var longitude = parseFloat(split[1]);
            
            
                //set the markers
                myLatlng = new google.maps.LatLng(latitude,longitude);
                //console.log(myLatlng);
                allMarkers = new google.maps.Marker ({
                    position: myLatlng,
                    map: map,
                    // title of the market when mousover
                    title: marketName[counter],
                    //styling of info window when clicked
                    html:
                    '<div class="markerPop">' + 
                    '<h1>' + marketName[counter].substring(4) + '</h1>' + //substring removes distance from title
                    '<h3>' + results['Address'] + '</h3>' +
                    '<p>' + results['Products'].split(';') + '</p>' +
                    '<p>' + results['Schedule'] + '</p>' +
                    '</div>' 
        });
          
        //put all lat long in array. Need this to create a viewport
        allLatlng.push(myLatlng); 
                
        tempMarkerHolder.push(allMarkers);
        
        counter++;
        
        };
           
           //using parameters set above, we're adding a click listener to the markers
        google.maps.event.addListener(allMarkers, 'click', function () {
            infowindow.setContent(this.html);
            infowindow.open(map, this);
    });
    
    //From the allLatlng array, we'll show the markers in a new viewpoint bound
    var bounds = new google.maps.LatLngBounds ();
    
    for (var i=0, LtLgLen = allLatlng.length; i < LtLgLen; i++) {
        
        // And increase the bounds to take this point
        bounds.extend (allLatlng[i]);
    }
    
    // Fit these bounds to the map
    map.fitBounds (bounds);
    
            }
        });
        
    });
    
    }    
    });     
    return false;
    });
    });  






