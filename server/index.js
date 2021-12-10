const WebSocket = require('ws')
const express = require('express')
const app = express()
const path = require('path')


app.use('/',express.static(path.resolve(__dirname,'.../client')))

const server = app.listen(9876)

const wss = new WebSocket.Server({
  server
})

wss.on('connection', function connection(ws) {
  ws.on('message', function message(msg) {
    wss.clients.forEach(function each(client) {
      if (client == ws && client.readyState === WebSocket.OPEN) {
        var data = JSON.parse(msg)
        switch (data.type){
          case 'signin':
            var cred = checkCredential(data.email,data.password)
            client.send(JSON.stringify(cred))
            break

          default:
            console.log(`Wrong expression`)
        }
      }
    })
  })
})

/*
wss.on('connection', function connection(ws) {
  ws.on('message', function message(msg) {
    ws.send('fsfsfs')
    if (ws.readyState == WebSocket.OPEN){
      var data = JSON.parse(msg)
      switch (data.type){
        case 'signin':
          var cred = checkCredential(data.email,data.password)
          ws.send(JSON.stringify(cred))
          break

        default:
          console.log(`Wrong expression`)
      }
    }
    
  })
})*/

function checkCredential(email, password){
  cred = {
    type: 'signin',
    resp: 'false'
  }
  
  if (email == "" && password == ""){
      cred.resp = 'true'
      console.log('works')
  }
  return cred
}
/*
  wss.clients.forEach(function each(client) { 
            if (client.readyState === WebSocket.OPEN) {
              client.send(data);
            }
          })
*/
/*
server.on('upgrade', async function upgrade(request, socket, head) {
    // Do what you normally do in `verifyClient()` here and then use
    // `WebSocketServer.prototype.handleUpgrade()`.
    let args;
  
    try {
      args = await getDataAsync();
    } catch (e) {
      socket.destroy();
      return
    }
  
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request, ...args);
    })
  })*/