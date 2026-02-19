// src/ui/BattleUI.js
import { stateManager } from "../engine/StateManager.js";
import { Definitions } from "../data/definitions.js";
import { windowManager } from "./WindowManager.js";

export class BattleUI {
  constructor(elementId) {
    // Der statische Container wird nur noch für den "Leerlauf" im Dungeon genutzt
    this.container = document.getElementById(elementId);

    stateManager.subscribe((state) => {
      this.render(state);
    });

    this.render(stateManager.getState());
  }

  render(state) {
    // 1. Hideout-Check: Alles ausblenden
    if (state.location === "hideout") {
      if (this.container) this.container.style.display = "none";
      this.hideBattleWindows();
      return;
    }

    // 2. KAMPF LÄUFT
    if (
      state.combat &&
      state.combat.active &&
      state.combat.enemies.length > 0
    ) {
      // Starres UI-Feld leeren
      if (this.container) this.container.style.display = "none";

      // Schwebende Fenster aktualisieren
      this.updateEnemyWindow(state);
      this.updateAbilityWindow(state);
      this.updateControlWindow(state);

      this.applyPreferences();

      // Kampflog sicherstellen
      const logWin = document.getElementById("log-window");
      if (logWin) logWin.style.display = "flex";
    }
    // 3. KEIN KAMPF (Dungeon Leerlauf)
    else {
      this.hideBattleWindows();

      if (state.location === "dungeon" && !state.crawl.choices) {
        if (this.container) {
          this.container.innerHTML = `
                    <div style="margin-bottom: 15px; color: #888; text-align: center;">Das Gebiet ist ruhig.</div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button class="game-button" onclick="window.gameAPI.searchEnemy()">Weiter suchen 👣</button>
                        <button class="game-button" onclick="window.gameAPI.returnHome()">🏠 Heimkehren</button>
                    </div>
                `;
          this.container.style.display = "block";
        }
      } else {
        if (this.container) this.container.style.display = "none";
      }
    }
  }

  applyPreferences() {
    const showInv = localStorage.getItem("pref_inventory_visible") === "true";
    const showStats = localStorage.getItem("pref_stats_visible") === "true";

    const invWin = document.getElementById("inventory-window");
    const statsWin = document.getElementById("stats-window");

    if (invWin) invWin.style.display = showInv ? "flex" : "none";
    if (statsWin) statsWin.style.display = showStats ? "flex" : "none";
  }

  hideBattleWindows() {
    [
      "enemy-window",
      "ability-window",
      "control-window",
      "log-window",
      "inventory-window",
      "stats-window",
    ].forEach((id) => {
      const win = document.getElementById(id);
      if (win) win.style.display = "none";
    });
  }

  updateEnemyWindow(state) {
    const enemiesHTML = state.combat.enemies
      .map((enemy, index) => {
        const isDead = enemy.hp <= 0;
        const isSelected = index === state.combat.targetIndex;
        const hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);

        let style =
          "padding: 10px; margin-bottom: 8px; background: #111; border: 2px solid #444; cursor: pointer;";
        if (isDead)
          style += " opacity: 0.4; filter: grayscale(1); cursor: default;";
        else if (isSelected)
          style += " border-color: #fbbf24; background: #222;";

        const onClick = isDead
          ? ""
          : `onclick="window.gameAPI.setTarget(${index})"`;

        // --- NEU: STATUS-EFFEKTE (BADGES) GENERIEREN ---
        let statusHTML = "";
        if (enemy.statusEffects && enemy.statusEffects.length > 0) {
          statusHTML = enemy.statusEffects
            .map(
              (se) =>
                `<span style="background: #7c3aed; color: white; font-size: 10px; padding: 2px 5px; border-radius: 3px; margin-left: 5px; vertical-align: middle;">${se.name} x${se.stacks}</span>`,
            )
            .join("");
        }

        return `
            <div class="enemy-card" style="${style}" ${onClick}>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; align-items:center;">
                    <div>
                        <strong style="color:${isSelected ? "#fbbf24" : "#fff"}">${isDead ? "💀 " : ""}${enemy.name}</strong>
                        ${statusHTML}
                    </div>
                    <span>${enemy.hp}/${enemy.maxHp}</span>
                </div>
                <div style="width:100%; height:4px; background:#000;"><div style="width:${hpPercent}%; height:100%; background:#ff6b6b;"></div></div>
            </div>`;
      })
      .join("");

    this.ensureWindow(
      "enemy-window",
      "Gegner",
      `<div style="padding:10px;">${enemiesHTML}</div>`,
      { width: "300px", left: "50px", top: "50px" },
    );
  }

  // --- FENSTER 2: FÄHIGKEITEN ---
  updateAbilityWindow(state) {
    const buttonsHTML = state.player.skills
      .map((skillId) => {
        if (!skillId) return "";
        const skill = Definitions.abilities[skillId];
        const cost = skill.apCost || 0;
        const canAfford = state.player.currentAp >= cost;

        const opacity = canAfford ? "1" : "0.3";
        const pointerEvents = canAfford ? "auto" : "none";
        const grayscale = canAfford ? "0" : "1";

        return `
        <div class="ability-button-card" 
             onclick="${canAfford ? `window.gameAPI.useSkill('${skillId}')` : ""}"
             style="width:180px; padding:10px; background:#111; border:2px solid #444; margin:5px; text-align:center; cursor:pointer; 
                    opacity: ${opacity}; pointer-events: ${pointerEvents}; filter: grayscale(${grayscale});">
            <div style="font-weight:bold; color:#fbbf24;">${skill.name}</div>
            <div style="font-size:0.8em; color:#888;">Kosten: ${cost} AP</div>
        </div>`;
      })
      .join("");

    this.ensureWindow(
      "ability-window",
      "Fähigkeiten",
      `<div style="display:flex; flex-direction:column; align-items:center; gap:5px; padding:10px;">${buttonsHTML}</div>`,
      { width: "230px", left: "400px", top: "50px" },
    );
  }

  updateControlWindow(state) {
    const hpPercent = (state.player.hp / state.player.maxHp) * 100;

    let playerStatusHTML = "";
    if (state.player.statusEffects && state.player.statusEffects.length > 0) {
      playerStatusHTML =
        `<div style="margin-bottom: 10px; display: flex; gap: 5px;">` +
        state.player.statusEffects
          .map(
            (se) =>
              `<span style="background: #7c3aed; color: white; font-size: 11px; padding: 2px 6px; border-radius: 3px;">${se.name} x${se.stacks}</span>`,
          )
          .join("") +
        `</div>`;
    }

    const content = `
        <div style="padding:15px;">
            ${playerStatusHTML}
            <div style="margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:bold;"><span>HP</span><span>${state.player.hp}/${state.player.maxHp}</span></div>
                <div style="width:100%; height:12px; background:#000; border:1px solid #444;"><div style="width:${hpPercent}%; height:100%; background:#dc2626;"></div></div>
            </div>
            <div style="text-align:center; color:#fbbf24; font-weight:bold; margin-bottom:15px; font-size:1.2em;">⚡ AP: ${state.player.currentAp}/${state.player.maxAp}</div>
            <div style="display:flex; gap:10px; justify-content:center;">
                <button class="game-button" style="min-height:40px; padding:5px 15px;" onclick="window.gameAPI.toggleInventory()">🎒 Inv.</button>
                <button class="game-button" style="min-height:40px; padding:5px 15px;" onclick="window.gameAPI.toggleStats()">📊 Stats</button>
            </div>
        </div>`;

    this.ensureWindow("control-window", "Status", content, {
      width: "300px",
      left: "400px",
      top: "350px",
    });
  }

  // Helper, um Fenster sicher zu erstellen oder nur den Inhalt zu updaten
  ensureWindow(id, title, contentHTML, pos) {
    let win = document.getElementById(id);
    if (!win) {
      win = document.createElement("div");
      win.id = id;
      win.className = "draggable-window";
      win.style.position = "fixed";
      win.style.width = pos.width;
      win.style.left = pos.left;
      win.style.top = pos.top;
      win.innerHTML = `
            <div class="window-header"><span class="window-title">${title}</span><div class="window-controls"><div class="win-btn minimize-btn">_</div></div></div>
            <div class="window-content"></div>`;
      document.body.appendChild(win);
      windowManager.addWindow(win, id);
    }
    win.querySelector(".window-content").innerHTML = contentHTML;
    win.style.display = "flex";
  }
}
