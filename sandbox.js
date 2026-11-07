// sandbox.js - Modul Sandbox (Pixel Physics / Soviet Edition V2)
(() => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const GRID_WIDTH = 256;
    const GRID_HEIGHT = 144;
    const PIXEL_SIZE = 5;

    const CATEGORIES = {
        SOLIDS: "Solide & Structuri",
        LIQUIDS: "Lichide",
        GASES: "Gaze",
        FIRE_ENERGY: "Foc & Energie",
        SOVIET: "URSS / Comunism Sovietic",
        TOOLS: "Unelte"
    };

    const MATERIALS = {
        EMPTY:      { id: 0, name: "Gumă", color: "#111111", category: CATEGORIES.TOOLS, type: "empty" },
        PAMANT:     { id: 1, name: "Pământ", color: "#8b5a2b", category: CATEGORIES.SOLIDS, type: "sand" },
        NISIP:      { id: 2, name: "Nisip", color: "#e2b714", category: CATEGORIES.SOLIDS, type: "sand" },
        PIATRA:     { id: 3, name: "Piatră", color: "#718093", category: CATEGORIES.SOLIDS, type: "solid_fixed" },
        LEMN:       { id: 4, name: "Lemn", color: "#a0522d", category: CATEGORIES.SOLIDS, type: "solid_fixed", flammable: true },
        METAL:      { id: 5, name: "Metal", color: "#b2bec3", category: CATEGORIES.SOLIDS, type: "solid_fixed", conductive: true },
        IARBA:      { id: 6, name: "Iarbă", color: "#2ecc71", category: CATEGORIES.SOLIDS, type: "sand", flammable: true },
        FLOARE:     { id: 7, name: "Floare", color: "#e84393", category: CATEGORIES.SOLIDS, type: "sand", flammable: true },

        APA:        { id: 8, name: "Apă", color: "#3498db", category: CATEGORIES.LIQUIDS, type: "liquid" },
        ULEI:       { id: 9, name: "Ulei", color: "#f1c40f", category: CATEGORIES.LIQUIDS, type: "liquid", flammable: true },

        ABUR:       { id: 10, name: "Abur", color: "#dfe6e9", category: CATEGORIES.GASES, type: "gas" },
        GAZ:        { id: 11, name: "Gaz", color: "#fdcb6e", category: CATEGORIES.GASES, type: "gas", flammable: true },

        FOC:        { id: 12, name: "Foc Agresiv", color: "#ff4757", category: CATEGORIES.FIRE_ENERGY, type: "fire", life: 35 },
        FURTUNA:    { id: 13, name: "Nor Furtună", color: "#6c5ce7", category: CATEGORIES.FIRE_ENERGY, type: "storm" },

        STALINIUM:  { id: 14, name: "Stalinium (Indestructibil)", color: "#4a5568", category: CATEGORIES.SOVIET, type: "indestructible", indestructible: true, dynamicColor: true },
        GULAG:      { id: 15, name: "Gulag", color: "#2f3640", category: CATEGORIES.SOVIET, type: "solid_fixed" },
        VODKA:      { id: 16, name: "Vodka", color: "#dcdde1", category: CATEGORIES.SOVIET, type: "liquid", flammable: true },
        CARTOF:     { id: 17, name: "Cartof", color: "#a06932", category: CATEGORIES.SOVIET, type: "sand", flammable: true },
        STEAG_R:    { id: 18, name: "Steag Roșu", color: "#ea2027", category: CATEGORIES.SOVIET, type: "solid_fixed", flammable: true },

        LASER:      { id: 19, name: "Laser Mega-Tăietor", color: "#00cec9", category: CATEGORIES.TOOLS, type: "tool_beam" },
        FULGER:     { id: 20, name: "Fulger", color: "#ffeaa7", category: CATEGORIES.FIRE_ENERGY, type: "tool_beam" }
    };

    let grid = createGrid();
    let nextGrid = createGrid();
    let currentMaterial = MATERIALS.PAMANT;
    let brushSize = 3;
    let isMouseDown = false;
    let mouseX = 0, mouseY = 0;
    let isPaused = false;
    let currentSaveSlot = 'slot_1';

    function createGrid() {
        let g = new Array(GRID_HEIGHT);
        for (let y = 0; y < GRID_HEIGHT; y++) {
            g[y] = new Array(GRID_WIDTH).fill(0).map(() => ({ id: 0, life: 0, color: null }));
        }
        return g;
    }

    function updatePhysics() {
        if (isPaused) return;

        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                nextGrid[y][x] = { ...grid[y][x] };
            }
        }

        for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                let cell = grid[y][x];
                if (cell.id === MATERIALS.EMPTY.id) continue;

                // 1. Solide Granulare
                if (cell.id === MATERIALS.PAMANT.id || cell.id === MATERIALS.NISIP.id || cell.id === MATERIALS.IARBA.id || cell.id === MATERIALS.FLOARE.id || cell.id === MATERIALS.CARTOF.id) {
                    if (y + 1 < GRID_HEIGHT) {
                        if (grid[y + 1][x].id === MATERIALS.EMPTY.id) {
                            nextGrid[y + 1][x] = cell;
                            nextGrid[y][x] = { id: 0, life: 0, color: null };
                        } else if (grid[y + 1][x].id === MATERIALS.APA.id || grid[y + 1][x].id === MATERIALS.ULEI.id || grid[y + 1][x].id === MATERIALS.VODKA.id) {
                            let liquidCell = grid[y + 1][x];
                            nextGrid[y + 1][x] = cell;
                            nextGrid[y][x] = liquidCell;
                        } else {
                            let dir = Math.random() < 0.5 ? -1 : 1;
                            if (x + dir >= 0 && x + dir < GRID_WIDTH && grid[y + 1][x + dir].id === MATERIALS.EMPTY.id) {
                                nextGrid[y + 1][x + dir] = cell;
                                nextGrid[y][x] = { id: 0, life: 0, color: null };
                            } else if (x - dir >= 0 && x - dir < GRID_WIDTH && grid[y + 1][x - dir].id === MATERIALS.EMPTY.id) {
                                nextGrid[y + 1][x - dir] = cell;
                                nextGrid[y][x] = { id: 0, life: 0, color: null };
                            }
                        }
                    }
                }

                // 2. Solide Fixe
                else if (cell.id === MATERIALS.PIATRA.id || cell.id === MATERIALS.LEMN.id || cell.id === MATERIALS.METAL.id || 
                         cell.id === MATERIALS.STALINIUM.id || cell.id === MATERIALS.GULAG.id || cell.id === MATERIALS.STEAG_R.id) {
                    // Fixe
                }

                // 3. Lichide
                else if (cell.id === MATERIALS.APA.id || cell.id === MATERIALS.ULEI.id || cell.id === MATERIALS.VODKA.id) {
                    if (y + 1 < GRID_HEIGHT && nextGrid[y + 1][x].id === MATERIALS.EMPTY.id) {
                        nextGrid[y + 1][x] = cell;
                        nextGrid[y][x] = { id: 0, life: 0, color: null };
                    } else {
                        let leftFree = (x - 1 >= 0 && nextGrid[y][x - 1].id === MATERIALS.EMPTY.id);
                        let rightFree = (x + 1 < GRID_WIDTH && nextGrid[y][x + 1].id === MATERIALS.EMPTY.id);

                        if (leftFree && rightFree) {
                            let dir = Math.random() < 0.5 ? -1 : 1;
                            nextGrid[y][x + dir] = cell;
                            nextGrid[y][x] = { id: 0, life: 0, color: null };
                        } else if (leftFree) {
                            nextGrid[y][x - 1] = cell;
                            nextGrid[y][x] = { id: 0, life: 0, color: null };
                        } else if (rightFree) {
                            nextGrid[y][x + 1] = cell;
                            nextGrid[y][x] = { id: 0, life: 0, color: null };
                        }
                    }
                }

                // 4. Gaze
                else if (cell.id === MATERIALS.ABUR.id || cell.id === MATERIALS.GAZ.id) {
                    cell.life--;
                    if (cell.life <= 0 && cell.id !== MATERIALS.GAZ.id) {
                        nextGrid[y][x] = { id: 0, life: 0, color: null };
                    } else if (y - 1 >= 0 && nextGrid[y - 1][x].id === MATERIALS.EMPTY.id) {
                        nextGrid[y - 1][x] = cell;
                        nextGrid[y][x] = { id: 0, life: 0, color: null };
                    }
                }

                // 5. Foc
                else if (cell.id === MATERIALS.FOC.id) {
                    cell.life--;
                    let hasBlockedRoof = (y - 1 >= 0 && grid[y - 1][x].id !== MATERIALS.EMPTY.id && !grid[y - 1][x].flammable && grid[y - 1][x].id !== MATERIALS.GAZ.id && grid[y - 1][x].id !== MATERIALS.STALINIUM.id);

                    if (cell.life <= 0 || hasBlockedRoof) {
                        nextGrid[y][x] = { id: 0, life: 0, color: null };
                    } else {
                        if (y - 1 >= 0 && nextGrid[y - 1][x].id === MATERIALS.EMPTY.id && Math.random() < 0.6) {
                            nextGrid[y - 1][x] = cell;
                            nextGrid[y][x] = { id: 0, life: 0, color: null };
                        }

                        let neighbors = [[y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]];
                        neighbors.forEach(([ny, nx]) => {
                            if (ny >= 0 && ny < GRID_HEIGHT && nx >= 0 && nx < GRID_WIDTH) {
                                let target = grid[ny][nx];
                                if (target.id === MATERIALS.STALINIUM.id) return;

                                if (target.id === MATERIALS.APA.id) {
                                    nextGrid[y][x] = { id: MATERIALS.ABUR.id, life: 30, color: null };
                                } else if (target.flammable || target.id === MATERIALS.LEMN.id || target.id === MATERIALS.CARTOF.id || 
                                           target.id === MATERIALS.VODKA.id || target.id === MATERIALS.STEAG_R.id || target.id === MATERIALS.IARBA.id || target.id === MATERIALS.FLOARE.id) {
                                    if (Math.random() < 0.8) {
                                        nextGrid[ny][nx] = { id: MATERIALS.FOC.id, life: 40, color: null };
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }

        let temp = grid;
        grid = nextGrid;
        nextGrid = temp;
    }

    function processToolBeams() {
        if (!isMouseDown) return;

        if (currentMaterial.id === MATERIALS.LASER.id) {
            let targetY = Math.min(mouseY, GRID_HEIGHT - 1);
            for (let y = 0; y <= targetY; y++) {
                for (let dx = -brushSize; dx <= brushSize; dx++) {
                    let lx = mouseX + dx;
                    if (lx >= 0 && lx < GRID_WIDTH) {
                        let target = grid[y][lx];
                        if (target.id !== MATERIALS.EMPTY.id && target.id !== MATERIALS.STALINIUM.id) {
                            grid[y][lx] = { id: 0, life: 0, color: null };
                            nextGrid[y][lx] = { id: 0, life: 0, color: null };
                        }
                    }
                }
            }
        } else if (currentMaterial.id === MATERIALS.FULGER.id) {
            let curX = mouseX;
            for (let y = 0; y <= mouseY && y < GRID_HEIGHT; y++) {
                curX += (Math.floor(Math.random() * 3) - 1);
                curX = Math.max(0, Math.min(GRID_WIDTH - 1, curX));
                let targetId = grid[y][curX].id;
                if (targetId !== MATERIALS.EMPTY.id) {
                    if (targetId === MATERIALS.METAL.id || targetId === MATERIALS.GULAG.id) {
                        let metalNeighbors = [[y - 1, curX], [y + 1, curX], [y, curX - 1], [y, curX + 1]];
                        metalNeighbors.forEach(([my, mx]) => {
                            if (my >= 0 && my < GRID_HEIGHT && mx >= 0 && mx < GRID_WIDTH) {
                                let target = grid[my][mx];
                                if (target.id !== MATERIALS.STALINIUM.id && (target.flammable || target.id === MATERIALS.CARTOF.id || target.id === MATERIALS.VODKA.id)) {
                                    nextGrid[my][mx] = { id: MATERIALS.FOC.id, life: 35, color: null };
                                }
                            }
                        });
                    }
                    break;
                }
            }
        }
    }

    function drawSandbox() {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                let cell = grid[y][x];
                if (cell.id !== 0) {
                    let matKey = Object.keys(MATERIALS).find(k => MATERIALS[k].id === cell.id);
                    let mat = MATERIALS[matKey];
                    if (mat) {
                        let color = cell.color || mat.color;
                        if (mat.id === MATERIALS.FOC.id) {
                            color = Math.random() < 0.5 ? "#ff4757" : "#ffa502";
                        }
                        ctx.fillStyle = color;
                        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
                    }
                }
            }
        }

        if (isMouseDown) {
            if (currentMaterial.id === MATERIALS.LASER.id) {
                ctx.save();
                ctx.shadowBlur = 18;
                ctx.shadowColor = '#00cec9';
                ctx.strokeStyle = '#e0ffff';
                ctx.lineWidth = (brushSize * 2 + 1) * PIXEL_SIZE;
                ctx.beginPath();
                ctx.moveTo(mouseX * PIXEL_SIZE + PIXEL_SIZE / 2, 0);
                ctx.lineTo(mouseX * PIXEL_SIZE + PIXEL_SIZE / 2, mouseY * PIXEL_SIZE);
                ctx.stroke();
                ctx.restore();
            } else if (currentMaterial.id === MATERIALS.FULGER.id) {
                ctx.save();
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#ffeaa7';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                let curX = mouseX * PIXEL_SIZE;
                ctx.moveTo(curX, 0);
                for (let y = 0; y <= mouseY * PIXEL_SIZE; y += 10) {
                    curX += (Math.random() * 12 - 6);
                    ctx.lineTo(curX, y);
                }
                ctx.stroke();
                ctx.restore();
            }
        }

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            (mouseX - brushSize) * PIXEL_SIZE,
            (mouseY - brushSize) * PIXEL_SIZE,
            (brushSize * 2 + 1) * PIXEL_SIZE,
            (brushSize * 2 + 1) * PIXEL_SIZE
        );
    }

    function applyBrush(gx, gy) {
        if (currentMaterial.id === MATERIALS.LASER.id || currentMaterial.id === MATERIALS.FULGER.id) return;

        for (let dy = -brushSize; dy <= brushSize; dy++) {
            for (let dx = -brushSize; dx <= brushSize; dx++) {
                let nx = gx + dx;
                let ny = gy + dy;
                if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT) {
                    let target = grid[ny][nx];
                    if (currentMaterial.id === MATERIALS.EMPTY.id) {
                        grid[ny][nx] = { id: 0, life: 0, color: null };
                    } else {
                        if (target.id === MATERIALS.EMPTY.id) {
                            let cellColor = null;
                            if (currentMaterial.dynamicColor) {
                                cellColor = currentMaterial.color;
                            }
                            grid[ny][nx] = { id: currentMaterial.id, life: currentMaterial.life || 0, color: cellColor };
                        }
                    }
                }
            }
        }
    }

    window.setStaliniumColor = function(hexColor) {
        MATERIALS.STALINIUM.color = hexColor;
    };

    window.saveSandboxState = function() {
        const slot = document.getElementById('sb-slot-select').value || 'slot_1';
        currentSaveSlot = slot;
        const saveData = { timestamp: Date.now(), data: grid };
        localStorage.setItem(`sandbox_soviet_v2_${slot}`, JSON.stringify(saveData));
        alert(`Salvare reușită în "${slot}"!`);
    };

    window.loadSandboxState = function() {
        const slot = document.getElementById('sb-slot-select').value || 'slot_1';
        currentSaveSlot = slot;
        const saved = localStorage.getItem(`sandbox_soviet_v2_${slot}`);
        if (!saved) return alert(`Nu există nicio salvare în "${slot}"!`);
        try {
            const parsed = JSON.parse(saved);
            grid = parsed.data;
            alert(`Salvarea din "${slot}" a fost încărcată!`);
        } catch (e) {
            alert("Eroare la citirea salvării.");
        }
    };

    window.exportSandboxFile = function() {
        const saveData = JSON.stringify({ gridWidth: GRID_WIDTH, gridHeight: GRID_HEIGHT, data: grid });
        const blob = new Blob([saveData], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `sandbox_soviet_${currentSaveSlot}_${Date.now()}.json`;
        a.click();
    };

    window.importSandboxFile = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                grid = parsed.data;
                alert("Fișier importat cu succes!");
            } catch (err) {
                alert("Fișier invalid!");
            }
        };
        reader.readAsText(file);
    };

    function createSandboxUI() {
        let oldUi = document.getElementById('sandbox-ui');
        if (oldUi) oldUi.remove();

        const container = document.getElementById('game-container');
        if (container) {
            container.style.display = 'flex';
            container.style.flexDirection = 'row';
            container.style.alignItems = 'flex-start';
            container.style.justifyContent = 'center';
            container.style.gap = '15px';
        }

        const ui = document.createElement('div');
        ui.id = 'sandbox-ui';
        // Meniul este extras complet în afara suprafeței de joc
        ui.style.cssText = `
            position: relative; z-index: 1000;
            background: rgba(20, 20, 25, 0.95); border: 2px solid #ea2027;
            padding: 12px; border-radius: 8px; color: white; width: 320px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px;
            display: flex; flex-direction: column; gap: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.6);
            max-height: 90vh; overflow-y: auto; flex-shrink: 0;
        `;

        let title = document.createElement('div');
        title.style.cssText = 'font-weight: bold; color: #ea2027; font-size: 15px; text-align: center; text-transform: uppercase; letter-spacing: 1px;';
        title.innerText = 'SANDBOX (URSS EDITION V2)';
        ui.appendChild(title);

        let categoryContainer = document.createElement('div');
        categoryContainer.style.cssText = 'display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto; padding-right: 4px;';

        Object.values(CATEGORIES).forEach(catName => {
            let catHeader = document.createElement('div');
            catHeader.style.cssText = 'font-weight: bold; color: #ff9f1a; font-size: 11px; margin-top: 4px; border-bottom: 1px solid #444; padding-bottom: 2px;';
            catHeader.innerText = catName;
            categoryContainer.appendChild(catHeader);

            let btnGroup = document.createElement('div');
            btnGroup.style.cssText = 'display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px;';

            Object.keys(MATERIALS).forEach(k => {
                let m = MATERIALS[k];
                if (m.category === catName && m.id !== MATERIALS.ABUR.id) {
                    let btn = document.createElement('button');
                    btn.innerText = m.name;
                    btn.style.cssText = `
                        background: ${m.color}; color: #fff; border: 1px solid rgba(255,255,255,0.3);
                        padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px; font-weight: bold;
                        text-shadow: 1px 1px 1px #000; transition: transform 0.1s;
                    `;
                    btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
                    btn.onmouseout = () => btn.style.transform = 'scale(1)';
                    btn.onclick = () => { 
                        currentMaterial = m; 
                    };
                    btnGroup.appendChild(btn);
                }
            });
            categoryContainer.appendChild(btnGroup);
        });
        ui.appendChild(categoryContainer);

        let controls = document.createElement('div');
        controls.style.cssText = 'display: flex; flex-direction: column; gap: 6px; border-top: 1px solid #444; padding-top: 8px;';
        controls.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Dimensiune Pensulă / Laser:</span>
                <input type="range" id="sb-brush" min="1" max="10" value="${brushSize}" style="width: 120px;">
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
                <label style="font-size:11px;">Slot Salvare:</label>
                <select id="sb-slot-select" style="flex:1; background:#222; color:#fff; border:1px solid #555; padding:4px; border-radius:4px;">
                    <option value="slot_1">Slot 1</option>
                    <option value="slot_2">Slot 2</option>
                    <option value="slot_3">Slot 3</option>
                    <option value="slot_4">Slot 4</option>
                </select>
            </div>
            <div style="display: flex; gap: 6px;">
                <button onclick="window.saveSandboxState()" style="flex:1; background:#27ae60; color:#fff; border:none; padding:5px; border-radius:4px; cursor:pointer; font-weight:bold;">Salvează</button>
                <button onclick="window.loadSandboxState()" style="flex:1; background:#2980b9; color:#fff; border:none; padding:5px; border-radius:4px; cursor:pointer; font-weight:bold;">Încarcă</button>
            </div>
            <div style="display: flex; gap: 6px;">
                <button onclick="window.exportSandboxFile()" style="flex:1; background:#8e44ad; color:#fff; border:none; padding:5px; border-radius:4px; cursor:pointer; font-weight:bold;">Export Fișier</button>
                <input type="file" id="sb-file-input" style="display:none;" onchange="window.importSandboxFile(event)">
                <button onclick="document.getElementById('sb-file-input').click()" style="flex:1; background:#d35400; color:#fff; border:none; padding:5px; border-radius:4px; cursor:pointer; font-weight:bold;">Import Fișier</button>
            </div>
            <div style="display: flex; gap: 6px;">
                <button id="sb-pause" style="flex:1; background:#444; color:#fff; border:none; padding:5px; border-radius:4px; cursor:pointer; font-weight:bold;">Pauză</button>
                <button id="sb-clear" style="flex:1; background:#c0392b; color:#fff; border:none; padding:5px; border-radius:4px; cursor:pointer; font-weight:bold;">Curăță tot</button>
            </div>
            <button onclick="window.backToMain()" style="background:#555; color:#fff; border:none; padding:6px; border-radius:4px; cursor:pointer; margin-top:2px; font-weight:bold;">Înapoi la meniu</button>
        `;
        ui.appendChild(controls);
        if (container) {
            container.appendChild(ui);
        } else {
            document.body.appendChild(ui);
        }

        document.getElementById('sb-brush').oninput = (e) => { brushSize = parseInt(e.target.value); };
        document.getElementById('sb-pause').onclick = (e) => {
            isPaused = !isPaused;
            e.target.innerText = isPaused ? 'Continuă' : 'Pauză';
        };
        document.getElementById('sb-clear').onclick = () => { grid = createGrid(); };
    }

    canvas.addEventListener('mousedown', (e) => {
        if (currentMode !== 'SANDBOX') return;
        isMouseDown = true;
        updateMousePos(e);
        applyBrush(mouseX, mouseY);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (currentMode !== 'SANDBOX') return;
        updateMousePos(e);
        if (isMouseDown) applyBrush(mouseX, mouseY);
    });

    window.addEventListener('mouseup', () => { isMouseDown = false; });

    function updateMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        mouseX = Math.floor((e.clientX - rect.left) / (rect.width / GRID_WIDTH));
        mouseY = Math.floor((e.clientY - rect.top) / (rect.height / GRID_HEIGHT));
    }

    window.startSandboxMode = function() {
        if (typeof hideAllMenus === 'function') hideAllMenus();
        if (typeof stopMenuMusic === 'function') stopMenuMusic();
        
        currentMode = 'SANDBOX';
        gameActive = true;
        grid = createGrid();
        createSandboxUI();

        function loop() {
            if (currentMode !== 'SANDBOX') {
                let ui = document.getElementById('sandbox-ui');
                if (ui) ui.remove();
                return;
            }
            processToolBeams();
            updatePhysics();
            drawSandbox();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    };
})();