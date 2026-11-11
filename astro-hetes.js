// astro-hetes.js - Modul Astro Hetes (Singleplayer Seeker)
(() => {
const W = 1280, H = 720, N = 32, FOV = 1.15, C = 640;
const $ = id => document.getElementById(id);
const cv = $('gameCanvas');
if (!cv) return;
const cx = cv.getContext('2d');

// ========== IMAGES ==========
const IMG = {};
const imgNames = [
    'enemy', 'ammo',
    'makarov', 'ppsh', 'mosin', 'svt40', 'rpg7', 'ak47', 'rpk16', 'pkm', 'ak12',
    'hetes-front', 'hetes-back', 'catalin-front', 'catalin-back',
    'proletar-front', 'proletar-back', 'gopnik-front', 'gopnik-back',
    'nazbol-front', 'nazbol-back',
    'soldat-sovietic-front', 'soldat-sovietic-back',
    'cernobil-stalker-front', 'cernobil-stalker-back',
    'soldat-rus-modern-front', 'soldat-rus-modern-back',
    'anti-furry-hetes-front', 'anti-furry-hetes-back',
    'hetes astro-front', 'hetes astro-back',
    'hetes astro-front-chase', 'hetes astro-back-chase',
    'astro-gun', 'plasma-orb', 'generator', 'vodka',
    'soviet lantern-item', 'soviet lantern-player'
];
imgNames.forEach(n => { IMG[n] = new Image(); IMG[n].src = n + '.png'; });

// ========== SOUNDS ==========
const sndGun = new Audio('gun.mp3');
const sndExplosion = new Audio('st explosion sound6.mp3');
const sndJump = new Audio('clasic-jump.mp3');
const sndWin = new Audio('gimn-sssr.mp3');
const sndAstroCharge = new Audio('astro-charge.mp3');
const sndAstroShoot = new Audio('astro-shoot.mp3');
const sndAstroLaugh = new Audio('astro-laugh.mp3');
const sndHorizon = new Audio('horizon.mp3');
sndHorizon.loop = true;

// ========== WEAPONS ==========
const WEAPONS_DEF = {
    mak:   { name: 'Makarov', dmg: 35, rate: 0.33, mag: 8, maxAmmo: 40, give: 16, reqKills: 0, img: 'makarov' },
    mos:   { name: 'Mosin-Nagant', dmg: 70, rate: 1.1, mag: 5, maxAmmo: 25, give: 10, reqKills: 0, img: 'mosin' },
    ppsh:  { name: 'PPSh-41', dmg: 5, rate: 0.075, mag: 71, maxAmmo: 142, give: 71, reqKills: 50, img: 'ppsh' },
    svt:   { name: 'SVT-40', dmg: 11, rate: 0.25, mag: 10, maxAmmo: 50, give: 20, reqKills: 150, img: 'svt40' },
    rpg:   { name: 'RPG-7', dmg: 140, rate: 1.8, mag: 1, maxAmmo: 5, give: 2, splash: 2.5, reqKills: 300, img: 'rpg7' },
    ak:    { name: 'AK-47', dmg: 16, rate: 0.1, mag: 30, maxAmmo: 120, give: 60, reqKills: 500, img: 'ak47' },
    rpk16: { name: 'RPK-16', dmg: 19, rate: 0.09, mag: 45, maxAmmo: 180, give: 90, reqKills: 650, img: 'rpk16' },
    pkm:   { name: 'PKM', dmg: 22, rate: 0.12, mag: 100, maxAmmo: 200, give: 100, reqKills: 800, img: 'pkm' },
    ak12:  { name: 'AK-12', dmg: 25, rate: 0.08, mag: 30, maxAmmo: 150, give: 60, reqKills: 1000, img: 'ak12' }
};

const SKINS_DEF = {
    hetes: { name: 'Hetes', front: 'hetes-front', back: 'hetes-back' },
    catalin: { name: 'Catalin', front: 'catalin-front', back: 'catalin-back' },
    proletar: { name: 'Proletar', front: 'proletar-front', back: 'proletar-back' },
    gopnik: { name: 'Gopnik', front: 'gopnik-front', back: 'gopnik-back' },
    nazbol: { name: 'Nazbol', front: 'nazbol-front', back: 'nazbol-back' },
    'soldat-sovietic': { name: 'Soldat Sovietic', front: 'soldat-sovietic-front', back: 'soldat-sovietic-back' },
    'cernobil-stalker': { name: 'Cernobil Stalker', front: 'cernobil-stalker-front', back: 'cernobil-stalker-back' },
    'soldat-rus-modern': { name: 'Soldat Rus Modern', front: 'soldat-rus-modern-front', back: 'soldat-rus-modern-back' },
    'anti-furry-hetes': { name: 'Anti-Furry Hetes', front: 'anti-furry-hetes-front', back: 'anti-furry-hetes-back' }
};

const MAP_GRID = [
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1,
    1,0,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,0,0,1,
    1,0,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,
    1,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,1,
    1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,
    1,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,1,
    1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1,
    1,0,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,0,0,1,
    1,0,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
];

let Z = new Float32Array(C);
const solid = (x, y, r = 0.2) => {
    if (x < 0 || x >= N || y < 0 || y >= N) return 1;
    return MAP_GRID[((y - r) | 0) * N + ((x - r) | 0)] ||
           MAP_GRID[((y - r) | 0) * N + ((x + r) | 0)] ||
           MAP_GRID[((y + r) | 0) * N + ((x - r) | 0)] ||
           MAP_GRID[((y + r) | 0) * N + ((x + r) | 0)];
};

const cast = (px, py, a) => {
    let dx = Math.cos(a) || 1e-9, dy = Math.sin(a) || 1e-9, mx = px | 0, my = py | 0,
        ax = Math.abs(1 / dx), ay = Math.abs(1 / dy),
        sx = dx < 0 ? -1 : 1, sy = dy < 0 ? -1 : 1,
        tx = (dx < 0 ? px - mx : mx + 1 - px) * ax,
        ty = (dy < 0 ? py - my : my + 1 - py) * ay, s = 0, t = 0;
    for (let i = 0; i < 70; i++) {
        if (tx < ty) { tx += ax; mx += sx; s = 0; }
        else { ty += ay; my += sy; s = 1; }
        if (mx < 0 || mx >= N || my < 0 || my >= N) { t = 1; break; }
        t = MAP_GRID[my * N + mx]; if (t) break;
    }
    const d = s ? ty - ay : tx - ax, w = s ? px + d * dx : py + d * dy;
    return [d, t, s, w - Math.floor(w)];
};

const los = (x1, y1, x2, y2) => cast(x1, y1, Math.atan2(y2 - y1, x2 - x1))[0] > Math.hypot(x2 - x1, y2 - y1);

// ========== CONSTANTS ==========
const SEEKER_HP = 2070;
const HIDER_BASE_HP = 100;
const PLASMA_DMG = 50;
const ROUND_MS = 3 * 60 * 1000;
const HIDER_SKINS = ['hetes','catalin','proletar','gopnik','nazbol','soldat-sovietic','cernobil-stalker','soldat-rus-modern','anti-furry-hetes'];
const HIDER_SKIN_WEIGHTS = [30,20,18,14,8,5,3,1.5,0.5];
const SEEKER_RECHARGE_CD = 60, SEEKER_RECHARGE_DURATION = 20, SEEKER_RECHARGE_SPEED_MULT = 1.8, SEEKER_RECHARGE_HEAL = 500;
const SEEKER_BOOST_CD = 20, SEEKER_BOOST_DURATION = 3, SEEKER_BOOST_FIRE_RATE = 1;
const MP_SPAWNS = [[2.5,2.5],[16.5,2.5],[29.5,2.5],[2.5,14.5],[29.5,14.5],[8.5,14.5],[23.5,14.5],[16.5,10.5],[2.5,29.5],[16.5,29.5],[29.5,29.5],[12.5,24.5],[20.5,24.5],[12.5,6.5],[20.5,6.5]];

function randomHiderSkin() {
    let total = HIDER_SKIN_WEIGHTS.reduce((a,b)=>a+b,0), r = Math.random() * total;
    for (let i = 0; i < HIDER_SKINS.length; i++) { r -= HIDER_SKIN_WEIGHTS[i]; if (r <= 0) return HIDER_SKINS[i]; }
    return 'hetes';
}

// ========== STATE ==========
let AH = {
    on: false,
    difficulty: 'easy',
    x: 16.5, y: 16.5, a: 0,
    hp: SEEKER_HP, maxHp: SEEKER_HP,
    gunCd: 0, kick: 0, flash: 0, hm: 0, bob: 0,
    rechargeCd: 0, rechargeTimer: 0,
    boostCd: 0, boostTimer: 0,
    frozenTimer: 0,
    roundStart: 0, roundDuration: ROUND_MS,
    npcs: [], plasmaOrbs: [],
    kills: 0, killedBy: null,
    gameStarted: false, startCountdown: 3,
    ended: false, t: performance.now(),
    fire: 0
};

// ========== DIFFICULTY CONFIG ==========
const DIFFICULTIES = {
    easy: { label: 'Ușor', hiderHp: 100, hiderCount: 5, seekerHp: SEEKER_HP, npcShootMult: 3, available: true },
    medium: { label: 'Mediu', hiderHp: 150, hiderCount: 7, seekerHp: 3000, npcShootMult: 4, available: false },
    hard: { label: 'Greu', hiderHp: 200, hiderCount: 9, seekerHp: 4000, npcShootMult: 5, available: false },
    soviet: { label: 'Sovietic', hiderHp: 300, hiderCount: 12, seekerHp: 5000, npcShootMult: 6, available: false }
};

// ========== INIT ==========
function ahInit(difficulty) {
    const cfg = DIFFICULTIES[difficulty] || DIFFICULTIES.easy;
    AH.difficulty = difficulty;
    AH.x = 16.5; AH.y = 16.5; AH.a = 0;
    AH.hp = cfg.seekerHp; AH.maxHp = cfg.seekerHp;
    AH.gunCd = 0; AH.kick = 0; AH.flash = 0; AH.hm = 0; AH.bob = 0;
    AH.rechargeCd = 0; AH.rechargeTimer = 0;
    AH.boostCd = 0; AH.boostTimer = 0;
    AH.frozenTimer = 0;
    AH.roundStart = performance.now();
    AH.roundDuration = ROUND_MS;
    AH.npcs = []; AH.plasmaOrbs = [];
    AH.kills = 0; AH.killedBy = null;
    AH.gameStarted = false; AH.startCountdown = 3;
    AH.ended = false; AH.fire = 0;
    AH.t = performance.now();

    for (let i = 0; i < cfg.hiderCount; i++) {
        const spawn = MP_SPAWNS[(i + 2) % MP_SPAWNS.length];
        const skin = randomHiderSkin();
        AH.npcs.push({
            type: 'hider', skin,
            x: spawn[0], y: spawn[1], a: Math.random() * Math.PI * 2,
            hp: cfg.hiderHp, maxHp: cfg.hiderHp,
            dead: false, lanternOn: false, lanternTimer: 0,
            lastX: spawn[0], lastY: spawn[1], stuckTime: 0,
            shootCd: 1 + Math.random() * 2
        });
    }

    sndHorizon.currentTime = 0; sndHorizon.play().catch(() => {});
    requestAnimationFrame(ahLoop);
}

// ========== UPDATE ==========
function updateAH(dt) {
    if (!AH.on || AH.ended) return;
    const now = performance.now();
    if (!AH.gameStarted) {
        AH.startCountdown -= dt;
        if (AH.startCountdown <= 0) AH.gameStarted = true;
        return;
    }
    if (now - AH.roundStart >= AH.roundDuration) { ahEnd(false); return; }

    AH.gunCd = Math.max(0, AH.gunCd - dt);
    AH.kick = Math.max(0, AH.kick - dt * 6);
    AH.flash = Math.max(0, AH.flash - dt);
    AH.hm = Math.max(0, AH.hm - dt);
    AH.rechargeCd = Math.max(0, AH.rechargeCd - dt);
    AH.rechargeTimer = Math.max(0, AH.rechargeTimer - dt);
    AH.boostCd = Math.max(0, AH.boostCd - dt);
    AH.boostTimer = Math.max(0, AH.boostTimer - dt);
    AH.frozenTimer = Math.max(0, AH.frozenTimer - dt);

    // Movement
    let k = window.keys || {};
    let forward = (k['w'] || k['arrowup'] ? 1 : 0) - (k['s'] || k['arrowdown'] ? 1 : 0);
    let strafe = (k['d'] || k['arrowright'] ? 1 : 0) - (k['a'] || k['arrowleft'] ? 1 : 0);
    let cosA = Math.cos(AH.a), sinA = Math.sin(AH.a);
    let mx = forward * cosA - strafe * sinA;
    let my = forward * sinA + strafe * cosA;
    let spd = 4.0;
    if (AH.rechargeTimer > 0) spd *= SEEKER_RECHARGE_SPEED_MULT;
    if (AH.frozenTimer > 0) spd = 0;
    let l = Math.hypot(mx, my);
    if (l) {
        mx = (mx / l) * spd * dt; my = (my / l) * spd * dt;
        AH.bob += dt * 9;
        if (!solid(AH.x + mx, AH.y)) AH.x += mx;
        if (!solid(AH.x, AH.y + my)) AH.y += my;
    }

    // NPCs AI
    const cfg = DIFFICULTIES[AH.difficulty];
    AH.npcs.forEach(n => {
        if (n.dead) return;
        n.lanternTimer -= dt; if (n.lanternTimer <= 0) n.lanternOn = false;
        n.shootCd = Math.max(0, n.shootCd - dt);

        const d = Math.hypot(AH.x - n.x, AH.y - n.y);
        if (d < 10) {
            // flee
            const fleeAngle = Math.atan2(n.y - AH.y, n.x - AH.x);
            n.a = fleeAngle;
            const nspd = 2.4;
            let nx = n.x + Math.cos(fleeAngle) * nspd * dt;
            let ny = n.y + Math.sin(fleeAngle) * nspd * dt;
            if (!solid(nx, n.y)) n.x = nx;
            if (!solid(n.x, ny)) n.y = ny;
        } else if (Math.random() < dt * 0.5) {
            n.a = Math.random() * Math.PI * 2;
        } else {
            let nx = n.x + Math.cos(n.a) * 1.5 * dt;
            let ny = n.y + Math.sin(n.a) * 1.5 * dt;
            if (!solid(nx, n.y)) n.x = nx; else n.a += Math.PI / 2;
            if (!solid(n.x, ny)) n.y = ny; else n.a += Math.PI / 2;
        }
        if (!n.lanternOn && n.lanternTimer <= 0 && Math.random() < dt * 0.05) { n.lanternOn = true; n.lanternTimer = 5; }

        // Touch kill
        if (d < 0.7 + 0.3) {
            n.dead = true; n.hp = 0; AH.kills++;
            addKillFeed(`Ai prins un hider! Kills: ${AH.kills}`);
        }

        // Shoot at seeker
        if (n.shootCd <= 0 && d < 12 && los(n.x, n.y, AH.x, AH.y)) {
            n.shootCd = 2 + Math.random() * 2;
            AH.hp -= 100 * (cfg.npcShootMult / 3);
            AH.flash = 0.3;
            sndAstroShoot.currentTime = 0; sndAstroShoot.play().catch(() => {});
            if (AH.hp <= 0) {
                AH.hp = 0;
                ahEnd(false);
            }
        }
    });

    // Plasma orbs
    for (let i = AH.plasmaOrbs.length - 1; i >= 0; i--) {
        const o = AH.plasmaOrbs[i];
        o.x += o.vx * dt; o.y += o.vy * dt; o.life -= dt;
        AH.npcs.forEach(n => {
            if (!n.dead && Math.hypot(o.x - n.x, o.y - n.y) < 0.6) {
                n.hp -= PLASMA_DMG;
                AH.plasmaOrbs.splice(i, 1);
                if (n.hp <= 0) {
                    n.dead = true; AH.kills++;
                    addKillFeed(`Hider eliminat! Kills: ${AH.kills}`);
                }
            }
        });
        if (o.life <= 0 || solid(o.x, o.y)) { AH.plasmaOrbs.splice(i, 1); sndExplosion.currentTime = 0; sndExplosion.play().catch(()=>{}); }
    }

    // Fire
    let firePressed = AH.fire || (window.mobileShooterFire || 0) || (k[' '] ? 1 : 0);
    if (firePressed && AH.gunCd <= 0 && AH.frozenTimer <= 0) {
        AH.gunCd = AH.boostTimer > 0 ? SEEKER_BOOST_FIRE_RATE : 3;
        sndAstroShoot.currentTime = 0; sndAstroShoot.play().catch(() => {});
        AH.plasmaOrbs.push({
            x: AH.x, y: AH.y,
            vx: Math.cos(AH.a) * 12, vy: Math.sin(AH.a) * 12, life: 3
        });
    }

    // Win
    if (AH.npcs.every(n => n.dead)) { ahEnd(true); }
}

function ahEnd(win) {
    if (!AH.on || AH.ended) return;
    AH.ended = true;
    sndHorizon.pause();
    try { document.exitPointerLock && document.exitPointerLock(); } catch(e){}

    const g = window.gameStats || {};
    g.shooter = g.shooter || { kills: 0, wins: 0, score: 0 };
    g.shooter.astroHetes = g.shooter.astroHetes || { kills: 0, completions: { easy: 0, medium: 0, hard: 0, soviet: 0 } };
    g.shooter.astroHetes.kills = (g.shooter.astroHetes.kills || 0) + AH.kills;
    if (win) {
        g.shooter.astroHetes.completions[AH.difficulty] = (g.shooter.astroHetes.completions[AH.difficulty] || 0) + 1;
        g.shooter.score = (g.shooter.score || 0) + 3000 + AH.kills * 300;
        sndWin.currentTime = 0; sndWin.play().catch(()=>{});
    }
    if (typeof saveStats === 'function') saveStats();

    if (cv) { cv.classList.add('hidden'); cv.style.display = 'none'; }

    const winScr = $('sh-win');
    if (winScr) {
        winScr.classList.remove('hidden');
        if (win) {
            winScr.innerHTML = `<div class="end-title" style="color: #00ffcc;">Astro Hetes: Victorie!</div>
                <div style="font-size:20px; color:#ffcc00; margin-bottom:20px;">Ai eliminat ${AH.kills} hideri (${DIFFICULTIES[AH.difficulty].label})</div>
                <button class="btn btn-back" onclick="backToMain()">Inapoi la meniu</button>`;
        } else {
            winScr.innerHTML = `<div class="end-title" style="color: #ff3333;">Timp expirat!</div>
                <div style="font-size:20px; color:#ffcc00; margin-bottom:20px;">Ai eliminat ${AH.kills} hideri</div>
                <button class="btn btn-back" onclick="backToMain()">Inapoi la meniu</button>`;
        }
    }
}

// ========== RENDER ==========
function renderAH() {
    if (!AH.on) return;
    cx.save();
    cx.fillStyle = '#030306'; cx.fillRect(0, 0, W, H);
    for (let i = 0; i < C; i++) {
        let a = AH.a + (i / C - .5) * FOV;
        let [d, t, s, wx] = cast(AH.x, AH.y, a);
        let p = Math.max(.05, d * Math.cos(a - AH.a));
        Z[i] = p;
        let h = H / p, y0 = (H - h) / 2;
        let c = [140 * 0.85 + 30, 60 * 0.85 + 10, 50 * 0.85 + 8];
        cx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
        cx.fillRect(i * 2, y0, 2, h);
    }

    // Draw NPCs
    AH.npcs.filter(n => !n.dead).map(n => ({ ...n, dist: Math.hypot(n.x - AH.x, n.y - AH.y) })).sort((a, b) => b.dist - a.dist).forEach(o => {
        const toT = Math.atan2(o.y - AH.y, o.x - AH.x);
        let df = toT - AH.a; df = Math.atan2(Math.sin(df), Math.cos(df));
        if (Math.abs(df) > FOV / 2 + 0.4) return;
        const pd = o.dist * Math.cos(df); if (pd < 0.3) return;
        const sk = SKINS_DEF[o.skin] || SKINS_DEF.hetes;
        let rel = o.a - toT; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
        const im = IMG[Math.abs(rel) < Math.PI / 2 ? sk.back : sk.front];
        if (im && im.complete && im.naturalWidth) {
            const hh = H / pd * 0.95, ww = hh * 0.65;
            const ll = (.5 + df / FOV) * W - ww / 2, yy = (H - hh) / 2 + hh * 0.03;
            cx.drawImage(im, ll, yy, ww, hh);
        }
        if (o.lanternOn) {
            const glowX = (.5 + df / FOV) * W, glowY = (H / pd * 0.95) / 2;
            const grad = cx.createRadialGradient(glowX, glowY, 5, glowX, glowY, 60);
            grad.addColorStop(0, 'rgba(255,255,200,0.7)');
            grad.addColorStop(1, 'rgba(255,255,200,0)');
            cx.fillStyle = grad; cx.fillRect(glowX - 60, glowY - 60, 120, 120);
        }
    });

    // Plasma orbs
    AH.plasmaOrbs.forEach(o => {
        const toT = Math.atan2(o.y - AH.y, o.x - AH.x);
        let df = toT - AH.a; df = Math.atan2(Math.sin(df), Math.cos(df));
        if (Math.abs(df) > FOV / 2 + 0.4) return;
        const dist = Math.hypot(o.x - AH.x, o.y - AH.y);
        const pd = dist * Math.cos(df); if (pd < 0.3) return;
        const x = (.5 + df / FOV) * W, y = H / 2;
        const grad = cx.createRadialGradient(x, y, 5, x, y, 50);
        grad.addColorStop(0, 'rgba(255,50,50,1)');
        grad.addColorStop(1, 'rgba(255,0,0,0)');
        cx.fillStyle = grad; cx.fillRect(x - 50, y - 50, 100, 100);
    });

    // Astro gun
    const gi = IMG['astro-gun'];
    if (gi && gi.complete && gi.naturalWidth) {
        let h = H * .45, ww = h * gi.naturalWidth / gi.naturalHeight;
        cx.drawImage(gi, W * .62 - ww * .35 + Math.sin(AH.bob) * 12 + AH.kick * 14, H - h * .92 + Math.abs(Math.cos(AH.bob)) * 10 + AH.kick * 28, ww, h);
    }

    cx.fillStyle = 'rgba(80, 0, 0, 0.15)'; cx.fillRect(0, 0, W, H);
    if (AH.flash > 0) { cx.fillStyle = `rgba(200,0,0,${AH.flash})`; cx.fillRect(0, 0, W, H); }
    if (AH.frozenTimer > 0) {
        cx.fillStyle = `rgba(100, 150, 255, ${0.3 + Math.sin(performance.now() / 100) * 0.1})`;
        cx.fillRect(0, 0, W, H);
        cx.fillStyle = '#fff'; cx.font = 'bold 48px sans-serif'; cx.textAlign = 'center';
        cx.fillText('ÎNGHEȚAT!', W / 2, H / 2 - 100);
        cx.textAlign = 'left';
    }
    if (AH.rechargeTimer > 0) { cx.fillStyle = 'rgba(0, 200, 100, 0.15)'; cx.fillRect(0, 0, W, H); }
    if (AH.boostTimer > 0) { cx.fillStyle = 'rgba(200, 100, 0, 0.12)'; cx.fillRect(0, 0, W, H); }
    cx.restore();

    // Crosshair
    cx.strokeStyle = AH.hm > 0 ? '#f33' : '#fff'; cx.lineWidth = 2; cx.beginPath();
    cx.moveTo(W / 2 - 10, H / 2); cx.lineTo(W / 2 + 10, H / 2);
    cx.moveTo(W / 2, H / 2 - 10); cx.lineTo(W / 2, H / 2 + 10); cx.stroke();

    // HUD
    cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(20, 20, 260, 26);
    cx.fillStyle = '#d22'; cx.fillRect(20, 20, Math.max(0, AH.hp) * (260 / AH.maxHp), 26);
    cx.strokeStyle = '#fff'; cx.lineWidth = 2; cx.strokeRect(20, 20, 260, 26);
    cx.fillStyle = '#fff'; cx.font = 'bold 16px sans-serif'; cx.textAlign = 'left';
    cx.fillText('HP ' + Math.ceil(Math.max(0, AH.hp)) + '/' + AH.maxHp, 28, 39);
    cx.fillStyle = '#ff4444'; cx.font = 'bold 18px sans-serif';
    cx.fillText('🔫 ASTRO HETES (' + DIFFICULTIES[AH.difficulty].label + ')', 20, 75);
    cx.font = 'bold 14px sans-serif';
    const remMs = Math.max(0, AH.roundDuration - (performance.now() - AH.roundStart));
    const mm = Math.floor(remMs / 60000), ss = Math.floor(remMs / 1000) % 60;
    cx.fillStyle = 'rgba(0,0,0,.7)'; cx.fillRect(W / 2 - 80, 10, 160, 50);
    cx.strokeStyle = '#ffcc00'; cx.lineWidth = 2; cx.strokeRect(W / 2 - 80, 10, 160, 50);
    cx.fillStyle = remMs < 30000 ? '#ff4444' : '#fff'; cx.font = 'bold 26px sans-serif'; cx.textAlign = 'center';
    cx.fillText(`${mm}:${ss < 10 ? '0' : ''}${ss}`, W / 2, 46);
    cx.textAlign = 'left';
    cx.fillStyle = AH.gunCd <= 0 ? '#ff4444' : '#888'; cx.font = 'bold 14px sans-serif';
    cx.fillText('CLICK - Astro Gun: ' + (AH.gunCd <= 0 ? '[GATA]' : Math.ceil(AH.gunCd) + 's'), 20, 105);
    cx.fillStyle = AH.rechargeCd <= 0 ? '#00ff88' : '#888';
    cx.fillText('G - Recharge: ' + (AH.rechargeCd <= 0 ? '[GATA]' : Math.ceil(AH.rechargeCd) + 's') + (AH.rechargeTimer > 0 ? ` (activ ${Math.ceil(AH.rechargeTimer)}s)` : ''), 20, 127);
    cx.fillStyle = AH.boostCd <= 0 ? '#ffaa00' : '#888';
    cx.fillText('R - Boost: ' + (AH.boostCd <= 0 ? '[GATA]' : Math.ceil(AH.boostCd) + 's') + (AH.boostTimer > 0 ? ` (activ ${Math.ceil(AH.boostTimer)}s)` : ''), 20, 149);

    // Remaining
    const remaining = AH.npcs.filter(n => !n.dead).length;
    cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(W - 280, 20, 260, 50);
    cx.strokeStyle = '#ff4444'; cx.lineWidth = 2; cx.strokeRect(W - 280, 20, 260, 50);
    cx.fillStyle = '#ff4444'; cx.font = 'bold 14px sans-serif'; cx.fillText('🔫 SEEKER', W - 270, 40);
    cx.fillStyle = '#ffcc00'; cx.font = 'bold 14px sans-serif';
    cx.fillText('Hideri rămași: ' + remaining, W - 270, 60);

    if (!AH.gameStarted) {
        cx.fillStyle = 'rgba(0,0,0,0.85)'; cx.fillRect(0, 0, W, H);
        cx.fillStyle = '#00ffcc'; cx.font = 'bold 80px sans-serif'; cx.textAlign = 'center';
        cx.fillText('ASTRO HETES', W / 2, H / 2 - 40);
        cx.font = 'bold 120px sans-serif';
        cx.fillText(Math.ceil(AH.startCountdown), W / 2, H / 2 + 100);
        cx.textAlign = 'left';
    }
}

function ahLoop(ts) {
    if (!AH.on || AH.ended) return;
    let dt = Math.min(.05, (ts - AH.t) / 1000 || 0);
    AH.t = ts;
    updateAH(dt);
    if (!AH.ended) { renderAH(); requestAnimationFrame(ahLoop); }
}

function addKillFeed(text) {
    window._ahKillFeed = window._ahKillFeed || [];
    window._ahKillFeed.push({ text, time: performance.now() + 4000 });
    if (window._ahKillFeed.length > 5) window._ahKillFeed.shift();
}

// ========== INPUT ==========
cv.addEventListener('mousemove', e => {
    if (!AH.on || AH.ended) return;
    if (document.pointerLockElement === cv) AH.a += e.movementX * 0.0028;
});
cv.addEventListener('mousedown', () => {
    if (!AH.on || AH.ended) return;
    AH.fire = 1;
    if (document.pointerLockElement !== cv) cv.requestPointerLock && cv.requestPointerLock();
});
window.addEventListener('mouseup', () => { if (AH) AH.fire = 0; });
window.addEventListener('keydown', e => {
    if (!AH.on || AH.ended) return;
    const k = e.key.toLowerCase();
    if (k === 'g' && AH.rechargeCd <= 0) {
        AH.rechargeCd = SEEKER_RECHARGE_CD;
        AH.rechargeTimer = SEEKER_RECHARGE_DURATION;
        AH.hp = Math.min(AH.maxHp, AH.hp + SEEKER_RECHARGE_HEAL);
        sndAstroCharge.currentTime = 0; sndAstroCharge.play().catch(()=>{});
        addKillFeed(`Recharge activat! +${SEEKER_RECHARGE_HEAL} HP (${SEEKER_RECHARGE_DURATION}s)`);
    }
    if (k === 'r' && AH.boostCd <= 0) {
        AH.boostCd = SEEKER_BOOST_CD;
        AH.boostTimer = SEEKER_BOOST_DURATION;
        AH.gunCd = 0;
        sndAstroShoot.currentTime = 0; sndAstroShoot.play().catch(()=>{});
        addKillFeed(`Boost activat! (${SEEKER_BOOST_DURATION}s)`);
    }
});

// ========== MENU ==========
window.openAstroHetesMenu = function() {
    if (!window.gameStats?.achievements?.astroHetesUnlocked) {
        alert('Achievement necesar: „Hetes nu este asa OP.."\n\nInvinge-l pe Astro Hetes la Hide And Seek.');
        return;
    }
    hideAllAstroScreens();
    $('sh-astro-menu').classList.remove('hidden');
};

function hideAllAstroScreens() {
    ['main-menu','classic-menu','tetris-menu','sh-main-menu','sh-soviet-menu','sh-skibidi-menu','sh-astro-menu','sh-arsenal','sh-lose','sh-win','auth-panel','mp-chat-container','lose-screen','win-screen'].forEach(id => {
        const el = $(id); if (el) el.classList.add('hidden');
    });
}

window.startAstroHetesSession = function(difficulty) {
    const cfg = DIFFICULTIES[difficulty];
    if (!cfg || !cfg.available) {
        alert('Această dificultate este WIP (Work In Progress). Doar Ușor este disponibil.');
        return;
    }
    hideAllAstroScreens();
    window.currentMode = 'SHOOTER';
    AH.on = true;
    cv.classList.remove('hidden');
    cv.style.display = 'block';
    cv.requestPointerLock && cv.requestPointerLock();
    ahInit(difficulty);
};

// Setup difficulty card clicks
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#astro-diff-cards .sh-card').forEach(card => {
        card.addEventListener('click', () => {
            const diff = card.dataset.diff;
            const cfg = DIFFICULTIES[diff];
            if (!cfg) return;
            if (!cfg.available) {
                alert('Dificultatea ' + cfg.label + ' este WIP. Doar Ușor este disponibil.');
                return;
            }
            document.querySelectorAll('#astro-diff-cards .sh-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const lbl = document.getElementById('astro-diff-label');
            if (lbl) lbl.textContent = cfg.label;
        });
    });
});

})();