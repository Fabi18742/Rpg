// Game State & Logic

const Game = {
    // Referenzen zu zentralen Definitionen
    items: Definitions.items,
    weaponBases: Definitions.weaponBases,
    effects: Definitions.effects,
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
            // Alle verfügbaren Waffen
            weapons: [],
            // 4 ausgewählte Waffen für Kampf
            equippedWeapons: [null, null, null, null],
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
        
        // Spielstand laden falls vorhanden
        const savedState = Storage.loadGameState();
        if (savedState) {
            this.state = savedState;
            
            // Alte equippedWeapons bereinigen (alte IDs zu null konvertieren)
            if (this.state.player.equippedWeapons) {
                this.state.player.equippedWeapons = this.state.player.equippedWeapons.map(val => {
                    // Wenn es eine Zahl ist, behalten
                    if (typeof val === 'number') return val;
                    // Alles andere (IDs, undefined, etc.) zu null
                    return null;
                });
            }
            
            console.log('Spielstand geladen');
        } else {
            console.log('Neues Spiel gestartet');
            // Start-Waffe aus Definitions hinzufügen
            const startWeaponBaseId = Definitions.player.startWeapon;
            if (startWeaponBaseId) {
                this.addWeapon({ baseId: startWeaponBaseId, effects: [] });
                // Automatisch ausrüsten
                this.equipWeapon(0, 0);
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

    // Waffeninstanz hinzufügen
    // weaponInstance = { baseId: 'sword', effects: ['testdamage'] }
    addWeapon(weaponInstance) {
        if (!weaponInstance.baseId) {
            console.error('Waffe muss baseId haben');
            return false;
        }
        
        const weaponBase = this.weaponBases[weaponInstance.baseId];
        if (!weaponBase) {
            console.error('Waffenbasis nicht gefunden:', weaponInstance.baseId);
            return false;
        }
        
        // Waffeninstanz mit baseId und effects Array
        const instance = {
            baseId: weaponInstance.baseId,
            effects: weaponInstance.effects || []
        };
        
        this.state.player.weapons.push(instance);
        this.save();
        console.log('Waffe erhalten:', weaponBase.name, 'mit', instance.effects.length, 'Effekt(en)');
        return true;
    },

    // Waffeninstanz zu vollständiger Waffe auflösen
    resolveWeapon(weaponInstance) {
        if (!weaponInstance) return null;
        
        const base = this.weaponBases[weaponInstance.baseId];
        if (!base) return null;
        
        // Glitzer-Wert berechnen (Basis * Multiplikatoren aller Effekte)
        let glitzerValue = base.baseGlitzerValue;
        weaponInstance.effects.forEach(effectId => {
            const effect = this.effects[effectId];
            if (effect && effect.glitzerValueMultiplier) {
                glitzerValue = Math.floor(glitzerValue * effect.glitzerValueMultiplier);
            }
        });
        
        return {
            ...base,
            effects: weaponInstance.effects,
            glitzerValue: glitzerValue
        };
    },

    // Effekte auf Schaden anwenden
    // Gibt { damage, logs } zurück
    applyEffects(baseDamage, effectIds, attacker, target, battle) {
        let damage = baseDamage;
        let logs = [];
        
        if (!effectIds || effectIds.length === 0) {
            return { damage, logs };
        }
        
        effectIds.forEach(effectId => {
            const effect = this.effects[effectId];
            if (!effect) return;
            
            // Verschiedene Effekt-Typen
            switch (effect.type) {
                case 'damage':
                    damage += effect.value;
                    logs.push(`+${effect.value} (${effect.name})`);
                    break;
                // Weitere Effekt-Typen können hier hinzugefügt werden
                // case 'heal': ...
                // case 'defense': ...
            }
        });
        
        return { damage, logs };
    },

    // Waffe ausrüsten (slot 0-3) - verwendet Array-Index statt weapon.id
    equipWeapon(weaponIndex, slot) {
        if (slot < 0 || slot > 3) return false;
        if (weaponIndex < 0 || weaponIndex >= this.state.player.weapons.length) return false;
        
        // Prüfe ob diese Waffen-Instanz bereits ausgewählt ist
        if (this.state.player.equippedWeapons.includes(weaponIndex)) {
            console.log('Diese Waffe ist bereits ausgewählt!');
            return false;
        }
        
        const weapon = this.state.player.weapons[weaponIndex];
        if (weapon) {
            this.state.player.equippedWeapons[slot] = weaponIndex;
            this.save();
            console.log(`${weapon.name} in Slot ${slot + 1} ausgewählt`);
            return true;
        }
        return false;
    },

    // Waffe aus Slot entfernen
    unequipWeapon(slot) {
        if (slot >= 0 && slot <= 3) {
            this.state.player.equippedWeapons[slot] = null;
            this.save();
            return true;
        }
        return false;
    },

    // Ausgewählte Waffen für Kampf holen (aufgelöst)
    getEquippedWeapons() {
        return this.state.player.equippedWeapons
            .map(index => {
                if (typeof index === 'number') {
                    const instance = this.state.player.weapons[index];
                    return this.resolveWeapon(instance);
                }
                return null;
            })
            .filter(w => w !== null);
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
    playerAttack(weaponIndex) {
        console.log('playerAttack aufgerufen', weaponIndex, 'Turn:', this.state.currentBattle?.turn);
        
        if (!this.state.currentBattle || this.state.currentBattle.turn !== 'player') {
            console.log('Abbruch: Kein Battle oder nicht am Zug');
            return;
        }

        const weaponInstance = this.state.player.weapons[weaponIndex];
        if (!weaponInstance) {
            console.log('Abbruch: Waffe nicht gefunden');
            return;
        }
        
        const weapon = this.resolveWeapon(weaponInstance);
        if (!weapon) {
            console.log('Abbruch: Waffe konnte nicht aufgelöst werden');
            return;
        }

        const battle = this.state.currentBattle;
        
        // Prüfe ob genug Aktionspunkte vorhanden sind
        if (battle.playerActionPoints < weapon.actionCost) {
            console.log('Nicht genug Aktionspunkte!');
            return;
        }
        
        // Aktionspunkte abziehen
        battle.playerActionPoints -= weapon.actionCost;
        
        const boss = battle.boss;
        
        console.log('Boss HP vor Angriff:', boss.hp);
        
        // Schaden berechnen: Basis-Schaden + Stärke - Gegner-Verteidigung
        const baseDamage = weapon.damage;
        const playerStrength = this.state.player.stats.strength;
        const bossDefense = boss.stats.defense;
        let damage = baseDamage + playerStrength - bossDefense;
        
        // Damage-Teile für Log sammeln
        let damageLog = [`${baseDamage} Basis`];
        if (playerStrength > 0) damageLog.push(`${playerStrength} Stärke`);
        if (bossDefense > 0) damageLog.push(`-${bossDefense} Vert.`);
        
        console.log(`[SCHADEN] ${weapon.name}: Basis=${baseDamage} + Stärke=${playerStrength} - Verteidigung=${bossDefense} = ${damage}`);
        
        // Effekte anwenden
        if (weapon.effects && weapon.effects.length > 0) {
            const effectResult = this.applyEffects(damage, weapon.effects, this.state.player, boss, battle);
            damage = effectResult.damage;
            damageLog.push(...effectResult.logs);
            console.log(`[EFFEKTE] Angewendet: ${effectResult.logs.join(', ')}`);
        }
        
        if (damage < 0) {
            console.log(`[SCHADEN] Schaden unter 0, setze auf 0`);
            damage = 0;
        }

        boss.hp -= damage;
        battle.log.push(`${weapon.name} = ${damage} (${damageLog.join(' + ')})`);
        
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

        // Boss-Waffe auflösen (Instanz zu vollständiger Waffe)
        const bossWeaponInstance = boss.weapon;
        const bossWeapon = this.resolveWeapon(bossWeaponInstance);
        const attackDamage = bossWeapon ? bossWeapon.damage : 0;
        const attackName = bossWeapon ? bossWeapon.name : 'Angriff';
        const actionCost = bossWeapon ? bossWeapon.actionCost : 1;

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
            
            // Damage-Teile für Log sammeln
            let damageLog = [`${bossBaseDamage} Basis`];
            if (bossStrength > 0) damageLog.push(`${bossStrength} Stärke`);
            if (playerDefense > 0) damageLog.push(`-${playerDefense} Vert.`);
            if (blockBonus > 0) damageLog.push(`-${blockBonus} Block`);
            
            console.log(`[SCHADEN] ${attackName}: Basis=${bossBaseDamage} + Stärke=${bossStrength} - Verteidigung=${playerDefense} - Block=${blockBonus} = ${damage}`);
            
            // Effekte anwenden
            if (bossWeapon && bossWeapon.effects && bossWeapon.effects.length > 0) {
                const effectResult = this.applyEffects(damage, bossWeapon.effects, boss, this.state.player, battle);
                damage = effectResult.damage;
                damageLog.push(...effectResult.logs);
                console.log(`[GEGNER-EFFEKTE] Angewendet: ${effectResult.logs.join(', ')}`);
            }
            
            if (damage < 0) {
                console.log(`[SCHADEN] Schaden unter 0, setze auf 0`);
                damage = 0;
            }

            this.state.player.hp -= damage;
            if (this.state.player.hp < 0) this.state.player.hp = 0;

            battle.log.push(`Boss: ${attackName} = ${damage} (${damageLog.join(' + ')})`);

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

    // Waffe verkaufen
    sellWeapon(weaponIndex) {
        if (weaponIndex < 0 || weaponIndex >= this.state.player.weapons.length) {
            console.log('Ungültiger Waffen-Index');
            return false;
        }

        const weaponInstance = this.state.player.weapons[weaponIndex];
        const weapon = this.resolveWeapon(weaponInstance);
        if (!weapon) {
            console.log('Waffe konnte nicht aufgelöst werden');
            return false;
        }
        
        const glitzerValue = weapon.glitzerValue || 0;

        // Prüfe ob Waffe ausgerüstet ist
        const equippedSlot = this.state.player.equippedWeapons.indexOf(weaponIndex);
        if (equippedSlot !== -1) {
            console.log('Waffe ist ausgerüstet und kann nicht verkauft werden!');
            return false;
        }

        // Waffe aus Array entfernen
        this.state.player.weapons.splice(weaponIndex, 1);

        // Alle equippedWeapons Indices anpassen (die größer als weaponIndex sind)
        for (let i = 0; i < this.state.player.equippedWeapons.length; i++) {
            const idx = this.state.player.equippedWeapons[i];
            if (typeof idx === 'number' && idx > weaponIndex) {
                this.state.player.equippedWeapons[i] = idx - 1;
            }
        }

        // Glitzer hinzufügen
        if (glitzerValue > 0) {
            const glitzerItem = this.items.glitzer;
            for (let i = 0; i < glitzerValue; i++) {
                this.addItemToInventory(glitzerItem);
            }
        }

        this.save();
        console.log(`${weapon.name} für ${glitzerValue} Glitzer verkauft`);
        return true;
    },

    // Item verkaufen
    sellItem(itemId) {
        const itemInInventory = this.state.player.inventory.find(i => i.id === itemId);
        if (!itemInInventory) {
            console.log('Item nicht im Inventar gefunden');
            return false;
        }

        const itemDef = this.items[itemId];
        const glitzerValue = itemDef.glitzerValue || 0;

        if (glitzerValue === 0) {
            console.log('Item kann nicht verkauft werden (kein Glitzer-Wert)');
            return false;
        }

        // 1 Item entfernen
        this.removeItemFromInventory(itemId, 1);

        // Glitzer hinzufügen
        const glitzerItem = this.items.glitzer;
        for (let i = 0; i < glitzerValue; i++) {
            this.addItemToInventory(glitzerItem);
        }

        this.save();
        console.log(`${itemDef.name} für ${glitzerValue} Glitzer verkauft`);
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
            chaosLevel: 0,  // Startet bei 0 Chaos
            availableEvents: [],  // Wird gleich gefüllt
            eventHistory: []
        };

        // Events generieren (nachdem currentCrawl existiert)
        this.state.currentCrawl.availableEvents = this.generateRandomEvents();

        this.save();
        UI.showCrawlEventSelection();
    },

    // 3 zufällige Events generieren
    generateRandomEvents() {
        const crawl = this.state.currentCrawl;
        if (!crawl) return [];

        // Schwierigkeit basierend auf Chaoslevel bestimmen
        let difficulty;
        if (crawl.chaosLevel < 5) {
            difficulty = 1;
        } else if (crawl.chaosLevel < 10) {
            difficulty = 2;
        } else {
            difficulty = 3;
        }

        // Nur Events mit passender Schwierigkeit wählen
        const allEvents = Object.values(this.crawlEvents);
        const filteredEvents = allEvents.filter(event => event.difficulty === difficulty);
        
        // Falls keine Events vorhanden, alle nehmen (Fallback)
        const eventsToChooseFrom = filteredEvents.length > 0 ? filteredEvents : allEvents;
        
        const shuffled = [...eventsToChooseFrom].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);
        return selected;
    },

    // Event-Auswahl anzeigen (Debug-Version)
    showEventSelection() {
        if (!this.state.currentCrawl) return;
        const crawl = this.state.currentCrawl;
        console.log('Sicherheit:', crawl.security + '%', '| Chaoslevel:', crawl.chaosLevel);
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

        // Chaoslevel erhöhen
        crawl.chaosLevel += 1;

        // Event zur Historie hinzufügen
        crawl.eventHistory.push({
            event: event.name,
            securityAfter: crawl.security,
            chaosLevelAfter: crawl.chaosLevel
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
    },

    // ===== RITUAL-SYSTEM =====
    
    // Ritual durchführen
    performRitual() {
        const ritual = this.state.currentRitual;
        if (!ritual || ritual.selectedItems.length !== 6) {
            console.log('Ritual benötigt exakt 6 Items');
            return false;
        }
        
        // Items aus Inventar entfernen
        const itemDetails = ritual.selectedItems.map(itemId => {
            const itemDef = this.items[itemId];
            this.removeItemFromInventory(itemId, 1);
            return itemDef;
        });
        
        // 1. Power-Score berechnen
        const powerScore = itemDetails.reduce((sum, item) => sum + item.value, 0);
        console.log(`[RITUAL] Power-Score: ${powerScore}`);
        
        // 2. Tier bestimmen
        let tier;
        if (powerScore >= 6 && powerScore <= 25) {
            tier = 1;
        } else if (powerScore >= 26 && powerScore <= 45) {
            tier = 2;
        } else if (powerScore >= 46 && powerScore <= 60) {
            tier = 3;
        } else {
            tier = 1; // Fallback
        }
        console.log(`[RITUAL] Tier: ${tier}`);
        
        // 3. Modifier-Wahrscheinlichkeit berechnen
        const modifierCounts = {};
        itemDetails.forEach(item => {
            const type = item.modifierType;
            modifierCounts[type] = (modifierCounts[type] || 0) + 1;
        });
        
        console.log('[RITUAL] Modifier-Counts:', modifierCounts);
        
        // 4. Waffe aus Pool wählen (basierend auf ritualValue)
        const weaponPool = Object.values(this.weaponBases).filter(weapon => {
            if (!weapon.ritualValue) return false;
            
            if (tier === 1) return weapon.ritualValue >= 6 && weapon.ritualValue <= 25;
            if (tier === 2) return weapon.ritualValue >= 26 && weapon.ritualValue <= 45;
            if (tier === 3) return weapon.ritualValue >= 46 && weapon.ritualValue <= 60;
            return false;
        });
        
        if (weaponPool.length === 0) {
            console.log('[RITUAL] Kein Waffenpool für Tier', tier);
            return false;
        }
        
        // Waffe mit nächstem ritualValue zum powerScore wählen
        weaponPool.sort((a, b) => {
            const distA = Math.abs(a.ritualValue - powerScore);
            const distB = Math.abs(b.ritualValue - powerScore);
            return distA - distB;
        });
        
        const selectedWeapon = weaponPool[0];
        console.log(`[RITUAL] Gewählte Waffe: ${selectedWeapon.name} (ritualValue: ${selectedWeapon.ritualValue})`);
        
        // 5. Effekt würfeln basierend auf Modifier-Wahrscheinlichkeit
        const effects = [];
        
        // Für jeden Modifier-Typ würfeln
        for (const [modifierType, count] of Object.entries(modifierCounts)) {
            if (modifierType === 'none') continue; // None gibt keine Effekte
            
            const probability = count / 6;
            const roll = Math.random();
            
            console.log(`[RITUAL] ${modifierType}: ${count}/6 = ${(probability * 100).toFixed(1)}% Chance, Roll: ${(roll * 100).toFixed(1)}%`);
            
            if (roll < probability) {
                // Effekt wird angewendet
                if (this.effects[modifierType]) {
                    effects.push(modifierType);
                    console.log(`[RITUAL] ✓ Effekt ${modifierType} angewendet!`);
                } else {
                    console.log(`[RITUAL] ✗ Effekt ${modifierType} nicht gefunden`);
                }
            } else {
                console.log(`[RITUAL] ✗ Effekt ${modifierType} nicht gewürfelt`);
            }
        }
        
        // 6. Waffe hinzufügen
        const weaponInstance = {
            baseId: selectedWeapon.id,
            effects: effects
        };
        
        this.addWeapon(weaponInstance);
        
        // 7. Ritual abschließen
        this.state.currentRitual = null;
        this.save();
        
        console.log(`[RITUAL] Ritual abgeschlossen! Waffe: ${selectedWeapon.name}, Effekte: ${effects.length}`);
        
        // UI zurück zum Hideout mit Erfolgsmeldung
        UI.showHideout();
        
        return true;
    }
};

// Game beim Laden der Seite starten
window.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
