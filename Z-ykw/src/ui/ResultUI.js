import { stateManager } from "../engine/StateManager.js";

export class ResultUI {
  constructor() {
    this.container = document.createElement("div");
    this.container.id = "result-overlay";
    document.getElementById("app").appendChild(this.container);

    stateManager.subscribe((state) => this.render(state));
  }

  render(state) {
    const res = state.activeResult;
    
    if (!res) {
      this.container.style.display = "none";
      return;
    }

    this.container.style.display = "block";
    const messagesHTML = res.messages.map(m => `<div style="margin-bottom: 12px;">${m}</div>`).join("");

    this.container.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
        <div style="background: #111; border: 3px solid var(--accent-color); padding: 40px; text-align: center; max-width: 600px; width: 90%; box-shadow: 0 0 50px rgba(251, 191, 36, 0.2);">
          <h2 style="color: var(--accent-color); font-size: 32px; margin-top: 0; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 2px;">
            ${res.title}
          </h2>
          <div style="font-size: 18px; color: #fff; line-height: 1.5; margin-bottom: 40px;">
            ${messagesHTML}
          </div>
          <button class="game-button" onclick="window.gameAPI.closeResult()" style="width: 250px; margin: 0 auto; min-height: 50px;">WEITER</button>
        </div>
      </div>
    `;
  }
}