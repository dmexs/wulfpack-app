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
                console.log('registering android');
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
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    successHandler: function(result) {
        // alert('Callback Success! Result = '+result)
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
                navigator.notification.alert(
                    e.message,  // message
                    'Howl Received!',            // title
                    'Howl Received!'                  // buttonName
                );
                navigator.notification.beep(3);
                navigator.notification.vibrate(2000);
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
