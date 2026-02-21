import { stateManager } from "../engine/StateManager.js";

export class ConfirmUI {
  constructor() {
    this.container = document.createElement("div");
    this.container.id = "confirm-overlay";
    document.getElementById("app").appendChild(this.container);

    stateManager.subscribe((state) => this.render(state));
  }

  render(state) {
    const req = state.confirm;

    if (!req) {
      this.container.style.display = "none";
      this.container.innerHTML = "";
      return;
    }

    this.container.style.display = "block";

    if (req.type === "use_item") {
      const itemName = req.data.name;
      
      this.container.innerHTML = `
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px);">
          <div style="background: #0a0a0a; border: 2px solid var(--border-color); padding: 25px; text-align: center; max-width: 350px; box-shadow: 0 0 20px rgba(0,0,0,0.9);">
              <div style="color: var(--accent-color); font-size: 18px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase;">Item nutzen?</div>
              <div style="color: #ccc; font-size: 15px; margin-bottom: 10px;">Möchtest du <strong>${itemName}</strong> wirklich nutzen?</div>
              <div style="color: #666; font-size: 12px; font-style: italic; margin-bottom: 25px;">(Tipp: Shift+Klick nutzt Items sofort)</div>
              
              <div style="display: flex; gap: 15px; justify-content: center;">
                  <button class="game-button" onclick="window.gameAPI.resolveConfirm(false)" style="width: 120px; min-height: 40px; font-size: 14px;">Abbrechen</button>
                <button class="game-button" onclick="window.gameAPI.resolveConfirm(true)" style="width: 120px; min-height: 40px; font-size: 14px; border-color: var(--accent-color); color: var(--accent-color);">Nutzen</button>              </div>
          </div>
        </div>
      `;
    }
  }
}