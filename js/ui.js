// UI Management und DOM Manipulation

const UI = {
  elements: {
    visualArea: null,
    actionArea: null,
    sceneContent: null,
    buttonGrid: null,
  },
  statsVisible: false,

  // UI initialisieren
  init() {
    this.elements.visualArea = document.querySelector(".visual-area");
    this.elements.actionArea = document.querySelector(".action-area");
    this.elements.sceneContent = document.querySelector(".scene-content");
    this.elements.buttonGrid = document.querySelector(".button-grid");

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
    const statsWindow = document.getElementById("stats-panel-window");
    if (statsWindow) statsWindow.remove();
    this.statsVisible = false;

    // Hintergrundbild-Klasse hinzufügen
    this.elements.visualArea.classList.add("hideout-bg");

    // Leerer Container für Hintergrundbild
    this.elements.sceneContent.innerHTML = ``;

    this.elements.buttonGrid.innerHTML = `
            <button class="game-button hideout-button" id="btn-weapons">Ausrüstung</button>
            <button class="game-button hideout-button" id="btn-shop">Shop</button>
            <button class="game-button hideout-button" id="btn-stats">Stats</button>
            <button class="game-button hideout-button" id="btn-inventory">Inventar</button>
            <button class="game-button hideout-button" id="btn-ritual">Das Ritual</button>
            <button class="game-button hideout-button" id="btn-boss">Boss-Kämpfe</button>
        `;
    // Grid-Klasse zurücksetzen: shop-grid entfernen und hideout-grid setzen
    this.elements.buttonGrid.className = "button-grid hideout-grid";

    // Event Listeners neu setzen
    this.setupHideoutListeners();
  },

  // === Universeller Result Screen ===
  showResultScreen(title, messages, callback) {
    this.elements.visualArea.classList.remove("hideout-bg");

    // Verstecke Stats-Panel falls offen, damit es nicht stört
    const existingPanel =
      this.elements.visualArea.querySelector(".stats-panel");
    if (existingPanel) existingPanel.classList.remove("visible");

    // HTML für die Nachrichten zusammenbauen
    const messagesHTML = messages.map((msg) => `<div>${msg}</div>`).join("");

    this.elements.sceneContent.innerHTML = `
            <div class="result-screen">
                <h2>${title}</h2>
                <div class="result-messages">
                    ${messagesHTML}
                </div>
            </div>
        `;

    // Nur ein einziger "Weiter" Button
    this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-result-next">Weiter</button>
        `;
    this.elements.buttonGrid.className = "button-grid single-button";

    // Was passiert beim Klick?
    document.getElementById("btn-result-next").addEventListener("click", () => {
      if (callback && typeof callback === "function") {
        callback(); // Ruft die übergebene Funktion auf (z.B. zurück zum Hideout)
      } else {
        Game.showScreen("hideout"); // Fallback
      }
    });
  },

  // Spezieller Todesscreen
  showDeathScreen(messages, callback) {
    // Nutzt die universelle showResultScreen Logik mit festem Titel
    this.showResultScreen("DU BIST GESTORBEN", messages, callback);

    // Fügt nachträglich die CSS-Klasse für das Styling hinzu
    const screen = document.querySelector(".result-screen");
    if (screen) screen.classList.add("death-screen");
  },

  // Hideout-spezifische Event Listeners
  setupHideoutListeners() {
    document.getElementById("btn-stats").addEventListener("click", () => {
      this.showStatsScreen();
    });

    document.getElementById("btn-weapons").addEventListener("click", () => {
      this.showWeaponManagement();
    });

    document.getElementById("btn-inventory").addEventListener("click", () => {
      this.showInventory();
    });

    document.getElementById("btn-shop").addEventListener("click", () => {
      Game.showScreen("shop");
    });

    document.getElementById("btn-ritual").addEventListener("click", () => {
      this.showRitualSelection();
    });

    document.getElementById("btn-boss").addEventListener("click", () => {
      Game.showScreen("boss");
    });
  },

  // Stats Panel rendern (HTML erstellen)
  renderStatsPanel() {
    const player = Game.state.player;
    const visible = this.statsVisible ? "visible" : "";

    // NEU: Dynamische Werte holen
    const maxHp = Game.getPlayerMaxHp();
    const defense = Game.getPlayerDefense();
    const attack = Game.getPlayerAttackValue();

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
                        <span class="stat-value">${player.hp}/${maxHp}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Angriff:</span>
                        <span class="stat-value">${attack}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Verteidigung:</span>
                        <span class="stat-value">${defense}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Glitzer:</span>
                        <span class="stat-value">${player.stats.glitzer}</span>
                    </div>
                </div>
            </div>
        `;
  },

  updateStatsWindow() {
    const statsWindow = document.getElementById("stats-panel-window");
    if (!statsWindow) return;

    const player = Game.state.player;

    // Dynamische Werte holen
    const maxHp = Game.getPlayerMaxHp();
    const defense = Game.getPlayerDefense();
    const attack = Game.getPlayerAttackValue();

    // Basis-Werte für Detail-Anzeige
    const baseStr = player.stats.strength;
    const baseDef = player.stats.defense;
    const weapon = Game.getEquippedWeapon();
    const weaponName = weapon ? "Waffe" : "Keine Waffe";

    const statsGrid = statsWindow.querySelector(".stats-grid");
    if (statsGrid) {
      statsGrid.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Level:</span>
                    <span class="stat-value">${player.level}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">HP:</span>
                    <span class="stat-value">${player.hp}/${maxHp}</span>
                </div>
                
                <div class="stat-item" style="flex-direction: column; align-items: flex-start; gap: 2px;">
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span class="stat-label">Angriff:</span>
                        <span class="stat-value">${attack}</span>
                    </div>
                </div>

                <div class="stat-item" style="flex-direction: column; align-items: flex-start; gap: 2px;">
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span class="stat-label">Verteidigung:</span>
                        <span class="stat-value">${defense}</span>
                    </div>
                </div>

                <div class="stat-item">
                    <span class="stat-label">Glitzer:</span>
                    <span class="stat-value">${player.stats.glitzer}</span>
                </div>
            `;
    }
  },

  // Stats Panel ein/ausblenden
  toggleStatsPanel() {
    let statsWindow = document.getElementById("stats-panel-window");

    if (statsWindow) {
      // Fenster existiert, entfernen
      const windowVisibility = JSON.parse(
        localStorage.getItem("windowVisibility") || "{}",
      );
      windowVisibility["stats-panel-window"] = false;
      localStorage.setItem(
        "windowVisibility",
        JSON.stringify(windowVisibility),
      );

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
                                <span class="stat-label">Glitzer:</span>
                                <span class="stat-value">${player.stats.glitzer}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
      document.body.insertAdjacentHTML("beforeend", statsHTML);
      const newWindow = document.getElementById("stats-panel-window");

      // WindowVisibility speichern
      const windowVisibility = JSON.parse(
        localStorage.getItem("windowVisibility") || "{}",
      );
      windowVisibility["stats-panel-window"] = true;
      localStorage.setItem(
        "windowVisibility",
        JSON.stringify(windowVisibility),
      );

      // Positioniere rechts nach Erstellung und setze korrekte Dimensionen
      const rect = newWindow.getBoundingClientRect();
      const rightX = window.innerWidth - rect.width - 50;
      newWindow.style.left = rightX + "px";

      // Explizit Höhe setzen (auto für natürliche Höhe basierend auf Content)
      newWindow.style.height = "auto";
      newWindow.style.width = ""; // Breite von CSS (.stats-panel-content: 320px)

      DraggableManager.makeWindowDraggable(newWindow, "stats-panel-window");
    }
  },

  // Stats Screen anzeigen (Hideout) - HP jetzt ohne Tooltip
  showStatsScreen() {
    this.elements.visualArea.classList.remove("hideout-bg");
    const player = Game.state.player;

    // --- BERECHNUNGEN ---
    const effectiveMaxHp = Game.getPlayerMaxHp();

    const weapon = Game.getEquippedWeapon();
    const weaponName = weapon ? weapon.name : "Keine Waffe";
    const weaponDmg = weapon ? weapon.damage : 0;
    const strength = player.stats.strength;
    const effectiveAttack = Game.getPlayerAttackValue();

    const armor = Game.getEquippedArmor();
    const armorName = armor ? armor.name : "Keine Rüstung";
    const armorVal = armor ? armor.value : 0;
    const defenseBase = player.stats.defense;
    const effectiveDefense = Game.getPlayerDefense();

    const xpPercent = Math.min(100, (player.xp / player.maxXp) * 100);

    // --- HTML GENERIERUNG ---
    this.elements.sceneContent.innerHTML = `
      <div class="stats-screen">
          <h2>Charakterwerte</h2>
          
          <div class="xp-container">
              <div class="xp-label">
                  <span>Erfahrung</span>
                  <span>${player.xp} / ${player.maxXp} XP</span>
              </div>
              <div class="xp-bar-bg">
                  <div class="xp-bar-fill" style="width: ${xpPercent}%"></div>
              </div>
          </div>

          <div class="stats-display">
              <div class="stat-row">
                  <span class="stat-label">Level:</span>
                  <span class="stat-value">${player.level}</span>
              </div>

              <div class="stat-row">
                  <span class="stat-label">HP:</span>
                  <div style="text-align: right;">
                      <span class="stat-value">${player.hp}/${effectiveMaxHp}</span>
                  </div>
              </div>

              <div class="stat-row has-tooltip">
                  <span class="stat-label">Angriff:</span>
                  <div style="text-align: right;">
                      <span class="stat-value">${effectiveAttack}</span>
                  </div>
                  <div class="equipment-tooltip stat-tooltip">
                      <div class="tooltip-title">Angriffskraft</div>
                      <div class="tooltip-desc">Gesamter physischer Schaden.</div>
                      <div class="tooltip-effect">
                          <span>Stärke (Basis):</span> <span>${strength}</span>
                      </div>
                      <div class="tooltip-effect">
                          <span>Waffe (${weaponName}):</span> <span>+${weaponDmg}</span>
                      </div>
                      <div class="tooltip-sum-line">
                          <span>Gesamt:</span> <span>${effectiveAttack}</span>
                      </div>
                  </div>
              </div>

              <div class="stat-row has-tooltip">
                  <span class="stat-label">Verteidigung:</span>
                  <div style="text-align: right;">
                      <span class="stat-value">${effectiveDefense}</span>
                  </div>
                  <div class="equipment-tooltip stat-tooltip">
                      <div class="tooltip-title">Verteidigung</div>
                      <div class="tooltip-desc">Reduziert erlittenen Schaden.</div>
                      <div class="tooltip-effect">
                          <span>Verteidigung (Basis):</span> <span>${defenseBase}</span>
                      </div>
                      <div class="tooltip-effect">
                          <span>Rüstung (${armorName}):</span> <span>+${armorVal}</span>
                      </div>
                      <div class="tooltip-sum-line">
                          <span>Gesamt:</span> <span>${effectiveDefense}</span>
                      </div>
                  </div>
              </div>

              <div class="stat-row">
                  <span class="stat-label">Glitzer:</span>
                  <span class="stat-value">${player.stats.glitzer}</span>
              </div>
          </div>
      </div>
  `;

    // Logik für den Button-Text: Nur die Zahl in Klammern wird farbig
    let tokenText = "Level Up";
    if (player.levelTokens > 0) {
      // Die Zahl wird in das Span mit der Klasse .token-alert gepackt
      tokenText = `Level Up <span class="token-alert">(${player.levelTokens})</span>`;
    }

    this.elements.buttonGrid.innerHTML = `
  <button class="game-button" id="btn-back">Zurück</button>
  <button class="game-button" id="btn-open-levelup">${tokenText}</button>
`;
    // Beide Buttons nutzen jetzt die gleiche Klasse und sehen identisch aus
    this.elements.buttonGrid.className = "button-grid shop-grid";

    document
      .getElementById("btn-back")
      .addEventListener("click", () => this.showHideout());
    document
      .getElementById("btn-open-levelup")
      .addEventListener("click", () => this.showLevelUpScreen());
  },

  showLevelUpScreen() {
    this.elements.visualArea.classList.remove("hideout-bg");
    const player = Game.state.player;
    const tokens = player.levelTokens;
    const canInvest = tokens > 0;

    this.elements.sceneContent.innerHTML = `
        <div class="badass-screen">
            <div class="token-display">
                Verfügbare Tokens: ${tokens}
            </div>
            <div class="badass-stats-list">
                <div class="badass-row">
                    <div class="badass-info">
                        <div class="badass-name">Vitalität</div>
                        <div class="badass-val">Max HP: ${player.maxHp}</div>
                    </div>
                    <button class="badass-btn" data-stat="health" ${!canInvest ? "disabled" : ""}>
                        +5
                    </button>
                </div>

                <div class="badass-row">
                    <div class="badass-info">
                        <div class="badass-name">Kriegskunst</div>
                        <div class="badass-val">Stärke: ${player.stats.strength}</div>
                    </div>
                    <button class="badass-btn" data-stat="damage" ${!canInvest ? "disabled" : ""}>
                        +1
                    </button>
                </div>

                <div class="badass-row">
                    <div class="badass-info">
                        <div class="badass-name">Eisenhaut</div>
                        <div class="badass-val">Verteidigung: ${player.stats.defense}</div>
                    </div>
                    <button class="badass-btn" data-stat="resistance" ${!canInvest ? "disabled" : ""}>
                        +1
                    </button>
                </div>


            </div>
        </div>
    `;

    this.elements.buttonGrid.innerHTML = `
        <button class="game-button" id="btn-back-stats">ZURÜCK</button>
    `;
    this.elements.buttonGrid.className = "button-grid single-button";

    document.getElementById("btn-back-stats").addEventListener("click", () => {
      this.showStatsScreen();
    });

    document.querySelectorAll(".badass-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const statType = btn.dataset.stat;
        if (Game.investToken(statType)) {
          this.showLevelUpScreen();
        }
      });
    });
  },

  // Waffen-Management anzeigen
  showWeaponManagement() {
    this.elements.visualArea.classList.remove("hideout-bg");
    const player = Game.state.player;

    // ===== WAFFEN-SLOT =====
    const equippedWeaponIndex = player.equippedWeapon;
    const equippedWeaponInstance =
      typeof equippedWeaponIndex === "number"
        ? player.weapons[equippedWeaponIndex]
        : null;
    const equippedWeapon = Game.resolveWeapon(equippedWeaponInstance);

    const hasWeaponEffects =
      equippedWeaponInstance &&
      equippedWeaponInstance.effects &&
      equippedWeaponInstance.effects.length > 0;
    let weaponEffectsHTML = "";
    let weaponTooltipHTML = "";

    if (equippedWeapon) {
      // Effekt-Badges für Slot generieren
      if (hasWeaponEffects) {
        weaponEffectsHTML =
          '<span class="slot-effects" style="margin-left: 8px;">';
        equippedWeaponInstance.effects.forEach((effectId) => {
          const effect = Game.effects[effectId];
          if (effect) {
            // ÄNDERUNG: Style für Farbe (Rot/Pink) wie im Modal hinzugefügt
            weaponEffectsHTML += `<span class="effect-badge" style="color: #ff9a8a; border: 1px solid #e74c3c;">${effect.name}</span>`;
          }
        });
        weaponEffectsHTML += "</span>";
      }

      // Tooltip mit ausführlichen Infos
      let tooltipEffectsHTML = "";
      if (hasWeaponEffects) {
        tooltipEffectsHTML = '<div class="tooltip-effects">';
        equippedWeaponInstance.effects.forEach((effectId) => {
          const effect = Game.effects[effectId];
          if (effect) {
            tooltipEffectsHTML += `<div class="tooltip-effect"><strong>${effect.name}:</strong> ${effect.description}</div>`;
          }
        });
        tooltipEffectsHTML += "</div>";
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
            <div class="equipment-slot weapon-slot ${equippedWeapon ? "filled" : "empty"}" id="weapon-slot">
                <div class="item-icon-placeholder"></div>
                <div class="item-info">
                    ${
                      equippedWeapon
                        ? `
                        <div class="item-name">${equippedWeapon.name}</div>
                        <div class="item-stats">Schaden: ${equippedWeapon.damage}${weaponEffectsHTML}</div>         
                    `
                        : '<div class="item-name slot-label">Waffe</div>'
                    }
                </div>
                ${equippedWeapon ? weaponTooltipHTML : ""}
            </div>
        `;

    // ===== RÜSTUNGS-SLOT =====
    const equippedArmorIndex = player.equippedArmor;
    const equippedArmorInstance =
      player.armors && typeof equippedArmorIndex === "number"
        ? player.armors[equippedArmorIndex]
        : null;
    const equippedArmor = Game.resolveArmor(equippedArmorInstance);

    let armorTooltipHTML = "";
    let armorEffectsHTML = "";

    if (equippedArmor) {
      // Prüfen auf Effekte (für zukünftige Features)
      const hasArmorEffects =
        equippedArmorInstance.effects &&
        equippedArmorInstance.effects.length > 0;
      let tooltipArmorEffectsHTML = "";

      if (hasArmorEffects) {
        armorEffectsHTML =
          '<span class="slot-effects" style="margin-left: 8px;">';
        tooltipArmorEffectsHTML = '<div class="tooltip-effects">';

        equippedArmorInstance.effects.forEach((effectId) => {
          const effect = Game.effects[effectId];
          if (effect) {
            // Badge im Slot
            armorEffectsHTML += `<span class="effect-badge" style="color: #ff9a8a; border: 1px solid #e74c3c;">${effect.name}</span>`;
            // Zeile im Tooltip
            tooltipArmorEffectsHTML += `<div class="tooltip-effect"><strong>${effect.name}:</strong> ${effect.description}</div>`;
          }
        });
        armorEffectsHTML += "</span>";
        tooltipArmorEffectsHTML += "</div>";
      }

      // Der eigentliche Tooltip HTML-Code
      armorTooltipHTML = `
            <div class="equipment-tooltip">
                <div class="tooltip-title">${equippedArmor.name}</div>
                <div class="tooltip-desc">${equippedArmor.description}</div>
                <div class="tooltip-stat">Schutz: ${equippedArmor.value}</div>
                ${tooltipArmorEffectsHTML}
            </div>
        `;
    }

    let armorSlotHTML = `
        <div class="equipment-slot armor-slot ${equippedArmor ? "filled" : "empty"}" id="armor-slot">
            <div class="item-icon-placeholder"></div>
            <div class="item-info">
                ${
                  equippedArmor
                    ? `
                    <div class="item-name">${equippedArmor.name}</div>
                    <div class="item-stats">Schutz: ${equippedArmor.value}${armorEffectsHTML}</div>         
                `
                    : '<div class="item-name slot-label">Rüstung</div>'
                }
            </div>
            
            ${equippedArmor ? armorTooltipHTML : ""}
            
        </div>
    `;

    // ===== FÄHIGKEITEN-SLOTS =====
    let abilitySlotsHTML = "";
    for (let i = 0; i < 4; i++) {
      const abilityIndex = player.equippedAbilities[i];
      const abilityId =
        typeof abilityIndex === "number"
          ? player.abilities[abilityIndex]
          : null;
      const ability = abilityId ? Game.abilities[abilityId] : null;

      let abilityStatsHTML = "";
      let abilityTooltipHTML = "";

      if (ability) {
        const hitInfo =
          ability.hitChance < 1.0
            ? ` | ${Math.floor(ability.hitChance * 100)}%`
            : "";
        abilityStatsHTML = `<div class="item-stats">${ability.apCost} AP | ${ability.attacks}x ${Math.floor(ability.damageMultiplier * 100)}%${hitInfo}</div>`;

        // Tooltip mit ausführlichen Infos
        const fullHitInfo =
          ability.hitChance < 1.0
            ? ` | ${Math.floor(ability.hitChance * 100)}% Trefferchance`
            : "";
        abilityTooltipHTML = `
                    <div class="equipment-tooltip">
                        <div class="tooltip-title">${ability.name}</div>
                        <div class="tooltip-desc">${ability.description}</div>
                        <div class="tooltip-stat">${ability.apCost} AP | ${ability.attacks} Angriff(e) | ${Math.floor(ability.damageMultiplier * 100)}% Schaden${fullHitInfo}</div>
                    </div>
                `;
      }

      abilitySlotsHTML += `
                <div class="equipment-slot ability-slot ${ability ? "filled" : "empty"}" data-slot="${i}">
                    <div class="item-icon-placeholder"></div>
                    <div class="item-info">
                        ${
                          ability
                            ? `
                            <div class="item-name">${ability.name}</div>
                            ${abilityStatsHTML}
                        `
                            : `<div class="item-name slot-label">Slot ${i + 1}</div>`
                        }
                    </div>
                    ${ability ? abilityTooltipHTML : ""}
                </div>
            `;
    }

    this.elements.sceneContent.innerHTML = `
            <div class="equipment-container">
                <h2>Ausrüstung</h2>
                <div class="equipment-slots-wrapper">
                    <div class="weapon-section">
                        <h3>Kampfausrüstung</h3>
                        ${weaponSlotHTML}
                        <div style="height: 15px;"></div> ${armorSlotHTML}
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
    document.getElementById("btn-back").addEventListener("click", () => {
      Game.showScreen("hideout");
    });

    document.getElementById("armor-slot").addEventListener("click", () => {
      this.openArmorModal();
    });

    // Waffen-Slot Click = Modal öffnen
    document.getElementById("weapon-slot").addEventListener("click", () => {
      this.openWeaponModal();
    });

    // Fähigkeiten-Slot Click = Modal öffnen
    document.querySelectorAll(".ability-slot").forEach((slot) => {
      slot.addEventListener("click", () => {
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
      .map((weaponInstance, index) => ({
        weaponInstance,
        weapon: Game.resolveWeapon(weaponInstance),
        index,
      }))
      .filter((data) => data.weapon !== null);

    let weaponsHTML = "";
    if (allWeapons.length === 0) {
      weaponsHTML = '<div class="no-items">Keine Waffen verfügbar</div>';
    } else {
      weaponsHTML = allWeapons
        .map((data) => {
          const isEquipped = data.index === equippedWeaponIndex;

          // Effekt-Anzeige
          let effectsHTML = "";
          if (
            data.weaponInstance.effects &&
            data.weaponInstance.effects.length > 0
          ) {
            effectsHTML = '<div class="weapon-effects">';
            data.weaponInstance.effects.forEach((effectId) => {
              const effect = Game.effects[effectId];
              if (effect) {
                effectsHTML += `<div class="effect-tag">${effect.name}</div>`;
              }
            });
            effectsHTML += "</div>";
          }

          return `
                    <div class="equipment-modal-item ${isEquipped ? "equipped" : ""}" data-weapon-index="${data.index}">
                        <div class="item-icon-placeholder"></div>
                        <div class="item-details">
                            <div class="item-name">${data.weapon.name}</div>
                            <div class="item-stats-row">
                                <span class="item-stats">Schaden: ${data.weapon.damage}</span>
                                ${effectsHTML}
                                ${isEquipped ? '<span class="equipped-label">Ausgerüstet</span>' : ""}
                            </div>
                        </div>
                    </div>
                `;
        })
        .join("");
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

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("equipment-modal");

    // Item auswählen
    modal
      .querySelectorAll(".equipment-modal-item:not(.equipped)")
      .forEach((item) => {
        item.addEventListener("click", () => {
          const weaponIndex = parseInt(item.dataset.weaponIndex);
          Game.equipWeapon(weaponIndex);
          modal.remove();
          this.showWeaponManagement();
        });
      });

    // Overlay Click = Close
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  },

  // Modal für Rüstungs-Auswahl
  openArmorModal() {
    const player = Game.state.player;
    // Sicherstellen, dass das Array existiert
    const armors = player.armors || [];
    const equippedIndex = player.equippedArmor;

    // Liste erstellen
    const allArmors = armors
      .map((inst, index) => ({
        instance: inst,
        armor: Game.resolveArmor(inst),
        index: index,
      }))
      .filter((d) => d.armor !== null);

    let listHTML = "";
    if (allArmors.length === 0) {
      listHTML = '<div class="no-items">Keine Rüstungen verfügbar</div>';
    } else {
      listHTML = allArmors
        .map((data) => {
          const isEquipped = data.index === equippedIndex;
          return `
            <div class="equipment-modal-item ${isEquipped ? "equipped" : ""}" data-armor-index="${data.index}">
                <div class="item-icon-placeholder"></div>
                <div class="item-details">
                    <div class="item-name">${data.armor.name}</div>
                    <div class="item-stats-row">
                        <span class="item-stats">Schutz: ${data.armor.value}</span>
                        ${isEquipped ? '<span class="equipped-label">Ausgerüstet</span>' : ""}
                    </div>
                </div>
            </div>
          `;
        })
        .join("");
    }

    // Modal HTML
    const modalHTML = `
            <div class="equipment-modal-overlay" id="equipment-modal">
                <div class="equipment-modal-content">
                    <h3>Rüstung wählen</h3>
                    <div class="equipment-modal-list">
                        ${listHTML}
                    </div>
                    <div class="popup-actions" style="margin-top: 20px;">
                        <button class="popup-btn close-btn" id="close-modal-btn">Schließen</button>
                    </div>
                </div>
            </div>
        `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("equipment-modal");

    // Click Listener für Items
    modal
      .querySelectorAll(".equipment-modal-item:not(.equipped)")
      .forEach((item) => {
        item.addEventListener("click", () => {
          const index = parseInt(item.dataset.armorIndex);
          Game.equipArmor(index);
          modal.remove();
          this.showWeaponManagement();
        });
      });

    // Schließen
    document
      .getElementById("close-modal-btn")
      .addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
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
      .map((abilityId, index) => ({
        ability: Game.abilities[abilityId],
        index,
      }))
      .filter((data) => data.ability !== null);

    if (allAbilities.length === 0) {
      abilitiesHTML +=
        '<div class="no-items">Keine weiteren Fähigkeiten verfügbar</div>';
    } else {
      abilitiesHTML += allAbilities
        .map((data) => {
          const isEquipped = player.equippedAbilities.includes(data.index);
          const hitInfo =
            data.ability.hitChance < 1.0
              ? ` | ${Math.floor(data.ability.hitChance * 100)}% Treffer`
              : "";

          return `
                    <div class="equipment-modal-item ${isEquipped ? "equipped" : ""}" data-ability-index="${data.index}">
                        <div class="item-icon-placeholder"></div>
                        <div class="item-details">
                            <div class="item-name">${data.ability.name}</div>
                            <div class="item-stats-row">
                                <span class="item-stats">${data.ability.apCost} AP | ${data.ability.attacks}x ${Math.floor(data.ability.damageMultiplier * 100)}%${hitInfo}</span>
                                ${isEquipped ? '<span class="equipped-label">Ausgerüstet</span>' : ""}
                            </div>
                        </div>
                    </div>
                `;
        })
        .join("");
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

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("equipment-modal");

    // "Leer"-Option
    const emptyOption = modal.querySelector(".empty-option");
    if (emptyOption) {
      emptyOption.addEventListener("click", () => {
        Game.unequipAbility(slotIndex);
        modal.remove();
        this.showWeaponManagement();
      });
    }

    // Item auswählen
    modal
      .querySelectorAll(
        ".equipment-modal-item:not(.equipped):not(.empty-option)",
      )
      .forEach((item) => {
        item.addEventListener("click", () => {
          const abilityIndex = parseInt(item.dataset.abilityIndex);
          Game.equipAbility(abilityIndex, slotIndex);
          modal.remove();
          this.showWeaponManagement();
        });
      });

    // Overlay Click = Close
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  },

  // Inventar anzeigen
  showInventory() {
    this.elements.visualArea.classList.remove("hideout-bg");
    // Stats Panel schließen falls offen
    this.statsVisible = false;
    const existingPanel =
      this.elements.visualArea.querySelector(".stats-panel");
    if (existingPanel) {
      existingPanel.classList.remove("visible");
    }

    const inventory = Game.state.player.inventory;

    let inventoryHTML = "";
    if (inventory.length === 0) {
      inventoryHTML = '<div class="no-items">Dein Inventar ist leer</div>';
    } else {
      inventoryHTML = inventory
        .map((item) => {
          const qtyBadge =
            item.quantity > 1
              ? `<span style="margin-left: auto; color: #fbbf24; font-weight: bold;">x${item.quantity}</span>`
              : "";

          return `
                    <div class="inventory-item-horizontal" data-item-id="${item.id}">
                        <div class="item-icon-placeholder"></div>
                        <div class="item-name" style="flex: 1; display: flex;">
                            ${item.name}${qtyBadge}
                        </div>
                    </div>
                `;
        })
        .join("");
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
    this.elements.buttonGrid.className = "button-grid hideout-grid";

    document.getElementById("btn-back").addEventListener("click", () => {
      this.showHideout();
    });

    // Click auf Items öffnet Details-Popup
    document
      .querySelectorAll(".inventory-item-horizontal")
      .forEach((itemEl) => {
        itemEl.addEventListener("click", () => {
          const itemId = itemEl.dataset.itemId;
          this.showItemDetailsPopup(itemId);
        });
      });
  },

  // Inventar während Crawl (gleich wie Hideout-Inventar, aber mit Zurück zu Crawl)
  showInventoryCrawl() {
    this.elements.visualArea.classList.remove("hideout-bg");
    // Stats Panel schließen falls offen
    this.statsVisible = false;
    const existingPanel =
      this.elements.visualArea.querySelector(".stats-panel");
    if (existingPanel) {
      existingPanel.classList.remove("visible");
    }

    const inventory = Game.state.player.inventory;
    let inventoryHTML = "";

    inventoryHTML = inventory
      .map((item) => {
        const qtyBadge =
          item.quantity > 1
            ? `<span style="margin-left: auto; color: #fbbf24; font-weight: bold;">x${item.quantity}</span>`
            : "";

        return `
            <div class="inventory-item-horizontal" data-item-id="${item.id}">
                <div class="item-icon-placeholder"></div>
                <div class="item-name" style="flex: 1; display: flex;">
                    ${item.name}${qtyBadge}
                </div>
            </div>
        `;
      })
      .join("");

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
    this.elements.buttonGrid.className = "button-grid";

    document.getElementById("btn-back").addEventListener("click", () => {
      this.showCrawlEventSelection();
    });

    // Click auf Items öffnet Details-Popup
    document
      .querySelectorAll(".inventory-item-horizontal")
      .forEach((itemEl) => {
        itemEl.addEventListener("click", () => {
          const itemId = itemEl.dataset.itemId;
          this.showItemDetailsPopupCrawl(itemId);
        });
      });
  },

  // Shop Screen anzeigen
  showShop() {
    this.elements.visualArea.classList.remove("hideout-bg");
    const merchants = Game.merchants;

    this.elements.sceneContent.innerHTML = `
            <div class="shop-container">
                <h2>Shop - Wähle einen Händler</h2>
                <div class="merchant-list">
                    ${Object.values(merchants)
                      .map(
                        (merchant) => `
                        <div class="merchant-card" data-merchant-id="${merchant.id}">
                            <div class="merchant-name">${merchant.name}</div>
                            <div class="merchant-description">${merchant.description}</div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `;

    this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
        `;
    this.elements.buttonGrid.className = "button-grid hideout-grid";

    document.getElementById("btn-back").addEventListener("click", () => {
      Game.showScreen("hideout");
    });

    // Event Listeners für Händler
    document.querySelectorAll(".merchant-card").forEach((card) => {
      card.addEventListener("click", () => {
        const merchantId = card.dataset.merchantId;
        this.showMerchantOffers(merchantId);
      });
    });
  },

  // Händler-Angebote anzeigen
  showMerchantOffers(merchantId, preserveSelection = null) {
    const merchant = Game.merchants[merchantId];
    if (!merchant) return;

    const player = Game.state.player;
    const glitzerCount = player.stats.glitzer;

    // Scroll-Position speichern
    let leftPanelScrollPos = 0;
    let rightPanelScrollPos = 0;
    const existingLeftPanel = document.querySelector(
      ".shop-left-panel .shop-item-list",
    );
    const existingRightPanel = document.querySelector(
      ".shop-right-panel .shop-item-list",
    );
    if (existingLeftPanel) leftPanelScrollPos = existingLeftPanel.scrollTop;
    if (existingRightPanel) rightPanelScrollPos = existingRightPanel.scrollTop;

    // --- LISTE DER VERKAUFBAREN DINGE ERSTELLEN (Waffen + Items) ---
    const sellableList = [];

    // 1. Waffen hinzufügen (nur nicht ausgerüstete)
    player.weapons.forEach((weaponInstance, index) => {
      // Überspringe ausgerüstete Waffe
      if (player.equippedWeapon === index) return;

      const weapon = Game.resolveWeapon(weaponInstance);
      const sellValue = weapon.glitzerValue || 0;

      if (sellValue > 0) {
        sellableList.push({
          type: "weapon",
          sourceIndex: index, // Index im weapons Array
          def: weapon, // Aufgelöste Waffe (Name, Stats...)
          data: weaponInstance,
          displayIndex: sellableList.length,
        });
      }
    });

    // 1.5. Rüstungen hinzufügen (nur nicht ausgerüstete)
    if (player.armors) {
      player.armors.forEach((armorInstance, index) => {
        // Überspringe ausgerüstete Rüstung
        if (player.equippedArmor === index) return;

        const armor = Game.resolveArmor(armorInstance);
        const sellValue = armor.glitzerValue || 0;

        if (sellValue > 0) {
          sellableList.push({
            type: "armor",
            sourceIndex: index, // Index im armors Array
            def: armor, // Aufgelöste Rüstung
            data: armorInstance,
            displayIndex: sellableList.length,
          });
        }
      });
    }

    // 2. Items hinzufügen
    player.inventory.forEach((item, inventoryIndex) => {
      const itemDef = Game.items[item.id];
      if (!itemDef) return;

      const sellValue = itemDef.glitzerValue || 0;
      if (sellValue <= 0) return;

      sellableList.push({
        type: "item",
        sourceIndex: inventoryIndex, // Index im inventory Array
        def: itemDef,
        data: item, // Hier steckt item.quantity drin, das wir später brauchen
        displayIndex: sellableList.length,
      });
    });

    // State für ausgewähltes Item
    let selectedType = preserveSelection ? preserveSelection.type : "buy"; // 'buy' oder 'sell'
    let selectedIndex = preserveSelection ? preserveSelection.index : 0;

    // Fallback: Wenn Liste leer/kleiner geworden ist
    if (selectedType === "sell" && sellableList.length === 0) {
      selectedType = "buy";
      selectedIndex = 0;
    } else if (
      selectedType === "sell" &&
      selectedIndex >= sellableList.length
    ) {
      selectedIndex = Math.max(0, sellableList.length - 1);
    }

    // --- RENDERING LINKE SEITE (VERKAUFEN) ---
    let sellListHTML = "";
    if (sellableList.length === 0) {
      sellListHTML = '<div class="no-items">Nichts zu verkaufen</div>';
    } else {
      sellListHTML = '<div class="shop-item-list">';
      sellableList.forEach((entry) => {
        const isSelected =
          selectedType === "sell" && selectedIndex === entry.displayIndex;
        const sellValue = entry.def.glitzerValue || 0;

        // 1. Effekt-Badges für Waffen (bleibt wie vorher)
        let effectsHTML = "";
        if (
          entry.type === "weapon" &&
          entry.data.effects &&
          entry.data.effects.length > 0
        ) {
          effectsHTML = '<div class="weapon-effects-compact">';
          entry.data.effects.forEach((effectId) => {
            const effect = Game.effects[effectId];
            if (effect) {
              effectsHTML += `<span class="effect-badge">${effect.name}</span>`;
            }
          });
          effectsHTML += "</div>";
        }
        let qtyBadge = "";
        if (entry.type === "item" && entry.data.quantity > 1) {
          // Einfach nur Text mit kleinem Abstand
          qtyBadge = `<span style="margin-right: auto; margin-left: 10px; color: #fbbf24;">x${entry.data.quantity}</span>`;
        }

        // 3. HTML zusammenbauen
        sellListHTML += `
                    <div class="shop-item-card ${isSelected ? "selected" : ""}" data-type="sell" data-index="${entry.displayIndex}">
                        <div class="item-icon-placeholder"></div>
                        <div class="shop-item-info">
                            <div class="item-name ${entry.type === "weapon" && entry.data.effects.length > 0 ? "weapon-with-effects" : ""}" style="flex: 1; display: flex;">
                                ${entry.def.name}${qtyBadge}
                            </div>
                            ${effectsHTML}
                            <div class="item-value">${sellValue} G</div>
                        </div>
                    </div>
                `;
      });
      sellListHTML += "</div>";
    }

    // --- RENDERING RECHTE SEITE (KAUFEN) ---
    let buyOffersHTML = '<div class="shop-item-list">';
    merchant.offers.forEach((offer, index) => {
      let item =
        Game.items[offer.itemId] ||
        Game.weaponBases[offer.itemId] ||
        Definitions.armorBases[offer.itemId];
      if (!item) return;
      const isSelected = selectedType === "buy" && selectedIndex === index;

      buyOffersHTML += `
                <div class="shop-item-card ${isSelected ? "selected" : ""}" data-type="buy" data-index="${index}">
                    <div class="item-icon-placeholder"></div>
                    <div class="shop-item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-value">${offer.price} G</div>
                    </div>
                </div>
            `;
    });
    buyOffersHTML += "</div>";

    this.elements.sceneContent.innerHTML = `
            <div class="shop-split-container">
                <div class="shop-left-panel">
                    <h3>Verkaufen</h3>
                    <div class="glitzer-display">Dein Glitzer: ${glitzerCount}</div>
                    ${sellListHTML}
                </div>
                <div class="shop-right-panel">
                    <h3>${merchant.name} - Shop</h3>
                    ${buyOffersHTML}
                </div>
            </div>
        `;

    // Action Area rendern
    this.renderShopActionArea(
      merchantId,
      selectedType,
      selectedIndex,
      sellableList,
    );

    // Scroll-Position wiederherstellen
    requestAnimationFrame(() => {
      const leftPanel = document.querySelector(
        ".shop-left-panel .shop-item-list",
      );
      const rightPanel = document.querySelector(
        ".shop-right-panel .shop-item-list",
      );
      if (leftPanel && leftPanelScrollPos > 0)
        leftPanel.scrollTop = leftPanelScrollPos;
      if (rightPanel && rightPanelScrollPos > 0)
        rightPanel.scrollTop = rightPanelScrollPos;
    });

    // Event Listeners für Item-Auswahl
    document.querySelectorAll(".shop-item-card").forEach((card) => {
      card.addEventListener("click", () => {
        const type = card.dataset.type;
        const index = parseInt(card.dataset.index);

        // Visuelle Auswahl
        document
          .querySelectorAll(".shop-item-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");

        // Action Area aktualisieren
        this.renderShopActionArea(merchantId, type, index, sellableList);
      });
    });
  },

  // Action Area (Kaufen/Verkaufen Details & Button)
  renderShopActionArea(merchantId, type, index, sellableList = null) {
    const merchant = Game.merchants[merchantId];
    const player = Game.state.player;
    const glitzerCount = player.stats.glitzer;

    let itemHTML = "";

    // --- VERKAUFEN (HTML GENERIERUNG) ---
    if (type === "sell") {
      const entry = sellableList[index];

      if (!entry) {
        this.elements.buttonGrid.innerHTML = `<button class="game-button shop-back-btn" id="btn-back-shop">Zurück</button>`;
        document
          .getElementById("btn-back-shop")
          .addEventListener("click", () => this.showShop());
        return;
      }

      const isWeapon = entry.type === "weapon";
      const name = entry.def.name;
      const description = entry.def.description;
      const sellValue = entry.def.glitzerValue || 0;

      // Wir berechnen hier die Gruppen-Infos für die Anzeige (optional, aber sauber)
      // Wichtig wird es gleich unten im Event-Teil
      itemHTML = `
                <div class="shop-action-details">
                    <div class="shop-action-item">
                        <div class="item-icon-placeholder-large"></div>
                        <div class="shop-action-info">
                            <div class="shop-action-name ${isWeapon && entry.data.effects.length > 0 ? "weapon-with-effects" : ""}">${name}</div>
                            <div class="shop-action-description">${description}</div>
                        </div>
                    </div>
                    <div class="shop-action-controls">
                        <div class="shop-action-price" id="shop-total-price">${sellValue} G</div>
                        <div class="shop-quantity-controls" style="${isWeapon || entry.type === "armor" ? "visibility: hidden;" : ""}">                            <button class="quantity-btn" id="shop-minus">-</button>
                            <span class="quantity-display" id="shop-quantity">1</span>
                            <button class="quantity-btn" id="shop-plus">+</button>
                        </div>
                        <button class="shop-action-btn sell-btn" id="shop-action-btn">Verkaufen</button>
                    </div>
                </div>
            `;

      // --- KAUFEN (HTML GENERIERUNG) ---
    } else if (type === "buy") {
      const offer = merchant.offers[index];
      if (!offer) {
        this.elements.buttonGrid.innerHTML = `<button class="game-button shop-back-btn" id="btn-back-shop">Zurück</button>`;
        document
          .getElementById("btn-back-shop")
          .addEventListener("click", () => this.showShop());
        return;
      }

      let item =
        Game.items[offer.itemId] ||
        Game.weaponBases[offer.itemId] ||
        Definitions.armorBases[offer.itemId];
      const canAfford = glitzerCount >= offer.price;

      itemHTML = `
                <div class="shop-action-details">
                    <div class="shop-action-item">
                        <div class="item-icon-placeholder-large"></div>
                        <div class="shop-action-info">
                            <div class="shop-action-name">${item.name}</div>
                            <div class="shop-action-description">${item.description}</div>
                        </div>
                    </div>
                    <div class="shop-action-controls">
                        <div class="shop-action-price" id="shop-total-price">${offer.price} G</div>
                        <div class="shop-quantity-controls">
                            <button class="quantity-btn" id="shop-minus">-</button>
                            <span class="quantity-display" id="shop-quantity">1</span>
                            <button class="quantity-btn" id="shop-plus">+</button>
                        </div>
                        <button class="shop-action-btn buy-btn ${!canAfford ? "disabled" : ""}" id="shop-action-btn" ${!canAfford ? "disabled" : ""}>Kaufen</button>
                    </div>
                </div>
            `;
    }

    // HTML setzen
    this.elements.buttonGrid.className = "button-grid shop-grid";
    this.elements.buttonGrid.innerHTML = `
            <button class="game-button shop-back-btn" id="btn-back-shop">Zurück</button>
            ${itemHTML}
        `;

    // Event Listener: Zurück
    document.getElementById("btn-back-shop").addEventListener("click", () => {
      this.showShop();
    });

    // LOGIK FÜR BUTTONS (Plus, Minus, Aktion)
    let quantity = 1;
    const quantityDisplay = document.getElementById("shop-quantity");
    const priceDisplay = document.getElementById("shop-total-price");
    const minusBtn = document.getElementById("shop-minus");
    const plusBtn = document.getElementById("shop-plus");
    const actionBtn = document.getElementById("shop-action-btn");

    // --- VERKAUFEN LOGIK ---
    if (type === "sell") {
      const entry = sellableList[index];
      const isWeapon = entry.type === "weapon";
      const sellValue = entry.def.glitzerValue || 0;

      const maxQuantity =
        isWeapon || entry.type === "armor" ? 1 : entry.data.quantity || 1;

      minusBtn.addEventListener("click", (e) => {
        const step = e.shiftKey ? 10 : 1;

        if (quantity > 1) {
          quantity = Math.max(1, quantity - step);
          quantityDisplay.textContent = quantity;
          priceDisplay.textContent = `${sellValue * quantity} G`;
        }
      });

      plusBtn.addEventListener("click", (e) => {
        const step = e.shiftKey ? 10 : 1;

        if (quantity < maxQuantity) {
          quantity = Math.min(maxQuantity, quantity + step);
          quantityDisplay.textContent = quantity;
          priceDisplay.textContent = `${sellValue * quantity} G`;
        }
      });

      actionBtn.addEventListener("click", () => {
        let success = false;

        // UNTERSCHEIDUNG: Waffe vs. Rüstung vs. Item
        if (entry.type === "weapon") {
          success = Game.sellWeapon(entry.sourceIndex);
        } else if (entry.type === "armor") {
          // Hier wird explizit die Rüstungs-Verkaufsfunktion aufgerufen
          success = Game.sellArmor(entry.sourceIndex);
        } else {
          // Alles andere ist ein normales Item (Tränke, Mats etc.)
          success = Game.sellItem(entry.sourceIndex, quantity);
        }

        if (success) {
          // Liste neu laden. Wir behalten den Index bei.
          this.showMerchantOffers(merchantId, {
            type: "sell",
            index: index,
          });
        }
      });

      // --- KAUFEN LOGIK ---
    } else if (type === "buy") {
      const offer = merchant.offers[index];
      const updateBuyButton = () => {
        const totalPrice = offer.price * quantity;
        priceDisplay.textContent = `${totalPrice} G`;

        if (glitzerCount >= totalPrice) {
          actionBtn.disabled = false;
          actionBtn.classList.remove("disabled");
        } else {
          actionBtn.disabled = true;
          actionBtn.classList.add("disabled");
        }
      };

      minusBtn.addEventListener("click", (e) => {
        const step = e.shiftKey ? 10 : 1;

        if (quantity > 1) {
          quantity = Math.max(1, quantity - step);
          quantityDisplay.textContent = quantity;
          updateBuyButton();
        }
      });

      plusBtn.addEventListener("click", (e) => {
        const step = e.shiftKey ? 10 : 1;

        const maxAffordable = Math.floor(glitzerCount / offer.price);
        const hardLimit = 9999;
        const limit = Math.max(
          1,
          Math.min(hardLimit, maxAffordable > 0 ? maxAffordable : hardLimit),
        );

        if (quantity < limit) {
          quantity = Math.min(limit, quantity + step);
          quantityDisplay.textContent = quantity;
          updateBuyButton();
        }
      });

      actionBtn.addEventListener("click", () => {
        if (actionBtn.disabled) return;
        const success = Game.buyItem(merchantId, index, quantity);
        if (success) {
          this.showMerchantOffers(merchantId, { type: "buy", index: index });
        }
      });
    }
  },

  // Boss-Welten Screen anzeigen
  showBossSelection() {
    this.elements.visualArea.classList.remove("hideout-bg");
    // Stats Panel schließen
    this.statsVisible = false;
    const existingPanel =
      this.elements.visualArea.querySelector(".stats-panel");
    if (existingPanel) {
      existingPanel.classList.remove("visible");
    }

    const bossWorlds = Game.bossWorlds;

    this.elements.sceneContent.innerHTML = `
            <div class="boss-selection">
                <h2>Wähle eine Welt</h2>
                <div class="world-selection">
                    ${Object.values(bossWorlds)
                      .map((world) => {
                        const boss = Game.bosses[world.boss];
                        const isUnlocked = Game.isWorldUnlocked(world.id);
                        const lockClass = isUnlocked ? "" : "locked";
                        const desc = isUnlocked
                          ? world.description
                          : "Gesperrt";

                        return `
                            <div class="world-card boss-world-card ${lockClass}" data-world-id="${world.id}">
                                <div class="world-name">${world.name}</div>
                                <div class="world-desc">${desc}</div>
                                <div class="boss-info-preview">
                                    <span>Boss: ${boss.name}</span>
                                    <span class="boss-hp-preview">HP: ${boss.hp}</span>
                                </div>
                            </div>
                        `;
                      })
                      .join("")}
                </div>
            </div>
        `;

    this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
        `;
    this.elements.buttonGrid.className = "button-grid single-button";

    document.getElementById("btn-back").addEventListener("click", () => {
      Game.showScreen("hideout");
    });

    // Event Listeners für Boss-Welten
    document.querySelectorAll(".boss-world-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (card.classList.contains("locked")) return;

        const worldId = card.dataset.worldId;

        this.showCrawlConfirmation(worldId);
      });
    });
  },

  // Boss-Crawl Bestätigungs-Popup
  showCrawlConfirmation(worldId) {
    const world = Game.bossWorlds[worldId];
    if (!world) return;

    // Overlay HTML (Wiederverwendung der existierenden Popup-Klassen)
    const overlayHTML = `
            <div class="item-details-overlay" id="crawl-confirmation-overlay">
                <div class="item-details-popup">
                    <div class="popup-header">
                        <h3>${world.name} betreten?</h3>
                    </div>
                    <div class="popup-content">
                        <div class="item-description" style="text-align: center; margin-bottom: 20px;">
                            Möchtest du diese Welt wirklich betreten?<br>
                        </div>
                    </div>
                    <div class="popup-actions" style="justify-content: center; gap: 20px;">
                        <button class="popup-btn use-btn" id="confirm-crawl-btn">Betreten</button>
                        <button class="popup-btn close-btn" id="cancel-crawl-btn">Abbrechen</button>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", overlayHTML);

    const overlay = document.getElementById("crawl-confirmation-overlay");
    const confirmBtn = document.getElementById("confirm-crawl-btn");
    const cancelBtn = document.getElementById("cancel-crawl-btn");

    const closePopup = () => {
      overlay.remove();
    };

    // Event Listeners
    confirmBtn.addEventListener("click", () => {
      closePopup();
      // Hier startet der eigentliche Crawl erst nach Bestätigung
      Game.startCrawl(worldId);
    });

    cancelBtn.addEventListener("click", closePopup);

    // Klick auf Hintergrund schließt auch
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closePopup();
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
    console.log(
      "Sicherheit:",
      crawl.security + "%",
      "| Chaoslevel:",
      crawl.chaosLevel,
    );

    this.elements.visualArea.classList.remove("hideout-bg");
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
                        ${crawl.availableEvents
                          .map(
                            (event, index) => `
                            <div class="event-card" data-event-index="${index}">
                                <div class="event-header">
                                    <span class="event-name">${event.name}</span>
                                </div>
                                <div class="event-description">${event.description}</div>
                                <div class="event-footer">
                                    <span class="security-impact">Sicherheit: -${event.securityDecrease}%</span>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            </div>
        `;

    this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-inventory-crawl">Inventar</button>
        `;
    this.elements.buttonGrid.className = "button-grid single-button";

    // Inventar-Button
    document
      .getElementById("btn-inventory-crawl")
      .addEventListener("click", () => {
        this.showInventoryCrawl();
      });

    // Event Listeners für Event-Karten
    document.querySelectorAll(".event-card").forEach((card) => {
      card.addEventListener("click", () => {
        const eventIndex = parseInt(card.dataset.eventIndex);
        card.classList.add("selected");
        // Alle anderen Karten deaktivieren
        document.querySelectorAll(".event-card").forEach((c) => {
          if (c !== card) c.style.opacity = "0.5";
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
    this.elements.visualArea.classList.remove("hideout-bg");
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
                    ${event.description
                      .split("\n")
                      .map((line) => `<p>${line}</p>`)
                      .join("")}
                </div>
                <div class="choice-event-options">
                    <h3>Was möchtest du tun?</h3>
                    <div class="choice-buttons">
                        ${event.choices
                          .map(
                            (choice, index) => `
                            <button class="choice-button game-button" data-choice-index="${index}">
                                ${choice.text}
                            </button>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            </div>
        `;

    this.elements.buttonGrid.innerHTML = "";

    // Choice Button Listeners
    document.querySelectorAll(".choice-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const choiceIndex = parseInt(btn.dataset.choiceIndex);
        btn.classList.add("selected");
        // Alle anderen Buttons deaktivieren
        document.querySelectorAll(".choice-button").forEach((b) => {
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
    this.elements.visualArea.classList.remove("hideout-bg");
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
    let enemyDisplay = "";
    if (isEnemyBattle) {
      enemyDisplay = `
                <div class="battle-enemies">
                    ${battle.enemies
                      .map((enemy, index) => {
                        const isDefeated = enemy.defeated || enemy.hp <= 0;
                        const isSelected =
                          battle.selectedTarget === index && !isDefeated;

                        // Status-Effekte auslesen
                        let statusDisplay = "";
                        if (
                          enemy.statusEffects &&
                          enemy.statusEffects.length > 0
                        ) {
                          const poisonEffect = enemy.statusEffects.find(
                            (se) => se.type === "poison",
                          );
                          if (poisonEffect && poisonEffect.stacks > 0) {
                            statusDisplay = `<div class="status-effects">🧪 ${poisonEffect.stacks}</div>`;
                          }
                        }

                        return `
                            <div class="battle-enemy-card ${isSelected ? "selected" : ""} ${isDefeated ? "defeated" : ""}" data-enemy-index="${index}">
                                <div class="enemy-sprite red-square">
                                    <div class="enemy-hp">${enemy.hp}</div>
                                    ${statusDisplay}
                                </div>
                                <div class="enemy-name">${enemy.name}</div>
                            </div>
                        `;
                      })
                      .join("")}
                </div>
            `;
    } else {
      // Bei Boss-Kämpfen: Einzelner Boss
      // Status-Effekte auslesen
      let statusDisplay = "";
      if (boss.statusEffects && boss.statusEffects.length > 0) {
        const poisonEffect = boss.statusEffects.find(
          (se) => se.type === "poison",
        );
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
    this.createOrUpdateEnemyWindow(
      isEnemyBattle ? battle.enemies : [boss],
      isEnemyBattle,
      battle,
    );

    // Battle-Log-Fenster erstellen/updaten
    this.createOrUpdateBattleLogWindow(allLogs);

    // Control-Fenster erstellen/updaten
    this.createOrUpdateControlWindow();

    // ÄNDERUNG: Ability Window IMMER updaten (auch im Gegner-Zug), damit es ausgegraut werden kann
    this.createOrUpdateAbilityWindow();

    // Stats und Inventar automatisch öffnen wenn sie im vorherigen Kampf offen waren
    const windowVisibility = JSON.parse(
      localStorage.getItem("windowVisibility") || "{}",
    );
    if (
      windowVisibility["stats-panel-window"] &&
      !document.getElementById("stats-panel-window")
    ) {
      this.toggleStatsPanel();
    }

    this.updateStatsWindow();

    if (
      windowVisibility["inventory-window"] &&
      !document.getElementById("inventory-window")
    ) {
      this.createOrUpdateInventoryWindow();
    }

    // Target-Auswahl für Gegner-Kämpfe
    if (isEnemyBattle && battle.turn === "player") {
      document.querySelectorAll(".battle-enemy-card").forEach((card) => {
        card.addEventListener("click", () => {
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
    if (battle.turn === "player") {
      // Toggle-Button States im Control-Window aktualisieren
      const controlWindow = document.getElementById("control-window");
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
    const armors = Game.state.player.armors || []; // NEU: Rüstungen holen
    const items = Game.state.player.inventory;

    // 1. Verkaufbare Waffen filtern
    const sellableWeapons = weapons
      .map((weaponInstance, index) => {
        const weapon = Game.resolveWeapon(weaponInstance);
        return {
          type: "weapon",
          index: index,
          weaponInstance: weaponInstance,
          weapon: weapon,
          isEquipped: Game.state.player.equippedWeapon === index,
        };
      })
      .filter(
        (w) => !w.isEquipped && w.weapon && (w.weapon.glitzerValue || 0) > 0,
      );

    // 2. NEU: Verkaufbare Rüstungen filtern
    const sellableArmors = armors
      .map((armorInstance, index) => {
        const armor = Game.resolveArmor(armorInstance);
        return {
          type: "armor",
          index: index,
          armorInstance: armorInstance,
          armor: armor,
          isEquipped: Game.state.player.equippedArmor === index,
        };
      })
      .filter(
        (a) => !a.isEquipped && a.armor && (a.armor.glitzerValue || 0) > 0,
      );

    // 3. Verkaufbare Items filtern
    const sellableItems = items.filter((item) => {
      const itemDef = Game.items[item.id];
      return itemDef && (itemDef.glitzerValue || 0) > 0;
    });

    const nothingToSell =
      sellableWeapons.length === 0 &&
      sellableArmors.length === 0 &&
      sellableItems.length === 0;

    this.elements.sceneContent.innerHTML = `
            <div class="inventory-container">
                <h2>${merchant.name} - Verkaufen</h2>
                <div class="glitzer-display">Glitzer: ${Game.state.player.stats.glitzer}</div>
                <div class="items-list">
                    ${nothingToSell ? '<p class="no-items">Keine verkaufbaren Items</p>' : ""}
                    
                    ${sellableWeapons
                      .map((data) => {
                        let effectsHTML = "";
                        if (
                          data.weaponInstance.effects &&
                          data.weaponInstance.effects.length > 0
                        ) {
                          effectsHTML = '<div class="weapon-effects-compact">';
                          data.weaponInstance.effects.forEach((effectId) => {
                            const effect = Game.effects[effectId];
                            if (effect)
                              effectsHTML += `<span class="effect-badge">${effect.name}</span>`;
                          });
                          effectsHTML += "</div>";
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
                      })
                      .join("")}

                    ${sellableArmors
                      .map((data) => {
                        return `
                            <div class="sellable-item-card" data-type="armor" data-index="${data.index}">
                                <div class="item-header">
                                    <span class="item-name">${data.armor.name}</span>
                                    <span class="item-price">+${data.armor.glitzerValue || 0} Glitzer</span>
                                </div>
                                <div class="item-description">${data.armor.description}</div>
                                <div class="item-description" style="color: #aaa; font-size: 0.8em;">Schutz: ${data.armor.value}</div>
                                <button class="sell-btn">Verkaufen</button>
                            </div>
                        `;
                      })
                      .join("")}

                    ${sellableItems
                      .map((item) => {
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
                      })
                      .join("")}
                </div>
            </div>
        `;

    this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back-merchant">Zurück</button>
        `;

    document
      .getElementById("btn-back-merchant")
      .addEventListener("click", () => {
        this.showMerchantOffers(merchantId);
      });

    // Event Listener für alle Verkaufs-Buttons
    document.querySelectorAll(".sellable-item-card").forEach((card) => {
      const sellBtn = card.querySelector(".sell-btn");
      sellBtn.addEventListener("click", () => {
        const type = card.dataset.type;

        if (type === "weapon") {
          const index = parseInt(card.dataset.index);
          if (Game.sellWeapon(index)) this.showSellInventory(merchantId);
        } else if (type === "armor") {
          // NEU: Rüstung verkaufen
          const index = parseInt(card.dataset.index);
          if (Game.sellArmor(index)) this.showSellInventory(merchantId);
        } else if (type === "item") {
          const itemId = card.dataset.itemId;
          if (Game.sellItem(itemId)) this.showSellInventory(merchantId);
        }
      });
    });
  },

  // Inventar für nutzbare Items anzeigen
  showInventoryUsable(returnContext) {
    const inventory = Game.state.player.inventory;
    const usableItems = inventory.filter((item) => {
      const itemDef = Game.items[item.id];
      return itemDef && itemDef.type === "consumable";
    });

    this.elements.sceneContent.innerHTML = `
            <div class="inventory-container">
                <h2>Inventar - Nutzbare Items</h2>
                <div class="items-list">
                    ${
                      usableItems.length > 0
                        ? usableItems
                            .map((item) => {
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
                            })
                            .join("")
                        : '<p class="no-items">Keine nutzbaren Items im Inventar</p>'
                    }
                </div>
            </div>
        `;

    this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back-inventory">Zurück</button>
        `;

    // Zurück-Button
    document
      .getElementById("btn-back-inventory")
      .addEventListener("click", () => {
        if (returnContext === "battle") {
          this.updateBattleScreen();
        } else if (returnContext === "crawl") {
          this.showCrawlEventSelection();
        } else if (returnContext === "hideout") {
          this.showHideout();
        }
      });

    // Nutzen-Buttons
    document.querySelectorAll(".usable-item-card").forEach((card) => {
      const useBtn = card.querySelector(".use-btn");
      useBtn.addEventListener("click", () => {
        const itemId = card.dataset.itemId;
        const healed = Game.useItem(itemId);

        if (healed !== false) {
          // Item wurde genutzt, Inventar neu laden
          this.showInventoryUsable(returnContext);

          // Bei Kampf auch Battle-Screen aktualisieren
          if (returnContext === "battle") {
            // HP-Änderung ins Battle-Log schreiben
            if (Game.state.currentBattle && healed > 0) {
              Game.state.currentBattle.log.push(
                `Heiltrank genutzt! +${healed} HP`,
              );
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
        selectedItems: Array(6).fill(null), // 6 feste Slots
      };
    }

    const ritual = Game.state.currentRitual;
    // NEU: Prüfen, ob ein gespeichertes Rezept vorhanden ist
    const hasLastRitual = !!Game.state.lastRitualItems;

    this.elements.visualArea.classList.remove("hideout-bg");
    this.elements.sceneContent.innerHTML = `
            <div class="ritual-container">
                <h2>Das Ritual</h2>
                <p class="ritual-description">Wähle exakt 6 Ritual-Items aus deinem Inventar, um eine Waffe zu erschaffen.</p>
                
                <div class="ritual-slots-wrapper">
                    <div class="ritual-slot-grid">
                        ${Array.from({ length: 6 }, (_, i) => {
                          const itemId = ritual.selectedItems[i];
                          if (itemId) {
                            const itemDef = Game.items[itemId];
                            return `
                                    <div class="ritual-slot filled" data-slot="${i}">
                                        <div class="item-icon-placeholder"></div>
                                        <div class="item-name">${itemDef.name}</div>
                                    </div>
                                `;
                          } else {
                            return `
                                    <div class="ritual-slot empty" data-slot="${i}">
                                        <div class="item-icon-placeholder empty-icon"></div>
                                    </div>
                                `;
                          }
                        }).join("")}
                    </div>
                </div>
            </div>
        `;

    // NEU: Den Button "Wiederholen" im Grid hinzufügen
    this.elements.buttonGrid.innerHTML = `
            <button class="game-button" id="btn-back">Zurück</button>
            <button class="game-button ${hasLastRitual ? "" : "disabled"}" id="btn-repeat-ritual" ${hasLastRitual ? "" : "disabled"}>Wiederholen</button>
            <button class="game-button ${ritual.selectedItems.filter((id) => id !== null).length === 6 ? "" : "disabled"}" id="btn-perform-ritual" ${ritual.selectedItems.filter((id) => id !== null).length === 6 ? "" : "disabled"}>Ritual durchführen</button>
        `;

    this.elements.buttonGrid.className = "button-grid hideout-grid";

    // Event Listeners
    document.getElementById("btn-back").addEventListener("click", () => {
      Game.state.currentRitual = null;
      Game.save();
      this.showHideout();
    });

    // NEU: Event Listener für die Wiederholung
    document
      .getElementById("btn-repeat-ritual")
      .addEventListener("click", () => {
        if (Game.fillLastRitual()) {
          // UI neu laden, um die befüllten Slots anzuzeigen
          this.showRitualSelection();
        } else {
          // Feedback, falls Items fehlen (optional)
          console.log("Nicht genug Materialien für eine Wiederholung!");
        }
      });

    document
      .getElementById("btn-perform-ritual")
      .addEventListener("click", () => {
        if (ritual.selectedItems.filter((id) => id !== null).length === 6) {
          Game.performRitual();
        }
      });

    // Slot click - öffnet Modal
    document.querySelectorAll(".ritual-slot").forEach((slot) => {
      slot.addEventListener("click", (e) => {
        const slotIndex = parseInt(slot.dataset.slot);
        this.openRitualItemModal(slotIndex);
      });
    });
  },

  // Modal für Item-Auswahl öffnen
  openRitualItemModal(slotIndex) {
    const ritual = Game.state.currentRitual;
    const inventory = Game.state.player.inventory;

    // 1. Zähle, welche Items bereits in ANDEREN Slots liegen
    const selectedItemCounts = {};
    ritual.selectedItems.forEach((itemId, idx) => {
      // Ignoriere den aktuellen Slot (falls wir ihn ändern wollen)
      if (itemId !== null && idx !== slotIndex) {
        selectedItemCounts[itemId] = (selectedItemCounts[itemId] || 0) + 1;
      }
    });

    // 2. Erstelle Liste der verfügbaren Ritual-Items (mit korrekter Restmenge)
    const availableItems = inventory
      .filter((item) => {
        const itemDef = Game.items[item.id];
        return itemDef && itemDef.type === "ritual";
      })
      .map((item) => {
        // Berechne verfügbare Menge: Gesamt - BereitsVerwendet
        const usedCount = selectedItemCounts[item.id] || 0;
        const availableCount = (item.quantity || 1) - usedCount;

        // Gib das Item-Objekt zurück, aber mit der temporären "availableCount" Eigenschaft
        return { ...item, availableCount: availableCount };
      })
      .filter((item) => item.availableCount > 0); // Nur anzeigen, wenn noch was da ist

    // 3. HTML Generierung (Exakt wie im normalen Inventar)
    let itemsHTML = "";
    if (availableItems.length === 0) {
      itemsHTML = '<div class="no-items">Keine Ritual-Items verfügbar</div>';
    } else {
      itemsHTML = availableItems
        .map((item) => {
          // Style: Gelb, Fett, Rechtsbündig, Zentriert (wie Shop/Inventar)
          const qtyBadge =
            item.availableCount > 1
              ? `<span style="margin-left: auto; color: #fbbf24; font-weight: bold; white-space: nowrap; flex-shrink: 0;">x${item.availableCount}</span>`
              : "";

          return `
            <div class="inventory-item-horizontal ritual-selection-item" data-item-id="${item.id}">
                <div class="item-icon-placeholder"></div>
                <div class="item-name" style="flex: 1; display: flex; align-items: center;">
                    ${item.name}${qtyBadge}
                </div>
            </div>
        `;
        })
        .join("");
    }

    // Modal HTML - nutzt jetzt "inventory-grid-container" statt der alten Liste
    // Breite angepasst auf das Grid
    const modalHTML = `
            <div class="ritual-modal-overlay" id="ritual-modal">
                <div class="ritual-modal-content" style="width: 550px; max-width: 95%;">
                    <h3>Wähle ein Ritual-Item</h3>
                    
                    <div class="inventory-grid-container" style="max-height: 400px; grid-template-columns: repeat(1, 1fr);">
                        ${itemsHTML}
                    </div>
                    
                    <div class="popup-actions" style="margin-top: 20px;">
                        <button class="popup-btn close-btn" id="close-ritual-btn">Abbrechen</button>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("ritual-modal");

    // Item auswählen
    modal.querySelectorAll(".ritual-selection-item").forEach((itemEl) => {
      itemEl.addEventListener("click", () => {
        const itemId = itemEl.dataset.itemId;
        ritual.selectedItems[slotIndex] = itemId;
        Game.save();
        modal.remove();
        this.showRitualSelection();
      });
    });

    // Schließen Button
    document
      .getElementById("close-ritual-btn")
      .addEventListener("click", () => {
        modal.remove();
      });

    // Overlay click zum Schließen
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  },

  // ===== DRAGGABLE WINDOW HELPERS =====

  // Gegner-Fenster erstellen/updaten
  createOrUpdateEnemyWindow(enemies, isEnemyBattle, battle) {
    let existingWindow = document.getElementById("enemy-window");

    // Prüfe ob Fenster sichtbar sein soll
    const windowVisibility = JSON.parse(
      localStorage.getItem("windowVisibility") || "{}",
    );
    // Beim ersten Aufruf (kein Eintrag in localStorage) soll das Fenster erstellt werden
    const shouldBeVisible = windowVisibility["enemy-window"] !== false;
    if (!existingWindow && !shouldBeVisible) {
      return; // Nicht erstellen wenn explizit ausgeblendet
    }

    let enemyContent = "";
    if (isEnemyBattle) {
      enemyContent = `
                <div class="battle-enemies">
                    ${enemies
                      .map((enemy, index) => {
                        const isDefeated = enemy.defeated || enemy.hp <= 0;
                        const isSelected =
                          battle.selectedTarget === index && !isDefeated;

                        let statusDisplay = "";
                        if (
                          enemy.statusEffects &&
                          enemy.statusEffects.length > 0
                        ) {
                          const poisonEffect = enemy.statusEffects.find(
                            (se) => se.type === "poison",
                          );
                          if (poisonEffect && poisonEffect.stacks > 0) {
                            statusDisplay = `<div class="status-effects">🧪 ${poisonEffect.stacks}</div>`;
                          }
                        }

                        return `
                            <div class="battle-enemy-card ${isSelected ? "selected" : ""} ${isDefeated ? "defeated" : ""}" data-enemy-index="${index}">
                                <div class="enemy-sprite red-square">
                                    <div class="enemy-hp">${enemy.hp}</div>
                                    ${statusDisplay}
                                </div>
                                <div class="enemy-name">${enemy.name}</div>
                            </div>
                        `;
                      })
                      .join("")}
                </div>
            `;
    } else {
      const boss = enemies[0];
      let statusDisplay = "";
      if (boss.statusEffects && boss.statusEffects.length > 0) {
        const poisonEffect = boss.statusEffects.find(
          (se) => se.type === "poison",
        );
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
      const title = isEnemyBattle ? "Gegner" : "Boss";
      existingWindow.querySelector(".window-content").innerHTML = `
                <div class="window-title">${title}</div>
                ${enemyContent}
            `;
    } else {
      // Create new window
      const windowHTML = `
                <div id="enemy-window" class="draggable-window" data-window-id="enemy-window" data-window-title="${isEnemyBattle ? "Gegner" : "Boss"}" style="left: 100px; top: 50px;">
                    <div class="window-minimize-btn">−</div>
                    <div class="window-drag-handle"></div>
                    <div class="window-content">
                        <div class="window-title">${isEnemyBattle ? "Gegner" : "Boss"}</div>
                        ${enemyContent}
                    </div>
                </div>
            `;
      document.body.insertAdjacentHTML("beforeend", windowHTML);
      const newWindow = document.getElementById("enemy-window");

      // Zentriere horizontal nach dem Erstellen
      const rect = newWindow.getBoundingClientRect();
      const centerX = (window.innerWidth - rect.width) / 2;
      newWindow.style.left = centerX + "px";

      DraggableManager.makeWindowDraggable(newWindow, "enemy-window");
    }
  },

  // Battle-Log-Fenster erstellen/updaten
  createOrUpdateBattleLogWindow(logs) {
    let existingWindow = document.getElementById("battle-log-window");

    // Prüfe ob Fenster sichtbar sein soll (standardmäßig ausgeblendet)
    const windowVisibility = JSON.parse(
      localStorage.getItem("windowVisibility") || "{}",
    );
    // Battle-Log bleibt standardmäßig ausgeblendet, nur erstellen wenn explizit geöffnet
    if (!existingWindow && !windowVisibility["battle-log-window"]) {
      return; // Nicht erstellen wenn nicht explizit geöffnet
    }

    const logContent = `
            <div class="battle-log">
                ${logs.map((log) => `<div class="log-entry">${log}</div>`).join("")}
            </div>
        `;

    if (existingWindow) {
      // Update existing window - nur .battle-log updaten um Flackern zu vermeiden
      const battleLog = existingWindow.querySelector(".battle-log");
      if (battleLog) {
        // Prüfe ob sich der Content geändert hat
        const newLogHTML = logs
          .map((log) => `<div class="log-entry">${log}</div>`)
          .join("");
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
      document.body.insertAdjacentHTML("beforeend", windowHTML);
      const newWindow = document.getElementById("battle-log-window");

      // Position korrigieren da bottom verwendet wird
      const rect = newWindow.getBoundingClientRect();
      newWindow.style.bottom = "";
      newWindow.style.top = window.innerHeight - rect.height - 20 + "px";

      DraggableManager.makeWindowDraggable(newWindow, "battle-log-window");

      // Auto-scroll nach unten zur neuesten Nachricht
      setTimeout(() => {
        const battleLog = newWindow.querySelector(".battle-log");
        if (battleLog) {
          battleLog.scrollTop = battleLog.scrollHeight;
        }
      }, 0);
    }
  },

  // Item-Details-Popup (Hideout)
  showItemDetailsPopup(itemId) {
    const item = Game.state.player.inventory.find((i) => i.id === itemId);
    if (!item) return;

    const itemDef = Game.items[item.id];
    const isConsumable = itemDef && itemDef.type === "consumable";

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
                        <div class="item-type">Typ: ${itemDef ? itemDef.type : "Unbekannt"}</div>
                    </div>
                    <div class="popup-actions">
                        ${isConsumable ? `<button class="popup-btn use-btn" id="use-item-btn">Verwenden</button>` : ""}
                        <button class="popup-btn close-btn" id="close-btn">Schließen</button>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", overlayHTML);

    // Event Listeners
    const overlay = document.getElementById("item-details-overlay");
    const closePopupBtn = document.getElementById("close-popup-btn");
    const closeBtn = document.getElementById("close-btn");
    const useBtn = document.getElementById("use-item-btn");

    const closePopup = () => {
      overlay.remove();
    };

    closePopupBtn.addEventListener("click", closePopup);
    closeBtn.addEventListener("click", closePopup);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closePopup();
    });

    if (useBtn) {
      useBtn.addEventListener("click", () => {
        Game.useItem(itemId);
        closePopup();
        this.showInventory();
      });
    }
  },

  // Item Details Popup während Crawl
  showItemDetailsPopupCrawl(itemId) {
    const item = Game.state.player.inventory.find((i) => i.id === itemId);
    if (!item) return;

    const itemDef = Game.items[item.id];
    const isConsumable = itemDef && itemDef.type === "consumable";

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
                        <div class="item-type">Typ: ${itemDef ? itemDef.type : "Unbekannt"}</div>
                    </div>
                    <div class="popup-actions">
                        ${isConsumable ? `<button class="popup-btn use-btn" id="use-item-btn">Verwenden</button>` : ""}
                        <button class="popup-btn close-btn" id="close-btn">Schließen</button>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", overlayHTML);

    // Event Listeners
    const overlay = document.getElementById("item-details-overlay");
    const closePopupBtn = document.getElementById("close-popup-btn");
    const closeBtn = document.getElementById("close-btn");
    const useBtn = document.getElementById("use-item-btn");

    const closePopup = () => {
      overlay.remove();
    };

    closePopupBtn.addEventListener("click", closePopup);
    closeBtn.addEventListener("click", closePopup);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closePopup();
    });

    if (useBtn) {
      useBtn.addEventListener("click", () => {
        Game.useItem(itemId);
        closePopup();
        this.showInventoryCrawl();
      });
    }
  },

  // In js/ui.js (neue Funktion)

  // Item Details Popup speziell für den Kampf
  showItemDetailsPopupBattle(itemId) {
    const item = Game.state.player.inventory.find((i) => i.id === itemId);
    if (!item) return;

    const itemDef = Game.items[item.id];
    const isConsumable = itemDef && itemDef.type === "consumable";

    // Erstelle Overlay (HTML Struktur ist identisch zu den anderen Popups)
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
                    <div class="item-type">Typ: ${itemDef ? itemDef.type : "Unbekannt"}</div>
                    <div class="item-type" style="margin-top: 5px; color: #fbbf24; font-size: 0.8em;">(Shift + Klick im Inventar zum schnellen Nutzen)</div>
                </div>
                <div class="popup-actions">
                    ${isConsumable ? `<button class="popup-btn use-btn" id="use-item-btn">Verwenden</button>` : ""}
                    <button class="popup-btn close-btn" id="close-btn">Schließen</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", overlayHTML);

    // Event Listeners
    const overlay = document.getElementById("item-details-overlay");
    const closePopupBtn = document.getElementById("close-popup-btn");
    const closeBtn = document.getElementById("close-btn");
    const useBtn = document.getElementById("use-item-btn");

    const closePopup = () => {
      overlay.remove();
    };

    closePopupBtn.addEventListener("click", closePopup);
    closeBtn.addEventListener("click", closePopup);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closePopup();
    });

    if (useBtn) {
      useBtn.addEventListener("click", () => {
        // Item nutzen
        const healed = Game.useItem(itemId);

        if (healed !== false) {
          // Log-Logik für den Kampf
          if (
            Game.state.currentBattle &&
            typeof healed === "number" &&
            healed > 0
          ) {
            Game.state.currentBattle.log.push(
              `<span class="log-source player">Inventar:</span> Heiltrank genutzt! +${healed} HP`,
            );
          }

          // Popup schließen
          closePopup();

          // WICHTIG: Kampf-UI aktualisieren statt Hideout-UI
          this.createOrUpdateInventoryWindow(); // Inventar-Liste neu rendern (Menge -1)
          this.updateBattleScreen(); // HP-Balken und Log aktualisieren
        }
      });
    }
  },

  // Kampf-Inventar-Fenster erstellen/updaten
  createOrUpdateInventoryWindow() {
    let existingWindow = document.getElementById("inventory-window");

    const inventory = Game.state.player.inventory;
    const usableItems = inventory.filter((item) => {
      const itemDef = Game.items[item.id];
      return itemDef && itemDef.type === "consumable";
    });

    // Jedes Item einzeln anzeigen (auch wenn quantity > 1)
    const expandedItems = [];
    usableItems.forEach((item) => {
      const quantity = item.quantity || 1;
      for (let i = 0; i < quantity; i++) {
        expandedItems.push(item);
      }
    });

    const inventoryContent = `
            <div class="window-title">Inventar</div>
            <div class="inventory-battle-grid">
                ${
                  usableItems.length > 0
                    ? usableItems
                        .map((item) => {
                          const qtyBadge =
                            item.quantity > 1
                              ? `<span style="margin-left: auto; color: #fbbf24; font-weight: bold; white-space: nowrap; flex-shrink: 0;">x${item.quantity}</span>`
                              : "";

                          return `
                        <div class="inventory-item-battle-horizontal" data-item-id="${item.id}">
                            <div class="item-icon-placeholder"></div>
                            <div class="item-name" style="flex: 1; display: flex; align-items: center;">
                                ${item.name}${qtyBadge}
                            </div>
                        </div>
                    `;
                        })
                        .join("")
                    : '<div class="no-items">Keine nutzbaren Items</div>'
                }
            </div>
        `;

    if (existingWindow) {
      // Update existing window
      existingWindow.querySelector(".window-content").innerHTML =
        inventoryContent;

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
      document.body.insertAdjacentHTML("beforeend", windowHTML);
      const newWindow = document.getElementById("inventory-window");

      // WindowVisibility speichern
      const windowVisibility = JSON.parse(
        localStorage.getItem("windowVisibility") || "{}",
      );
      windowVisibility["inventory-window"] = true;
      localStorage.setItem(
        "windowVisibility",
        JSON.stringify(windowVisibility),
      );

      DraggableManager.makeWindowDraggable(newWindow, "inventory-window");

      // Event Listeners setzen
      this.setupInventoryWindowListeners(newWindow);
    }
  },

  // Event Listeners für Inventar-Fenster
  setupInventoryWindowListeners(windowElement) {
    windowElement
      .querySelectorAll(".inventory-item-battle-horizontal")
      .forEach((itemEl) => {
        itemEl.addEventListener("click", (e) => {
          // 'e' (Event) Parameter hinzufügen
          const itemId = itemEl.dataset.itemId;

          if (Game.state.player.hp <= 0) return;

          // PRÜFUNG: Ist Shift gedrückt?
          if (e.shiftKey) {
            // Shift+Klick -> Sofort nutzen (altes Verhalten)
            const healed = Game.useItem(itemId);

            if (healed !== false) {
              // Item wurde genutzt, Fenster updaten
              this.createOrUpdateInventoryWindow();
              this.updateBattleScreen();

              // Optional: Log Eintrag hinzufügen (da Game.useItem das nicht automatisch für den Battle-Log macht)
              if (
                Game.state.currentBattle &&
                typeof healed === "number" &&
                healed > 0
              ) {
                Game.state.currentBattle.log.push(
                  `<span class="log-source player">Inventar:</span> Heiltrank (Shift) genutzt! +${healed} HP`,
                );
                // Log Fenster aktualisieren
                if (document.getElementById("battle-log-window")) {
                  this.createOrUpdateBattleLogWindow(
                    Game.state.currentBattle.log,
                  );
                }
              }
            }
          } else {
            // Normaler Klick -> Popup öffnen
            this.showItemDetailsPopupBattle(itemId);
          }
        });
      });
  },

  // Ability-Fenster erstellen/updaten
  createOrUpdateAbilityWindow() {
    const battle = Game.state.currentBattle;
    // Wir brechen nicht ab, damit wir das Fenster ggf. disablen können
    if (!battle) return;

    // Prüfe ob Fenster sichtbar sein soll
    const windowVisibility = JSON.parse(
      localStorage.getItem("windowVisibility") || "{}",
    );
    const existingWindow = document.getElementById("ability-window");
    const shouldBeVisible = windowVisibility["ability-window"] !== false;
    if (!existingWindow && !shouldBeVisible) {
      return;
    }

    const player = Game.state.player;

    // Wenn Boss HP 0 (und keine anderen Gegner da sind) oder Spieler HP 0 -> Kampf ist vorbei
    const isBattleOver = battle.boss.hp <= 0 || player.hp <= 0;
    const isPlayerTurn = battle.turn === "player";
    // Interaktion nur erlaubt, wenn Spieler dran ist UND Kampf NICHT vorbei ist
    const canInteract = isPlayerTurn && !isBattleOver;

    // Fähigkeiten mit korrektem Slot-Index verarbeiten
    const abilityButtons = player.equippedAbilities
      .map((abilityIndex, slotIndex) => {
        if (abilityIndex === null || abilityIndex === undefined) return null;

        const abilityId = player.abilities[abilityIndex];
        const ability = Game.abilities[abilityId];
        if (!ability) return null;

        // Button ist disabled, wenn:
        // 1. Nicht Spieler-Zug oder Kampf vorbei
        // 2. Nicht genug AP
        const canUse =
          canInteract && battle.playerActionPoints >= ability.apCost;
        const disabledClass = canUse ? "" : "disabled";

        const hitInfo =
          ability.hitChance < 1.0
            ? ` | ${Math.floor(ability.hitChance * 100)}%`
            : "";

        return `
            <div class="ability-button-card ${disabledClass}" data-ability-index="${abilityIndex}" data-slot-index="${slotIndex}">
                <div class="ability-icon-placeholder"></div>
                <div class="ability-button-name">${ability.name}</div>
                <div class="ability-button-stats">${ability.attacks}x ${Math.floor(ability.damageMultiplier * 100)}%${hitInfo} | ${ability.apCost} AP</div>
            </div>
        `;
      })
      .filter((html) => html !== null)
      .join("");

    // Block-Button
    const canBlock = canInteract && battle.playerActionPoints >= 1;
    const blockButtonClass = canBlock ? "" : "disabled";
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
      existingWindow.querySelector(".window-content").innerHTML = `
                <div class="window-title">Fähigkeiten</div>
                ${content}
            `;
      // Event-Listener neu setzen ist hier eigentlich nicht nötig, wenn sie am Window hängen,
      // aber zur Sicherheit lassen wir es so wie im Original-Flow
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
      document.body.insertAdjacentHTML("beforeend", windowHTML);
      const newWindow = document.getElementById("ability-window");
      DraggableManager.makeWindowDraggable(newWindow, "ability-window");
      DraggableManager.bringToFront(newWindow);
      this.setupAbilityWindowListeners(newWindow);
    }
  },

  // Event Listeners für Ability-Fenster
  setupAbilityWindowListeners(windowElement) {
    windowElement.querySelectorAll(".ability-button-card").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("disabled")) return;

        const abilityIndex = btn.dataset.abilityIndex;
        const action = btn.dataset.action;

        if (action === "block") {
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

    // ÄNDERUNG: Dynamische MaxHP holen (Basis + Bonus)
    const currentMaxHp = Game.getPlayerMaxHp();

    // ÄNDERUNG: Prozentberechnung mit dem dynamischen Wert
    const hpPercent = Math.min(100, (player.hp / currentMaxHp) * 100);

    let existingWindow = document.getElementById("control-window");

    const content = `
            <div class="window-title">Status</div>
            <div class="control-window-content">
                <div class="hp-bar-container">
                    <div class="hp-bar-label">HP</div>
                    <div class="hp-bar-wrapper">
                        <div class="hp-bar-fill" style="width: ${hpPercent}%"></div>
                        <div class="hp-bar-text">${player.hp}/${currentMaxHp}</div>
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
      existingWindow.querySelector(".window-content").innerHTML = content;
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
      document.body.insertAdjacentHTML("beforeend", windowHTML);
      const newWindow = document.getElementById("control-window");

      // Zentriere horizontal am unteren Rand mit top statt bottom
      const rect = newWindow.getBoundingClientRect();
      const centerX = (window.innerWidth - rect.width) / 2;
      const bottomY = window.innerHeight - rect.height - 20;
      newWindow.style.left = centerX + "px";
      newWindow.style.top = bottomY + "px";

      DraggableManager.makeWindowDraggable(newWindow, "control-window");
      DraggableManager.bringToFront(newWindow);
      this.updateToggleButtonStates(newWindow);
      this.setupControlWindowListeners(newWindow);
    }
  },

  // Toggle-Button States aktualisieren basierend auf geöffneten Fenstern
  updateToggleButtonStates(controlWindow) {
    controlWindow.querySelectorAll(".window-toggle-btn").forEach((btn) => {
      const windowId = btn.dataset.window;
      const targetWindow = document.getElementById(windowId);
      if (targetWindow) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  },

  // Event Listeners für Control-Fenster
  setupControlWindowListeners(windowElement) {
    windowElement.querySelectorAll(".window-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const windowId = btn.dataset.window;
        const targetWindow = document.getElementById(windowId);

        if (targetWindow) {
          // Cleanup VOR dem Entfernen! (minimized-State behalten für Toggle)
          DraggableManager.cleanupWindow(windowId, true);
          // Fenster schließen - in localStorage als hidden markieren
          const windowVisibility = JSON.parse(
            localStorage.getItem("windowVisibility") || "{}",
          );
          windowVisibility[windowId] = false;
          localStorage.setItem(
            "windowVisibility",
            JSON.stringify(windowVisibility),
          );
          targetWindow.remove();
        } else {
          // Fenster öffnen - in localStorage als visible markieren
          const windowVisibility = JSON.parse(
            localStorage.getItem("windowVisibility") || "{}",
          );
          windowVisibility[windowId] = true;
          localStorage.setItem(
            "windowVisibility",
            JSON.stringify(windowVisibility),
          );

          if (windowId === "stats-panel-window") {
            this.toggleStatsPanel();
          } else if (windowId === "inventory-window") {
            this.createOrUpdateInventoryWindow();
          } else if (windowId === "ability-window") {
            this.createOrUpdateAbilityWindow();
          } else if (windowId === "enemy-window") {
            // Gegner-Fenster neu erstellen
            const battle = Game.state.currentBattle;
            if (battle) {
              console.log("yo");
              this.updateBattleScreen();
            }
          } else if (windowId === "battle-log-window") {
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
    const enemyWindow = document.getElementById("enemy-window");
    const logWindow = document.getElementById("battle-log-window");
    const statsWindow = document.getElementById("stats-panel-window");
    const inventoryWindow = document.getElementById("inventory-window");
    const abilityWindow = document.getElementById("ability-window");
    const controlWindow = document.getElementById("control-window");

    // Sichtbarkeit von Stats und Inventar für nächsten Kampf speichern
    const windowVisibility = JSON.parse(
      localStorage.getItem("windowVisibility") || "{}",
    );
    if (statsWindow) {
      windowVisibility["stats-panel-window"] = true; // War sichtbar
    }
    if (inventoryWindow) {
      windowVisibility["inventory-window"] = true; // War sichtbar
    }
    localStorage.setItem("windowVisibility", JSON.stringify(windowVisibility));

    // ResizeObserver cleanup VOR dem Entfernen
    // Stats und Inventar: keepMinimizedState = true (Minimiert-Status merken)
    if (enemyWindow) DraggableManager.cleanupWindow("enemy-window");
    if (logWindow) DraggableManager.cleanupWindow("battle-log-window");
    if (statsWindow) DraggableManager.cleanupWindow("stats-panel-window", true);
    if (inventoryWindow)
      DraggableManager.cleanupWindow("inventory-window", true);
    if (abilityWindow) DraggableManager.cleanupWindow("ability-window");
    if (controlWindow) DraggableManager.cleanupWindow("control-window");

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
  },
};
