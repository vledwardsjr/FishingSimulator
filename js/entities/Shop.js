//Class representing the shop the player will purchase upgrades from
class Shop {
    //shop constructor
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.upgradeManager = gameManager.upgradeManager;

        this.buttonAreas = [
            { x: 301, y: 441, w: 149, h: 100, type: 'rod' },
            { x: 501, y: 441, w: 149, h: 100, type: 'bait' },
            { x: 701, y: 441, w: 149, h: 100, type: 'inventory' },
            { x: 901, y: 441, w: 70, h: 100, type: 'car' }
        ];

        this.progressBars = {
            rod: { x: 301, y: 400, w: 150, h: 22, spacing: 40 },
            bait: { x: 501, y: 400, w: 150, h: 22, spacing: 40 },
            inventory: { x: 701, y: 400, w: 150, h: 22, spacing: 40 },
            car: { x: 901, y: 400, w: 75, h: 22, spacing: 40 }
        };
    }

    //get price of any upgrade
    getUpgradePrice(upgradeType) {
        const upgrade = this.upgradeManager.upgrades[upgradeType];
        if (!upgrade) return Infinity;
        return upgrade.getPrice();
    }

    //check if upgrade can be bought
    canAffordUpgrade(upgradeType, money) {
        return money >= this.getUpgradePrice(upgradeType);
    }

    //buy the upgrade
    purchaseUpgrade(upgradeType) {
        const upgrade = this.upgradeManager.upgrades[upgradeType];
        const price = this.getUpgradePrice(upgradeType);

        if (!upgrade || this.gameManager.money < price || upgrade.level >= upgrade.maxLevel) {
            return 0;
        }

        if (upgrade.upgrade()) {
            return price;
        }
        return 0;
    }

    //find an upgrades level
    getUpgradeLevel(upgradeType) {
        return this.upgradeManager.upgrades[upgradeType]?.level || 0;
    }

    //WILL BE USED FOR LOCKING AREAS
    isAreaUnlocked(areaNumber) {
        const carLevel = this.getUpgradeLevel('car');
        return carLevel >= areaNumber - 1;
    }

    //Find inventory size based on upgrade level
    getInventorySize() {
        const inventoryLevel = this.getUpgradeLevel('inventory');
        switch (inventoryLevel) {
            case 0: return 3;
            case 1: return 4;
            case 2: return 5;
            default: return 3;
        }
    }

    //Get the slot count correlating to inventory upgrade level
    getInventorySlotCount() {
        const size = this.getInventorySize();
        return size * size;
    }

    //get modifiers including shop modifiers
    getModifiers() {
        return this.upgradeManager.getCurrentModifiers();
    }

    //draw the shop
    draw() {
        image(Assets.BACK_ARROW, 0, 0, 120, 120);

        this.drawButtonHighlights();
        this.drawProgressBars();
        this.drawBackButtonHighlight();
        this.drawUpgradeInfo();
    }

    //draw hovering highlights
    drawButtonHighlights() {
        for (let i = 0; i < this.buttonAreas.length; i++) {
            const area = this.buttonAreas[i];
            const upgradeType = area.type;
            const upgrade = this.upgradeManager.upgrades[upgradeType];
            const isMaxLevel = upgrade ? upgrade.level >= upgrade.maxLevel : true;
            const canAfford = this.canAffordUpgrade(upgradeType, this.gameManager.money);

            if (this.isMouseOverButton(i) && !isMaxLevel && canAfford) {
                fill(255, 255, 255, 60);
                stroke(255, 255, 255);
                rect(area.x, area.y, area.w, area.h);
            }
        }
    }

    //draw the visual indications for upgrade level
    drawProgressBars() {
        noStroke();
        fill(0, 255, 0);

        Object.keys(this.upgradeManager.upgrades).forEach(upgradeType => {
            const upgrade = this.upgradeManager.upgrades[upgradeType];
            const bar = this.progressBars[upgradeType];
            if (bar && upgrade) {
                for (let i = 0; i < upgrade.level; i++) {
                    rect(bar.x, bar.y - i * bar.spacing, bar.w, bar.h);
                }
            }
        });
    }

    //draw helpful text explaining what upgrades do
    drawUpgradeInfo() {
        fill(255);
        textSize(16);
        textAlign(LEFT, TOP);

        this.buttonAreas.forEach(area => {
            const info = this.getUpgradeInfo(area.type);
            const x = area.x;
            const y = area.y + area.h + 10;

            noStroke();
            if (area.type === 'car') {
                textSize(14);
                text(info.name, x, y);
                text(info.description, x, y + 15);

                if (info.isMaxLevel) {
                    fill(0, 255, 0);
                    text("MAX", x, y + 30);
                    fill(255);
                } else {
                    const canAfford = this.canAffordUpgrade(area.type, this.gameManager.money);
                    if (canAfford) {
                        fill(255, 255, 0);
                    } else {
                        fill(255, 0, 0);
                    }
                    text(`$${info.price}`, x, y + 30);
                    fill(255);
                }
                textSize(16);
            } else {
                text(info.name, x, y);
                text(info.description, x, y + 20);

                if (info.isMaxLevel) {
                    fill(0, 255, 0);
                    text("MAX LEVEL", x, y + 40);
                    fill(255);
                } else {
                    const canAfford = this.canAffordUpgrade(area.type, this.gameManager.money);
                    if (canAfford) {
                        fill(255, 255, 0);
                    } else {
                        fill(255, 0, 0);
                    }
                    text(`Price: $${info.price}`, x, y + 40);
                    fill(255);
                }
            }
        });
    }

    //back button highlight
    drawBackButtonHighlight() {
        if (mouseX < 120 && mouseY < 120) {
            fill(255, 255, 255, 60);
            stroke(255, 255, 255);
            rect(0, 0, 120, 120);
        }
    }

    //check if mouse is over a button
    isMouseOverButton(buttonIndex) {
        const area = this.buttonAreas[buttonIndex];
        return mouseX > area.x && mouseX < area.x + area.w &&
            mouseY > area.y && mouseY < area.y + area.h;
    }

    //find button type mouse is hovering over
    getButtonTypeAt(mouseX, mouseY) {
        for (let i = 0; i < this.buttonAreas.length; i++) {
            if (this.isMouseOverButton(i)) {
                return this.buttonAreas[i].type;
            }
        }
        return null;
    }

    //click implementation
    handleClick(mouseX, mouseY) {
        if (mouseX < 120 && mouseY < 120) {
            return 'back';
        }

        const upgradeType = this.getButtonTypeAt(mouseX, mouseY);
        if (upgradeType && this.canAffordUpgrade(upgradeType, this.gameManager.money)) {
            return upgradeType;
        }

        return null;
    }

    //upgrade info for drawUpgradeInfo
    getUpgradeInfo(upgradeType) {
        const upgrade = this.upgradeManager.upgrades[upgradeType];
        if (!upgrade) return { name: '', description: '', isMaxLevel: true };

        const currentLevel = upgrade.level;
        const isMaxLevel = currentLevel >= upgrade.maxLevel;
        const price = this.getUpgradePrice(upgradeType);

        let name = '';
        let description = '';

        switch (upgradeType) {
            case 'rod':
                name = 'Upgrade Rod';
                const currentSizeCeiling = 2 + (currentLevel * 1.5);
                const nextSizeCeiling = 2 + ((currentLevel + 1) * 1.5);
                description = `Max size: ${currentSizeCeiling.toFixed(1)}` +
                    (isMaxLevel ? '' : ` → ${nextSizeCeiling.toFixed(1)}`);
                break;
            case 'bait':
                name = 'Upgrade Bait';
                const currentQualityCeiling = 3 + (currentLevel * 2);
                const nextQualityCeiling = 3 + ((currentLevel + 1) * 2);
                description = `Max quality: ${currentQualityCeiling}` +
                    (isMaxLevel ? '' : ` → ${nextQualityCeiling}`);
                break;
            case 'inventory':
                name = 'Upgrade Inventory';
                const currentSize = 3 + currentLevel;
                const nextSize = currentSize + 1;
                description = `${currentSize}x${currentSize} slots` +
                    (isMaxLevel ? '' : ` → ${nextSize}x${nextSize}`);
                break;
            case 'car':
                name = 'New Area';
                if (currentLevel === 0) description = 'Unlock Area 2';
                else if (currentLevel === 1) description = 'Unlock Area 3';
                else if (currentLevel === 2) description = 'Remove travel fee';
                else description = 'MAX';
                break;
        }

        return {
            name,
            description,
            currentLevel,
            maxLevel: upgrade.maxLevel,
            price,
            isMaxLevel
        };
    }
}