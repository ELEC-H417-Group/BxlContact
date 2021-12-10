const WebSocket = require('ws')
const express = require('express')
const app = express()
const path = require('path')
const { send } = require('process')
const { Console } = require('console')
// Create Http Server
const httpServer = require('http').createServer(app)

app.use('/',express.static(path.resolve(__dirname,'./client')))

const server = app.listen(9876)
// http://localhost:80 or http://localhost
httpServer.listen(process.env.PORT || 5500)

const wss = new WebSocket.Server({
  server
})

// HashMap: {key: userId, value: [ws, userName]}
const usersId = new Map()

wss.on('connection', function connection(ws) {
  var userId = genereteUserId()

  ws.on('message', function message(msg) {
    wss.clients.forEach(function each(client) {
      if (client == ws && client.readyState === WebSocket.OPEN) {
        var data = JSON.parse(msg)
        check(client, data, userId) 
      }
    })
  })
})

function genereteUserId(){
  //Math.floor(Math.random() * 100)
  var userId = Date.now() % 1000
  while (usersId.has(userId)){
    userId = Date.now() % 1000
  }
  return userId
}

function check(client, data, userId){
  switch (data.type){
    case 'signin':
      var cred = checkCredential(data.username,data.password, userId)
      usersId.set(userId,[ws, data.userName])
      client.send(JSON.stringify(cred))
      break
    case 'users':
      var data = {
        type: 'users',
        users: usersId
      }
      client.send(JSON.stringify(data))
      break
    case 'message':
      var ws = usersId.get(data.userId)
      if (ws == undefined){
        console.log('userid undefined')
      }
      else{
        ws.send(JSON.stringify(data))
      }
      break
  
    default:
      console.log(`Wrong expression`)
  }
}


function checkCredential(userName, password, userId){
  cred = {
    type: 'signin',
    resp: 'false',
    userId: userId,
    userName:userName
  }
  
  if (userName == "" && password == ""){
      cred.resp = 'true'
  }
  return cred
}

function broadcast(userId, userName){
  usersId.forEach((key, value) => {
    if(key != userId){
        data = {
          type :'newUser',
          userName: userName,
          userId:userId
        }
        value[0].send(JSON.stringify())
    }
  })
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