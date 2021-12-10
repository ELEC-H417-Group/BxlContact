
    serverUrl = 'ws://localhost:9876/server'
    const websocket = new WebSocket(serverUrl)
    //const mainUser = require('./script.js').mainUser;

    const inputMessage = document.getElementById('message')
    const sendButton = document.getElementById('send')
    const contact = document.getElementById('contact')
    //contact.innerHTML = mainUser.userName

    //send to me by default
    //var sendTo = mainUser.userId
    
    sendButton.addEventListener('click',sendEvent, false);
    
    //on websocket open
    websocket.onopen = function() {

        mainUser = localStorage.getItem('mainUser')
        console.log(mainUser.userId)
        data = {
            type:'users'
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
    
            websocket.send(JSON.stringify(data));
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