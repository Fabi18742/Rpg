// src/ui/InventoryUI.js
import { stateManager } from "../engine/StateManager.js";
import { windowManager } from "./WindowManager.js";

export class InventoryUI {
  constructor() {
    this.windowId = "inventory-window";
    this.container = null;

    // Wir erstellen das Fenster-HTML dynamisch beim Start
    this.createWindow();

    // Auf Updates hören
    stateManager.subscribe((state) => {
      this.render(state);
    });
  }

  createWindow() {
    // HTML Struktur für das Fenster bauen
    const win = document.createElement("div");
    win.id = this.windowId;
    win.className = "draggable-window";
    win.style.width = "420px";
    win.style.height = "400px";
    win.style.left = "20px";
    win.style.top = "80px";
    win.style.display = "none";

    win.innerHTML = `
            <div class="window-header">
                <span class="window-title">Inventar</span>
                <div class="window-controls">
                    <div class="win-btn minimize-btn">_</div>
                </div>
            </div>
            <div class="window-content">
                <div id="inventory-list" class="inventory-grid">
                    </div>
            </div>
        `;

    // Ins DOM hängen
    document.body.appendChild(win);

    // Beim WindowManager registrieren
    this.container = win.querySelector("#inventory-list");
    windowManager.addWindow(win, this.windowId);
  }

  render(state) {
    if (!this.container) return;

    // 1. Wir filtern das Inventar: Nur nutzbare Items (Tränke) werden im Kampf angezeigt!
    const consumables = state.player.inventory.filter(
      (item) => item.type === "consumable",
    );

    if (consumables.length === 0) {
      this.container.innerHTML =
        '<div style="grid-column: span 2; padding: 20px; text-align: center; color: #666;">Keine nutzbaren Items</div>';
      return;
    }

    this.container.innerHTML = consumables
      .map((item) => {
        // Menge (Quantity) anzeigen
        const qtyBadge =
          item.quantity && item.quantity > 1
            ? ` <span style="color: #fbbf24; font-size: 12px; margin-left: 5px;">x${item.quantity}</span>`
            : "";

        // 2. Wir lassen die Rüstungs-Abfragen und das "typeLabel" komplett weg,
        // da hier ohnehin nur noch Tränke liegen.
        return `
                <div class="inventory-item" onclick="window.gameAPI.useCombatItem(event, '${item.id}', '${item.name}')">                    <div class="item-icon"></div>
                    <div class="item-details" style="display: flex; align-items: center; height: 100%;">
                        <div class="item-name" style="margin: 0;">${item.name}${qtyBadge}</div>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  toggle() {
    const win = document.getElementById(this.windowId);
    if (win.style.display === "none") {
      win.style.display = "flex";
    } else {
      win.style.display = "none";
    }
  }
}
