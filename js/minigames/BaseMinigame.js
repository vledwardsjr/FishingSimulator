//Class for universalized minigame logic
class BaseMinigame {
    //basic constructor
    constructor() {
        this.isActive = false;
        this.completed = false;
        this.lastUpdateTime = 0;

        this.modifiers = {
            minigameMultiplier: 0,
            targetSizeMultiplier: 0,
            reactionWindow: 0
        };
    }

    //apply given modifiers to minigame
    applyModifiers(modifiers) {
        this.modifiers = {...modifiers};
        this.onModifiersApplied();
    }

    //specifically apply modifiers to each minigame's logic
    onModifiersApplied() {
        // overridden by child
    }

    //start the minigame
    start() {
        this.isActive = true;
        this.completed = false;
        this.lastUpdateTime = millis();
        frameRate(120);
    }

    //end the minigame
    end() {
        this.isActive = false;
        this.completed = true;
        frameRate(30);
        return true;
    }

    //run minigame calculations like movement on deltaTime for smooth and consistent gameplay
    update(deltaTime) {
        // implemented by child
    }

    //draw the contents of the minigame
    draw() {
        //implemented by child
    }

    handleKeyPress() {
        //implemented by child
    }

    handleKeyReleased() {
        //implemented by child
    }
}