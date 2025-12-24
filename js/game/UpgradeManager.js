//Class for managing player progression upgrades and mutations
class UpgradeManager {
    //initialize all upgrades and mutations
    constructor(gameManager) {
        this.gameManager = gameManager;

        this.upgrades = {
            rod: new Upgrade('rod'),
            inventory: new Upgrade('inventory'),
            bait: new Upgrade('bait'),
            car: new Upgrade('car')
        };

        this.mutations = {
            luck: new Mutation('luck'),
            strength: new Mutation('strength'),
            sight: new Mutation('sight')
        };

        this.mutationDisplay = {
            x: width,
            y: 250,
            width: 50,
            height: 50,
            spacing: 20
        };
    }

    serialize() {
        return {
            upgrades: {
                rodLevel: this.upgrades.rod.level,
                inventoryLevel: this.upgrades.inventory.level,
                baitLevel: this.upgrades.bait.level,
                carLevel: this.upgrades.car.level
            },
            mutations: {
                luckLevel: this.mutations.luck.level,
                strengthLevel: this.mutations.strength.level,
                sightLevel: this.mutations.sight.level
            },
        };
    }

    load(upgrades, mutations) {
        this.upgrades.rod = new Upgrade('rod', upgrades.rodLevel);
        this.upgrades.inventory = new Upgrade('inventory', upgrades.inventoryLevel);
        this.upgrades.bait = new Upgrade('bait', upgrades.baitLevel);
        this.upgrades.car = new Upgrade('car', upgrades.carLevel);

        this.mutations.luck = new Mutation('luck', mutations.luckLevel);
        this.mutations.strength = new Mutation('strength', mutations.strengthLevel);
        this.mutations.sight = new Mutation('sight', mutations.sightLevel);
    }

    //return all current modifiers across upgrades and mutations
    getCurrentModifiers() {
        return {
            // Fish generation
            sizeFloor: this.mutations.strength.effects.sizeFloor || 0.1,
            sizeCeiling: this.upgrades.rod.modifierValues.sizeCeiling || 5,
            qualityFloor: this.mutations.luck.effects.qualityFloor || 1,
            qualityCeiling: this.upgrades.bait.modifierValues.qualityCeiling || 10,

            // Minigame modifiers
            minigameMultiplier: this.mutations.strength.effects.minigameMultiplier || 1,
            targetSizeMultiplier: this.mutations.sight.effects.targetSizeMultiplier || 1,
            reactionWindow: this.mutations.sight.effects.reactionWindow || 1,

            // Game progression
            areasUnlocked: this.upgrades.car.modifierValues.areasUnlocked || 1,
            inventorySize: this.upgrades.inventory.modifierValues.slots || 9
        };
    }

    //purchase the specified shop upgrade
    purchaseUpgrade(upgradeType) {
        const upgrade = this.upgrades[upgradeType];
        if (!upgrade) return 0;
        const price = upgrade.getPrice();
        if (this.gameManager.money >= price && upgrade.upgrade()) {
            if (upgradeType === 'inventory') {
                const newSlots = upgrade.modifierValues.slots;
                this.gameManager.inventory.expand(newSlots);
            }
            return price;
        }
        return 0;
    }

    //obtain the specified player mutation
    obtainMutation(mutationType) {
        const mutation = this.mutations[mutationType];
        if (mutation && mutation.upgrade()) {
            this.gameManager.roentgens = 0;
            return true;
        }
        return false;
    }

    getUpgradePrice(upgradeType) {
        return this.upgrades[upgradeType]?.getPrice() || 0;
    }


    //draw all possessed mutations
    drawMutations() {
        const { x, y, width, height, spacing } = this.mutationDisplay;
        let yOffset = 0;

        Object.values(this.mutations).forEach(mutation => {
            if (mutation.level > 0) {
                mutation.draw(x, y + yOffset, width, height);
                yOffset += height + spacing;
            }
        });
    }
}
