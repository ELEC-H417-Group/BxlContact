const WebSocket = require('ws')
const express = require('express')
const app = express()
const path = require('path')
// Create Http Server
const httpServer = require('http').createServer(app)

app.use('/',express.static(path.resolve(__dirname,'./client')))

const server = app.listen(9876)
// http://localhost:80 or http://localhost
httpServer.listen(process.env.PORT || 80)

const wss = new WebSocket.Server({
    server
})

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.toString())
      }
    })
  })
})
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