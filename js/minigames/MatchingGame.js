class MatchingGame extends BaseMinigame {
    constructor() {
        super();
        this.keysToPress = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        this.startTime = 0;
        this.numberOfPresses = 0;
        this.targetKey = '';
        this.progress = 1;
        this.totalPressesNeeded = 20;
        this.endTime = 0;
    }
    
    onModifiersApplied() {
        this.progress = Math.floor(this.progress * this.modifiers.minigameMultiplier);
        this.totalPressesNeeded = Math.ceil(this.totalPressesNeeded/this.modifiers.targetSizeMultiplier);
    }

    start() {
        super.start();
        this.startTime = millis();
        this.numberOfPresses = 0;
        this.targetKey = random(this.keysToPress);
        this.totalPressesNeeded = 20;
        this.endTime = 0;

        //reset modified values
        this.progress = 1;
        this.totalPressesNeeded = 20;
    }
    
    update() {
        if (this.numberOfPresses >= this.totalPressesNeeded) {
            this.endTime = (millis() - this.startTime) / 1000;
            return this.end();
        }
        return false;
    }
    
    draw() {
        fill(0, 0, 0);
        rect(800, 150, 300, 200);
        
        textSize(32);
        fill(255, 255, 255);
        textAlign(RIGHT, CENTER);
        text("Presses: " + this.numberOfPresses + "/" + this.totalPressesNeeded, 1050, height / 4);
        
        let toDisplay;
        if (this.targetKey === 'ArrowUp') {
            toDisplay = Assets.KEY_UP;
        } else if (this.targetKey === 'ArrowDown') {
            toDisplay = Assets.KEY_DOWN;
        } else if (this.targetKey === 'ArrowLeft') {
            toDisplay = Assets.KEY_LEFT;
        } else if (this.targetKey === 'ArrowRight') {
            toDisplay = Assets.KEY_RIGHT;
        }
        
        image(toDisplay, 910, 225);
        text("Press: ", 925, 275);
        
        if (this.completed) {
            text("Complete! Time: " + this.endTime.toFixed(2) + "s", width / 2, height * 3 / 4);
        }
    }
    
    handleKeyPress(key) {
        if (key === this.targetKey && this.numberOfPresses < this.totalPressesNeeded) {
            this.numberOfPresses += this.progress;
            this.targetKey = random(this.keysToPress);
        } else {
            if (key !== this.targetKey) {
                this.numberOfPresses = 0;
            }
        }
    }
}