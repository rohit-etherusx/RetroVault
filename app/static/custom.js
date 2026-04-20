// RetroVault - Custom Frontend Logic
// Bridges the GBA emulator with the FastAPI backend

let gba = null;
const SAVE_FILENAME = 'game.sav';

// Initialize the emulator
function initEmulator() {
    gba = new GameBoyAdvance();
    gba.keypad.eatInput = true;
    gba.logLevel = gba.LOG_ERROR;

    gba.setLogger(function (level, error) {
        console.error(error);
        try {
            fetch('/client-log', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({event: 'gbajs_error', level: level, message: (error && error.message) ? error.message : String(error), stack: (error && error.stack) ? error.stack : null})
            }).catch(()=>{});
        } catch (e) {}
        gba.pause();
    });

    // Set up canvas
    const canvas = document.getElementById('screen');
    if (canvas) {
        gba.setCanvas(canvas);
    }

    // Load BIOS if available
    try {
        if (typeof biosBin !== 'undefined') {
            gba.setBios(biosBin, false);
            console.log('BIOS loaded');
            showStatus('BIOS loaded');
            try { fetch('/client-log', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({event:'bios_loaded'})}).catch(()=>{}); } catch(_){}
        } else {
            console.warn('BIOS not found');
        }
    } catch (e) {
        console.error('Error loading BIOS', e);
    }

    // Set up controls
    setupControls();
}

// Set up UI controls
function setupControls() {
    const pauseBtn = document.getElementById('pause');
    const saveBtn = document.getElementById('save');
    const resetBtn = document.getElementById('reset');

    if (pauseBtn) {
        pauseBtn.addEventListener('click', togglePause);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveGame);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetGame);
    }
}

// Load ROM from backend
async function loadRomFromBackend() {
    try {
        showStatus('Loading ROM...');
        const response = await fetch('/rom');
        if (!response.ok) {
            throw new Error('Failed to fetch ROM');
        }
        const romData = await response.arrayBuffer();
        
        const result = gba.setRom(romData);
        console.log('setRom result:', result);
        try { fetch('/client-log', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({event:'setRom_result', result: !!result, romSize: romData.byteLength})}).catch(()=>{}); } catch(_){}
        if (!result) {
            throw new Error('Failed to load ROM into emulator');
        }

        showStatus('ROM loaded. Loading save...');
        
        // Try to load existing save
        await loadSaveFromBackend();
        
        // Start the game
        gba.runStable();
        showStatus('Playing!');
        try { fetch('/client-log', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({event:'emulator_started'})}).catch(()=>{}); } catch(_){}
        // notify server that emulator started
        fetch('/client-log', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({event: 'emulator_started'})}).catch(()=>{});
        
    } catch (error) {
        console.error('Error loading ROM:', error);
        showStatus('Error: ' + error.message);
        fetch('/client-log', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({event: 'load_error', message: error.message, stack: error.stack || null})}).catch(()=>{});
    }
}

// Send client-side errors to server for debugging
window.addEventListener('error', function (e) {
    try {
        fetch('/client-log', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({event: 'error', message: e.message, filename: e.filename, lineno: e.lineno, colno: e.colno, stack: (e.error && e.error.stack) || null})});
    } catch (_) {}
});
window.addEventListener('unhandledrejection', function (e) {
    try {
        fetch('/client-log', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({event: 'unhandledrejection', reason: (e && e.reason) ? (e.reason.message || String(e.reason)) : 'unknown'})});
    } catch (_) {}
});

// Load save from backend
async function loadSaveFromBackend() {
    try {
        const response = await fetch(`/download-save?filename=${SAVE_FILENAME}`);
        if (response.status === 404) {
            console.log('No existing save found, starting fresh');
            return;
        }
        if (!response.ok) {
            throw new Error('Failed to fetch save');
        }
        
        const saveData = await response.arrayBuffer();
        gba.setSavedata(saveData);
        console.log('Save loaded successfully');
        
    } catch (error) {
        console.log('No save to load:', error.message);
    }
}

// Save game to backend
async function saveGame() {
    try {
        showStatus('Saving...');
        
        // Get save data from emulator
        const sram = gba.mmu.save;
        if (!sram) {
            showStatus('No save data to save');
            return;
        }

        // Convert to Blob
        const blob = new Blob([sram], { type: 'application/octet-stream' });
        
        // Upload to backend
        const formData = new FormData();
        formData.append('file', blob, SAVE_FILENAME);
        
        const response = await fetch('/upload-save', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to upload save');
        }
        
        const result = await response.json();
        showStatus('Saved! ' + result.filename);
        
    } catch (error) {
        console.error('Error saving game:', error);
        showStatus('Save failed: ' + error.message);
    }
}

// Toggle pause
function togglePause() {
    const pauseBtn = document.getElementById('pause');
    if (gba.paused) {
        gba.runStable();
        pauseBtn.textContent = 'PAUSE';
    } else {
        gba.pause();
        pauseBtn.textContent = 'UNPAUSE';
    }
}

// Reset game
function resetGame() {
    gba.pause();
    gba.reset();
    
    const selectBtn = document.getElementById('select');
    if (selectBtn) {
        selectBtn.textContent = 'SELECT';
    }
    
    showStatus('Game reset');
}

// Show status message
function showStatus(message) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = message;
    }
}

// Keyboard handled by `gba.keypad.registerHandlers()` (native keydown/keyup listeners).

// Auto-save on page unload
window.addEventListener('beforeunload', function() {
    if (gba && gba.mmu.save) {
        // Trigger save (but we can't await in beforeunload)
        console.log('Page closing, save may be lost if not manually saved');
    }
});

// Initialize when page loads
window.addEventListener('load', function() {
    initEmulator();
    loadRomFromBackend();
});