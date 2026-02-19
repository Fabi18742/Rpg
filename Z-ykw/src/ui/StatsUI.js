// src/ui/StatsUI.js
import { stateManager } from "../engine/StateManager.js";
import { windowManager } from "./WindowManager.js";
import { Definitions } from "../data/definitions.js";

export class StatsUI {
  constructor() {
    this.windowId = "stats-window";
    this.container = null;

    this.createWindow();

    // Updates abonnieren
    stateManager.subscribe((state) => {
      this.render(state);
    });
  }

  createWindow() {
    const win = document.createElement("div");
    win.id = this.windowId;
    win.className = "draggable-window";
    // Positionierung etwas rechts vom Inventar
    win.style.width = "280px";
    win.style.height = "420px";
    win.style.left = "460px";
    win.style.top = "80px";
    win.style.display = "none"; // Standardmäßig versteckt

    win.innerHTML = `
            <div class="window-header">
                <span class="window-title">Charakter</span>
                <div class="window-controls">
                    <div class="win-btn minimize-btn">_</div>
                </div>
            </div>
            <div class="window-content" style="padding: 15px; color: #e0e0e0;">
                <div id="stats-content"></div>
            </div>
        `;

    document.body.appendChild(win);
    this.container = win.querySelector("#stats-content");
    windowManager.addWindow(win, this.windowId);
  }

  render(state) {
    if (!this.container) return;

    const p = state.player;
    const weapon = p.equipped.weapon;
    const armor = p.equipped.armor;

    // --- BERECHNUNGEN (Total Stats) ---
    const str = p.stats.strength || 0;
    const wepDmg = weapon ? weapon.damage : 0;
    const totalAtk = str + wepDmg;

    const defBase = p.stats.defense || 0;
    const armorDef = armor ? armor.defense : 0;
    const totalDef = defBase + armorDef;

    const critBase = p.stats.critChance || 5;
    const wepCrit = weapon ? weapon.critChance || 0 : 0;
    const totalCrit = critBase + wepCrit;

    // Namen der Skills auflösen
    const skillNames = (p.skills || [])
      .map((id) => {
        const def = Definitions.abilities[id];
        return def ? def.name : id;
      })
      .join(", ");

    const tokens = p.tokens || 0;
    const tokenAlert =
      tokens > 0
        ? `<div style="color: #fbbf24; font-weight: bold; margin-top: 8px;">Level Up! (${tokens} Token)</div>`
        : "";
    const nextXp = p.level * 100;

    this.container.innerHTML = `
            <div style="text-align: center; border-bottom: 1px solid #444; padding-bottom: 10px; margin-bottom: 15px;">
                <div style="font-size: 1.4em; font-weight: bold; color: #fbbf24;">Stufe ${p.level}</div>
                <div style="font-size: 0.9em; color: #888;">${p.xp} / ${nextXp} XP</div>
                ${tokenAlert}
                <div style="font-size: 1.1em; color: #fbbf24; margin-top: 8px; font-weight: bold;">🪙 ${p.gold || 0} Gold</div>
            </div>

            <div class="stat-block" style="margin-bottom: 20px;">
                <div class="stat-row">
                    <strong>❤️ Leben</strong>
                    <span>${p.hp} / ${p.maxHp}</span>
                </div>
            </div>

            <div class="stat-block" style="margin-bottom: 20px;">
                <div class="stat-row">
                    <strong>⚔️ Angriff</strong> 
                    <span style="color: #ff6b6b; font-weight: bold;">${totalAtk}</span>
                </div>
                <div style="font-size: 0.8em; color: #666; text-align: right; margin-top: -3px;">
                    (Basis ${str} + Waffe ${wepDmg})
                </div>
            </div>

            <div class="stat-block" style="margin-bottom: 20px;">
                <div class="stat-row">
                    <strong>🛡️ Rüstung</strong> 
                    <span style="color: #4caf50; font-weight: bold;">${totalDef}</span>
                </div>
                <div style="font-size: 0.8em; color: #666; text-align: right; margin-top: -3px;">
                    (Basis ${defBase} + Rüstung ${armorDef})
                </div>
            </div>

            <div class="stat-block" style="margin-bottom: 20px;">
                <div class="stat-row">
                    <strong>⚡ Kritisch</strong> 
                    <span>${totalCrit}%</span>
                </div>
            </div>

            <div style="border-top: 1px solid #444; padding-top: 10px;">
                <strong style="display:block; margin-bottom: 5px; color: #aaa;">Fähigkeiten:</strong>
                <div style="font-size: 0.9em; line-height: 1.4;">${skillNames}</div>
            </div>
        `;
  }

  toggle() {
    const win = document.getElementById(this.windowId);
    if (win.style.display === "none") {
      win.style.display = "flex";
      this.render(stateManager.getState());
    } else {
      win.style.display = "none";
    }
  }
}
