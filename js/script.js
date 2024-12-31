function topWall(obj) {
    return obj.y;
}
function bottomWall(obj) {
    return obj.y + obj.height;
}
function leftWall(obj) {
    return obj.x;
}
function rightWall(obj) {
    return obj.width + obj.x;
}

// DINOSAUR
function Dinosaur(x, dividerY) {
    this.width = 55;
    this.height = 70;
    this.x = x;
    this.y = dividerY - this.height;
    this.vy = 0;
    this.jumpVelocity = -20;
    this.image = new Image();
    this.image.src = "../img/runner.png"; // Load the image
}

Dinosaur.prototype.draw = function(context) {
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
};

Dinosaur.prototype.jump = function() {
    console.log("Jump called");
    this.vy = this.jumpVelocity;
};

Dinosaur.prototype.update = function(divider, gravity) {
    this.y += this.vy;
    this.vy += gravity;
    if (bottomWall(this) > topWall(divider) && this.vy > 0) {
        this.y = topWall(divider) - this.height;
        this.vy = 0;
        return;
    }
};

// DIVIDER
function Divider(gameWidth, gameHeight) {
    this.width = gameWidth;
    this.height = 10; // Set the height to match the water height
    this.x = 0;
    this.y = gameHeight - this.height - Math.floor(0.2 * gameHeight);
}
Divider.prototype.draw = function(context) {
    var oldFill = context.fillStyle;
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--divider-color') || "brown";
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = oldFill;
};

// CACTUS
function Cactus(gameWidth, groundY) {
    this.width = 16; // fixed width cactus
    this.height = (Math.random() > 0.5) ? 30 : 70; // two different cactus
    this.x = gameWidth;
    this.y = groundY - this.height;
}

Cactus.prototype.draw = function(context) {
    var oldFill = context.fillStyle;
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--cactus-color') || "green";
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = oldFill;
};

// WATER
function Water(gameWidth, groundY) {
    this.width = 50; // fixed width water
    this.height = 10; // fixed height water
    this.x = gameWidth;
    this.y = groundY; // Align with the top of the divider
    console.log("Water created at x:", this.x, "y:", this.y); // Debugging log
}

Water.prototype.draw = function(context) {
    var oldFill = context.fillStyle;
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--water-color') || "blue";
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = oldFill;
    console.log("Water drawn at x:", this.x, "y:", this.y); // Debugging log
};

// GAME
function Game() {
    var canvas = document.getElementById("game");
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d");
    document.spacePressed = false;
    document.addEventListener("keydown", function(e) {
        if (e.key === " ") this.spacePressed = true;
    });
    document.addEventListener("keyup", function(e) {
        if (e.key === " ") this.spacePressed = false;
    });
    this.gravity = 1.5;
    this.divider = new Divider(this.width, this.height);
    this.dino = new Dinosaur(Math.floor(0.1 * this.width), this.divider.y);
    this.obstacles = [];
    this.runSpeed = -10;
    this.paused = false;
    this.noOfFrames = 0;
}

Game.prototype.spawnObstacle = function(probability) {
    if (Math.random() <= probability) {
        if (Math.random() < 0.5) {
            this.obstacles.push(new Cactus(this.width, this.divider.y));
        } else {
            this.obstacles.push(new Water(this.width, this.divider.y));
        }
    }
}

Game.prototype.update = function() {
    if (this.paused) {
        return;
    }
    if (document.spacePressed == true && bottomWall(this.dino) >= topWall(this.divider)) {
        console.log("Conditions met");
        this.dino.jump();
    }
    this.dino.update(this.divider, this.gravity);

    if (this.obstacles.length > 0 && rightWall(this.obstacles[0]) < 0) {
        this.obstacles.shift();
    }

    if (this.obstacles.length == 0) {
        this.spawnObstacle(0.5);
    } else if (this.obstacles.length > 0 && this.width - leftWall(this.obstacles[this.obstacles.length - 1]) > this.jumpDistance + 150) {
        this.spawnObstacle(0.05);
    }

    for (i = 0; i < this.obstacles.length; i++) {
        this.obstacles[i].x += this.runSpeed;
    }

    for (i = 0; i < this.obstacles.length; i++) {
        if (rightWall(this.dino) >= leftWall(this.obstacles[i]) && leftWall(this.dino) <= rightWall(this.obstacles[i]) && bottomWall(this.dino) >= topWall(this.obstacles[i])) {
            this.paused = true;
        }
    }

    this.noOfFrames++;
    this.score = Math.floor(this.noOfFrames / 10);

    this.jumpDistance = Math.floor(this.runSpeed * (2 * this.dino.jumpVelocity) / this.gravity);
};

Game.prototype.draw = function() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.divider.draw(this.context);
    this.dino.draw(this.context);
    for (i = 0; i < this.obstacles.length; i++) {
        this.obstacles[i].draw(this.context);
    }

    var oldFill = this.context.fillStyle;
    var oldFont = this.context.font;
    this.context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--score-color') || "black";
    this.context.font = getComputedStyle(document.documentElement).getPropertyValue('--score-font') || "20px serif";
    this.context.fillText(this.score, this.width - 40, 30);
    this.context.fillStyle = oldFill;
    this.context.font = oldFont;
};

Game.prototype.reset = function() {
    this.dino = new Dinosaur(Math.floor(0.1 * this.width), this.divider.y);
    this.obstacles = [];
    this.paused = false;
    this.noOfFrames = 0;
    this.score = 0;
    this.runSpeed = -10; // Reset the run speed
};

Game.prototype.displayGameOver = function() {
    var oldFill = this.context.fillStyle;
    var oldFont = this.context.font;
    this.context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--game-over-color') || "red";
    this.context.font = getComputedStyle(document.documentElement).getPropertyValue('--game-over-font') || "48px 'Roboto', sans-serif";
    this.context.fillText("Game Over", this.width / 2 - 100, this.height / 2);
    this.context.fillStyle = oldFill;
    this.context.font = oldFont;
};

var game = new Game();
var animationFrameId;

function main(timeStamp) {
    game.update();
    game.draw();
    if (!game.paused) {
        animationFrameId = window.requestAnimationFrame(main);
    } else {
        game.displayGameOver();
    }
}

function startGame() {
    if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = window.requestAnimationFrame(main);
    document.removeEventListener("keydown", startGameOnSpace);
}

function startGameOnSpace(e) {
    if (e.key === " ") {
        startGame();
    }
}

document.addEventListener("keydown", startGameOnSpace);

document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        game.reset();
        startGame();
    }
});