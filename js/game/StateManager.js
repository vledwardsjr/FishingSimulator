//Class for handling transitions between screens/game states
class StateManager {
    //constructor to initialize backgrounds
    constructor() {
        this.currentState = GAME_STATES.MAIN_MENU;
        this.previousState = "";
        this.backgrounds = {
            [GAME_STATES.MAIN_MENU]: Assets.MAIN_MENU,
            [GAME_STATES.BACKGROUND1]: Assets.BACKGROUND1,
            [GAME_STATES.BACKGROUND2]: Assets.BACKGROUND2,
            [GAME_STATES.BACKGROUND3]: Assets.BACKGROUND3,
            [GAME_STATES.FISHING_DOCK1]: Assets.FISHERMAN_BG1,
            [GAME_STATES.FISHING_DOCK2]: Assets.FISHERMAN_BG2,
            [GAME_STATES.FISHING_DOCK3]: Assets.FISHERMAN_BG3,
            [GAME_STATES.SHOP]: Assets.SHOP_BG
        };
    }


    getCurrentState() {
        return this.currentState;
    }

    getCurrentBackground() {
        return this.backgrounds[this.currentState] || Assets.MAIN_MENU;
    }

    //save current state to prev before switching to new state
    changeState(newState) {
        this.previousState = this.currentState;
        this.currentState = newState;
    }

    //return to the previously saved state
    goBack() {
        if (this.previousState) {
            this.currentState = this.previousState;
            return true;
        }
        return false;
    }

    //determine whether the current screen is a fishing dock
    isFishingDock() {
        return [
            GAME_STATES.FISHING_DOCK1,
            GAME_STATES.FISHING_DOCK2,
            GAME_STATES.FISHING_DOCK3
        ].includes(this.currentState);
    }

    getFishingArea() {
        if (this.currentState === GAME_STATES.FISHING_DOCK1) return 1;
        if (this.currentState === GAME_STATES.FISHING_DOCK2) return 2;
        if (this.currentState === GAME_STATES.FISHING_DOCK3) return 3;
        return 0;
    }

    handleAreaTransition(areaNumber) {
        switch (areaNumber) {
            case 1:
                this.changeState(GAME_STATES.BACKGROUND1);
                break;
            case 2:
                this.changeState(GAME_STATES.BACKGROUND2);
                break;
            case 3:
                this.changeState(GAME_STATES.BACKGROUND3);
                break;
        }
    }

    handleShopTransition() {
        this.changeState(GAME_STATES.SHOP);
    }

    handleFishingDockTransition(areaNumber) {
        switch (areaNumber) {
            case 1:
                this.changeState(GAME_STATES.FISHING_DOCK1);
                break;
            case 2:
                this.changeState(GAME_STATES.FISHING_DOCK2);
                break;
            case 3:
                this.changeState(GAME_STATES.FISHING_DOCK3);
                break;
        }
    }
}
