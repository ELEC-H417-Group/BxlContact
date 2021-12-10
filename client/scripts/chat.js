
    serverUrl = 'ws://localhost:9876/server'
    const websocket = new WebSocket(serverUrl)

    const inputMessage = document.getElementById('message')
    const sendButton = document.getElementById('send')
    
    chat.addEventListener('click',sendEvent, false);
    
    //on websocket open
    websocket.onopen = function(event) {
        MessageAdd('<div class="message green">You have entered the chat room.</div>');
    };

    //on message receive
    websocket.onmessage = function(event) {
        try{
            var data = JSON.parse(event.data)
            switch (data.type){

                case 'message':
                    MessageAdd('<div class="message">' + data.userId + ': ' + data.message + '</div>');
                    break
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
        MessageAdd('<div class="message blue">You have been disconnected.</div>');
    };

    //on websocket error
    websocket.onerror = function(event) {
        MessageAdd('<div class="message red">Connection to chat failed.</div>');
    };

    function sendEvent(event) {

        var message = inputMessage.value;
    
        if (message.toString().length) {

            var data = {
                type: 'message',
                userId: 1,
                message: message
            };
    
            websocket.send(JSON.stringify(data));
            message.value = "";
        }
    }

    function MessageAdd(message) {
        var chat_messages = document.getElementById('chat-messages');
    
        chat_messages.insertAdjacentHTML("beforeend", message);
        chat_messages.scrollTop = chat_messages.scrollHeight;
    }
