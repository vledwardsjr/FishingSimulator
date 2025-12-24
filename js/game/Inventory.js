//Class representing player's fish inventory
class Inventory {
    constructor() {
        this.fishInventory = [];
        this.invSize = 9;
        this.gridSize = 3;
        this.isOpen = false;
        // overlay state when interacting with a fish
        this.overlayOpen = false;
        this.overlaySelectedIndex = -1;
        this.overlayMessage = null;
        this.overlayMessageTimer = 0;
    }

    serialize() {
        return {
            inventory: this.fishInventory.map(fish => ({
                name: fish.name,
                size: fish.size,
                quality: fish.quality,
                value: fish.value
            }))
        };
    }

    load(inventory) {
        if (!inventory || !Array.isArray(inventory)) {
            this.fishInventory = [];
            return;
        }
        this.fishInventory = inventory.map(fishData => {
            let fish = new Fish([]);
            fish.name = fishData.name;
            fish.size = fishData.size;
            fish.quality = fishData.quality;
            fish.value = fishData.value || fish.calculateValue();
            fish.image = fish.getFishImage(fish.name);
            return fish;
        });
    }

    //expand inventory to new size
    expand(newSlotCount) {
        this.invSize = newSlotCount;
        this.overlayOpen = false;
        this.overlaySelectedIndex = -1;
    }

    //add fish to inventory
    addFish(fish) {
        if (this.fishInventory.length < this.invSize) {
            this.fishInventory.push(fish);
            return true;
        }
        return false;
    }

    //draw inventory button and grid display
    draw() {
        if (!this.isOpen) return;

        const slotSize = 130;
        const spacing = 20;

        const grid = Math.max(1, Math.ceil(Math.sqrt(this.invSize)));
        this.gridSize = grid;

        const totalW = grid * slotSize + (grid - 1) * spacing;
        const totalH = grid * slotSize + (grid - 1) * spacing;

        const startX = width / 2 - totalW / 2;
        const startY = height / 2 - totalH / 2;

        fill(0, 0, 0, 160);
        noStroke();
        rect(startX - 40, startY - 60, totalW + 80, totalH + 120, 25);

        textAlign(CENTER, TOP);
        fill(255);
        textSize(42);
        text("INVENTORY", width / 2, startY - 50);

        // draw grid
        let index = 0;
        for (let r = 0; r < grid; r++) {
            for (let c = 0; c < grid; c++) {
                const x = startX + c * (slotSize + spacing);
                const y = startY + r * (slotSize + spacing);
                stroke(255);
                strokeWeight(3);
                fill(40);
                rect(x, y, slotSize, slotSize, 15);
                if (this.fishInventory[index]) {
                    this.fishInventory[index].drawInSlot(x, y, slotSize);
                }
                index++;
            }
        }

        // draw interaction overlay if active
        if (this.overlayOpen && this.overlaySelectedIndex >= 0) {
            this.drawInteractionOverlay();
        }

        // draw temporary message if set
        if (this.overlayMessage && this.overlayMessageTimer > 0) {
            this.drawMessage(this.overlayMessage);
            this.overlayMessageTimer--;
            if (this.overlayMessageTimer <= 0) {
                this.overlayMessage = null;
            }
        }
    }

    //display the inventory as a grid x by x
    drawInventoryGrid() {
        const slotSize = 120;
        const spacing = 20;

        const grid = Math.max(1, Math.ceil(Math.sqrt(this.invSize)));
        const totalWidth = slotSize * this.gridSize + spacing * (this.gridSize - 1);
        const totalHeight = slotSize * this.gridSize + spacing * (this.gridSize - 1);
        const startX = 150 + (900 - totalWidth) / 2;
        const startY = 100 + (650 - totalHeight) / 2 + 40;

        fill(255, 255, 255, 60);
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const x = startX + col * (slotSize + spacing);
                const y = startY + row * (slotSize + spacing);
                rect(x, y, slotSize, slotSize, 10);
            }
        }

        textSize(12);
        textAlign(LEFT, TOP);
        fill(255);

        for (let i = 0; i < this.fishInventory.length; i++) {
            if (i >= this.invSize) break;

            const fish = this.fishInventory[i];
            const row = Math.floor(i / this.gridSize);
            const col = i % this.gridSize;
            const x = startX + col * (slotSize + spacing);
            const y = startY + row * (slotSize + spacing);

            if (fish.image) {
                image(fish.image, x + 5, y + 5, 50, 50);
            }

            text(`${fish.name}`, x + 5, y + 60);
            text(`Size: ${fish.size}`, x + 5, y + 75);
            text(`Qual: ${fish.quality}`, x + 5, y + 90);
            text(`$${fish.value}`, x + 5, y + 105);
        }
    }

    handleClick(mouseX, mouseY) {
        if (!this.isOpen) return null;

        const slotSize = 120;
        const spacing = 20;

        const grid = Math.max(1, Math.ceil(Math.sqrt(this.invSize)));
        this.gridSize = grid;

        const totalW = grid * slotSize + (grid - 1) * spacing;
        const totalH = grid * slotSize + (grid - 1) * spacing;
        const startX = width / 2 - totalW / 2;
        const startY = height / 2 - totalH / 2;

        if (this.overlayOpen && this.overlaySelectedIndex >= 0) {
            const overlayW = 400;
            const overlayH = 220;
            const ox = width / 2 - overlayW / 2;
            const oy = height / 2 - overlayH / 2;

            const btnW = 100;
            const btnH = 40;
            const gap = 30;
            const totalBtnsW = btnW * 3 + gap * 2;
            const btnStartX = width / 2 - totalBtnsW / 2;
            const btnY = oy + overlayH - 70;

            // SELL button
            if (mouseX >= btnStartX && mouseX <= btnStartX + btnW &&
                mouseY >= btnY && mouseY <= btnY + btnH) {
                const idx = this.overlaySelectedIndex;
                if (idx < this.fishInventory.length) {
                    const fish = this.fishInventory[idx];
                    if (typeof gameManager !== 'undefined' && gameManager) {
                        gameManager.money += fish.value;
                        gameManager.money = Math.round(gameManager.money * 10) / 10;
                    }
                    this.removeFish(idx);
                }
                this.overlayOpen = false;
                this.overlaySelectedIndex = -1;
                return idx;
            }
            // EAT button
            const eatX = btnStartX + btnW + gap;
            if (mouseX >= eatX && mouseX <= eatX + btnW &&
                mouseY >= btnY && mouseY <= btnY + btnH) {
                const idx = this.overlaySelectedIndex;
                if (idx < this.fishInventory.length) {
                    const fish = this.removeFish(idx);
                    if (typeof gameManager !== 'undefined' && gameManager && gameManager.upgradeManager) {
                        gameManager.roentgens += fish.rads;
                    }
                }
                this.overlayOpen = false;
                this.overlaySelectedIndex = -1;
                return idx;
            }
            // CANCEL button
            const cancelX = eatX + btnW + gap;
            if (mouseX >= cancelX && mouseX <= cancelX + btnW &&
                mouseY >= btnY && mouseY <= btnY + btnH) {
                this.overlayOpen = false;
                this.overlaySelectedIndex = -1;
                return null;
            }
            // click outside overlay closes it
            if (!(mouseX >= ox && mouseX <= ox + overlayW &&
                mouseY >= oy && mouseY <= oy + overlayH)) {
                this.overlayOpen = false;
                this.overlaySelectedIndex = -1;
            }
            return null;
        }

        const panelX = startX - 40;
        const panelY = startY - 60;
        const panelW = totalW + 80;
        const panelH = totalH + 120;

        if (mouseX < panelX || mouseX > panelX + panelW ||
            mouseY < panelY || mouseY > panelY + panelH) {
            // Close inventory if clicking outside the box
            this.isOpen = false;
            return 'closed';
        }

        for (let index = 0; index < this.invSize; index++) {
            const row = Math.floor(index / grid);
            const col = index % grid;

            const x = startX + col * (slotSize + spacing);
            const y = startY + row * (slotSize + spacing);

            if (mouseX >= x && mouseX <= x + slotSize &&
                mouseY >= y && mouseY <= y + slotSize) {

                // empty slot
                if (index >= this.fishInventory.length) return null;

                // open interaction overlay
                this.overlayOpen = true;
                this.overlaySelectedIndex = index;
                return index;
            }
        }
        return null;
    }


    // draw the small interaction overlay menu
    drawInteractionOverlay() {
        const overlayW = 400;
        const overlayH = 220;
        const ox = width / 2 - overlayW / 2;
        const oy = height / 2 - overlayH / 2;

        fill(0, 0, 0, 220);
        stroke(255);
        rect(ox, oy, overlayW, overlayH, 10);

        fill(255);
        textAlign(CENTER, TOP);
        textSize(20);
        const fish = this.fishInventory[this.overlaySelectedIndex];
        if (fish) {
            noStroke();
            text(`${fish.name}`, width / 2, oy + 20);
            textSize(16);
            text(`Size: ${fish.size} | Qual: ${fish.quality} | $${fish.value}`, width / 2, oy + 50);
        }

        // buttons
        const btnW = 100;
        const btnH = 40;
        const gap = 30;
        const totalBtnsW = btnW * 3 + gap * 2;
        const btnStartX = width / 2 - totalBtnsW / 2;
        const btnY = oy + overlayH - 70;

        // Sell
        fill(50, 150, 50);
        rect(btnStartX, btnY, btnW, btnH, 6);
        fill(255);
        textSize(16);
        textAlign(CENTER, CENTER);
        text('Sell', btnStartX + btnW / 2, btnY + btnH / 2);

        // Eat
        const eatX = btnStartX + btnW + gap;
        fill(200, 100, 20);
        rect(eatX, btnY, btnW, btnH, 6);
        fill(255);
        text('Eat', eatX + btnW / 2, btnY + btnH / 2);

        // Cancel
        const cancelX = eatX + btnW + gap;
        fill(120);
        rect(cancelX, btnY, btnW, btnH, 6);
        fill(255);
        text('Cancel', cancelX + btnW / 2, btnY + btnH / 2);
    }

    drawMessage(msg) {
        const w = 400;
        const h = 60;
        const x = width / 2 - w / 2;
        const y = height - 120;
        fill(0, 0, 0, 180);
        rect(x, y, w, h, 8);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(18);
        text(msg, x + w / 2, y + h / 2);
    }

    //toggle inventory display
    toggle() {
        this.isOpen = !this.isOpen;
    }

    //get total fish count in inventory
    getFishCount() {
        return this.fishInventory.length;
    }

    //determine whether inventory is full
    isFull() {
        return this.fishInventory.length >= this.invSize;
    }

    //remove fish at index
    removeFish(index) {
        if (index >= 0 && index < this.fishInventory.length) {
            return this.fishInventory.splice(index, 1)[0];
        }
        return null;
    }

    //sell fish at index
    sellFish(index) {
        const fish = this.removeFish(index);
        return fish ? fish.value : 0;
    }
}
