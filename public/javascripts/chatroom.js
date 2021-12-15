//const { response } = require("../../app")



//browserify public/javascripts/chatroom.js -o public/javascripts/bundle.js
serverUrl = 'ws://localhost:9876/server'
const websocket = new WebSocket(serverUrl)

const inputMessage = document.getElementById('message')
const sendButton = document.getElementById('chat-message-submit')
const dest = document.getElementById('dest')


var ab2str = require('arraybuffer-to-string')
const util = require('util')
const buffer = require('buffer')
//contact.innerHTML = mainUser.userName

var mainUser = {
    userName: dest.getAttribute('data-value'),
}



const KeyHelper = window.libsignal.KeyHelper;
const libsignal = window.libsignal

var store = new SignalProtocolStore()
var localStorageBundles = new Map()
var localSessionsCipher = new Map()
var lastSendMessage = undefined

initialize(store);


//send to me by default
var sendTo_ = mainUser.userName

var OnlineList = []

sendButton.addEventListener('click', sendMsgEvent, false);

//on websocket open
websocket.onopen = function() {

    data = {
        type: 'users',
        userName: mainUser.userName,
        preKeyBundle: getPreKeyBundle(mainUser.userName)
    }
    websocket.send(JSON.stringify(data))
    console.log('connected')

    messageAdd('<div class="message green">You have entered the chat room.</div>')
}

//on message receive
websocket.onmessage = function(event) {
    try {
        var data = JSON.parse(event.data)
        switch (data.type) {
            //get existing users
            case 'users':
                getUsers(data)
                break
                //get message receive
            case 'message':
                messageAdd('<div class="message">' + data.senderId+ ': ' + receivMsg(data) + '</div>');
                break
                //add new user
            case 'newUser':
                addContact(data.userName)
                break

            default:
                console.log(`Wrong expression`)
        }
    } catch (error) {
        console.log(error)
    }

}

//on websocket close
websocket.onclose = function(event) {
    messageAdd('<div class="message blue">You have been disconnected.</div>');
}

//on websocket error
websocket.onerror = function(event) {
    messageAdd('<div class="message red">Connection to chat failed.</div>');
}

function getUsers(data) {
    sendTo_ = data.userName
    var users = JSON.parse(data.users, reviver);
    userButton(mainUser.userName)
    addContacts(users)
    addContact(mainUser.userName)

    var preKeysBundles = JSON.parse(data.preKeys, reviver)

    addPreKeyBundles(preKeysBundles)
    console.log(localStorageBundles)
}


function messageAdd(message) {
    var chatMessage = document.getElementById('chat-message');
    chatMessage.insertAdjacentHTML("beforeend", message);
    //chatMessage.scrollTop = chatMessage.scrollHeight;
}

function addPreKeyBundles(preKeyBundles){
    for (const [key, value] of users.entries()) {
        if (key != mainUser.userName) {
            localStorageBundles.put(key, value)
        }
    }
}

function addContacts(users) {

    for (const [key, value] of users.entries()) {
        if (key != mainUser.userName) {
            addContact(key, value)
        }
    }
}

//Object to Map 
function reviver(key, value) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}


//add a contact to the UI
function addContact(userName) {
    if (OnlineList.includes(userName)) return
    OnlineList.push(userName)
    var contact = document.getElementById('contact');
    contact.insertAdjacentHTML('afterend', '<button class="list-group-item" id="' + userName + '">' + userName + '</button>')
    var contactButton = document.getElementById(userName)
    contactButton.addEventListener('click', function() {
        dest.innerHTML = userName
        sendTo_ = userName
    }, false)
}


function userButton(userName) {
    dest.innerHTML = userName
    sendTo_ = userName
}


/**
 * Initialise the manager when the user log on 
 * @param {SignalProtocolStore} store 
 */
async function initialize(store){
   await generateIdentity(store)

    var preKeyBundle = await generatePreKeyBundle(store,userName, prekeyBundle)

    registerNewPreKeyBundle(userName, preKeyBundle)
}
/**
 * Generates a new identity for the local user
 * @param {SignalProtocolStore} store 
 */
async function generateIdentity(store) {
    var results = Promise.all([
        KeyHelper.generateIdentityKeyPair(),
        KeyHelper.generateRegistrationId(),
    ])
    console.log(results)
    store.put('identityKey', results[0]);
    store.put('registrationId', results[1]);
    
}

/**
 * 
 * @param {SignalProtocolStore} store 
 * @returns A pre-key bundle
 */
async function generatePreKeyBundle(store) {
    var result = await Promise.all([
        store.getIdentityKeyPair(),
        store.getLocalRegistrationId()
    ])
    
    var identity = result[0];
    var registrationId = result[1];

    var keys = await Promise.all([
        KeyHelper.generatePreKey(registrationId + 1),
        KeyHelper.generateSignedPreKey(identity, registrationId + 1),
    ])
  
    let preKey = keys[0]
    let signedPreKey = keys[1];

    store.storePreKey(preKey.keyId, preKey.keyPair);
    store.storeSignedPreKey(signedPreKey.keyId, signedPreKey.keyPair);

    return {
        identityKey: identity.pubKey,
        registrationId : registrationId,
        preKey:  {
            keyId     : preKeyId,
            publicKey : preKey.keyPair.pubKey
        },
        signedPreKey: {
            keyId     : signedPreKey.keyId,
            publicKey : signedPreKey.keyPair.pubKey,
            signature : signedPreKey.signature
        }
    }   
}

/**
 * When a user logs on they should generate their keys and then register them with the server.
 * 
 * @param userName The uniq username
 * @param preKeyBundle User's generated pre-key bundle
 */
function registerNewPreKeyBundle(userName, preKeyBundle){
    let storageBundle = {...preKeyBundle}
    storageBundle.identityKey = util.arrayBufferToBase64(storageBundle.identityKey)
    storageBundle.preKey.publicKey = util.arrayBufferToBase64(storageBundle.preKey.publicKey)
    storageBundle.signedPreKey.publicKey = util.arrayBufferToBase64(storageBundle.signedPreKey.publicKey)
    storageBundle.signedPreKey.signature = util.arrayBufferToBase64(storageBundle.signedPreKey.signature)
    localStorageBundles.set(userName, storageBundle)
}

/**
 * gets the pre-keys bundle for the given username to start a conversation.
 * 
 * @param userName The uniq username
 * @returns storaBundle with the user's pre-key
 */
function getPreKeyBundle(userName){
    let storageBundle = localStorageBundles.get(userName)
    storageBundle.identityKey = util.base64ToArrayBuffer(storageBundle.identityKey)
    storageBundle.preKey.publicKey = util.base64ToArrayBuffer(storageBundle.preKey.publicKey)
    storageBundle.signedPreKey.publicKey = util.base64ToArrayBuffer(storageBundle.signedPreKey.publicKey)
    storageBundle.signedPreKey.signature = util.base64ToArrayBuffer(storageBundle.signedPreKey.signature)
    return storageBundle
}
//Send a message to 'sendTo' when clicking on the button send
function sendMsgEvent() {

    var message = inputMessage.value;

    if (message.toString().length) {

        encryptedMessage = await encryptMessage(sendTo_, message)
        var data = {
            type: 'message',
            receiverId: sendTo_,
            senderId: mainUser.userName,
            message: encryptedMessage
        }
        lastSendMessage = message
        if (sendTo_ != mainUser.userName) {
            messageAdd('<div class="message">' + mainUser.userName + ': ' + message + '</div>');
            websocket.send(JSON.stringify(data))
        } else {
            websocket.send(JSON.stringify(data))
        }

        message.value = ""
    }
}

function receivMsg(data){
    if (senderId == mainUser.userName){
        return lastSendMessage
    }
    else {
        decryptedMessage = decryptMessage(data.senderId, data.message)
        return ab2str(decryptMessage)
    }
}

function encryptMessage(remoteUserName, message){

    if (localSessionsCipher.has(remoteUserName)){
        var sessionCipher = localSessionsCipher.get(remoteUserName)
        let ciphertext = await sessionCipher.encrypt(message)
        return ciphertext
    }
   
    else {
        var address = new libsignal.SignalProtocolAddress(remoteUserName, 123)

        var sessionBuilder = new libsignal.SessionBuilder(store,address)

        var remoteUserPreKey = getPreKeyBundle(remoteUserName)

        return sessionBuilder.processPreKey(remoteUserPreKey).then(function(){
            var sessionCipher = new libsignal.SessionCipher(store,address)

            localSessionsCipher.put(remoteUserName,sessionCipher)

            let ciphertext = await sessionCipher.encrypt(message)
            
            return ciphertext
        })
    }
}

function decryptMessage(remoteUserName, cipherText){
    if (localSessionsCipher.has(remoteUserName)){
        var sessionCipher = localSessionsCipher.get(remoteUserName)
    }
    else {
        var address = new libsignal.SignalProtocolAddress(remoteUserName, 123)
        var sessionCipher = new libsignal.SessionCipher(store,address)
        localSessionsCipher.put(remoteUserName,sessionCipher)
    }

    var messageHasEmbeddedPreKeyBundle = cipherText.type == 3

    if(messageHasEmbeddedPreKeyBundle){
        var decryptedMessage = await sessionCipher.decryptPreKeyWhisperMessage(cipherText.body, 'binary')
        return util.toString(decryptedMessage)
    }
    else{
        var decryptedMessage = await sessionCipher.decryptWhisperMessage(cipherText.body, 'binary')
        return util.toString(decryptedMessage)
    }
}



var ALICE_ADDRESS = new libsignal.SignalProtocolAddress("xxxxxxxxx", "1"); 
var BOB_ADDRESS   = new libsignal.SignalProtocolAddress("yyyyyyyyyyyyy", "1");

var aliceStore = new SignalProtocolStore();

var bobStore = new SignalProtocolStore();


var bobPreKeyId = 1337;
var bobSignedKeyId = 1;

var Curve = libsignal.Curve;

Promise.all([
    generateIdentity(aliceStore),
    generateIdentity(bobStore),
]).then(function() {
    return generatePreKeyBundle(bobStore, bobPreKeyId, bobSignedKeyId);
}).then(function(preKeyBundle) {
    
    var builder = new libsignal.SessionBuilder(aliceStore, BOB_ADDRESS);
    return builder.processPreKey(preKeyBundle).then(function() {
    
        
        var originalMessage = "my message ......";
        var aliceSessionCipher = new libsignal.SessionCipher(aliceStore, BOB_ADDRESS);
        var bobSessionCipher = new libsignal.SessionCipher(bobStore, ALICE_ADDRESS);

        aliceSessionCipher.encrypt(originalMessage).then(function(ciphertext) {

            // check for ciphertext.type to be 3 which includes the PREKEY_BUNDLE
            return bobSessionCipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary');

        }).then(function(plaintext) {

            console.log(ab2str(plaintext))

        });

        /* bobSessionCipher.encrypt(originalMessage).then(function(ciphertext) {

            return aliceSessionCipher.decryptWhisperMessage(ciphertext.body, 'binary');

        }).then(function(plaintext) {

            assertEqualArrayBuffers(plaintext, originalMessage);

        });*/

    });
});

