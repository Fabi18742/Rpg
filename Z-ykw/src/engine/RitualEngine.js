// src/engine/RitualEngine.js
import { Definitions } from "../data/definitions.js";

export class RitualEngine {
    static calculateResult(items) {
        if (items.length !== 6) return null;

        // 1. Gesamtstärke berechnen
        const totalPower = items.reduce((sum, item) => sum + (item.ritualValue || 0), 0);

        // 2. Häufigsten Modifikator bestimmen
        const modifiers = items.map(i => i.modifierType).filter(m => m);
        const counts = {};
        modifiers.forEach(m => counts[m] = (counts[m] || 0) + 1);
        
        let bestModifier = "none";
        let maxCount = 0;
        for (const [mod, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                bestModifier = mod;
            }
        }

        // 3. Ergebnis-Waffe generieren (Einfache Logik für den Anfang)
        // Die Stärke bestimmt den Schaden
        return {
            name: `Ritual-Klinge (${bestModifier})`,
            type: "weapon",
            damage: Math.floor(totalPower * 1.5),
            critChance: maxCount * 5, // Mehr gleiche Materialien = mehr Crit
            effect: bestModifier !== "none" ? bestModifier : null,
            value: totalPower * 2
        };
    }
}