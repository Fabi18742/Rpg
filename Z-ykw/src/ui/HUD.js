import { stateManager } from "../engine/StateManager.js";

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

    if (
      state.crawl &&
      state.crawl.active &&
      (!state.combat || !state.combat.active) &&
      !state.crawl.activeEvent
    ) {
      const chaos = state.crawl.chaos || 0;
      const sec = state.crawl.security || 0;

      html += `
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
    this.container.style.display = html ? "block" : "none";
  }
}
