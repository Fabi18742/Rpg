// src/engine/RitualEngine.js
import { Definitions } from "../data/definitions.js";

export class RitualEngine {
    
    static calculateResult(items) {
        if (!items || items.length !== 6) return null;

        // 1. Power berechnen
        const totalPower = items.reduce((sum, item) => sum + (item.ritualValue || 0), 0);

        // 2. Effekt finden
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

        // 3. LOGIK-ÄNDERUNG: Suche in Definitions.weapons OHNE Prefix-Filter
        // Wir nehmen alle Waffen, die einen ritualValue haben
        const possibleWeapons = Object.values(Definitions.weapons).filter(w => w.ritualValue !== undefined);
        
        // Sortiere nach Abstand zum totalPower
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
            id: `${baseWeapon.id}_${Date.now()}`, // Unique ID basierend auf Original-ID
            name: `${bestModifier !== 'none' ? getNamePrefix(bestModifier) + ' ' : ''}${baseWeapon.name}`,
            // Bonus-Schaden durch "Reinheit" des Rituals (viele gleiche Zutaten)
            damage: baseWeapon.damage + (maxCount > 3 ? maxCount : 0),
            effects: [] 
        };

        if (bestModifier !== "none" && Definitions.effects[bestModifier]) {
            resultItem.effects.push(bestModifier);
            resultItem.description += ` Sie pulsiert vor ${Definitions.effects[bestModifier].name}-Energie.`;
        }

        return resultItem;
    }
}

function getNamePrefix(modifier) {
    const prefixes = {
        sharpness: "Scharfes",
        poison: "Giftiges",
        defense: "Härtendes",
        lifesteal: "Blutiges"
    };
    return prefixes[modifier] || "Magisches";
}