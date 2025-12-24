//Class representing the mutations the player will earn through radioactivity
class Mutation {
    //mutation constructor
    constructor(type, level = 0) {
        this.type = type;
        this.level = level;
        this.effects = this.getEffects();
    }

    //return the effects each mutation has, cap at 10 for minigame changes
    getEffects() {
        const tiers = Math.floor(this.level / 10);
        const tierBonus = tiers * 5;
        const withinTier = this.level % 10;

        const effects = {
            'luck': { 
                qualityFloor: 1 + (withinTier * 0.5) + tierBonus
            },
            'strength': { 
                minigameMultiplier: 1 + (Math.min(this.level, 10) * 0.2),
                sizeFloor: 1.0 + (withinTier * 0.3) + (tiers * 2)
            },
            'sight': { 
                targetSizeMultiplier: 1 + (Math.min(this.level, 10) * 0.2),
                reactionWindow: 1 + (Math.min(this.level, 10) * 0.15)
            }
        };
        return effects[this.type] || {};
    }

    //attempt to upgrade the mutation
    upgrade() {
        this.level++;
        this.effects = this.getEffects();
        return true;
    }

    //draw the mutation on the UI
    draw(x, y, width, height) {
        let icon;
        switch(this.type) {
            case 'luck':
                fill(110, 255, 55);
                icon = Assets.LUCK;
                break;
            case 'strength':
                fill(200, 0, 0);
                icon = Assets.STRENGTH;
                break;
            case 'sight':
                fill(250, 250, 60);
                icon = Assets.SIGHT;
                break;
        }
        textAlign(RIGHT, TOP);
        textSize(32)
        stroke(0, 0, 0);
        text(this.level, x, y);

        //representative icon
        image(icon, x - width * 1.5, y - height / 3, width, height);
    }
}