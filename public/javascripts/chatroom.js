 // put in the remote server, need to be changed
 serverUrl = 'ws://localhost:9876/server'
 const websocket = new WebSocket(serverUrl)

 const crypto = require('crypto');
 var Buffer = require('buffer').Buffer;

 const inputMessage = document.getElementById('message')
 const sendButton = document.getElementById('chat-message-submit')
 const dest = document.getElementById('dest')
 const modeBtn = document.getElementById('modeBtn')


 function aesEncrypt(data, key) {
     const cipher = crypto.createCipher('aes192', key);
     var crypted = cipher.update(data, 'utf8', 'hex');
     crypted += cipher.final('hex');
     return crypted;
 }

 function aesDecrypt(encrypted, key) {
     const decipher = crypto.createDecipher('aes192', key);
     var decrypted = decipher.update(encrypted, 'hex', 'utf8');
     decrypted += decipher.final('utf8');
     return decrypted;
 }

 String.prototype.hashCode = function() {
     if (Array.prototype.reduce) {
         return this.split("").reduce(function(a, b) {
             a = ((a << 5) - a) + b.charCodeAt(0);
             return a & a
         }, 0);
     }
     var hash = 0;
     if (this.length === 0) return hash;
     for (var i = 0; i < this.length; i++) {
         var character = this.charCodeAt(i);
         hash = ((hash << 5) - hash) + character;
         hash = hash & hash; // Convert to 32bit integer
     }
     return hash;
 }

 var mainUser = {
     userName: dest.getAttribute('data-value'),
 }

 //send to me by default
 var sendTo_ = mainUser.userName

 var prime = undefined
 var generator = undefined
 var client = undefined
 var clientKey = undefined
 var usersPubKey = new Map()
 var oldMessage = undefined

 var OnlineList = []

 var histEncMsg = new Map()

 sendButton.addEventListener('click', sendEvent, false);


 // for the function secret 

 // Update according to the information from the server
 var secretMode = false

 const changeMode = () => {
     if (modeBtn.value == 'Open Secret Mode') {
         alert('On Secret Mode, the server may not store the message you send, which means no history message can be seen.')
         modeBtn.value = 'Close Secret Mode'
         secretMode = true

     } else {
         modeBtn.value = 'Open Secret Mode'
         secretMode = false
     }
 }

 modeBtn.addEventListener('click', changeMode, false)



 //on websocket open
 websocket.onopen = function() {
     data = {
         type: 'users',
         userName: mainUser.userName,
     }
     websocket.send(JSON.stringify(data))
     console.log('connected')

     messageAdd('<div class="message green">You have entered the chat room. Please select a online user to chat!</div>')
 }

 //on message receive
 websocket.onmessage = function(event) {
     try {
         var data = JSON.parse(event.data)
         switch (data.type) {
             //get existing users with their keys
             case 'users':
                 getUsers(data)
                 sendHistRequest(mainUser.userName, mainUser.userName)
                 sendPubKey()
                 addPubKeys(data)
                 break
                 //get message receive
             case 'message':
                 messageOperation(data)
                 break
             case 'encryptedMessage':
                 decrypMessage(data)
                 break
                 //add new user
             case 'newUser':
                 addContact(data.userName)
                 break
             case 'newPubKey':
                 console.log('new PubKey!!')
                 console.log(data)
                 addPubKey(data.userName, data.pubKey)
                 break
             case 'logout':
                 removeUser(data.username)
                 break
             case 'getHistory':
                 if (data.content.length >= 1) {
                     resolveHis(data.content)
                     resolveEncHis(data.to)
                 }
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

 // handle the message receiving
 const messageOperation = (data) => {
     if (data.userName == sendTo_) {
         var key = data.userName.hashCode() + mainUser.userName.hashCode()
         var content = aesDecrypt(data.message, key + '')
         messageAdd('<div class="message">' + data.userName + ': ' + content + '</div>');
     } else {
         var contactButton = document.getElementById(data.userName)
         contactButton.innerHTML = data.userName + ' (new message!)'
     }
 }

 //decryptMessage
 function decrypMessage(data) {
     if (data.userName == sendTo_) {
         if (mainUser.userName == data.userName) {
             messageAdd('<div class="message">' + '(secure mode) ' + data.userName + ': ' + oldMessage + '</div>');
             return
         } else {
             console.log('DECRYPTION')
             secretKey = usersPubKey.get(data.userName)
             console.log(secretKey)
             var x = secretKey.buffer
             var decr = aesDecrypt(data.message, x);
             messageAdd('<div class="message">' + '(secure mode) ' + data.userName + ': ' + decr + '</div>');
             putHist(data.userName, data.userName, decr)
         }
     } else {
         secretKey = usersPubKey.get(data.userName)
         console.log(secretKey)
         var x = secretKey.buffer
         var decr = aesDecrypt(data.message, x);
         var contactButton = document.getElementById(data.userName)
         contactButton.innerHTML = data.userName + ' (new encrypt message!)'
         putHist(data.userName, data.userName, decr)
     }

 }

 function getUsers(data) {
     sendTo_ = data.userName
     prime = data.prime
     generator = data.generator
     var users = JSON.parse(data.users, reviver);
     userButton(mainUser.userName)
     addContacts(users)
     addContact(mainUser.userName)
 }

 //Send a message to 'sendTo' when clicking on the button send
 function sendEvent() {

     var message = inputMessage.value;
     inputMessage.value = ' '

     //encrypted mode
     if (secretMode) {
         secretKey = usersPubKey.get(sendTo_)
         console.log(usersPubKey)
         oldMessage = message
         var data = {
             type: 'encryptedMessage',
             sendToUser: sendTo_,
             from: mainUser.userName,
             message: aesEncrypt(message, secretKey)
         }
         putHist(sendTo_, mainUser.userName, oldMessage)
         if (sendTo_ != mainUser.userName) {
             messageAdd('<div class="message">' + '(secret mode) ' + mainUser.userName + ': ' + message + '</div>');
             websocket.send(JSON.stringify(data))
         } else {
             websocket.send(JSON.stringify(data))
         }

         message.value = ""
     }
     //no encrypted mode
     else {
         var key = sendTo_.hashCode() + mainUser.userName.hashCode()
         var encrypt = aesEncrypt(message, key + '')
         var data = {
             type: 'message',
             sendToUser: sendTo_,
             from: mainUser.userName,
             message: encrypt
         }
         if (sendTo_ != mainUser.userName) {
             messageAdd('<div class="message">' + mainUser.userName + ': ' + message + '</div>');
             websocket.send(JSON.stringify(data))
         } else {
             websocket.send(JSON.stringify(data))
         }

         message.value = ""
     }
 }

 function putHist(mainUser, sender, message) {
     listHis = histEncMsg.get(mainUser)
     if (listHis == undefined) {
         histEncMsg.set(mainUser, [
             [sender, message]
         ])
     } else {
         listHis.push([sender, message])
         histEncMsg.set(mainUser, listHis)
     }
 }


 function removeUser(username) {
     console.log('remove!!!!')
     histEncMsg.delete(username)
     usersPubKey.delete(username)
     const x = document.getElementById('username')
     if (x != null) x.remove();
     location.reload();
 }

 function messageAdd(message) {
     var chatMessage = document.getElementById('chat-message');
     chatMessage.insertAdjacentHTML("beforeend", message);
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
         sendHistRequest(mainUser.userName, userName)
         this.innerHTML = userName
         dest.innerHTML = userName
         sendTo_ = userName
     }, false)
 }

 function sendPubKey() {
     client = crypto.createDiffieHellman(prime, generator)
     clientKey = client.generateKeys()
     data = {
         type: 'pubKey',
         userName: mainUser.userName,
         clientKey: clientKey
     }
     addPubKey(mainUser.userName, clientKey)
     websocket.send(JSON.stringify(data))
 }

 function addPubKeys(data) {
     var pubKeys = JSON.parse(data.usersPubKey, reviver)
     console.log('ADD PUB KEYS')
     console.log(pubKeys)
     for (const [key, value] of pubKeys.entries()) {
         if (key != mainUser.userName) {
             console.log('TRY TO ADD')
             console.log(key)
             console.log(value)
             addPubKey(key, value)

             console.log('KEY ADDED')

         }
     }
 }

 function addPubKey(userName, pubKey) {
     secretKey = client.computeSecret(pubKey.data)

     console.log("SECRET KEY: " + secretKey)
     usersPubKey.set(userName, secretKey)
 }

 // put History message to <div>
 const resolveHis = (result) => {
     var contentList = []
     console.log(typeof result[0].from)
     var key = result[0].from.hashCode() + result[0].to.hashCode()
     for (var i = 0; i < result.length; i++) {
         result[i].content = aesDecrypt(result[i].content, key + '')
     }
     for (var i = 0; i < result.length; i++) {
         contentList.push('<div class="message">' + result[i].from + ': ' + result[i].content + '</div>')
     }
     const temp = contentList.toString()
     var reg = new RegExp(/,/, "g")
     var output = temp.replace(reg, ' ')
     var box = document.getElementById("chat-message");
     removeAllChild(box)
     messageAdd(output);
 }

 function resolveEncHis(to) {
     var contentList = []
     var listHis = histEncMsg.get(to)
     if (listHis == undefined) {
         return
     }
     for (var i = 0; i < listHis.length; i++) {
         contentList.push('<div class="message">' + '(secret mode) ' + listHis[i][0] + ': ' + listHis[i][1] + '</div>')
     }
     const temp = contentList.toString()
     var reg = new RegExp(/,/, "g")
     var output = temp.replace(reg, ' ')
     messageAdd(output);
 }

 function removeAllChild(node) {
     while (node.hasChildNodes()) {
         node.removeChild(node.firstChild);
     }
 }

 const sendHistRequest = (from, to) => {
     var data = {
         type: 'getHistory',
         from: from,
         to: to,
     }
     websocket.send(JSON.stringify(data))
 }

 function userButton(userName) {
     dest.innerHTML = userName
     sendTo_ = userName
 }

 // listen the enter keyboard
 document.onkeydown = function(e) {
     if (e.keyCode == 13) {
         sendEvent()
     }
 }