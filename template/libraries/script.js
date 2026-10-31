const startButton = document.getElementById("start-button"); // Gets the start button
const landingScreen = document.getElementById("landing-screen"); // Gets the landing screen
const gameScreen = document.getElementById("game-screen"); // Gets the game screen
const gameCanvas = document.getElementById("game-canvas"); // Gets the area where we draw the game
const context = gameCanvas.getContext("2d"); // Allows us to draw on the canvas

let assets; // Stores our loaded images
let stars = []; // List of all stars
let monsters = []; // List of all aliens
let spaceship; // Stores the spaceship's position and size
let gameLost = false; // Tracks whether the player has lost
let gameWidth = 0; // Width of the game area
let gameHeight = 0; // Height of the game area
let lastFrameTime = 0; // Time of the previous animation frame
let spawnTimer = 0; // Tracks the time until the next alien spawns
let moveLeft = false; // Checks if the left arrow key is pressed
let moveRight = false; // Checks if the right arrow key is pressed
let bullets = []; // Stores all bullets currently on the screen
let lastShotTime = 0; // Stores when the last bullet was fired
let explosions = []; // Stores active explosion animations
let score = 0; // Stores the player's current score
let gameWon = false; // Tracks whether the player has won


/*
 * LOAD IMAGE
 * This function loads an image from a file path.
 * It waits until the image is ready before using it in the game.
 */

function loadImage(path) {
    return new Promise((resolve, reject) => {

        const image = new Image(); // Create a new image

        image.onload = () => resolve(image); // Return the loaded image

        image.onerror = () => reject(new Error("Image could not load: " + path)); // Handle missing images

        image.src = path; // Start loading the image
    });
}


/*
 * RESIZE CANVAS
 * This function adjusts the game screen to fit the browser window.
 * It sets the canvas width and height to match the screen.
 */

function resizeCanvas() {

    // Get the current size of the game screen
    gameWidth = gameScreen.clientWidth;
    gameHeight = gameScreen.clientHeight;

    // Set the canvas size to match the game screen
    gameCanvas.width = gameWidth;
    gameCanvas.height = gameHeight;
}


/*
 * INITIALIZE GAME
 * This function sets up the game when the player presses Start.
 * It creates 120 stars and prepares the alien spawning system.
 */

function initializeGame() {
    gameLost = false; // Reset the game over status
    gameWon = false; // Reset the win status
    score = 0; // Reset the score when a new game starts
    spawnTimer = 0; // Reset the alien spawn timer
    bullets = []; // Remove any bullets from the previous game
    explosions = []; // Clear explosions from the previous game
    lastShotTime = 0; // Reset the shooting cooldown

    // Create 120 stars at random positions
    stars = Array.from({ length: 120 }, () => ({
        x: Math.random() * gameWidth, // Random horizontal position
        y: Math.random() * gameHeight, // Random vertical position
        size: 3 + Math.random() * 8 // Random star size
    }));

    monsters = []; // Start with no aliens

// Create the spaceship at the bottom center of the screen
spaceship = {
    width: 60, // Spaceship width in pixels
    height: 60, // Spaceship height in pixels
    x: gameWidth / 2 - 30, // Center the spaceship horizontally
    y: gameHeight - 80 // Position it 20 pixels above the bottom
};}


/*
 * SPAWN MONSTER
 * This function creates one new alien.
 * Each alien has a random image, position, and movement direction.
 */

function spawnMonster() {

    // Randomly select one of the three alien images
    const index = Math.floor(Math.random() * 3);
    const image = assets.monsters[index];

    // Set the alien size
    const monsterWidth = 30;
    const monsterHeight = monsterWidth * image.height / image.width;

    // Add the new alien to the game
    monsters.push({
        image: image, // Alien image
        x: Math.random() * (gameWidth - monsterWidth), // Random horizontal position
        y: 0, // Spawn at the top of the screen
        width: monsterWidth, // Alien width
        height: monsterHeight, // Alien height
        speedX: Math.random() < 0.5 ? -120 : 120 // Random left or right movement
    });
}


/*
 * SHOOT BULLET
 * This function creates a bullet above the spaceship.
 * The player can only shoot once every 500 milliseconds.
 */

function shootBullet() {

    const currentTime = performance.now(); // Get the current time

    // Check if 500 milliseconds have passed since the last shot
    if (currentTime - lastShotTime < 500) {
        return; // Stop if the cooldown is not finished
    }

    lastShotTime = currentTime; // Save the time of this shot

    // Create a new bullet above the spaceship
    bullets.push({
        x: spaceship.x + spaceship.width / 2 - 5, // Center the bullet
        y: spaceship.y - 20, // Position it above the spaceship
        width: 10, // Bullet width
        height: 20 // Bullet height
    });
}


/*
 * UPDATE GAME
 * This function updates all aliens during the game.
 * A new alien spawns every 0.5 seconds.
 * Aliens move horizontally and drop 200 pixels at the screen edges.
 * If an alien reaches the bottom, the player loses.
 */

function updateGame(deltaSeconds) {


    // Update all active explosions
    for (const explosion of explosions) {
        explosion.timer += deltaSeconds; // Increase the animation timer
    }

    // Remove explosions after 0.3 seconds
    explosions = explosions.filter(explosion => explosion.timer < 0.3);


    // Move the spaceship depending on which arrow key is pressed
    if (moveLeft) {
        spaceship.x -= 300 * deltaSeconds; // Move left at 300 pixels per second
    }

    if (moveRight) {
        spaceship.x += 300 * deltaSeconds; // Move right at 300 pixels per second
    }

    // Keep the spaceship inside the game screen
    spaceship.x = Math.max(0, Math.min(spaceship.x, gameWidth - spaceship.width));


    // Move every bullet upwards
    for (const bullet of bullets) {
        bullet.y -= 500 * deltaSeconds; // Move upwards at 500 pixels per second
    }

    // Remove bullets that leave the top of the screen
    bullets = bullets.filter(bullet => bullet.y + bullet.height > 0);


// Check if a bullet hits an alien
for (const bullet of bullets) {
    for (const monster of monsters) {

        // Check if the bullet and alien overlap
        if (
            bullet.x < monster.x + monster.width &&
            bullet.x + bullet.width > monster.x &&
            bullet.y < monster.y + monster.height &&
            bullet.y + bullet.height > monster.y
        ) {
            
        bullet.hit = true; // Mark the bullet as hit
        monster.hit = true; // Mark the alien as hit


        // Find which alien type was destroyed
        const monsterType = assets.monsters.indexOf(monster.image);

        // Give points depending on the alien color
        score += monsterType + 1; // Yellow +1, Blue +2, Pink +3

        // Check if the player has reached 100 points
        if (score >= 100) {
            gameWon = true; // Player wins the game
            return; // Stop updating the game
        }

        console.log("Score:", score); // Show the score in the browser console


        // Create an explosion at the alien's position
        explosions.push({
            x: monster.x, // Horizontal explosion position
            y: monster.y, // Vertical explosion position
            width: monster.width, // Explosion width
            height: monster.height, // Explosion height
            frames: assets.explosions[assets.monsters.indexOf(monster.image)], // Matching color
            timer: 0 // Tracks the animation time
        });

        break; // Stop checking this bullet

        }
    }
}

// Remove bullets and aliens that were hit
bullets = bullets.filter(bullet => !bullet.hit);
monsters = monsters.filter(monster => !monster.hit);


    // Count how much time has passed
    spawnTimer += deltaSeconds;

    // Spawn one new alien every 2 seconds
    if (spawnTimer >= 0.5) {
        spawnMonster(); // Create a new alien
        spawnTimer -= 0.5; // Reset the timer while keeping extra time
    }

    // Go through every alien in the monsters array
    for (const monster of monsters) {

        // Update the alien's horizontal position
        monster.x += monster.speedX * deltaSeconds;

        // Check if the alien reaches the left or right edge
        if (monster.x <= 0 || monster.x + monster.width >= gameWidth) {

            // Keep the alien inside the screen
            monster.x = Math.max(0, Math.min(monster.x, gameWidth - monster.width));

            monster.speedX *= -1; // Reverse horizontal direction
            monster.y += 200; // Move the alien 200 pixels down
        }

        // Check if the alien reaches the bottom
        if (monster.y + monster.height >= gameHeight) {

            monster.y = gameHeight - monster.height; // Keep the alien at the bottom
            gameLost = true; // End the game
            return; // Stop updating the aliens
        }}}



/*
 * DRAW GAME
 * This function draws everything visible on the game screen.
 * It draws the background, stars, and aliens.
 * If the player loses, it displays the Game Over image.
 */


/*
 * DRAW GAME
 * This function draws everything visible on the game screen.
 * It draws the background, stars, aliens, spaceship, bullets and explosions.
 * It also displays the score and the win or lose screen.
 */

function drawGame() {

    // Draw the dark background
    context.fillStyle = "#080817";
    context.fillRect(0, 0, gameWidth, gameHeight);

    // Draw all stars
    for (const star of stars) {
        context.drawImage(
            assets.star,
            star.x,
            star.y,
            star.size,
            star.size
        );
    }

    // Draw all aliens
    for (const monster of monsters) {
        context.drawImage(
            monster.image,
            monster.x,
            monster.y,
            monster.width,
            monster.height
        );
    }

    // Draw the spaceship
    context.drawImage(
        assets.spaceship,
        spaceship.x,
        spaceship.y,
        spaceship.width,
        spaceship.height
    );

    // Draw all bullets
    for (const bullet of bullets) {
        context.drawImage(
            assets.bullet,
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height
        );
    }

    // Draw all active explosions
    for (const explosion of explosions) {

        // Select the current explosion frame
        const frame = Math.floor(explosion.timer / 0.1);

        context.drawImage(
            explosion.frames[frame],
            explosion.x,
            explosion.y,
            explosion.width * 2,
            explosion.height * 2
        );
    }

    
    // Draw the HighScore design at the top of the screen
    context.drawImage(
        assets.highScore, // Score background image
        gameWidth / 2 - 125, // Center horizontally
        10, // Distance from the top
        250, // Image width
        80 // Image height
    );

    // Display the current score on top of the image
    context.fillStyle = "#ffffff"; // White text
    context.font = "bold 30px Arial"; // Text style
    context.textAlign = "center"; // Center the text

    context.fillText(
        score, // Current points
        gameWidth / 2, // Center horizontally
        120 // Vertical position below the HighScore image 
    );


    // Display Game Over if the player loses
    if (gameLost) {
        context.drawImage(assets.gameLost, 0, 0, gameWidth, gameHeight);
    }

    // Display You Win if the player wins
    if (gameWon) {
        context.drawImage(assets.gameWon, 0, 0, gameWidth, gameHeight);
    }
}

/*
 * GAME LOOP
 * This function keeps the game running.
 * It updates the game while the player is playing.
 * If the player wins or loses, the movement stops.
 */

function gameLoop(frameTime) {

    // Calculate the time since the previous frame
    const deltaSeconds = Math.min((frameTime - lastFrameTime) / 1000, 0.05);

    lastFrameTime = frameTime; // Save the current frame time

    // Only update the game if the player has not won or lost
    if (!gameLost && !gameWon) {
        updateGame(deltaSeconds); // Update spaceship, aliens and bullets
    }

    drawGame(); // Draw the current game screen

    // Request the next animation frame
    window.requestAnimationFrame(gameLoop);
}


/*
 * START BUTTON
 * This code runs when the player clicks the Start button.
 * It loads all game images, opens the game screen,
 * and starts the game animation.
 */

startButton.addEventListener("click", async () => {

    startButton.disabled = true; // Prevent multiple clicks

    // Load the star and Game Over images
    const star = await loadImage("../Assets/Star.png");
    const gameLostImage = await loadImage("../Assets/GameLost.png");
    const gameWonImage = await loadImage("../Assets/YouWin.png"); // Load the victory image
    const highScoreImage = await loadImage("../Assets/HighScore.png"); // Load the score design

    // Load the three alien images
    const monster1 = await loadImage("../Assets/Monster%201.png");
    const monster2 = await loadImage("../Assets/Monster%202.png");
    const monster3 = await loadImage("../Assets/Monster%203.png");
    // Load the spaceship image
    const spaceshipImage = await loadImage("../Assets/Spaceship.png");
    const bulletImage = await loadImage("../Assets/Bullet.png"); // Load bullet image

   
    // Load the three explosion stages for each alien color
    const explosionYellow = [
        await loadImage("../Assets/Explosion1Yellow.png"),
        await loadImage("../Assets/Explosion2Yellow.png"),
        await loadImage("../Assets/Explosion3Yellow.png")
    ];

    const explosionBlue = [
        await loadImage("../Assets/Explosion1Blue.png"),
        await loadImage("../Assets/Explosion2Blue.png"),
        await loadImage("../Assets/Explosion3Blue.png")
    ];

    const explosionPink = [
        await loadImage("../Assets/Explosion1Pink.png"),
        await loadImage("../Assets/Explosion2Pink.png"),
        await loadImage("../Assets/Explosion3Pink.png")
    ];


    
    assets = {
        star: star,
        monsters: [monster1, monster2, monster3],
        spaceship: spaceshipImage,
        bullet: bulletImage,
        gameLost: gameLostImage,
        gameWon: gameWonImage, // Store the victory image
        explosions: [explosionYellow, explosionBlue, explosionPink],
        highScore: highScoreImage, // Store the score design
    };

    // Hide the landing screen and display the game
    landingScreen.hidden = true;
    gameScreen.hidden = false;

    resizeCanvas(); // Set the game screen size
    initializeGame(); // Create stars and aliens

    lastFrameTime = performance.now(); // Save the starting time
    requestAnimationFrame(gameLoop); // Start the game animation
});

/*
 * WINDOW RESIZE
 * This code runs whenever the browser window changes size.
 * It adjusts the canvas and redraws the game.
 */

window.addEventListener("resize", () => {

    // Only resize if the game screen is visible
    if (!gameScreen.hidden) {
        resizeCanvas(); // Adjust the canvas to the new window size
        drawGame(); // Redraw everything
    }
});

/*
 * KEYBOARD CONTROLS
 * This code controls the spaceship using the keyboard.
 * Arrow keys move the spaceship left and right.
 * The spacebar shoots bullets.
 */

// Detect when a key is pressed
window.addEventListener("keydown", (event) => {

    if (event.key === "ArrowLeft") {
        event.preventDefault(); // Prevent page scrolling
        moveLeft = true; // Start moving left
    }

    if (event.key === "ArrowRight") {
        event.preventDefault(); // Prevent page scrolling
        moveRight = true; // Start moving right
    }

    if (event.code === "Space") {
        event.preventDefault(); // Prevent page scrolling

        if (!gameScreen.hidden && !gameLost && !gameWon) {
    shootBullet(); // Only shoot while the game is active
}
    }
});

// Detect when a key is released
window.addEventListener("keyup", (event) => {

    if (event.key === "ArrowLeft") {
        moveLeft = false; // Stop moving left
    }

    if (event.key === "ArrowRight") {
        moveRight = false; // Stop moving right
    }
});