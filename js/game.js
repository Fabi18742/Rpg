// Game State & Logic

const Game = {
    // Referenzen zu zentralen Definitionen
    items: Definitions.items,
    abilities: Definitions.abilities,
    creatures: Definitions.creatures,
    bosses: Definitions.bosses,
    bossWorlds: Definitions.bossWorlds,
    crawlEvents: Definitions.crawlEvents,
    merchants: Definitions.merchants,

    state: {
        currentScreen: 'hideout',
        player: {
            level: Definitions.player.level,
            hp: Definitions.player.hp,
            maxHp: Definitions.player.maxHp,
            gold: Definitions.player.gold,
            actionPoints: Definitions.player.actionPoints,
            maxActionPoints: Definitions.player.maxActionPoints,
            // RPG Stats aus Definitions
            stats: {
                strength: Definitions.player.stats.strength,
                defense: Definitions.player.stats.defense,
                magic: Definitions.player.stats.magic,
                speed: Definitions.player.stats.speed,
                vitality: Definitions.player.stats.vitality
            },
            // Alle verfügbaren Fähigkeiten
            abilities: [],
            // 4 ausgrüstete Fähigkeiten für Kampf
            equippedAbilities: [null, null, null, null],
            inventory: []
        },
        defeatedBosses: [],
        // Kampf-Zustand
        currentBattle: null,
        // Crawl-Zustand (Boss-Welt-Erkundung)
        currentCrawl: null
    },

    // Initialisierung
    init() {
        console.log('Game wird initialisiert...');
        
        // DEBUG: LocalStorage zurücksetzen falls alte Struktur
        try {
            const savedState = Storage.loadGameState();
            if (savedState && !savedState.player.stats) {
                console.log('Alte Spielstand-Struktur erkannt - wird zurückgesetzt');
                Storage.clearGameState();
            }
            // Aktionspunkte hinzufügen falls nicht vorhanden (Legacy Support)
            if (savedState && savedState.player && !savedState.player.hasOwnProperty('actionPoints')) {
                console.log('Füge Aktionspunkte zu bestehendem Spielstand hinzu');
                savedState.player.actionPoints = Definitions.player.actionPoints;
                savedState.player.maxActionPoints = Definitions.player.maxActionPoints;
            }
        } catch (error) {
            console.log('Fehler beim Laden - LocalStorage wird zurückgesetzt');
            Storage.clearGameState();
        }
        
        // Spielstand laden falls vorhanden
        const savedState = Storage.loadGameState();
        if (savedState) {
            this.state = savedState;
            console.log('Spielstand geladen');
        } else {
            console.log('Neues Spiel gestartet');
            // Start-Fähigkeit aus Definitions hinzufügen
            const startAbility = this.abilities[Definitions.player.startAbility];
            if (startAbility) {
                this.addAbility(startAbility);
                // Automatisch ausrüsten
                this.equipAbility(startAbility.id, 0);
            }
        }

        // UI initialisieren
        UI.init();
        this.showScreen('hideout');
    },

    // Screen wechseln
    showScreen(screenName) {
        this.state.currentScreen = screenName;
        console.log('Wechsel zu Screen:', screenName);
        
        switch(screenName) {
            case 'hideout':
                UI.showHideout();
                break;
            case 'shop':
                UI.showShop();
                break;
            case 'boss':
                UI.showBossSelection();
                break;
            case 'explore':
                UI.showExplore();
                break;
            default:
                console.error('Unbekannter Screen:', screenName);
        }

        // Spielstand speichern
        this.save();
    },

    // Spielstand speichern
    save() {
        Storage.saveGameState(this.state);
    },

    // Fähigkeit hinzufügen
    addAbility(ability) {
        if (!this.state.player.abilities.find(a => a.id === ability.id)) {
            this.state.player.abilities.push(ability);
            this.save();
            console.log('Fähigkeit erlernt:', ability.name);
            return true;
        } else {
            // Fähigkeit bereits vorhanden - Glitzer als Entschädigung
            const glitzerValue = ability.glitzerValue || 0;
            if (glitzerValue > 0) {
                // Glitzer-Item ins Inventar hinzufügen
                const glitzerItem = this.items.glitzer;
                for (let i = 0; i < glitzerValue; i++) {
                    this.addItemToInventory(glitzerItem);
                }
                this.save();
                console.log(`${ability.name} bereits vorhanden! +${glitzerValue} Glitzer erhalten`);
                return 'duplicate';
            }
            console.log('Fähigkeit bereits vorhanden');
            return false;
        }
    },

    // Fähigkeit ausrüsten (slot 0-3)
    equipAbility(abilityId, slot) {
        if (slot < 0 || slot > 3) return false;
        
        // Prüfe ob Fähigkeit bereits ausgerüstet ist
        if (this.state.player.equippedAbilities.includes(abilityId)) {
            console.log('Fähigkeit ist bereits ausgerüstet!');
            return false;
        }
        
        const ability = this.state.player.abilities.find(a => a.id === abilityId);
        if (ability) {
            this.state.player.equippedAbilities[slot] = abilityId;
            this.save();
            console.log(`${ability.name} in Slot ${slot + 1} ausgerüstet`);
            return true;
        }
        return false;
    },

    // Fähigkeit aus Slot entfernen
    unequipAbility(slot) {
        if (slot >= 0 && slot <= 3) {
            this.state.player.equippedAbilities[slot] = null;
            this.save();
            return true;
        }
        return false;
    },

    // Ausgerüstete Fähigkeiten für Kampf holen
    getEquippedAbilities() {
        return this.state.player.equippedAbilities
            .map(id => id ? this.state.player.abilities.find(a => a.id === id) : null)
            .filter(a => a !== null);
    },

    // Kampf starten
    startBattle(boss) {
        this.state.currentBattle = {
            boss: JSON.parse(JSON.stringify(boss)), // Deep copy
            turn: 'player',
            playerActionPoints: this.state.player.maxActionPoints,
            bossActionPoints: boss.actionPoints,
            blockBonus: 0,  // Temporärer Block-Bonus für die nächste Runde
            log: [`Kampf gegen ${boss.name} beginnt!`]
        };
        this.save();
        UI.showBattleScreen();
    },

    // Spieler-Angriff
    playerAttack(abilityId) {
        console.log('playerAttack aufgerufen', abilityId, 'Turn:', this.state.currentBattle?.turn);
        
        if (!this.state.currentBattle || this.state.currentBattle.turn !== 'player') {
            console.log('Abbruch: Kein Battle oder nicht am Zug');
            return;
        }

        const ability = this.state.player.abilities.find(a => a.id === abilityId);
        if (!ability) {
            console.log('Abbruch: Fähigkeit nicht gefunden');
            return;
        }

        const battle = this.state.currentBattle;
        
        // Prüfe ob genug Aktionspunkte vorhanden sind
        if (battle.playerActionPoints < ability.actionCost) {
            console.log('Nicht genug Aktionspunkte!');
            return;
        }
        
        // Aktionspunkte abziehen
        battle.playerActionPoints -= ability.actionCost;
        
        const boss = battle.boss;
        
        console.log('Boss HP vor Angriff:', boss.hp);
        
        // Schaden berechnen: Basis-Schaden + Stärke - Gegner-Verteidigung
        const baseDamage = ability.damage;
        const playerStrength = this.state.player.stats.strength;
        const bossDefense = boss.stats.defense;
        let damage = baseDamage + playerStrength - bossDefense;
        
        console.log(`[SCHADEN] ${ability.name}: Basis=${baseDamage} + Stärke=${playerStrength} - Verteidigung=${bossDefense} = ${damage}`);
        
        if (damage < 0) {
            console.log(`[SCHADEN] Schaden unter 0, setze auf 0`);
            damage = 0;
        }

        boss.hp -= damage;
        battle.log.push(`${ability.name} = ${damage} (dmg)`);
        
        console.log('Boss HP nach Angriff:', boss.hp);

        // Boss besiegt?
        if (boss.hp <= 0) {
            boss.hp = 0;
            battle.log.push(`${boss.name} wurde besiegt!`);
            console.log('Boss besiegt!');
            this.endBattle(true);
            return;
        }

        // Prüfe ob Spieler noch Aktionspunkte hat
        if (battle.playerActionPoints > 0) {
            // Spieler kann noch Aktionen ausführen
            this.save();
            UI.updateBattleScreen();
        } else {
            // Spieler-Zug beendet, Gegner ist dran
            battle.turn = 'enemy';
            this.save();
            UI.updateBattleScreen();

            // Verzögerung für Gegner-Angriff
            setTimeout(() => this.enemyAttack(), 1500);
        }
    },

    // Spieler blockt
    playerBlock() {
        console.log('playerBlock aufgerufen', 'Turn:', this.state.currentBattle?.turn);
        
        if (!this.state.currentBattle || this.state.currentBattle.turn !== 'player') {
            console.log('Abbruch: Kein Battle oder nicht am Zug');
            return;
        }

        const battle = this.state.currentBattle;
        
        // Prüfe ob genug Aktionspunkte vorhanden sind
        if (battle.playerActionPoints < 1) {
            console.log('Nicht genug Aktionspunkte zum Blocken!');
            return;
        }
        
        // Block-Wert berechnen: Nur AP-Bonus (Defense wird bereits normal vom Schaden abgezogen!)
        const availableAP = battle.playerActionPoints; // AP BEVOR wir abziehen
        const blockBonus = availableAP * 2; // Alle verfügbaren AP geben +2 Block pro AP
        
        battle.blockBonus = blockBonus;
        battle.log.push(`Block! (+${blockBonus} Verteidigung)`);
        
        console.log(`[BLOCK] Available AP=${availableAP}, Block Bonus=${blockBonus}`);
        
        // NACH der Berechnung: Alle AP verbrauchen (Zug ist beendet)
        battle.playerActionPoints = 0;
        battle.turn = 'enemy';
        this.save();
        UI.updateBattleScreen();

        // Verzögerung für Gegner-Angriff
        setTimeout(() => this.enemyAttack(), 1500);
    },

    // Gegner-Angriff
    enemyAttack() {
        console.log('enemyAttack aufgerufen');
        
        if (!this.state.currentBattle) {
            console.log('Abbruch: Kein Battle');
            return;
        }

        const battle = this.state.currentBattle;
        const boss = battle.boss;

        // Boss-Fähigkeit aus Definitionen holen
        const bossAbility = this.abilities[boss.ability];
        const attackDamage = bossAbility ? bossAbility.damage : 0;
        const attackName = bossAbility ? bossAbility.name : 'Angriff';
        const actionCost = bossAbility ? bossAbility.actionCost : 1;

        // Prüfe ob Boss noch Aktionspunkte hat
        if (battle.bossActionPoints >= actionCost) {
            // Boss greift an
            battle.bossActionPoints -= actionCost;
            
            // Schaden berechnen: Boss-Ability-Damage + Boss-Stärke - Spieler-Verteidigung
            const bossBaseDamage = attackDamage;
            const bossStrength = boss.stats.strength;
            const playerDefense = this.state.player.stats.defense;
            const blockBonus = battle.blockBonus || 0;
            let damage = bossBaseDamage + bossStrength - playerDefense - blockBonus;
            
            console.log(`[SCHADEN] ${attackName}: Basis=${bossBaseDamage} + Stärke=${bossStrength} - Verteidigung=${playerDefense} - Block=${blockBonus} = ${damage}`);
            
            if (damage < 0) {
                console.log(`[SCHADEN] Schaden unter 0, setze auf 0`);
                damage = 0;
            }

            this.state.player.hp -= damage;
            if (this.state.player.hp < 0) this.state.player.hp = 0;

            battle.log.push(`${attackName} = ${damage} (dmg)`);

            console.log('Spieler HP:', this.state.player.hp);
            
            // Block-Bonus nach dem Angriff zurücksetzen
            if (battle.blockBonus > 0) {
                console.log(`[BLOCK] Block-Bonus wird zurückgesetzt: ${battle.blockBonus} -> 0`);
                battle.blockBonus = 0;
            }

            // Spieler besiegt?
            if (this.state.player.hp <= 0) {
                battle.log.push('Du wurdest besiegt!');
                console.log('Spieler besiegt!');
                this.endBattle(false);
                return;
            }
        }
        
        // Prüfe ob Boss noch Aktionspunkte hat
        if (battle.bossActionPoints > 0 && battle.bossActionPoints >= actionCost) {
            // Boss kann noch einmal angreifen
            this.save();
            UI.updateBattleScreen();
            setTimeout(() => this.enemyAttack(), 1500);
        } else {
            // Boss-Zug beendet, Spieler ist dran
            console.log('Setze turn auf player');
            battle.turn = 'player';
            // Aktionspunkte regenerieren
            battle.playerActionPoints = this.state.player.maxActionPoints;
            battle.bossActionPoints = boss.actionPoints;
            this.save();
            UI.updateBattleScreen();
        }
    },

    // Kampf beenden
    endBattle(victory) {
        if (victory) {
            const boss = this.state.currentBattle.boss;
            const bossId = boss.id;
            
            if (!this.state.defeatedBosses.includes(bossId)) {
                this.state.defeatedBosses.push(bossId);
            }
            
            // Drops hinzufügen
            if (boss.drops && boss.drops.length > 0) {
                boss.drops.forEach(dropId => {
                    // Hole Item aus zentraler Definition
                    const item = this.items[dropId];
                    if (item) {
                        this.addItemToInventory(item);
                        this.state.currentBattle.log.push(`${item.name} erhalten!`);
                    }
                });
            }
        } else {
            // Bei Niederlage: HP auf 1 setzen
            this.state.player.hp = 1;
        }

        // Crawl-Zustand löschen (falls vorhanden)
        if (this.state.currentCrawl) {
            this.state.currentCrawl = null;
        }

        this.save();

        // UI aktualisieren für Drop-Nachricht
        UI.updateBattleScreen();

        // Zurück zum Hideout nach 3 Sekunden
        setTimeout(() => {
            this.state.currentBattle = null;
            this.save();
            this.showScreen('hideout');
        }, 3000);
    },

    // Item zum Inventar hinzufügen
    addItemToInventory(item) {
        console.log('addItemToInventory aufgerufen mit:', item);
        
        const existingItem = this.state.player.inventory.find(i => i.id === item.id);
        
        if (existingItem) {
            // Item existiert bereits, erhöhe Anzahl
            existingItem.quantity = (existingItem.quantity || 1) + 1;
            console.log(`${item.name} Anzahl erhöht auf ${existingItem.quantity}`);
        } else {
            // Neues Item hinzufügen
            this.state.player.inventory.push({
                id: item.id,
                name: item.name,
                type: item.type,
                description: item.description,
                quantity: 1
            });
            console.log(`${item.name} zum Inventar hinzugefügt`);
        }
        
        this.save();
    },

    // Item aus Inventar entfernen
    removeItemFromInventory(itemId, quantity = 1) {
        console.log('removeItemFromInventory aufgerufen:', itemId, 'Anzahl:', quantity);
        
        const itemIndex = this.state.player.inventory.findIndex(i => i.id === itemId);
        
        if (itemIndex !== -1) {
            const item = this.state.player.inventory[itemIndex];
            item.quantity -= quantity;
            
            console.log(`${item.name} Anzahl reduziert auf ${item.quantity}`);
            
            // Wenn Anzahl 0 oder weniger, aus Inventar entfernen
            if (item.quantity <= 0) {
                this.state.player.inventory.splice(itemIndex, 1);
                console.log(`${item.name} aus Inventar entfernt`);
            }
            
            this.save();
            return true;
        }
        
        console.log('Item nicht im Inventar gefunden');
        return false;
    },

    // ===== SHOP-SYSTEM =====

    // Item kaufen
    buyItem(merchantId, offerIndex, quantity = 1) {
        const merchant = this.merchants[merchantId];
        if (!merchant || !merchant.offers[offerIndex]) return false;

        const offer = merchant.offers[offerIndex];
        const item = this.items[offer.itemId];
        const totalCost = offer.price * quantity;

        // Glitzer zählen
        const glitzerCount = this.state.player.inventory.filter(i => i.id === 'glitzer').reduce((sum, i) => sum + (i.quantity || 1), 0);

        if (glitzerCount < totalCost) {
            console.log('Nicht genug Glitzer!');
            return false;
        }

        // Glitzer abziehen
        this.removeItemFromInventory('glitzer', totalCost);

        // Items hinzufügen
        for (let i = 0; i < quantity; i++) {
            this.addItemToInventory(item);
        }

        console.log(`${quantity}x ${item.name} für ${totalCost} Glitzer gekauft`);
        return true;
    },

    // Item nutzen (z.B. Heiltrank)
    useItem(itemId) {
        const itemInInventory = this.state.player.inventory.find(i => i.id === itemId);
        if (!itemInInventory) return false;

        const item = this.items[itemId];
        
        // Heiltrank
        if (item.type === 'consumable' && item.healAmount) {
            const healAmount = item.healAmount;
            const oldHp = this.state.player.hp;
            this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + healAmount);
            const actualHeal = this.state.player.hp - oldHp;
            
            // Item aus Inventar entfernen
            this.removeItemFromInventory(itemId, 1);
            this.save();
            
            console.log(`${item.name} genutzt! +${actualHeal} HP`);
            return actualHeal;
        }

        return false;
    },

    // ===== CRAWL-SYSTEM (Boss-Welt-Erkundung) =====

    // Boss-Welt-Crawl starten
    startCrawl(bossWorldId) {
        const bossWorld = this.bossWorlds[bossWorldId];
        if (!bossWorld) {
            console.error('Boss-Welt nicht gefunden:', bossWorldId);
            return;
        }

        const boss = this.bosses[bossWorld.boss];
        if (!boss) {
            console.error('Boss nicht gefunden:', bossWorld.boss);
            return;
        }

        // Crawl-Zustand initialisieren
        this.state.currentCrawl = {
            bossWorldId: bossWorldId,
            bossId: bossWorld.boss,
            security: 100,  // Startet bei 100% Sicherheit
            availableEvents: this.generateRandomEvents(),
            eventHistory: []
        };

        this.save();
        UI.showCrawlEventSelection();
    },

    // 3 zufällige Events generieren
    generateRandomEvents() {
        const allEvents = Object.values(this.crawlEvents);
        const shuffled = [...allEvents].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);
        return selected;
    },

    // Event-Auswahl anzeigen (Debug-Version)
    showEventSelection() {
        if (!this.state.currentCrawl) return;
        const crawl = this.state.currentCrawl;
        console.log('Sicherheit:', crawl.security + '%');
    },

    // Event auswählen
    selectEvent(eventIndex) {
        if (!this.state.currentCrawl) return;

        const crawl = this.state.currentCrawl;
        const event = crawl.availableEvents[eventIndex];

        if (!event) return;
        
        this.processEvent(event);
    },

    // Event verarbeiten
    processEvent(event) {
        const crawl = this.state.currentCrawl;
        
        // Sicherheit verringern
        crawl.security = Math.max(0, crawl.security - event.securityDecrease);

        // Event zur Historie hinzufügen
        crawl.eventHistory.push({
            event: event.name,
            securityAfter: crawl.security
        });

        this.save();

        // Boss-Spawn prüfen
        setTimeout(() => {
            this.checkBossSpawn();
        }, 1000);
    },

    // Prüfen ob Boss erscheint
    checkBossSpawn() {
        const crawl = this.state.currentCrawl;
        
        // Spawn-Wahrscheinlichkeit berechnen (basierend auf fehlender Sicherheit)
        const spawnChance = 100 - crawl.security; // 0% Sicherheit = 100% Spawn-Chance
        const roll = Math.random() * 100;

        console.log('Sicherheit:', crawl.security + '%');

        if (roll < spawnChance) {
            // Boss erscheint!
            this.spawnBoss();
        } else {
            // Boss erscheint nicht, nächste Event-Runde
            // Neue Events generieren
            crawl.availableEvents = this.generateRandomEvents();
            this.save();
            
            setTimeout(() => {
                // Prüfen ob Crawl noch aktiv ist
                if (this.state.currentCrawl) {
                    this.showEventSelection();
                    UI.showCrawlEventSelection();
                }
            }, 500);
        }
    },

    // Boss spawnen und Kampf starten
    spawnBoss() {
        const crawl = this.state.currentCrawl;
        const boss = this.bosses[crawl.bossId];

        // Crawl beenden und Kampf starten
        this.state.currentCrawl = null;
        this.save();
        
        this.startBattle(boss);
    }
};

// Game beim Laden der Seite starten
window.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
