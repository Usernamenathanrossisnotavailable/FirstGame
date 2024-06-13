// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1920;
canvas.height = 1200;
document.body.appendChild(canvas);

var rows = 8;
var cols = 3;

var animCounter = 0;
var trackRight = 7;
var trackLeft = 4;
var trackUp = 3;
var trackDown = 2;
var trackRUp = 6;
var trackLUp = 1;
var trackRDown = 5;
var trackLDown = 0;


var curXFrame = 0;
var frameCount = 3;
var srcX = 0;
var srcY = 0;
//0=false,1=neutral,2=true
var right = 1;
var up = 1;

var soundEfx = document.getElementById("soundEfx");
var soundEfx2 = document.getElementById("soundEfx2");
soundEfx2.addEventListener("ended", function () {
    alert("GAME OVER!");
    reset();
});

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
    bgReady = true;
};
bgImage.src = "images/background.png";
var borTReady = false;
var borTImage = new Image();
borTImage.onload = function () {
    borTReady = true;
};
borTImage.src = "images/borderHori.png";
var borSReady = false;
var borSImage = new Image();
borSImage.onload = function () {
    borSReady = true;
};
borSImage.src = "images/borderVert.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
    heroReady = true;
    heroWidth = heroImage.width / cols;
    heroHeight = heroImage.height / rows;
};
heroImage.src = "images/hero.png";
var heroWidth = 0;
var heroHeight = 0;

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
    monsterReady = true;
    monsterWidth = monsterImage.width / monsterCols;
    reset();
};
monsterImage.src = "images/monster.png";
var monsterCols = 6;
var monsterSrcx = 1;
var monsterAnimDelay = 0;

var fireReady = false;
var fireImage = new Image();
fireImage.onload = function () {
    fireReady = true;
};
fireImage.src = "images/fireball.png";

// Game objects
var hero = {
    speed: 256, // movement in pixels per second
    x: 0, // where on the canvas are they?
    y: 0 // where on the canvas are they?
};
var monster = {
    // for this version, the monster does not move, so just and x and y
    x: 0,
    y: 0
};
function fireball(theX,theY,theSpeedX,theSpeedY) {
    this.speedX = theSpeedX;
    this.speedY = theSpeedY;
    this.x = theX;
    this.y = theY;
};
var fireballArray = [];
var monstersCaught = 20;
let gameOver = true;

// Handle keyboard controls
var keysDown = {}; //object were we properties when keys go down
// and then delete them when the key goes up
// so the object tells us if any key is down when that keycode
// is down. In our game loop, we will move the hero image if when
// we go thru render, a key is down
addEventListener("keydown", function (e) {
    //console.log(e.keyCode + " down")
    keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function (e) {
    //console.log(e.keyCode + " up")
    delete keysDown[e.keyCode];
}, false);

// Update game objects
var update = function (modifier) {
    right = 1;
    up = 1;
    if (38 in keysDown && hero.y > borTImage.height + 4) { // holding up key
        up = 2;
        hero.y -= hero.speed * modifier;
    }
    if (40 in keysDown && hero.y < canvas.height - ((borTImage.height * 2) + 6)) { // holding down key
        up = 0;
        hero.y += hero.speed * modifier;
    }
    if (37 in keysDown && hero.x > (borSImage.width + 4)) { // holding left key
        right = 0;
        hero.x -= hero.speed * modifier;
    }
    if (39 in keysDown && hero.x < canvas.width - ((borSImage.width * 2) + 6)) { // holding right key
        right = 2;
        hero.x += hero.speed * modifier;
    }

    // Are they touching?
    if (monsterReady && !gameOver) {
        if (
            hero.x <= (monster.x + monsterWidth)
            && monster.x <= (hero.x + heroWidth)
            && hero.y <= (monster.y + monsterImage.height)
            && monster.y <= (hero.y + heroHeight)
        ) {
            --monstersCaught; // keep track of our “score”
            if (monstersCaught <= 0) {
                gameOver = true;
                hero.speed = 0;
                soundEfx2.src = "sounds/smb_world_clear.wav";
                soundEfx2.play();
            } else {
                soundEfx.src = "sounds/smb_kick.wav";
                soundEfx.play();
                reset();
            }
        }
        if (monsterAnimDelay <= 0) {
            if (monstersCaught < 20) {
                if (monsterSrcx == 0) {
                    monsterSrcx = 1;
                    monsterAnimDelay = 30;
                    var xSpeed = (Math.random() * 3);
                    var ySpeed = 3 - xSpeed;
                    if (hero.x < monster.x) {
                        xSpeed *= -1;
                    }
                    if (hero.y < monster.y) {
                        ySpeed *= -1;
                    }
                    var projectile = new fireball(monster.x, monster.y, xSpeed, ySpeed);
                    fireballArray[fireballArray.length] = projectile;
                    soundEfx.src = "sounds/smb_fireball.wav";
                    soundEfx.play();
                } else {
                    monsterSrcx = 0;
                    monsterAnimDelay = monstersCaught + 10;
                }
            } else {
                monsterAnimDelay = 5;
            }
        } else {
            monsterAnimDelay--;
        }
    }
    if (!gameOver) {
        console.log(fireballArray.length);
        for (let i = 0; i < fireballArray.length; i++) {
            if (
                hero.x <= (fireballArray[i].x + fireImage.width)
                && fireballArray[i].x <= (hero.x + heroWidth)
                && hero.y <= (fireballArray[i].y + fireImage.height)
                && fireballArray[i].y <= (hero.y + heroHeight)
            ) {
                hero.speed = 0;
                gameOver = true;
                soundEfx2.src = "sounds/smb_mariodie.wav";
                soundEfx2.play();
            }
            if (
                fireballArray[i].x <= 0 - fireImage.width
                || fireballArray[i].x >= canvas.width
                || fireballArray[i].y <= 0 - fireImage.height
                || fireballArray[i].y >= canvas.height
            ) {
                delete fireballArray[i];
                fireballArray.splice(i,1);
            } else {
                fireballArray[i].x += fireballArray[i].speedX;
                fireballArray[i].y += fireballArray[i].speedY;
            }
        };
    }
    if (heroReady) {
        if (animCounter == 5) { // adjust this to change "walking speed" of animation
            if (curXFrame == 0) {
                curXFrame = 1;
            } else if (curXFrame == 1) {
                curXFrame = 2;
            } else if (curXFrame == 2) {
                curXFrame = 1.1;
            } else {
                curXFrame = 0;
            }
            //curXFrame = ++curXFrame % frameCount; //Updating the sprite frame index
            // it will count 0,1,2,0,1,2,0, etc
            animCounter = 0;
        } else {
            animCounter++;
        }

        // it will count 0,1,2,0,1,2,0, etc
        srcX = parseInt(curXFrame) * heroWidth; //Calculating the x coordinate for spritesheet
        if (right == 0) {
            if (up == 0) {
                srcY = trackLDown * heroHeight;
            } else if (up == 2) {
                srcY = trackLUp * heroHeight;
            } else {
                srcY = trackLeft * heroHeight;
            }
        } else if (right == 2) {
            if (up == 0) {
                srcY = trackRDown * heroHeight;
            } else if (up == 2) {
                srcY = trackRUp * heroHeight;
            } else {
                srcY = trackRight * heroHeight;
            }
        } else {
            if (up == 0) {
                srcY = trackDown * heroHeight;
            } else if (up == 2) {
                srcY = trackUp * heroHeight;
            }
        }
        // this code picks one frame to use if they are not moving
        if (right == 1 && up == 1) {
            srcX = 1 * heroWidth;
            srcY = 2 * heroHeight;
        }
    }
};

// The main game loop
var main = function () {
    var now = Date.now();
    var delta = now - then;
    update(delta / 1000);
    render();
    then = now;
    // Request to do this again ASAP
    requestAnimationFrame(main);
};

// Draw everything in the main render function
var render = function () {
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
    }
    if (borTReady) {
        ctx.drawImage(borTImage, 0, 0);
        ctx.drawImage(borTImage, 0, canvas.height-borTImage.height);
    }
    if (borSReady) {
        ctx.drawImage(borSImage, 0, 0);
        ctx.drawImage(borSImage, canvas.width - borSImage.width, 0);
    }
    if (heroReady) {
        ctx.drawImage(heroImage, srcX, srcY, heroWidth, heroHeight, hero.x, hero.y,
            heroWidth, heroHeight);
    }
    if (monsterReady) {
        ctx.drawImage(monsterImage, monsterSrcx*monsterWidth, 0, monsterWidth, monsterImage.height, monster.x, monster.y,
            monsterWidth,monsterImage.height);
    }
    if (fireReady) {
        for (let i = 0; i < fireballArray.length; i++) {
            ctx.drawImage(fireImage, fireballArray[i].x, fireballArray[i].y);
        }
    }
    // Score
    ctx.fillStyle = "rgb(250, 250, 250)";
    ctx.font = "24px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Enemy Health: " + monstersCaught, 32, 32);
}

// Reset the game when the player catches a monster
var reset = function () {
    if (gameOver) {
        hero.x = canvas.width / 2;
        hero.y = canvas.height / 2;
        monstersCaught = 20;
        hero.speed = 256;
        for (let i = 0; i < fireballArray.length; i++) {
            delete fireballArray[i];
        }
        fireballArray = [];
        gameOver = false;
    } else {
        
    }
    //Place the monster somewhere on the screen randomly
    monster.x = borSImage.width + (Math.random() * (canvas.width - (borSImage.width * 2) - monsterWidth));
    monster.y = borTImage.height + (Math.random() * (canvas.height - (borTImage.height * 2) - (monsterImage.height)));
};

// Let's play this game!
var then = Date.now();
main(); // call the main game loop.