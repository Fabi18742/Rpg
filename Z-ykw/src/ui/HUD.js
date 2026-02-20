import { stateManager } from "../engine/StateManager.js";
import { Definitions } from "../data/definitions.js"; 

export class HUD {
  constructor(elementId) {
    this.container = document.getElementById(elementId);

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

    let html = "";

    // HIER IST DER TRICK: Wenn showingInventory "true" ist, wird das kleine Fenster nicht gezeichnet!
    if (
      state.crawl &&
      state.crawl.active &&
      (!state.combat || !state.combat.active) &&
      !state.crawl.activeEvent &&
      !state.crawl.showingInventory 
    ) {
      const chaos = state.crawl.chaos || 0;
      const curSec = state.crawl.security || 0;
      
      const maxSec = Definitions.worlds[state.crawl.worldId].baseSecurity;
      const secPercent = Math.max(0, (curSec / maxSec) * 100);

      const isSafeZone = secPercent > 0 && Math.ceil(secPercent / 10) % 2 === 0;
      const textColor = isSafeZone ? "#4ade80" : "#ff6b6b";

      const glowStyle = secPercent <= 10 ? "2px 0 10px rgba(251, 191, 36, 0.9)" : "none";

      html += `
                <div class="crawl-stats" style="margin-top: 0; border-top: none;">
                    <div class="stat-row">
                        <span class="stat-label" style="color:#d6bcfa">Chaos</span>
                        <span class="stat-value chaos-value">${chaos}</span>
                    </div>
                    <div class="bar-label" style="color: ${textColor}; font-weight: bold; transition: color 0.3s ease;">
                        <span>Sicherheit</span>
                        <span>${curSec} / ${maxSec}</span>
                    </div>
                    <div class="bar-container">
                        <div class="security-fill" style="width: ${secPercent}%; background-color: transparent; box-shadow: ${glowStyle};"></div>
                    </div>
                </div>
            `;
    }

    this.container.innerHTML = html;
    this.container.style.display = html ? "block" : "none";
  }
}