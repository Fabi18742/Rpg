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
        }
    },

    // ===== WAFFEN =====
    weapons: {
        dagger: {
            id: 'dagger',
            name: 'Dolch',
            type: 'physical',
            damage: 1,
            actionCost: 1,
            description: 'Ein einfacher Dolch für schnelle Angriffe',
            glitzerValue: 0  // Keine Glitzer bei Duplikat
        },
        sword: {
            id: 'sword',
            name: 'Schwert',
            type: 'physical',
            damage: 5,
            actionCost: 2,
            description: 'Ein kraftvolles Schwert für starke Angriffe',
            glitzerValue: 2  // 2 Glitzer bei Duplikat
        },
        rubberSword: {
            id: 'rubber_sword',
            name: 'Gummischwert',
            type: 'physical',
            damage: 0,
            actionCost: 1,
            description: 'Ein harmloses Gummischwert',
            glitzerValue: 0  // Keine Glitzer bei Duplikat
        }
    },

    // ===== KREATUREN =====
    creatures: {
        testwesen: {
            id: 'testwesen',
            name: 'Testwesen',
            acceptsItems: ['testseed'],      // Welche Items akzeptiert werden
            rewardWeapon: 'sword'           // Welche Waffe als Belohnung gegeben wird
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
            weapon: 'rubberSword',      // Welche Waffe der Boss verwendet
            drops: ['testseed']         // Item-IDs die gedroppt werden
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
            weapon: 'rubberSword',      // Welche Waffe der Boss verwendet
            drops: ['testseed']         // Item-IDs die gedroppt werden
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
