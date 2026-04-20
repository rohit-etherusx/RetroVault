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
        gba.pause();
    });

    // Set up canvas
    const canvas = document.getElementById('screen');
    if (canvas) {
        gba.setCanvas(canvas);
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
        if (!result) {
            throw new Error('Failed to load ROM into emulator');
        }

        showStatus('ROM loaded. Loading save...');
        
        // Try to load existing save
        await loadSaveFromBackend();
        
        // Start the game
        gba.runStable();
        showStatus('Playing!');
        
    } catch (error) {
        console.error('Error loading ROM:', error);
        showStatus('Error: ' + error.message);
    }
}

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

// Keyboard controls
document.addEventListener('keydown', function(e) {
    if (!gba) return;
    
    const keyMap = {
        'ArrowUp': 'UP',
        'ArrowDown': 'DOWN',
        'ArrowLeft': 'LEFT',
        'ArrowRight': 'RIGHT',
        'Enter': 'START',
        'Shift': 'SELECT',
        'KeyZ': 'A',
        'KeyX': 'B',
        'KeyA': 'L',
        'KeyS': 'R'
    };
    
    if (keyMap[e.code]) {
        gba.keypad.keyDown(keyMap[e.code]);
    }
});

document.addEventListener('keyup', function(e) {
    if (!gba) return;
    
    const keyMap = {
        'ArrowUp': 'UP',
        'ArrowDown': 'DOWN',
        'ArrowLeft': 'LEFT',
        'ArrowRight': 'RIGHT',
        'Enter': 'START',
        'Shift': 'SELECT',
        'KeyZ': 'A',
        'KeyX': 'B',
        'KeyA': 'L',
        'KeyS': 'R'
    };
    
    if (keyMap[e.code]) {
        gba.keypad.keyUp(keyMap[e.code]);
    }
});

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