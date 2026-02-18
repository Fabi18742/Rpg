// src/ui/HideoutUI.js
import { stateManager } from "../engine/StateManager.js";
import { Definitions } from "../data/definitions.js";

export class HideoutUI {
  constructor(elementId) {
    this.container = document.getElementById(elementId);
    this.visualArea = document.querySelector(".visual-area");
    this.sceneContent = document.getElementById("scene-content");

    // Interner Zustand für den aktuellen Sub-Screen im Hideout
    this.activeScreen = "main"; // 'main', 'stats', 'inventory', 'equipment', 'ritual'

    // API für die Buttons registrieren
    window.gameAPI.switchHideoutScreen = (screen) => this.setScreen(screen);

    stateManager.subscribe((state) => {
      this.render(state);
    });

    this.render(stateManager.getState());
  }

  setScreen(screen) {
    this.activeScreen = screen;
    this.render(stateManager.getState());
  }

  render(state) {
    if (!this.container || state.location !== "hideout") {
      this.container.style.display = "none";
      if (this.visualArea) this.visualArea.classList.remove("hideout-bg");
      return;
    }

    this.container.style.display = "block";
    if (this.visualArea) this.visualArea.classList.add("hideout-bg");

    const windowsToHide = ["log-window", "inventory-window", "stats-window"];
    windowsToHide.forEach((id) => {
      const win = document.getElementById(id);
      if (win) win.style.display = "none";
    });

    this.renderActionArea(state);
    this.renderVisualArea(state);
  }

  // UNTEN: Das klassische 3x2 Grid oder der "Zurück" Button
  renderActionArea(state) {
    if (this.activeScreen === "main") {
      this.container.innerHTML = `
                <div class="button-grid hideout-grid">
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('equipment')">Ausrüstung</button>
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('shop')">Shop</button>
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('stats')">Stats</button>
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('inventory')">Inventar</button>
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('ritual')">Das Ritual</button>
                    <button class="game-button adventure-btn" onclick="window.gameAPI.startAdventure()">Boss-Kämpfe</button>
                </div>
            `;
    } else {
      this.container.innerHTML = `
                <div class="button-grid single-button">
                    <button class="game-button" onclick="window.gameAPI.switchHideoutScreen('main')">Zurück</button>
                </div>
            `;
    }
  }

  // OBEN: Die statischen Inhalte auf dem Hintergrund
  renderVisualArea(state) {
    if (!this.sceneContent) return;
    this.sceneContent.style.opacity = "1";

    const p = state.player;

    switch (this.activeScreen) {
      case "main":
        this.sceneContent.innerHTML = "";
        break;
      case "stats":
        this.sceneContent.innerHTML = `
                    <div class="static-screen-overlay">
                        <h2>Charakterbogen</h2>
                        <div class="stat-grid-large">
                            <div class="stat-entry"><span>Stufe:</span> <span>${p.level}</span></div>
                            <div class="stat-entry"><span>XP:</span> <span>${p.xp}</span></div>
                            <div class="stat-entry"><span>HP:</span> <span>${p.hp} / ${p.maxHp}</span></div>
                            <div class="stat-entry"><span>Stärke:</span> <span>${p.stats.strength}</span></div>
                            <div class="stat-entry"><span>Abwehr:</span> <span>${p.stats.defense}</span></div>
                        </div>
                    </div>`;
        break;
      case "inventory":
        const itemsHTML = p.inventory
          .map(
            (item) => `
                    <div class="static-inv-item">
                        <span>${item.name}</span>
                        <button class="small-btn" onclick="window.gameAPI.useItem('${item.id}')">Nutzen</button>
                    </div>
                `,
          )
          .join("");
        this.sceneContent.innerHTML = `
                    <div class="static-screen-overlay">
                        <h2>Inventar</h2>
                        <div class="static-inventory-grid">${itemsHTML || "Leer"}</div>
                    </div>`;
        break;
      case "ritual":
        const ritualItems = state.ritual.selectedItems;
        const availableRitualItems = state.player.inventory.filter(
          (i) => i.type === "ritual",
        );

        this.sceneContent.innerHTML = `
            <div class="static-screen-overlay">
                <h2>Das Alchemie-Ritual</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <p style="font-size: 12px; color: #888;">Wähle 6 Ritual-Komponenten</p>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px;">
                            ${[0, 1, 2, 3, 4, 5]
                              .map((idx) => {
                                const item = ritualItems[idx];
                                return `
                                    <div onclick="window.gameAPI.removeFromRitual(${idx})" 
                                         style="width: 60px; height: 60px; border: 2px dashed #444; background: #000; cursor: pointer;">
                                        ${item ? `<span>✨</span>` : ""}
                                    </div>`;
                              })
                              .join("")}
                        </div>
                        </div>

                    <div style="border-left: 1px solid #333; padding-left: 20px; max-height: 300px; overflow-y: auto;">
                        <p style="font-size: 12px; color: #888;">Verfügbare Ritual-Zutaten:</p>
                        ${
                          availableRitualItems.length > 0
                            ? availableRitualItems
                                .map(
                                  (item) => `
                                <div class="static-inv-item" style="margin-bottom: 5px; padding: 5px;">
                                    <span style="font-size: 13px;">${item.name}</span>
                                    <button class="small-btn" onclick="window.gameAPI.addToRitual('${item.id}')">+</button>
                                </div>`,
                                )
                                .join("")
                            : "<p style='font-size:11px; color:#555'>Keine Ritualgegenstände im Inventar.</p>"
                        }
                    </div>
                </div>
            </div>`;
        break;

      default:
        this.sceneContent.innerHTML = `<div class="static-screen-overlay"><h2>${this.activeScreen}</h2><p>In Arbeit...</p></div>`;
    }
  }
}
