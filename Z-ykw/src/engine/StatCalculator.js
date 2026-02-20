// src/engine/StatCalculator.js
import { Definitions } from "../data/definitions.js";

export class StatCalculator {

    static calculateAttack(attacker, skill) {
        const stats = attacker.stats || {};
        const weapon = attacker.equipped ? attacker.equipped.weapon : attacker.weapon; 
        
        const baseStr = stats.strength || attacker.strength || 0;
        let weaponDmg = weapon ? (weapon.damage || 0) : 0;
        let activeEffects = []; 
        
        // Passive Waffeneffekte
        if (weapon && weapon.effects) {
            weapon.effects.forEach(effectId => {
                const effectDef = Definitions.effects[effectId];
                if (!effectDef) return;

                if (effectDef.type === "stat_boost" && effectDef.stat === "damage") {
                    weaponDmg += (effectDef.value || 0);
                } 
                else if (effectDef.type === "on_hit") {
                    activeEffects.push(effectId);
                }
            });
        }

        let totalDamage = baseStr + weaponDmg;
        const skillMult = skill ? (skill.damageMult || 1.0) : 1.0;
        totalDamage = Math.floor(totalDamage * skillMult);

        let type = "hieb"; 
        if (skill && skill.damageType) {
            type = skill.damageType;
        } else if (weapon && weapon.damageType) {
            type = weapon.damageType;
        }

        const critResult = this.calculateCrit(attacker, weapon, totalDamage);
        
        return {
            damage: critResult.damage,
            isCrit: critResult.isCrit,
            activeEffects: activeEffects,
            damageType: type // <--- Gibt den Typ an die Kampf-Logik weiter!
        };
    }

    // --- VERTEIDIGUNG MIT SCHWÄCHEN/RESISTENZEN BERECHNEN ---
    static calculateDefense(defender, rawDamage, damageType) {
        const stats = defender.stats || defender; 
        let baseDef = stats.defense || 0;
        
        const armor = defender.equipped ? defender.equipped.armor : null;
        let armorDef = armor ? (armor.defense || 0) : 0;

        if (armor && armor.effects) {
            armor.effects.forEach(effectId => {
                const effectDef = Definitions.effects[effectId];
                if (effectDef && effectDef.type === "stat_boost" && effectDef.stat === "defense") {
                    armorDef += (effectDef.value || 0);
                }
            });
        }

        const totalDef = baseDef + armorDef;
        let finalDamage = Math.max(0, rawDamage - totalDef);

        let effectiveness = "normal";
        
        // Multiplikator für Schlitz, Stich, Hieb
        if (damageType) {
            if (defender.weaknesses && defender.weaknesses.includes(damageType)) {
                finalDamage = Math.floor(finalDamage * 1.3);
                effectiveness = "super";
            } 
            else if (defender.resistances && defender.resistances.includes(damageType)) {
                finalDamage = Math.floor(finalDamage * 0.7);
                effectiveness = "resist";
            }
        }

        return {
            damage: finalDamage,
            blocked: totalDef,
            effectiveness: effectiveness
        };
    }

    static calculateCrit(attacker, weapon, currentDamage) {
        const stats = attacker.stats || attacker;
        const baseCrit = stats.critChance || 0;
        const weaponCrit = weapon ? (weapon.critChance || 0) : 0;
        const totalChance = baseCrit + weaponCrit;

        const baseMult = stats.critMultiplier || 1.5;
        const weaponMult = weapon ? (weapon.critMultiplier || 0) : 0;
        const totalMult = baseMult + weaponMult;

        const isCrit = (Math.random() * 100) < totalChance;

        if (isCrit) {
            return {
                isCrit: true,
                damage: Math.floor(currentDamage * totalMult)
            };
        }

        return { isCrit: false, damage: currentDamage };
    }
}