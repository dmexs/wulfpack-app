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
                howl();
                gpsLat = parseFloat(e.payload.lat);
                gpsLng = parseFloat(e.payload.lng);
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
});

$('#btnHowl').on('click', function () {
    var registrationIds = [];
    registrationIds[0] = "APA91bHq6N6zSUvF1u6dR2taCNRlrhEM-QDCi1pfoGlWuPwYJuZuADLsZtbad0yZuln9AYeI78NHpVXZgsJP6BlSwolnZqfDIsnU1anoIXbONaL-5ivKP6tAR7GbO0s-8tfRRSktoD8tkmC5SriRv1L6EMAjoTuICQ";
    registrationIds[1] = "APA91bERRwOpINVGmOGB9-gSpiJT0ySEcI_M4SvTfO4zvPWA1xK4LjQsGMzP1E4Y-gm8jyz_gGRrn_a7xaN7LGHgeSAcRmF7Y4YyKua5qWWxu_RlNiuy4caVKtRot1Xp_XbnSz3JWyVZT2cPPLWq-3JLijGu3RgBEQ";
    var regIdsJSON = JSON.stringify(registrationIds);
    console.log(regIdsJSON);

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8;",
        url: "https://android.googleapis.com/gcm/send",
        headers: {'Authorization': 'key=AIzaSyAN-U-gEEPL0HzC4st2czQUc86jnnbN6fo'},
        data: {"registration_ids": ["APA91bHq6N6zSUvF1u6dR2taCNRlrhEM-QDCi1pfoGlWuPwYJuZuADLsZtbad0yZuln9AYeI78NHpVXZgsJP6BlSwolnZqfDIsnU1anoIXbONaL-5ivKP6tAR7GbO0s-8tfRRSktoD8tkmC5SriRv1L6EMAjoTuICQ", "APA91bERRwOpINVGmOGB9-gSpiJT0ySEcI_M4SvTfO4zvPWA1xK4LjQsGMzP1E4Y-gm8jyz_gGRrn_a7xaN7LGHgeSAcRmF7Y4YyKua5qWWxu_RlNiuy4caVKtRot1Xp_XbnSz3JWyVZT2cPPLWq-3JLijGu3RgBEQ"], "data": {"message": "A howl was heard!"}},
        success: function (data, status) {
            console.log('Good howl!');
        },
        error: function (data, status, errorThrown) {
            console.log('Bad howl');
        }
    });
});

function howl() {
    if (needToHowl) {
        var howlSound = new Media("file:///android_asset/www/sounds/howl2.wav", function(){}, function(){});
        howlSound.play();
        needToHowl = false;
    }    
}

function drawStaticMap() {
    //gpsLat = parseFloat("41.508801");
    //gpsLng = parseFloat("-81.605376");
    /*console.log('#GPS COORDS: ' + gpsLat + ',' + gpsLng)
    $("#googleMap").removeAttr('style');
    $('#googleMap').attr('style','background: url("https://maps.googleapis.com/maps/api/staticmap?key=' 
                        + googleApiKey 
                        + '&center=' + gpsLat + ',' + gpsLng 
                        + '&size=1000x500&zoom=17'
                        + '&timestamp=' + (new Date()).getTime()
                        + '") center no-repeat;');
*/
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
