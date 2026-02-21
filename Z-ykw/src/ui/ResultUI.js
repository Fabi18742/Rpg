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
    const messagesHTML = res.messages
      .map((m) => `<div style="margin-bottom: 12px;">${m}</div>`)
      .join("");
    const isDeath = res.context === "combat_loss";

    const bgOpacity = isDeath ? "rgba(40, 0, 0, 0.95)" : "rgba(0,0,0,0.9)";
    const borderColor = isDeath ? "#8b0000" : "var(--accent-color)";
    
    const titleColor = isDeath ? "#ff4444" : "var(--accent-color)";
    const textColor = isDeath ? "#ffcccc" : "#fff";
    const buttonStyle = isDeath ? "border-color: #8b0000; color: #ff4444;" : "";

    this.container.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: ${bgOpacity}; z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
        <div style="background: #111; border: 3px solid ${borderColor}; padding: 40px; text-align: center; max-width: 600px; width: 90%;">
          <h2 style="color: ${titleColor}; font-size: 32px; margin-top: 0; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 2px; ${isDeath ? "text-shadow: 2px 2px 10px #000;" : ""}">
            ${res.title}
          </h2>
          
          <div style="font-size: 18px; color: ${textColor}; line-height: 1.5; margin-bottom: 40px; max-height: 50vh; overflow-y: auto; padding-right: 15px; ${isDeath ? "font-style: italic;" : ""}">
            ${messagesHTML}
          </div>
          
          <button class="game-button" onclick="window.gameAPI.closeResult()" style="width: 250px; margin: 0 auto; min-height: 50px; ${buttonStyle}">WEITER</button>
        </div>
      </div>
    `;
  }
}