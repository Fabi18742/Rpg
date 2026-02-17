// src/ui/HUD.js
import { stateManager } from '../engine/StateManager.js';

export class HUD {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        
        // Abonniere State-Updates
        stateManager.subscribe((state) => {
            this.render(state);
        });
    }

    init() {
        const state = stateManager.getState();
        this.render(state);
    }

render(state) {
        if (!this.container) return;

        const player = state.player;
        const weaponName = player.equipped.weapon ? player.equipped.weapon.name : "Fäuste";
        const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));

        this.container.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">LVL ${player.level}</span>
                <span class="stat-value" style="font-size: 0.8em; color: #888;">XP: ${player.xp}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">HP</span>
                <span class="stat-value">${player.hp} / ${player.maxHp}</span>
            </div>
            
            <div class="hp-bar-wrapper">
                <div class="hp-bar-fill" style="width: ${hpPercent}%"></div>
                <div class="hp-text">${Math.round(hpPercent)}%</div>
            </div>

            <div style="margin-top: 10px;"></div>

            <div class="stat-row">
                <span class="stat-label">Waffe</span>
                <span class="stat-value" style="font-size: 0.9em;">${weaponName}</span>
            </div>
        `;
    }
}