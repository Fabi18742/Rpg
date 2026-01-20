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
        startAbility: 'basicPunch'  // Fähigkeit mit der der Spieler startet
    },

    // ===== ITEMS =====
    items: {
        testseed: {
            id: 'testseed',
            name: 'Testseed',
            type: 'seed',
            description: 'Ein mysteriöser Testsamen'
        },
        glitzer: {
            id: 'glitzer',
            name: 'Glitzer',
            type: 'currency',
            description: 'Funkelnder Glitzer, wertvoll und selten'
        }
    },

    // ===== FÄHIGKEITEN =====
    abilities: {
        basicPunch: {
            id: 'basic_punch',
            name: 'Schlag',
            type: 'physical',
            damage: 1,
            actionCost: 1,
            description: 'Ein einfacher physischer Angriff',
            glitzerValue: 0  // Keine Glitzer bei Duplikat
        },
        powerPunch: {
            id: 'power_punch',
            name: 'Powerschlag',
            type: 'physical',
            damage: 5,
            actionCost: 2,
            description: 'Ein kraftvoller physischer Angriff',
            glitzerValue: 2  // 2 Glitzer bei Duplikat
        },
        testAbility: {
            id: 'test_ability',
            name: 'Testfähigkeit',
            type: 'physical',
            damage: 0,
            actionCost: 1,
            description: 'Eine mysteriöse Testfähigkeit',
            glitzerValue: 0  // Keine Glitzer bei Duplikat
        }
    },

    // ===== KREATUREN =====
    creatures: {
        testwesen: {
            id: 'testwesen',
            name: 'Testwesen',
            acceptsItems: ['testseed'],      // Welche Items akzeptiert werden
            rewardAbility: 'powerPunch'     // Welche Fähigkeit als Belohnung gegeben wird
        }
    },

    // ===== BOSSE =====
    bosses: {
        testBoss1: {
            id: 'test_boss',
            name: 'Test Boss 1',
            hp: 5,
            maxHp: 5,
            actionPoints: 1,             // Aktionspunkte pro Zug
            stats: {
                strength: 0,
                defense: 0,
                magic: 0,
                speed: 0
            },
            ability: 'testAbility',    // Welche Fähigkeit der Boss verwendet
            drops: ['testseed']              // Item-IDs die gedroppt werden
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
            ability: 'testAbility',    // Welche Fähigkeit der Boss verwendet
            drops: ['testseed']              // Item-IDs die gedroppt werden
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
            securityDecrease: 15        // Wie viel Prozent die Sicherheit sinkt (0-100)
        },
        testevent2: {
            id: 'testevent2',
            name: 'Testevent 2',
            description: 'Ein weiteres seltsames Ereignis',
            type: 'event',              // 'event' oder 'fight'
            securityDecrease: 20        // Wie viel Prozent die Sicherheit sinkt (0-100)
        },
        testevent3: {
            id: 'testevent3',
            name: 'Testevent 3',
            description: 'Etwas Unheimliches geschieht',
            type: 'event',              // 'event' oder 'fight'
            securityDecrease: 25        // Wie viel Prozent die Sicherheit sinkt (0-100)
        },
            testevent4: {
            id: 'testevent4',
            name: 'Testevent 4',
            description: 'Etwas Unheimliches geschieht',
            type: 'event',              // 'event' oder 'fight'
            securityDecrease: 50        // Wie viel Prozent die Sicherheit sinkt (0-100)
        }
    }
};
