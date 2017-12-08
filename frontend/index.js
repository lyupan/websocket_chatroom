var ws = null
var name = null
// var url = 'ws://websocket-chatroom-lp.herokuapp.com/'
var url = 'ws://localhost:5000'
function connect() {
	name = $('#name').val()
	if ("WebSocket" in window) {
		ws = new WebSocket(url);
		ws.onopen = function() {
			ws.send(JSON.stringify({
				type:'name',
				data:name
			}));
		}
		ws.onmessage = function (event) {
			let msg = JSON.parse(event.data)
			if (msg.type === 'users') {
				enableSend()
				msg.data.forEach(function(item) {
					addUser(item)
				})
				return
			}
			if (msg.type === 'adduser') {
				addUser(msg.data)
				return
			}
			if (msg.type === 'removeuser') {
				removeUser(msg.data)
				return
			}
			if (msg.type) {
				log(msg.type + " " + msg.data)
				return
			}
			log(msg.sender + ": " + msg.data)
		}

	} else {
		alert("WebSocket NOT supported by your Browser!");
	}
}

function send() {
	let msg = $('#msg').val()
	log("You: " + msg)
	if (ws !== null) {
		ws.send(JSON.stringify({
			type:'msg',
			data:msg
		}))
	}
}

function log(text) {
	 $("#cr").append(text+"<br>")
}

function addUser(text) {
	$('#users').append('<li class="list-group-item">'+text+'</li>');
}

function removeUser(text) {
	var listItems = $("#users li");
	listItems.each(function(idx, li) {
	    if ($(li).text() === text) {
	    	console.log("remove ", text)
	    	$(li).remove()
	    }
	});
}

function enableSend() {
	$('#connectBtn').attr("disabled", "disabled")
	$('#sendBtn').removeAttr('disabled');
}