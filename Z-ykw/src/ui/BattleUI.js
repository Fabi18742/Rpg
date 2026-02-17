// src/ui/BattleUI.js
import { stateManager } from '../engine/StateManager.js';

export class BattleUI {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        
        // Wir abonnieren den State, um zu wissen: Kampf oder Suche?
        stateManager.subscribe((state) => {
            this.render(state);
        });
        
        // Einmaliges initiales Rendern
        this.render(stateManager.getState());
    }

    render(state) {
        if (!this.container) return;

        if (state.currentEnemy) {
            // --- KAMPF MODUS ---
            const enemy = state.currentEnemy;
            const hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);

            this.container.innerHTML = `
                <div style="margin-bottom: 10px; color: #ff6b6b;">
                    <strong>VS. ${enemy.name}</strong> 
                    (${enemy.hp} / ${enemy.maxHp} HP)
                    <div style="width: 100%; height: 5px; background: #333; margin-top: 5px;">
                        <div style="width: ${hpPercent}%; height: 100%; background: #ff6b6b; transition: width 0.2s;"></div>
                    </div>
                </div>
                <div class="button-row">
                    <button class="game-button" onclick="window.gameAPI.attack()">⚔️ Angriff</button>
                </div>
            `;
        } else {
            // --- SUCH MODUS ---
            this.container.innerHTML = `
                <div style="margin-bottom: 10px; color: #888;">
                    Kein Gegner in Sicht.
                </div>
                <button class="game-button" onclick="window.gameAPI.searchEnemy()">👁️ Gegner suchen</button>
            `;
        }
    }
}