// src/data/definitions.js

export const Definitions = {
    player: {
        baseHp: 100,
        // NEU: Echte Start-Stats
        baseStats: {
            strength: 5,
            defense: 0,
            speed: 10
        }
    },
    items: {
        "rusty_sword": {
            id: "rusty_sword",
            name: "Rostiges Schwert",
            type: "weapon",
            damage: 5,
            value: 10
        },
        "iron_shield": {
            id: "iron_shield",
            name: "Eisenschild",
            type: "armor",
            defense: 3,
            value: 15
        },
        "potion_small": {
            id: "potion_small",
            name: "Kleiner Heiltrank",
            type: "consumable",
            effect: "heal",
            value: 20, // Heilt 20 HP
            goldValue: 5
        },
        "goblin_ear": {
            id: "goblin_ear",
            name: "Goblinohr",
            type: "material",
            description: "Ein bisschen schleimig.",
            goldValue: 2
        }
    },
    enemies: {
        "goblin": {
            id: "goblin",
            name: "Frecher Goblin",
            hp: 30,
            strength: 3,
            defense: 0,
            xp: 15, // Gibt 15 Erfahrung
            // NEU: Loot Table (Item ID und Wahrscheinlichkeit 0-1)
            lootTable: [
                { itemId: "goblin_ear", chance: 0.8 },
                { itemId: "potion_small", chance: 0.3 },
                { itemId: "rusty_sword", chance: 0.1 }
            ]
        }
    }
};