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

        // Basis HUD (Player Stats)
        let html = `
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

        // --- NEU: Crawl Stats (nur wenn aktiv) ---
        if (state.crawl && state.crawl.active) {
            const sec = state.crawl.security;
            const chaos = state.crawl.chaos;

            html += `
                <div class="crawl-stats">
                    <div class="stat-row">
                        <span class="stat-label" style="color:#d6bcfa">Chaos</span>
                        <span class="stat-value chaos-value">${chaos}</span>
                    </div>

                    <div class="bar-label">
                        <span>Sicherheit</span>
                        <span>${sec}%</span>
                    </div>
                    <div class="bar-container">
                        <div class="security-fill" style="width: ${sec}%"></div>
                    </div>
                </div>
            `;
        }

        this.container.innerHTML = html;
    }
}