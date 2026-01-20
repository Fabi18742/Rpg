// LocalStorage Wrapper für Spielstand-Verwaltung

const Storage = {
    // Spielstand speichern
    saveGameState(gameState) {
        try {
            localStorage.setItem('pixelgame_state', JSON.stringify(gameState));
            return true;
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            return false;
        }
    },

    // Spielstand laden
    loadGameState() {
        try {
            const data = localStorage.getItem('pixelgame_state');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Fehler beim Laden:', error);
            return null;
        }
    },

    // Spielstand löschen
    clearGameState() {
        try {
            localStorage.removeItem('pixelgame_state');
            return true;
        } catch (error) {
            console.error('Fehler beim Löschen:', error);
            return false;
        }
    },

    // Prüfen ob Spielstand existiert
    hasGameState() {
        return localStorage.getItem('pixelgame_state') !== null;
    }
};
