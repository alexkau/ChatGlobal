ChatGlobal
==========

Break the language barrier. Chat around the world.

Judged "Best Overall Hack" at [Hack Upstate](http://www.hackupstate.com/) Spring 2014.

ChatGlobal is a chat service that randomly connects you to another user, who could be anywhere from across the street to across the world. Chat is automatically translated into each user's native language, so you never have to worry about language differences.

ChatGlobal makes use of several existing packages:
* [Twisted](http://twistedmatrix.com/trac/) is for the matching and translation server.
* [jQuery](http://jquery.com/) is used to assist with the frontend javascript.
* [Bootstrap](http://getbootstrap.com/) is used for the frontend styling framework.

Running ChatGlobal
------------------

Install the requirements on the server. Using a virtualenv is recommended.
`pip install -r requirements.txt`

Edit the `WebSocket()` declaration at the top of /static/chat.js to point to your server's IP.

Ensure that Port 8001 on your server is open.

Run the Twisted server:
`./runserver.sh`

Serve /index.html and /static via your web server of choice. They don't have to be served by the same machine that's running the Twisted server.
