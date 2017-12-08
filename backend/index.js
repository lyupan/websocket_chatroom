const WebSocketServer = require("ws").Server
const http = require("http")
const express = require("express")
const app = express()
const port = process.env.PORT || 5000

app.use(express.static(__dirname + "/"))
const server = http.createServer(app)
server.listen(port)

// console.log("http server listening on %d", port)
const wss = new WebSocketServer({server: server})
// console.log("websocket server created")
var users = []

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
  	message = JSON.parse(message)
  	if (!message.type || !message.data) {
  		ws.send(JSON.stringify({
  			type:'error',
  			data:'Wrong message format: type or data undefined'
  		}))
  		return
  	}

  	if (message.type === 'name') {
      if (users.indexOf(message.data) > -1) {
        ws.send(JSON.stringify({
          type:'error',
          data:'Duplicate name'
        }))
        return
      }
      ws.chat_username = message.data
      users.push(message.data)
      ws.send(JSON.stringify({
        type: 'users',
        data:users
      }))
      wss.clients.forEach(function (client) {
        if (client !== ws && client.chat_username) {
          client.send(JSON.stringify({
            type: 'adduser',
            data: message.data
          }))
        }
      })
  		return
  	}

  	if (!ws.chat_username) {
  		ws.send(JSON.stringify({
  			type:'error',
  			data:'Login before sending message'
  		}))
  		return
  	}
    
  	wss.clients.forEach(function (client) {
  		if (client !== ws && client.chat_username) {
  			client.send(JSON.stringify({
  				sender: ws.chat_username,
  				data: message.data
  			}))
  		}
  	})
    // console.log('received: %s', message);
  });

  ws.on("close", function() {
    // console.log("websocket connection close")
    let idx = users.indexOf(ws.chat_username)
    if (idx > -1) {
      users.splice(idx, 1)
    }
    wss.clients.forEach(function (client) {
      if (client !== ws && client.chat_username) {
        client.send(JSON.stringify({
          type: 'removeuser',
          data: ws.chat_username
        }))
      }
    })
    // console.log(ws.chat_username + " closed!!!")
  });
});