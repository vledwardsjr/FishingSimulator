//Class for picking and managing the current active minigame
class MinigameManager {
    //Constructor to initialize all minigame types
    constructor() {
        this.miniGames = {
            [MINIGAME_STATES.BAR_GAME]: new BarGame(),
            [MINIGAME_STATES.NAV_GAME]: new NavGame(),
            [MINIGAME_STATES.MATCHING_GAME]: new MatchingGame(),
            [MINIGAME_STATES.REACTION_GAME]: new ReactionGame(),
            [MINIGAME_STATES.SPACE_GAME]: new SpaceGame(),
            [MINIGAME_STATES.SPAM_GAME]: new SpamGame()
        };
        
        this.currentGame = null;
        this.currentGameType = '';
    }
    
    //Check if there is an active minigame
    isMinigameActive() {
        return this.currentGame && this.currentGame.isActive;
    }
    
    //Find current minigame type
    getCurrentMinigameType() {
        return this.currentGameType;
    }
    
    //choose game for area 1
    chooseGame1() {
        let num = int(random(0, 2));
        if (num === 0) {
            return this.startGame(MINIGAME_STATES.NAV_GAME);
        } else {
            return this.startGame(MINIGAME_STATES.BAR_GAME);
        }
    }
    
    //choose game for area 2
    chooseGame2() {
        let num = int(random(0, 2));
        if (num === 0) {
            return this.startGame(MINIGAME_STATES.REACTION_GAME);
        } else {
            return this.startGame(MINIGAME_STATES.MATCHING_GAME);
        }
    }
    
    //choose game for area 3
    chooseGame3() {
        let num = int(random(0, 2));
        if (num === 0) {
            return this.startGame(MINIGAME_STATES.SPACE_GAME);
        } else {
            return this.startGame(MINIGAME_STATES.SPAM_GAME);
        }
    }

    //apply upgrade/mutation modifiers to current minigame
    applyModifiersToCurrentGame(modifiers) {
        if (this.currentGame) {
            this.currentGame.applyModifiers(modifiers);
        }
    }
    
    startGame(gameType) {
        this.currentGameType = gameType;
        this.currentGame = this.miniGames[gameType];
        this.currentGame.start();
        return gameType;
    }
    
    endGame() {
        if (this.currentGame) {
            this.currentGame.end();
            this.currentGame = null;
            this.currentGameType = '';
        }
    }
    
    //update minigame using deltaTime to prevent frame issues
    update() {
        if (this.currentGame && this.currentGame.isActive) {
            const dt = deltaTime / 1000;
            const result = this.currentGame.update(dt);
            if (result !== false) {
                const success = (result === true || (result && result.success !== false));
                return {completed : true, success: success};
            }
        }
        return false;
    }
    
    //draw current minigame content overlaid
    draw() {
        if (this.currentGame && this.currentGame.isActive) {
            this.currentGame.draw();
        }
    }
    
    //handle keyPress for minigame
    handleKeyPress(key) {
        if (this.currentGame && this.currentGame.isActive) {
            this.currentGame.handleKeyPress(key);
        }
    }

    handleKeyReleased(key) {
        if (this.currentGame && this.currentGame.isActive && this.currentGame.handleKeyReleased) {
            this.currentGame.handleKeyReleased(key);
        }
    }
    
}