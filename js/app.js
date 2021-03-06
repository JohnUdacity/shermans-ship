// global variables
var SCORE = 0;
var LIVES = 3; 
var STARTED = false; // initial game state?
var GAMEOVER = false;

var FPS = 60;
var SHIP_SPEED = 10;
var SHIP_ANGLE = 100;
var VECTOR_X = 0;
var VECTOR_Y = 0;

// canvas variables
var WIDTH = 800;
var HEIGHT = 600;
var TOP = 0;
var LEFT = 0;
var BOTTOM = 600;
var RIGHT = 800;

var SPACEBG = 'images/space-oj.jpg';
var spaceInfo = new ImageInfo(400, 300, 800, 600);

var SHIP = 'images/redship.png';
var shipInfo = new ImageInfo(37.5, 49.5, 75, 99, 15);

var SLASER = 'images/shot.png';
var slaserInfo = new ImageInfo(5, 5, 10, 10, 3)

var ROCK = 'images/rock1.png';
var rockInfo = new ImageInfo(50.5, 42, 101, 84, 20); //6

var DEBRIS = 'images/debris.png';

// use this to multiply an object to radians
var TO_RADIANS = Math.PI / 180;

// Math functions 
// helper functions for velocity
var angleToVector = function(angle){
	return [Math.cos(angle), Math.sin(angle)];
};

// disance between to objects
var distToObj = function (px, py, qx, qy) {
	return Math.sqrt(Math.pow(px - qx, 2) + Math.pow(py - qy, 2));
};

function ImageInfo(centerX, centerY, width, height, radius) {
  this.centerX = centerX;
  this.centerY = centerY;
  this.width = width;
  this.height = height;
  this.radius = radius;
}

var shipObj = function(x, y, vx, vy, angle, angleV, image, info){
	this.sprite ='';
	this.x = x;
	this.y = y;
	this.velocity = [vx, vy];
	this.angle = angle;
	this.angleV = angleV;
	this.imageCenterX = null;
	this.imageCenterY = null;
	this.radius = null;
	this.thrust = false;
};

shipObj.prototype.render = function(){
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.rotate(this.angle * TO_RADIANS);
	ctx.drawImage(Resources.get(SHIP), 0, 0, shipInfo.width, shipInfo.height, -shipInfo.centerX, -shipInfo.centerY, shipInfo.width, shipInfo.height);
	ctx.restore();
};

var gameObj = function(x, y, vx, vy, angle, angleV, image, info){
	this.sprite ='';
	this.x = x;
	this.y = y;
	this.velocity = [vx, vy];
	this.angle = angle;
	this.angleV = angleV;
	this.imageCenterX = null;
	this.imageCenterY = null;
	this.radius = null;
	this.animated = null;
};

gameObj.prototype.render = function(){
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.rotate(this.angle * TO_RADIANS);
	ctx.drawImage(Resources.get(SHIP), 0, 0, shipInfo.width, shipInfo.height, -shipInfo.centerX, -shipInfo.centerY, shipInfo.width, shipInfo.height);
	ctx.restore();
};

var Player = function(vx, vy, angle, angleV, image, info){
	shipObj.call(this);
	this.sprite = SHIP;
	this.x = 400;
	this.y = 300;
	this.velocity = [vx, vy];
	this.thrust = false;
	this.angle = angle;
	this.angleV = angleV;
	this.imageCenterX = info.centerX;
	this.imageCenterY = info.centerY;
	this.radius = info.radius;
};

Player.prototype = Object.create(shipObj.prototype);
Player.prototype.constructor = Player;
//Player.prototype.render = function(vx, vy, angle, angleV, image, info){
// 	ctx.save();
// 	ctx.translate(this.x, this.y);
// 	ctx.rotate(this.angle * TO_RADIANS);
// 	ctx.drawImage(Resources.get(SHIP), 0, 0, shipInfo.width, shipInfo.height, -shipInfo.centerX, -shipInfo.centerY, shipInfo.width, shipInfo.height);
// 	ctx.restore();
// };
// For every downKey, the Player will move accordingly
Player.prototype.update = function(dt){
	// control ship movement based on acceleration and not velocity
	// angle and angleV control the orientation of the ship and how fast it rotates respectively
	// key handlers should control angleV and update method should update self.angle += self.angleV

	// basic physics = position = x,y, velocity = vx, vy, accel = angleToVector
	// position update is position += velocity, velocity update is velocity += acceleration

	// ship class has pos, vel, angle, thrust
	// position update is self.pos[0] += self.vel[0], self.pos[1] += self.vel[1]

	// update thrust
	if (38 in keysDown) { // pushing down the up key turns on the thrust
		this.thrust = true;
	} else {
		this.thrust = false;
	}
	// update angular velocity to turn ship
	if (37 in keysDown) { // left rotation
		this.angleV = -5;
	} else if (39 in keysDown) { // right rotation
		this.angleV = +5;
	} else {
		this.angleV = 0;
	}
	// update ang
	this.angle += this.angleV;
	// update position
	if (this.y <= 0) {
		this.y = HEIGHT; // reset to top of screen after you hit bottom
	} else {
		this.y = (this.y + this.velocity[1]) % HEIGHT; // ship update y wrap around screen
	}
	if (this.x <= 0) {
		this.x = WIDTH; // reset to right side when you hit left side
	} else {
		this.x = (this.x + this.velocity[0]) % WIDTH;  // ship update x wrap around screen
	}
	// update velocity
	// velocity update is acceleration in direction of forward vector which is given by angleToVector
	// we update the forward vector on thrust.
	if (this.thrust) {
		var angle = this.angle * TO_RADIANS;
		var accel = angleToVector(angle);
		this.velocity[0] += accel[0] / 10;
		this.velocity[1] += accel[1] / 10;
	}

	// friction needed to help control ship!
	this.velocity[0] *= 0.99;
	this.velocity[1] *= 0.99;
};
Player.prototype.shoot = function(){
	var vangle = this.angle * TO_RADIANS;
	var forwardDir = angleToVector(vangle);
	var laserX = this.x + this.radius * forwardDir[0];
	var laserY = this.y + this.radius * forwardDir[1];
	var laserXVel = this.velocity[0] + 400 * forwardDir[0];
	var laserYVel = this.velocity[1] + 400 * forwardDir[1];
	var laser = new Laser(laserX, laserY, laserXVel, laserYVel, this.angle, 0, SLASER, slaserInfo);
	lasers.push(laser);
	console.log(lasers);
};

// Rock class
var Rock = function(x, y, vx, vy, angle, angleV, image, info){
    gameObj.call(this);
    this.sprite = ROCK;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.angleV = angleV;
    this.velocity = [vx, vy];
    this.imageCenterX = info.centerX;
    this.imageCenterY = info.centerY;
    this.radius = info.radius;
};
Rock.prototype = Object.create(gameObj.prototype);
Rock.prototype.constructor = Rock;
Rock.prototype.render = function (x, y, vx, vy, angle, angleV, image, info) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle * TO_RADIANS);
    ctx.drawImage(Resources.get(ROCK), 0, 0, rockInfo.width, rockInfo.height, -rockInfo.centerX, -rockInfo.centerY, rockInfo.width, rockInfo.height);
    ctx.restore();
};
Rock.prototype.update = function(dt){
    this.x += this.velocity[0];
    this.y += this.velocity[1];
    this.angle += this.angleV;
    if (this.x >= RIGHT){
    	this.x = LEFT;
    } else if (this.x <= LEFT){
    	this.x = RIGHT;
    }
    if (this.y >= BOTTOM){
    	this.y = TOP;
    } else if (this.y <= TOP){
    	this.y = BOTTOM;
    }
};

var Laser = function(x, y, vx, vy, angle, angleV, image, info){
	gameObj.call(this);
	this.x = x;
	this.y = y;
	this.angle = angle;
	this.angleV = angleV;
	this.velocity = [vx, vy];
	this.imageCenterX = slaserInfo.centerX;
	this.imageCenterY = slaserInfo.centerY;
	this.radius = info.radius;
};
Laser.prototype = Object.create(gameObj.prototype);
Laser.prototype.constructor = Laser;
Laser.prototype.render = function(x, y, vx, vy, angle, angleV, image, info){
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.rotate(this.angle * TO_RADIANS);
	ctx.drawImage(Resources.get(SLASER), 0, 0, slaserInfo.width, slaserInfo.height, -this.imageCenterX, -this.imageCenterY, slaserInfo.width, slaserInfo.height);
	ctx.restore();
};


// Helper Function to make rocks
// array of rocks to be rendered
var rocks = [];
// array of lasers to be rendered
var lasers = [];

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// make individual rocks to be pushed to rocks array
var rockMaker = function(){
    if (rocks.length < 3) {
        var x = getRandomIntInclusive(0, WIDTH);
        var y = getRandomIntInclusive(0, HEIGHT);
        var vx = getRandomIntInclusive(-6, 6);
        var vy = getRandomIntInclusive(-6, 6);
        var angle = getRandomIntInclusive(0, 90);
        var angleV = getRandomIntInclusive(-6, 6);
        var image = ROCK;
        var info = rockInfo;
        // new Rock = (x, y, vx, vy, angle, angleV, image, info);
        var singleRock = new Rock(x, y, vx, vy, angle, angleV, ROCK, rockInfo);
        rocks.push(singleRock);
    }
};
// handles object collision
var groupCollide = function(){
	null; // researching collision math
}


// make new Player at default x, y position that's in Player
var player = new Player(0, 0, 0, 0, SHIP, shipInfo);

// keysDown is an object that holds an array of keyCodes to be referenced to move the ship
// It makes it much easier to account for two keyDown actions like left+up
var keysDown = {};

addEventListener("keydown", function (e) {
  keysDown[e.keyCode] = true;
  console.log(keysDown);
  switch(e.keyCode){
    case 37: case 39: case 38:  case 40: // arrow keys
    case 32: e.preventDefault(); break; // space
    default: break; // do not block other keys
  }
  if (e.keyCode == 32) {
    player.shoot(); // Space key to shoot nothing here yet
  }
}, false);

addEventListener("keyup", function (e) {
  delete keysDown[e.keyCode];
}, false);