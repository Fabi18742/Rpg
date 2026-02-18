// src/ui/BattleUI.js
import { stateManager } from "../engine/StateManager.js";
import { Definitions } from "../data/definitions.js";

export class BattleUI {
  constructor(elementId) {
    this.container = document.getElementById(elementId);

    stateManager.subscribe((state) => {
      this.render(state);
    });

    this.render(stateManager.getState());
  }

render(state) {
    if (!this.container) return;

    // Im Hideout ausblenden
    if (state.location === 'hideout') {
        this.container.style.display = 'none';
        return;
    }

    // Log-Fenster sicherstellen
    const logWindow = document.getElementById('log-window');
    if (logWindow) logWindow.style.display = 'flex';

    // FALL 1: KAMPF LÄUFT (Neue Multi-Target Logik)
    // Wir prüfen auf state.combat.active und ob Gegner da sind
    if (state.combat && state.combat.active && state.combat.enemies.length > 0) {
      
      const enemies = state.combat.enemies;
      const player = state.player;
      const targetIndex = state.combat.targetIndex; // Wen greifen wir an?

      // 1. Gegner-Liste generieren
      const enemiesHTML = enemies.map((enemy, index) => {
          const isDead = enemy.hp <= 0;
          const isSelected = index === targetIndex;
          const hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);

          // Styling für Karte (Ausgewählt vs Normal vs Tot)
          let cardStyle = "padding: 10px; margin-bottom: 8px; background: #222; border: 2px solid #444; cursor: pointer; transition: all 0.2s;";
          
          if (isDead) {
              cardStyle += " opacity: 0.5; filter: grayscale(100%); border-color: #333; cursor: default;";
          } else if (isSelected) {
              cardStyle += " border-color: #fbbf24; background: #2a2a2a; transform: scale(1.02);";
          }

          // Klick-Handler nur für lebende Gegner
          const onClick = isDead ? '' : `onclick="window.gameAPI.setTarget(${index})"`;
          // Indikator-Pfeil für das Ziel
          const selectionIndicator = isSelected ? '<span style="color: #fbbf24; float: right;">◀ Ziel</span>' : '';

          return `
            <div class="enemy-card" style="${cardStyle}" ${onClick}>
                <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                    <strong style="color: ${isSelected ? '#fbbf24' : '#fff'};">
                        ${isDead ? '💀 ' : ''}${enemy.name}
                    </strong>
                    <span style="font-size: 0.9em; color: #ccc;">${enemy.hp} / ${enemy.maxHp}</span>
                </div>
                <div style="width:100%; height: 6px; background: #111; border-radius: 2px; overflow: hidden;">
                    <div style="width: ${hpPercent}%; height: 100%; background: #ff6b6b; transition: width 0.2s;"></div>
                </div>
                ${!isDead && isSelected ? `<div style="font-size: 10px; color: #fbbf24; text-align: right; margin-top: 2px;"></div>` : ''}
            </div>
          `;
      }).join("");

      // 2. Skill-Buttons generieren (Wie vorher)
      const skills = player.skills || ["normal_attack"];
      const buttonsHTML = skills.map((skillId) => {
          const skill = Definitions.abilities[skillId];
          if (!skill) return "";

          const cost = skill.apCost || 0;
          const hasEnoughAp = player.currentAp >= cost;
          
          // Ausgrauen, wenn zu wenig AP
          const disabledAttr = hasEnoughAp ? "" : 'disabled style="opacity: 0.5; cursor: not-allowed;"';

          return `<button class="game-button" onclick="window.gameAPI.useSkill('${skillId}')" ${disabledAttr}>
                    ${skill.name} <br><span style="font-size:0.7em; color: #fbbf24;">(${cost} AP)</span>
                  </button>`;
        }).join("");

      // 3. HTML Zusammenbauen
      this.container.innerHTML = `
            <div class="enemies-container" style="margin-bottom: 15px; max-height: 250px; overflow-y: auto;">
                ${enemiesHTML}
            </div>
            
            <div style="text-align:center; margin-bottom: 10px; color: #fbbf24; font-weight:bold;">
                AP: ${player.currentAp} / ${player.maxAp}
            </div>

            <div class="button-row" style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom: 15px;">
                ${buttonsHTML}
            </div>

            <div style="display: flex; justify-content: center; gap: 10px; border-top: 1px solid #444; padding-top: 10px;">
                <button class="game-button" style="padding: 5px 15px; min-height: 40px; font-size: 14px;" onclick="window.gameAPI.toggleInventory()">🎒 Inventar</button>
                <button class="game-button" style="padding: 5px 15px; min-height: 40px; font-size: 14px;" onclick="window.gameAPI.toggleStats()">📊 Stats</button>
            </div>
      `;
      this.container.style.display = "block";
    
    } 
    // FALL 2: CRAWL/EVENT
    else if (state.crawl && state.crawl.choices) {
        this.container.innerHTML = '';
        this.container.style.display = 'none';
    }
    // FALL 3: LEERLAUF
    else {
        this.container.innerHTML = `
            <div style="margin-bottom: 15px; color: #888; text-align: center;">
                Das Gebiet ist ruhig.
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="game-button" onclick="window.gameAPI.searchEnemy()">Weiter suchen 👣</button>
                <button class="game-button" onclick="window.gameAPI.returnHome()">🏠 Heimkehren</button>
            </div>
        `;
        this.container.style.display = 'block';
    }
  }
}
