// tetris.js - Modul Tetris pentru Catalin e negru - OUR HETES V4

let tetrisInterval = null;
let tetrisGrid = [];
let tetrisCurrentPiece = null;
let tetrisCurrentX = 0;
let tetrisCurrentY = 0;
let tetrisScore = 0;
let tetrisGameOver = false;
let tetrisModeType = 'original'; // 'original' sau 'berlin'
let tetrisPlacedBlocksCount = 0;
let isNewTetrisRecord = false;

const tetrisBgOriginal = new Image();
tetrisBgOriginal.src = 'tetris.png';
const tetrisBgBerlin = new Image();
tetrisBgBerlin.src = 'tetris-berlin.jpg';

const sndTetrisOriginal = new Audio('tetris.mp3');
sndTetrisOriginal.loop = true;
sndTetrisOriginal.volume = 1.0;

const sndTetrisBerlin = new Audio('tetris-berlin.mp3');
sndTetrisBerlin.loop = true;
sndTetrisBerlin.volume = 1.0;

function playTetrisOriginalMusic() {
    sndTetrisOriginal.currentTime = 0;
    sndTetrisOriginal.play().catch(e => {
        console.log("Eroare redare tetris original:", e);
    });
}

function stopTetrisMusic() {
    if (sndTetrisOriginal) {
        sndTetrisOriginal.pause();
        sndTetrisOriginal.currentTime = 0;
    }
    if (sndTetrisBerlin) {
        sndTetrisBerlin.pause();
        sndTetrisBerlin.currentTime = 0;
    }
}
window.stopTetrisMusic = stopTetrisMusic;

// Ascultător global pentru a opri muzica imediat ce se apasă pe orice element / buton de meniu
document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a, div');
    if (target) {
        const text = (target.innerText || target.textContent || '').toLowerCase();
        if (text.includes('meniu') || text.includes('menu') || target.id.includes('menu') || target.id.includes('lose')) {
            stopTetrisMusic();
        }
    }
}, true);

const TETROMINOS = [
    { shape: [[1,1,1,1]], color: '#00f0f0' }, // I
    { shape: [[1,1,1],[0,1,0]], color: '#a000f0' }, // T
    { shape: [[1,1,1],[1,0,0]], color: '#f0a000' }, // L
    { shape: [[1,1,1],[0,0,1]], color: '#0000f0' }, // J
    { shape: [[1,1],[1,1]], color: '#f0f000' }, // O
    { shape: [[0,1,1],[1,1,0]], color: '#00f000' }, // S
    { shape: [[1,1,0],[0,1,1]], color: '#f00000' }  // Z
];

window.openTetrisMenu = function() {
    stopTetrisMusic();
    hideAllMenusForTetris();
    const tetrisMenu = document.getElementById('tetris-menu');
    if (tetrisMenu) {
        tetrisMenu.classList.remove('hidden');
    }
};
window.tetrisMenu = window.openTetrisMenu;

window.startTetrisModeGame = function(mode) {
    tetrisModeType = mode;
    hideAllMenusForTetris();
    if (typeof stopMenuMusic === 'function') stopMenuMusic();
    currentMode = 'TETRIS';
    startTetrisGame();
    setupTetrisMouseAndMobileUI();
};

function hideAllMenusForTetris() {
    stopTetrisMusic();
    const mainM = document.getElementById('main-menu');
    if (mainM) mainM.classList.add('hidden');
    const classicM = document.getElementById('classic-menu');
    if (classicM) classicM.classList.add('hidden');
    const tMenu = document.getElementById('tetris-menu');
    if (tMenu) tMenu.classList.add('hidden');
    const loseScr = document.getElementById('lose-screen');
    if (loseScr) {
        loseScr.classList.add('hidden');
        loseScr.style.display = 'none';
    }
    const winScr = document.getElementById('win-screen');
    if (winScr) winScr.classList.add('hidden');
    const authP = document.getElementById('auth-panel');
    if (authP) authP.classList.add('hidden');
}

function startTetrisGame() {
    gameActive = false; 
    if (window.sndStalingradBgm) { window.sndStalingradBgm.pause(); }
    stopTetrisMusic();

    if (tetrisModeType === 'berlin') {
        const rows = 20;
        const cols = 34;
        tetrisGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
    } else {
        const rows = 20;
        const cols = 10;
        tetrisGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
    }

    tetrisScore = 0;
    tetrisPlacedBlocksCount = 0;
    tetrisGameOver = false;
    isNewTetrisRecord = false;

    if (tetrisModeType === 'berlin') {
        sndTetrisBerlin.currentTime = 0;
        sndTetrisBerlin.play().catch(e => {});
    } else {
        playTetrisOriginalMusic();
    }
    
    spawnTetrisPiece();
    
    if (tetrisInterval) clearInterval(tetrisInterval);
    tetrisInterval = setInterval(tetrisGameLoop, tetrisModeType === 'berlin' ? 450 : 500);

    window.removeEventListener('keydown', handleTetrisKeys);
    window.addEventListener('keydown', handleTetrisKeys);
}

function getTetrisRowsCols() {
    if (tetrisModeType === 'berlin') return { rows: 20, cols: 34, blockSize: 32 };
    return { rows: 20, cols: 10, blockSize: 30 };
}

function spawnTetrisPiece() {
    const { cols } = getTetrisRowsCols();
    const rand = Math.floor(Math.random() * TETROMINOS.length);
    tetrisCurrentPiece = TETROMINOS[rand];
    tetrisCurrentX = Math.floor(cols / 2) - Math.floor(tetrisCurrentPiece.shape[0].length / 2);
    tetrisCurrentY = 0;

    if (checkTetrisCollision(tetrisCurrentX, tetrisCurrentY, tetrisCurrentPiece.shape)) {
        tetrisGameOver = true;
        clearInterval(tetrisInterval);
        stopTetrisMusic();
        window.removeEventListener('keydown', handleTetrisKeys);
        removeTetrisMouseAndMobileUI();
        
        calculateFinalTetrisScore();
        showTetrisGameOverScreen();
    }
}

function calculateFinalTetrisScore() {
    if (!window.gameStats) window.gameStats = {};
    isNewTetrisRecord = false;

    if (tetrisModeType === 'berlin') {
        let { rows, cols } = getTetrisRowsCols();
        let holes = 0;
        let filledBlocks = tetrisPlacedBlocksCount;
        for (let c = 0; c < cols; c++) {
            let foundBlock = false;
            for (let r = 0; r < rows; r++) {
                if (tetrisGrid[r][c] !== 0) {
                    foundBlock = true;
                } else if (foundBlock) {
                    holes++;
                }
            }
        }
        tetrisScore = Math.max(0, (filledBlocks * 150) - (holes * 75));
        if (!window.gameStats.tetrisBerlinScore) window.gameStats.tetrisBerlinScore = 0;
        if (tetrisScore > window.gameStats.tetrisBerlinScore) {
            window.gameStats.tetrisBerlinScore = tetrisScore;
            isNewTetrisRecord = true;
        }
    } else {
        if (!window.gameStats.tetrisOriginalScore) window.gameStats.tetrisOriginalScore = 0;
        if (tetrisScore > window.gameStats.tetrisOriginalScore) {
            window.gameStats.tetrisOriginalScore = tetrisScore;
            isNewTetrisRecord = true;
        }
    }
    window.gameStats.tetrisScore = Math.max(window.gameStats.tetrisOriginalScore || 0, window.gameStats.tetrisBerlinScore || 0);
    if (typeof saveStats === 'function') saveStats();
}

function checkTetrisCollision(x, y, shape) {
    let { rows, cols } = getTetrisRowsCols();
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                let newX = x + c;
                let newY = y + r;
                if (newX < 0 || newX >= cols || newY >= rows) return true;
                if (newY >= 0 && tetrisGrid[newY][newX]) return true;
            }
        }
    }
    return false;
}

function mergeTetrisPiece() {
    let { rows, cols } = getTetrisRowsCols();
    let blockCount = 0;
    for (let r = 0; r < tetrisCurrentPiece.shape.length; r++) {
        for (let c = 0; c < tetrisCurrentPiece.shape[r].length; c++) {
            if (tetrisCurrentPiece.shape[r][c]) {
                let boardY = tetrisCurrentY + r;
                let boardX = tetrisCurrentX + c;
                if (boardY >= 0 && boardY < rows && boardX >= 0 && boardX < cols) {
                    tetrisGrid[boardY][boardX] = tetrisCurrentPiece.color;
                    blockCount++;
                }
            }
        }
    }
    tetrisPlacedBlocksCount += blockCount;
}

function clearTetrisLines() {
    if (tetrisModeType === 'berlin') {
        let holes = 0;
        let { rows, cols } = getTetrisRowsCols();
        for (let c = 0; c < cols; c++) {
            let foundBlock = false;
            for (let r = 0; r < rows; r++) {
                if (tetrisGrid[r][c] !== 0) {
                    foundBlock = true;
                } else if (foundBlock) {
                    holes++;
                }
            }
        }
        tetrisScore = Math.max(0, (tetrisPlacedBlocksCount * 100) - (holes * 50));
        return;
    }

    let { rows, cols } = getTetrisRowsCols();
    let linesCleared = 0;
    for (let r = rows - 1; r >= 0; r--) {
        if (tetrisGrid[r].every(cell => cell !== 0)) {
            tetrisGrid.splice(r, 1);
            tetrisGrid.unshift(Array(cols).fill(0));
            linesCleared++;
            r++; 
        }
    }
    if (linesCleared > 0) {
        tetrisScore += linesCleared * 100 * linesCleared;
        if (!window.gameStats.tetrisOriginalScore || tetrisScore > window.gameStats.tetrisOriginalScore) {
            window.gameStats.tetrisOriginalScore = tetrisScore;
            window.gameStats.tetrisScore = tetrisScore;
            if (typeof saveStats === 'function') saveStats();
        }
    }
}

function tetrisGameLoop() {
    if (tetrisGameOver || currentMode !== 'TETRIS') return;
    if (!checkTetrisCollision(tetrisCurrentX, tetrisCurrentY + 1, tetrisCurrentPiece.shape)) {
        tetrisCurrentY++;
    } else {
        mergeTetrisPiece();
        clearTetrisLines();
        spawnTetrisPiece();
    }
    drawTetris();
}

function handleTetrisKeys(e) {
    if (tetrisGameOver || currentMode !== 'TETRIS') return;

    if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (!checkTetrisCollision(tetrisCurrentX - 1, tetrisCurrentY, tetrisCurrentPiece.shape)) {
            tetrisCurrentX--;
        }
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        if (!checkTetrisCollision(tetrisCurrentX + 1, tetrisCurrentY, tetrisCurrentPiece.shape)) {
            tetrisCurrentX++;
        }
    } else if (e.key === 'ArrowDown' || e.key === 's') {
        if (!checkTetrisCollision(tetrisCurrentX, tetrisCurrentY + 1, tetrisCurrentPiece.shape)) {
            tetrisCurrentY++;
        }
    } else if (e.key === 'ArrowUp' || e.key === 'w') {
        rotateTetrisPiece();
    } else if (e.code === 'Space') {
        dropTetrisPiece();
    }
    drawTetris();
}

function rotateTetrisPiece() {
    if (!tetrisCurrentPiece) return;
    const rotated = tetrisCurrentPiece.shape[0].map((_, index) => tetrisCurrentPiece.shape.map(row => row[index]).reverse());
    if (!checkTetrisCollision(tetrisCurrentX, tetrisCurrentY, rotated)) {
        tetrisCurrentPiece.shape = rotated;
    }
}

function dropTetrisPiece() {
    if (!tetrisCurrentPiece) return;
    while (!checkTetrisCollision(tetrisCurrentX, tetrisCurrentY + 1, tetrisCurrentPiece.shape)) {
        tetrisCurrentY++;
    }
    mergeTetrisPiece();
    clearTetrisLines();
    spawnTetrisPiece();
}

function moveTetrisLeft() {
    if (tetrisGameOver || currentMode !== 'TETRIS') return;
    if (!checkTetrisCollision(tetrisCurrentX - 1, tetrisCurrentY, tetrisCurrentPiece.shape)) {
        tetrisCurrentX--;
    }
    drawTetris();
}

function moveTetrisRight() {
    if (tetrisGameOver || currentMode !== 'TETRIS') return;
    if (!checkTetrisCollision(tetrisCurrentX + 1, tetrisCurrentY, tetrisCurrentPiece.shape)) {
        tetrisCurrentX++;
    }
    drawTetris();
}

function moveTetrisDown() {
    if (tetrisGameOver || currentMode !== 'TETRIS') return;
    if (!checkTetrisCollision(tetrisCurrentX, tetrisCurrentY + 1, tetrisCurrentPiece.shape)) {
        tetrisCurrentY++;
    }
    drawTetris();
}

function setupTetrisMouseAndMobileUI() {
    let container = document.getElementById('mobile-controls');
    if (!container) return;
    container.style.display = 'block';

    let cControls = document.getElementById('mob-classic-controls');
    if (cControls) cControls.classList.add('hidden');
    let aControls = document.getElementById('mob-aura-controls');
    if (aControls) aControls.classList.add('hidden');
    let sControls = document.getElementById('mob-shooter-controls');
    if (sControls) sControls.classList.add('hidden');

    let tetrisControls = document.getElementById('mob-tetris-controls');
    if (!tetrisControls) {
        tetrisControls = document.createElement('div');
        tetrisControls.id = 'mob-tetris-controls';
        tetrisControls.innerHTML = `
            <div style="position: absolute; bottom: 25px; left: 25px; width: 180px; height: 180px; pointer-events: auto;">
                <button id="tetris-btn-rot" class="mob-btn" style="top: 0; left: 62px; width: 55px; height: 55px; background: rgba(155,89,182,0.6);">🔄</button>
                <button id="tetris-btn-down" class="mob-btn" style="bottom: 0; left: 62px; width: 55px; height: 55px; background: rgba(155,89,182,0.6);">▼</button>
                <button id="tetris-btn-left" class="mob-btn" style="top: 62px; left: 0; width: 55px; height: 55px; background: rgba(155,89,182,0.6);">◄</button>
                <button id="tetris-btn-right" class="mob-btn" style="top: 62px; right: 0; width: 55px; height: 55px; background: rgba(155,89,182,0.6);">►</button>
            </div>
            <button id="tetris-btn-drop" class="mob-btn" style="position: absolute; bottom: 30px; right: 30px; width: 100px; height: 100px; border-radius: 50%; background: rgba(155,89,182,0.7); border-color:#9b59b6; font-size:16px; pointer-events: auto;">DROP</button>
        `;
        container.appendChild(tetrisControls);

        document.getElementById('tetris-btn-rot').onclick = () => { rotateTetrisPiece(); drawTetris(); };
        document.getElementById('tetris-btn-left').onclick = () => { moveTetrisLeft(); };
        document.getElementById('tetris-btn-right').onclick = () => { moveTetrisRight(); };
        document.getElementById('tetris-btn-down').onclick = () => { moveTetrisDown(); drawTetris(); };
        document.getElementById('tetris-btn-drop').onclick = () => { dropTetrisPiece(); drawTetris(); };
    } else {
        tetrisControls.classList.remove('hidden');
    }
}

function removeTetrisMouseAndMobileUI() {
    let tetrisControls = document.getElementById('mob-tetris-controls');
    if (tetrisControls) {
        tetrisControls.classList.add('hidden');
    }
}

function drawTetris() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let bgImg = (tetrisModeType === 'berlin') ? tetrisBgBerlin : tetrisBgOriginal;
    if (bgImg.complete && bgImg.naturalWidth !== 0) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let { rows, cols, blockSize } = getTetrisRowsCols();
    const boardWidth = cols * blockSize;
    const boardHeight = rows * blockSize;
    const startX = (canvas.width - boardWidth) / 2;
    const startY = (canvas.height - boardHeight) / 2;

    ctx.fillStyle = 'rgba(26, 26, 26, 0.9)';
    ctx.fillRect(startX, startY, boardWidth, boardHeight);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (tetrisGrid[r][c]) {
                ctx.fillStyle = tetrisGrid[r][c];
                ctx.fillRect(startX + c * blockSize, startY + r * blockSize, blockSize - 1, blockSize - 1);
            } else {
                ctx.strokeStyle = '#222';
                ctx.strokeRect(startX + c * blockSize, startY + r * blockSize, blockSize, blockSize);
            }
        }
    }

    if (tetrisCurrentPiece) {
        ctx.fillStyle = tetrisCurrentPiece.color;
        for (let r = 0; r < tetrisCurrentPiece.shape.length; r++) {
            for (let c = 0; c < tetrisCurrentPiece.shape[r].length; c++) {
                if (tetrisCurrentPiece.shape[r][c]) {
                    ctx.fillRect(
                        startX + (tetrisCurrentX + c) * blockSize,
                        startY + (tetrisCurrentY + r) * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                }
            }
        }
    }

    const panelX = tetrisModeType === 'berlin' ? 20 : (startX - 260);
    const panelY = tetrisModeType === 'berlin' ? 20 : startY;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(panelX, panelY, 240, 250);
    ctx.strokeStyle = tetrisModeType === 'berlin' ? '#e74c3c' : '#9b59b6';
    ctx.strokeRect(panelX, panelY, 240, 250);

    ctx.fillStyle = tetrisModeType === 'berlin' ? '#e74c3c' : '#9b59b6';
    ctx.font = 'bold 18px Segoe UI';
    ctx.fillText(tetrisModeType === 'berlin' ? 'ZIDUL BERLINULUI' : 'MOD TETRIS', panelX + 15, panelY + 30);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '15px Segoe UI';
    ctx.fillText(`Scor: ${tetrisScore}`, panelX + 15, panelY + 65);
    ctx.fillText(`Record: ${tetrisModeType === 'berlin' ? (window.gameStats.tetrisBerlinScore || 0) : (window.gameStats.tetrisOriginalScore || 0)}`, panelX + 15, panelY + 95);

    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 13px Segoe UI';
    ctx.fillText('CONTROALE:', panelX + 15, panelY + 125);
    ctx.font = '12px Segoe UI';
    ctx.fillStyle = '#ccc';
    ctx.fillText('• Stânga/Dreapta: A / D sau ◄ ►', panelX + 15, panelY + 145);
    ctx.fillText('• Rotire: W / Sus (sau 🔄)', panelX + 15, panelY + 165);
    ctx.fillText('• Coborâre: S / Jos (sau ▼)', panelX + 15, panelY + 185);
    ctx.fillText('• Cădere rapidă: Space (sau DROP)', panelX + 15, panelY + 205);
}

function showTetrisGameOverScreen() {
    removeTetrisMouseAndMobileUI();
    stopTetrisMusic();
    
    const loseScreen = document.getElementById('lose-screen');
    const loseMessage = document.getElementById('lose-message');
    
    if (loseScreen) {
        if (loseMessage) {
            let recordText = isNewTetrisRecord ? `<div style="font-size: 20px; color: #f1c40f; font-weight: bold; margin-bottom: 12px; text-shadow: 0 0 8px rgba(241,196,15,0.6);">🎉 SCOR RECORD NOU! 🎉</div>` : '';
            
            loseMessage.innerHTML = `
                <div style="font-size: 26px; font-weight: bold; color: #ff4d4d; margin-bottom: 10px;">Joc S-a Terminat!</div>
                ${recordText}
                <div style="font-size: 18px; color: #fff; margin-bottom: 20px;">Scor Final (${tetrisModeType === 'berlin' ? 'Zidul Berlinului' : 'Original'}): <strong>${tetrisScore}</strong></div>
                <button id="tetris-gameover-menu-btn" style="padding: 12px 28px; background-color: #e74c3c; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">Înapoi la Meniu</button>
            `;
        }
        
        // Forțează vizibilitatea ecranului de final de joc
        loseScreen.style.display = 'flex';
        loseScreen.style.zIndex = '99999';
        loseScreen.classList.remove('hidden');

        setTimeout(() => {
            const returnBtn = document.getElementById('tetris-gameover-menu-btn');
            if (returnBtn) {
                returnBtn.onclick = (e) => {
                    e.stopPropagation();
                    stopTetrisMusic();
                    loseScreen.classList.add('hidden');
                    loseScreen.style.display = 'none';
                    if (typeof window.openTetrisMenu === 'function') {
                        window.openTetrisMenu();
                    } else {
                        location.reload();
                    }
                };
            }
        }, 50);
    }
}