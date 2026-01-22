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
            vitality: 0       // Vitalität
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
            glitzerValue: 1
        }
    },

    // ===== WAFFENBASEN =====
    // Basis-Definitionen ohne Effekte oder Variationen
    weaponBases: {
        dagger: {
            id: 'dagger',
            name: 'Dolch',
            type: 'physical',
            damage: 1,
            actionCost: 1,
            description: 'Ein einfacher Dolch für schnelle Angriffe',
            baseGlitzerValue: 0,
            ritualValue: 7  // Tier 1 (6-25)
        },
        sword: {
            id: 'sword',
            name: 'Schwert',
            type: 'physical',
            damage: 5,
            actionCost: 2,
            description: 'Ein kraftvolles Schwert für starke Angriffe',
            baseGlitzerValue: 2,
            ritualValue: 35  // Tier 2 (26-45)
        },
        rubberSword: {
            id: 'rubberSword',
            name: 'Gummischwert',
            type: 'physical',
            damage: 0,
            actionCost: 1,
            description: 'Ein harmloses Gummischwert',
            baseGlitzerValue: 0,
            ritualValue: 6
        },
        bigSword: {
            id: 'bigSword',
            name: 'Großes Schwert',
            type: 'physical',
            damage: 10,
            actionCost: 2,
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
        }
    },

    // ===== KREATUREN =====
    creatures: {
        testwesen: {
            id: 'testwesen',
            name: 'Testwesen',
            acceptsItems: ['testseed'],      // Welche Items akzeptiert werden
            rewardWeapon: {
                baseId: 'sword',
                effects: ['testdamage']    // Schwert mit +3 Schaden Effekt
            }
        }
    },

    // ===== BOSSE =====
    bosses: {
        testBoss1: {
            id: 'test_boss',
            name: 'Test Boss 1',
            hp: 5,
            maxHp: 5,
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
            hp: 5,
            maxHp: 5,
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
            boss: 'testBoss1'                 // Welcher Boss in dieser Welt ist
        },
        testwelt2: {
            id: 'testwelt2',
            name: 'Testwelt 2',
            description: 'Eine mysteriöse Testwelt',
            boss: 'testBoss2'                 // Welcher Boss in dieser Welt ist
        }
    },

    // ===== CRAWL-EVENTS =====
    // Events die während des Crawls in einer Boss-Welt auftreten können
    crawlEvents: {
        testevent1: {
            id: 'testevent1',
            name: 'Testevent 1',
            description: 'Ein mysteriöses Ereignis tritt auf',
            type: 'event',              // 'event' oder 'fight'
            difficulty: 1,              // Schwierigkeitsstufe (1-3)
            securityDecrease: 2        // Wie viel Prozent die Sicherheit sinkt (0-100)
        },
        testevent2: {
            id: 'testevent2',
            name: 'Testevent 2',
            description: 'Ein weiteres seltsames Ereignis',
            type: 'event',              // 'event' oder 'fight'
            difficulty: 1,              // Schwierigkeitsstufe (1-3)
            securityDecrease: 5        // Wie viel Prozent die Sicherheit sinkt (0-100)
        },
        testevent3: {
            id: 'testevent3',
            name: 'Testevent 3',
            description: 'Etwas Unheimliches geschieht',
            type: 'event',              // 'event' oder 'fight'
            difficulty: 1,              // Schwierigkeitsstufe (1-3)
            securityDecrease: 8        // Wie viel Prozent die Sicherheit sinkt (0-100)
        },
        testevent4: {
            id: 'testevent4',
            name: 'Testevent 4',
            description: 'Die Spannung steigt',
            type: 'event',              // 'event' oder 'fight'
            difficulty: 2,              // Schwierigkeitsstufe (1-3)
            securityDecrease: 2        // Wie viel Prozent die Sicherheit sinkt (0-100)
        },
        testevent5: {
            id: 'testevent5',
            name: 'Testevent 5',
            description: 'Gefährliche Zeichen mehren sich',
            type: 'event',              // 'event' oder 'fight'
            difficulty: 2,              // Schwierigkeitsstufe (1-3)
            securityDecrease: 5        // Wie viel Prozent die Sicherheit sinkt (0-100)
        },
        testevent6: {
            id: 'testevent6',
            name: 'Testevent 6',
            description: 'Das Chaos nimmt bedrohliche Züge an',
            type: 'event',              // 'event' oder 'fight'
            difficulty: 2,              // Schwierigkeitsstufe (1-3)
            securityDecrease: 8        // Wie viel Prozent die Sicherheit sinkt (0-100)
        },
        testevent7: {
            id: 'testevent7',
            name: 'Testevent 7',
            description: 'Unheilvolle Mächte erwachen',
            type: 'event',              // 'event' oder 'fight'
            difficulty: 3,              // Schwierigkeitsstufe (1-3)
            securityDecrease: 2        // Wie viel Prozent die Sicherheit sinkt (0-100)
        },
        testevent8: {
            id: 'testevent8',
            name: 'Testevent 8',
            description: 'Der Abgrund starrt zurück',
            type: 'event',              // 'event' oder 'fight'
            difficulty: 3,              // Schwierigkeitsstufe (1-3)
            securityDecrease: 5        // Wie viel Prozent die Sicherheit sinkt (0-100)
        },
        testevent9: {
            id: 'testevent9',
            name: 'Testevent 9',
            description: 'Das pure Chaos bricht herein',
            type: 'event',              // 'event' oder 'fight'
            difficulty: 3,              // Schwierigkeitsstufe (1-3)
            securityDecrease: 8        // Wie viel Prozent die Sicherheit sinkt (0-100)
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
