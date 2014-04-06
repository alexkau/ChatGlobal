ChatGlobal
==========

Break the language barrier. Chat around the world.

ChatGlobal is a chat service that randomly connects you to another user, who might be next door or across the world. Chat is automatically translated into each user's native language, so you never have to worry about the language barrier.

ChatGlobal makes use of several existing packages:
* [Twisted](http://twistedmatrix.com/trac/) is for the matching and translation server.
* [jQuery](http://jquery.com/) is used to assist with the frontend javascript.
* [Bootstrap](http://getbootstrap.com/) is used for the frontend styling framework.

Running ChatGlobal
------------------

Install the requirements on the server:
`pip install -r requirements.txt`

Edit the `WebSocket()` declaration at the top of /static/chat.js to point to your server's IP.

Run the Twisted server:
`./runserver.sh`
Ensure that Port 8001 is open.

Serve /index.html and /static via your web server of choice.