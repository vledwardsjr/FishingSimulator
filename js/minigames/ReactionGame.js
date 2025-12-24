class ReactionGame extends BaseMinigame {
    constructor() {
        super();
        this.elapsedTime = 0;
        this.triggerTime = 0;
        this.maxReactionTime = 0.3;
        this.alpha = 0;
        this.alphaPulseSpeed = 5;
        this.finishedReact = false;
        this.failedReact = false;
        this.showExclamation = false;
    }

    onModifiersApplied() {
        this.maxReactionTime *= this.modifiers.reactionWindow;
    }
    
    start() {
        super.start();
        this.elapsedTime = 0;
        this.triggerTime = random(1.0, 5.0);
        this.maxReactionTime = 0.4;
        this.alpha = 0;
        this.alphaDirection = 1;
        this.finishedReact = false;
        this.failedReact = false;
        this.showExclamation = false;

        //reset modified value
        this.maxReactionTime = 0.2;
    }
    
    update(deltaTime) {
        this.elapsedTime += deltaTime;
        
        if (!this.showExclamation && this.elapsedTime >= this.triggerTime) {
            this.showExclamation = true;
            this.elapsedTime = 0;
        }
        
        if (this.showExclamation && !this.failedReact && !this.finishedReact) {
            this.alpha += this.alphaDirection * this.alphaPulseSpeed * deltaTime * 255;
            if (this.alpha >= 255) {
                this.alpha = 255;
                this.alphaDirection = -1;
            } else if (this.alpha <= 0) {
                this.alpha = 0;
                this.alphaDirection = 1;
            }
            
            if (this.elapsedTime >= this.maxReactionTime) {
                this.failedReact = true;
            }
        }
        
        if (this.failedReact) {
            return {success : false}
        } else if (this.finishedReact) {
            return {success : true}
        }
        return false;
    }
    
    draw() {
        fill(255, 0, 0, this.alpha);
        stroke(51);
        strokeWeight(5);
        
        image(Assets.REACTION_WATER, REACTION_VARS.x, REACTION_VARS.y, REACTION_VARS.w, REACTION_VARS.h);
        rect(REACTION_VARS.x, REACTION_VARS.y, REACTION_VARS.w, REACTION_VARS.h);
        
        if (this.showExclamation && !this.failedReact && !this.finishedReact) {
            image(Assets.REACTION_EX_POINT, REACTION_VARS.x + REACTION_VARS.w / 2.4, REACTION_VARS.y, 50, 60);
        }
        
        strokeWeight(1);
    }
    
    handleKeyPress(key) {
        if (this.showExclamation && !this.failedReact && !this.finishedReact) {
            this.finishedReact = true;
        } else if (!this.showExclamation && !this.failedReact) {
            this.triggerTime += 0.5;
        }
    }
}