//class for storing constants
const GAME_STATES = {
    MAIN_MENU: "main_menu",
    BACKGROUND1: "background1",
    BACKGROUND2: "background2",
    BACKGROUND3: "background3",
    FISHING_DOCK1: "fishingDock1",
    FISHING_DOCK2: "fishingDock2",
    FISHING_DOCK3: "fishingDock3",
    SHOP: "shop",
    INVENTORY: "inventory"
};

const MINIGAME_STATES = {
    BAR_GAME: "BAR_GAME",
    NAV_GAME: "NAV_GAME",
    MATCHING_GAME: "MATCHING_GAME",
    REACTION_GAME: "REACTION_GAME",
    SPACE_GAME: "SPACE_GAME",
    SPAM_GAME: "SPAM_GAME"
};

const BAR_VARS = { x: 800, y: 200, h: 50, contW: 250, goalW: 25, critW: 8, cursorW: 4 };
const NAV_VARS = { x: 800, y: 200, h: 50, contW: 250, goalW: 15, cursorW: 5, progX: 1100, progY: 150, progW: 20, progH: 140, diff: 3 };
const REACTION_VARS = { x: 800, y: 200, w: 300, h: 100 };
const SPACE_VARS = { x: 835, y: 100, w: 80, h: 400, progX: 940, progY: 200, progW: 40, progH: 200, diff: 3, cursorH: 40, goalH: 5 };
const SPAM_VARS = { x: 835, y: 100, w: 80, h: 400, dY: 10 };

const AREA_FISHES = {
    AREA1: ["Elagabalus", "Nevets", "Clownfish", "Chef", "Gummy"],
    AREA2: ["Masha", "Christmas","DreadFish", "Tiger"],
    AREA3: ["Rogozhkin", "Shark", "SpookyFish", "Chainsaw"]
};

const INFO = {
    OVERVIEW: "Welcome to Chernobyl fishing simulator. Here you control a fisherman who is out to strike it rich by catching unique and mutated fish that have appeared around the old Chernobyl power plant. You can either hand them into the shop for a cash reward, or gobble them up. While they might be delicious, eating them might have some unintended consequences.... Explore the area and advance closer and closer to where everything happened and you'll end up with even better rewards.",
    MINIGAMES: "Each area has unique ways of catching fish. Click on the fisherman and then on his fishing rod to try your luck at catching a fish. Use the keys displayed on screen to complete the minigame. If you can complete it, you will catch a fish that can either be sold for money or eaten for special bonuses. The more dangerous the area, the more money you can make or the better bonus you will receive.",
    INVENTORY: "The inventory is where you can view and manage the fish you have caught so far. Simply click on the chest icon to open it and look at your collection of fish. To manage a fish you have already caught, click on it to look at your options. You can sell it for money or eat it for a chance to get a mutation. Once your inventory is full, all fish caught will be auto-sold for their value. You can increase the size of your inventory in the shop with the money you have earned from selling fish.",
    SHOP: "In the shop, you can spend your money you have gotten from selling fish. There are a few different thing you an upgrade if you have the money for it. You can upgrade your fishing rod and your bait which will increase the value of the fish you catch. You can also increase your inventory size and unlock new areas to fish in.",
    MUTATIONS: "Mutations are the special bonuses you will receive by eating fish or just spending time in game. The more radioactive the area your in, the faster your radiation will increase. Fish caught in a more radioactive area will also increase your radiation more. Once it gets high enough, you will earn a random mutation. You can gain luck which will increase the quality of your fish, or sight and strength which will make the minigames easier."
};
