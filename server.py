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

pending = None
languages = {
    "en": "English",
    "fr": "French",
    "es": "Spanish",
    "de": "German",
    "ja": "Japanese",
    "ru": "Russian",
    "zh-CN": "Chinese",
}
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
        print "Sending initial match message to %s" % self.name
        self.message("N", self.match.name)
        self.message("S", "You're connected to %s (%s)" % (self.match.name, languages[self.match.lang]), self.lang, "en")
        # print "Matching %s (%s) to %s (%s)" % (self.name, self.lang, self.match.name, self.match.lang)

    def connectionMade(self):
        print "Got new client!"
        # print pendingUsers.qsize()
        # self.transport.write('connected ....\n')
        # self.factory.clients.append(self)

    def connectionLost(self, reason):
        print "Lost a client!"
        global pending
        if pending == self:
            pending = None
        if self.match:
            self.match.message("E", "Partner has disconnected", self.match.lang, "en")

    def dataReceived(self, data):
        global pending
        if self.status == 0:
            self.name = data
            self.status = 1
            print "Name received: " + self.name
        elif self.status == 1:
            self.lang = data
            print "Lang received: " + self.lang
            if pending == None:
                print "Pending is empty"
                pending = self
                print "Pending is now " + self.name
            else:
                print "Pending is " + pending.name
                self.setMatch(pending)
                pending = None
                self.match.setMatch(self)
            self.status = 2
        elif self.status == 2:
            response = self.match.message("M", data[5:], self.match.lang, self.lang)
            if self.lang != self.match.lang and response:
                self.message("T" + data[:5], response, "en", "en")

        # print "received", repr(data)

    def message(self, prefix, message, lang_to="", lang_from=""):
        # try:
            if lang_to != "" and lang_from != "":
                if lang_to != lang_from:
                    translated = service.translations().list(
                        source=lang_from,
                        target=lang_to,
                        q=[message.decode('utf-8')]
                    ).execute()

                    translated = json.loads(json.dumps(translated))
                    message = translated["translations"][0]["translatedText"].encode('utf8')
            self.transport.write(prefix + message + '\n')
            # print "Writing %s to %s" % (prefix+message, self.name)
            return message
        # except:
        #     if self.match:
        #         self.match.transport.write("EError sending message. Try again." + '\n')
        #         return False

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
