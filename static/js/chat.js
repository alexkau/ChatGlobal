function init() {
    window.chat = {};
    window.selfname = null;
    window.theirname = null;
    window.prefix = "";
    window.coloring = "";
    window.currentmsg = 0;
    chat.ws = new WebSocket("ws://192.241.131.216:8001/chat");
    //chat.ws = new WebSocket("ws://localhost:8001/chat");

    var messagesRoot = document.getElementById("message_list");
    while (messagesRoot.firstChild) {
        messagesRoot.removeChild(messagesRoot.firstChild);
    }
    var row = document.createElement('tr');
    var selfname_td = document.createElement('td');
    var message_td = document.createElement('td');
    
    $("#message_in").attr("disabled", true);

    selfname_td.innerHTML = "System";
    message_td.innerHTML = "Waiting for a partner...";
    $("#message_list").append(row);

    $("#message_list tr").last().append(selfname_td);
    $("#message_list tr").last().append(message_td);
    $("#message_list tr").last().addClass("system");
    $("#messages").animate({scrollTop: $("#messages").prop("scrollHeight")}, 400);

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
        $("#message_list tr").last().addClass("message_" + ("00000" + currentmsg).slice(-5));
        $("#messages").animate({scrollTop: $("#messages").prop("scrollHeight")}, 400);
        chat.ws.send(("00000" + currentmsg).slice(-5) + message);
        currentmsg++;
    }

    //Basic message receive
    chat.ws.onmessage = function (event) {
        prefix = event.data.slice(0,1);
        message = event.data.slice(1);
        if (prefix == "N") {
            theirname = message;
        } else if (prefix == "T") {
            console.log(message);
            //$("message_" + message.slice(0,5)).attr("alt", message.slice(5));
            $(".message_" + message.slice(0,5)).tooltip({
                'title': message.slice(5),
                'placement': 'right',
                'container': '#messages',
                'delay': {show: 400, hide: 0},
            });
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
                $("#message_in").attr("disabled", false);
                $("#message_in").attr("placeholder", "Type a message!");
                $("#message_in").focus();
            }

            message_td.innerHTML = message;
            $("#message_list").append(row);

            $("#message_list tr").last().append(theirname_td);
            $("#message_list tr").last().append(message_td);
            $("#message_list tr").last().addClass(coloring);
            $("#messages").animate({scrollTop: $("#messages").prop("scrollHeight")}, 400);
        }
    };

    window.onbeforeunload = function() {
        chat.ws.onclose = function () {};
        chat.ws.close();
    }

    var inputbox = document.getElementById("message_in");
    inputbox.addEventListener("keydown", function(e) {
        if (!e) { var e = window.event; }

        //keyCode 13 is the enter/return button keyCode
        if (e.keyCode == 13) {
            e.preventDefault();
            if(inputbox.value !="")
            {
                chat.send(inputbox.value);
                inputbox.value="";
            }
        }
    }, false);

    var submitUserInfo = document.getElementById("user_name");
    submitUserInfo.addEventListener("keydown", function(e) {
        if (!e) { var e = window.event; }

        //keyCode 13 is the enter/return button keyCode
        if (e.keyCode == 13) {
            e.preventDefault();
            selfname = document.getElementById("user_name").value;
            if(selfname == "")
            {
                $("#user_name").parent().addClass("has-error");
                $("#user_name").attr("placeholder", "Name is required!");
            } else {
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
        }
    }, false);


    $("#getUserInfo").click(function(){
        $("#overlay").animate({
            top: '0px',
            height:'100%',
            easing:'linear',
        }, 500 );
        setTimeout( function() { $( "#user_name" ).focus() }, 500 );
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
        if(selfname == "")
        {
            $("#user_name").parent().addClass("has-error");
            $("#user_name").attr("placeholder", "Username is required!");
            // $("#username_alert").animate({
            //     height:'48px',
            //     easing:'linear',
            // }, 300 );
        } else {
            chat.sendNotInList(selfname);
            var e = document.getElementById("user_lang");
            chat.sendNotInList(e.options[e.selectedIndex].value);
            $("#mainpage").remove();
            $("#chat").removeClass("hide");
            $("#overlay").animate({
                top: '200%',
                height:'100%',
                easing:'linear',
            }, 500 );
        }
    });
    $("#send_message").click(function(){
        if(inputbox.value !="")
        {
            chat.send(inputbox.value);
            inputbox.value="";
        }
    });
});

