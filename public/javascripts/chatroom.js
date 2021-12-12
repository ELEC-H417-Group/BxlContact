const server = new WebSocket('ws://localhost:9876')

const message = document.getElementById('messages')
const input = document.getElementById('message')
const button = document.getElementById('send')

button.disable = true
button.addEventListener('click', sendMessage, false)


server.onopen = function() {
    button.disable = false
}

server.onmessage = function(msg) {
    generateMessageEntry(msg.data, 'Server')
}

function generateMessageEntry(msg, type) {
    const newMessage = document.createElement('div')
    newMessage.innerText = `${type} says: ${msg}`
    message.appendChild(newMessage)
}

function sendMessage() {
    const msg = input.value
    generateMessageEntry(msg, 'Client')
    console.log(msg)
    server.send(msg)
}