#!/usr/bin/env python

from twisted.internet.protocol import Factory
from twisted.protocols.basic import LineReceiver
from twisted.internet import reactor
from twisted.web.websockets import WebSocketsResource, WebSocketsProtocol, lookupProtocolForFactory

from twisted.web.resource import Resource
from twisted.web.server import Site
from twisted.internet import protocol
from twisted.application import service, internet


from Queue import Queue
from apiclient.discovery import build
import json

pendingUsers = Queue()
service = build('translate', 'v2',
                developerKey='AIzaSyA6YjQwwDPZ52y8ejL9oemcvAc6rnAwwig')

class Chat(LineReceiver):
    def __init__(self):
        self.name = None
        self.status = 0
        self.match = None
        self.lang = None

    def setMatch(self, match):
        self.match = match
        self.transport.write("You're connected to %s\n" % self.match.name)
        print "Matching %s (%s) to %s (%s)" % (self.name, self.lang, self.match.name, self.match.lang)

    def connectionMade(self):
        print "Got new client!"
        # self.transport.write('connected ....\n')
        # self.factory.clients.append(self)

    def connectionLost(self, reason):
        print "Lost a client!"
        if self.match:
            self.match.message("Partner has disconnected")

    def dataReceived(self, data):
        if self.status == 0:
            self.name = data
            self.status = 1
        elif self.status == 1:
            self.lang = data
            if pendingUsers.empty():
                pendingUsers.put(self)
            else:
                self.setMatch(pendingUsers.get())
                self.match.setMatch(self)
            self.status = 2
        elif self.status == 2:
            self.match.message(data)

        print "received", repr(data)

    def message(self, message):
        if self.lang != self.match.lang:
            translated = service.translations().list(
                source=self.match.lang,
                target=self.lang,
                q=[message]
            ).execute()
            translated = json.loads(json.dumps(translated))
            message = translated["translations"][0]["translatedText"].encode('utf8')
        self.transport.write(message + '\n')

from twisted.internet.protocol import Factory

class ChatFactory(Factory):
    protocol = Chat
    clients = []

resource = WebSocketsResource(lookupProtocolForFactory(ChatFactory()))
root = Resource()
#serve chat protocol on /ws
root.putChild("chat",resource)

from twisted.application.service import Application

application = Application("chatserver")
internet.TCPServer(8001, Site(root)).setServiceParent(application)







# class ChatFactory(Factory):

#     def __init__(self):
#         self.users = {} # maps user names to Chat instances

#     def buildProtocol(self, addr):
#         return Chat(self.users)


# reactor.listenTCP(8001, ChatFactory())
# reactor.run()
