class SpamGame extends BaseMinigame {
    constructor() {
        super();
        this.expectLeft = true;
        this.spamProg = SPAM_VARS.y + SPAM_VARS.h;
        this.highlightX = SPAM_VARS.x;
        this.progressPerPress = 20; // progress per correct press
        this.progressDrainRate = 100; // progress lost per second
        this.timeLimit = 7.0;
        this.timeElapsed = 0;
    }

    onModifiersApplied() {
        this.progressPerPress *= this.modifiers.minigameMultiplier;
        this.timeLimit *= this.modifiers.targetSizeMultiplier;
    }
    
    start() {
        super.start();
        this.expectLeft = true;
        this.spamProg = SPAM_VARS.y + SPAM_VARS.h;
        this.highlightX = SPAM_VARS.x;
        this.timeElapsed = 0;

        //reset modified value
        this.progressPerPress = 20;
        this.timeLimit = 7.0;
    }
    
    update(deltaTime) {
        this.timeElapsed += deltaTime;

        this.spamProg += this.progressDrainRate * deltaTime;
        if (this.spamProg > SPAM_VARS.y + SPAM_VARS.h) {
            this.spamProg = SPAM_VARS.y + SPAM_VARS.h;
        }
        
        // Check completion
        if (this.spamProg <= SPAM_VARS.y) {
            return {success : true};
        } else if (this.timeElapsed >= this.timeLimit) {
            return {success : false};
        }
        return false;
    }
    
    draw() {
        strokeWeight(3);
        stroke(0, 0, 0);
        fill(255, 255, 255);
        rect(SPAM_VARS.x, SPAM_VARS.y, SPAM_VARS.w, SPAM_VARS.h);
        
        fill(0, 255, 0);
        rect(SPAM_VARS.x, this.spamProg, SPAM_VARS.w, SPAM_VARS.y + SPAM_VARS.h - this.spamProg);

        fill(255);
        textSize(16);
        textAlign(CENTER, TOP);
        const timeLeft = Math.max(0, this.timeLimit  - this.timeElapsed);
        text(`Time: ${timeLeft.toFixed(1)}s`, SPAM_VARS.x + SPAM_VARS.w / 2, SPAM_VARS.y - 30);
        
        fill(0, 0, 0);
        rect(SPAM_VARS.x, SPAM_VARS.y + SPAM_VARS.h + 20, 100, 100);
        rect(SPAM_VARS.x + SPAM_VARS.w + 20, SPAM_VARS.y + SPAM_VARS.h + 20, 100, 100);
        
        image(Assets.KEY_LEFT, SPAM_VARS.x, SPAM_VARS.y + SPAM_VARS.h + 20, 100, 100);
        image(Assets.KEY_RIGHT, SPAM_VARS.x + SPAM_VARS.w + 20, SPAM_VARS.y + SPAM_VARS.h + 20, 100, 100);
        
        noFill();
        stroke(0, 255, 0);
        strokeWeight(5);
        rect(this.highlightX, SPAM_VARS.y + SPAM_VARS.h + 20, 100, 100);
        strokeWeight(1);
    }
    
    handleKeyPress(key) {
        if (this.expectLeft) {
            if (keyCode === LEFT_ARROW) {
                this.spamProg -= this.progressPerPress;
                this.expectLeft = !this.expectLeft;
                this.highlightX += SPAM_VARS.w + 20;
            }
            else if (keyCode === RIGHT_ARROW) {
                this.spamProg += this.progressPerPress * 3;
            }
        } else {
            if (keyCode === RIGHT_ARROW) {
                this.spamProg -= this.progressPerPress;
                this.expectLeft = !this.expectLeft;
                this.highlightX -= SPAM_VARS.w + 20;
            }
            else if (keyCode === LEFT_ARROW) {
                this.spamProg += this.progressPerPress * 3;
            }
        }
    }
}