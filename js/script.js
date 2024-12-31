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
    this.jumpVelocity = -15;
    this.image = new Image();
    this.image.src = "../img/runner.png"; // Load the image
}

Dinosaur.prototype.draw = function(context) {
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
};

Dinosaur.prototype.jump = function() {
    // console.log("Jump called");
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
    // console.log("Water created at x:", this.x, "y:", this.y); // Debugging log
}

Water.prototype.draw = function(context) {
    var oldFill = context.fillStyle;
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--water-color') || "blue";
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = oldFill;
    // console.log("Water drawn at x:", this.x, "y:", this.y); // Debugging log
};

// FLY
function Fly(gameWidth, groundY) {
    this.width = 30; // fixed width fly
    this.height = 20; // fixed height fly
    this.x = gameWidth;
    
    // Define three different heights
    const heights = [
        groundY - this.height - 120, // High
        groundY - this.height - 80,  // Medium
        groundY - this.height        // Low
    ];
    
    // Randomly select one of the heights
    this.y = heights[Math.floor(Math.random() * heights.length)];
    // console.log("Fly created at x:", this.x, "y:", this.y); // Debugging log
}

Fly.prototype.draw = function(context) {
    var oldFill = context.fillStyle;
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--fly-color') || "black";
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = oldFill;
    // console.log("Fly drawn at x:", this.x, "y:", this.y); // Debugging log
};

// Function to set a cookie
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Function to ask for permission to store high score in cookies
function askPermission() {
    return confirm("Do you allow us to store your high score in cookies?");
}

// Check for cookie permission on page load
window.addEventListener('load', function() {
    var cookiePermission = getCookie("cookiePermission");
    if (cookiePermission === null) {
        var permission = askPermission();
        setCookie("cookiePermission", permission, 365); // Store permission for 1 year
    }
    startGame();
});

// GAME
function Game() {
    var canvas = document.getElementById("game");
    var container = document.getElementById("gameContainer");
    this.width = container.clientWidth;
    this.height = Math.floor(this.width * 0.5); // Adjust the height proportionally
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext("2d");
    document.spacePressed = false;

    // Event listener for spacebar
    document.addEventListener("keydown", function(e) {
        if (e.key === " " || e.key === "ArrowUp") this.spacePressed = true;
    });
    document.addEventListener("keyup", function(e) {
        if (e.key === " " || e.key === "ArrowUp") this.spacePressed = false;
    });

    // Event listener for mouse click
    canvas.addEventListener("mousedown", function() {
        document.spacePressed = true;
    });
    canvas.addEventListener("mouseup", function() {
        document.spacePressed = false;
    });

    // Event listener for restart button
    var restartButton = document.getElementById("restartButton");
    restartButton.addEventListener("click", () => {
        this.reset();
        startGame();
    });

    this.gravity = .7;
    this.divider = new Divider(this.width, this.height);
    this.dino = new Dinosaur(Math.floor(0.1 * this.width), this.divider.y);
    this.obstacles = [];
    this.runSpeed = -5;
    this.paused = false;
    this.noOfFrames = 0;
    this.score = 0;

    // Check for high score in cookies
    var cookiePermission = getCookie("cookiePermission");
    if (cookiePermission === "true") {
        this.highScore = parseInt(getCookie("highScore")) || 0;
    } else {
        this.highScore = 0;
    }
}

Game.prototype.spawnObstacle = function(probability) {
    if (Math.random() <= probability) {
        const obstacleType = Math.random();
        if (obstacleType < 0.33) {
            this.obstacles.push(new Cactus(this.width, this.divider.y));
        } else if (obstacleType < 0.66) {
            this.obstacles.push(new Water(this.width, this.divider.y));
        } else {
            this.obstacles.push(new Fly(this.width, this.divider.y));
        }
    }
}

Game.prototype.update = function() {
    if (this.paused) {
        return;
    }
    if (document.spacePressed && bottomWall(this.dino) >= topWall(this.divider)) {
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

    for (var i = 0; i < this.obstacles.length; i++) {
        this.obstacles[i].x += this.runSpeed;
    }

    for (var i = 0; i < this.obstacles.length; i++) {
        const obstacle = this.obstacles[i];
        const dinoBottom = bottomWall(this.dino);
        const dinoTop = topWall(this.dino);

        if (rightWall(this.dino) >= leftWall(obstacle) && leftWall(this.dino) <= rightWall(obstacle)) {
            if (obstacle instanceof Fly) {
                if ((dinoBottom >= topWall(obstacle) && dinoTop <= bottomWall(obstacle)) || (dinoBottom >= topWall(obstacle) && dinoBottom <= bottomWall(obstacle))) {
                    this.paused = true;
                }
            } else {
                if (dinoBottom >= topWall(obstacle)) {
                    this.paused = true;
                }
            }
        }
    }

    this.noOfFrames++;
    this.score = Math.floor(this.noOfFrames / 10);

    this.jumpDistance = Math.floor(this.runSpeed * (2 * this.dino.jumpVelocity) / this.gravity);

    // Adjust the speed based on the score
    this.adjustSpeed();
};

Game.prototype.draw = function() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.divider.draw(this.context);
    this.dino.draw(this.context);
    for (var i = 0; i < this.obstacles.length; i++) {
        this.obstacles[i].draw(this.context);
    }

    var oldFill = this.context.fillStyle;
    var oldFont = this.context.font;
    this.context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--score-color') || "black";
    this.context.font = getComputedStyle(document.documentElement).getPropertyValue('--score-font') || "20px serif";
    this.context.fillText(this.score, this.width - 40, 30); // Display the score
    this.context.fillText("High Score: " + this.highScore, 10, 30); // Display the high score on the left
    this.context.fillStyle = oldFill;
    this.context.font = oldFont;
};

Game.prototype.adjustSpeed = function() {
    if (this.score % 50 === 0 && this.score !== 0) {
        this.runSpeed -= .03; // Increase speed by 1 unit for every multiple of 50
        console.log("Speed increased to", this.runSpeed);
    }
};

Game.prototype.reset = function() {
    this.dino = new Dinosaur(Math.floor(0.1 * this.width), this.divider.y);
    this.obstacles = [];
    this.paused = false;
    this.noOfFrames = 0;
    this.score = 0;
    this.runSpeed = -5; // Reset the run speed
};

// Display game over and show restart button
Game.prototype.displayGameOver = function() { 
    var oldFill = this.context.fillStyle;
    var oldFont = this.context.font;
    this.context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--game-over-color') || "red";
    this.context.font = getComputedStyle(document.documentElement).getPropertyValue('--game-over-font') || "48px 'Roboto', sans-serif";
    this.context.fillText("Game Over", this.width / 2 - 100, this.height / 2);

    // Update high score if current score is higher
    if (this.score > this.highScore) {
        this.highScore = this.score;
        if (getCookie("cookiePermission") === "true") {
            setCookie("highScore", this.highScore, 365); // Store high score in cookies for 1 year
        }
    }

    // Show the restart button
    var restartButton = document.getElementById("restartButton");
    restartButton.style.display = "block";
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

    // Hide the restart button
    var restartButton = document.getElementById("restartButton");
    restartButton.style.display = "none";
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

function load(timeStamp) {
    game.draw();
    game.dino.draw(game.context); // Ensure the dinosaur is drawn
}

var game = new Game();
game.score = 0;
game.draw();

window.onload = load; 