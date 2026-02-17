// src/ui/WindowManager.js

export class WindowManager {
    constructor() {
        this.zIndexCounter = 100;
        this.activeDrag = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // Globale Event Listener für Dragging
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        
        // NEU: Listener für Browser-Größenänderung
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * Macht ein HTML-Element zu einem verschiebbaren Fenster
     */
    addWindow(element, id) {
        if (!element) return;

        const header = element.querySelector('.window-header');
        if (!header) {
            console.warn(`WindowManager: Fenster ${id} hat keinen .window-header`);
            return;
        }

        // ID im Element speichern (hilfreich für Resize-Logik)
        element.dataset.winId = id;

        // 1. Position laden
        this.loadState(element, id);

        // 2. Drag Starten
        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.win-btn')) return;
            this.startDragging(element, e);
        });

        // 3. Nach vorne holen bei Klick
        element.addEventListener('mousedown', () => {
            this.bringToFront(element);
        });

        // 4. Buttons logik (Minimieren)
        const minBtn = element.querySelector('.minimize-btn');
        if (minBtn) {
            minBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMinimize(element, id);
            });
        }
    }

    startDragging(element, e) {
        this.activeDrag = element;
        this.bringToFront(element);

        const rect = element.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;

        element.style.opacity = "0.9";
        document.body.style.userSelect = "none";
    }

    onMouseMove(e) {
        if (!this.activeDrag) return;

        let newX = e.clientX - this.dragOffset.x;
        let newY = e.clientY - this.dragOffset.y;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const elWidth = this.activeDrag.offsetWidth;
        const elHeight = this.activeDrag.offsetHeight;

        // Begrenzung (Clamping)
        newX = Math.max(0, Math.min(newX, windowWidth - elWidth));
        newY = Math.max(0, Math.min(newY, windowHeight - elHeight));

        this.activeDrag.style.left = newX + 'px';
        this.activeDrag.style.top = newY + 'px';
    }

    onMouseUp() {
        if (this.activeDrag) {
            this.activeDrag.style.opacity = "1";
            document.body.style.userSelect = "";
            
            // Speichern
            const id = this.activeDrag.dataset.winId;
            if (id) this.saveState(this.activeDrag, id);
            
            this.activeDrag = null;
        }
    }

    // NEU: Diese Funktion prüft ALLE Fenster, wenn sich der Bildschirm ändert
    onWindowResize() {
        const windows = document.querySelectorAll('.draggable-window');
        
        windows.forEach(win => {
            const rect = win.getBoundingClientRect();
            const winWidth = window.innerWidth;
            const winHeight = window.innerHeight;

            // Aktuelle Position
            let currentX = parseFloat(win.style.left) || 0;
            let currentY = parseFloat(win.style.top) || 0;

            // Maximale erlaubte Koordinaten
            const maxX = winWidth - rect.width;
            const maxY = winHeight - rect.height;

            // Prüfen, ob Fenster außerhalb liegt
            let needsUpdate = false;

            if (currentX > maxX) {
                currentX = Math.max(0, maxX);
                needsUpdate = true;
            }
            if (currentY > maxY) {
                currentY = Math.max(0, maxY);
                needsUpdate = true;
            }

            // Wenn wir korrigieren mussten, Position setzen und speichern
            if (needsUpdate) {
                win.style.left = currentX + 'px';
                win.style.top = currentY + 'px';
                
                const id = win.dataset.winId;
                if (id) this.saveState(win, id);
            }
        });
    }

    bringToFront(element) {
        this.zIndexCounter++;
        element.style.zIndex = this.zIndexCounter;
    }

    toggleMinimize(element, id) {
        element.classList.toggle('minimized');
        this.saveState(element, id);
    }

    saveState(element, id) {
        const state = {
            x: element.style.left,
            y: element.style.top,
            minimized: element.classList.contains('minimized')
        };
        localStorage.setItem(`win_pos_${id}`, JSON.stringify(state));
    }

    loadState(element, id) {
        const saved = localStorage.getItem(`win_pos_${id}`);
        if (saved) {
            const state = JSON.parse(saved);
            
            // Sicherheit: Auch beim Laden prüfen, ob es im Bild ist
            let x = parseFloat(state.x) || 0;
            let y = parseFloat(state.y) || 0;
            
            // Da wir hier die Breite evtl. noch nicht kennen (Element noch nicht gerendert),
            // setzen wir es erstmal. onWindowResize() würde es im Notfall später fangen,
            // aber wir können hier zumindest negative Werte oder extreme Werte abfangen.
            
            element.style.left = state.x;
            element.style.top = state.y;
            
            if (state.minimized) element.classList.add('minimized');
            
            // Nach dem Laden einmal prüfen (kurzer Timeout, damit das DOM da ist)
            setTimeout(() => this.onWindowResize(), 100);
        }
    }
}

export const windowManager = new WindowManager();