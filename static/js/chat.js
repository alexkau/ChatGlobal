function init() {
    window.chat = {};
    var selfname = null;
    var theirname = null;
    var prefix = "";
    var coloring = "";
    chat.ws = new WebSocket("ws://127.0.0.1:8001/chat");
}

$(document).ready( function() {
    init();

    //Basic message send
    chat.sendNotInList = function (message) {
        chat.ws.send(message);
    }

    chat.send = function (message) {
        var row = document.createElement('tr');
        var selfname_td = document.createElement('td');
        var message_td = document.createElement('td');

        selfname_td.innerHTML = selfname;
        message_td.innerHTML = message;
        $("#message_list").append(row);

        $("#message_list tr").last().append(selfname_td);
        $("#message_list tr").last().append(message_td);
        $("#message_list tr").last().addClass("self");
        $("#messages").animate({scrollTop: $("#messages").prop("scrollHeight")}, 400);
        chat.ws.send(message);
    }

    //Basic message receive
    chat.ws.onmessage = function (event) {
        prefix = event.data.slice(0,1);
        message = event.data.slice(1);
        if (prefix == "N") {
            theirname = message;
        } else {
            var row = document.createElement('tr');
            var theirname_td = document.createElement('td');
            var message_td = document.createElement('td');
            if (prefix == "M")
            {
                theirname_td.innerHTML = theirname;
                coloring = "partner";
            } else if (prefix == "E") {
                theirname_td.innerHTML = "System";
                coloring = "error";
            } else if (prefix == "S") {
                theirname_td.innerHTML = "System";
                coloring = "system";
            }

            message_td.innerHTML = message;
            $("#message_list").append(row);

            $("#message_list tr").last().append(theirname_td);
            $("#message_list tr").last().append(message_td);
            $("#message_list tr").last().addClass(coloring);
            $("#messages").animate({scrollTop: $("#messages").prop("scrollHeight")}, 400);
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

    var submitUserInfo = document.getElementById("user_name");
    submitUserInfo.addEventListener("keydown", function(e) {
        if (!e) { var e = window.event; }

        //keyCode 13 is the enter/return button keyCode
        if (e.keyCode == 13) {
            e.preventDefault();
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

