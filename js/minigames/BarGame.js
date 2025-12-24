//Class for area 1 bar minigame
class BarGame extends BaseMinigame {
    constructor() {
        super();
        this.hitCount = 0;
        this.maxScore = 5;
        this.score = 1;
        this.textColor = color(255, 255, 255);
        this.goalX = 0;
        this.newCritW = BAR_VARS.critW;
        this.critgoalX = 0;
        this.cursorX = BAR_VARS.x;
        this.speed = 140; // pixels per second
    }

    onModifiersApplied() {
        this.newCritW *= this.modifiers.targetSizeMultiplier;
        this.score *= this.modifiers.minigameMultiplier;
    }
    
    start() {
        super.start();
        this.hitCount = 0;
        this.goalX = random(BAR_VARS.x, BAR_VARS.x + BAR_VARS.contW - BAR_VARS.goalW);
        this.critgoalX = random(BAR_VARS.x, BAR_VARS.x + BAR_VARS.contW - this.newCritW);
        this.cursorX = BAR_VARS.x;
        this.direction = 1; // 1 for right, -1 for left
        this.textColor = color(255, 255, 255);

        //reset modified values
        this.newCritW = BAR_VARS.critW;
        this.score = 1;
    }
    
    update(deltaTime) {

        this.cursorX += this.direction * this.speed * deltaTime;
        
        if (this.cursorX >= BAR_VARS.x + BAR_VARS.contW - BAR_VARS.cursorW) {
            this.direction = -1;
            this.cursorX = BAR_VARS.x + BAR_VARS.contW - BAR_VARS.cursorW;
        } else if (this.cursorX <= BAR_VARS.x) {
            this.direction = 1;
            this.cursorX = BAR_VARS.x;
        }
        
        if (this.hitCount >= this.maxScore) {
            return this.end();
        }
        return false;
    }
    
    draw() {
        stroke(255, 255, 255);
        fill(0, 0, 0);
        rect(BAR_VARS.x, BAR_VARS.y, BAR_VARS.contW, BAR_VARS.h);
        
        noStroke();
        fill(255, 255, 255);
        rect(this.goalX, BAR_VARS.y, BAR_VARS.goalW, BAR_VARS.h);
        
        fill(0, 255, 0);
        rect(this.critgoalX, BAR_VARS.y, this.newCritW, BAR_VARS.h);
        
        fill(255, 0, 0);
        rect(this.cursorX, BAR_VARS.y, BAR_VARS.cursorW, BAR_VARS.h);
        
        fill(this.textColor);
        textSize(32);
        text(this.hitCount + '/' + this.maxScore, BAR_VARS.x, 167);
        
        let imgX = BAR_VARS.x + BAR_VARS.contW / 2 - 40;
        image(Assets.KEY_SPACE, imgX, BAR_VARS.y + BAR_VARS.h + 20, 100, 30);
    }
    
    handleKeyPress(key) {
        if (key === ' ') {
            if (this.cursorX >= this.critgoalX && this.cursorX + BAR_VARS.cursorW <= this.critgoalX + this.newCritW) {
                this.hitCount += 3 * this.score;
                this.textColor = color(255, 215, 0);
            } else if (this.cursorX >= this.goalX && this.cursorX + BAR_VARS.cursorW <= this.goalX + BAR_VARS.goalW) {
                this.hitCount += this.score;
                this.textColor = color(0, 255, 0);
            } else {
                if (this.hitCount > 0) {
                    this.hitCount-= this.score;
                }
                this.textColor = color(255, 0, 0);
            }
            
            this.goalX = random(BAR_VARS.x, BAR_VARS.x + BAR_VARS.contW - BAR_VARS.goalW);
            this.critgoalX = random(BAR_VARS.x, BAR_VARS.x + BAR_VARS.contW - this.newCritW);
        }
    }
}