// src/ui/HideoutUI.js
import { stateManager } from "../engine/StateManager.js";
import { Definitions } from "../data/definitions.js";

export class HideoutUI {
  constructor(elementId) {
    this.container = document.getElementById(elementId);
    this.visualArea = document.querySelector(".visual-area");
    this.sceneContent = document.getElementById("scene-content");

    this.shopSelection = { side: "buy", index: 0, qty: 1 };

    this.activeScreen = "main";

    // API für die Buttons registrieren
    window.gameAPI.switchHideoutScreen = (screen) => this.setScreen(screen);

    stateManager.subscribe((state) => {
      this.render(state);
    });

    this.render(stateManager.getState());
  }

  setScreen(screen) {
    if (this.activeScreen === "ritual" && screen !== "ritual") {
      window.gameAPI.clearRitual();
    }
    this.activeScreen = screen;
    this.render(stateManager.getState());
  }

  render(state) {
    if (!this.container || state.location !== "hideout") {
      this.container.style.display = "none";
      if (this.visualArea) this.visualArea.classList.remove("hideout-bg");
      if (this.sceneContent) {
        this.sceneContent.innerHTML = "";
      }
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

  renderActionArea(state) {
    if (this.activeScreen === "main") {
      const tokens = state.player.tokens || 0;
      const tokenBadge =
        tokens > 0 ? ' <span style="color:#fbbf24;">(↑)</span>' : "";

      this.container.innerHTML = `
                <div class="button-grid hideout-grid">
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('equipment')">Ausrüstung</button>
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('shop')">Shop</button>
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('stats')">Stats${tokenBadge}</button>
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('inventory')">Inventar</button>
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('ritual')">Das Ritual</button>
                    <button class="game-button adventure-btn" onclick="window.gameAPI.startAdventure()">Boss-Kämpfe</button>
                </div>
            `;
    } else if (this.activeScreen === "shop") {
      const p = state.player;
      const merchant = Definitions.merchants.traveling_merchant;
      const sel = this.shopSelection;

      let itemDef = null;
      let price = 0;
      let maxQty = 1;
      let name = "";
      let desc = "";
      let isWeapon = false;
      let sellType = null;
      let sellOriginalIndex = null;

      // Die gleiche Liste wie oben im Visual Screen generieren, um das Item zu finden
      const sellableList = [];
      (p.weapons || []).forEach((w, idx) => {
        if (p.equipped.weapon && p.equipped.weapon.id === w.id) return;
        sellableList.push({
          type: "weapon",
          originalIndex: idx,
          item: w,
          price: w.goldValue || w.value || 5,
          maxQty: 1,
        });
      });
      (p.inventory || []).forEach((i, idx) => {
        const priceVal = i.goldValue || i.value || 1;
        sellableList.push({
          type: "inventory",
          originalIndex: idx,
          item: i,
          price: priceVal,
          maxQty: i.quantity || 1,
        });
      });

      if (sel.side === "buy") {
        const offer = merchant.offers[sel.index];
        if (offer) {
          itemDef =
            Definitions.items[offer.id] || Definitions.weapons[offer.id];
          price = offer.price;
          name = itemDef ? itemDef.name : "Unbekannt";
          desc = itemDef
            ? itemDef.description || "Ein nützlicher Gegenstand."
            : "";
          maxQty = 9999;
          if (maxQty < 1) maxQty = 1;
        }
      } else {
        const entry = sellableList[sel.index];
        if (entry) {
          itemDef = entry.item;
          price = entry.price;
          name = itemDef.name;
          desc = itemDef.description || "Ein Gegenstand aus deinem Inventar.";
          maxQty = entry.maxQty;
          isWeapon = entry.type === "weapon";
          sellType = entry.type;
          sellOriginalIndex = entry.originalIndex;
        }
      }

      // Mengen-Limit (Clamp)
      if (sel.qty > maxQty && maxQty > 0) sel.qty = maxQty;
      if (sel.qty < 1) sel.qty = 1;

      const totalPrice = price * sel.qty;
      let btnDisabled = false;
      let actionBtnHTML = "";

      if (!itemDef) {
        actionBtnHTML = ``;
      } else if (sel.side === "buy") {
        btnDisabled = (p.gold || 0) < totalPrice;
        actionBtnHTML = `
              <button class="game-button" style="padding: 5px 20px; font-size: 16px; min-height: 40px; margin-left: auto; ${btnDisabled ? "opacity:0.3; filter:grayscale(1); pointer-events:none;" : ""}" 
                      onclick="window.gameAPI.buyItem('${merchant.offers[sel.index].id}', ${totalPrice}, '${Definitions.weapons[merchant.offers[sel.index].id] ? "weapon" : "inventory"}', ${sel.qty})">
                  Kaufen
              </button>`;
      } else {
        actionBtnHTML = `
              <button class="game-button" style="padding: 5px 20px; font-size: 16px; min-height: 40px; margin-left: auto;" 
                      onclick="window.gameAPI.sellItem('${sellType}', ${sellOriginalIndex}, ${totalPrice}, ${sel.qty})">
                  Verkaufen
              </button>`;
      }

      const qtyControls =
        isWeapon || !itemDef
          ? ""
          : `
          <div style="display: flex; align-items: center; gap: 10px;">
              <button class="game-button" style="min-height: 30px; width: 30px; padding: 0;" onclick="window.gameAPI.changeShopQty(-1, event)">-</button>
              <span style="font-size: 18px; font-weight: bold; width: 30px; text-align: center;">${sel.qty}</span>
              <button class="game-button" style="min-height: 30px; width: 30px; padding: 0;" onclick="window.gameAPI.changeShopQty(1, event)">+</button>
          </div>
      `;

      this.container.innerHTML = `
          <div style="display: grid; grid-template-columns: 200px 1fr; gap: 20px; width: 100%; height: 100%;">
              <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('main')" style="height: 100%;">Zurück</button>
              
              ${
                itemDef
                  ? `
              <div style="background: #000; border: 2px solid #444; padding: 15px; display: flex; flex-direction: column; justify-content: space-between;">
                  <div style="display: flex; gap: 15px;">
                      <div style="width: 50px; height: 50px; background: rgba(0,0,0,0.5); border: 1px solid #444;"></div>
                      <div>
                          <div style="font-size: 18px; font-weight: bold; color: var(--accent-color); margin-bottom: 5px;">${name}</div>
                          <div style="font-size: 14px; color: #888;">${desc}</div>
                      </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 20px; background: rgba(0,0,0,0.3); padding: 10px; margin-top: 10px;">
                      <div style="font-size: 20px; font-weight: bold; color: #fbbf24; min-width: 100px;">${totalPrice} G</div>
                      ${qtyControls}
                      ${actionBtnHTML}
                  </div>
              </div>
              `
                  : '<div style="background: #000; border: 2px solid #444; display: flex; justify-content:center; align-items:center; color:#888;">Bitte wähle links oder rechts ein Item aus.</div>'
              }
          </div>
      `;
    } else if (this.activeScreen === "world_selection") {
      this.container.innerHTML = `
                <div class="button-grid single-button">
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('main')">Zurück</button>
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
        const tokens = p.tokens || 0;
        const nextXp = p.level * 100;
        const xpPercent = Math.min(100, (p.xp / nextXp) * 100);

        // Feste Platzhalter für die Token-Nachricht
        const tokenMsg =
          tokens > 0
            ? `<div style="color: #fbbf24; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Level Up! ${tokens} Token verfügbar</div>`
            : `<div style="visibility: hidden; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Platzhalter</div>`;

        // Die Buttons (Schwebend rechts am Rand positioniert, mit gelbem Text, Rahmen und transparentem gelben Hintergrund)
        const btnStr = `<button class="game-button" onclick="window.gameAPI.investToken('strength')" style="min-height: 30px; height: 30px; padding: 0; width: 45px; font-size: 14px; position: absolute; right: -60px; color: #fbbf24; border-color: #fbbf24; background-color: rgba(251, 191, 36, 0.15); ${tokens > 0 ? "" : "display: none;"}">+1</button>`;
        const btnDef = `<button class="game-button" onclick="window.gameAPI.investToken('defense')" style="min-height: 30px; height: 30px; padding: 0; width: 45px; font-size: 14px; position: absolute; right: -60px; color: #fbbf24; border-color: #fbbf24; background-color: rgba(251, 191, 36, 0.15); ${tokens > 0 ? "" : "display: none;"}">+1</button>`;
        const btnHp = `<button class="game-button" onclick="window.gameAPI.investToken('maxHp')" style="min-height: 30px; height: 30px; padding: 0; width: 45px; font-size: 14px; position: absolute; right: -60px; color: #fbbf24; border-color: #fbbf24; background-color: rgba(251, 191, 36, 0.15); ${tokens > 0 ? "" : "display: none;"}">+10</button>`;

        this.sceneContent.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;">
                
                <h2 style="color: var(--accent-color); font-size: 28px; margin-top: 0; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; text-align: center;">Charakterbogen</h2>
                
                <div style="height: 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                    ${tokenMsg}
                </div>

                <div style="width: 100%; max-width: 450px; display: flex; flex-direction: column; gap: 15px;">
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 10px 0; border-bottom: 1px solid #444;">
                        <div style="display: flex; justify-content: center; align-items: center; font-size: 18px;">
                            <span style="color: #aaa; margin-right: 10px;">Stufe:</span> 
                            <span style="color: var(--accent-color); font-weight: bold;">${p.level}</span>
                        </div>
                        <div style="display: flex; justify-content: center; align-items: center; font-size: 18px;">
                            <span style="color: #aaa; margin-right: 10px;">Gold:</span> 
                            <span style="color: #fbbf24; font-weight: bold;">${p.gold || 0} G</span>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; width: 100%;">
                        
                        <div style="position: relative; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding: 10px 0;">
                            <span style="color: #aaa; font-size: 16px;">Leben (HP):</span>
                            <span style="color: #ff6b6b; font-weight: bold; font-size: 18px;">${p.hp} / ${p.maxHp}</span>
                            ${btnHp}
                        </div>

                        <div style="position: relative; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding: 10px 0;">
                            <span style="color: #aaa; font-size: 16px;">Stärke:</span>
                            <span style="color: #fff; font-weight: bold; font-size: 18px;">${p.stats.strength}</span>
                            ${btnStr}
                        </div>

                        <div style="position: relative; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding: 10px 0;">
                            <span style="color: #aaa; font-size: 16px;">Abwehr:</span>
                            <span style="color: #fff; font-weight: bold; font-size: 18px;">${p.stats.defense || 0}</span>
                            ${btnDef}
                        </div>

                    </div>

                    <div style="width: 100%; margin-top: 15px;">
                        <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #aaa;">
                            <span style="text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Erfahrung</span> 
                            <span>${p.xp} / ${nextXp} XP</span>
                        </div>
                        <div style="width: 100%; height: 16px; background: #111; border: 1px solid #333; position: relative; box-shadow: inset 0 2px 5px rgba(0,0,0,0.8);">
                            <div style="height: 100%; background: linear-gradient(90deg, #7c3aed, #a855f7); width: ${xpPercent}%; transition: width 0.3s;"></div>
                        </div>
                    </div>

                </div>
            </div>`;
        break;
      case "shop":
        const pShop = state.player;
        const merchant = Definitions.merchants.traveling_merchant;
        const sel = this.shopSelection;

        // --- LISTEN AUFBEREITEN ---
        const sellableList = [];
        (pShop.weapons || []).forEach((w, idx) => {
          if (pShop.equipped.weapon && pShop.equipped.weapon.id === w.id)
            return;
          sellableList.push({
            type: "weapon",
            originalIndex: idx,
            item: w,
            price: w.goldValue || w.value || 5,
            maxQty: 1,
          });
        });
        (pShop.inventory || []).forEach((i, idx) => {
          const priceVal = i.goldValue || i.value || 1;
          sellableList.push({
            type: "inventory",
            originalIndex: idx,
            item: i,
            price: priceVal,
            maxQty: i.quantity || 1,
          });
        });

        // --- LINKE SEITE (Verkaufen) ---
        let sellHTML = "";
        sellableList.forEach((entry, index) => {
          const isSelected = sel.side === "sell" && sel.index === index;
          const qtyBadge =
            entry.type === "inventory" && entry.maxQty > 1
              ? `<span style="color: #fbbf24; margin-left: 10px;">x${entry.maxQty}</span>`
              : "";
          const bgClass = isSelected
            ? "background: #222; border-color: var(--accent-color);"
            : "background: rgba(0,0,0,0.5); border-color: #444;";

          sellHTML += `
                <div style="${bgClass} border-width: 2px; border-style: solid; padding: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;"
                     onclick="window.gameAPI.selectShopItem('sell', ${index})">
                    <div style="display:flex; flex-direction:column; gap: 4px;">
                        <span style="font-size: 16px; color: ${isSelected ? "var(--accent-color)" : "#fff"}; font-weight: bold;">${entry.item.name}${qtyBadge}</span>
                        <span style="font-size: 12px; color: #fbbf24;">Wert: ${entry.price} G</span>
                    </div>
                </div>
            `;
        });
        if (!sellHTML)
          sellHTML =
            "<p style='color: #666; font-style: italic; text-align: center; margin-top: 20px;'>Nichts zu verkaufen.</p>";

        // --- RECHTE SEITE (Kaufen) ---
        let buyHTML = "";
        merchant.offers.forEach((offer, index) => {
          const isSelected = sel.side === "buy" && sel.index === index;
          const itemDef =
            Definitions.items[offer.id] || Definitions.weapons[offer.id];
          if (!itemDef) return;
          const bgClass = isSelected
            ? "background: #222; border-color: var(--accent-color);"
            : "background: rgba(0,0,0,0.5); border-color: #444;";

          buyHTML += `
                <div style="${bgClass} border-width: 2px; border-style: solid; padding: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;"
                     onclick="window.gameAPI.selectShopItem('buy', ${index})">
                    <div style="display:flex; flex-direction:column; gap: 4px;">
                        <span style="font-size: 16px; color: ${isSelected ? "var(--accent-color)" : "#fff"}; font-weight: bold;">${itemDef.name}</span>
                        <span style="font-size: 12px; color: #fbbf24;">Preis: ${offer.price} G</span>
                    </div>
                </div>
            `;
        });

        this.sceneContent.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 10; display: flex; flex-direction: column; align-items: center; padding-top: 40px; padding-bottom: 20px;">
                
                <div style="display: flex; justify-content: space-between; width: 100%; max-width: 1100px; margin-bottom: 20px; align-items: flex-end;">
                    <h2 style="color: var(--accent-color); margin: 0;">${merchant.name}</h2>
                    <div style="font-size: 24px; color: #fbbf24; font-weight: bold;">🪙 ${pShop.gold || 0} Gold</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; width: 100%; max-width: 1100px; flex: 1; min-height: 0;">
                    
                    <div style="background: rgba(0,0,0,0.5); border: 2px solid #444; display: flex; flex-direction: column; min-height: 0;">
                        <h3 style="color: #aaa; margin: 0; padding: 15px; border-bottom: 2px solid #333; text-align: center; background: rgba(0,0,0,0.8); flex-shrink: 0;">Dein Inventar (Verkaufen)</h3>
                        <div style="overflow-y: auto; flex: 1; padding: 15px;">
                            ${sellHTML}
                        </div>
                    </div>

                    <div style="background: rgba(0,0,0,0.5); border: 2px solid #444; display: flex; flex-direction: column; min-height: 0;">
                        <h3 style="color: #aaa; margin: 0; padding: 15px; border-bottom: 2px solid #333; text-align: center; background: rgba(0,0,0,0.8); flex-shrink: 0;">Angebot (Kaufen)</h3>
                        <div style="overflow-y: auto; flex: 1; padding: 15px;">
                            ${buyHTML}
                        </div>
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
        const invWeapons = (p.inventory || []).filter(
          (i) => i.type === "weapon" || i.damage !== undefined,
        );
        const allWeapons = [...(p.weapons || []), ...invWeapons];

        const currentWeaponId = p.equipped.weapon ? p.equipped.weapon.id : null;

        let weaponsHTML = "";
        if (allWeapons.length === 0) {
          weaponsHTML =
            '<div class="no-items" style="text-align:center; color:#888; font-size: 18px; margin-top: 40px;">Keine Waffen verfügbar. Stelle eine im Ritual her oder finde eine!</div>';
        } else {
          weaponsHTML = allWeapons
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
                        <span style="font-weight:bold; font-size: 18px; color:${accentColor}">${item.name}${item.quantity > 1 ? ` <span style="color: #fbbf24; font-size: 14px;">x${item.quantity}</span>` : ""}</span>
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
                                        <span style="font-size: 16px; color: var(--accent-color); font-weight: bold;">${item.name}${item.quantity > 1 ? ` <span style="color: #fbbf24; font-size: 12px; margin-left: 5px;">x${item.quantity}</span>` : ""}</span>
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

      case "world_selection":
        let worldsHTML = "";
        const defeated = p.defeatedBosses || [];

        Object.values(Definitions.worlds).forEach((world) => {
          const isUnlocked =
            !world.requiredBoss || defeated.includes(world.requiredBoss);
          const bossDef = Definitions.enemies[world.bossId];
          const bossName = bossDef ? bossDef.name : "Unbekannt";

          if (isUnlocked) {
            worldsHTML += `
                    <div style="background: rgba(0,0,0,0.7); border: 2px solid var(--accent-color); padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; justify-content: space-between;"
                         onclick="window.gameAPI.startWorldCrawl('${world.id}')"
                         onmouseover="this.style.background='rgba(40,40,40,0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.7)'">
                        <div>
                            <h3 style="color: var(--accent-color); margin: 0 0 10px 0; font-size: 24px;">${world.name}</h3>
                            <p style="color: #aaa; font-size: 14px; margin-bottom: 15px;">${world.description}</p>
                        </div>
                        <div style="border-top: 1px solid #444; padding-top: 10px; font-size: 12px; color: #ff6b6b; font-weight: bold;">
                            Boss: ${bossName}
                        </div>
                    </div>
                `;
          } else {
            worldsHTML += `
                    <div style="background: rgba(0,0,0,0.5); border: 2px solid #444; padding: 20px; text-align: center; opacity: 0.5; filter: grayscale(1); display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <h3 style="color: #666; margin: 0 0 10px 0; font-size: 24px;">???</h3>
                            <p style="color: #444; font-size: 14px; margin-bottom: 15px;">Diese Welt ist noch gesperrt.</p>
                        </div>
                        <div style="border-top: 1px solid #333; padding-top: 10px; font-size: 12px; color: #666;">
                            Besiege den Boss der vorherigen Welt.
                        </div>
                    </div>
                `;
          }
        });

        this.sceneContent.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 10; display: flex; flex-direction: column; align-items: center; padding-top: 50px;">
                <h2 style="color: var(--accent-color); margin-bottom: 30px; font-size: 32px; text-transform: uppercase; letter-spacing: 2px;">Wähle dein Ziel</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; width: 100%; max-width: 1000px; padding: 20px;">
                    ${worldsHTML}
                </div>
            </div>`;
        break;

      default:
        this.sceneContent.innerHTML = `<div class="static-screen-overlay"><h2>${this.activeScreen}</h2><p>In Arbeit...</p></div>`;
    }
  }
}
