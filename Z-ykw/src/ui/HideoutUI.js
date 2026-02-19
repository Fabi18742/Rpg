// src/ui/HideoutUI.js
import { stateManager } from "../engine/StateManager.js";
import { Definitions } from "../data/definitions.js";

export class HideoutUI {
  constructor(elementId) {
    this.container = document.getElementById(elementId);
    this.visualArea = document.querySelector(".visual-area");
    this.sceneContent = document.getElementById("scene-content");

    // Interner Zustand für den aktuellen Sub-Screen im Hideout
    this.activeScreen = "main"; // 'main', 'stats', 'inventory', 'equipment', 'ritual'

    // API für die Buttons registrieren
    window.gameAPI.switchHideoutScreen = (screen) => this.setScreen(screen);

    stateManager.subscribe((state) => {
      this.render(state);
    });

    this.render(stateManager.getState());
  }

  setScreen(screen) {
    this.activeScreen = screen;
    this.render(stateManager.getState());
  }

  render(state) {
    if (!this.container || state.location !== "hideout") {
      this.container.style.display = "none";
      if (this.visualArea) this.visualArea.classList.remove("hideout-bg");
      return;
    }

    this.container.style.display = "block";
    if (this.visualArea) this.visualArea.classList.add("hideout-bg");

    const windowsToHide = ["log-window", "inventory-window", "stats-window"];
    windowsToHide.forEach((id) => {
      const win = document.getElementById(id);
      if (win) win.style.display = "none";
    });

    this.renderActionArea(state);
    this.renderVisualArea(state);
  }

  // UNTEN: Das klassische 3x2 Grid oder der "Zurück" Button
  renderActionArea(state) {
    if (this.activeScreen === "main") {
      this.container.innerHTML = `
                <div class="button-grid hideout-grid">
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('equipment')">Ausrüstung</button>
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('shop')">Shop</button>
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('stats')">Stats</button>
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('inventory')">Inventar</button>
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('ritual')">Das Ritual</button>
                    <button class="game-button adventure-btn" onclick="window.gameAPI.startAdventure()">Boss-Kämpfe</button>
                </div>
            `;
    } else {
      this.container.innerHTML = `
                <div class="button-grid single-button">
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('main')">Zurück</button>
                </div>
            `;
    }
  }

  // OBEN: Die statischen Inhalte auf dem Hintergrund
  renderVisualArea(state) {
    if (!this.sceneContent) return;
    this.sceneContent.style.opacity = "1";

    const p = state.player;

    switch (this.activeScreen) {
      case "main":
        this.sceneContent.innerHTML = "";
        break;
      case "stats":
        this.sceneContent.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <h2 style="color: var(--accent-color); margin-bottom: 40px; margin-top: 0;">Charakterbogen</h2>
                <div class="stat-grid-large" style="width: 100%; max-width: 500px; background: rgba(0,0,0,0.5); border: 2px solid #444; padding: 30px; font-size: 18px;">
                    <div class="stat-entry" style="margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                        <span>Stufe:</span> <span style="color: var(--accent-color); font-weight: bold;">${p.level}</span>
                    </div>
                    <div class="stat-entry" style="margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                        <span>XP:</span> <span>${p.xp}</span>
                    </div>
                    <div class="stat-entry" style="margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                        <span>HP:</span> <span style="color: #ff6b6b; font-weight: bold;">${p.hp} / ${p.maxHp}</span>
                    </div>
                    <div class="stat-entry" style="margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                        <span>Stärke:</span> <span>${p.stats.strength}</span>
                    </div>
                    <div class="stat-entry" style="padding-bottom: 5px;">
                        <span>Abwehr:</span> <span>${p.stats.defense}</span>
                    </div>
                </div>
            </div>`;
        break;

      case "equipment":
        const equippedWeapon = p.equipped.weapon;
        const equippedArmor = p.equipped.armor;

        // --- WAFFEN SLOT HTML ---
        let weaponEffectsHTML = "";
        let weaponTooltipHTML = "";

        if (equippedWeapon) {
          if (equippedWeapon.effects && equippedWeapon.effects.length > 0) {
            weaponEffectsHTML =
              '<span class="slot-effects" style="margin-left: 8px;">';
            let tooltipEffectsHTML = '<div class="tooltip-effects">';

            equippedWeapon.effects.forEach((effectId) => {
              const effect = Definitions.effects[effectId];
              if (effect) {
                weaponEffectsHTML += `<span class="effect-badge" style="color: #ff9a8a; border: 1px solid #e74c3c;">${effect.name}</span>`;
                tooltipEffectsHTML += `<div class="tooltip-effect"><strong>${effect.name}:</strong> ${effect.description}</div>`;
              }
            });
            weaponEffectsHTML += "</span>";
            tooltipEffectsHTML += "</div>";

            weaponTooltipHTML = `
                <div class="equipment-tooltip">
                    <div class="tooltip-title">${equippedWeapon.name}</div>
                    <div class="tooltip-stat">Schaden: ${equippedWeapon.damage}</div>
                    ${tooltipEffectsHTML}
                </div>
            `;
          } else {
            weaponTooltipHTML = `
                <div class="equipment-tooltip">
                    <div class="tooltip-title">${equippedWeapon.name}</div>
                    <div class="tooltip-stat">Schaden: ${equippedWeapon.damage}</div>
                </div>
            `;
          }
        }

        let weaponSlotHTML = `
            <div class="equipment-slot weapon-slot ${equippedWeapon ? "filled" : "empty"}" onclick="window.gameAPI.switchHideoutScreen('weapon_selection')">
                <div class="item-icon-placeholder"></div>
                <div class="item-info">
                    ${
                      equippedWeapon
                        ? `<div class="item-name">${equippedWeapon.name}</div>
                           <div class="item-stats">Schaden: ${equippedWeapon.damage}${weaponEffectsHTML}</div>`
                        : '<div class="item-name slot-label">Waffe (Klicken zum Auswählen)</div>'
                    }
                </div>
                ${equippedWeapon ? weaponTooltipHTML : ""}
            </div>
        `;

        // --- RÜSTUNGS SLOT HTML ---
        let armorSlotHTML = `
            <div class="equipment-slot armor-slot empty">
                <div class="item-icon-placeholder" style="opacity: 0.2;"></div>
                <div class="item-info">
                    <div class="item-name slot-label">Rüstung (Bald verfügbar)</div>
                </div>
            </div>
        `;

        // --- FÄHIGKEITEN SLOTS HTML ---
        let abilitySlotsHTML = "";
        const skills = p.skills || [];
        const displaySkills = [null, null, null, null]; // Immer 4 Slots erzwingen
        for (let i = 0; i < skills.length; i++) {
          if (i < 4) displaySkills[i] = skills[i];
        }

        for (let i = 0; i < 4; i++) {
          const skillId = displaySkills[i];
          const ability = skillId ? Definitions.abilities[skillId] : null;

          if (ability) {
            abilitySlotsHTML += `
                    <div class="equipment-slot filled" onclick="window.gameAPI.openAbilitySelection(${i})" style="width: 100%;">
                        <div class="item-icon-placeholder"></div>
                        <div class="item-info">
                            <div class="item-name">${ability.name}</div>
                            <div class="item-stats">${ability.apCost} AP | ${Math.round((ability.damageMult || 1) * 100)}% Dmg</div>
                        </div>
                    </div>
                `;
          } else {
            abilitySlotsHTML += `
                    <div class="equipment-slot empty" onclick="window.gameAPI.openAbilitySelection(${i})" style="width: 100%;">
                        <div class="item-icon-placeholder" style="opacity: 0.2;"></div>
                        <div class="item-info">
                            <div class="item-name slot-label">Slot ${i + 1} (Leer)</div>
                        </div>
                    </div>
                `;
          }
        }

        // --- ZUSAMMENBAU ---
        this.sceneContent.innerHTML = `
            <div class="equipment-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <h2 style="color: var(--accent-color); margin-bottom: 40px; margin-top: 0;">Ausrüstung</h2>
                <div class="equipment-slots-wrapper" style="display: flex; gap: 60px; justify-content: center; width: 100%;">
                    
                    <div class="weapon-section">
                        <h3 style="color: #888; margin-bottom: 20px; text-align: center;">Kampfausrüstung</h3>
                        ${weaponSlotHTML}
                        <div style="height: 20px;"></div> 
                        ${armorSlotHTML}
                    </div>

                    <div class="abilities-section" style="display: flex; flex-direction: column;">
                        <h3 style="color: #888; margin-bottom: 20px; text-align: center;">Fähigkeiten</h3>
                        <div class="ability-slots-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 500px;">
                            ${abilitySlotsHTML}
                        </div>
                    </div>

                </div>
            </div>
        `;
        break;

      case "weapon_selection":
        const weapons = p.weapons || [];
        const currentWeaponId = p.equipped.weapon ? p.equipped.weapon.id : null;

        let weaponsHTML = "";
        if (weapons.length === 0) {
          weaponsHTML =
            '<div class="no-items" style="text-align:center; color:#888; font-size: 18px; margin-top: 40px;">Keine Waffen verfügbar. Stelle eine im Ritual her!</div>';
        } else {
          weaponsHTML = weapons
            .map((w) => {
              const isEquipped = w.id === currentWeaponId;

              let effectsHTML = "";
              if (w.effects && w.effects.length > 0) {
                effectsHTML =
                  '<div class="weapon-effects" style="margin-top: 5px;">';
                w.effects.forEach((effectId) => {
                  const effect = Definitions.effects[effectId];
                  if (effect) {
                    effectsHTML += `<span class="effect-badge" style="color: #ff9a8a; border: 1px solid #e74c3c; font-size: 11px;">${effect.name}</span>`;
                  }
                });
                effectsHTML += "</div>";
              }

              return `
                <div class="equipment-modal-item ${isEquipped ? "equipped" : ""}" style="background: #111; border: 2px solid ${isEquipped ? "var(--accent-color)" : "#444"}; margin-bottom: 10px;" 
                     onclick="${isEquipped ? "window.gameAPI.unequipWeapon()" : `window.gameAPI.equipWeapon('${w.id}')`}">
                    <div class="item-icon-placeholder"></div>
                    <div class="item-details" style="flex: 1;">
                        <div class="item-name" style="font-size: 18px; color: ${isEquipped ? "var(--accent-color)" : "#fff"};">${w.name}</div>
                        <div class="item-stats-row">
                            <span class="item-stats" style="font-size: 14px; color: #aaa;">Schaden: ${w.damage}</span>
                        </div>
                        ${effectsHTML}
                    </div>
                    <div style="align-self: center; font-weight: bold; color: ${isEquipped ? "var(--accent-color)" : "#888"};">
                        ${isEquipped ? "ABLEGEN" : "AUSRÜSTEN"}
                    </div>
                </div>
            `;
            })
            .join("");
        }

        this.sceneContent.innerHTML = `
            <div class="equipment-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 10; display: flex; flex-direction: column; align-items: center; padding-top: 50px;">
                <h2 style="color: var(--accent-color); margin-bottom: 10px;">Waffenkammer</h2>
                <p style="color: #888; margin-bottom: 20px; text-align: center;">Klicke auf eine Waffe, um sie auszurüsten.</p>
                <div class="equipment-modal-list" style="width: 100%; max-width: 800px; flex: 1; overflow-y: auto; padding-right: 15px; margin-bottom: 20px;">
                    ${weaponsHTML}
                </div>
            </div>
        `;

        this.container.innerHTML = `
            <div class="button-grid single-button">
                <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('equipment')">Zurück zur Ausrüstung</button>
            </div>
        `;
        break;

      case "ability_selection":
        const slotIndex = window.currentSkillSlot || 0;
        // Entweder aus dem Pool des Spielers oder alle definierten als Fallback
        const unlockedSkills =
          p.unlockedSkills || Object.keys(Definitions.abilities);

        let abilitiesListHTML = `
            <div class="equipment-modal-item" style="background: #111; border: 2px solid #444; margin-bottom: 10px;" 
                 onclick="window.gameAPI.unequipSkill(${slotIndex})">
                <div class="item-icon-placeholder" style="opacity: 0.2;"></div>
                <div class="item-details" style="flex: 1;">
                    <div class="item-name" style="font-size: 18px; color: #888;">Nichts</div>
                    <div class="item-stats-row">
                        <span class="item-stats" style="font-size: 14px; color: #aaa;">Diesen Slot leeren</span>
                    </div>
                </div>
            </div>
        `;

        unlockedSkills.forEach((skillId) => {
          const ability = Definitions.abilities[skillId];
          if (!ability) return;

          // Prüfen ob die Fähigkeit irgendwo (in irgendeinem Slot) schon ausgerüstet ist
          const isEquipped = p.skills && p.skills.includes(skillId);

          abilitiesListHTML += `
                <div class="equipment-modal-item ${isEquipped ? "equipped" : ""}" 
                     style="background: #111; border: 2px solid ${isEquipped ? "#555" : "#444"}; margin-bottom: 10px; ${isEquipped ? "opacity: 0.5; cursor: default;" : ""}" 
                     onclick="${isEquipped ? "" : `window.gameAPI.equipSkill('${skillId}')`}">
                    <div class="item-icon-placeholder"></div>
                    <div class="item-details" style="flex: 1;">
                        <div class="item-name" style="font-size: 18px; color: #fff;">${ability.name}</div>
                        <div class="item-stats-row">
                            <span class="item-stats" style="font-size: 14px; color: #aaa;">${ability.apCost} AP | Schaden: ${Math.round((ability.damageMult || 1) * 100)}%</span>
                        </div>
                    </div>
                    <div style="align-self: center; font-weight: bold; color: #888;">
                        ${isEquipped ? "Bequlegt" : "AUSRÜSTEN"}
                    </div>
                </div>
            `;
        });

        this.sceneContent.innerHTML = `
            <div class="equipment-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 10; display: flex; flex-direction: column; align-items: center; padding-top: 50px;">
                <h2 style="color: var(--accent-color); margin-bottom: 10px;">Fähigkeiten (Slot ${slotIndex + 1})</h2>
                <p style="color: #888; margin-bottom: 20px; text-align: center;">Wähle eine Fähigkeit für diesen Slot.</p>
                <div class="equipment-modal-list" style="width: 100%; max-width: 800px; flex: 1; overflow-y: auto; padding-right: 15px; margin-bottom: 20px;">
                    ${abilitiesListHTML}
                </div>
            </div>
        `;

        this.container.innerHTML = `
            <div class="button-grid single-button">
                <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('equipment')">Zurück zur Ausrüstung</button>
            </div>
        `;
        break;

      case "inventory":
        const allLoot = [...(p.inventory || []), ...(p.weapons || [])];

        const itemsHTML =
          allLoot.length > 0
            ? allLoot
                .map((item) => {
                  // Prüfen ob ausgerüstet (Waffe oder Rüstung)
                  const isEquipped =
                    p.equipped.weapon?.id === item.id ||
                    p.equipped.armor?.id === item.id;
                  const accentColor = isEquipped
                    ? "var(--accent-color)"
                    : "#fff";

                  // Anzeige-Typ
                  let typeDisplay = item.damage
                    ? "WAFFE"
                    : item.type
                      ? item.type.toUpperCase()
                      : "ITEM";

                  return `
                <div class="static-inv-item" style="background: rgba(0,0,0,0.5); border: 1px solid #444; border-left: 4px solid ${isEquipped ? "var(--accent-color)" : "#444"}; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display:flex; flex-direction:column; gap: 5px;">
                        <span style="font-weight:bold; font-size: 18px; color:${accentColor}">${item.name}</span>
                        <span style="font-size:12px; color:#888">${typeDisplay}</span>
                    </div>
                    <button class="game-button" onclick="window.gameAPI.useItem('${item.id}')" style="min-height: 40px; padding: 5px 20px; font-size: 14px; width: auto;">
                        ${isEquipped ? "Ablegen" : item.damage ? "Ausrüsten" : "Nutzen"}
                    </button>
                </div>`;
                })
                .join("")
            : "<p style='text-align:center; color:#888; font-size: 18px; grid-column: span 2; margin-top: 40px;'>Dein Inventar ist leer.</p>";

        this.sceneContent.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 10; display: flex; flex-direction: column; align-items: center; padding-top: 50px;">
                <h2 style="color: var(--accent-color); margin-bottom: 30px; margin-top: 0;">Inventar</h2>
                <div class="static-inventory-grid" style="width: 100%; max-width: 1000px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; overflow-y: auto; padding-right: 15px; margin-bottom: 20px;">
                    ${itemsHTML}
                </div>
            </div>`;
        break;

      case "ritual":
        const ritualItems = state.ritual.selectedItems;
        const availableRitualItems = state.player.inventory.filter(
          (i) => i.type === "ritual",
        );

        const canPerform = ritualItems.length === 6;
        const buttonStyle = canPerform
          ? "margin-top: 30px;"
          : "margin-top: 30px; opacity: 0.3; pointer-events: none;";

        this.sceneContent.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <h2 style="color: var(--accent-color); margin-bottom: 30px; margin-top: 0;">Das Ritual</h2>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; width: 100%; max-width: 1000px; background: rgba(0,0,0,0.5); border: 2px solid #444; padding: 40px;">
                    
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <p style="font-size: 16px; color: #aaa; margin-bottom: 25px;">Wähle 6 Ritual-Komponenten</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                            ${[0, 1, 2, 3, 4, 5]
                              .map((idx) => {
                                const item = ritualItems[idx];
                                return `
                                    <div onclick="window.gameAPI.removeFromRitual(${idx})" 
                                         style="width: 80px; height: 80px; border: 2px dashed ${item ? "var(--accent-color)" : "#666"}; background: ${item ? "rgba(251,191,36,0.1)" : "#111"}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 28px; transition: all 0.2s;">
                                        ${item ? `✨` : ""}
                                    </div>`;
                              })
                              .join("")}
                        </div>

                        <button class="game-button" 
                                id="btn-perform-ritual"
                                style="${buttonStyle} width: 100%;"
                                onclick="window.gameAPI.doRitual()">
                            Ritual vollziehen
                        </button>
                    </div>

                    <div style="border-left: 2px solid #333; padding-left: 40px; display: flex; flex-direction: column; max-height: 400px;">
                        <p style="font-size: 16px; color: #aaa; margin-bottom: 25px;">Verfügbare Zutaten:</p>
                        <div style="overflow-y: auto; padding-right: 15px; display: flex; flex-direction: column; gap: 10px;">
                        ${
                          availableRitualItems.length > 0
                            ? availableRitualItems
                                .map(
                                  (item) => `
                                <div class="static-inv-item" style="background: #111; border: 1px solid #444; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display:flex; flex-direction:column; gap: 4px;">
                                        <span style="font-size: 16px; color: var(--accent-color); font-weight: bold;">${item.name}</span>
                                        <span style="font-size: 12px; color: #888;">Kraft: ${item.ritualValue || 0}</span>
                                    </div>
                                    <button class="game-button" onclick="window.gameAPI.addToRitual('${item.id}')" style="min-height: 40px; width: 40px; padding: 0; display: flex; align-items: center; justify-content: center; font-size: 20px;">+</button>
                                </div>`,
                                )
                                .join("")
                            : "<p style='font-size:14px; color:#666; text-align:center; margin-top:20px; font-style: italic;'>Keine Ritualzutaten im Inventar.</p>"
                        }
                        </div>
                    </div>

                </div>
            </div>`;
        break;

      default:
        this.sceneContent.innerHTML = `<div class="static-screen-overlay"><h2>${this.activeScreen}</h2><p>In Arbeit...</p></div>`;
    }
  }
}
