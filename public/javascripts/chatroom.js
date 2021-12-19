// put in the remote server, need to be changed
serverUrl = 'ws://localhost:9876/server'
const websocket = new WebSocket(serverUrl)

const inputMessage = document.getElementById('message')
const sendButton = document.getElementById('chat-message-submit')
const dest = document.getElementById('dest')
const modeBtn = document.getElementById('modeBtn')


var mainUser = {
    userName: dest.getAttribute('data-value'),
}

//send to me by default
var sendTo_ = mainUser.userName

var OnlineList = []

sendButton.addEventListener('click', sendEvent, false);


// for the function secret 

// Update according to the information from the server
var secretMode = false

const changeMode = () => {
    if (modeBtn.value == 'Open Secret Mode') {
        alert('On Secret Mode, the server may not store the message you send, which means no history message can be seen.')
        modeBtn.value = 'Close Secret Mode'
            // send myself some info
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
        userName: mainUser.userName
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
            //get existing users
            case 'users':
                getUsers(data)
                sendHistRequest(mainUser.userName, mainUser.userName)
                break
                //get message receive
            case 'message':
                messageOperation(data)
                break
                //add new user
            case 'newUser':
                addContact(data.userName)
                break
            case 'logout':
                removeUser(data.username)
                break
            case 'getHistory':
                resolveHis(data.content)
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
        messageAdd('<div class="message">' + data.userName + ': ' + data.message + '</div>');
    } else {
        var contactButton = document.getElementById(data.userName)
        contactButton.innerHTML = data.userName + ' (new message!)'
    }
}

function getUsers(data) {
    sendTo_ = data.userName
    var users = JSON.parse(data.users, reviver);
    userButton(mainUser.userName)
    addContacts(users)
    addContact(mainUser.userName)
}

//Send a message to 'sendTo' when clicking on the button send
function sendEvent() {

    var message = inputMessage.value;
    inputMessage.value = ' '

    // if the secret mode is on

    if (message.toString().length) {
        var data = {
            type: 'message',
            sendToUser: sendTo_,
            from: mainUser.userName,
            message: message
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

function removeUser(username) {
    console.log('remove!!!!')
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
        if (secretMode) {
            // do the dh procedure, exchange the key, save the key in local
        }
        this.innerHTML = userName
        dest.innerHTML = userName
        sendTo_ = userName
    }, false)
}

// put History message to <div>
const resolveHis = (result) => {
    var contentList = []
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