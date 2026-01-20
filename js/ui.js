// UI Management und DOM Manipulation

const UI = {
    elements: {
        visualArea: null,
        actionArea: null,
        sceneContent: null,
        buttonGrid: null
    },
    statsVisible: false,

    // UI initialisieren
    init() {
        this.elements.visualArea = document.querySelector('.visual-area');
        this.elements.actionArea = document.querySelector('.action-area');
        this.elements.sceneContent = document.querySelector('.scene-content');
        this.elements.buttonGrid = document.querySelector('.button-grid');

        this.setupEventListeners();
    },

    // Event Listeners für Buttons
    setupEventListeners() {
        // Wird in den spezifischen Screen-Methoden gesetzt
    },

    // Hideout Screen anzeigen
    showHideout() {
        // SVG Bild anzeigen
        this.elements.sceneContent.innerHTML = `
            <img src="assets/svg/example-hideout.svg" alt="Hideout Scene">
        `;
        
        // Stats Panel dynamisch hinzufügen (nicht in sceneContent)
        const existingPanel = this.elements.visualArea.querySelector('.stats-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        this.elements.visualArea.insertAdjacentHTML('beforeend', this.renderStatsPanel());

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-stats">Stats</button>
            <button class="game-button" id="btn-abilities">Fähigkeiten</button>
            <button class="game-button" id="btn-inventory">Inventar</button>
            <button class="game-button" id="btn-shop">Shop</button>
            <button class="game-button" id="btn-boss">Boss-Kämpfe</button>
            <button class="game-button" id="btn-explore">Tiererkundung</button>
        `;

        // Event Listeners neu setzen
        this.setupHideoutListeners();
    },

    // Hideout-spezifische Event Listeners
    setupHideoutListeners() {
        document.getElementById('btn-stats').addEventListener('click', () => {
            this.toggleStatsPanel();
        });

        document.getElementById('btn-abilities').addEventListener('click', () => {
            this.showAbilityManagement();
        });

        document.getElementById('btn-inventory').addEventListener('click', () => {
            this.showInventory();
        });

        document.getElementById('btn-shop').addEventListener('click', () => {
            Game.showScreen('shop');
        });

        document.getElementById('btn-boss').addEventListener('click', () => {
            Game.showScreen('boss');
        });

        document.getElementById('btn-explore').addEventListener('click', () => {
            Game.showScreen('explore');
        });
    },

    // Stats Panel rendern
    renderStatsPanel() {
        const player = Game.state.player;
        const visible = this.statsVisible ? 'visible' : '';
        
        return `
            <div class="stats-panel ${visible}" id="stats-panel">
                <div class="stats-header">Charakterwerte</div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Level:</span>
                        <span class="stat-value">${player.level}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">HP:</span>
                        <span class="stat-value">${player.hp}/${player.maxHp}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Stärke:</span>
                        <span class="stat-value">${player.stats.strength}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Verteidigung:</span>
                        <span class="stat-value">${player.stats.defense}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Magie:</span>
                        <span class="stat-value">${player.stats.magic}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Geschwindigkeit:</span>
                        <span class="stat-value">${player.stats.speed}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Vitalität:</span>
                        <span class="stat-value">${player.stats.vitality}</span>
                    </div>
                </div>
            </div>
        `;
    },

    // Stats Panel ein/ausblenden
    toggleStatsPanel() {
        this.statsVisible = !this.statsVisible;
        const panel = document.getElementById('stats-panel');
        if (panel) {
            panel.classList.toggle('visible');
        }
    },

    // Fähigkeiten-Management anzeigen
    showAbilityManagement() {
        // Stats Panel schließen falls offen
        this.statsVisible = false;
        const existingPanel = this.elements.visualArea.querySelector('.stats-panel');
        if (existingPanel) {
            existingPanel.classList.remove('visible');
        }
        
        const player = Game.state.player;
        
        // Nur nicht-ausgerüstete Fähigkeiten anzeigen
        const unequippedAbilities = player.abilities.filter(ability => 
            !player.equippedAbilities.includes(ability.id)
        );
        
        let abilitiesHTML = unequippedAbilities.map(ability => {
            return `
                <div class="ability-item" data-ability-id="${ability.id}">
                    <div class="ability-name">${ability.name}</div>
                    <div class="ability-damage">Schaden: ${ability.damage} | Kosten: ${ability.actionCost} AP</div>
                    <div class="ability-desc">${ability.description}</div>
                </div>
            `;
        }).join('');
        
        if (unequippedAbilities.length === 0) {
            abilitiesHTML = '<div class="no-abilities">Alle Fähigkeiten sind ausgerüstet</div>';
        }

        let slotsHTML = '';
        for (let i = 0; i < 4; i++) {
            const abilityId = player.equippedAbilities[i];
            const ability = abilityId ? player.abilities.find(a => a.id === abilityId) : null;
            
            slotsHTML += `
                <div class="ability-slot ${ability ? 'filled' : 'empty'}" data-slot="${i}">
                    <div class="slot-number">Slot ${i + 1}</div>
                    ${ability ? `
                        <div class="slot-ability">
                            <div>${ability.name}</div>
                            <div class="slot-cost">${ability.actionCost} AP</div>
                        </div>
                    ` : '<div class="slot-empty">Leer</div>'}
                </div>
            `;
        }

        this.elements.sceneContent.innerHTML = `
            <div class="ability-management">
                <div class="ability-slots-section">
                    <h3>Ausgerüstete Fähigkeiten</h3>
                    <div class="ability-slots">
                        ${slotsHTML}
                    </div>
                </div>
                <div class="ability-list-section">
                    <h3>Verfügbare Fähigkeiten</h3>
                    <div class="ability-list">
                        ${abilitiesHTML}
                    </div>
                </div>
            </div>
        `;

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
        `;

        // Event Listeners
        document.getElementById('btn-back').addEventListener('click', () => {
            Game.showScreen('hideout');
        });

        // Ability Click to Equip
        document.querySelectorAll('.ability-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const abilityId = item.dataset.abilityId;
                const player = Game.state.player;
                
                // Finde ersten freien Slot
                const freeSlot = player.equippedAbilities.indexOf(null);
                if (freeSlot !== -1) {
                    Game.equipAbility(abilityId, freeSlot);
                    this.showAbilityManagement(); // Refresh
                } else {
                    alert('Alle Slots sind belegt! Klicke auf einen Slot um die Fähigkeit zu entfernen.');
                }
            });
        });

        // Click auf gefüllten Slot = Unequip
        document.querySelectorAll('.ability-slot.filled').forEach(slot => {
            slot.addEventListener('click', (e) => {
                const slotIndex = parseInt(slot.dataset.slot);
                Game.unequipAbility(slotIndex);
                this.showAbilityManagement(); // Refresh
            });
        });
    },

    // Inventar anzeigen
    showInventory() {
        // Stats Panel schließen falls offen
        this.statsVisible = false;
        const existingPanel = this.elements.visualArea.querySelector('.stats-panel');
        if (existingPanel) {
            existingPanel.classList.remove('visible');
        }
        
        const inventory = Game.state.player.inventory;
        
        let inventoryHTML = '';
        if (inventory.length === 0) {
            inventoryHTML = '<div class="no-items">Dein Inventar ist leer</div>';
        } else {
            inventoryHTML = inventory.map(item => `
                <div class="inventory-item">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">x${item.quantity}</div>
                    <div class="item-desc">${item.description}</div>
                </div>
            `).join('');
        }

        this.elements.sceneContent.innerHTML = `
            <div class="inventory-screen">
                <h2>Inventar</h2>
                <div class="inventory-list">
                    ${inventoryHTML}
                </div>
            </div>
        `;

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
        `;

        document.getElementById('btn-back').addEventListener('click', () => {
            Game.showScreen('hideout');
        });
    },

    // Shop Screen anzeigen
    showShop() {
        // Stats Panel schließen
        this.statsVisible = false;
        const existingPanel = this.elements.visualArea.querySelector('.stats-panel');
        if (existingPanel) {
            existingPanel.classList.remove('visible');
        }
        
        this.elements.sceneContent.innerHTML = `
            <p class="placeholder-text">PLATZHALTER: Shop Bild</p>
        `;

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
        `;

        document.getElementById('btn-back').addEventListener('click', () => {
            Game.showScreen('hideout');
        });
    },

    // Boss-Welten Screen anzeigen
    showBossSelection() {
        // Stats Panel schließen
        this.statsVisible = false;
        const existingPanel = this.elements.visualArea.querySelector('.stats-panel');
        if (existingPanel) {
            existingPanel.classList.remove('visible');
        }
        
        const bossWorlds = Game.bossWorlds;
        
        this.elements.sceneContent.innerHTML = `
            <div class="boss-selection">
                <h2>Wähle eine Welt</h2>
                <div class="world-selection">
                    ${Object.values(bossWorlds).map(world => {
                        const boss = Game.bosses[world.boss];
                        return `
                            <div class="world-card boss-world-card" data-world-id="${world.id}">
                                <div class="world-name">${world.name}</div>
                                <div class="world-desc">${world.description}</div>
                                <div class="boss-info-preview">
                                    <span>Boss: ${boss.name}</span>
                                    <span class="boss-hp-preview">HP: ${boss.hp}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
        `;

        document.getElementById('btn-back').addEventListener('click', () => {
            Game.showScreen('hideout');
        });

        // Event Listeners für Boss-Welten
        document.querySelectorAll('.boss-world-card').forEach(card => {
            card.addEventListener('click', () => {
                const worldId = card.dataset.worldId;
                Game.startCrawl(worldId);
            });
        });
    },

    // Crawl Event-Auswahl anzeigen
    showCrawlEventSelection() {
        const crawl = Game.state.currentCrawl;
        if (!crawl) return;

        const bossWorld = Game.bossWorlds[crawl.bossWorldId];

        // Sicherheit nur in Console ausgeben
        console.log('Sicherheit:', crawl.security + '%');

        this.elements.sceneContent.innerHTML = `
            <div class="crawl-container">
                <div class="crawl-header">
                    <h2>${bossWorld.name}</h2>
                </div>
                <div class="event-selection">
                    <h3>Wähle ein Ereignis:</h3>
                    <div class="event-cards">
                        ${crawl.availableEvents.map((event, index) => `
                            <div class="event-card" data-event-index="${index}">
                                <div class="event-header">
                                    <span class="event-name">${event.name}</span>
                                </div>
                                <div class="event-description">${event.description}</div>
                                <div class="event-footer">
                                    <span class="security-impact">Sicherheit: -${event.securityDecrease}%</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.elements.buttonGrid.innerHTML = '';

        // Event Listeners für Event-Karten
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', () => {
                const eventIndex = parseInt(card.dataset.eventIndex);
                card.classList.add('selected');
                // Alle anderen Karten deaktivieren
                document.querySelectorAll('.event-card').forEach(c => {
                    if (c !== card) c.style.opacity = '0.5';
                });
                // Event nach kurzer Verzögerung auswählen
                setTimeout(() => {
                    Game.selectEvent(eventIndex);
                }, 300);
            });
        });
    },

    // Kampf-Screen anzeigen
    showBattleScreen() {
        this.updateBattleScreen();
    },

    // Kampf-Screen aktualisieren
    updateBattleScreen() {
        const battle = Game.state.currentBattle;
        if (!battle) return;

        const boss = battle.boss;
        const player = Game.state.player;
        const equippedAbilities = Game.getEquippedAbilities();

        // Letzte 3 Log-Einträge
        const recentLogs = battle.log.slice(-3);

        this.elements.sceneContent.innerHTML = `
            <div class="battle-screen">
                <div class="battle-enemy">
                    <div class="enemy-sprite red-square">
                        <div class="enemy-hp">${boss.hp}</div>
                    </div>
                    <div class="enemy-name">${boss.name}</div>
                </div>
                <div class="battle-log">
                    ${recentLogs.map(log => `<div class="log-entry">${log}</div>`).join('')}
                </div>
                <div class="player-hp-display">
                    <span>Deine HP: ${player.hp}/${player.maxHp}</span>
                    <span class="action-points-display">AP: ${battle.playerActionPoints}/${player.maxActionPoints}</span>
                </div>
            </div>
        `;

        // Kampf vorbei?
        if (boss.hp <= 0 || player.hp <= 0) {
            this.elements.buttonGrid.innerHTML = ``;
            return;
        }

        // Fähigkeiten-Buttons (nur im Spieler-Zug)
        if (battle.turn === 'player') {
            const abilityButtons = equippedAbilities.map(ability => {
                const canUse = battle.playerActionPoints >= ability.actionCost;
                const disabledClass = canUse ? '' : 'disabled';
                return `
                    <button class="game-button ability-btn ${disabledClass}" data-ability-id="${ability.id}" ${canUse ? '' : 'disabled'}>
                        ${ability.name}<br>
                        <small>Schaden: ${ability.damage} | Kosten: ${ability.actionCost} AP</small>
                    </button>
                `;
            }).join('');
            
            // Block-Button (nur wenn mindestens 1 AP vorhanden)
            const canBlock = battle.playerActionPoints >= 1;
            const blockButtonClass = canBlock ? '' : 'disabled';
            const blockValue = battle.playerActionPoints * 2; // Nur AP-Bonus (Defense wird separat abgezogen)
            const blockButton = `
                <button class="game-button block-btn ${blockButtonClass}" id="btn-block" ${canBlock ? '' : 'disabled'}>
                    Blocken<br>
                    <small>+${blockValue} Verteidigung | Alle AP</small>
                </button>
            `;
            
            this.elements.buttonGrid.innerHTML = `
                <button class="game-button" id="btn-battle-stats">Stats</button>
                ${abilityButtons}
                ${blockButton}
            `;

            // Event Listener für Stats-Button
            document.getElementById('btn-battle-stats').addEventListener('click', () => {
                this.toggleStatsPanel();
            });

            // Event Listener für Block-Button
            document.getElementById('btn-block').addEventListener('click', () => {
                document.getElementById('btn-block').disabled = true;
                Game.playerBlock();
            });

            // Event Listeners für Fähigkeiten
            document.querySelectorAll('.ability-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const abilityId = btn.dataset.abilityId;
                    // Button sofort deaktivieren um Mehrfach-Klicks zu verhindern
                    btn.disabled = true;
                    Game.playerAttack(abilityId);
                });
            });
        } else {
            this.elements.buttonGrid.innerHTML = `
                <div class="waiting-message">Gegner ist am Zug...</div>
            `;
        }
    },

    // Explore Screen anzeigen
    showExplore() {
        // Stats Panel schließen
        this.statsVisible = false;
        const existingPanel = this.elements.visualArea.querySelector('.stats-panel');
        if (existingPanel) {
            existingPanel.classList.remove('visible');
        }
        
        this.elements.sceneContent.innerHTML = `
            <div class="explore-screen">
                <h2>Wähle eine Welt</h2>
                <div class="world-list">
                    <div class="world-card" id="select-test-world">
                        <div class="world-name">Testwelt</div>
                        <div class="world-desc">Eine mysteriöse Testwelt</div>
                    </div>
                </div>
            </div>
        `;

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
        `;

        document.getElementById('btn-back').addEventListener('click', () => {
            Game.showScreen('hideout');
        });

        document.getElementById('select-test-world').addEventListener('click', () => {
            this.showTestWorld();
        });
    },

    // Testwelt anzeigen
    showTestWorld() {
        this.elements.sceneContent.innerHTML = `
            <div class="creature-encounter">
                <div class="creature-sprite">
                    <div style="width: 150px; height: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: 3px solid #5a67d8; border-radius: 8px;"></div>
                </div>
                <div class="creature-name">Testwesen</div>
                <div class="creature-hint">Biete dem Testwesen ein Item an...</div>
            </div>
        `;

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
            <button class="game-button" id="btn-inventory-offer">Inventar öffnen</button>
        `;

        document.getElementById('btn-back').addEventListener('click', () => {
            Game.showScreen('explore');
        });

        document.getElementById('btn-inventory-offer').addEventListener('click', () => {
            this.showInventoryForCreature('testwesen');
        });
    },

    // Inventar anzeigen um Item an Kreatur anzubieten
    showInventoryForCreature(creatureId) {
        const inventory = Game.state.player.inventory;
        
        let inventoryHTML = '';
        if (inventory.length === 0) {
            inventoryHTML = '<div class="no-items">Dein Inventar ist leer</div>';
        } else {
            inventoryHTML = inventory.map(item => `
                <div class="inventory-item clickable" data-item-id="${item.id}">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">x${item.quantity}</div>
                    <div class="item-desc">${item.description}</div>
                </div>
            `).join('');
        }

        this.elements.sceneContent.innerHTML = `
            <div class="inventory-screen">
                <h2>Wähle ein Item</h2>
                <div class="inventory-list">
                    ${inventoryHTML}
                </div>
            </div>
        `;

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
        `;

        document.getElementById('btn-back').addEventListener('click', () => {
            this.showTestWorld();
        });

        // Event Listeners für Item-Auswahl
        document.querySelectorAll('.inventory-item.clickable').forEach(item => {
            item.addEventListener('click', () => {
                const itemId = item.dataset.itemId;
                this.offerItemToCreature(itemId, creatureId);
            });
        });
    },

    // Item an Kreatur anbieten
    offerItemToCreature(itemId, creatureId = 'testwesen') {
        const item = Game.state.player.inventory.find(i => i.id === itemId);
        if (!item) return;

        // Hole Kreatur aus zentraler Definition
        const creature = Game.creatures[creatureId];
        if (!creature) return;

        // Prüfe ob Kreatur dieses Item akzeptiert
        if (creature.acceptsItems.includes(itemId)) {
            Game.removeItemFromInventory(itemId, 1);
            
            // Belohnung: Fähigkeit hinzufügen
            if (creature.rewardAbility) {
                const ability = Game.abilities[creature.rewardAbility];
                if (ability) {
                    const result = Game.addAbility(ability);
                    
                    // Zeige Nachricht basierend auf Ergebnis
                    if (result === 'duplicate') {
                        this.elements.sceneContent.innerHTML = `
                            <div class="creature-encounter">
                                <div class="creature-sprite">
                                    <div style="width: 150px; height: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: 3px solid #5a67d8; border-radius: 8px;"></div>
                                </div>
                                <div class="creature-name">${creature.name}</div>
                                <div class="creature-hint">Du hattest ${ability.name} bereits!<br>+${ability.glitzerValue} Glitzer erhalten!</div>
                            </div>
                        `;
                    }
                }
            }
            
            // Zurück zum Hideout
            setTimeout(() => {
                Game.showScreen('hideout');
            }, 800);
        } else {
            // Item nicht akzeptiert - nichts tun
        }
    }
};
