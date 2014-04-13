// Globals
var needToHowl = false;
var gpsLat;
var gpsLng;
var googleApiKey = 'AIzaSyAN-U-gEEPL0HzC4st2czQUc86jnnbN6fo';

// Cordova/PhoneGap:
var PushNotification;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        console.log('device ready event received');

        try 
        { 
            pushNotification = window.plugins.pushNotification;
            if (device.platform == 'android' || device.platform == 'Android') {
                console.log('registering android');
                pushNotification.register(app.successHandler, app.errorHandler, {"senderID":"1003367237948","ecb":"app.onNotificationGCM"});     // required!
            } else {
                console.log('registering ios');
                pushNotification.register(app.tokenHandler, app.errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"app.onNotificationAPN"});    // required!
            }
        }
        catch(err) 
        { 
            txt="There was an error on this page.\n\n"; 
            txt+="Error description: " + err.message + "\n\n"; 
            alert(txt); 
        } 
        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },

    successHandler: function(result) {
        console.log('GCM registered = '+result)
    },
    errorHandler:function(error) {
        alert('pushNotification register error: ' + error);
    },
    onNotificationGCM: function(e) {
        switch( e.event )
        {
            case 'registered':                
                if ( e.regid.length > 0 )
                {
                    console.log("Regid " + e.regid);
                    // should save the regid to the server via REST call here
                    // alert('registration id = '+e.regid);
                }
                break;

            case 'message':
                // this is the actual push notification. its format depends on the data model from the push server
                //alert('message = '+e.message+' msgcnt = '+e.msgcnt);
                /* navigator.notification.alert(
                    e.message,  // message
                    'Howl Received!',            // title
                    'Howl Received!'                  // buttonName
                ); */               
                /* navigator.notification.vibrate(2000); */
                needToHowl = true;
                gpsLat = parseFloat(e.lat);
                gpsLng = parseFloat(e.lng);
                $.mobile.changePage("courtView.html",{allowSamePageTransition:true,reloadPage:false,changeHash:true,transition:"slide"})

                break;

            case 'error':
                alert('GCM error = '+e.msg);
                break;

            default:
                alert('An unknown GCM event has occurred');
                break;
        }
    }
};

// jQuery/jQuery Mobile:
// jQuery Mobile framework configuration overides
$(document).bind("mobileinit", function () {
    $.mobile.allowCrossDomainPages = true;
    $.support.cors = true;
});

$(function () {
    // Setup persistent external toolbar
    $("[data-role='header']").toolbar();
});

// howl.html
$('#courtView').on('pageinit', function (event, data) {
    // howl if need be:    
    drawStaticMap();
    howl();
});

function howl() {
    if (needToHowl) {
        var howlSound = new Media("file:///android_asset/www/sounds/howl2.wav", function(){}, function(){});
        howlSound.play();
        needToHowl = false;
    }    
}

function drawStaticMap() {
    //gpsLat = 41.508801;
    //gpsLng = -81.605376;
    $('#googleMap').attr('style','background: url("http://maps.googleapis.com/maps/api/staticmap?key=' 
                        + googleApiKey 
                        + '&center=' + gpsLat + ',' + gpsLng 
                        + '&size=1000x500&zoom=17") center no-repeat;');
}

function drawDynamicMap() {
    var gpsLatLng = new google.maps.LatLng(gpsLat, gpsLng);
    google.maps.visualRefresh = true;
    var mapOptions = {
        center: gpsLatLng,
        zoom: 18,
        streetViewControl: false
    };
    map = new google.maps.Map($("#googleMap")[0], mapOptions);
}
