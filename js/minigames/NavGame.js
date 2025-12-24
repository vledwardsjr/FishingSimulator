class NavGame extends BaseMinigame {
    constructor() {
        super();
        this.goalX = 0;
        this.cursorX = NAV_VARS.x;
        this.newGoalW = NAV_VARS.goalW;
        this.moveSpeed = 150; // pixels per second
        this.progBarH = 0;
        this.progressFillRate = 40; // progress per second when in goal
        this.progressDrainRate = 4; // progress per second when not in goal
        this.firstEntry = false;
        this.currentStay = 0;
        this.maxStay = 0;
        
        this.leftPressed = false;
        this.rightPressed = false;
    }

    onModifiersApplied() {
        this.newGoalW *= this.modifiers.targetSizeMultiplier;
        this.progressFillRate *= this.modifiers.minigameMultiplier;
        this.moveSpeed *= this.modifiers.minigameMultiplier;
    }
    
    start() {
        super.start();
        this.goalX = random(NAV_VARS.x, NAV_VARS.x + NAV_VARS.contW - this.newGoalW);
        this.cursorX = NAV_VARS.x;
        this.progBarH = 0;
        this.firstEntry = false;
        this.currentStay = 0;
        this.maxStay = 0;

        //reset modified values
        this.newGoalW = NAV_VARS.goalW;
        this.moveSpeed = 150;
        this.progressFillRate = 40;
    }
    
    update(deltaTime) {

    if (this.leftPressed && this.cursorX > NAV_VARS.x) {
        this.cursorX -= this.moveSpeed * deltaTime;
        if (this.cursorX < NAV_VARS.x) this.cursorX = NAV_VARS.x;
    }
    if (this.rightPressed && this.cursorX < NAV_VARS.x + NAV_VARS.contW - NAV_VARS.cursorW) {
        this.cursorX += this.moveSpeed * deltaTime;
        if (this.cursorX > NAV_VARS.x + NAV_VARS.contW - NAV_VARS.cursorW) {
            this.cursorX = NAV_VARS.x + NAV_VARS.contW - NAV_VARS.cursorW;
        }
    }
    
    const inGoal = this.cursorX >= this.goalX && this.cursorX + NAV_VARS.cursorW <= this.goalX + this.newGoalW;
    
    if (inGoal) {
        this.progBarH += this.progressFillRate * deltaTime;
        
        if (!this.firstEntry) {
            this.firstEntry = true;
            this.currentStay = 0;
            this.maxStay = random(0.1, 1);
        } else {
            this.currentStay += deltaTime;
        }
        
        if (this.currentStay >= this.maxStay) {
            this.goalX = random(NAV_VARS.x, NAV_VARS.x + NAV_VARS.contW - this.newGoalW);
            this.firstEntry = false;
            this.currentStay = 0; 
        }
    } else {
        this.progBarH -= this.progressDrainRate * deltaTime;
        if (this.progBarH < 0) this.progBarH = 0;
        
        this.firstEntry = false;
        this.currentStay = 0;
    }
    
    const progress = NAV_VARS.progY + NAV_VARS.progH - this.progBarH;
    if (progress <= NAV_VARS.progY) {
        return this.end();
    }
    return false;
}
    
    draw() {
        stroke(255, 255, 255);
        fill(0, 0, 0);
        rect(NAV_VARS.x, NAV_VARS.y, NAV_VARS.contW, NAV_VARS.h);
        
        noStroke();
        fill(255, 255, 255);
        rect(this.goalX, NAV_VARS.y, this.newGoalW, NAV_VARS.h);
        
        fill(0, 0, 255);
        rect(this.cursorX, NAV_VARS.y, NAV_VARS.cursorW, NAV_VARS.h);
        
        fill(255, 255, 255);
        rect(NAV_VARS.progX, NAV_VARS.progY, NAV_VARS.progW, NAV_VARS.progH);
        
        fill(0, 255, 0);
        let progress = NAV_VARS.progY + NAV_VARS.progH - this.progBarH;
        rect(NAV_VARS.progX + NAV_VARS.diff, progress, NAV_VARS.progW - 2 * NAV_VARS.diff, this.progBarH);
        
        fill(0, 0, 0);
        rect(NAV_VARS.x, NAV_VARS.y + NAV_VARS.h + 20, 50, 50);
        image(Assets.KEY_LEFT, NAV_VARS.x, NAV_VARS.y + NAV_VARS.h + 20, 50, 50);
        
        rect(NAV_VARS.x + NAV_VARS.contW - 50, NAV_VARS.y + NAV_VARS.h + 20, 50, 50);
        image(Assets.KEY_RIGHT, NAV_VARS.x + NAV_VARS.contW - 50, NAV_VARS.y + NAV_VARS.h + 20, 50, 50);
    }
    
    handleKeyPress(key) {
        if (keyCode === LEFT_ARROW) {
            this.leftPressed = true;
        }
        if (keyCode === RIGHT_ARROW) {
            this.rightPressed = true;
        }
    }
    
    handleKeyReleased(key) {
        if (keyCode === LEFT_ARROW) {
            this.leftPressed = false;
        }
        if (keyCode === RIGHT_ARROW) {
            this.rightPressed = false;
        }
    }
}