$(document).ready( function() {
    window.chat = {};
    var selfname = null;
    var theirname = null;
    //Instantiate a websocket client connected to our server
    chat.ws = $.gracefulWebSocket("ws://127.0.0.1:8001/chat");

    //Basic message send
    chat.sendNotInList = function (message) {
        chat.ws.send(message);
    }

    chat.send = function (message) {
        var list_element = document.createElement('li');
        list_element.innerHTML = message;
        $("#message_list").append(list_element);
        $("#message_list li").last().addClass("self");
        $("#message_list").animate({scrollTop: $("#message_list").prop("scrollHeight")}, 250);
        chat.ws.send(message);
    }

    //Basic message receive
    chat.ws.onmessage = function (event) {
        if (theirname == null) {
            theirname = event.data
        } else {
            var messageFromServer = event.data;
            var list_element = document.createElement('li');
            list_element.innerHTML = messageFromServer;
            $("#message_list").append(list_element);
            $("#message_list li").last().addClass("partner");
            $("#message_list").animate({scrollTop: $("#message_list").prop("scrollHeight")}, 250);
        }
    };
     
    var inputbox = document.getElementById("message_in");

    inputbox.addEventListener("keydown", function(e) {
        if (!e) { var e = window.event; }
         
        //keyCode 13 is the enter/return button keyCode
        if (e.keyCode == 13) {
            // enter/return probably starts a new line by default
            e.preventDefault();
            chat.send(inputbox.value);
            inputbox.value="";
        }
    }, false);
    $("#getUserInfo").click(function(){
        $("#overlay").animate({
            top: '0px',
            height:'100%',
            easing:'linear',
        }, 500 );
    });
    $("#overlay_cancel").click(function(){
        $("#overlay").animate({
            top: '200%',
            height:'100%',
            easing:'linear',
        }, 500 );
    });
    $("#overlay_submit").click(function(){
        selfname = document.getElementById("user_name").value;
        chat.sendNotInList(selfname);
        var e = document.getElementById("user_lang");
        chat.sendNotInList(e.options[e.selectedIndex].value);
        $("#chat").removeClass("hide");
        $("#overlay").animate({
            top: '200%',
            height:'100%',
            easing:'linear',
        }, 500 );
    });

});

