// HTTP PORTION

var http = require('http');
var fs = require('fs');
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(5000);

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);
		
	fs.readFile(__dirname + parsedUrl.pathname, 
		function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			res.writeHead(200);
			res.end(data);
  		}
  	); 
  	
}

// this holdas the players in the game
var playerSockets = {
	/*socketId: socketObj*/
}

var players = {
	/*socket_id: {
		playerInfo: {
			type:  3,
			pos: {
				x: 50,
				y: 50
			},
			rotation: 0,
			img: 'images/opp.png'
		}
	}*/
};



// This section takes care of the web socket
var io = require('socket.io').listen(httpServer);

// This triggers when there is a new client connection
io.sockets.on('connection', function (socket) {
	    // @TODO
		console.log("We have a new client: " + socket.id);

		//when someone connects, we let everyone else know that they're here
		socket.on('join', function(data) {
			console.log(data);
			data.id = socket.id;
			data.img = "images/opp.png";
			players[socket.id] = {
				playerInfo: data
			};

			//Send current game stat to this player
		    socket.emit('init', players);

			//Tell everyone else about this player
			socket.broadcast.emit('newPlayer', data);
		});

		//this is called when a player moves
		socket.on('moved', function(data) {
			players[data.id].playerInfo.speed = data.speed;
			players[data.id].playerInfo.rotation = data.rotation;

			socket.broadcast.emit('playerMoved', data);
		});

		socket.on('rotateLeft', function(data){
			players[data.id].playerInfo.rotation = data.rotLeft;
			socket.broadcast.emit('playerRotateLeft', data);

		});

		socket.on('rotateRight', function(data){

			players[data.id].playerInfo.rotation = data.rotRight;
			socket.broadcast.emit('playerRotateRight', data);


		});

		socket.on('laserShot', function(data){

			socket.broadcast.emit('newLaser', data);

		});

	



			//emit('updatePosition', players);socket.

			//socket.broadcast.emit('updatePosition',data);


		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
			delete(players[socket.id]);
			socket.broadcast.emit('playerLeft', socket.id);
		});
	}
);