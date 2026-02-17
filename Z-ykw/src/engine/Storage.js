// src/engine/Storage.js
export class Storage {
    static save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
            // Optional: Log entfernen, wenn es zu viel spammt
            // console.log(`💾 Gespeichert: ${key}`);
            return true;
        } catch (e) {
            console.error("Speichern fehlgeschlagen", e);
            return false;
        }
    }

    static load(key) {
        try {
            const serialized = localStorage.getItem(key);
            if (!serialized) return null;
            return JSON.parse(serialized);
        } catch (e) {
            console.error("Laden fehlgeschlagen", e);
            return null;
        }
    }

    static clear(key) {
        localStorage.removeItem(key);
        console.log(`🗑️ Gelöscht: ${key}`);
    }
}