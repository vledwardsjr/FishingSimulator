//Class containing and managing most of the gameplay logic
class GameManager {
    //GameManager constructor
    constructor() {
        this.stateManager = new StateManager();
        this.upgradeManager = new UpgradeManager(this)
        this.inventory = new Inventory();
        this.shop = new Shop(this);
        this.minigameManager = new MinigameManager();
        this.money = 10;
        this.roentgens = 0; //radioactivity
        this.mutationThreshold = 1000;
        this.lastCaught = null;
        this.autoSold = false;

        this.areaMenuOpen = false;

        this.backButtonVisible = false;
        this.showCompletionOverlay = false;
        this.inventoryButtonVisible = true;
        this.settingsOpen = false;
        this.saveDeletionWarning = false;
        this.showInfoPopup = false;

        this.autosave = {
            enabled: true,
            interval: 30000, // 30 seconds
            lastSaveTime: 0,
            count: 0,

            // autosave triggers
            onFishCaught: true,
            onMutation: true,
            onUpgrade: true,
            onStateChange: true,
        };
    }

    //separate method for loading to prevent desync
    init() {
        this.load();
    }

    //update miniGameState or time-based progression.
    update() {
        const currentTime = millis();

        // Time-based autosave
        if (this.autosave.enabled &&
            currentTime - this.autosave.lastSaveTime >= this.autosave.interval) {
            this.autosaveGame("time_autosave");
        }

        if (this.minigameManager.isMinigameActive()) {
            const result = this.minigameManager.update();
            if (result && result.completed) {
                this.handleMinigameCompletion(result.success);
            }

            if (this.roentgens >= this.mutationThreshold) {
                this.roentgens = this.mutationThreshold; //clamp
            }
        } else if (this.showCompletionOverlay) {
            return; //prevent roentgens gain during popup
        }

        const deltaTimeSeconds = deltaTime / 1000;
        const currentState = this.stateManager.currentState;
        let roentgensPerSecond = 0;

        if (currentState === GAME_STATES.BACKGROUND1 || currentState === GAME_STATES.FISHING_DOCK1) {
            roentgensPerSecond = 0.001;
        } else if (currentState === GAME_STATES.BACKGROUND2 || currentState === GAME_STATES.FISHING_DOCK2) {
            roentgensPerSecond = 1;
        } else if (currentState === GAME_STATES.BACKGROUND3 || currentState === GAME_STATES.FISHING_DOCK3) {
            roentgensPerSecond = 10;
        }

        this.roentgens += roentgensPerSecond * deltaTimeSeconds;

        if (this.roentgens >= this.mutationThreshold) {
            const mutations = ['luck', 'strength', 'sight'];
            const randomMutation = mutations[floor(random(mutations.length))];
            this.upgradeManager.obtainMutation(randomMutation);
            this.roentgens = 0; //reset again to be sure.

            if (this.autosave.onMutation) {
                this.autosaveGame("mutation_obtained");
            }
        }

    }

    //finish minigame and give reward
    handleMinigameCompletion(success = true) {
        this.minigameManager.endGame();
        frameRate(30);
        this.backButtonVisible = true;
        this.inventoryButtonVisible = true;

        if (success) {
            const state = this.stateManager.currentState;
            this.handleMinigameReward(state);

            if (this.autosave.onFishCaught) {
                this.autosaveGame("fish_caught")
            }
        } else {
            this.handleMinigameReward();
        }
    }

    //give fish and show the overlay displaying the fish
    handleMinigameReward(state) {
        let fish;
        if (state) {
            let fishList;
            if (state === GAME_STATES.FISHING_DOCK1) fishList = AREA_FISHES.AREA1;
            else if (state === GAME_STATES.FISHING_DOCK2) fishList = AREA_FISHES.AREA2;
            else if (state === GAME_STATES.FISHING_DOCK3) fishList = AREA_FISHES.AREA3;
            else return;

            fish = new Fish(fishList);
            if (!this.inventory.isFull()) {
                this.autoSold = false;
                this.inventory.addFish(fish);
            } else {
                this.autoSold = true;
                this.money += fish.calculateValue();
            }
        }
        this.lastCaught = fish;
        this.toggleCompletionOverlay();
    }

    toggleCompletionOverlay() {
        this.showCompletionOverlay = !this.showCompletionOverlay;
    }

    //draw all game elements
    draw() {
        this.currentMouseX = mouseX;
        this.currentMouseY = mouseY;

        if (this.settingsOpen) {
            this.drawSettingsOverlay();
            return;
        }

        background(this.stateManager.getCurrentBackground());

        if (this.stateManager.getCurrentState() === GAME_STATES.MAIN_MENU) {
            this.drawMainMenu();
            return;
        }

        this.drawPersistentUI();

        if (this.areaMenuOpen) {
            this.drawAreaMenu();
        }

        if (this.inventory.isOpen) {
            this.inventory.draw();
            return;
        }

        this.drawStateContent();

        if (this.minigameManager.isMinigameActive()) {
            this.minigameManager.draw();
        }

        if (this.showCompletionOverlay) {
            this.drawCompletionOverlay();
        }
    }

    //draw UI that always show(outside of minigames)
    drawPersistentUI() {
        if (this.minigameManager.isMinigameActive()) return; // don't draw ui during minigames(prevent overlap)

        //display settings icon
        image(Assets.SETTINGS_ICON, 20, 720, 80, 80);
        if (this.inside(20, 720, 100, 800)) {
            fill(255, 255, 255, 60);
            rect(20, 720, 80, 80, 10);
        }
        //display inventory icon
        image(Assets.INV_ICON, 1100, 20, 100, 100);
        if (this.inventoryButtonVisible && !this.minigameManager.isMinigameActive() && this.inside(1090, 30, 1200, 130)) {
            fill(255, 255, 255, 60);
            stroke(255, 255, 255);
            rect(1100, 40, 90, 90, 10);
        }

        const shouldShowBackButton = this.backButtonVisible &&
            !this.minigameManager.isMinigameActive() &&
            this.stateManager.previousState &&
            this.stateManager.previousState !== "" &&
            this.stateManager.previousState !== this.stateManager.currentState;

        if (shouldShowBackButton) {
            image(Assets.BACK_ARROW, 0, 0, 120, 120);

            if (this.inside(0, 0, 120, 120)) {
                fill(255, 255, 255, 60);
                stroke(255, 255, 255);
                rect(0, 0, 120, 120);
            }
        }

        noStroke();
        fill(0, 255, 0);
        textAlign(RIGHT, TOP);
        textSize(48);
        text('$' + this.money, width, 0);

        if (this.roentgens > 0.1) {
            this.drawRoentgens();
        }
        this.upgradeManager.drawMutations();
    }

    //display the current radioactivity level of the player
    drawRoentgens() {
        fill(200, 195, 30);
        textAlign(RIGHT, TOP);
        let x = width - 20;
        let y = 210;

        let displayRoentgens = Math.floor(this.roentgens * 100) / 100;

        textSize(32);
        text(displayRoentgens.toFixed(2) + "R", x, y);

        let icon = Assets.RAD;
        image(icon, x - 200, y - 30, 67, 67)
    }

    //method for drawing main menu
    drawMainMenu() {
        fill(97, 97, 97);
        //button rects
        rect(800, 100, 200, 100);
        rect(800, 250, 200, 100);
        rect(800, 400, 200, 100);
        rect(800, 550, 200, 100);

        fill(227, 227, 227);
        textAlign(CENTER, CENTER);
        textSize(36);
        //button labels
        text("START", 900, 150);
        text("SETTINGS", 900, 300);
        text("INFO", 900, 450);
        text("QUIT", 900, 600);

        fill(255, 255, 255, 60);
        stroke(255, 255, 255);

        if (this.showInfoPopup) {
            this.drawInfoPopup();
            return;
        }
        //draw hover highlights
        if (this.inside(800, 100, 1000, 200)) {
            rect(800, 100, 200, 100);
        } else if (this.inside(800, 250, 1000, 350)) {
            rect(800, 250, 200, 100);
        } else if (this.inside(800, 400, 1000, 500)) {
            rect(800, 400, 200, 100);
        } else if (this.inside(800, 550, 1000, 650)) {
            rect(800, 550, 200, 100);
        }

    }

    drawAreaMenu() {
    image(Assets.AREA_MENU, 200, 200, 800, 400);
    
    const carLevel = this.upgradeManager.upgrades.car.level;
    const travelFee = carLevel >= 3 ? 0 : 10;

    // Display travel fee info
    fill(255);
    textAlign(CENTER, TOP);
    textSize(24);
    text(`Travel Fee: $${travelFee}`, 600, 210);
    
    // Area 1 - Always unlocked
    if (this.inside(225, 235, 451, 565)) {
        fill(255, 255, 255, 60);
        stroke(255, 255, 255);
        rect(225, 235, 227, 330);
    }
    
    // Area 2 - Check if unlocked
    if (carLevel >= 1) {
        // Area 2 is unlocked
        if (this.inside(475, 235, 701, 565)) {
            fill(255, 255, 255, 60);
            stroke(255, 255, 255);
            rect(485, 235, 227, 330);
        }
    } else {
        // Area 2 is locked - draw red overlay
        fill(255, 0, 0, 100);
        stroke(255, 0, 0);
        rect(485, 235, 227, 330);
        
        // Draw lock icon or text
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(20);
        text("LOCKED\nCar Level 1\nRequired", 485 + 113.5, 235 + 165);
    }
    
    // Area 3 - Check if unlocked
    if (carLevel >= 2) {
        // Area 3 is unlocked
        if (this.inside(748, 235, 983, 565)) {
            fill(255, 255, 255, 60);
            stroke(255, 255, 255);
            rect(748, 235, 228, 330);
        }
    } else {
        // Area 3 is locked - draw red overlay
        fill(255, 0, 0, 100);
        stroke(255, 0, 0);
        rect(748, 235, 228, 330);
        
        // Draw lock icon or text
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(20);
        if (carLevel >= 1) {
            text("LOCKED\nCar Level 2\nRequired", 748 + 114, 235 + 165);
        } else {
            text("LOCKED\nCar Level 2\nRequired", 748 + 114, 235 + 165);
        }
    }
}

    //draw info
    drawInfoPopup() {
        stroke(0, 0, 0);
        fill(140, 140, 140);
        rect(200, 50, 800, 700);
        textSize(64);
        textAlign(CENTER, TOP);
        fill(255, 255, 255);
        text("INFO", 600, 75);
        textWrap(WORD);
        textSize(14);
        text(INFO.OVERVIEW, 200, 150, 800);

        fill(0, 0, 240);
        text(INFO.MINIGAMES, 200, 250, 800);

        fill(180, 175, 70);
        text(INFO.INVENTORY, 200, 350, 800);

        fill(0, 200, 0);
        text(INFO.SHOP, 200, 450, 800);

        fill(80, 0, 180);
        text(INFO.MUTATIONS, 200, 550, 800);
    }

    //draw settings
    drawSettingsOverlay() {
        image(Assets.SETTINGS_MENU, 350, 50, 600, 600);

        
        //save deletion popup
        if (this.saveDeletionWarning) {
            fill(0, 0, 0)
            rect(350, 50, 600, 600);
            textAlign(CENTER, CENTER);
            textSize(64);
            fill(255, 0, 0);
            text("WARNING", 650, 100);
            fill(200, 0, 0);
            textSize(24);
            text("Once save data is deleted, it can not be recovered.", 650, 155);
            fill(255, 255, 255);
            textSize(36);
            text("Are you sure you want to continue \n with the deletion process?", 650, 250);

            fill(40, 140, 40);
            rect(400, 350, 200, 50);

            fill(140, 40, 40);
            rect(700, 350, 200, 50);

            fill(255, 255, 255, 60);
            if (this.inside(400, 350, 600, 400)) {
                rect(400, 350, 200, 50);
            } else if (this.inside(700, 350, 900, 400)) {
                rect(700, 350, 200, 50);
            }

            fill(0, 0, 0);
            textSize(16);
            noStroke();
            text("YES", 500, 375);
            text("NO", 800, 375);

            return;
        }
        stroke(0, 0, 0);
        strokeWeight(2);
        textSize(32);
        textAlign(LEFT, CENTER);

        //autosave settings
        fill(0, 0, 0);
        rect(450, 300, 50, 50);
        let autosaveStatus = "unknown";
        if (this.autosave.enabled) {
            fill(0, 255, 0, 100);
            autosaveStatus = "enabled";
        } else {
            fill(255, 0, 0, 100);
            autosaveStatus = "disabled";
        }
        rect(450, 300, 50, 50);

        if (this.inside(450, 300, 500, 350)) {
            fill(255, 255, 255, 60);
            rect(450, 300, 50, 50);
        }
        text("Autosave: " + autosaveStatus, 510, 325);

        //clear save data
        fill(0, 0, 0);
        rect(450, 400, 50, 50);
        fill(100, 0, 0);
        rect(455, 405, 40, 40);
        if (this.inside(450, 400, 500, 450)) {
            fill(255, 255, 255, 60);
            rect(450, 400, 50, 50);
        }
        text("Clear saved data", 510, 425);

        //return to main menu
        if (this.stateManager.getCurrentState() != GAME_STATES.MAIN_MENU) {
            fill(90, 90, 90);
            rect(450, 500, 50, 50);
            image(Assets.BACK_ARROW, 450, 500, 50, 50);
            if (this.inside(450, 500, 500, 550)) {
                fill(255, 255, 255, 60);
                rect(450, 500, 50, 50);
            }
            fill(255, 0, 0);
            text("Return to main menu", 510, 525);
        }


    }

    //draw the overlay displaying the fish the player caught, whether it is autoSold, or if the player failed the minigame entirely
    drawCompletionOverlay() {
        fill(255, 255, 255, 150);
        rect(0, 0, width, height);
        noStroke();
        textAlign(CENTER, TOP);
        if (this.lastCaught) {
            fill(0, 255, 0);
            this.lastCaught.drawCentered();
            if (this.autoSold) {
                fill(255, 0, 0);
                textSize(32);
                text("autosold for $(inventory full)", width / 2, height / 2 + 200);
            }
        } else {
            fill(255, 0, 0);
            textSize(64);
            text("YOU FAILED!", width / 2, height / 2);
        }
        textSize(32);
        fill(0, 0, 0);
        text("Click anywhere to continue.", width / 2, height / 2 + 300);
    }

    //draw special states like inventory or shop or the base hovering highlights
    drawStateContent() {
        const state = this.stateManager.currentState;

        if (state === GAME_STATES.INVENTORY) {
            this.inventory.draw();
        } else if (state === GAME_STATES.SHOP) {
            this.shop.draw();
        } else {
            this.drawStateHighlights(state);
        }
    }

    //draw the highlights for all elements on the background
    drawStateHighlights(state) {
        if (state === GAME_STATES.BACKGROUND1 && !this.areaMenuOpen) {
            this.drawBackground1Highlights();
        } else if (state === GAME_STATES.BACKGROUND2 && !this.areaMenuOpen) {
            this.drawBackground2Highlights();
        } else if (state === GAME_STATES.BACKGROUND3 && !this.areaMenuOpen) {
            this.drawBackground3Highlights();
        } else if (state === GAME_STATES.FISHING_DOCK1 && !this.minigameManager.isMinigameActive()) {
            this.drawFishingDock1Highlights();
        } else if (state === GAME_STATES.FISHING_DOCK2 && !this.minigameManager.isMinigameActive()) {
            this.drawFishingDock2Highlights();
        } else if (state === GAME_STATES.FISHING_DOCK3 && !this.minigameManager.isMinigameActive()) {
            this.drawFishingDock3Highlights();
        } else if (state === GAME_STATES.SHOP) {
            this.drawShopHighlights();
        }
    }

    drawBackground1Highlights() {
        if (this.inside(76, 274, 157, 353)) {
            fill(255, 255, 255, 60); stroke(255, 255, 255); rect(76, 274, 81, 79);
        }
        if (this.inside(749, 333, 899, 423)) {
            fill(255, 255, 255, 60); stroke(255, 255, 255); rect(749, 333, 150, 90);
        }
        if (this.inside(47, 559, 158, 637)) {
            fill(255, 255, 255, 60); stroke(255, 255, 255); rect(47, 559, 111, 78);
        }
    }

    drawBackground2Highlights() {
        if (this.inside(370, 635, 481, 713)) {
            fill(255, 255, 255, 60); stroke(255, 255, 255); rect(370, 635, 111, 78);
        }
        if (this.inside(55, 350, 280, 485)) {
            fill(255, 255, 255, 60); stroke(255, 255, 255); rect(55, 350, 225, 135);
        }
        if (this.inside(450, 500, 600, 590)) {
            fill(255, 255, 255, 60); stroke(255, 255, 255); rect(450, 500, 150, 90);
        }
    }

    drawBackground3Highlights() {
        //Shop Highlight
        if (this.inside(1011, 529, 1134, 611)) {
            fill(255, 255, 255, 60);
            stroke(255, 255, 255);
            rect(1011, 529, 123, 82);
        }
        //Area change highlight
        if (this.inside(884, 209, 926, 268)) {
            fill(255, 255, 255, 60);
            stroke(255, 255, 255);
            rect(884, 209, 42, 59);
        }
        //Fishing dock highlight
        if (this.inside(218, 644, 364, 715)) {
            fill(255, 255, 255, 60);
            stroke(255, 255, 255);
            rect(218, 644, 146, 71);
        }
    }

    drawShopHighlights() {
        if (this.inside(301, 441, 450, 541)) {
            fill(255, 255, 255, 60);
            stroke(255, 255, 255);
            rect(301, 441, 149, 100);
        }
        if (this.inside(501, 441, 650, 541)) {
            fill(255, 255, 255, 60);
            stroke(255, 255, 255);
            rect(501, 441, 149, 100);
        }
        if (this.inside(701, 441, 850, 541)) {
            fill(255, 255, 255, 60);
            stroke(255, 255, 255);
            rect(701, 441, 149, 100);
        }
        if (this.inside(901, 441, 971, 541)) {
            fill(255, 255, 255, 60);
            stroke(255, 255, 255);
            rect(901, 441, 70, 100);
        }
    }

    drawFishingDock1Highlights() {
        if (this.inside(850, 400, 1010, 565)) {
            fill(255, 255, 255, 60);
            stroke(255, 255, 255);
            rect(850, 400, 160, 165);
        }
    }

    drawFishingDock2Highlights() {
        if (this.inside(945, 410, 1105, 575)) {
            fill(255, 255, 255, 60);
            stroke(255, 255, 255);
            rect(945, 410, 160, 165);
        }
    }

    drawFishingDock3Highlights() {
        if (this.inside(600, 420, 700, 510)) {
            fill(255, 255, 255, 60);
            stroke(255, 255, 255);
            rect(600, 420, 100, 90);
        }
    }

    //handle keyPress for minigame logic
    handleKeyPress(key) {
        if (this.minigameManager.isMinigameActive()) {
            this.minigameManager.handleKeyPress(key);
        }
    }

    //handle mouseClick for button logic
    handleMouseClick(mouseX, mouseY) {
        this.currentMouseX = mouseX;
        this.currentMouseY = mouseY;

        if (this.inside(20, 720, 100, 800)) {
            this.settingsOpen = !this.settingsOpen;
            return;
        }

        if (this.settingsOpen) {
            this.handleSettingsClick(mouseX, mouseY);
            return;
        }
        const state = this.stateManager.getCurrentState();
        if (state === GAME_STATES.MAIN_MENU) {
            this.handleMainMenuClick(mouseX, mouseY);
            return;
        }
        if (this.showCompletionOverlay) {
            this.lastCaught = null;
            this.toggleCompletionOverlay();
            return;
        }

        if (this.inventoryButtonVisible && !this.minigameManager.isMinigameActive() && this.inside(1090, 30, 1200, 130)) {
            this.handleInventoryButton();
            return;
        }

        if (this.backButtonVisible && !this.minigameManager.isMinigameActive() && !this.inventory.isOpen && this.inside(0, 0, 120, 120)) {
            this.handleBackButton();
            return;
        }

        if (this.inventory.isOpen) {
            // forward clicks to inventory when it's open so slots can be interacted with
            const slotIndex = this.inventory.handleClick(mouseX, mouseY);
            if (slotIndex === 'back') {
                this.stateManager.goBack();
            }
            return;
        }

        this.handleOriginalMouseClick(mouseX, mouseY);
    }

    handleSettingsClick(mouseX, mouseY) {
        if (this.saveDeletionWarning) {
            if (this.inside(400, 350, 600, 400)) {
                localStorage.removeItem("gameState");
                localStorage.removeItem("gameState_backup");
                this.load();
                this.stateManager.currentState = GAME_STATES.MAIN_MENU;
                this.settingsOpen = false;
            } else if (this.inside(700, 350, 900, 400)) {
                this.saveDeletionWarning = false;
            }
        }
        else if (!this.inside(350, 50, 950, 650)) {
            this.settingsOpen = false;
        }
        else if (this.inside(450, 300, 500, 350)) {
            this.autosave.enabled = !this.autosave.enabled;
        }
        else if (this.inside(450, 400, 500, 450)) {
            this.saveDeletionWarning = true;
        }
        else if (this.inside(450, 500, 500, 550) && this.stateManager.getCurrentState() != GAME_STATES.MAIN_MENU) {
            this.stateManager.currentState = GAME_STATES.MAIN_MENU;
            this.settingsOpen = false;
        }
    }

    handleMainMenuClick(mouseX, mouseY) {
        if (this.showInfoPopup) {
            this.showInfoPopup = false;
        }
        else if (this.inside(800, 100, 1000, 200)) {
            this.stateManager.currentState = GAME_STATES.BACKGROUND1;
        } else if (this.inside(800, 250, 1000, 350)) {
            this.settingsOpen = true;
        } else if (this.inside(800, 400, 1000, 500)) {
            this.showInfoPopup = true;
        } else if (this.inside(800, 550, 1000, 650)) {
            remove();
        }
    }

    //back button-specific logic
    handleBackButton() {
        if (this.stateManager.currentState === GAME_STATES.INVENTORY) {
            this.stateManager.changeState(this.stateManager.previousState);
            this.areaMenuOpen = false;
            this.minigameManager.endGame();
        } else if (this.stateManager.currentState === GAME_STATES.SHOP) {
            this.stateManager.goBack();
        } else if (this.areaMenuOpen) {
            this.areaMenuOpen = false;
        } else if (this.minigameManager.isMinigameActive()) {
            this.minigameManager.endGame();
            frameRate(30);
            this.backButtonVisible = true;
        } else {
            this.stateManager.goBack();
        }
    }

    //inventory button specific logic
    handleInventoryButton() {
        if (!this.areaMenuOpen && !this.minigameManager.isMinigameActive()) {
            this.inventory.toggle();
            this.backButtonVisible = !this.inventory.isOpen;
        }
    }


    //mouse click logic for non-special clicks
    handleOriginalMouseClick(mouseX, mouseY) {
    const carLevel = this.upgradeManager.upgrades.car.level;
    const travelFee = carLevel >= 3 ? 0 : 10;
    
    if (this.areaMenuOpen) {
        // Area 1 - Always clickable
        if (this.inside(225, 235, 451, 565)) {
            this.stateManager.changeState(GAME_STATES.BACKGROUND1);
            this.areaMenuOpen = false;
            this.backButtonVisible = false;
            return;
        }
        
        // Area 2 - Only if unlocked
        if (this.inside(475, 235, 701, 565)) {
            if (carLevel >= 1) {
                if (this.money >= travelFee) {
                    this.money -= travelFee;
                    this.stateManager.changeState(GAME_STATES.BACKGROUND2);
                    this.areaMenuOpen = false;
                    this.backButtonVisible = false;
                } else {
                    // Show insufficient funds message
                    console.log("Not enough money for travel fee!");
                }
            }
            return;
        }
        
        // Area 3 - Only if unlocked
        if (this.inside(748, 235, 983, 565)) {
            if (carLevel >= 2) {
                if (this.money >= travelFee) {
                    this.money -= travelFee;
                    this.stateManager.changeState(GAME_STATES.BACKGROUND3);
                    this.areaMenuOpen = false;
                    this.backButtonVisible = false;
                } else {
                    // Show insufficient funds message
                    console.log("Not enough money for travel fee!");
                }
            }
            return;
        }
    }

        if ((this.stateManager.currentState === GAME_STATES.BACKGROUND1 && this.inside(47, 559, 158, 637)) ||
            (this.stateManager.currentState === GAME_STATES.BACKGROUND2 && this.inside(370, 635, 481, 713)) ||
            (this.stateManager.currentState === GAME_STATES.BACKGROUND3 && this.inside(884, 209, 926, 268))) {
            this.areaMenuOpen = true;
            return;
        }

        if ((this.stateManager.currentState === GAME_STATES.BACKGROUND1 && this.inside(76, 274, 157, 353)) ||
            (this.stateManager.currentState === GAME_STATES.BACKGROUND2 && this.inside(55, 350, 280, 485)) ||
            (this.stateManager.currentState === GAME_STATES.BACKGROUND3 && this.inside(1011, 529, 1134, 611))) {
            this.stateManager.changeState(GAME_STATES.SHOP);
            this.backButtonVisible = true;
            return;
        }

        if (this.stateManager.currentState === GAME_STATES.SHOP) {
            const upgradeType = this.shop.handleClick(mouseX, mouseY);

            if (upgradeType === 'back') {
                this.stateManager.goBack();
            } else if (upgradeType) {
                const price = this.shop.getUpgradePrice(upgradeType);
                if (this.money >= price) {
                    const actualCost = this.upgradeManager.purchaseUpgrade(upgradeType);
                    if (actualCost > 0) {
                        this.money -= actualCost;
                        this.money = Math.round(this.money * 10) / 10;

                        if (this.autosave.onUpgrade) {
                            this.autosaveGame("upgrade_purchased");
                        }
                    }
                }
            }
            return;
        }

        if (this.stateManager.currentState === GAME_STATES.BACKGROUND1 && this.inside(749, 333, 899, 423)) {
            this.stateManager.changeState(GAME_STATES.FISHING_DOCK1);
            this.backButtonVisible = true;
            return;
        }
        if (this.stateManager.currentState === GAME_STATES.BACKGROUND2 && this.inside(450, 500, 600, 590)) {
            this.stateManager.changeState(GAME_STATES.FISHING_DOCK2);
            this.backButtonVisible = true;
            return;
        }
        if (this.stateManager.currentState === GAME_STATES.BACKGROUND3 && this.inside(218, 644, 364, 715)) {
            this.stateManager.changeState(GAME_STATES.FISHING_DOCK3);
            this.backButtonVisible = true;
            return;
        }

        const currentModifiers = this.upgradeManager.getCurrentModifiers();
        if (this.stateManager.currentState === GAME_STATES.FISHING_DOCK1 && !this.areaMenuOpen && !this.minigameManager.isMinigameActive() && this.inside(850, 400, 1010, 565)) {
            const gameType = this.minigameManager.chooseGame1();
            this.minigameManager.applyModifiersToCurrentGame(currentModifiers);
            this.backButtonVisible = false;
            this.inventoryButtonVisible = false;
            return;
        }
        if (this.stateManager.currentState === GAME_STATES.FISHING_DOCK2 && !this.areaMenuOpen && !this.minigameManager.isMinigameActive() && this.inside(945, 410, 1105, 575)) {
            const gameType = this.minigameManager.chooseGame2();
            this.minigameManager.applyModifiersToCurrentGame(currentModifiers);
            this.backButtonVisible = false;
            this.inventoryButtonVisible = false;
            return;
        }
        if (this.stateManager.currentState === GAME_STATES.FISHING_DOCK3 && !this.areaMenuOpen && !this.minigameManager.isMinigameActive() && this.inside(600, 420, 700, 510)) {
            const gameType = this.minigameManager.chooseGame3();
            this.minigameManager.applyModifiersToCurrentGame(currentModifiers);
            this.backButtonVisible = false;
            this.inventoryButtonVisible = false;
            return;
        }
        if (this.stateManager.currentState === GAME_STATES.INVENTORY) {
            const slotIndex = this.inventory.handleClick(mouseX, mouseY);
            if (slotIndex === 'back') {
                this.stateManager.goBack();
            }
            return;
        }
    }

    inside(minX, minY, maxX, maxY) {
        return this.currentMouseX > minX && this.currentMouseY > minY &&
            this.currentMouseX < maxX && this.currentMouseY < maxY;
    }

    //save all relevant data to local browser storage
    save(saveType = "manual") {
        try {
            const saveData = {
                money: this.money,
                roentgens: this.roentgens,
                inventory: this.inventory.serialize().inventory,
                upgrades: this.upgradeManager.serialize().upgrades,
                mutations: this.upgradeManager.serialize().mutations,
                timestamp: Date.now(),
                saveType: saveType
            };

            localStorage.setItem('gameState', JSON.stringify(saveData));

            // backup save
            localStorage.setItem('gameState_backup', JSON.stringify(saveData));

            this.autosave.lastSaveTime = millis();
            this.autosave.count++;

            console.log(`Game saved (${saveType}) #${this.autosave.count}`);
            return true;
        } catch (error) {
            console.error("Save failed:", error);
            return false;
        }
    }

    //different method for autosaving data to local storage
    autosaveGame(reason = "autosave") {
        if (!this.autosave.enabled) return false;

        // prevent autosave during minigame or overlays
        if (this.minigameManager.isMinigameActive() ||
            this.showCompletionOverlay || this.areaMenuOpen) {
            return false;
        }

        return this.save(reason);
    }

    //load all relevant data from local browser storage
    load() {
        let state = JSON.parse(localStorage.getItem('gameState'));
        if (!state) { this.resetGameToDefaults() }
        else {
            this.money = state.money;
            this.roentgens = state.roentgens;
            this.upgradeManager.load(state.upgrades, state.mutations);
            this.inventory.load(state.inventory);
            this.inventory.expand(this.upgradeManager.getCurrentModifiers().inventorySize);
        }
    }

    //reset to default values
    resetGameToDefaults() {
        this.money = 10;
        this.roentgens = 0;
        this.mutationThreshold = 1000;
        this.lastCaught = null;
        this.autoSold = false;

        // Reset managers
        this.upgradeManager = new UpgradeManager(this);
        this.inventory = new Inventory();

        // Reset UI states
        this.areaMenuOpen = false;
        this.backButtonVisible = false;
        this.showCompletionOverlay = false;
        this.inventoryButtonVisible = true;
    }
}