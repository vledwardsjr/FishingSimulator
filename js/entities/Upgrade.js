//Class representing the upgrades the player will purchase from the shop
class Upgrade {
    //upgrade constructor
    constructor(type, level = 0, maxLevel = 3) {
        this.type = type;
        this.level = level;
        this.maxLevel = maxLevel;
        this.prices = this.getPrices();
        this.modifierValues = this.getModifierValues();
    }

    //get the prices for all upgrades
    getPrices() {
        const priceLists = {
            'rod': [100, 250, 500],
            'bait': [150, 300, 450],
            'inventory': [200, 400, 600],
            'car': [500, 1000, 1500]
        };
        return priceLists[this.type] || [100, 200, 300];
    }

    //get the specific upgrade price for level up. Infinity if max
    getPrice() {
        if (this.level >= this.maxLevel) {
            return Infinity;
        }
        return this.prices[this.level];
    }

    //get the gameplay modifiers for shop upgrades.
    getModifierValues() {
        const modifiers = {
            'rod': { sizeMultiplier: 2 ** this.level },
            'bait': { qualityCeiling: 2.25 ** this.level },
            'inventory': {
                slots: (this.level + 3) * (this.level + 3)
            },
            'car': {
                areasUnlocked: this.level + 1,
                travelFee: this.level >= 3 ? 0 : 10
             }
        };
        return modifiers[this.type] || {};
    }

    //increase upgrade level
    upgrade() {
        if (this.level < this.maxLevel) {
            this.level++;
            this.modifierValues = this.getModifierValues();
            return true;
        }
        return false;
    }
}
