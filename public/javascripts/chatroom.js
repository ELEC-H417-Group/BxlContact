<<<<<<< HEAD
//const { response } = require("../../app")



//browserify public/javascripts/chatroom.js -o public/javascripts/bundle.js
=======
>>>>>>> main
serverUrl = 'ws://localhost:9876/server'
const websocket = new WebSocket(serverUrl)

const inputMessage = document.getElementById('message')
const sendButton = document.getElementById('chat-message-submit')
const dest = document.getElementById('dest')
<<<<<<< HEAD
=======
    //contact.innerHTML = mainUser.userName
>>>>>>> main

//contact.innerHTML = mainUser.userName

var mainUser = {
    userName: dest.getAttribute('data-value'),
}

//send to me by default
var sendTo_ = mainUser.userName


<<<<<<< HEAD
sendButton.addEventListener('click',sendEvent, false);
=======

sendButton.addEventListener('click', sendEvent, false);
>>>>>>> main

//on websocket open
websocket.onopen = function() {

    data = {
        type: 'users',
        userName: mainUser.userName
    }
    websocket.send(JSON.stringify(data))
    console.log('connected')

    messageAdd('<div class="message green">You have entered the chat room.</div>')
}

//on message receive
websocket.onmessage = function(event) {
    try {
        var data = JSON.parse(event.data)
        console.log('data: ' + data.type)
        switch (data.type) {
            //get existing users
            case 'users':
                getUsers(data)
                break
                //get message receive
            case 'message':
                messageAdd('<div class="message">' + data.userName + ': ' + data.message + '</div>');
                break
                //add new user
            case 'newUser':
<<<<<<< HEAD
                addContact(data.userName)
=======
                addContact(data.userId, data.userName)
>>>>>>> main
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

<<<<<<< HEAD
function getUsers(data){
    sendTo_ = data.userName
    var users = JSON.parse(data.users, reviver);
    userButton(mainUser.userName)
    addContacts(users)
    addContact(mainUser.userName)
}

//Send a message to 'sendTo' when clicking on the button send
=======
function getUsers(data) {
    mainUser.userId = data.userId
    sendTo_ = data.userId
    var users = JSON.parse(data.users, reviver);
    console.log(users)
    userButton(mainUser.userId, mainUser.userName)
    addContacts(users)
    addContact(mainUser.userId, mainUser.userName)
}

>>>>>>> main
function sendEvent() {

    var message = inputMessage.value;

    if (message.toString().length) {
        var data = {
            type: 'message',
<<<<<<< HEAD
            sendToUser:sendTo_,
            message: message
        }
        console.log(sendTo_)
        if(sendTo_ != undefined){
=======
            userId: sendTo_,
            userName: mainUser.userName,
            message: message
        }
        if (sendTo_ != undefined) {
>>>>>>> main
            websocket.send(JSON.stringify(data))
        } else {
            messageAdd('<div class="contact">No contact are choosen</div>')
        }

        message.value = ""
    }
}

function messageAdd(message) {
    var chatMessage = document.getElementById('chat-message');
    chatMessage.insertAdjacentHTML("beforeend", message);
    //chatMessage.scrollTop = chatMessage.scrollHeight;
}

function addContacts(users) {

    for (const [key, value] of users.entries()) {
<<<<<<< HEAD
        if(key != mainUser.userName){
            addContact(key,value)
=======
        if (key != mainUser.userId) {
            addContact(key, value[1])
>>>>>>> main
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


<<<<<<< HEAD
//add a contact to the UI
function addContact(userName){
    var contact = document.getElementById('contact');
    contact.insertAdjacentHTML('afterend', '<button id="'+ userName +'">'+ userName +'</button>')
    var contactButton = document.getElementById(userName)
    contactButton.addEventListener('click',function(){
        dest.innerHTML = userName
        sendTo_ = userName
    } ,false)
    var friendListHTML = "";
    friendListHTML +=
        '<li>' + 
            '<div class="liLeft"><img src="/static/img/emoji/emoji_01.png"></div>' +
                '<div class="liRight">' +
                    '<span class="hidden-userId">' + userName + '</span>' + 
                    '<span class="intername">' + userName + '</span>' + 
                    '<span class="infor"></span>' + 
                '</div>' +
=======
function addContact(userId, userName) {
    var contact = document.getElementById('contact');
    contact.insertAdjacentHTML('afterend', '<button id="' + userId + '">' + userName + '</button>')
    var contactButton = document.getElementById(userId)
    contactButton.addEventListener('click', function() {
        dest.innerHTML = userName
        sendTo_ = userId
    }, false)
    var friendListHTML = "";
    friendListHTML +=
        '<li>' +
        '<div class="liLeft"><img src="/static/img/emoji/emoji_01.png"></div>' +
        '<div class="liRight">' +
        '<span class="hidden-userId">' + userId + '</span>' +
        '<span class="intername">' + userName + '</span>' +
        '<span class="infor"></span>' +
        '</div>' +
>>>>>>> main
        '</li>';

    $('.conLeft ul').append(friendListHTML);

    //listener doesn't work!!
    //$('.conLeft ul li').on('click', friendLiClickEvent, false);
}


<<<<<<< HEAD
function userButton(userName){
=======
function userButton(userId, userName) {
>>>>>>> main
    dest.innerHTML = userName
    sendTo_ = userName
}





