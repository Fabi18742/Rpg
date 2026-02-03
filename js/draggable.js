// Draggable Window System

const DraggableManager = {
    activeWindow: null,
    dragOffset: { x: 0, y: 0 },
    zIndexCounter: 100,
    resizeTimers: {}, // Debounce-Timer für Resize-Events
    resizeObservers: {}, // ResizeObserver-Referenzen
    
    // Fenster initialisieren
    init() {
        // Event-Listener für Dokument
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
    },
    
    // Fenster als draggable registrieren
    makeWindowDraggable(windowElement, windowId) {
        const handle = windowElement.querySelector('.window-drag-handle');
        if (!handle) return;
        
        // Lade gespeicherte Position
        this.loadPosition(windowElement, windowId);
        
        // Minimieren-Button Setup
        const minimizeBtn = windowElement.querySelector('.window-minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMinimize(windowElement, windowId);
            });
            
            // Lade minimiert-Status
            const minimizedStates = JSON.parse(localStorage.getItem('windowMinimized') || '{}');
            if (minimizedStates[windowId]) {
                windowElement.classList.add('minimized');
                minimizeBtn.textContent = '+';
            } else {
                minimizeBtn.textContent = '−';
            }
        }
        
        // Drag-Start
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.activeWindow = windowElement;
            this.bringToFront(windowElement);
            
            const rect = windowElement.getBoundingClientRect();
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;
            
            windowElement.classList.add('dragging');
        });
        
        // Click zum nach vorne bringen
        windowElement.addEventListener('mousedown', () => {
            this.bringToFront(windowElement);
        });
        
        // ResizeObserver für manuelle Größenänderung (resize: vertical)
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                // Nur speichern wenn nicht minimiert und fenster resizable ist
                if (!windowElement.classList.contains('minimized')) {
                    // Debounce: Erst nach 500ms Inaktivität speichern (nur bewusste User-Resizes)
                    if (this.resizeTimers[windowId]) {
                        clearTimeout(this.resizeTimers[windowId]);
                    }
                    this.resizeTimers[windowId] = setTimeout(() => {
                        this.savePosition(windowElement, windowId);
                        delete this.resizeTimers[windowId];
                    }, 500);
                }
            });
            resizeObserver.observe(windowElement);
            // Referenz speichern für späteren Cleanup
            this.resizeObservers[windowId] = resizeObserver;
        }
    },
    
    // ResizeObserver cleanup (vor window.remove() aufrufen!)
    cleanupWindow(windowId) {
        // ResizeObserver stoppen
        if (this.resizeObservers[windowId]) {
            this.resizeObservers[windowId].disconnect();
            delete this.resizeObservers[windowId];
        }
        
        // Pending resize timer canceln
        if (this.resizeTimers[windowId]) {
            clearTimeout(this.resizeTimers[windowId]);
            delete this.resizeTimers[windowId];
        }
    },
    
    // Maus-Bewegung
    onMouseMove(e) {
        if (!this.activeWindow) return;
        
        let newX = e.clientX - this.dragOffset.x;
        let newY = e.clientY - this.dragOffset.y;
        
        // Boundary checking - darf nicht aus Bildschirm
        const rect = this.activeWindow.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        this.activeWindow.style.left = newX + 'px';
        this.activeWindow.style.top = newY + 'px';
    },
    
    // Maus losgelassen
    onMouseUp() {
        if (this.activeWindow) {
            this.activeWindow.classList.remove('dragging');
            
            // Position speichern
            const windowId = this.activeWindow.dataset.windowId;
            if (windowId) {
                this.savePosition(this.activeWindow, windowId);
            }
            
            this.activeWindow = null;
        }
    },
    
    // Fenster nach vorne bringen
    bringToFront(windowElement) {
        this.zIndexCounter++;
        windowElement.style.zIndex = this.zIndexCounter;
    },
    
    // Position speichern
    savePosition(windowElement, windowId) {
        const positions = JSON.parse(localStorage.getItem('windowPositions') || '{}');
        const savedData = {
            left: windowElement.style.left,
            top: windowElement.style.top
        };
        
        // Nur für resizable Fenster auch Größe speichern
        if (windowId === 'battle-log-window' || windowId === 'inventory-window') {
            const rect = windowElement.getBoundingClientRect();
            savedData.width = rect.width + 'px';
            savedData.height = rect.height + 'px';
        }
        
        positions[windowId] = savedData;
        localStorage.setItem('windowPositions', JSON.stringify(positions));
    },
    
    // Position laden
    loadPosition(windowElement, windowId) {
        const positions = JSON.parse(localStorage.getItem('windowPositions') || '{}');
        const saved = positions[windowId];
        
        if (saved) {
            // Gespeicherte Größe laden (nur für resizable Fenster)
            if ((windowId === 'battle-log-window' || windowId === 'inventory-window') && saved.width && saved.height) {
                windowElement.style.width = saved.width;
                windowElement.style.height = saved.height;
            }
            
            // Prüfe ob Position noch im sichtbaren Bereich
            const left = parseInt(saved.left);
            const top = parseInt(saved.top);
            const rect = windowElement.getBoundingClientRect();
            
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;
            
            windowElement.style.left = Math.max(0, Math.min(left, maxX)) + 'px';
            windowElement.style.top = Math.max(0, Math.min(top, maxY)) + 'px';
        }
    },
    
    // Fenster minimieren/maximieren
    toggleMinimize(windowElement, windowId) {
        const isCurrentlyMinimized = windowElement.classList.contains('minimized');
        
        if (!isCurrentlyMinimized) {
            // Vor dem Minimieren: Aktuelle Breite und Höhe speichern
            const computedStyle = window.getComputedStyle(windowElement);
            windowElement.dataset.savedWidth = computedStyle.width;
            windowElement.dataset.savedHeight = computedStyle.height;
        }
        
        windowElement.classList.toggle('minimized');
        const isMinimized = windowElement.classList.contains('minimized');
        
        if (isMinimized) {
            // Beim Minimieren: Breite explizit setzen
            const savedWidth = windowElement.dataset.savedWidth;
            if (savedWidth) {
                windowElement.style.width = savedWidth;
            }
        } else {
            // Beim Maximieren: Gespeicherte Dimensionen wiederherstellen
            const savedWidth = windowElement.dataset.savedWidth;
            const savedHeight = windowElement.dataset.savedHeight;
            if (savedWidth) windowElement.style.width = savedWidth;
            if (savedHeight) windowElement.style.height = savedHeight;
        }
        
        const minimizeBtn = windowElement.querySelector('.window-minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.textContent = isMinimized ? '+' : '−';
        }
        
        // Status speichern
        const minimizedStates = JSON.parse(localStorage.getItem('windowMinimized') || '{}');
        minimizedStates[windowId] = isMinimized;
        localStorage.setItem('windowMinimized', JSON.stringify(minimizedStates));
    },
    
    // Alle Fenster-Positionen bei Window-Resize anpassen
    adjustAllWindows() {
        document.querySelectorAll('.draggable-window').forEach(win => {
            const rect = win.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;
            
            const currentX = parseInt(win.style.left || 0);
            const currentY = parseInt(win.style.top || 0);
            
            if (currentX > maxX || currentY > maxY) {
                win.style.left = Math.max(0, Math.min(currentX, maxX)) + 'px';
                win.style.top = Math.max(0, Math.min(currentY, maxY)) + 'px';
            }
        });
    }
};

// Bei Window-Resize Positionen anpassen
window.addEventListener('resize', () => {
    DraggableManager.adjustAllWindows();
});

// Init beim Laden
document.addEventListener('DOMContentLoaded', () => {
    DraggableManager.init();
});
