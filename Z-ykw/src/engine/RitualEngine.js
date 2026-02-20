// src/engine/RitualEngine.js
import { Definitions } from "../data/definitions.js";

export class RitualEngine {
    
    static calculateResult(items) {
        if (!items || items.length !== 6) return null;

        // 1. Power berechnen
        const totalPower = items.reduce((sum, item) => sum + (item.ritualValue || 0), 0);

        // 2. Effekt zufällig basierend auf Wahrscheinlichkeit bestimmen
        const modifiers = items.map(i => i.modifierType).filter(m => m);
        
        let selectedModifier = "none";
        if (modifiers.length > 0) {
            const randomIndex = Math.floor(Math.random() * modifiers.length);
            selectedModifier = modifiers[randomIndex];
        }

        // 3. Waffe in definitions.js finden, die am nächsten am totalPower liegt
        const possibleWeapons = Object.values(Definitions.weapons).filter(w => w.ritualValue !== undefined);
        
        possibleWeapons.sort((a, b) => {
            const diffA = Math.abs(a.ritualValue - totalPower);
            const diffB = Math.abs(b.ritualValue - totalPower);
            return diffA - diffB;
        });

        const baseWeapon = possibleWeapons[0]; // Das beste Match

        if (!baseWeapon) {
            console.error("Keine passenden Waffen in definitions.js gefunden!");
            return null;
        }

        // 4. Item generieren
        const resultItem = {
            ...baseWeapon,
            id: `${baseWeapon.id}_${Date.now()}`,
            name: baseWeapon.name,
            damage: baseWeapon.damage,
            effects: [] 
        };

        if (selectedModifier !== "none" && Definitions.effects[selectedModifier]) {
            resultItem.effects.push(selectedModifier);
            const descAddition = ` Sie pulsiert vor ${Definitions.effects[selectedModifier].name}-Energie.`;
            resultItem.description = resultItem.description 
                ? resultItem.description + descAddition 
                : descAddition.trim();
        }

        return resultItem;
    }
}