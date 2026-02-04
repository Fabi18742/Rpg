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
        // Entferne Battle-Windows und Stats-Fenster
        this.removeBattleWindows();
        const statsWindow = document.getElementById('stats-panel-window');
        if (statsWindow) statsWindow.remove();
        this.statsVisible = false;
        
        // SVG Bild anzeigen
        this.elements.sceneContent.innerHTML = `
            <img src="assets/svg/example-hideout.svg" alt="Hideout Scene">
        `;

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
            this.showStatsScreen();
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
        let statsWindow = document.getElementById('stats-panel-window');
        
        if (statsWindow) {
            // Fenster existiert, entfernen
            const windowVisibility = JSON.parse(localStorage.getItem('windowVisibility') || '{}');
            windowVisibility['stats-panel-window'] = false;
            localStorage.setItem('windowVisibility', JSON.stringify(windowVisibility));
            
            statsWindow.remove();
            this.statsVisible = false;
        } else {
            // Fenster erstellen
            this.statsVisible = true;
            const player = Game.state.player;
            
            const statsHTML = `
                <div id="stats-panel-window" class="draggable-window" data-window-id="stats-panel-window" data-window-title="Charakterwerte" style="left: 100px; top: 100px;">
                    <div class="window-minimize-btn">−</div>
                    <div class="window-drag-handle"></div>
                    <div class="window-content stats-panel-content">
                        <div class="window-title">Charakterwerte</div>
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
                                <span class="stat-label">Glitzer:</span>
                                <span class="stat-value">${player.stats.glitzer}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', statsHTML);
            const newWindow = document.getElementById('stats-panel-window');
            
            // WindowVisibility speichern
            const windowVisibility = JSON.parse(localStorage.getItem('windowVisibility') || '{}');
            windowVisibility['stats-panel-window'] = true;
            localStorage.setItem('windowVisibility', JSON.stringify(windowVisibility));
            
            // Positioniere rechts nach Erstellung und setze korrekte Dimensionen
            const rect = newWindow.getBoundingClientRect();
            const rightX = window.innerWidth - rect.width - 50;
            newWindow.style.left = rightX + 'px';
            
            // Explizit Höhe setzen (auto für natürliche Höhe basierend auf Content)
            newWindow.style.height = 'auto';
            newWindow.style.width = ''; // Breite von CSS (.stats-panel-content: 320px)
            
            DraggableManager.makeWindowDraggable(newWindow, 'stats-panel-window');
        }
    },

    // Stats Screen anzeigen (Hideout)
    showStatsScreen() {
        const player = Game.state.player;
        
        this.elements.sceneContent.innerHTML = `
            <div class="stats-screen">
                <h2>Charakterwerte</h2>
                <div class="stats-display">
                    <div class="stats-column">
                        <div class="stat-row">
                            <span class="stat-label">Level:</span>
                            <span class="stat-value">${player.level}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">HP:</span>
                            <span class="stat-value">${player.hp}/${player.maxHp}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Stärke:</span>
                            <span class="stat-value">${player.stats.strength}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Verteidigung:</span>
                            <span class="stat-value">${player.stats.defense}</span>
                        </div>
                    </div>
                    <div class="stats-column">
                        <div class="stat-row">
                            <span class="stat-label">Magie:</span>
                            <span class="stat-value">${player.stats.magic}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Geschwindigkeit:</span>
                            <span class="stat-value">${player.stats.speed}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Glitzer:</span>
                            <span class="stat-value">${player.stats.glitzer}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
        `;

        document.getElementById('btn-back').addEventListener('click', () => {
            this.showHideout();
        });
    },

    // Waffen-Management anzeigen
    showWeaponManagement() {
        const player = Game.state.player;
        
        // ===== WAFFEN-SLOT =====
        const equippedWeaponIndex = player.equippedWeapon;
        const equippedWeaponInstance = typeof equippedWeaponIndex === 'number' ? player.weapons[equippedWeaponIndex] : null;
        const equippedWeapon = Game.resolveWeapon(equippedWeaponInstance);
        
        const hasWeaponEffects = equippedWeaponInstance && equippedWeaponInstance.effects && equippedWeaponInstance.effects.length > 0;
        let weaponEffectsHTML = '';
        let weaponTooltipHTML = '';
        
        if (equippedWeapon) {
            // Effekt-Badges für Slot
            if (hasWeaponEffects) {
                weaponEffectsHTML = '<div class="slot-effects">';
                equippedWeaponInstance.effects.forEach(effectId => {
                    const effect = Game.effects[effectId];
                    if (effect) {
                        weaponEffectsHTML += `<span class="effect-badge">${effect.name}</span>`;
                    }
                });
                weaponEffectsHTML += '</div>';
            }
            
            // Tooltip mit ausführlichen Infos
            let tooltipEffectsHTML = '';
            if (hasWeaponEffects) {
                tooltipEffectsHTML = '<div class="tooltip-effects">';
                equippedWeaponInstance.effects.forEach(effectId => {
                    const effect = Game.effects[effectId];
                    if (effect) {
                        tooltipEffectsHTML += `<div class="tooltip-effect"><strong>${effect.name}:</strong> ${effect.description}</div>`;
                    }
                });
                tooltipEffectsHTML += '</div>';
            }
            
            weaponTooltipHTML = `
                <div class="equipment-tooltip">
                    <div class="tooltip-title">${equippedWeapon.name}</div>
                    <div class="tooltip-desc">${equippedWeapon.description}</div>
                    <div class="tooltip-stat">Schaden: ${equippedWeapon.damage}</div>
                    ${tooltipEffectsHTML}
                </div>
            `;
        }
        
        let weaponSlotHTML = `
            <div class="equipment-slot weapon-slot ${equippedWeapon ? 'filled' : 'empty'}" id="weapon-slot">
                <div class="item-icon-placeholder"></div>
                <div class="item-info">
                    ${equippedWeapon ? `
                        <div class="item-name">${equippedWeapon.name}</div>
                        <div class="item-stats">Schaden: ${equippedWeapon.damage}${hasWeaponEffects ? ' | Effekte' : ''}</div>
                    ` : '<div class="item-name slot-label">Waffe</div>'}
                </div>
                ${equippedWeapon ? weaponTooltipHTML : ''}
            </div>
        `;
        
        // ===== FÄHIGKEITEN-SLOTS =====
        let abilitySlotsHTML = '';
        for (let i = 0; i < 4; i++) {
            const abilityIndex = player.equippedAbilities[i];
            const abilityId = typeof abilityIndex === 'number' ? player.abilities[abilityIndex] : null;
            const ability = abilityId ? Game.abilities[abilityId] : null;
            
            let abilityStatsHTML = '';
            let abilityTooltipHTML = '';
            
            if (ability) {
                const hitInfo = ability.hitChance < 1.0 ? ` | ${Math.floor(ability.hitChance * 100)}%` : '';
                abilityStatsHTML = `<div class="item-stats">${ability.apCost} AP | ${ability.attacks}x ${Math.floor(ability.damageMultiplier * 100)}%${hitInfo}</div>`;
                
                // Tooltip mit ausführlichen Infos
                const fullHitInfo = ability.hitChance < 1.0 ? ` | ${Math.floor(ability.hitChance * 100)}% Trefferchance` : '';
                abilityTooltipHTML = `
                    <div class="equipment-tooltip">
                        <div class="tooltip-title">${ability.name}</div>
                        <div class="tooltip-desc">${ability.description}</div>
                        <div class="tooltip-stat">${ability.apCost} AP | ${ability.attacks} Angriff(e) | ${Math.floor(ability.damageMultiplier * 100)}% Schaden${fullHitInfo}</div>
                    </div>
                `;
            }
            
            abilitySlotsHTML += `
                <div class="equipment-slot ability-slot ${ability ? 'filled' : 'empty'}" data-slot="${i}">
                    <div class="item-icon-placeholder"></div>
                    <div class="item-info">
                        ${ability ? `
                            <div class="item-name">${ability.name}</div>
                            ${abilityStatsHTML}
                        ` : `<div class="item-name slot-label">Slot ${i + 1}</div>`}
                    </div>
                    ${ability ? abilityTooltipHTML : ''}
                </div>
            `;
        }

        this.elements.sceneContent.innerHTML = `
            <div class="equipment-container">
                <h2>Ausrüstung</h2>
                <div class="equipment-slots-wrapper">
                    <div class="weapon-section">
                        <h3>Waffe</h3>
                        ${weaponSlotHTML}
                    </div>
                    <div class="abilities-section">
                        <h3>Fähigkeiten</h3>
                        <div class="ability-slots-grid">
                            ${abilitySlotsHTML}
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

        // Waffen-Slot Click = Modal öffnen
        document.getElementById('weapon-slot').addEventListener('click', () => {
            this.openWeaponModal();
        });

        // Fähigkeiten-Slot Click = Modal öffnen
        document.querySelectorAll('.ability-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                const slotIndex = parseInt(slot.dataset.slot);
                this.openAbilityModal(slotIndex);
            });
        });
    },

    // Modal für Waffen-Auswahl
    openWeaponModal() {
        const player = Game.state.player;
        const equippedWeaponIndex = player.equippedWeapon;
        
        // Alle Waffen anzeigen
        const allWeapons = player.weapons
            .map((weaponInstance, index) => ({ weaponInstance, weapon: Game.resolveWeapon(weaponInstance), index }))
            .filter(data => data.weapon !== null);
        
        let weaponsHTML = '';
        if (allWeapons.length === 0) {
            weaponsHTML = '<div class="no-items">Keine Waffen verfügbar</div>';
        } else {
            weaponsHTML = allWeapons.map(data => {
                const isEquipped = data.index === equippedWeaponIndex;
                
                // Effekt-Anzeige
                let effectsHTML = '';
                if (data.weaponInstance.effects && data.weaponInstance.effects.length > 0) {
                    effectsHTML = '<div class="weapon-effects">';
                    data.weaponInstance.effects.forEach(effectId => {
                        const effect = Game.effects[effectId];
                        if (effect) {
                            effectsHTML += `<div class="effect-tag">${effect.name}</div>`;
                        }
                    });
                    effectsHTML += '</div>';
                }
                
                return `
                    <div class="equipment-modal-item ${isEquipped ? 'equipped' : ''}" data-weapon-index="${data.index}">
                        <div class="item-icon-placeholder"></div>
                        <div class="item-details">
                            <div class="item-name">${data.weapon.name}</div>
                            <div class="item-stats-row">
                                <span class="item-stats">Schaden: ${data.weapon.damage}</span>
                                ${effectsHTML}
                                ${isEquipped ? '<span class="equipped-label">Ausgerüstet</span>' : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Modal HTML
        const modalHTML = `
            <div class="equipment-modal-overlay" id="equipment-modal">
                <div class="equipment-modal-content">
                    <h3>Waffe wählen</h3>
                    <div class="equipment-modal-list">
                        ${weaponsHTML}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('equipment-modal');
        
        // Item auswählen
        modal.querySelectorAll('.equipment-modal-item:not(.equipped)').forEach(item => {
            item.addEventListener('click', () => {
                const weaponIndex = parseInt(item.dataset.weaponIndex);
                Game.equipWeapon(weaponIndex);
                modal.remove();
                this.showWeaponManagement();
            });
        });
        
        // Overlay Click = Close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    // Modal für Fähigkeiten-Auswahl
    openAbilityModal(slotIndex) {
        const player = Game.state.player;
        
        // "Leer"-Option ganz oben
        let abilitiesHTML = `
            <div class="equipment-modal-item empty-option" data-empty="true">
                <div class="item-icon-placeholder"></div>
                <div class="item-details">
                    <div class="item-name">Leer</div>
                    <div class="item-stats">Slot leeren</div>
                </div>
            </div>
        `;
        
        // Alle Fähigkeiten anzeigen
        const allAbilities = player.abilities
            .map((abilityId, index) => ({ ability: Game.abilities[abilityId], index }))
            .filter(data => data.ability !== null);
        
        if (allAbilities.length === 0) {
            abilitiesHTML += '<div class="no-items">Keine weiteren Fähigkeiten verfügbar</div>';
        } else {
            abilitiesHTML += allAbilities.map(data => {
                const isEquipped = player.equippedAbilities.includes(data.index);
                const hitInfo = data.ability.hitChance < 1.0 ? ` | ${Math.floor(data.ability.hitChance * 100)}% Treffer` : '';
                
                return `
                    <div class="equipment-modal-item ${isEquipped ? 'equipped' : ''}" data-ability-index="${data.index}">
                        <div class="item-icon-placeholder"></div>
                        <div class="item-details">
                            <div class="item-name">${data.ability.name}</div>
                            <div class="item-stats-row">
                                <span class="item-stats">${data.ability.apCost} AP | ${data.ability.attacks}x ${Math.floor(data.ability.damageMultiplier * 100)}%${hitInfo}</span>
                                ${isEquipped ? '<span class="equipped-label">Ausgerüstet</span>' : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Modal HTML
        const modalHTML = `
            <div class="equipment-modal-overlay" id="equipment-modal">
                <div class="equipment-modal-content">
                    <h3>Fähigkeit wählen (Slot ${slotIndex + 1})</h3>
                    <div class="equipment-modal-list">
                        ${abilitiesHTML}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('equipment-modal');
        
        // "Leer"-Option
        const emptyOption = modal.querySelector('.empty-option');
        if (emptyOption) {
            emptyOption.addEventListener('click', () => {
                Game.unequipAbility(slotIndex);
                modal.remove();
                this.showWeaponManagement();
            });
        }
        
        // Item auswählen
        modal.querySelectorAll('.equipment-modal-item:not(.equipped):not(.empty-option)').forEach(item => {
            item.addEventListener('click', () => {
                const abilityIndex = parseInt(item.dataset.abilityIndex);
                Game.equipAbility(abilityIndex, slotIndex);
                modal.remove();
                this.showWeaponManagement();
            });
        });
        
        // Overlay Click = Close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
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
            // Jedes Item einzeln anzeigen (auch wenn quantity > 1)
            const expandedInventory = [];
            inventory.forEach(item => {
                const quantity = item.quantity || 1;
                for (let i = 0; i < quantity; i++) {
                    expandedInventory.push(item);
                }
            });
            
            inventoryHTML = expandedInventory.map(item => {
                return `
                    <div class="inventory-item-horizontal" data-item-id="${item.id}">
                        <div class="item-icon-placeholder"></div>
                        <div class="item-name">${item.name}</div>
                    </div>
                `;
            }).join('');
        }

        this.elements.sceneContent.innerHTML = `
            <div class="inventory-screen">
                <h2>Inventar</h2>
                <div class="inventory-grid-container">
                    ${inventoryHTML}
                </div>
            </div>
        `;

        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
        `;

        document.getElementById('btn-back').addEventListener('click', () => {
            this.showHideout();
        });

        // Click auf Items öffnet Details-Popup
        document.querySelectorAll('.inventory-item-horizontal').forEach(itemEl => {
            itemEl.addEventListener('click', () => {
                const itemId = itemEl.dataset.itemId;
                this.showItemDetailsPopup(itemId);
            });
        });
    },

    // Shop Screen anzeigen
    showShop() {
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

        // Glitzer aus Stats holen
        const glitzerCount = Game.state.player.stats.glitzer;

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
        // Battle-Windows entfernen
        this.removeBattleWindows();
        
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

    // Multiple Choice Event anzeigen
    showMultipleChoiceEvent() {
        const event = Game.state.currentEvent;
        if (!event) return;

        const crawl = Game.state.currentCrawl;

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
            <div class="choice-event-container">
                <div class="choice-event-header">
                    <h2>${event.name}</h2>
                </div>
                <div class="choice-event-story">
                    ${event.description.split('\n').map(line => `<p>${line}</p>`).join('')}
                </div>
                <div class="choice-event-options">
                    <h3>Was möchtest du tun?</h3>
                    <div class="choice-buttons">
                        ${event.choices.map((choice, index) => `
                            <button class="choice-button game-button" data-choice-index="${index}">
                                ${choice.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.elements.buttonGrid.innerHTML = '';

        // Choice Button Listeners
        document.querySelectorAll('.choice-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const choiceIndex = parseInt(btn.dataset.choiceIndex);
                btn.classList.add('selected');
                // Alle anderen Buttons deaktivieren
                document.querySelectorAll('.choice-button').forEach(b => {
                    b.disabled = true;
                });
                // Choice nach kurzer Verzögerung auswählen
                setTimeout(() => {
                    Game.selectChoice(choiceIndex);
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
        const isEnemyBattle = battle.enemies && battle.enemies.length > 0;

        // Alle Log-Einträge für diesen Kampf
        const allLogs = battle.log;

        // Bei Gegner-Kämpfen: Alle Gegner anzeigen
        let enemyDisplay = '';
        if (isEnemyBattle) {
            enemyDisplay = `
                <div class="battle-enemies">
                    ${battle.enemies.map((enemy, index) => {
                        const isDefeated = enemy.defeated || enemy.hp <= 0;
                        const isSelected = battle.selectedTarget === index && !isDefeated;
                        
                        // Status-Effekte auslesen
                        let statusDisplay = '';
                        if (enemy.statusEffects && enemy.statusEffects.length > 0) {
                            const poisonEffect = enemy.statusEffects.find(se => se.type === 'poison');
                            if (poisonEffect && poisonEffect.stacks > 0) {
                                statusDisplay = `<div class="status-effects">🧪 ${poisonEffect.stacks}</div>`;
                            }
                        }
                        
                        return `
                            <div class="battle-enemy-card ${isSelected ? 'selected' : ''} ${isDefeated ? 'defeated' : ''}" data-enemy-index="${index}">
                                <div class="enemy-sprite red-square">
                                    <div class="enemy-hp">${enemy.hp}</div>
                                    ${statusDisplay}
                                </div>
                                <div class="enemy-name">${enemy.name}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            // Bei Boss-Kämpfen: Einzelner Boss
            // Status-Effekte auslesen
            let statusDisplay = '';
            if (boss.statusEffects && boss.statusEffects.length > 0) {
                const poisonEffect = boss.statusEffects.find(se => se.type === 'poison');
                if (poisonEffect && poisonEffect.stacks > 0) {
                    statusDisplay = `<div class="status-effects">🧪 ${poisonEffect.stacks}</div>`;
                }
            }
            
            enemyDisplay = `
                <div class="battle-enemy">
                    <div class="enemy-sprite red-square">
                        <div class="enemy-hp">${boss.hp}</div>
                        ${statusDisplay}
                    </div>
                    <div class="enemy-name">${boss.name}</div>
                </div>
            `;
        }

        this.elements.sceneContent.innerHTML = `
            <div class="battle-screen">
            </div>
        `;

        // Gegner-Fenster erstellen/updaten
        this.createOrUpdateEnemyWindow(isEnemyBattle ? battle.enemies : [boss], isEnemyBattle, battle);
        
        // Battle-Log-Fenster erstellen/updaten
        this.createOrUpdateBattleLogWindow(allLogs);
        
        // Control-Fenster erstellen/updaten
        this.createOrUpdateControlWindow();
        
        // Stats und Inventar automatisch öffnen wenn sie im vorherigen Kampf offen waren
        const windowVisibility = JSON.parse(localStorage.getItem('windowVisibility') || '{}');
        if (windowVisibility['stats-panel-window'] && !document.getElementById('stats-panel-window')) {
            this.toggleStatsPanel();
        }
        if (windowVisibility['inventory-window'] && !document.getElementById('inventory-window')) {
            this.createOrUpdateInventoryWindow();
        }

        // Target-Auswahl für Gegner-Kämpfe
        if (isEnemyBattle && battle.turn === 'player') {
            document.querySelectorAll('.battle-enemy-card').forEach(card => {
                card.addEventListener('click', () => {
                    const enemyIndex = parseInt(card.dataset.enemyIndex);
                    Game.selectEnemyTarget(enemyIndex);
                    this.updateBattleScreen();
                });
            });
        }

        // Kampf vorbei?
        if (boss.hp <= 0 || player.hp <= 0) {
            this.elements.buttonGrid.innerHTML = ``;
            return;
        }

        // Fähigkeiten-Buttons (nur im Spieler-Zug)
        if (battle.turn === 'player') {
            // Ability-Fenster erstellen/updaten
            this.createOrUpdateAbilityWindow();
            
            // Toggle-Button States im Control-Window aktualisieren
            const controlWindow = document.getElementById('control-window');
            if (controlWindow) {
                this.updateToggleButtonStates(controlWindow);
            }
            
            this.elements.buttonGrid.innerHTML = ``;
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
            return itemDef && (itemDef.glitzerValue || 0) > 0;
        });

        this.elements.sceneContent.innerHTML = `
            <div class="inventory-container">
                <h2>${merchant.name} - Verkaufen</h2>
                <div class="glitzer-display">Glitzer: ${Game.state.player.stats.glitzer}</div>
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
        // Initialisiere Ritual-State falls nicht vorhanden
        if (!Game.state.currentRitual) {
            Game.state.currentRitual = {
                selectedItems: Array(6).fill(null)  // 6 feste Slots
            };
        }
        
        const ritual = Game.state.currentRitual;
        
        this.elements.sceneContent.innerHTML = `
            <div class="ritual-container">
                <h2>Das Ritual</h2>
                <p class="ritual-description">Wähle exakt 6 Ritual-Items aus deinem Inventar, um eine Waffe zu erschaffen.</p>
                
                <div class="ritual-slots-wrapper">
                    <div class="ritual-slot-grid">
                        ${Array.from({length: 6}, (_, i) => {
                            const itemId = ritual.selectedItems[i];
                            if (itemId) {
                                const itemDef = Game.items[itemId];
                                return `
                                    <div class="ritual-slot filled" data-slot="${i}">
                                        <div class="item-icon-placeholder"></div>
                                        <div class="item-name">${itemDef.name}</div>
                                        <button class="ritual-remove-btn" data-slot="${i}">✕</button>
                                    </div>
                                `;
                            } else {
                                return `
                                    <div class="ritual-slot empty" data-slot="${i}">
                                        <div class="item-icon-placeholder empty-icon"></div>
                                    </div>
                                `;
                            }
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
            <button class="game-button ${ritual.selectedItems.filter(id => id !== null).length === 6 ? '' : 'disabled'}" id="btn-perform-ritual" ${ritual.selectedItems.filter(id => id !== null).length === 6 ? '' : 'disabled'}>Ritual durchführen</button>
        `;
        
        // Event Listeners
        document.getElementById('btn-back').addEventListener('click', () => {
            Game.state.currentRitual = null;
            Game.save();
            this.showHideout();
        });
        
        document.getElementById('btn-perform-ritual').addEventListener('click', () => {
            if (ritual.selectedItems.filter(id => id !== null).length === 6) {
                Game.performRitual();
            }
        });
        
        // Slot click - öffnet Modal
        document.querySelectorAll('.ritual-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                // Verhindere dass Remove-Button den Slot öffnet
                if (e.target.closest('.ritual-remove-btn')) return;
                
                const slotIndex = parseInt(slot.dataset.slot);
                this.openRitualItemModal(slotIndex);
            });
        });
        
        // Item entfernen
        document.querySelectorAll('.ritual-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Verhindere Slot-Click
                const slot = parseInt(btn.dataset.slot);
                ritual.selectedItems[slot] = null;
                Game.save();
                this.showRitualSelection();
            });
        });
    },
    
    // Modal für Item-Auswahl öffnen
    openRitualItemModal(slotIndex) {
        const ritual = Game.state.currentRitual;
        const inventory = Game.state.player.inventory;
        
        // Nur Ritual-Items anzeigen
        const ritualItems = inventory.filter(item => {
            const itemDef = Game.items[item.id];
            return itemDef && itemDef.type === 'ritual';
        });
        
        // Expandiere Items: Jedes Item einzeln anzeigen (keine Stacks)
        const expandedItems = [];
        ritualItems.forEach(item => {
            const quantity = item.quantity || 1;
            for (let i = 0; i < quantity; i++) {
                expandedItems.push({ ...item, displayQuantity: 1 });
            }
        });
        
        // Zähle wie oft jedes Item bereits ausgewählt wurde
        const selectedItemCounts = {};
        ritual.selectedItems.forEach(itemId => {
            if (itemId !== null) {
                selectedItemCounts[itemId] = (selectedItemCounts[itemId] || 0) + 1;
            }
        });
        
        // Modal HTML
        const modalHTML = `
            <div class="ritual-modal-overlay" id="ritual-modal">
                <div class="ritual-modal-content">
                    <h3>Wähle ein Ritual-Item</h3>
                    <div class="ritual-modal-item-list">
                        ${expandedItems.length === 0 ? '<p class="no-items">Keine Ritual-Items im Inventar</p>' : ''}
                        ${expandedItems.map((item, index) => {
                            const itemDef = Game.items[item.id];
                            const usedCount = selectedItemCounts[item.id] || 0;
                            const availableIndex = index - usedCount;
                            
                            // Verstecke Item wenn bereits ausgewählt
                            if (availableIndex < 0) return '';
                            
                            return `
                                <div class="ritual-modal-item" data-item-id="${item.id}">
                                    <div class="item-icon-placeholder"></div>
                                    <div class="item-name">${itemDef.name}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('ritual-modal');
        
        // Item auswählen
        modal.querySelectorAll('.ritual-modal-item').forEach(itemEl => {
            itemEl.addEventListener('click', () => {
                const itemId = itemEl.dataset.itemId;
                ritual.selectedItems[slotIndex] = itemId;
                Game.save();
                modal.remove();
                this.showRitualSelection();
            });
        });
        
        // Overlay click zum Schließen
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    // ===== DRAGGABLE WINDOW HELPERS =====

    // Gegner-Fenster erstellen/updaten
    createOrUpdateEnemyWindow(enemies, isEnemyBattle, battle) {
        let existingWindow = document.getElementById('enemy-window');
        
        // Prüfe ob Fenster sichtbar sein soll
        const windowVisibility = JSON.parse(localStorage.getItem('windowVisibility') || '{}');
        // Beim ersten Aufruf (kein Eintrag in localStorage) soll das Fenster erstellt werden
        const shouldBeVisible = windowVisibility['enemy-window'] !== false;
        if (!existingWindow && !shouldBeVisible) {
            return; // Nicht erstellen wenn explizit ausgeblendet
        }
        
        let enemyContent = '';
        if (isEnemyBattle) {
            enemyContent = `
                <div class="battle-enemies">
                    ${enemies.map((enemy, index) => {
                        const isDefeated = enemy.defeated || enemy.hp <= 0;
                        const isSelected = battle.selectedTarget === index && !isDefeated;
                        
                        let statusDisplay = '';
                        if (enemy.statusEffects && enemy.statusEffects.length > 0) {
                            const poisonEffect = enemy.statusEffects.find(se => se.type === 'poison');
                            if (poisonEffect && poisonEffect.stacks > 0) {
                                statusDisplay = `<div class="status-effects">🧪 ${poisonEffect.stacks}</div>`;
                            }
                        }
                        
                        return `
                            <div class="battle-enemy-card ${isSelected ? 'selected' : ''} ${isDefeated ? 'defeated' : ''}" data-enemy-index="${index}">
                                <div class="enemy-sprite red-square">
                                    <div class="enemy-hp">${enemy.hp}</div>
                                    ${statusDisplay}
                                </div>
                                <div class="enemy-name">${enemy.name}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            const boss = enemies[0];
            let statusDisplay = '';
            if (boss.statusEffects && boss.statusEffects.length > 0) {
                const poisonEffect = boss.statusEffects.find(se => se.type === 'poison');
                if (poisonEffect && poisonEffect.stacks > 0) {
                    statusDisplay = `<div class="status-effects">🧪 ${poisonEffect.stacks}</div>`;
                }
            }
            
            enemyContent = `
                <div class="battle-enemy">
                    <div class="enemy-sprite red-square">
                        <div class="enemy-hp">${boss.hp}</div>
                        ${statusDisplay}
                    </div>
                    <div class="enemy-name">${boss.name}</div>
                </div>
            `;
        }

        if (existingWindow) {
            // Update existing window - window-title beibehalten
            const title = isEnemyBattle ? 'Gegner' : 'Boss';
            existingWindow.querySelector('.window-content').innerHTML = `
                <div class="window-title">${title}</div>
                ${enemyContent}
            `;
        } else {
            // Create new window
            const windowHTML = `
                <div id="enemy-window" class="draggable-window" data-window-id="enemy-window" data-window-title="${isEnemyBattle ? 'Gegner' : 'Boss'}" style="left: 100px; top: 50px;">
                    <div class="window-minimize-btn">−</div>
                    <div class="window-drag-handle"></div>
                    <div class="window-content">
                        <div class="window-title">${isEnemyBattle ? 'Gegner' : 'Boss'}</div>
                        ${enemyContent}
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', windowHTML);
            const newWindow = document.getElementById('enemy-window');
            
            // Zentriere horizontal nach dem Erstellen
            const rect = newWindow.getBoundingClientRect();
            const centerX = (window.innerWidth - rect.width) / 2;
            newWindow.style.left = centerX + 'px';
            
            DraggableManager.makeWindowDraggable(newWindow, 'enemy-window');
        }
    },

    // Battle-Log-Fenster erstellen/updaten
    createOrUpdateBattleLogWindow(logs) {
        let existingWindow = document.getElementById('battle-log-window');
        
        // Prüfe ob Fenster sichtbar sein soll (standardmäßig ausgeblendet)
        const windowVisibility = JSON.parse(localStorage.getItem('windowVisibility') || '{}');
        // Battle-Log bleibt standardmäßig ausgeblendet, nur erstellen wenn explizit geöffnet
        if (!existingWindow && !windowVisibility['battle-log-window']) {
            return; // Nicht erstellen wenn nicht explizit geöffnet
        }
        
        const logContent = `
            <div class="battle-log">
                ${logs.map(log => `<div class="log-entry">${log}</div>`).join('')}
            </div>
        `;

        if (existingWindow) {
            // Update existing window - nur .battle-log updaten um Flackern zu vermeiden
            const battleLog = existingWindow.querySelector('.battle-log');
            if (battleLog) {
                // Prüfe ob sich der Content geändert hat
                const newLogHTML = logs.map(log => `<div class="log-entry">${log}</div>`).join('');
                if (battleLog.innerHTML !== newLogHTML) {
                    battleLog.innerHTML = newLogHTML;
                    // Auto-scroll nach unten zur neuesten Nachricht
                    setTimeout(() => {
                        battleLog.scrollTop = battleLog.scrollHeight;
                    }, 0);
                }
            }
        } else {
            // Create new window  
            const windowHTML = `
                <div id="battle-log-window" class="draggable-window" data-window-id="battle-log-window" data-window-title="Kampflog" style="left: 20px; bottom: 20px;">
                    <div class="window-minimize-btn">−</div>
                    <div class="window-drag-handle"></div>
                    <div class="window-content">
                        <div class="window-title">Kampflog</div>
                        ${logContent}
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', windowHTML);
            const newWindow = document.getElementById('battle-log-window');
            
            // Position korrigieren da bottom verwendet wird
            const rect = newWindow.getBoundingClientRect();
            newWindow.style.bottom = '';
            newWindow.style.top = (window.innerHeight - rect.height - 20) + 'px';
            
            DraggableManager.makeWindowDraggable(newWindow, 'battle-log-window');
            
            // Auto-scroll nach unten zur neuesten Nachricht
            setTimeout(() => {
                const battleLog = newWindow.querySelector('.battle-log');
                if (battleLog) {
                    battleLog.scrollTop = battleLog.scrollHeight;
                }
            }, 0);
        }
    },

    // Item-Details-Popup (Hideout)
    showItemDetailsPopup(itemId) {
        const item = Game.state.player.inventory.find(i => i.id === itemId);
        if (!item) return;
        
        const itemDef = Game.items[item.id];
        const isConsumable = itemDef && itemDef.type === 'consumable';
        
        // Erstelle Overlay
        const overlayHTML = `
            <div class="item-details-overlay" id="item-details-overlay">
                <div class="item-details-popup">
                    <div class="popup-header">
                        <h3>${item.name}</h3>
                        <button class="close-popup-btn" id="close-popup-btn">×</button>
                    </div>
                    <div class="popup-content">
                        <div class="item-icon-large"></div>
                        <div class="item-description">${item.description}</div>
                        <div class="item-type">Typ: ${itemDef ? itemDef.type : 'Unbekannt'}</div>
                    </div>
                    <div class="popup-actions">
                        ${isConsumable ? `<button class="popup-btn use-btn" id="use-item-btn">Verwenden</button>` : ''}
                        <button class="popup-btn close-btn" id="close-btn">Schließen</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
        
        // Event Listeners
        const overlay = document.getElementById('item-details-overlay');
        const closePopupBtn = document.getElementById('close-popup-btn');
        const closeBtn = document.getElementById('close-btn');
        const useBtn = document.getElementById('use-item-btn');
        
        const closePopup = () => {
            overlay.remove();
        };
        
        closePopupBtn.addEventListener('click', closePopup);
        closeBtn.addEventListener('click', closePopup);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePopup();
        });
        
        if (useBtn) {
            useBtn.addEventListener('click', () => {
                Game.useItem(itemId);
                closePopup();
                this.showInventory();
            });
        }
    },

    // Kampf-Inventar-Fenster erstellen/updaten
    createOrUpdateInventoryWindow() {
        let existingWindow = document.getElementById('inventory-window');
        
        const inventory = Game.state.player.inventory;
        const usableItems = inventory.filter(item => {
            const itemDef = Game.items[item.id];
            return itemDef && itemDef.type === 'consumable';
        });
        
        // Jedes Item einzeln anzeigen (auch wenn quantity > 1)
        const expandedItems = [];
        usableItems.forEach(item => {
            const quantity = item.quantity || 1;
            for (let i = 0; i < quantity; i++) {
                expandedItems.push(item);
            }
        });
        
        const inventoryContent = `
            <div class="window-title">Inventar</div>
            <div class="inventory-battle-grid">
                ${expandedItems.length > 0 ? expandedItems.map(item => {
                    return `
                        <div class="inventory-item-battle-horizontal" data-item-id="${item.id}">
                            <div class="item-icon-placeholder"></div>
                            <div class="item-name">${item.name}</div>
                        </div>
                    `;
                }).join('') : '<div class="no-items">Keine nutzbaren Items</div>'}
            </div>
        `;
        
        if (existingWindow) {
            // Update existing window
            existingWindow.querySelector('.window-content').innerHTML = inventoryContent;
            
            // Event Listeners neu setzen
            this.setupInventoryWindowListeners(existingWindow);
        } else {
            // Create new window
            const windowHTML = `
                <div id="inventory-window" class="draggable-window" data-window-id="inventory-window" data-window-title="Inventar" style="left: 100px; top: 200px;">
                    <div class="window-minimize-btn">−</div>
                    <div class="window-drag-handle"></div>
                    <div class="window-content">
                        ${inventoryContent}
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', windowHTML);
            const newWindow = document.getElementById('inventory-window');
            
            // WindowVisibility speichern
            const windowVisibility = JSON.parse(localStorage.getItem('windowVisibility') || '{}');
            windowVisibility['inventory-window'] = true;
            localStorage.setItem('windowVisibility', JSON.stringify(windowVisibility));
            
            DraggableManager.makeWindowDraggable(newWindow, 'inventory-window');
            
            // Event Listeners setzen
            this.setupInventoryWindowListeners(newWindow);
        }
    },
    
    // Event Listeners für Inventar-Fenster
    setupInventoryWindowListeners(windowElement) {
        windowElement.querySelectorAll('.inventory-item-battle-horizontal').forEach(itemEl => {
            itemEl.addEventListener('click', () => {
                const itemId = itemEl.dataset.itemId;
                const healed = Game.useItem(itemId);
                
                if (healed !== false) {
                    // Item verwendet, Fenster updaten
                    this.createOrUpdateInventoryWindow();
                    this.updateBattleScreen();
                }
            });
        });
    },

    // Ability-Fenster erstellen/updaten
    createOrUpdateAbilityWindow() {
        const battle = Game.state.currentBattle;
        if (!battle || battle.turn !== 'player') return;

        // Prüfe ob Fenster sichtbar sein soll
        const windowVisibility = JSON.parse(localStorage.getItem('windowVisibility') || '{}');
        const existingWindow = document.getElementById('ability-window');
        // Beim ersten Aufruf (kein Eintrag in localStorage) soll das Fenster erstellt werden
        const shouldBeVisible = windowVisibility['ability-window'] !== false;
        if (!existingWindow && !shouldBeVisible) {
            return; // Nicht erstellen wenn explizit ausgeblendet
        }

        const player = Game.state.player;
        const equippedAbilities = player.equippedAbilities
            .map(abilityIndex => Game.abilities[player.abilities[abilityIndex]])
            .filter(ability => ability);
        
        const abilityButtons = equippedAbilities.map((ability, slotIndex) => {
            const abilityIndex = player.equippedAbilities[slotIndex];
            const canUse = battle.playerActionPoints >= ability.apCost;
            const disabledClass = canUse ? '' : 'disabled';
            const hitInfo = ability.hitChance < 1.0 ? ` | ${Math.floor(ability.hitChance * 100)}%` : '';
            
            return `
                <div class="ability-button-card ${disabledClass}" data-ability-index="${abilityIndex}">
                    <div class="ability-icon-placeholder"></div>
                    <div class="ability-button-name">${ability.name}</div>
                    <div class="ability-button-stats">${ability.attacks}x ${Math.floor(ability.damageMultiplier * 100)}%${hitInfo} | ${ability.apCost} AP</div>
                </div>
            `;
        }).join('');

        // Block-Button
        const canBlock = battle.playerActionPoints >= 1;
        const blockButtonClass = canBlock ? '' : 'disabled';
        const blockValue = battle.playerActionPoints * 2;
        const blockButton = `
            <div class="ability-button-card ${blockButtonClass}" data-action="block">
                <div class="ability-icon-placeholder"></div>
                <div class="ability-button-name">Blocken</div>
                <div class="ability-button-stats">+${blockValue} DEF | Alle AP</div>
            </div>
        `;

        const content = `
            <div class="ability-window-content">
                ${abilityButtons}
                ${blockButton}
            </div>
        `;

        if (existingWindow) {
            existingWindow.querySelector('.window-content').innerHTML = `
                <div class="window-title">Fähigkeiten</div>
                ${content}
            `;
            this.setupAbilityWindowListeners(existingWindow);
        } else {
            const windowHTML = `
                <div class="draggable-window" id="ability-window" data-window-id="ability-window" data-window-title="Fähigkeiten" style="left: 20px; top: 200px;">
                    <div class="window-minimize-btn">−</div>
                    <div class="window-drag-handle"></div>
                    <div class="window-content">
                        <div class="window-title">Fähigkeiten</div>
                        ${content}
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', windowHTML);
            const newWindow = document.getElementById('ability-window');
            DraggableManager.makeWindowDraggable(newWindow, 'ability-window');
            DraggableManager.bringToFront(newWindow);
            this.setupAbilityWindowListeners(newWindow);
        }
    },

    // Event Listeners für Ability-Fenster
    setupAbilityWindowListeners(windowElement) {
        windowElement.querySelectorAll('.ability-button-card').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('disabled')) return;
                
                const abilityIndex = btn.dataset.abilityIndex;
                const action = btn.dataset.action;
                
                if (action === 'block') {
                    Game.playerBlock();
                } else {
                    Game.playerAttack(parseInt(abilityIndex));
                }
                
                this.updateBattleScreen();
            });
        });
    },

    // Control-Fenster erstellen/updaten
    createOrUpdateControlWindow() {
        const battle = Game.state.currentBattle;
        if (!battle) return;

        const player = Game.state.player;
        const hpPercent = (player.hp / player.maxHp) * 100;

        let existingWindow = document.getElementById('control-window');

        const content = `
            <div class="window-title">Status</div>
            <div class="control-window-content">
                <div class="hp-bar-container">
                    <div class="hp-bar-label">HP</div>
                    <div class="hp-bar-wrapper">
                        <div class="hp-bar-fill" style="width: ${hpPercent}%"></div>
                        <div class="hp-bar-text">${player.hp}/${player.maxHp}</div>
                    </div>
                </div>
                
                <div class="ap-display">AP: ${battle.playerActionPoints}/${player.maxActionPoints}</div>
                
                <div class="window-toggles">
                    <div class="window-toggle-btn" data-window="stats-panel-window">Stats</div>
                    <div class="window-toggle-btn" data-window="inventory-window">Inventar</div>
                    <div class="window-toggle-btn" data-window="ability-window">Fähigkeiten</div>
                    <div class="window-toggle-btn" data-window="enemy-window">Gegner</div>
                    <div class="window-toggle-btn" data-window="battle-log-window">Kampflog</div>
                </div>
            </div>
        `;

        if (existingWindow) {
            existingWindow.querySelector('.window-content').innerHTML = content;
            this.updateToggleButtonStates(existingWindow);
            this.setupControlWindowListeners(existingWindow);
        } else {
            const windowHTML = `
                <div class="draggable-window" id="control-window" data-window-id="control-window" data-window-title="Status">
                    <div class="window-minimize-btn">−</div>
                    <div class="window-drag-handle"></div>
                    <div class="window-content">
                        ${content}
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', windowHTML);
            const newWindow = document.getElementById('control-window');
            
            // Zentriere horizontal am unteren Rand mit top statt bottom
            const rect = newWindow.getBoundingClientRect();
            const centerX = (window.innerWidth - rect.width) / 2;
            const bottomY = window.innerHeight - rect.height - 20;
            newWindow.style.left = centerX + 'px';
            newWindow.style.top = bottomY + 'px';
            
            DraggableManager.makeWindowDraggable(newWindow, 'control-window');
            DraggableManager.bringToFront(newWindow);
            this.updateToggleButtonStates(newWindow);
            this.setupControlWindowListeners(newWindow);
        }
    },

    // Toggle-Button States aktualisieren basierend auf geöffneten Fenstern
    updateToggleButtonStates(controlWindow) {
        controlWindow.querySelectorAll('.window-toggle-btn').forEach(btn => {
            const windowId = btn.dataset.window;
            const targetWindow = document.getElementById(windowId);
            if (targetWindow) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    // Event Listeners für Control-Fenster
    setupControlWindowListeners(windowElement) {
        windowElement.querySelectorAll('.window-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const windowId = btn.dataset.window;
                const targetWindow = document.getElementById(windowId);
                
                if (targetWindow) {
                    // Cleanup VOR dem Entfernen! (minimized-State behalten für Toggle)
                    DraggableManager.cleanupWindow(windowId, true);
                    // Fenster schließen - in localStorage als hidden markieren
                    const windowVisibility = JSON.parse(localStorage.getItem('windowVisibility') || '{}');
                    windowVisibility[windowId] = false;
                    localStorage.setItem('windowVisibility', JSON.stringify(windowVisibility));
                    targetWindow.remove();
                } else {
                    // Fenster öffnen - in localStorage als visible markieren
                    const windowVisibility = JSON.parse(localStorage.getItem('windowVisibility') || '{}');
                    windowVisibility[windowId] = true;
                    localStorage.setItem('windowVisibility', JSON.stringify(windowVisibility));
                    
                    if (windowId === 'stats-panel-window') {
                        this.toggleStatsPanel();
                    } else if (windowId === 'inventory-window') {
                        this.createOrUpdateInventoryWindow();
                    } else if (windowId === 'ability-window') {
                        this.createOrUpdateAbilityWindow();
                    } else if (windowId === 'enemy-window') {
                        // Gegner-Fenster neu erstellen
                        const battle = Game.state.currentBattle;
                        if (battle) {
                            const isEnemyBattle = battle.enemies && battle.enemies.length > 0;
                            this.createOrUpdateEnemyWindow(isEnemyBattle ? battle.enemies : [battle.boss], isEnemyBattle, battle);
                        }
                    } else if (windowId === 'battle-log-window') {
                        // Battle-Log neu erstellen
                        const battle = Game.state.currentBattle;
                        if (battle && battle.log) {
                            this.createOrUpdateBattleLogWindow(battle.log);
                        }
                    }
                }
                
                // Update alle Button States
                this.updateToggleButtonStates(windowElement);
            });
        });
    },

    // Alle Battle-Windows entfernen
    removeBattleWindows() {
        const enemyWindow = document.getElementById('enemy-window');
        const logWindow = document.getElementById('battle-log-window');
        const statsWindow = document.getElementById('stats-panel-window');
        const inventoryWindow = document.getElementById('inventory-window');
        const abilityWindow = document.getElementById('ability-window');
        const controlWindow = document.getElementById('control-window');
        
        // Sichtbarkeit von Stats und Inventar für nächsten Kampf speichern
        const windowVisibility = JSON.parse(localStorage.getItem('windowVisibility') || '{}');
        if (statsWindow) {
            windowVisibility['stats-panel-window'] = true; // War sichtbar
        }
        if (inventoryWindow) {
            windowVisibility['inventory-window'] = true; // War sichtbar
        }
        localStorage.setItem('windowVisibility', JSON.stringify(windowVisibility));
        
        // ResizeObserver cleanup VOR dem Entfernen!
        // Stats und Inventar: keepMinimizedState = true (Minimiert-Status merken)
        if (enemyWindow) DraggableManager.cleanupWindow('enemy-window');
        if (logWindow) DraggableManager.cleanupWindow('battle-log-window');
        if (statsWindow) DraggableManager.cleanupWindow('stats-panel-window', true);
        if (inventoryWindow) DraggableManager.cleanupWindow('inventory-window', true);
        if (abilityWindow) DraggableManager.cleanupWindow('ability-window');
        if (controlWindow) DraggableManager.cleanupWindow('control-window');
        
        // Jetzt Fenster entfernen
        if (enemyWindow) enemyWindow.remove();
        if (logWindow) logWindow.remove();
        if (statsWindow) {
            statsWindow.remove();
            this.statsVisible = false;
        }
        if (inventoryWindow) inventoryWindow.remove();
        if (abilityWindow) abilityWindow.remove();
        if (controlWindow) controlWindow.remove();
    }
};
