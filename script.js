const plane = document.getElementById('plane');
const scoreDisplay = document.getElementById('score');
const comboText = document.getElementById('comboText'); // For the combo indicator
const gameContainer = document.getElementById('gameContainer'); // For the background loop
let planeY = 50; // Initial Y position of the plane

let gravity = 0.1; // Very low gravity to make the plane float slowly
let lift = -5; // Minimal jump
let velocity = 0;
let score = 0;
let comboCounter = 0; // To track buildings passed for combos
let gameOver = false;
let spawnInterval = 3000; // Start with a slow spawn interval (3 seconds)

// Function to make the plane jump
function jump() {
    if (!gameOver) {
        velocity = lift; // Minimal jump
    }
}

// Key event listener for plane movement
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        jump();
    }
});

// Update plane position
function updatePlane() {
    velocity += gravity;
    planeY += velocity;
    plane.style.top = planeY + 'px';

    // Prevent plane from going offscreen
    if (planeY <= 0) {
        planeY = 0;
        velocity = 0;
    }
    if (planeY >= window.innerHeight - 100) { // Adjust for larger plane size
        planeY = window.innerHeight - 100;
        velocity = 0;
    }
}

// Function to show combo text every 5 buildings
function showComboText(comboWords) {
    comboText.textContent = comboWords;
    comboText.style.display = 'block';
    setTimeout(() => {
        comboText.style.display = 'none';
    }, 5000); 
}

// Array of random combo words
const comboWords = ['Osama Fr','Damn Abdullah',"Yooooooooooo","Rizzler For a Reason","Prestigious Bomber","Nigga aint Nigga-ing"];

// Creating the buildings (obstacles)
function createBuilding() {
    const scale = Math.random() * 0.5 + 1.25; // Larger scale factor for bigger buildings
    const buildingWidth = 100 * scale; // Larger width proportional to scale
    const buildingHeight = 250 * scale; // Larger height proportional to scale
    const buildingGap = window.innerHeight * 0.3; // 30% gap between top and bottom buildings

    const rand = Math.random(); // Random value to determine building arrangement

    if (rand < 0.4) {
        // 40% chance to create a bottom building only
        createBottomBuilding(buildingHeight, buildingWidth);
    } else if (rand < 0.8) {
        // 40% chance to create a top building only
        createTopBuilding(buildingHeight, buildingWidth);
    } else {
        // 20% chance to create both top and bottom buildings with a gap
        createTopBuilding(buildingHeight, buildingWidth);
        createBottomBuilding(buildingHeight, buildingWidth, buildingGap);
    }

    // Gradually increase the time between new buildings (increase spawn interval)
    if (spawnInterval < 6000) {
        spawnInterval += 100; // Increase spawn interval as game progresses
    }

    // Continue spawning buildings
    if (!gameOver) {
        setTimeout(createBuilding, spawnInterval);
    }
}

// Create bottom building function
function createBottomBuilding(height, width, gap = 0) {
    const bottomBuilding = document.createElement('div');
    bottomBuilding.classList.add('obstacle');
    bottomBuilding.style.height = height + 'px'; // Proportional height
    bottomBuilding.style.width = width + 'px'; // Proportional width
    bottomBuilding.style.bottom = '0';
    bottomBuilding.style.transform = 'scaleY(-1)'; // Flip the bottom building vertically
    bottomBuilding.style.right = '-100px'; // Position it just offscreen
    bottomBuilding.style.position = 'absolute';

    // Adjust the gap if there's a top building
    if (gap > 0) {
        bottomBuilding.style.height = `calc(${height}px - ${gap}px)`; // Ensure the gap is maintained
    }

    document.getElementById('gameContainer').appendChild(bottomBuilding);

    // Animate the bottom building
    animateBuilding(bottomBuilding);
}

// Create top building function
function createTopBuilding(height, width) {
    const topBuilding = document.createElement('div');
    topBuilding.classList.add('obstacle');
    topBuilding.style.height = height + 'px'; // Proportional height
    topBuilding.style.width = width + 'px'; // Proportional width
    topBuilding.style.top = '0';
    topBuilding.style.right = '-100px'; // Position it just offscreen
    topBuilding.style.position = 'absolute';

    document.getElementById('gameContainer').appendChild(topBuilding);

    // Animate the top building
    animateBuilding(topBuilding);
}

// Function to animate buildings
function animateBuilding(building) {
    const interval = setInterval(() => {
        const currentRight = parseInt(window.getComputedStyle(building).right);
        building.style.right = currentRight + 5 + 'px'; // Move building to the left
        if (currentRight > window.innerWidth + 100) {
            clearInterval(interval);
            building.remove(); // Remove the building after it moves offscreen
        }
    }, 20);
}

// Function to check for collisions with buildings
function checkCollision() {
    const buildings = document.querySelectorAll('.obstacle');
    const planeRect = plane.getBoundingClientRect();

    buildings.forEach(building => {
        const buildingRect = building.getBoundingClientRect();
        // Check if the plane crashes into any building
        if (
            planeRect.right > buildingRect.left &&
            planeRect.left < buildingRect.right &&
            planeRect.bottom > buildingRect.top &&
            planeRect.top < buildingRect.bottom
        ) {
            // End game if a collision happens
            gameOver = true;
            alert("Damn Rizzler! You Are Rewarded a Whopping " + score + " Abduls."); // Display score on game over
            window.location.reload(); // Reload the game
        }
    });
}

// Function to update the score and show combo indicators every 5 buildings
function updateScore() {
    const buildings = document.querySelectorAll('.obstacle');
    buildings.forEach(building => {
        const buildingRect = building.getBoundingClientRect();
        const planeRect = plane.getBoundingClientRect();
        // If the plane has passed the building, increment the score
        if (buildingRect.right < planeRect.left && !building.passed) {
            score++;
            comboCounter++;
            building.passed = true;
            scoreDisplay.textContent = `9/11 Bypasses : ${score}`;

            // Show combo indicator every 5 buildings
            if (comboCounter % 5 === 0) {
                const randomWord = comboWords[Math.floor(Math.random() * comboWords.length)];
                showComboText(randomWord);
            }
        }
    });
}

// Game loop
function gameLoop() {
    if (!gameOver) {
        updatePlane();
        checkCollision(); // Check for collisions with buildings
        updateScore();

        requestAnimationFrame(gameLoop);
    }
}


// Looping mirrored background
function loopBackground() {
    let backgroundPosition = 0;
    const backgroundSpeed = 1;

    setInterval(() => {
        backgroundPosition -= backgroundSpeed;
        gameContainer.style.backgroundPosition = `${backgroundPosition}px 0px`;
        if (Math.abs(backgroundPosition) >= gameContainer.clientWidth) {
            backgroundPosition = 0; // Reset background for seamless loop
        }
    }, 20);
}

// Start the game
setTimeout(createBuilding, spawnInterval); // Start with a delay for the first building
gameLoop();
loopBackground(); // Start the background loop
