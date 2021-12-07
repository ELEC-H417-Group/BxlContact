const server = new WebSocket('ws://localhost:9876')



const message = document.getElementById('messages')
const input = document.getElementById('message')
const button = document.getElementById('send')

button.disable = true
button.addEventListener('click',sendMessage,false)


server.onopen = function(){
    button.disable = false
}

server.onmessage = function(event) {
    const { data } = event
    generateMessageEntry(data, 'Server')
}

function generateMessageEntry(msg, type){
    const newMessage = document.createElement('div')
    newMessage.innerText = `${type} says: ${msg}`
    message.appendChild(newMessage)

} 

function sendMessage(){
     const text = input.value
     generateMessageEntry(text, 'Client')
     server.send(text)
}