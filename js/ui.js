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
            <button class="game-button" id="btn-weapons">Ausrüstung</button>
            <button class="game-button" id="btn-inventory">Inventar</button>
            <button class="game-button" id="btn-shop">Shop</button>
            <button class="game-button" id="btn-ritual">Das Ritual</button>
            <button class="game-button" id="btn-boss">Boss-Kämpfe</button>
        `;

        // Event Listeners neu setzen
        this.setupHideoutListeners();
    },

    // Hideout-spezifische Event Listeners
    setupHideoutListeners() {
        document.getElementById('btn-stats').addEventListener('click', () => {
            this.toggleStatsPanel();
        });

        document.getElementById('btn-weapons').addEventListener('click', () => {
            this.showWeaponManagement();
        });

        document.getElementById('btn-inventory').addEventListener('click', () => {
            this.showInventory();
        });

        document.getElementById('btn-shop').addEventListener('click', () => {
            Game.showScreen('shop');
        });

        document.getElementById('btn-ritual').addEventListener('click', () => {
            this.showRitualSelection();
        });

        document.getElementById('btn-boss').addEventListener('click', () => {
            Game.showScreen('boss');
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

    // Waffen-Management anzeigen
    showWeaponManagement() {
        // Stats Panel schließen falls offen
        this.statsVisible = false;
        const existingPanel = this.elements.visualArea.querySelector('.stats-panel');
        if (existingPanel) {
            existingPanel.classList.remove('visible');
        }
        
        const player = Game.state.player;
        
        // ===== WAFFEN-SLOT =====
        const equippedWeaponIndex = player.equippedWeapon;
        const equippedWeaponInstance = typeof equippedWeaponIndex === 'number' ? player.weapons[equippedWeaponIndex] : null;
        const equippedWeapon = Game.resolveWeapon(equippedWeaponInstance);
        
        const hasWeaponEffects = equippedWeaponInstance && equippedWeaponInstance.effects && equippedWeaponInstance.effects.length > 0;
        
        let weaponSlotHTML = `
            <div class="equipment-slot weapon-slot-single ${equippedWeapon ? 'filled' : 'empty'}" id="weapon-slot">
                <div class="slot-label">Waffe</div>
                ${equippedWeapon ? `
                    <div class="slot-content">
                        <div class="${hasWeaponEffects ? 'weapon-with-effects' : ''}">${equippedWeapon.name}</div>
                        <div class="slot-stats">Schaden: ${equippedWeapon.damage}</div>
                    </div>
                ` : '<div class="slot-empty">Keine Waffe ausgerüstet</div>'}
            </div>
        `;
        
        // ===== FÄHIGKEITEN-SLOTS =====
        let abilitySlotsHTML = '';
        for (let i = 0; i < 4; i++) {
            const abilityIndex = player.equippedAbilities[i];
            const abilityId = typeof abilityIndex === 'number' ? player.abilities[abilityIndex] : null;
            const ability = abilityId ? Game.abilities[abilityId] : null;
            
            abilitySlotsHTML += `
                <div class="equipment-slot ability-slot ${ability ? 'filled' : 'empty'}" data-slot="${i}">
                    <div class="slot-number">Slot ${i + 1}</div>
                    ${ability ? `
                        <div class="slot-content">
                            <div class="ability-name">${ability.name}</div>
                            <div class="slot-stats">${ability.apCost} AP | ${ability.attacks}x ${Math.floor(ability.damageMultiplier * 100)}%${ability.hitChance < 1.0 ? ` | ${Math.floor(ability.hitChance * 100)}% Treffer` : ''}</div>
                        </div>
                    ` : '<div class="slot-empty">Leer</div>'}
                </div>
            `;
        }
        
        // ===== VERFÜGBARE WAFFEN =====
        const unequippedWeapons = player.weapons
            .map((weaponInstance, index) => ({ weaponInstance, weapon: Game.resolveWeapon(weaponInstance), index }))
            .filter(data => data.index !== equippedWeaponIndex && data.weapon !== null);
        
        let weaponsHTML = unequippedWeapons.map(data => {
            // Effekt-Anzeige mit vollständiger Beschreibung
            let effectsHTML = '';
            if (data.weaponInstance.effects && data.weaponInstance.effects.length > 0) {
                effectsHTML = '<div class="weapon-effects-full">';
                data.weaponInstance.effects.forEach(effectId => {
                    const effect = Game.effects[effectId];
                    if (effect) {
                        effectsHTML += `<div class="effect-detail"><strong>${effect.name}</strong>: ${effect.description}</div>`;
                    }
                });
                effectsHTML += '</div>';
            }
            
            return `
                <div class="weapon-item" data-weapon-index="${data.index}">
                    <div class="weapon-name">${data.weapon.name}</div>
                    <div class="weapon-damage">Schaden: ${data.weapon.damage}</div>
                    <div class="weapon-desc">${data.weapon.description}</div>
                    ${effectsHTML}
                </div>
            `;
        }).join('');
        
        if (unequippedWeapons.length === 0) {
            weaponsHTML = '<div class="no-weapons">Keine weiteren Waffen verfügbar</div>';
        }
        
        // ===== VERFÜGBARE FÄHIGKEITEN =====
        const unequippedAbilities = player.abilities
            .map((abilityId, index) => ({ ability: Game.abilities[abilityId], index }))
            .filter(data => !player.equippedAbilities.includes(data.index) && data.ability !== null);
        
        let abilitiesHTML = unequippedAbilities.map(data => {
            const hitInfo = data.ability.hitChance < 1.0 ? ` | ${Math.floor(data.ability.hitChance * 100)}% Treffer` : '';
            return `
                <div class="ability-item" data-ability-index="${data.index}">
                    <div class="ability-name">${data.ability.name}</div>
                    <div class="ability-stats">${data.ability.apCost} AP | ${data.ability.attacks} Angriff(e) | ${Math.floor(data.ability.damageMultiplier * 100)}%${hitInfo}</div>
                    <div class="ability-desc">${data.ability.description}</div>
                </div>
            `;
        }).join('');
        
        if (unequippedAbilities.length === 0) {
            abilitiesHTML = '<div class="no-abilities">Alle Fähigkeiten sind ausgerüstet</div>';
        }

        this.elements.sceneContent.innerHTML = `
            <div class="equipment-screen">
                <div class="equipment-section">
                    <h3>Ausrüstung</h3>
                    ${weaponSlotHTML}
                    <h4 style="margin-top: 20px;">Fähigkeiten</h4>
                    <div class="ability-slots">
                        ${abilitySlotsHTML}
                    </div>
                </div>
                <div class="available-section">
                    <div class="available-weapons">
                        <h3>Verfügbare Waffen</h3>
                        <div class="weapon-list">
                            ${weaponsHTML}
                        </div>
                    </div>
                    <div class="available-abilities">
                        <h3>Verfügbare Fähigkeiten</h3>
                        <div class="ability-list">
                            ${abilitiesHTML}
                        </div>
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

        // Waffen-Slot Click = Unequip
        const weaponSlot = document.getElementById('weapon-slot');
        if (weaponSlot && weaponSlot.classList.contains('filled')) {
            weaponSlot.addEventListener('click', () => {
                Game.unequipWeapon();
                this.showWeaponManagement(); // Refresh
            });
        }

        // Weapon Click to Equip
        document.querySelectorAll('.weapon-item').forEach(item => {
            item.addEventListener('click', () => {
                const weaponIndex = parseInt(item.dataset.weaponIndex);
                Game.equipWeapon(weaponIndex);
                this.showWeaponManagement(); // Refresh
            });
        });

        // Click auf gefüllten Fähigkeiten-Slot = Unequip
        document.querySelectorAll('.ability-slot.filled').forEach(slot => {
            slot.addEventListener('click', () => {
                const slotIndex = parseInt(slot.dataset.slot);
                Game.unequipAbility(slotIndex);
                this.showWeaponManagement(); // Refresh
            });
        });

        // Ability Click to Equip
        document.querySelectorAll('.ability-item').forEach(item => {
            item.addEventListener('click', () => {
                const abilityIndex = parseInt(item.dataset.abilityIndex);
                
                // Finde ersten freien Slot
                const freeSlot = player.equippedAbilities.indexOf(null);
                if (freeSlot !== -1) {
                    Game.equipAbility(abilityIndex, freeSlot);
                    this.showWeaponManagement(); // Refresh
                }
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
            inventoryHTML = inventory.map(item => {
                const itemDef = Game.items[item.id];
                const isConsumable = itemDef && itemDef.type === 'consumable';
                return `
                    <div class="inventory-item" data-item-id="${item.id}">
                        <div class="item-name">${item.name}</div>
                        <div class="item-quantity">x${item.quantity}</div>
                        <div class="item-desc">${item.description}</div>
                        ${isConsumable ? `<button class="item-use-btn-small" data-item-id="${item.id}">Nutzen</button>` : ''}
                    </div>
                `;
            }).join('');
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

        // Event Listeners für Nutzen-Buttons
        document.querySelectorAll('.item-use-btn-small').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.itemId;
                Game.useItem(itemId);
                // Inventar neu laden
                this.showInventory();
            });
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
        
        const merchants = Game.merchants;
        
        this.elements.sceneContent.innerHTML = `
            <div class="shop-container">
                <h2>Shop - Wähle einen Händler</h2>
                <div class="merchant-list">
                    ${Object.values(merchants).map(merchant => `
                        <div class="merchant-card" data-merchant-id="${merchant.id}">
                            <div class="merchant-name">${merchant.name}</div>
                            <div class="merchant-description">${merchant.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
        `;

        document.getElementById('btn-back').addEventListener('click', () => {
            Game.showScreen('hideout');
        });

        // Event Listeners für Händler
        document.querySelectorAll('.merchant-card').forEach(card => {
            card.addEventListener('click', () => {
                const merchantId = card.dataset.merchantId;
                this.showMerchantOffers(merchantId);
            });
        });
    },

    // Händler-Angebote anzeigen
    showMerchantOffers(merchantId) {
        const merchant = Game.merchants[merchantId];
        if (!merchant) return;

        // Glitzer zählen
        const glitzerCount = Game.state.player.inventory.filter(i => i.id === 'glitzer').reduce((sum, i) => sum + (i.quantity || 1), 0);

        this.elements.sceneContent.innerHTML = `
            <div class="shop-container">
                <h2>${merchant.name}</h2>
                <p class="merchant-description">${merchant.description}</p>
                <div class="glitzer-display">Glitzer: ${glitzerCount}</div>
                <div class="offers-list">
                    ${merchant.offers.map((offer, index) => {
                        const item = Game.items[offer.itemId];
                        const canAfford = glitzerCount >= offer.price;
                        return `
                            <div class="offer-card" data-merchant-id="${merchantId}" data-offer-index="${index}" data-price="${offer.price}" data-glitzer="${glitzerCount}">
                                <div class="offer-header">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-price-dynamic">${offer.price} Glitzer (1 Stück)</span>
                                </div>
                                <div class="item-description">${item.description}</div>
                                <div class="buy-controls">
                                    <button class="quantity-btn minus">-</button>
                                    <span class="quantity-display">1</span>
                                    <button class="quantity-btn plus">+</button>
                                    <button class="buy-btn ${!canAfford ? 'disabled' : ''}" ${!canAfford ? 'disabled' : ''}>Kaufen</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back-shop">Zurück</button>
            <button class="game-button" id="btn-sell-inventory">Inventar (Verkaufen)</button>
        `;

        document.getElementById('btn-back-shop').addEventListener('click', () => {
            this.showShop();
        });

        document.getElementById('btn-sell-inventory').addEventListener('click', () => {
            this.showSellInventory(merchantId);
        });

        // Quantity Controls
        document.querySelectorAll('.offer-card').forEach(card => {
            let quantity = 1;
            const quantityDisplay = card.querySelector('.quantity-display');
            const minusBtn = card.querySelector('.minus');
            const plusBtn = card.querySelector('.plus');
            const buyBtn = card.querySelector('.buy-btn');
            const priceDisplay = card.querySelector('.item-price-dynamic');
            const unitPrice = parseInt(card.dataset.price);
            const availableGlitzer = parseInt(card.dataset.glitzer);

            const updatePrice = () => {
                const totalPrice = unitPrice * quantity;
                priceDisplay.textContent = `${totalPrice} Glitzer (${quantity} Stück)`;
                
                // Kaufen-Button aktivieren/deaktivieren basierend auf Glitzer
                if (availableGlitzer >= totalPrice) {
                    buyBtn.disabled = false;
                    buyBtn.classList.remove('disabled');
                } else {
                    buyBtn.disabled = true;
                    buyBtn.classList.add('disabled');
                }
            };

            minusBtn.addEventListener('click', () => {
                if (quantity > 1) {
                    quantity--;
                    quantityDisplay.textContent = quantity;
                    updatePrice();
                }
            });

            plusBtn.addEventListener('click', () => {
                if (quantity < 99) {
                    quantity++;
                    quantityDisplay.textContent = quantity;
                    updatePrice();
                }
            });

            buyBtn.addEventListener('click', () => {
                const merchantId = card.dataset.merchantId;
                const offerIndex = parseInt(card.dataset.offerIndex);
                const success = Game.buyItem(merchantId, offerIndex, quantity);
                if (success) {
                    // Shop neu laden
                    this.showMerchantOffers(merchantId);
                }
            });
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

        // Sicherheit und Chaoslevel in Console ausgeben
        console.log('Sicherheit:', crawl.security + '%', '| Chaoslevel:', crawl.chaosLevel);

        this.elements.sceneContent.innerHTML = `
            <div class="boss-bar">
                <div class="boss-bar-label">Sicherheit</div>
                <div class="boss-bar-container">
                    <div class="boss-bar-fill" style="width: ${crawl.security}%"></div>
                    <span class="boss-bar-text">${crawl.security}%</span>
                </div>
            </div>
            <div class="chaos-bar">
                <div class="chaos-bar-label">Chaoslevel</div>
                <div class="chaos-bar-container">
                    <div class="chaos-bar-fill" style="width: ${Math.min(100, (crawl.chaosLevel / 15) * 100)}%"></div>
                    <span class="chaos-bar-text">${crawl.chaosLevel}</span>
                </div>
            </div>
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

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-inventory-crawl">Inventar</button>
        `;

        // Inventar-Button
        document.getElementById('btn-inventory-crawl').addEventListener('click', () => {
            this.showInventoryUsable('crawl');
        });

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

        // Stats-Panel aktualisieren falls sichtbar
        const statsPanel = this.elements.visualArea.querySelector('.stats-panel');
        if (statsPanel) {
            // Panel entfernen und neu rendern
            statsPanel.remove();
            this.elements.visualArea.insertAdjacentHTML('beforeend', this.renderStatsPanel());
        }

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
            const abilityButtons = equippedAbilities.map((ability, slotIndex) => {
                const abilityIndex = player.equippedAbilities[slotIndex];
                const canUse = battle.playerActionPoints >= ability.apCost;
                const disabledClass = canUse ? '' : 'disabled';
                const hitInfo = ability.hitChance < 1.0 ? ` | ${Math.floor(ability.hitChance * 100)}% Treffer` : '';
                
                return `
                    <button class="game-button ability-btn ${disabledClass}" data-ability-index="${abilityIndex}" ${canUse ? '' : 'disabled'}>
                        <span>${ability.name}</span><br>
                        <small>${ability.attacks}x ${Math.floor(ability.damageMultiplier * 100)}%${hitInfo} | ${ability.apCost} AP</small>
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
                <button class="game-button" id="btn-battle-inventory">Inventar</button>
                ${abilityButtons}
                ${blockButton}
            `;

            // Event Listener für Stats-Button
            document.getElementById('btn-battle-stats').addEventListener('click', () => {
                this.toggleStatsPanel();
            });

            // Event Listener für Inventar-Button
            document.getElementById('btn-battle-inventory').addEventListener('click', () => {
                this.showInventoryUsable('battle');
            });

            // Event Listener für Block-Button
            document.getElementById('btn-block').addEventListener('click', () => {
                document.getElementById('btn-block').disabled = true;
                Game.playerBlock();
            });

            // Event Listeners für Fähigkeiten
            document.querySelectorAll('.ability-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const abilityIndex = parseInt(btn.dataset.abilityIndex);
                    // Button sofort deaktivieren um Mehrfach-Klicks zu verhindern
                    btn.disabled = true;
                    Game.playerAttack(abilityIndex);
                });
            });
        } else {
            this.elements.buttonGrid.innerHTML = `
                <div class="waiting-message">Gegner ist am Zug...</div>
            `;
        }
    },

    // Verkaufs-Inventar anzeigen
    showSellInventory(merchantId) {
        const merchant = Game.merchants[merchantId];
        const weapons = Game.state.player.weapons;
        const items = Game.state.player.inventory;

        // Nur Items mit glitzerValue > 0 anzeigen
        const sellableWeapons = weapons.map((weaponInstance, index) => {
            const weapon = Game.resolveWeapon(weaponInstance);
            return {
                type: 'weapon',
                index: index,
                weaponInstance: weaponInstance,
                weapon: weapon,
                isEquipped: Game.state.player.equippedWeapon === index
            };
        }).filter(w => !w.isEquipped && w.weapon && (w.weapon.glitzerValue || 0) > 0);

        const sellableItems = items.filter(item => {
            const itemDef = Game.items[item.id];
            return itemDef && itemDef.id !== 'glitzer' && (itemDef.glitzerValue || 0) > 0;
        });

        this.elements.sceneContent.innerHTML = `
            <div class="inventory-container">
                <h2>${merchant.name} - Verkaufen</h2>
                <div class="glitzer-display">Glitzer: ${items.filter(i => i.id === 'glitzer').reduce((sum, i) => sum + (i.quantity || 1), 0)}</div>
                <div class="items-list">
                    ${sellableWeapons.length === 0 && sellableItems.length === 0 ? '<p class="no-items">Keine verkaufbaren Items</p>' : ''}
                    ${sellableWeapons.map(data => {
                        // Effekt-Anzeige
                        let effectsHTML = '';
                        if (data.weaponInstance.effects && data.weaponInstance.effects.length > 0) {
                            effectsHTML = '<div class="weapon-effects-compact">';
                            data.weaponInstance.effects.forEach(effectId => {
                                const effect = Game.effects[effectId];
                                if (effect) {
                                    effectsHTML += `<span class="effect-badge">${effect.name}</span>`;
                                }
                            });
                            effectsHTML += '</div>';
                        }
                        
                        return `
                            <div class="sellable-item-card" data-type="weapon" data-index="${data.index}">
                                <div class="item-header">
                                    <span class="item-name">${data.weapon.name}</span>
                                    <span class="item-price">+${data.weapon.glitzerValue || 0} Glitzer</span>
                                </div>
                                <div class="item-description">${data.weapon.description}</div>
                                ${effectsHTML}
                                <button class="sell-btn">Verkaufen</button>
                            </div>
                        `;
                    }).join('')}
                    ${sellableItems.map(item => {
                        const itemDef = Game.items[item.id];
                        const glitzerValue = itemDef.glitzerValue || 0;
                        return `
                            <div class="sellable-item-card" data-type="item" data-item-id="${item.id}">
                                <div class="item-header">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-price">+${glitzerValue} Glitzer</span>
                                </div>
                                <div class="item-quantity">x${item.quantity || 1}</div>
                                <div class="item-description">${itemDef.description}</div>
                                <button class="sell-btn">Verkaufen</button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back-merchant">Zurück</button>
        `;

        document.getElementById('btn-back-merchant').addEventListener('click', () => {
            this.showMerchantOffers(merchantId);
        });

        // Verkaufen-Buttons
        document.querySelectorAll('.sellable-item-card').forEach(card => {
            const sellBtn = card.querySelector('.sell-btn');
            sellBtn.addEventListener('click', () => {
                const type = card.dataset.type;
                
                if (type === 'weapon') {
                    const weaponIndex = parseInt(card.dataset.index);
                    const success = Game.sellWeapon(weaponIndex);
                    if (success) {
                        this.showSellInventory(merchantId);
                    }
                } else if (type === 'item') {
                    const itemId = card.dataset.itemId;
                    const success = Game.sellItem(itemId);
                    if (success) {
                        this.showSellInventory(merchantId);
                    }
                }
            });
        });
    },

    // Inventar für nutzbare Items anzeigen
    showInventoryUsable(returnContext) {
        const inventory = Game.state.player.inventory;
        const usableItems = inventory.filter(item => {
            const itemDef = Game.items[item.id];
            return itemDef && itemDef.type === 'consumable';
        });

        this.elements.sceneContent.innerHTML = `
            <div class="inventory-container">
                <h2>Inventar - Nutzbare Items</h2>
                <div class="items-list">
                    ${usableItems.length > 0 ? usableItems.map(item => {
                        const itemDef = Game.items[item.id];
                        return `
                            <div class="usable-item-card" data-item-id="${item.id}">
                                <div class="item-header">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-quantity">x${item.quantity || 1}</span>
                                </div>
                                <div class="item-description">${itemDef.description}</div>
                                <button class="use-btn">Nutzen</button>
                            </div>
                        `;
                    }).join('') : '<p class="no-items">Keine nutzbaren Items im Inventar</p>'}
                </div>
            </div>
        `;

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back-inventory">Zurück</button>
        `;

        // Zurück-Button
        document.getElementById('btn-back-inventory').addEventListener('click', () => {
            if (returnContext === 'battle') {
                this.updateBattleScreen();
            } else if (returnContext === 'crawl') {
                this.showCrawlEventSelection();
            } else if (returnContext === 'hideout') {
                this.showHideout();
            }
        });

        // Nutzen-Buttons
        document.querySelectorAll('.usable-item-card').forEach(card => {
            const useBtn = card.querySelector('.use-btn');
            useBtn.addEventListener('click', () => {
                const itemId = card.dataset.itemId;
                const healed = Game.useItem(itemId);
                
                if (healed !== false) {
                    // Item wurde genutzt, Inventar neu laden
                    this.showInventoryUsable(returnContext);
                    
                    // Bei Kampf auch Battle-Screen aktualisieren
                    if (returnContext === 'battle') {
                        // HP-Änderung ins Battle-Log schreiben
                        if (Game.state.currentBattle && healed > 0) {
                            Game.state.currentBattle.log.push(`Heiltrank genutzt! +${healed} HP`);
                        }
                    }
                }
            });
        });
    },

    // ===== RITUAL-SYSTEM =====
    
    // Ritual Item-Auswahl anzeigen
    showRitualSelection() {
        // Stats Panel schließen falls offen
        this.statsVisible = false;
        const existingPanel = this.elements.visualArea.querySelector('.stats-panel');
        if (existingPanel) {
            existingPanel.classList.remove('visible');
        }
        
        // Initialisiere Ritual-State falls nicht vorhanden
        if (!Game.state.currentRitual) {
            Game.state.currentRitual = {
                selectedItems: []  // Array mit Item-IDs
            };
        }
        
        const ritual = Game.state.currentRitual;
        const inventory = Game.state.player.inventory;
        
        // Nur Ritual-Items anzeigen
        const ritualItems = inventory.filter(item => {
            const itemDef = Game.items[item.id];
            return itemDef && itemDef.type === 'ritual';
        });
        
        // Zähle wie oft jedes Item bereits ausgewählt wurde
        const selectedItemCounts = {};
        ritual.selectedItems.forEach(itemId => {
            selectedItemCounts[itemId] = (selectedItemCounts[itemId] || 0) + 1;
        });
        
        this.elements.sceneContent.innerHTML = `
            <div class="ritual-container">
                <h2>Das Ritual</h2>
                <p class="ritual-description">Wähle exakt 6 Ritual-Items aus deinem Inventar, um eine Waffe zu erschaffen.</p>
                
                <div class="ritual-slots">
                    <h3>Ausgewählte Items (${ritual.selectedItems.length}/6)</h3>
                    <div class="ritual-slot-grid">
                        ${Array.from({length: 6}, (_, i) => {
                            const itemId = ritual.selectedItems[i];
                            if (itemId) {
                                const itemDef = Game.items[itemId];
                                return `
                                    <div class="ritual-slot filled" data-slot="${i}">
                                        <div class="ritual-slot-name">${itemDef.name}</div>
                                        <div class="ritual-slot-modifier-main">${itemDef.modifierType}</div>
                                        <div class="ritual-slot-value">Value: ${itemDef.value}</div>
                                        <button class="ritual-remove-btn" data-slot="${i}">✕</button>
                                    </div>
                                `;
                            } else {
                                return `
                                    <div class="ritual-slot empty" data-slot="${i}">
                                        <div class="ritual-slot-empty-text">Leer</div>
                                    </div>
                                `;
                            }
                        }).join('')}
                    </div>
                </div>
                
                <div class="ritual-inventory">
                    <h3>Verfügbare Ritual-Items</h3>
                    <div class="ritual-item-list">
                        ${ritualItems.length === 0 ? '<p class="no-items">Keine Ritual-Items im Inventar</p>' : ''}
                        ${ritualItems.map(item => {
                            const itemDef = Game.items[item.id];
                            // Berechne verfügbare Menge: Gesamt - bereits ausgewählt
                            const usedCount = selectedItemCounts[item.id] || 0;
                            const availableCount = (item.quantity || 1) - usedCount;
                            
                            // Verstecke Item wenn keine mehr verfügbar
                            if (availableCount <= 0) {
                                return '';
                            }
                            
                            return `
                                <div class="ritual-item-card" data-item-id="${item.id}">
                                    <div class="ritual-item-header">
                                        <span class="ritual-item-name">${item.name}</span>
                                        <span class="ritual-item-quantity">x${availableCount}</span>
                                    </div>
                                    <div class="ritual-item-modifier-display">${itemDef.modifierType}</div>
                                    <div class="ritual-item-stats">
                                        <span>Value: ${itemDef.value}</span>
                                    </div>
                                    </div>
                                    <button class="ritual-add-btn" data-item-id="${item.id}">Hinzufügen</button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
            <button class="game-button ${ritual.selectedItems.length === 6 ? '' : 'disabled'}" id="btn-perform-ritual" ${ritual.selectedItems.length === 6 ? '' : 'disabled'}>Ritual durchführen</button>
        `;
        
        // Event Listeners
        document.getElementById('btn-back').addEventListener('click', () => {
            Game.state.currentRitual = null;
            Game.save();
            this.showHideout();
        });
        
        document.getElementById('btn-perform-ritual').addEventListener('click', () => {
            if (ritual.selectedItems.length === 6) {
                Game.performRitual();
            }
        });
        
        // Item hinzufügen
        document.querySelectorAll('.ritual-add-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.itemId;
                if (ritual.selectedItems.length < 6) {
                    ritual.selectedItems.push(itemId);
                    Game.save();
                    this.showRitualSelection();
                }
            });
        });
        
        // Item entfernen
        document.querySelectorAll('.ritual-remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = parseInt(btn.dataset.slot);
                ritual.selectedItems.splice(slot, 1);
                Game.save();
                this.showRitualSelection();
            });
        });
    }
};
