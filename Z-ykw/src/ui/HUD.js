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

// src/ui/HUD.js

  render(state) {
    if (!this.container) return;

    let html = "";

    // Das HUD zeigt NUR Crawl-Stats (Sicherheit/Chaos), wenn man im Dungeon ist
    if (state.crawl && state.crawl.active) {
      const sec = state.crawl.security;
      const chaos = state.crawl.chaos;

      html = `
                <div class="crawl-stats" style="margin-top: 0; border-top: none;">
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
    
    // Container komplett verstecken, wenn kein Crawl läuft (kein leerer schwarzer Kasten)
    this.container.style.display = html ? "block" : "none";
  }
}