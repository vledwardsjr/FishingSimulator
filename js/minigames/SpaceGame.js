class SpaceGame extends BaseMinigame {
    constructor() {
        super();
        this.spaceProgH = 0;
        this.spaceHeight = SPACE_VARS.y + SPACE_VARS.h - this.newCursorH;
        this.velocity = 0;
        this.acceleration = 350;
        this.maxVelocity = 200;
        this.progressFillRate = 50;
        this.progressDrainRate = 10;
        this.goalMoveInterval = 1.0;
        this.timeSinceLastGoalMove = 0;
        this.goalMoveDuration = 1.0; 
        this.goalMoveProgress = 0; 
        this.startGoalY = 0;

        this.newCursorH = SPACE_VARS.cursorH;
    }
    
    onModifiersApplied() {
        this.newCursorH *= this.modifiers.targetSizeMultiplier;
        this.acceleration *= this.modifiers.minigameMultiplier;
        this.maxVelocity *= this.modifiers.minigameMultiplier;
        this.progressFillRate *= this.modifiers.minigameMultiplier;
    }
    start() {
        super.start();
        this.spaceProgH = 30;
        this.spaceHeight = SPACE_VARS.y + SPACE_VARS.h - this.newCursorH;
        this.velocity = 0;
        this.spaceGoalY = random(SPACE_VARS.y, SPACE_VARS.y + SPACE_VARS.h - SPACE_VARS.goalH);
        this.nextGoalY = this.spaceGoalY;
        this.timeSinceLastGoalMove = 0;
        this.goalMoveProgress = 1.0; 
        this.startGoalY = this.spaceGoalY;

        //reset modified values
        this.newCursorH = SPACE_VARS.cursorH;
        this.acceleration = 350;
        this.maxVelocity = 200;
        this.progressFillRate = 50;
    }
    
    update(deltaTime) {
        if (keyIsDown(32)) { 
            this.velocity -= this.acceleration * deltaTime;
        } else {
            this.velocity += this.acceleration * deltaTime;
        }
        
        if (this.velocity > this.maxVelocity) {
            this.velocity = this.maxVelocity;
        } else if (this.velocity < -this.maxVelocity) {
            this.velocity = -this.maxVelocity;
        }
        
        this.spaceHeight += this.velocity * deltaTime;
        
        if (this.spaceHeight < SPACE_VARS.y) {
            this.spaceHeight = SPACE_VARS.y;
            this.velocity = 0;
        } else if (this.spaceHeight > SPACE_VARS.y + SPACE_VARS.h - this.newCursorH) {
            this.spaceHeight = SPACE_VARS.y + SPACE_VARS.h - this.newCursorH;
            this.velocity = 0;
        }
        
        this.timeSinceLastGoalMove += deltaTime;
        if (this.timeSinceLastGoalMove >= this.goalMoveInterval && this.goalMoveProgress >= 1.0) {
            this.nextGoalY = random(SPACE_VARS.y, SPACE_VARS.y + SPACE_VARS.h - SPACE_VARS.goalH);
            this.timeSinceLastGoalMove = 0;
            this.goalMoveInterval = random(1.0, 3.0);
            this.goalMoveProgress = 0;
            this.startGoalY = this.spaceGoalY; 
        }
        
        if (this.goalMoveProgress < 1.0) {
            this.goalMoveProgress += deltaTime / this.goalMoveDuration;
            
            if (this.goalMoveProgress >= 1.0) {
                this.goalMoveProgress = 1.0;
                this.spaceGoalY = this.nextGoalY;
            } else {
                this.spaceGoalY = this.startGoalY + (this.nextGoalY - this.startGoalY) * this.goalMoveProgress;
            }
        }
        
        const inGoal = this.spaceHeight <= this.spaceGoalY && 
                      this.spaceHeight + this.newCursorH >= this.spaceGoalY + SPACE_VARS.goalH;
        
        if (inGoal) {
            this.spaceProgH += this.progressFillRate * deltaTime;
        } else {
            this.spaceProgH -= this.progressDrainRate * deltaTime;
            if (this.spaceProgH < 0) this.spaceProgH = 0;
        }
        
        const progress = SPACE_VARS.progY + SPACE_VARS.progH - this.spaceProgH;
        if (progress <= SPACE_VARS.progY) {
            return {success : true}
        } else if (this.spaceProgH <= 0) {
            return {success : false}
        } else {
            return false;
        }
    }

    draw() {
        fill(0, 0, 0);
        rect(SPACE_VARS.x, SPACE_VARS.y, SPACE_VARS.w, SPACE_VARS.h);
        rect(SPACE_VARS.progX, SPACE_VARS.progY, SPACE_VARS.progW, SPACE_VARS.progH);
        
        fill(255, 255, 255);
        rect(SPACE_VARS.x, this.spaceHeight, SPACE_VARS.w, this.newCursorH);
        
        fill(0, 255, 0);
        rect(SPACE_VARS.x, this.spaceGoalY, SPACE_VARS.w, SPACE_VARS.goalH);
        
        let progress = SPACE_VARS.progY + SPACE_VARS.progH - this.spaceProgH;
        rect(SPACE_VARS.progX + SPACE_VARS.diff, progress, SPACE_VARS.progW - 2 * SPACE_VARS.diff, this.spaceProgH);
        
        image(Assets.KEY_SPACE, SPACE_VARS.x - 10, SPACE_VARS.y + SPACE_VARS.h + 15, 100, 30);
    }
}