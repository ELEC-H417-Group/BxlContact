
const server = new WebSocket('ws://localhost:9876')



const email = document.getElementById('email')
const password = document.getElementById('password')
const button = document.getElementById('signin')

/*
we have to use JSON.stringify to write and json.parse to read it.
const message = document.getElementById('messages')
const input = document.getElementById('message')
const button = document.getElementById('send')*/

button.addEventListener('click',signIn,false)


server.onmessage = function(msg) {
    console.log('wath???')
    window.location.href = 'test.html'
    var data = JSON.parse(msg)
    console.log('shhshshshsh')
    switch (data.type){
        case 'signin':
            if(data.resp == 'true'){
                console.log('wath???')
                window.location.href = 'test.html'
            }
            break
        default:
            console.log(`Wrong expression`)
    }
} 

server.onerror = function(msg){
    console.error(msg)
}
server.onclose = function(msg) {
    console.log(msg)
}

function signIn(){

    cred = {
        type: 'signin',
        email: email.value,
        password: password.value
    }
    server.send(JSON.stringify(cred))
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