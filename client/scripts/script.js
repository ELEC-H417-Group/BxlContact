
    serverUrl = 'ws://localhost:9876/server'
    const socket = new WebSocket(serverUrl)
    
    //socket.addEventListener('open', openConnection);
    //socket.addEventListener('close', closeConnection);
    //socket.addEventListener('message', readIncomingMessage);
    
    const email = document.getElementById('email')
    const password = document.getElementById('password')
    const button = document.getElementById('signin')
    
    /*
    we have to use JSON.stringify to write and json.parse to read it.
    const message = document.getElementById('messages')
    const input = document.getElementById('message')
    const button = document.getElementById('send')*/
    
    button.addEventListener('click',signIn,false)
    
    
    
    socket.onmessage = function(event) {
        try{
            console.debug("Message WebSocket reçu :", event);
            console.log('wath???')
            var data = JSON.parse(event.data)
            console.log('shhshshshsh')
            switch (data.type){
                case 'signin':
                  if(data.resp == 'true'){
                      console.log('wath???')
                    window.location.href = 'test.html'
                    }
                    break
                case 'signout':
                default:
                    console.log(`Wrong expression`)
         }
        }
        catch(error){
            console.log(error)
        }
        
    } 
    
    
    function signIn(){
    
        cred = {
            type: 'signin',
            email: email.value,
            password: password.value
        }
        console.log('gsgsgsgsg')
        socket.send(JSON.stringify(cred))
    }
    
    
    function generateMessageEntry(msg, type){
        const newMessage = document.createElement('div')
        newMessage.innerText = `${type} says: ${msg}`
        message.appendChild(newMessage)
    } 
    function sendMessage(){
         const msg = input.value
         generateMessageEntry(msg, 'Client')
         console.log(msg)
         server.send(msg)
    }   

