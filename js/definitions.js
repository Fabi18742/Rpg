// ===== GAME DEFINITIONS =====
// Zentrale Definitionen für Items, Fähigkeiten, Kreaturen und Bosse
// Hier können einfach Balance-Anpassungen vorgenommen werden

const Definitions = {
    // ===== SPIELER-STANDARD-WERTE =====
    player: {
        level: 1,
        hp: 10,
        maxHp: 10,
        gold: 0,
        actionPoints: 2,      // Aktionspunkte pro Zug
        maxActionPoints: 2,   // Maximale Aktionspunkte
        stats: {
            strength: 1,      // Stärke
            defense: 2,       // Verteidigung
            magic: 0,         // Magie
            speed: 0,         // Geschwindigkeit
            glitzer: 0        // Glitzer (Spielwährung)
        },
        startWeapon: 'dagger'  // Waffe mit der der Spieler startet
    },

    // ===== ITEMS =====
    items: {
        testseed: {
            id: 'testseed',
            name: 'Testseed',
            type: 'seed',
            description: 'Ein mysteriöser Testsamen',
            glitzerValue: 1
        },
        glitzer: {
            id: 'glitzer',
            name: 'Glitzer',
            type: 'currency',
            description: 'Funkelnder Glitzer, wertvoll und selten'
        },
        heiltrank: {
            id: 'heiltrank',
            name: 'Heiltrank',
            type: 'consumable',
            description: 'Heilt 5 HP',
            healAmount: 5,
            glitzerValue: 1
        },
        
        // ===== RITUAL-ITEMS =====
        ritualItem_weak_none: {
            id: 'ritualItem_weak_none',
            name: 'Schwaches Ritual-Item (Neutral)',
            type: 'ritual',
            description: 'Ein schwaches Item ohne besonderen Effekt',
            modifierType: 'none',
            value: 1,
            glitzerValue: 1
        },
        ritualItem_weak_testdamage: {
            id: 'ritualItem_weak_testdamage',
            name: 'Schwaches Ritual-Item (Schaden)',
            type: 'ritual',
            description: 'Ein schwaches Item mit Schadensaffinit\u00e4t',
            modifierType: 'testdamage',
            value: 1,
            glitzerValue: 1
        },
        ritualItem_medium_none: {
            id: 'ritualItem_medium_none',
            name: 'Mittleres Ritual-Item (Neutral)',
            type: 'ritual',
            description: 'Ein mittleres Item ohne besonderen Effekt',
            modifierType: 'none',
            value: 5,
            glitzerValue: 1
        },
        ritualItem_medium_testdamage: {
            id: 'ritualItem_medium_testdamage',
            name: 'Mittleres Ritual-Item (Schaden)',
            type: 'ritual',
            description: 'Ein mittleres Item mit Schadensaffinit\u00e4t',
            modifierType: 'testdamage',
            value: 5,
            glitzerValue: 1
        },
        ritualItem_strong_none: {
            id: 'ritualItem_strong_none',
            name: 'Starkes Ritual-Item (Neutral)',
            type: 'ritual',
            description: 'Ein starkes Item ohne besonderen Effekt',
            modifierType: 'none',
            value: 10,
            glitzerValue: 1
        },
        ritualItem_strong_testdamage: {
            id: 'ritualItem_strong_testdamage',
            name: 'Starkes Ritual-Item (Schaden)',
            type: 'ritual',
            description: 'Ein starkes Item mit Schadensaffinit\u00e4t',
            modifierType: 'testdamage',
            value: 10,
            glitzerValue: 1        },
        ritualItem_weak_poison: {
            id: 'ritualItem_weak_poison',
            name: 'Schwaches Ritual-Item (Gift)',
            type: 'ritual',
            description: 'Ein schwaches Item mit Giftaffinität',
            modifierType: 'poison',
            value: 1,
            glitzerValue: 1
        },
        ritualItem_medium_poison: {
            id: 'ritualItem_medium_poison',
            name: 'Mittleres Ritual-Item (Gift)',
            type: 'ritual',
            description: 'Ein mittleres Item mit Giftaffinität',
            modifierType: 'poison',
            value: 5,
            glitzerValue: 1
        },
        ritualItem_strong_poison: {
            id: 'ritualItem_strong_poison',
            name: 'Starkes Ritual-Item (Gift)',
            type: 'ritual',
            description: 'Ein starkes Item mit Giftaffinität',
            modifierType: 'poison',
            value: 10,
            glitzerValue: 1        }
    },

    // ===== WAFFENBASEN =====
    // Basis-Definitionen ohne Effekte oder Variationen
    weaponBases: {
        dagger: {
            id: 'dagger',
            name: 'Dolch',
            type: 'physical',
            damage: 1,
            description: 'Ein einfacher Dolch für schnelle Angriffe',
            baseGlitzerValue: 0,
            ritualValue: 7  // Tier 1 (6-25)
        },
        sword: {
            id: 'sword',
            name: 'Schwert',
            type: 'physical',
            damage: 5,
            description: 'Ein kraftvolles Schwert für starke Angriffe',
            baseGlitzerValue: 2,
            ritualValue: 35  // Tier 2 (26-45)
        },
        rubberSword: {
            id: 'rubberSword',
            name: 'Gummischwert',
            type: 'physical',
            damage: 0,
            description: 'Ein harmloses Gummischwert',
            baseGlitzerValue: 0,
            ritualValue: 6
        },
        bigSword: {
            id: 'bigSword',
            name: 'Großes Schwert',
            type: 'physical',
            damage: 10,
            description: 'Ein dickes Schwert',
            baseGlitzerValue: 5,
            ritualValue: 46
        },
    },

    // ===== EFFEKT-SYSTEM =====
    effects: {
        testdamage: {
            id: 'testdamage',
            name: 'Testdamage',
            description: 'Fügt +3 zusätzlichen Schaden hinzu',
            glitzerValueMultiplier: 1.5,
            type: 'damage',
            value: 3
        },
        poison: {
            id: 'poison',
            name: 'Gift',
            description: 'Hat eine 50% Chance, 2 Gift-Stacks aufzutragen',
            glitzerValueMultiplier: 2.0,
            type: 'poison',
            value: 1,                    // Basis-Schaden pro Runde
            applyChance: 0.5,            // 50% Chance
            stacksToApply: 2,            // Anzahl Stacks die hinzugefügt werden
            ignoreArmor: true            // Gift ignoriert Rüstung
        }
    },

    // ===== FÄHIGKEITEN-SYSTEM =====
    abilities: {
        stich: {
            id: 'stich',
            name: 'Stich',
            description: 'Ein einfacher Angriff mit der Waffe',
            damageType: 'physical',      // 'physical' oder 'magical'
            apCost: 1,                   // AP-Kosten pro Nutzung
            attacks: 1,                  // Anzahl der Angriffe
            damageMultiplier: 1.0,       // Multiplikator für Waffenschaden (1.0 = 100%)
            hitChance: 1.0               // Trefferchance (1.0 = 100%)
        },
        doppelhit: {
            id: 'doppelhit',
            name: 'Doppelhit',
            description: '2 schnelle Angriffe mit 60% Schaden pro Treffer',
            damageType: 'physical',
            apCost: 1,
            attacks: 2,                  // 2 separate Angriffe
            damageMultiplier: 0.6,       // 60% Schaden pro Angriff
            hitChance: 1.0               // Trefferchance (1.0 = 100%)
        },
        riskanterSchlag: {
            id: 'riskanterSchlag',
            name: 'Riskanter Schlag',
            description: 'Ein riskanter Angriff mit 70% Trefferchance, aber 150% Schaden',
            damageType: 'physical',
            apCost: 1,
            attacks: 1,
            damageMultiplier: 1.5,       // 150% Schaden
            hitChance: 0.7               // 70% Trefferchance
        }
    },

    // ===== GEGNER =====
    // Normale Gegner für Kampfevents
    enemies: {
        enemyTestDummy: {
            id: 'enemyTestDummy',
            name: 'Test Dummy',
            hp: 50,
            maxHp: 50,
            stats: {
                strength: 0,
                defense: 0,
                magic: 0,
                speed: 0
            },
            weapon: {
                baseId: 'sword',
                effects: []
            },
            drops: []  // Keine Drops
        }
    },

    // ===== BOSSE =====
    bosses: {
        testBoss1: {
            id: 'test_boss',
            name: 'Test Boss 1',
            hp: 500,
            maxHp: 500,
            actionPoints: 2,             // Aktionspunkte pro Zug
            stats: {
                strength: 0,
                defense: 0,
                magic: 0,
                speed: 0
            },
            weapon: {                     // Waffeninstanz (wie beim Spieler)
                baseId: 'rubberSword',
                effects: []               // Keine Effekte
            },
            drops: ['testseed']          // Item-IDs die gedroppt werden
        },
        testBoss2: {
            id: 'test_boss2',
            name: 'Test Boss 2',
            hp: 500,
            maxHp: 500,
            actionPoints: 1,             // Aktionspunkte pro Zug
            stats: {
                strength: 0,
                defense: 0,
                magic: 0,
                speed: 0
            },
            weapon: {                     // Waffeninstanz mit Effekt
                baseId: 'rubberSword',
                effects: ['testdamage'] // +3 Schaden Effekt
            },
            drops: ['testseed']          // Item-IDs die gedroppt werden
        }
    },

    // ===== BOSS-WELTEN =====
    bossWorlds: {
        testwelt1: {
            id: 'testwelt1',
            name: 'Testwelt 1',
            description: 'Eine mysteriöse Testwelt',
            boss: 'testBoss1',                 // Welcher Boss in dieser Welt ist
            allowedEvents: null                // null = alle Events erlaubt
        },
        testwelt2: {
            id: 'testwelt2',
            name: 'Testwelt 2',
            description: 'Eine mysteriöse Testwelt',
            boss: 'testBoss2',                 // Welcher Boss in dieser Welt ist
            allowedEvents: ['choice_lorem', 'choice_lorem_diff2', 'choice_lorem_diff3']  // Nur Multiple Choice Events
        }
    },

    // ===== CRAWL-EVENTS =====
    // Events die während des Crawls in einer Boss-Welt auftreten können
    crawlEvents: {
        // ===== KAMPF-EVENTS =====
        combat_testdummy: {
            id: 'combat_testdummy_diff1',
            name: 'Test Dummy Kampf',
            description: 'Drei Test Dummies versperren den Weg!',
            type: 'combat',
            minChaos: 0,
            maxChaos: null,
            securityDecrease: 2,
            enemies: ['enemyTestDummy', 'enemyTestDummy', 'enemyTestDummy']
        },
        combat_testdummy2: {
            id: 'combat_testdummy2_diff1',
            name: 'Test Dummy Kampf 2',
            description: 'Drei Test Dummies versperren den Weg!',
            type: 'combat',
            minChaos: 0,
            maxChaos: null,
            securityDecrease: 5,
            enemies: ['enemyTestDummy', 'enemyTestDummy', 'enemyTestDummy']
        },
            combat_testdummy3: {
            id: 'combat_testdummy3',
            name: 'Test Dummy Kampf 3',
            description: 'Drei Test Dummies versperren den Weg!',
            type: 'combat',
            minChaos: 0,
            maxChaos: null,
            securityDecrease: 8,
            enemies: ['enemyTestDummy', 'enemyTestDummy', 'enemyTestDummy']
        },

        // ===== MULTIPLE CHOICE EVENTS =====
        choice_lorem: {
            id: 'choice_lorem',
            name: 'Mysteriöse Begegnung',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\nUt enim ad minim veniam, quis nostrud exercitation ullamco.\nDuis aute irure dolor in reprehenderit in voluptate velit.',
            type: 'multipleChoice',
            minChaos: 0,
            maxChaos: null,
            securityDecrease: 2,
            choices: [
                {
                    text: 'Ja',
                    effects: [
                        { type: 'addItem', itemId: 'glitzer', amount: 1 }
                    ]
                },
                {
                    text: 'Nein',
                    effects: [
                        { type: 'addChaos', amount: 1 }
                    ]
                }
            ]
        },
        choice_lorem2: {
            id: 'choice_lorem2',
            name: 'Mysteriöse Begegnung',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\nUt enim ad minim veniam, quis nostrud exercitation ullamco.\nDuis aute irure dolor in reprehenderit in voluptate velit.',
            type: 'multipleChoice',
            minChaos: 0,
            maxChaos: null,
            securityDecrease: 5,
            choices: [
                {
                    text: 'Ja',
                    effects: [
                        { type: 'addItem', itemId: 'glitzer', amount: 1 }
                    ]
                },
                {
                    text: 'Nein',
                    effects: [
                        { type: 'addChaos', amount: 1 }
                    ]
                }
            ]
        },
        choice_lorem: {
            id: 'choice_lorem3',
            name: 'Mysteriöse Begegnung',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\nUt enim ad minim veniam, quis nostrud exercitation ullamco.\nDuis aute irure dolor in reprehenderit in voluptate velit.',
            type: 'multipleChoice',
            minChaos: 0,
            maxChaos: null,
            securityDecrease: 8,
            choices: [
                {
                    text: 'Ja',
                    effects: [
                        { type: 'addItem', itemId: 'glitzer', amount: 1 }
                    ]
                },
                {
                    text: 'Nein',
                    effects: [
                        { type: 'addChaos', amount: 1 }
                    ]
                }
            ]
        }
    },

    // ===== SHOP-SYSTEM =====
    // Händler und ihre Angebote
    merchants: {
        testhaendler: {
            id: 'testhaendler',
            name: 'Testhändler',
            description: 'Ein mysteriöser Händler mit nützlichen Waren',
            offers: [
                {
                    itemId: 'heiltrank',
                    price: 2,           // Kosten in Glitzer
                    currency: 'glitzer'
                },
                // Ritual-Items zum Testen
                {
                    itemId: 'ritualItem_weak_none',
                    price: 0,
                    currency: 'glitzer'
                },
                {
                    itemId: 'ritualItem_weak_testdamage',
                    price: 0,
                    currency: 'glitzer'
                },
                {
                    itemId: 'ritualItem_medium_none',
                    price: 0,
                    currency: 'glitzer'
                },
                {
                    itemId: 'ritualItem_medium_testdamage',
                    price: 0,
                    currency: 'glitzer'
                },
                {
                    itemId: 'ritualItem_strong_none',
                    price: 0,
                    currency: 'glitzer'
                },
                {
                    itemId: 'ritualItem_strong_testdamage',
                    price: 0,
                    currency: 'glitzer'
                },
                {
                    itemId: 'ritualItem_weak_poison',
                    price: 0,
                    currency: 'glitzer'
                },
                {
                    itemId: 'ritualItem_medium_poison',
                    price: 0,
                    currency: 'glitzer'
                },
                {
                    itemId: 'ritualItem_strong_poison',
                    price: 0,
                    currency: 'glitzer'
                }
            ]
        },
        testhaendler2: {
            id: 'testhaendler2',
            name: 'Testhändler 2',
            description: 'Ein mysteriöser Händler mit nützlichen Waren',
            offers: [
                {
                    itemId: 'heiltrank',
                    price: 2,           // Kosten in Glitzer
                    currency: 'glitzer'
                }
            ]
        }
    }
};
