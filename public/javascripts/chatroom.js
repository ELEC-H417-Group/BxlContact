
serverUrl = 'ws://localhost:9876/server'
const websocket = new WebSocket(serverUrl)
var user = require("../controllers/user_controller");

const inputMessage = document.getElementById('message')
const sendButton = document.getElementById('send')
const contact = document.getElementById('contact')
//contact.innerHTML = mainUser.userName

//send to me by default
var sendTo = mainUser.userId

var mainUser = {
    username:undefined,
    userId:undefined
}

var userId = undefined
    
sendButton.addEventListener('click',sendEvent, false);

//on websocket open
websocket.onopen = function() {

    mainUser.username = user.mainUser.username
    data = {
        type:'users',
        username:mainUser.username
    }
    websocket.send(JSON.stringify(data))

    messageAdd('<div class="message green">You have entered the chat room.</div>')
}

//on message receive
websocket.onmessage = function(event) {
    try{
        var data = JSON.parse(event.data)
        switch (data.type){
            //get existing user
            case 'users':
                mainUser.userId = data.userId
                userButton(userId,mainUser.username)
                addContacts(data.users)
            //get message receive
            case 'message':
                messageAdd('<div class="message">' + data.userId + ': ' + data.message + '</div>');
                break
            //add new user
            case 'newUser':
                addContact(data.userId,data.userName)

            default:
                console.log(`Wrong expression`)
        }
    }
    catch(error){
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

function sendEvent() {

    var message = inputMessage.value;

    if (message.toString().length) {

        var data = {
            type: 'message',
            userId: sendTo,
            message: message
        };
        if(userId != undefined){
            websocket.send(JSON.stringify(data));
        }
        else{ 
            messageAdd('<div class="contact">No contact are choosen</div>');
        }

        message.value = "";
    }
}

function messageAdd(message) {
    var chatMessage = document.getElementById('chat-message');
    chatMessage.insertAdjacentHTML("beforeend", message);
    //chatMessage.scrollTop = chatMessage.scrollHeight;
}

function addContacts(users){
    users.forEach((key, value) => {
        if(key != mainUser.userId){
            addContact(key,value[1])
        }
    })

}
function addContact(userId, userName){
    var contact = document.getElementById('contact');
    contact.insertAdjacentHTML('afterend', '<button id="'+ userId +'">'+ userName +'</button>')
    var contactButton = document.getElementById(userId.toString())
    contactButton.addEventListener('click',userButton(userId,userName),false)
}

function userButton(userId,userName){
    contact.innerHTML = userName
    sendTo = userId
}