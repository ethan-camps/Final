var canvas;
var fighterFloatImg;
var	laserImg;
var	someX;
var	someY;
var	fighter;
var	players;
var	lasers;
var titleImg;

var yourScore = 0;

var socket = io.connect();
var MARGIN = 40;
var start = false;

function preload(){


	

}

function setup() {
	var newCanvas = createCanvas(windowWidth,windowHeight);
	newCanvas.parent("canvas");


//Arrays for players and lasers on the screen
	players = new Group();
    lasers = new Group();

    titleImg = loadImage('images/infi.png');



}

function draw() {
	background('black');
	fill('white');

//Intro Text
    
	image(titleImg, windowWidth*0.2, 1, 500,150);
	text('You are the RED fighter.', windowWidth*0.4,150);
	text('Use the UP, LEFT, and RIGHT, arrow keys to move your fighter', windowWidth*0.3, 170);
	text('Shoot an infinite amount of lasers at your oppoenents using the X button', windowWidth*0.27, 190);



//METHOD:=====CALLS OVERLAP TO CHECK LASER COLISSION WITH OPPOENT=====//

	players.overlap(lasers, oppHit);

//METHOD: =========CALLS BOUNCE TO CREATE GRAVITY MASS ACTION vs. REACTION COLISSION==///	

	players.bounce(players);


//==========KEY DOWN EVENTS===============/

	if(keyWentDown("x")) {
		//Normalize the rotation
        createLaser();

        //socket.emit('laserShot', {})
		//Broadcast laser position
	}

	//Add rotation to the fighter
	//Left and Right Arrows call fighter rotation
	if(keyDown(LEFT_ARROW)) {
		fighter.rotation -= 4;

		var rotLeft = getRotation(fighter.rotation);
		socket.emit('rotateLeft', {rotLeft, id: fighter.id});


	}

	if(keyDown(RIGHT_ARROW)) {
		fighter.rotation += 4;

		var rotRight = getRotation(fighter.rotation);
		socket.emit('rotateRight', {rotRight, id: fighter.id});

		
	}

	//Add movement to the fighter
	if(keyDown(UP_ARROW)) {

		//Use the p5 play addSpeed to make the fighter move when the up arrow is pressed
		//requires speed amount and angle of direction
		fighter.addSpeed(0.2, fighter.rotation);

		//Change the fighter sprite animation from "float" to "go" to display flames
		//fighter.changeAnimation('go');

		var posX = fighter.position.x;
		var posY = fighter.position.y;

		console.log(fighter.position.x);
		socket.emit('moved', {speed: 0.2, rotation: fighter.rotation, id: fighter.id});

	}

	//Draw all of the sprites generated to the screen
	drawSprites();

}//End of Draw



//METHOD:========CREATE PLAYER============//

function createPlayer(type, someX, someY, someRotation, img, id, friction) {

    //Generate a sprite and connect it to a opponent variable
	var player = createSprite(someX, someY);
	var loadedImg = loadImage(img);

	//Add the opponent Image to the sprite
	player.addImage("idle", loadedImg);

	//player.addImage("dam1", oppDam1);

	//Add the Animation for the opponents fire
	player.addAnimation("move", "images/oppNoFlame.png", "images/oppFlame.png");

	//Set a speed and angle for the opponent floating around
	player.maxSpeed = 6;

	player.friction = .97;

	player.rotation = 90;

	//Establish a posssibility for the opponent to change type when hit
	player.type = type;

	player.id = id;

	//Set a collider for the opponent using the setCollider invisible circle again
	player.setCollider("circle",0 ,0, 20);

	//Add the opponent to the players  group(array) make sure to call loop later to limit how many opponents enter canvas
	players.add(player);

	return player;

}

function createScore(yourScore){
	
	fill('white');
	text('Score' + yourScore);


}

//METHOD:======== CALCULATE ROTATION IN TERMS OF 360 degrees

// This method calculates the rotation of the object to 360deg
function getRotation(rawRotation) {
	let polarity = (rawRotation / Math.abs(rawRotation)) || 1;
	let absRotation = 0;

	if(polarity > 0) {
		absRotation = Math.abs(rawRotation) % 360;
	} else {
		absRotation = 360 - (Math.abs(rawRotation) % 360);
		if(absRotation == 360) {
			absRotation = 0;
		}
	}

	return absRotation;
}



//METHOD:=========CREATE LASER==========/

function createLaser(laserX, laserY, laserRotation, laserSpeed, sendToServer){

	  	var laserShot = "images/laser.png";
    	laserImg = loadImage(laserShot);

    	if(laserRotation === undefined) {
    		laserRotation = fighter.rotation;
    	}

    	if(laserX === undefined) {
    		var laserPos = getLaserPos(fighter.position, getRotation(laserRotation));
    		laserX = laserPos.x;
			laserY = laserPos.y;
    	}
        
		//Create the laser variable and attach it to a new sprite
		var laser = createSprite(laserX, laserY);

		//Add the laoded laser image to the new laser sprite
		laser.addImage(laserImg);

		//Set a speed for the bullet to travel and a direction for it go
		//Make the speed faster but associated to the fighter speed
		//Make the direction of the laser the same orientation as the fighter
		if(laserSpeed === undefined) {
			laserSpeed = fighter.getSpeed();
		}

		laser.setSpeed(10+laserSpeed, laserRotation);

		//Add a laser life so it doesnt continue to pass throught gthe canvas
		laser.life = 40;

		//Add the shot laser to the array of shot lasers already in the canvas
		lasers.add(laser);
		
		if(sendToServer !== false) {
			console.log('firing from ', {laserX: laserX, laserY: laserY, laserRotation: laserRotation, laserSpeed: laserSpeed});
			socket.emit('laserShot', {laserX: laserX, laserY: laserY, laserRotation: laserRotation, laserSpeed: laserSpeed});
		}

		return laser;

}




//METHOD:============GETTING LASER ORIENTATIN RELATIVE TO FIGHTER=========/

// Returns the x and y co-ordinate of the bullet relative to the fighter head
function getLaserPos(fighterPos, fighterRotation) {
   console.log(fighterRotation);

   // calc x and y position with radius of center +
   X = fighterPos.x + 50 * Math.cos(fighterRotation * Math.PI / 180);
   Y = fighterPos.y + 50 * Math.sin(fighterRotation * Math.PI / 180);

   return {
	   x: X,
	   y: Y
   };
}



//METHOD:========OPPOENT HIT==============//

function oppHit(player, laser, yourScore){
	
		yourScore = yourScore + 1;

		console.log('score: ' + yourScore);
		// @TODO you check to see if player is an opponenet


	laser.remove();
}


//================== ALL SOCKET LISTINGS==============//

socket.on('connect', function() {
    console.log("You just joined the game waiting for data updates...");

	var posX = random(0,width);
    var posY = windowHeight/2;

    var img = "images/fighterNoFlame.png";
    var type = 0; 
    var friction = 0.90;

	// set fighter
	fighter = createPlayer(type, posX, posY, 0, img, socket.id);



	// emit an event to tell others you have joined
	socket.emit('join', { type, posX, posY, rotation: 0});


});

socket.on('init', function(data) {
    console.log("I have Connected");
	Object.keys(data).forEach((id) => {
		if(socket.id != id) {
			console.log(data[id].playerInfo);
			createPlayer(
				data[id].playerInfo.type,
				data[id].playerInfo.posX,
				data[id].playerInfo.posY,
				data[id].playerInfo.rotation,
				data[id].playerInfo.img,
				data[id].playerInfo.id
			);
		}
	});
});

socket.on('newPlayer', function(data) {
	console.log('Another player has connected');
	console.log(data);
	createPlayer(
		data.type,
		data.posX,
		data.posY,
		data.rotation,
		data.img,
		data.id
	);
});

socket.on('newLaser', function(data){

	console.log('A Laser has been shot');
	console.log(data);


	laser = createLaser(
		data.laserX,
		data.laserY,
		data.laserRotation,
		data.laserSpeed,
		false
	);
	


});

socket.on('playerMoved', function(data){
	//console.log(data);
	for(let i=0; i<players.size(); i++) {
		if(players.get(i).id == data.id){
			players.get(i).addSpeed(data.speed, data.rotation);
		}
	}
});

socket.on('playerRotateLeft', function(data){

	for(let i=0; i<players.size(); i++){

		if(players.get(i).id == data.id){
			players.get(i).rotation = data.rotLeft;
		}
	}

});

socket.on('playerRotateRight', function(data){

	for(let i=0; i<players.size(); i++){
		if(players.get(i).id == data.id){
			players.get(i).rotation = data.rotRight;
		}
	}
});



socket.on('playerLeft', function(id) {
	console.log('Player has left '+ id);
	console.log(players);
	// @TODO rremove this player from the players on the screen
	for(let i = 0; i < players.size(); i++) {
        if(players.get(i).id == id) {
			players.get(i).remove();
		}
	}
});
