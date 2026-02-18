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

    // WICHTIG: Wenn wir im Hideout sind -> BattleUI komplett ausblenden!
    // Die Steuerung übernimmt dort die HideoutUI.
    if (state.location === 'hideout') {
        this.container.style.display = 'none';
        return;
    }

    const logWindow = document.getElementById('log-window');
    if (logWindow) logWindow.style.display = 'flex';

    // FALL 1: KAMPF LÄUFT
    if (state.currentEnemy) {
      const enemy = state.currentEnemy;
      const hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
      const skills = state.player.skills || ["normal_attack"];
      
      const buttonsHTML = skills.map((skillId) => {
          const skill = Definitions.abilities[skillId];
          if (!skill) return '';
          return `<button class="game-button" onclick="window.gameAPI.useSkill('${skillId}')">${skill.name}</button>`;
        }).join("");

      this.container.innerHTML = `
            <div style="margin-bottom: 10px; color: #ff6b6b;">
                <strong>VS. ${enemy.name}</strong> 
                (${enemy.hp} / ${enemy.maxHp} HP)
                <div style="width: 100%; height: 5px; background: #333; margin-top: 5px;">
                    <div style="width: ${hpPercent}%; height: 100%; background: #ff6b6b; transition: width 0.2s;"></div>
                </div>
            </div>
            <div class="button-row" style="display:flex; gap:5px; flex-wrap:wrap;">
                ${buttonsHTML}
            </div>
      `;
      this.container.style.display = 'block';
    } 
    // FALL 2: KARTEN-AUSWAHL AKTIV (CrawlUI übernimmt)
    else if (state.crawl && state.crawl.choices) {
        this.container.innerHTML = '';
        this.container.style.display = 'none';
    }
    // FALL 3: LEERLAUF IM DUNGEON (Zwischen Kämpfen)
    else {
        // Hier bieten wir an, weiterzumachen ODER nach Hause zu gehen
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