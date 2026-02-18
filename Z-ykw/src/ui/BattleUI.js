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

    // FALL 1: KAMPF LÄUFT
    if (state.currentEnemy) {
      const enemy = state.currentEnemy;
      const player = state.player;
      const hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
      const skills = player.skills || ["normal_attack"];

      // Skill-Buttons generieren
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

      this.container.innerHTML = `
            <div style="margin-bottom: 10px; color: #ff6b6b;">
                <strong>VS. ${enemy.name}</strong> 
                (${enemy.hp} / ${enemy.maxHp} HP)
                <div style="width: 100%; height: 5px; background: #333; margin-top: 5px;">
                    <div style="width: ${hpPercent}%; height: 100%; background: #ff6b6b; transition: width 0.2s;"></div>
                </div>
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
