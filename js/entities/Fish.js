//Class representing the fish the player will catch, eat, and sell
class Fish {

  //fish constructor
  constructor(fList) {
    this.name = this.generateName(fList);
    this.area = this.getArea();
    this.size = this.generateSize();
    this.quality = this.generateQuality();
    this.bonus = this.getBonus();
    this.value = this.calculateValue();
    this.image = this.getFishImage(this.name);
    this.rads = this.getRads();


  }

  //find correct image for fish
  getFishImage(fishName) {
    const fishAssets = {
      "Elagabalus": Assets.FISH_ELAGABALUS,
      "Nevets": Assets.FISH_NEVETS,
      "Masha": Assets.FISH_MASHA,
      "Rogozhkin": Assets.FISH_ROGOZHKIN,
      "Shark": Assets.FISH_SHARK,
      "SpookyFish": Assets.FISH_SPOOKYFISH,
      "Chainsaw": Assets.FISH_CHAINSAW,
      "Chef": Assets.FISH_CHEF,
      "Christmas": Assets.FISH_CHRISTMAS,
      "Clownfish": Assets.FISH_CLOWNFISH,
      "DreadFish": Assets.FISH_DREADFISH,
      "Tiger": Assets.FISH_TIGERFISH,
      "Gummy": Assets.FISH_GUMMY
    };
    return fishAssets[fishName] || null;
  }

  calculateValue() {
    let value = this.quality * this.size + this.bonus;
    return Math.round(value * 10) / 10.0;
  }

  //pick random name based on area
  generateName(fList) {
    let nameIndex = Math.floor(random(0, fList.length))
    let name = fList[nameIndex];
    return name;
  }

  //generate size between rod and strength multipliers
  generateSize() {
    const mods = gameManager.upgradeManager.getCurrentModifiers();
    let size = random(mods.sizeFloor, mods.qualityFloor * mods.sizeCeiling);
    return Math.round(size * 10) / 10;
  }

  //generate quality between luck and bait multipliers
  generateQuality() {
    const mods = gameManager.upgradeManager.getCurrentModifiers();
    return Math.round(random(mods.qualityFloor, mods.qualityFloor * mods.qualityCeiling));
  }
  getArea() {
    if (AREA_FISHES.AREA1.includes(this.name)) {
      return 1;
    }
    else if (AREA_FISHES.AREA2.includes(this.name)) {
      return 2;
    }
    else if (AREA_FISHES.AREA3.includes(this.name)) {
      return 3;
    }
  }
  getBonus() {
    return 5 ** this.getArea();
  }



  getRads() {
    return (6 ** this.getArea()) * this.size;
  }



  //added methods for drawing the fish..
  draw(x, y, width, height) {
    if (this.image) {
      image(this.image, x, y, width, height);
    }

    fill(255);
    textSize(16);
    textAlign(LEFT, TOP);
    text(`Name: ${this.name}`, x, y + height + 10);
    text(`Size: ${this.size}`, x, y + height + 30);
    text(`Quality: ${this.quality}`, x, y + height + 50);
    text(`Value: $${this.value}`, x, y + height + 70);
  }

  drawCentered() {
    const centerX = width / 2;
    const centerY = height / 2;
    const fishWidth = 200;
    const fishHeight = 200;

    if (this.image) {
      image(this.image, centerX - fishWidth / 2, centerY - fishHeight / 2, fishWidth, fishHeight);
    }

    fill(255);
    textSize(24);
    textAlign(CENTER, TOP);
    text(`You caught: ${this.name}`, centerX, centerY + fishHeight / 2 + 20);
    textSize(18);
    text(`Size: ${this.size} | Quality: ${this.quality} | Value: $${this.value}`, centerX, centerY + fishHeight / 2 + 50);
  }

  drawInSlot(x, y, size) {
    if (this.image) {
      image(this.image, x + 10, y + 10, size - 20, size - 20);
    }
  }

}
