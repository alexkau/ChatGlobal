#!/usr/bin/env python

from twisted.internet.protocol import Factory
from twisted.protocols.basic import LineReceiver
from twisted.internet import reactor

from Queue import Queue
from apiclient.discovery import build
import json

pendingUsers = Queue()
service = build('translate', 'v2',
                developerKey='AIzaSyA6YjQwwDPZ52y8ejL9oemcvAc6rnAwwig')

class Chat(LineReceiver):

    def __init__(self, users):
        self.users = users
        self.name = None
        self.state = "GETNAME"
        self.match = None
        self.lang = None

    def getName(self):
        return self.name

    def setMatch(self, partner):
        self.match = partner
        self.sendLine("You're connected to %s" % self.match.name)

    def connectionMade(self):
        self.sendLine("What's your name?")

    def connectionLost(self, reason):
        if self.users.has_key(self.name):
            del self.users[self.name]

    def lineReceived(self, line):
        if self.state == "GETNAME":
            self.handle_GETNAME(line)
        elif self.state == "GETLANG":
            self.handle_GETLANG(line)
            if pendingUsers.empty():
                pendingUsers.put(self)
            else:
                self.setMatch(pendingUsers.get())
                self.match.setMatch(self)
        else:
            self.handle_CHAT(line)

    def handle_GETNAME(self, name):
        if self.users.has_key(name):
            self.sendLine("Name taken, please choose another.")
            return
        self.sendLine("Welcome, %s!" % (name,))
        self.name = name
        self.users[name] = self
        self.state = "GETLANG"

    def handle_GETLANG(self, lang):
        self.lang = lang
        self.state = "CHAT"
 
    def handle_CHAT(self, message):
        if self.lang != self.match.lang:
            translated = service.translations().list(
                source=self.lang,
                target=self.match.lang,
                q=[message]
            ).execute()
            translated = json.loads(json.dumps(translated))
            message = translated["translations"][0]["translatedText"].encode('utf8')
        message = "<%s> %s" % (self.name, message)

        self.match.sendLine(message)

class ChatFactory(Factory):

    def __init__(self):
        self.users = {} # maps user names to Chat instances

    def buildProtocol(self, addr):
        return Chat(self.users)


reactor.listenTCP(8001, ChatFactory())
reactor.run()
