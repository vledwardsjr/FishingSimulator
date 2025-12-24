let gameManager;

function preload() {
    Assets.preload();
}

function setup() {
    createCanvas(1200, 800);
    frameRate(30);

    gameManager = new GameManager();

    gameManager.init();
}

function draw() {
    gameManager.update();
    gameManager.draw();
}

function keyPressed() {
    gameManager.handleKeyPress(key);
    return false;
}

function keyReleased() {
    if (gameManager.minigameManager && gameManager.minigameManager.handleKeyReleased) {
        gameManager.minigameManager.handleKeyReleased(key);
    }
    return false;
}

function mouseClicked() {
    gameManager.handleMouseClick(mouseX, mouseY);
    return false;
}
