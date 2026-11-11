// ascuns.js - Modul Hide and Seek 3D (Singleplayer DOAR Hider + Multiplayer)
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
    'hetes-front', 'hetes-back',
    'catalin-front', 'catalin-back',
    'proletar-front', 'proletar-back',
    'gopnik-front', 'gopnik-back',
    'nazbol-front', 'nazbol-back',
    'soldat-sovietic-front', 'soldat-sovietic-back',
    'cernobil-stalker-front', 'cernobil-stalker-back',
    'soldat-rus-modern-front', 'soldat-rus-modern-back',
    'anti-furry-hetes-front', 'anti-furry-hetes-back',
    'hetes astro-front', 'hetes astro-back',
    'hetes astro-front-chase', 'hetes astro-back-chase',
    'soviet lantern-player', 'soviet lantern-item',
    'soviet-old-lanter', 'astro-gun',
    'generator', 'vodka', 'plasma-orb'
];
imgNames.forEach(n => {
    IMG[n] = new Image();
    IMG[n].src = n + '.png';
});
IMG['hetes jumpscare'] = new Image();
IMG['hetes jumpscare'].src = 'hetes jumpscare.jpg';
IMG['hetes astro-jumscare'] = new Image();
IMG['hetes astro-jumscare'].src = 'hetes astro-jumpscare.jpg';

// ========== SOUNDS ==========
const sndGun = new Audio('gun.mp3');
const sndReload = new Audio('reload.mp3');
const sndExplosion = new Audio('st explosion sound6.mp3');
const sndJump = new Audio('clasic-jump.mp3');
const sndWin = new Audio('gimn-sssr.mp3');
const sndAstroCharge = new Audio('astro-charge.mp3');
const sndAstroShoot = new Audio('astro-shoot.mp3');
const sndAstroLaugh = new Audio('astro-laugh.mp3');
const sndGulagLose = new Audio('gulag-sssr-gimn.mp3');
const sndGulagWin = new Audio('patiot-pesnya-sovietwave.mp3');
const sndHorizon = new Audio('horizon.mp3');
sndHorizon.loop = true;

// ========== FIX MUZICA ==========
(function installMenuMusicBlocker() {
    const blockMenuMusic = () => {
        if (window.currentMode && window.currentMode !== 'NONE') {
            try {
                if (typeof window.stopMenuMusic === 'function') window.stopMenuMusic();
            } catch (e) {}
            document.querySelectorAll('audio').forEach(a => {
                if (!a.paused && a !== sndHorizon) {
                    const src = a.src || '';
                    if (src.includes('Victory Day') || src.includes('ussrmus')) {
                        a.pause();
                        a.currentTime = 0;
                    }
                }
            });
        }
    };
    setInterval(blockMenuMusic, 250);
    window.addEventListener('click', blockMenuMusic, true);
    window.addEventListener('pointerdown', blockMenuMusic, true);
})();

// ========== WEAPONS_DEF ==========
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

// ========== SKINS_DEF ==========
const SKINS_DEF = {
    hetes: { name: 'Hetes', front: 'hetes-front', back: 'hetes-back', desc: 'Lasere din ochi roșii (max 10m pe AI)', req: 'Disponibil din oficiu', abilityKey: '[G]' },
    catalin: { name: 'Catalin', front: 'catalin-front', back: 'catalin-back', desc: 'Aura luminoasă, rezistență la gloanțe și o viață în plus', req: 'Câștigi modul Aura', abilityKey: '[G]', startLives: 1 },
    proletar: { name: 'Proletar', front: 'proletar-front', back: 'proletar-back', desc: 'Echipează 2 arme la start, creează armă nouă la fiecare 5 activări', req: 'Câștigi modul sovietic', maxWeapons: 2, dynamicWeapons: 5, abilityKey: '[G]' },
    gopnik: { name: 'Gopnik', front: 'gopnik-front', back: 'gopnik-back', desc: 'Viteză sporită permanent, Player muzical (M, K, L) și Vodka (+50 HP)', req: 'Câștigi modul sovietic și survival', abilityKey: '[G]/[K]' },
    nazbol: { name: 'Nazbol', front: 'nazbol-front', back: 'nazbol-back', desc: 'Ecran roșu și fum vizibil, viteză mare și invulnerabilitate 5s (CD 20s)', req: 'Câștigi modul sovietic, survival și 100 de victime', abilityKey: '[G]/[E]' },
    'soldat-sovietic': { name: 'Soldat Sovietic', front: 'soldat-sovietic-front', back: 'soldat-sovietic-back', desc: 'Până la 5 arme & grenade devastation', req: 'Câștigi 3 sovietic, 3 survival și 500 de victime', maxWeapons: 5, abilityKey: '[G]/[F]' },
    'cernobil-stalker': { name: 'Cernobîl Stalker', front: 'cernobil-stalker-front', back: 'cernobil-stalker-back', desc: 'Gloanțe toxice pasive 15m (daune x2), daune toxice de la grenade', req: 'Câștigi 3 sovietic, 5 survival și 1000 de victime', maxWeapons: 5, abilityKey: '[G]' },
    'soldat-rus-modern': { name: 'Soldat Rus Modern', front: 'soldat-rus-modern-front', back: 'soldat-rus-modern-back', desc: 'Viteză mărită permanent, 125 HP, 5 arme', req: 'Câștigi 5 sovietic, 10 survival și 1500 de victime', maxWeapons: 5, abilityKey: '[G]' },
    'anti-furry-hetes': { name: 'Real Man Anti-Furry Hetes', front: 'anti-furry-hetes-front', back: 'anti-furry-hetes-back', desc: 'Viteză mare permanent, Rage Mode 20s (viteză x2), Laser [L] (CD 3s în Rage)', req: 'Câștigi 5 sovietic, 15 survival și 2500 de victime', maxWeapons: '5' }
};

// ========== MAP GRID ==========
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

// ========== RAYCASTING ==========
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
const HIDER_SKINS = [
    'hetes', 'catalin', 'proletar', 'gopnik', 'nazbol',
    'soldat-sovietic', 'cernobil-stalker', 'soldat-rus-modern',
    'anti-furry-hetes'
];
const HIDER_SKIN_WEIGHTS = [30, 20, 18, 14, 8, 5, 3, 1.5, 0.5];

function randomHiderSkin() {
    let total = HIDER_SKIN_WEIGHTS.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < HIDER_SKINS.length; i++) {
        r -= HIDER_SKIN_WEIGHTS[i];
        if (r <= 0) return HIDER_SKINS[i];
    }
    return 'hetes';
}

const ROUND_MS = 3 * 60 * 1000;
const MP_PRE_ROUND_MS = 30 * 1000;
const MP_TICK_MS = 250;
const MP_HEARTBEAT_MS = 3000;
const MP_TIMEOUT_MS = 12000;
const SEEKER_HP = 2070;
const HIDER_BASE_HP = 100;
const PLASMA_DMG = 50;
const SEEKER_WEAPON_DMG_MULT = 3;
const NPC_ABILITY_SEEKER_DMG = 200;
const NPC_ABILITY_SEEKER_FREEZE = 2;
const SEEKER_KILL_RADIUS = 0.7;

const GENERATOR_POSITIONS = [
    [4.5, 4.5], [27.5, 4.5], [4.5, 27.5], [27.5, 27.5], [16.5, 16.5]
];
const MP_SPAWNS = [
    [2.5, 2.5], [16.5, 2.5], [29.5, 2.5], [2.5, 14.5], [29.5, 14.5],
    [8.5, 14.5], [23.5, 14.5], [16.5, 10.5], [2.5, 29.5], [16.5, 29.5],
    [29.5, 29.5], [12.5, 24.5], [20.5, 24.5], [12.5, 6.5], [20.5, 6.5]
];

// ========== SHARED HELPERS ==========
function getMaxWeapons(skinKey) {
    let sk = SKINS_DEF[skinKey];
    if (!sk) return 2;
    return parseInt(sk.maxWeapons) || 2;
}

function getStartLives(skinKey) {
    let sk = SKINS_DEF[skinKey];
    if (!sk) return 0;
    return sk.startLives || 0;
}

function isSkinUnlocked(sKey) {
    let stats = window.gameStats || {};
    let sovietWins = (stats.classicCompletions && stats.classicCompletions.soviet) || 0;
    let sh = stats.shooter || {};
    let survivalWins = (sh.survival && sh.survival.wins) || sh.wins || 0;
    let totalKills = (sh.survival && sh.survival.kills) || sh.kills || 0;
    let auraWins = stats.auraCompletions || 0;

    if (sKey === 'hetes') return true;
    if (sKey === 'catalin' && auraWins >= 1) return true;
    if (sKey === 'proletar' && sovietWins >= 1) return true;
    if (sKey === 'gopnik' && sovietWins >= 1 && survivalWins >= 1) return true;
    if (sKey === 'nazbol' && sovietWins >= 1 && survivalWins >= 1 && totalKills >= 100) return true;
    if (sKey === 'soldat-sovietic' && sovietWins >= 3 && survivalWins >= 3 && totalKills >= 500) return true;
    if (sKey === 'cernobil-stalker' && sovietWins >= 3 && survivalWins >= 5 && totalKills >= 1000) return true;
    if (sKey === 'soldat-rus-modern' && sovietWins >= 5 && survivalWins >= 10 && totalKills >= 1500) return true;
    if (sKey === 'anti-furry-hetes' && sovietWins >= 5 && survivalWins >= 15 && totalKills >= 2500) return true;
    return false;
}

function isWeaponUnlocked(wKey) {
    let stats = window.gameStats || {};
    let sh = stats.shooter || {};
    let totalKills = (sh.survival && sh.survival.kills) || sh.kills || 0;
    let req = WEAPONS_DEF[wKey] ? WEAPONS_DEF[wKey].reqKills : 0;
    return totalKills >= req;
}

// ========== STATS HELPERS ==========
function getHSStats() {
    window.gameStats = window.gameStats || {};
    if (!window.gameStats.hideAndSeek) {
        window.gameStats.hideAndSeek = { hiderWins: 0, bossKills: 0, seekerVictims: 0 };
    }
    if (window.gameStats.hideAndSeek.bossKills === undefined) window.gameStats.hideAndSeek.bossKills = 0;
    return window.gameStats.hideAndSeek;
}

window.mergeHideAndSeekStats = s => {
    const m = getHSStats();
    ['hiderWins', 'bossKills', 'seekerVictims'].forEach(k => {
        if ((s[k] || 0) > (m[k] || 0)) m[k] = s[k];
    });
};

function creditHSWin(role) {
    const hs = getHSStats();
    if (role === 'seeker') hs.hiderWins = (hs.hiderWins || 0) + 1;
    else hs.hiderWins = (hs.hiderWins || 0) + 1;
    if (typeof saveStats === 'function') saveStats();
}

function creditHSBossKill() {
    const hs = getHSStats();
    hs.bossKills = (hs.bossKills || 0) + 1;
    if (typeof saveStats === 'function') saveStats();
}

function creditHSVictim() {
    const hs = getHSStats();
    hs.seekerVictims = (hs.seekerVictims || 0) + 1;
    if (typeof saveStats === 'function') saveStats();
}

// ========== GAME STATE ==========
let HS = {
    on: false,
    mode: 'single',
    role: 'hider',
    skin: 'hetes',
    weapons: ['mak', 'mos'],
    equipped: 0,
    x: 10.5, y: 10.5, a: 0,
    hp: 100, maxHp: 100,
    extraLives: 0,
    kills: 0,
    generatorsCompleted: 0,
    w: ['mak'], cur: 0,
    mag: {}, ammo: {},
    cd: 0, kick: 0, flash: 0, hm: 0, bob: 0,
    lanternOn: false, lanternTimer: 0,
    t: performance.now(),
    npcs: [],
    seekerNPC: null,
    ammoBoxes: [],
    vodkas: [],
    generators: [],
    droppedItems: [],
    plasmaOrbs: [],
    roundEndTime: 0,
    gameStarted: false,
    startCountdown: 3,
    abilityCd: 0,
    rage: false, rageTimer: 0,
    nazbolInvincible: false, nazbolSmokeTimer: 0,
    laserCd: 0,
    proletarWeaponProgress: 0,
    isDead: false,
    jumpscareActive: false,
    frozenTimer: 0,
    mp: null
};

// ========== MULTIPLAYER ==========
let MP = null;
const mpOk = () => !!(window.db && window.fsDoc && window.fsSetDoc && window.fsCollection && window.fsOnSnapshot && window.fsDeleteDoc);
const mpEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function lockPointer() {
    try { const r = cv.requestPointerLock && cv.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) {}
}

function mpStart() {
    const nm = (window.currentUserDisplayName && window.currentUserDisplayName !== 'Anonim')
        ? window.currentUserDisplayName
        : 'Jucător' + (100 + (Math.random() * 900 | 0));
    MP = {
        id: 'p' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
        name: nm, players: {}, round: null, lastRoom: null,
        ready: false, ended: false, failed: false, credited: false, lastGain: 0,
        dmgTo: {}, deaths: 0, deathSeq: 0, killedBy: '', killedByName: '', shots: 0,
        lastHitBy: '', lastHitName: '', invUntil: 0,
        lastSend: 0, lastSent: '', unsubs: [],
        chatOpen: false, chatInit: false, seenChat: {}, lastChatSend: 0,
        role: 'hider', seekerId: null,
        frozen: null, freezeT: null, ui: null, lastShotSnd: 0,
        spectatorTarget: null, spectating: false
    };
    mpEnsureUI();
    const chatBox = $('mp-chat-messages'); if (chatBox) chatBox.innerHTML = '';
    try {
        MP.unsubs.push(window.fsOnSnapshot(window.fsDoc(window.db, 'hs_rooms', 'main'), mpOnRoom, mpFail));
        MP.unsubs.push(window.fsOnSnapshot(window.fsCollection(window.db, 'hs_players'), mpOnPlayers, mpFail));
        MP.unsubs.push(window.fsOnSnapshot(window.fsCollection(window.db, 'mp_chat'), mpOnChat, () => {}));
    } catch (e) { mpFail(e); return; }
    MP.tick = setInterval(mpTick, MP_TICK_MS);
    MP.connTimeout = setTimeout(() => { if (MP && !MP.ready) mpFail({ code: 'timeout' }); }, 10000);
}

function mpFail(err) {
    if (!MP || MP.failed) return;
    MP.failed = true;
    const code = (err && (err.code || err.message)) || 'necunoscut';
    alert('Nu m-am putut conecta la multiplayer (' + code + ').\nVerifică conexiunea la internet.');
    hsToMenu();
}

function mpAdoptRound(d) { MP.round = { id: d.id, start: d.start, joinedAt: Date.now(), seekerId: d.seekerId || null }; }
function mpCreateRound() {
    const r = { id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), start: Date.now(), seekerId: null };
    MP.round = { id: r.id, start: r.start, joinedAt: Date.now(), seekerId: null };
    MP.lastRoom = r;
    try { window.fsSetDoc(window.fsDoc(window.db, 'hs_rooms', 'main'), r).catch(mpFail); } catch (e) { mpFail(e); }
}

function mpOnRoom(snap) {
    if (!MP || MP.failed) return;
    if (!MP.ready && snap.metadata && snap.metadata.fromCache) return;
    const d = snap.exists() ? snap.data() : null;
    const now = Date.now();
    if (!MP.ready) {
        MP.lastRoom = d;
        if (d && d.start + ROUND_MS + MP_PRE_ROUND_MS > now) mpAdoptRound(d);
        else mpCreateRound();
        MP.ready = true;
        clearTimeout(MP.connTimeout);
        mpBegin();
        return;
    }
    if (!d) return;
    MP.lastRoom = d;
    if (MP.round && d.id !== MP.round.id && !MP.ended) {
        if (now - MP.round.joinedAt < 4000) mpAdoptRound(d);
        else mpEndRound();
    }
    if (d.seekerId && MP.round.seekerId !== d.seekerId) {
        MP.round.seekerId = d.seekerId;
        if (d.seekerId === MP.id) {
            MP.role = 'seeker';
            HS.role = 'seeker';
            HS.maxHp = SEEKER_HP;
            HS.hp = SEEKER_HP;
            addKillFeed('EȘTI SEEKERUL! Găsește-i pe toți!');
        } else {
            MP.role = 'hider';
            HS.role = 'hider';
            HS.maxHp = HIDER_BASE_HP;
            HS.hp = HIDER_BASE_HP;
            addKillFeed('Ești HIDER! Ascunde-te!');
        }
    }
}

function mpBegin() {
    MP.ended = false; MP.credited = false; MP.deaths = 0; HS.kills = 0; HS.generatorsCompleted = 0;
    HS.role = 'hider'; MP.role = 'hider';
    mpSpawn(true);
    mpSend(true);
    addKillFeed('Runda a început! 30 secunde până se alege seekerul...');
}

function mpPickSpawn() {
    const others = Object.values(MP.players).filter(mpActive);
    const scored = MP_SPAWNS.map(s => ({
        s, d: others.length ? Math.min.apply(null, others.map(p => Math.hypot(p.x - s[0], p.y - s[1]))) : Math.random() * 10
    })).sort((a, b) => b.d - a.d);
    return scored[Math.floor(Math.random() * Math.min(3, scored.length))].s;
}

function mpSpawn(first) {
    const s = mpPickSpawn();
    HS.x = s[0]; HS.y = s[1];
    HS.a = Math.atan2(16 - s[1], 16 - s[0]);
    HS.hp = HS.maxHp;
    HS.cd = 0.3;
    HS.w.forEach(id => { HS.mag[id] = WEAPONS_DEF[id].mag; HS.ammo[id] = WEAPONS_DEF[id].maxAmmo; });
    MP.invUntil = Date.now() + 2500;
}

const mpActive = p => !!(MP && MP.round && p.round === MP.round.id && (performance.now() - p._seen) < MP_TIMEOUT_MS);

function mpSend(force) {
    if (!MP || !MP.round) return;
    const now = Date.now();
    const st = {
        name: MP.name, skin: HS.skin, role: MP.role,
        x: Math.round(HS.x * 100) / 100, y: Math.round(HS.y * 100) / 100, a: Math.round(HS.a * 100) / 100,
        hp: Math.max(0, Math.round(HS.hp)), maxHp: HS.maxHp,
        kills: HS.kills, deaths: MP.deaths, round: MP.round.id,
        dmgTo: MP.dmgTo, deathSeq: MP.deathSeq, killedBy: MP.killedBy, killedByName: MP.killedByName,
        shots: MP.shots,
        lanternOn: HS.lanternOn,
        inv: (now < MP.invUntil) ? 1 : 0,
        extraLives: HS.extraLives,
        generators: HS.generatorsCompleted
    };
    const key = JSON.stringify(st);
    if (!force && key === MP.lastSent && now - MP.lastSend < MP_HEARTBEAT_MS) return;
    MP.lastSent = key; MP.lastSend = now;
    st.t = now;
    try { window.fsSetDoc(window.fsDoc(window.db, 'hs_players', MP.id), st).catch(() => {}); } catch (e) {}
}

function mpTick() {
    if (!MP || !MP.ready || MP.failed || !HS.on) return;
    const now = Date.now();
    if (MP.round && !MP.ended && now >= MP.round.start + ROUND_MS + MP_PRE_ROUND_MS) mpEndRound();
    const pn = performance.now();
    for (const id in MP.players) {
        if (pn - MP.players[id]._seen > MP_TIMEOUT_MS) delete MP.players[id];
    }
    if (MP.round && !MP.round.seekerId && now >= MP.round.start + MP_PRE_ROUND_MS) {
        const activePlayers = [MP.id, ...Object.keys(MP.players).filter(id => mpActive(MP.players[id]))];
        if (activePlayers.length > 0) {
            const seekerId = activePlayers[Math.floor(Math.random() * activePlayers.length)];
            MP.round.seekerId = seekerId;
            MP.lastRoom.seekerId = seekerId;
            try { window.fsSetDoc(window.fsDoc(window.db, 'hs_rooms', 'main'), { seekerId }).catch(() => {}); } catch (e) {}
        }
    }
    mpSend(false);
    mpChatRefresh();
}

function mpOnPlayers(snap) {
    if (!MP || MP.failed) return;
    snap.docChanges().forEach(ch => {
        const id = ch.doc.id;
        if (id === MP.id) return;
        if (ch.type === 'removed') { delete MP.players[id]; return; }
        mpApplyRemote(id, ch.doc.data());
    });
}

function mpApplyRemote(id, d) {
    if (!d) return;
    if (Date.now() - (d.t || 0) > 60000) {
        try { window.fsDeleteDoc(window.fsDoc(window.db, 'hs_players', id)).catch(() => {}); } catch (e) {}
        return;
    }
    let p = MP.players[id];
    if (!p) {
        p = MP.players[id] = { id, x: d.x, y: d.y, a: d.a, tx: d.x, ty: d.y, ta: d.a,
            lastDeathSeq: d.deathSeq || 0, lastShots: d.shots || 0, lastDmg: 0 };
    }
    p._seen = performance.now();
    p.name = d.name || 'Jucător'; p.skin = d.skin; p.hp = d.hp; p.maxHp = d.maxHp || 100;
    p.kills = d.kills || 0; p.deaths = d.deaths || 0; p.round = d.round; p.inv = d.inv;
    p.role = d.role || 'hider';
    p.lanternOn = d.lanternOn || false;
    p.extraLives = d.extraLives || 0;
    p.generators = d.generators || 0;
    p.tx = d.x; p.ty = d.y; p.ta = d.a;
    if (Math.hypot(p.tx - p.x, p.ty - p.y) > 3) { p.x = p.tx; p.y = p.ty; }

    const v = (d.dmgTo && d.dmgTo[MP.id]) || 0;
    if (v < p.lastDmg) p.lastDmg = v;
    else if (v > p.lastDmg) { const delta = v - p.lastDmg; p.lastDmg = v; mpTakeDamage(delta, id, p.name); }

    const ds = d.deathSeq || 0;
    if (ds > p.lastDeathSeq) {
        p.lastDeathSeq = ds;
        if (MP.round && d.round === MP.round.id && !MP.ended) {
            if (d.killedBy === MP.id) {
                HS.kills++;
                creditHSVictim();
                addKillFeed(`Ai eliminat ${p.name}! +700 pct`);
                const g = window.gameStats || {};
                g.shooter = g.shooter || { kills: 0, wins: 0, score: 0 };
                g.shooter.score = (g.shooter.score || 0) + 700;
                if (typeof saveStats === 'function') saveStats();
            } else if (d.killedByName) addKillFeed(`${d.killedByName} l-a eliminat pe ${p.name}`);
        }
    }

    const sh = d.shots || 0;
    if (sh > p.lastShots) { p.lastShots = sh; mpRemoteShot(p); } else if (sh < p.lastShots) p.lastShots = sh;
}

function mpRemoteShot(p) {
    const now = performance.now();
    if (now - MP.lastShotSnd < 90) return;
    const d = Math.hypot(p.x - HS.x, p.y - HS.y);
    if (d > 20) return;
    MP.lastShotSnd = now;
    try { const a = sndGun.cloneNode(); a.volume = Math.max(0.05, 0.5 - d * 0.025); a.play().catch(() => {}); } catch (e) {}
}

function mpInterpolate(dt) {
    const f = Math.min(1, dt * 10);
    for (const id in MP.players) {
        const p = MP.players[id];
        p.x += (p.tx - p.x) * f; p.y += (p.ty - p.y) * f;
        p.a += Math.atan2(Math.sin(p.ta - p.a), Math.cos(p.ta - p.a)) * f;
    }
}

function mpTargets() {
    return Object.values(MP.players).filter(p => mpActive(p) && p.hp > 0 && !p.inv);
}

function mpDealDamage(p, dmg) {
    MP.dmgTo[p.id] = Math.round(((MP.dmgTo[p.id] || 0) + dmg) * 100) / 100;
    HS.hm = 0.12;
}

function mpShoot(w, id, wd) {
    MP.shots++;
    let dmg = w.dmg;
    if (MP.role === 'hider' && HS.skin === 'cernobil-stalker') dmg *= 2;
    let best = null, bd = 1e9;
    mpTargets().forEach(p => {
        if (MP.role === 'hider' && p.role !== 'seeker') return;
        if (MP.role === 'seeker' && p.role === 'seeker') return;
        const dx = p.x - HS.x, dy = p.y - HS.y, d = Math.hypot(dx, dy);
        let df = Math.atan2(dy, dx) - HS.a; df = Math.atan2(Math.sin(df), Math.cos(df));
        if (Math.abs(df) * d < 0.38 && d < bd && d < wd + 0.3) { best = p; bd = d; }
    });
    if (w.splash) {
        const dist = best ? bd : Math.max(0, wd - 0.2);
        const ex = HS.x + Math.cos(HS.a) * dist, ey = HS.y + Math.sin(HS.a) * dist;
        mpTargets().forEach(p => {
            if (MP.role === 'hider' && p.role !== 'seeker') return;
            if (MP.role === 'seeker' && p.role === 'seeker') return;
            let distToExplosion = Math.hypot(p.x - ex, p.y - ey);
            if (distToExplosion < w.splash) mpDealDamage(p, dmg);
        });
        sndExplosion.currentTime = 0; sndExplosion.play().catch(() => {});
    } else if (best) {
        mpDealDamage(best, dmg);
    }
}

function mpTakeDamage(amount, fromId, fromName) {
    if (!MP || MP.ended || !HS.on) return;
    if (HS.nazbolInvincible || Date.now() < MP.invUntil) return;
    HS.hp -= amount;
    HS.flash = Math.max(HS.flash, Math.min(0.3, 0.08 + amount * 0.015));
    MP.lastHitBy = fromId; MP.lastHitName = fromName;
    if (HS.hp <= 0) {
        if (HS.extraLives > 0) {
            HS.extraLives--;
            HS.hp = HS.maxHp;
            addKillFeed('Viață suplimentară folosită! Respawn în altă zonă.');
            showJumpScare(false, true);
            return;
        }
        mpDie();
    }
}

function mpDie() {
    MP.deaths++; MP.deathSeq++;
    MP.killedBy = MP.lastHitBy; MP.killedByName = MP.lastHitName;
    addKillFeed(`${MP.lastHitName || 'Cineva'} te-a eliminat!`);
    showJumpScare(false, false);
    if (MP.role === 'seeker') {
        mpEndRound();
    } else {
        MP.spectating = true;
        mpSpawn(false);
        HS.flash = 0.6;
        mpSend(true);
    }
}

function mpBuildBoard() {
    const rid = MP.round.id;
    const rows = [{ name: MP.name, kills: HS.kills, deaths: MP.deaths, role: MP.role, generators: HS.generatorsCompleted, me: true }];
    Object.values(MP.players).forEach(p => {
        if (p.round === rid) rows.push({ name: p.name, kills: p.kills || 0, deaths: p.deaths || 0, role: p.role, generators: p.generators || 0, me: false });
    });
    rows.sort((a, b) => (b.kills - a.kills) || (a.deaths - b.deaths));
    return rows;
}

function mpCredit() {
    if (!MP || MP.credited || !MP.round) return;
    MP.credited = true;
    const g = window.gameStats || {};
    g.shooter = g.shooter || { kills: 0, wins: 0, score: 0 };
    let gain = HS.kills * 700 + HS.generatorsCompleted * 150;
    if (MP.role === 'seeker' && MP.ended) gain += 7000;
    if (MP.role === 'hider' && MP.ended && MP.deaths === 0) gain += 7000;
    g.shooter.score = (g.shooter.score || 0) + gain;
    g.shooter.kills = (g.shooter.kills || 0) + HS.kills;
    MP.lastGain = gain;
    if (MP.ended) {
        if (MP.role === 'seeker') creditHSWin('seeker');
        else if (MP.deaths === 0) creditHSWin('hider');
    }
    if (typeof saveStats === 'function') saveStats();
}

function mpEndRound() {
    if (!MP || MP.ended) return;
    MP.ended = true;
    HS.fire = 0; window.mobileShooterFire = false;
    mpCloseChat(false);
    try { document.exitPointerLock && document.exitPointerLock(); } catch (e) {}
    mpSend(true);
    mpShowBoard();
    clearTimeout(MP.freezeT);
    MP.freezeT = setTimeout(() => {
        if (!MP || !MP.ended) return;
        mpCredit();
        mpShowBoard();
    }, 2500);
}

function mpContinue() {
    if (!MP) return;
    clearTimeout(MP.freezeT);
    mpCredit();
    mpHideBoard();
    const d = MP.lastRoom, now = Date.now();
    if (d && d.id !== MP.round.id && d.start + ROUND_MS + MP_PRE_ROUND_MS > now) mpAdoptRound(d);
    else mpCreateRound();
    MP.ended = false; MP.credited = false; MP.lastGain = 0;
    MP.deaths = 0; HS.kills = 0; HS.generatorsCompleted = 0;
    MP.spectating = false; MP.spectatorTarget = null;
    MP.role = 'hider'; HS.role = 'hider';
    HS.maxHp = HIDER_BASE_HP; HS.hp = HIDER_BASE_HP;
    HS.extraLives = getStartLives(HS.skin);
    mpSpawn(true);
    mpSend(true);
    lockPointer();
    addKillFeed('Runda nouă a început!');
}

function mpShowBoard() {
    mpEnsureUI();
    const ov = MP.ui.board;
    const rows = mpBuildBoard();
    const medals = ['🥇', '🥈', '🥉'];
    let html = `<div style="font-size:42px;font-weight:bold;color:#ffcc00;margin-bottom:6px;text-shadow:2px 2px #000;">Runda s-a terminat!</div>
        <div style="color:#ddd;margin-bottom:14px;">Clasament</div>
        <table style="border-collapse:collapse;min-width:520px;font-size:18px;background:rgba(0,0,0,.55);border-radius:8px;">
        <tr style="color:#aaa;font-size:13px;"><th style="text-align:left;padding:6px 12px;">#</th><th style="text-align:left;padding:6px 12px;">Jucător</th><th style="padding:6px 12px;">Rol</th><th style="padding:6px 12px;">Victime</th><th style="padding:6px 12px;">Morți</th><th style="padding:6px 12px;">Gen.</th></tr>`;
    rows.slice(0, 12).forEach((r, i) => {
        html += `<tr style="${r.me ? 'background:rgba(255,204,0,.25);color:#ffcc00;font-weight:bold;' : ''}">
            <td style="padding:6px 12px;">${medals[i] || (i + 1)}</td>
            <td style="padding:6px 12px;">${mpEsc(r.name)}${r.me ? ' (tu)' : ''}</td>
            <td style="padding:6px 12px;">${r.role === 'seeker' ? '🔫 Seeker' : '🏃 Hider'}</td>
            <td style="padding:6px 12px;text-align:center;">${r.kills}</td>
            <td style="padding:6px 12px;text-align:center;">${r.deaths}</td>
            <td style="padding:6px 12px;text-align:center;">${r.generators}</td></tr>`;
    });
    html += `</table>
        <div style="margin-top:14px;color:#00ffcc;font-weight:bold;min-height:22px;">${MP.credited ? `+${MP.lastGain} puncte adăugate` : 'Se calculează scorul...'}</div>
        <div style="margin-top:18px;display:flex;gap:14px;">
            <button id="hs-btn-menu" class="btn" style="background:#c0392b;min-width:200px;">Înapoi la meniu</button>
            <button id="hs-btn-cont" class="btn" style="background:#27ae60;min-width:200px;">Următoarea rundă</button>
        </div>`;
    ov.innerHTML = html;
    ov.style.display = 'flex';
    ov.querySelector('#hs-btn-menu').onclick = () => hsToMenu();
    ov.querySelector('#hs-btn-cont').onclick = () => mpContinue();
}

function mpHideBoard() {
    if (MP && MP.ui && MP.ui.board) { MP.ui.board.style.display = 'none'; MP.ui.board.innerHTML = ''; }
}

function mpEnsureUI() {
    if (!MP) return;
    if (!MP.ui) {
        const host = $('game-container') || document.body;
        const btn = document.createElement('button');
        btn.id = 'hs-back-btn';
        btn.textContent = '⬅ Înapoi la meniu';
        btn.style.cssText = 'position:absolute;top:10px;left:10px;z-index:140;background:#d11;color:#fff;border:2px solid #fff;border-radius:6px;padding:8px 14px;font-weight:bold;font-size:14px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.6);';
        btn.onclick = () => hsToMenu();
        host.appendChild(btn);

        const board = document.createElement('div');
        board.id = 'hs-board';
        board.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:130;background:rgba(0,0,0,.85);display:none;flex-direction:column;justify-content:center;align-items:center;color:#fff;';
        host.appendChild(board);
        MP.ui = { btn, board };
    }
    const c = $('mp-chat-container'), inp = $('mp-chat-input');
    if (c) c.classList.remove('hidden');
    if (inp) {
        inp.style.display = 'none';
        if (!inp._mpBound) {
            inp._mpBound = true;
            inp.addEventListener('keydown', ev => {
                ev.stopPropagation();
                if (ev.key === 'Enter') {
                    const t = inp.value.trim();
                    if (t) mpSendChat(t);
                    mpCloseChat(true);
                } else if (ev.key === 'Escape') {
                    mpCloseChat(true);
                }
            });
        }
    }
    mpChatStyle();
}

function mpRemoveUI() {
    if (MP && MP.ui) {
        if (MP.ui.btn && MP.ui.btn.parentNode) MP.ui.btn.parentNode.removeChild(MP.ui.btn);
        if (MP.ui.board && MP.ui.board.parentNode) MP.ui.board.parentNode.removeChild(MP.ui.board);
        MP.ui = null;
    }
    const c = $('mp-chat-container'); if (c) c.classList.add('hidden');
}

function mpChatStyle() {
    const c = $('mp-chat-container'); if (!c || !MP) return;
    c.style.background = MP.chatOpen ? 'rgba(0,0,0,0.8)' : 'transparent';
    c.style.border = MP.chatOpen ? '1px solid #555' : '1px solid transparent';
    c.style.pointerEvents = MP.chatOpen ? 'auto' : 'none';
}

function mpOpenChat() {
    if (!MP || !MP.ready || MP.ended || MP.chatOpen) return;
    MP.chatOpen = true;
    HS.fire = 0;
    const inp = $('mp-chat-input');
    try { document.exitPointerLock && document.exitPointerLock(); } catch (e) {}
    if (inp) { inp.style.display = 'block'; inp.value = ''; setTimeout(() => inp.focus(), 0); }
    mpChatStyle(); mpChatRefresh();
}

function mpCloseChat(relock) {
    if (!MP || !MP.chatOpen) return;
    MP.chatOpen = false;
    const inp = $('mp-chat-input');
    if (inp) { inp.blur(); inp.style.display = 'none'; inp.value = ''; }
    if (window.keys) Object.keys(window.keys).forEach(k => { window.keys[k] = false; });
    mpChatStyle(); mpChatRefresh();
    if (relock && !MP.ended) lockPointer();
}

function mpSendChat(text) {
    const now = Date.now();
    if (now - MP.lastChatSend < 700) return;
    MP.lastChatSend = now;
    const id = MP.id + '_' + now;
    try {
        window.fsSetDoc(window.fsDoc(window.db, 'mp_chat', id), { name: MP.name, text: text.slice(0, 120), t: now, from: MP.id }).catch(() => {});
        setTimeout(() => { try { window.fsDeleteDoc(window.fsDoc(window.db, 'mp_chat', id)).catch(() => {}); } catch (e) {} }, 90000);
    } catch (e) {}
}

function mpOnChat(snap) {
    if (!MP) return;
    const first = !MP.chatInit;
    MP.chatInit = true;
    const box = $('mp-chat-messages');
    snap.docChanges().forEach(ch => {
        if (ch.type !== 'added' || MP.seenChat[ch.doc.id]) return;
        MP.seenChat[ch.doc.id] = 1;
        const d = ch.doc.data();
        if (first || !d || !box) return;
        if (Date.now() - (d.t || 0) > 20000) return;
        const line = document.createElement('div');
        line.dataset.t = Date.now();
        const nm = document.createElement('b');
        nm.style.color = d.from === MP.id ? '#2ecc71' : '#ffcc00';
        nm.textContent = (d.name || '?') + ': ';
        const tx = document.createElement('span');
        tx.style.color = '#fff';
        tx.textContent = d.text || '';
        line.appendChild(nm); line.appendChild(tx);
        line.style.textShadow = '1px 1px 2px #000';
        box.appendChild(line);
        while (box.children.length > 40) box.removeChild(box.firstChild);
        box.scrollTop = box.scrollHeight;
    });
}

function mpChatRefresh() {
    const box = $('mp-chat-messages'); if (!box || !MP) return;
    const now = Date.now();
    Array.prototype.forEach.call(box.children, line => {
        const age = now - Number(line.dataset.t || 0);
        if (MP.chatOpen || age < 10000) { line.style.display = ''; line.style.opacity = '1'; }
        else if (age < 13000) { line.style.opacity = String(1 - (age - 10000) / 3000); }
        else line.style.display = 'none';
    });
}

function mpLeave() {
    if (!MP) return;
    const m = MP;
    try { mpCredit(); } catch (e) {}
    clearInterval(m.tick); clearTimeout(m.freezeT); clearTimeout(m.connTimeout);
    m.unsubs.forEach(u => { try { u(); } catch (e) {} });
    try { window.fsDeleteDoc(window.fsDoc(window.db, 'hs_players', m.id)).catch(() => {}); } catch (e) {}
    const inp = $('mp-chat-input'); if (inp) { inp.blur(); inp.style.display = 'none'; }
    mpRemoveUI();
    MP = null;
}

// ========== LIGHTING SYSTEM ==========
function getLanternLight(x, y, a, targetX, targetY, lanternRange) {
    const dx = targetX - x, dy = targetY - y;
    const dist = Math.hypot(dx, dy);
    if (dist > lanternRange) return 0;
    let angToTarget = Math.atan2(dy, dx);
    let angDiff = angToTarget - a;
    angDiff = Math.atan2(Math.sin(angDiff), Math.cos(angDiff));
    if (Math.abs(angDiff) > 0.5) return 0;
    const distFactor = 1 - dist / lanternRange;
    const angFactor = 1 - Math.abs(angDiff) / 0.5;
    return Math.max(0, distFactor * angFactor);
}

function findSafeRespawn() {
    const seekerPos = HS.seekerNPC && !HS.seekerNPC.dead ? { x: HS.seekerNPC.x, y: HS.seekerNPC.y } : null;
    const others = HS.npcs.filter(n => !n.dead).map(n => ({ x: n.x, y: n.y }));
    const scored = MP_SPAWNS.map(s => ({
        s,
        d: seekerPos ? Math.hypot(seekerPos.x - s[0], seekerPos.y - s[1]) : Math.random() * 10,
        d2: others.length ? Math.min.apply(null, others.map(o => Math.hypot(o.x - s[0], o.y - s[1]))) : 10
    })).sort((a, b) => (b.d + b.d2 * 0.3) - (a.d + a.d2 * 0.3));
    return scored[Math.floor(Math.random() * Math.min(3, scored.length))].s;
}

// ========== NPC WEAPON RANDOM ==========
function randomNPCWeapons() {
    const allW = Object.keys(WEAPONS_DEF);
    const n = 1 + Math.floor(Math.random() * 3);
    const picked = [];
    const pool = allW.filter(w => isWeaponUnlocked(w));
    if (pool.length === 0) return ['mak'];
    for (let i = 0; i < n; i++) {
        const w = pool[Math.floor(Math.random() * pool.length)];
        if (!picked.includes(w)) picked.push(w);
    }
    return picked.length > 0 ? picked : ['mak'];
}

// ========== SEEKER NPC INIT ==========
function makeSeekerObj(x, y) {
    return {
        type: 'seeker',
        x: x, y: y, a: 0,
        hp: SEEKER_HP, maxHp: SEEKER_HP,
        cd: 0,
        abilityCd: 0,
        charged: false,
        chaseTarget: null,
        chaseLossTimer: 0,
        lanternOn: false,
        lanternTimer: 0,
        lanternBattery: 60,
        state: 'patrol',
        patrolPoints: [[4.5, 4.5], [27.5, 4.5], [27.5, 27.5], [4.5, 27.5]],
        patrolIdx: 0,
        dead: false,
        frozenTimer: 0,
        weapons: ['mak'],
        cur: 0, mag: {}, ammo: {},
        lanternBatteryMax: 60
    };
}

// ========== SINGLEPLAYER INIT - DOAR HIDER ==========
function hsInitSingle() {
    HS.playerIsSeeker = false;
    HS.role = 'hider';
    HS.skin = HS.skin || 'hetes';
    HS.x = 10.5; HS.y = 10.5; HS.a = 0;
    HS.extraLives = 0;
    HS.kills = 0;
    HS.generatorsCompleted = 0;
    HS.roundEndTime = performance.now() + ROUND_MS;
    HS.gameStarted = false;
    HS.startCountdown = 3;
    HS.lanternOn = false;
    HS.lanternTimer = 0;
    HS.abilityCd = 0;
    HS.rage = false;
    HS.rageTimer = 0;
    HS.nazbolInvincible = false;
    HS.nazbolSmokeTimer = 0;
    HS.laserCd = 0;
    HS.proletarWeaponProgress = 0;
    HS.isDead = false;
    HS.spectatorTarget = null;
    HS.jumpscareActive = false;
    HS.frozenTimer = 0;

    HS.maxHp = HIDER_BASE_HP;
    HS.hp = HIDER_BASE_HP;
    HS.extraLives = getStartLives(HS.skin);
    HS.w = HS.weapons.filter(w => isWeaponUnlocked(w));
    if (HS.w.length === 0) HS.w = ['mak'];
    HS.cur = 0;
    HS.equipped = HS.w.length;
    HS.mag = {}; HS.ammo = {};
    HS.w.forEach(wId => {
        HS.mag[wId] = WEAPONS_DEF[wId].mag;
        HS.ammo[wId] = WEAPONS_DEF[wId].maxAmmo;
    });
    addKillFeed('Ești HIDER! Ascunde-te și supraviețuiește!');

    HS.ammoBoxes = [
        { x: 8.5, y: 8.5, active: true, respawnTimer: 0 },
        { x: 22.5, y: 8.5, active: true, respawnTimer: 0 },
        { x: 16.5, y: 22.5, active: true, respawnTimer: 0 },
        { x: 8.5, y: 22.5, active: true, respawnTimer: 0 }
    ];

    HS.vodkas = [
        { x: 1.5, y: 15.5, taken: false },
        { x: 12.5, y: 2.5, taken: false },
        { x: 22.5, y: 20.5, taken: false },
        { x: 28.5, y: 29.5, taken: false }
    ];

    HS.generators = GENERATOR_POSITIONS.map(pos => ({
        x: pos[0], y: pos[1], completed: false, puzzleOpen: false, npcPuzzleProgress: 0, npcPuzzleTimer: 0
    }));

    HS.droppedItems = [];
    HS.plasmaOrbs = [];

    HS.npcs = [];
    for (let i = 0; i < 5; i++) {
        const skin = randomHiderSkin();
        const spawn = MP_SPAWNS[i + 2] || MP_SPAWNS[0];
        const npcWeapons = randomNPCWeapons();
        const npc = {
            type: 'hider',
            skin: skin,
            x: spawn[0], y: spawn[1], a: Math.random() * Math.PI * 2,
            hp: 100, maxHp: 100,
            weapons: npcWeapons,
            cur: 0,
            mag: {}, ammo: {},
            cd: 0,
            abilityCd: 0,
            lanternOn: false,
            lanternTimer: 0,
            dead: false,
            kills: 0,
            extraLives: getStartLives(skin),
            rage: false, rageTimer: 0,
            nazbolInvincible: false, nazbolSmokeTimer: 0,
            aimCd: 0,
            genTarget: null,
            genProgressTimer: 0,
            lastX: spawn[0], lastY: spawn[1], stuckTime: 0
        };
        npc.weapons.forEach(wId => {
            npc.mag[wId] = WEAPONS_DEF[wId].mag;
            npc.ammo[wId] = WEAPONS_DEF[wId].maxAmmo;
        });
        HS.npcs.push(npc);
    }

    HS.seekerNPC = makeSeekerObj(16.5, 16.5);

    if (typeof window.stopMenuMusic === 'function') window.stopMenuMusic();
    const menuAudio = document.getElementById('menu-music');
    if (menuAudio) { menuAudio.pause(); menuAudio.currentTime = 0; }
    const generalAudio = document.querySelector('audio');
    if (generalAudio && generalAudio !== sndHorizon && generalAudio.id !== 'menu-music') {
        try { generalAudio.pause(); } catch(e) {}
    }

    if (sndHorizon) { sndHorizon.currentTime = 0; sndHorizon.play().catch(() => {}); }
}

function hsInitMulti() {
    mpStart();
}

// ========== NPC AI ==========
function updateHiderNPCs(dt) {
    const seekerX = HS.seekerNPC && !HS.seekerNPC.dead ? HS.seekerNPC.x : null;
    const seekerY = HS.seekerNPC && !HS.seekerNPC.dead ? HS.seekerNPC.y : null;
    const seekerExists = HS.seekerNPC && !HS.seekerNPC.dead;

    HS.npcs.forEach(npc => {
        if (npc.dead) return;
        npc.cd -= dt;
        npc.abilityCd -= dt;
        npc.lanternTimer -= dt;
        if (npc.lanternTimer <= 0 && npc.lanternOn) npc.lanternOn = false;
        if (npc.rageTimer > 0) { npc.rageTimer -= dt; if (npc.rageTimer <= 0) npc.rage = false; }
        if (npc.nazbolSmokeTimer > 0) { npc.nazbolSmokeTimer -= dt; if (npc.nazbolSmokeTimer <= 0) npc.nazbolInvincible = false; }

        const movedDist = Math.hypot(npc.x - npc.lastX, npc.y - npc.lastY);
        if (movedDist < 0.05) {
            npc.stuckTime = (npc.stuckTime || 0) + dt;
        } else {
            npc.stuckTime = 0;
        }
        npc.lastX = npc.x;
        npc.lastY = npc.y;
        if (npc.stuckTime > 0.8) {
            npc.a = Math.random() * Math.PI * 2;
            npc.stuckTime = 0;
        }

        let fleeing = false;
        if (seekerExists && seekerX !== null) {
            const dToSeeker = Math.hypot(seekerX - npc.x, seekerY - npc.y);
            if (dToSeeker < 10) {
                const fleeAngle = Math.atan2(npc.y - seekerY, npc.x - seekerX);
                npc.a = fleeAngle;
                fleeing = true;
            }
        }

        let doingGenerator = false;
        if (!fleeing && seekerExists) {
            const dToSeeker = Math.hypot(seekerX - npc.x, seekerY - npc.y);
            if (dToSeeker > 15) {
                let nearestGen = null, nearestDist = 1e9;
                HS.generators.forEach(g => {
                    if (!g.completed) {
                        const dg = Math.hypot(g.x - npc.x, g.y - npc.y);
                        if (dg < nearestDist) { nearestDist = dg; nearestGen = g; }
                    }
                });
                if (nearestGen) {
                    if (nearestDist < 1.5) {
                        doingGenerator = true;
                        nearestGen.npcPuzzleProgress = (nearestGen.npcPuzzleProgress || 0) + dt;
                        if (nearestGen.npcPuzzleProgress >= 6) {
                            nearestGen.completed = true;
                            nearestGen.npcPuzzleProgress = 0;
                            HS.npcs.forEach(n => { if (!n.dead) n.extraLives = (n.extraLives || 0) + 1; });
                            addKillFeed(`Un hider NPC a completat un generator! +1 viață tuturor hiderilor!`);
                        }
                    } else {
                        const angle = Math.atan2(nearestGen.y - npc.y, nearestGen.x - npc.x);
                        npc.a = angle;
                    }
                }
            }
        }

        if (!fleeing && !doingGenerator && Math.random() < dt * 0.5) {
            npc.a = Math.random() * Math.PI * 2;
        }

        if (!doingGenerator) {
            let npcSpd = 2.0;
            if (['gopnik', 'soldat-rus-modern', 'anti-furry-hetes'].includes(npc.skin)) npcSpd = 3.6;
            if (npc.rage) npcSpd *= 2;
            if (fleeing) npcSpd *= 1.35;
            const nx = npc.x + Math.cos(npc.a) * npcSpd * dt;
            const ny = npc.y + Math.sin(npc.a) * npcSpd * dt;
            let didMove = false;
            if (!solid(nx, npc.y)) { npc.x = nx; didMove = true; }
            if (!solid(npc.x, ny)) { npc.y = ny; didMove = true; }
            if (!didMove) {
                npc.a = Math.random() * Math.PI * 2;
            }
        }

        if (seekerExists && seekerX !== null) {
            const d = Math.hypot(seekerX - npc.x, seekerY - npc.y);
            const angleToSeeker = Math.atan2(seekerY - npc.y, seekerX - npc.x);
            let df = angleToSeeker - npc.a;
            df = Math.atan2(Math.sin(df), Math.cos(df));
            if (d < 12 && Math.abs(df) < 0.6 && los(npc.x, npc.y, seekerX, seekerY) && npc.cd <= 0) {
                const wId = npc.weapons[npc.cur];
                const w = WEAPONS_DEF[wId];
                if (w && npc.mag[wId] > 0) {
                    npc.mag[wId]--;
                    npc.cd = w.rate * 0.7;
                    const dmgToSeeker = w.dmg * SEEKER_WEAPON_DMG_MULT;
                    if (HS.seekerNPC) {
                        HS.seekerNPC.hp -= dmgToSeeker;
                        // ✅ FIX: NPC glonț omoară seekerul → boss kill
                        if (HS.seekerNPC.hp <= 0 && !HS.seekerNPC.dead) {
                            HS.seekerNPC.dead = true;
                            if (HS.on) triggerSingleWin(true);
                        }
                    }
                }
            }
        }

        if (npc.abilityCd <= 0) {
            npc.abilityCd = 10 + Math.random() * 6;
            const isLaser = ['hetes', 'anti-furry-hetes'].includes(npc.skin);
            const isGrenade = ['soldat-sovietic', 'soldat-rus-modern', 'cernobil-stalker'].includes(npc.skin);
            if (seekerExists && seekerX !== null && (isLaser || isGrenade)) {
                const d = Math.hypot(seekerX - npc.x, seekerY - npc.y);
                if (d < 12 && HS.seekerNPC) {
                    HS.seekerNPC.hp -= NPC_ABILITY_SEEKER_DMG;
                    HS.seekerNPC.frozenTimer = NPC_ABILITY_SEEKER_FREEZE;
                    // ✅ FIX: NPC abilitate omoară seekerul → boss kill
                    if (HS.seekerNPC.hp <= 0 && !HS.seekerNPC.dead) {
                        HS.seekerNPC.dead = true;
                        if (HS.on) triggerSingleWin(true);
                    }
                    sndExplosion.currentTime = 0; sndExplosion.play().catch(() => {});
                    addKillFeed(`Un NPC a folosit abilitatea pe seeker!`);
                }
            }
            if (npc.skin === 'gopnik' && npc.hp < npc.maxHp * 0.5) {
                npc.hp = Math.min(npc.maxHp, npc.hp + 50);
            } else if (npc.skin === 'nazbol' && seekerExists && seekerX !== null) {
                const d = Math.hypot(seekerX - npc.x, seekerY - npc.y);
                if (d < 6) {
                    npc.nazbolSmokeTimer = 5;
                    npc.nazbolInvincible = true;
                }
            } else if (npc.skin === 'anti-furry-hetes') {
                npc.rage = true;
                npc.rageTimer = 20;
            }
        }

        if (npc.lanternOn === false && npc.lanternTimer <= 0 && Math.random() < dt * 0.05) {
            npc.lanternOn = true;
            npc.lanternTimer = 5;
        }
    });
}

function updateSeekerNPC(dt) {
    const s = HS.seekerNPC;
    if (!s) return;
    // ✅ FIX: dacă seekerul e mort, verifică victoria (boss kill) înainte de a ieși
    if (s.dead) {
        if (HS.on) triggerSingleWin(true);
        return;
    }
    s.cd -= dt;
    s.abilityCd -= dt;
    s.lanternTimer -= dt;
    s.frozenTimer -= dt;
    if (s.lanternTimer <= 0 && s.lanternOn) s.lanternOn = false;
    if (s.frozenTimer > 0) return;

    const elapsed = (performance.now() - (HS.roundEndTime - ROUND_MS)) / 1000;
    if (!s.charged && elapsed >= 90) {
        s.charged = true;
        s.hp = Math.min(s.maxHp, s.hp + 500);
        s.lanternBattery = 60;
        sndAstroCharge.currentTime = 0; sndAstroCharge.play().catch(() => {});
    }

    let target = null, targetDist = 1e9;
    const allHiders = [];
    if (!HS.isDead && HS.hp > 0) {
        allHiders.push({ type: 'player', x: HS.x, y: HS.y, hp: HS.hp, ref: null });
    }
    HS.npcs.forEach(n => {
        if (!n.dead) allHiders.push({ type: 'npc', x: n.x, y: n.y, hp: n.hp, ref: n });
    });

    allHiders.forEach(h => {
        if (h.hp <= 0) return;
        const d = Math.hypot(h.x - s.x, h.y - s.y);
        if (d < 25 && los(s.x, s.y, h.x, h.y)) {
            if (d < targetDist) { targetDist = d; target = h; }
        }
    });

    if (target) {
        s.state = 'chase';
        s.chaseTarget = target;
        s.chaseLossTimer = 3;
        const angle = Math.atan2(target.y - s.y, target.x - s.x);
        s.a = angle;
        const spd = s.charged ? 4.5 : 4.0;
        const nx = s.x + Math.cos(angle) * spd * dt;
        const ny = s.y + Math.sin(angle) * spd * dt;
        if (!solid(nx, s.y)) s.x = nx;
        if (!solid(s.x, ny)) s.y = ny;

        if (targetDist < 15 && s.cd <= 0) {
            s.cd = 3;
            s.lanternOn = false;
            sndAstroShoot.currentTime = 0; sndAstroShoot.play().catch(() => {});
            HS.plasmaOrbs.push({
                x: s.x, y: s.y,
                vx: Math.cos(angle) * 12,
                vy: Math.sin(angle) * 12,
                life: 3,
                fromSeeker: true
            });
        }
    } else {
        s.state = 'patrol';
        s.chaseLossTimer -= dt;
        if (s.chaseLossTimer <= 0) s.chaseTarget = null;
        const pp = s.patrolPoints[s.patrolIdx % s.patrolPoints.length];
        const d = Math.hypot(pp[0] - s.x, pp[1] - s.y);
        if (d < 1) {
            s.patrolIdx = (s.patrolIdx + 1) % s.patrolPoints.length;
        } else {
            const angle = Math.atan2(pp[1] - s.y, pp[0] - s.x);
            s.a = angle;
            const spd = 2.5;
            const nx = s.x + Math.cos(angle) * spd * dt;
            const ny = s.y + Math.sin(angle) * spd * dt;
            if (!solid(nx, s.y)) s.x = nx;
            if (!solid(s.x, ny)) s.y = ny;
        }
        if (!s.lanternOn && s.lanternBattery > 5 && Math.random() < dt * 0.3) {
            s.lanternOn = true;
            s.lanternTimer = 5;
            s.lanternBattery -= 3;
        }
    }

    for (let i = HS.plasmaOrbs.length - 1; i >= 0; i--) {
        const orb = HS.plasmaOrbs[i];
        orb.x += orb.vx * dt;
        orb.y += orb.vy * dt;
        orb.life -= dt;
        if (!HS.isDead && Math.hypot(orb.x - HS.x, orb.y - HS.y) < 0.5) {
            HS.hp -= PLASMA_DMG;
            HS.flash = 0.3;
            HS.plasmaOrbs.splice(i, 1);
            sndExplosion.currentTime = 0; sndExplosion.play().catch(() => {});
            if (HS.hp <= 0) {
                if (HS.extraLives > 0) {
                    HS.extraLives--;
                    HS.hp = HS.maxHp;
                    const safePos = findSafeRespawn();
                    HS.x = safePos[0]; HS.y = safePos[1];
                    addKillFeed('Viață suplimentară folosită! Respawn în altă zonă.');
                    showJumpScare(true, true);
                } else {
                    triggerSingleLose(true);
                }
            }
            continue;
        }
        HS.npcs.forEach(n => {
            if (!n.dead && Math.hypot(orb.x - n.x, orb.y - n.y) < 0.5) {
                n.hp -= PLASMA_DMG;
                HS.plasmaOrbs.splice(i, 1);
                if (n.hp <= 0) {
                    if (n.extraLives > 0) {
                        n.extraLives--;
                        n.hp = n.maxHp;
                        const safePos = findSafeRespawn();
                        n.x = safePos[0]; n.y = safePos[1];
                    } else {
                        n.dead = true;
                        dropNPCItems(n);
                    }
                }
            }
        });
        if (orb.life <= 0 || solid(orb.x, orb.y)) {
            HS.plasmaOrbs.splice(i, 1);
            sndExplosion.currentTime = 0; sndExplosion.play().catch(() => {});
        }
    }

    if (s.state === 'chase' && target && targetDist < 1.0) {
        if (target.type === 'player') {
            if (HS.extraLives > 0) {
                HS.extraLives--;
                HS.hp = HS.maxHp;
                const safePos = findSafeRespawn();
                HS.x = safePos[0]; HS.y = safePos[1];
                addKillFeed('Viață suplimentară folosită! Respawn în altă zonă.');
                showJumpScare(false, true);
            }
            else { triggerSingleLose(false); }
        } else if (target.ref) {
            if (target.ref.extraLives > 0) {
                target.ref.extraLives--;
                target.ref.hp = target.ref.maxHp;
                const safePos = findSafeRespawn();
                target.ref.x = safePos[0]; target.ref.y = safePos[1];
            } else {
                target.ref.hp = 0;
                target.ref.dead = true;
                dropNPCItems(target.ref);
            }
        }
    }
}

function dropNPCItems(npc) {
    const now = performance.now();
    HS.droppedItems.push({
        x: npc.x, y: npc.y, type: 'lantern', img: 'soviet lantern-item',
        weapon: null, taken: false, dropTime: now
    });
    npc.weapons.forEach(wId => {
        HS.droppedItems.push({
            x: npc.x + (Math.random() - 0.5) * 0.5,
            y: npc.y + (Math.random() - 0.5) * 0.5,
            type: 'weapon', img: WEAPONS_DEF[wId].img,
            weapon: wId, taken: false, dropTime: now
        });
    });
}

// ✅ triggerSingleWin cu isBossKill
function triggerSingleWin(isBossKill) {
    if (!HS.on) return;
    HS.on = false;
    stopHSMusic();
    const g = window.gameStats || {};
    g.shooter = g.shooter || { kills: 0, wins: 0, score: 0 };
    g.shooter.score = (g.shooter.score || 0) + 7000 + HS.generatorsCompleted * 150;
    g.shooter.kills = (g.shooter.kills || 0) + HS.kills;
    g.shooter.wins = (g.shooter.wins || 0) + 1;
    creditHSWin('hider');
    if (isBossKill) {
        creditHSBossKill();
        if (typeof window.unlockAstroAchievement === 'function') window.unlockAstroAchievement();
    }
    if (typeof saveStats === 'function') saveStats();
    sndWin.currentTime = 0; sndWin.play().catch(() => {});
    showEndScreen(true, 'hider');
}

function triggerSingleLose(killedByBullet) {
    if (!HS.on) return;
    HS.on = false;
    stopHSMusic();
    showJumpScare(killedByBullet, false);
}

function showEndScreen(win, role) {
    const loseScr = $('lose-screen');
    const winScr = $('win-screen');
    if (win) {
        if (winScr) {
            winScr.classList.remove('hidden');
            winScr.innerHTML = `
                <div class="end-title" style="color: #33ff33;">Ai supraviețuit.</div>
                <div style="font-size: 24px; color: #ffff00; font-weight: bold; margin-bottom: 30px;">Stalin se bucură!</div>
                <button class="btn btn-back" onclick="hsToMenu()">Înapoi la meniu</button>
            `;
        }
    } else {
        if (loseScr) {
            loseScr.classList.remove('hidden');
            loseScr.style.background = '#000';
            loseScr.innerHTML = `
                <div class="end-title" style="color: #ff3333;">Poporul Sovietic a învins dușmanul!</div>
                <button class="btn btn-back" id="hs-lose-btn" style="margin-top: 20px; opacity: 0; transition: opacity 1s;" onclick="hsToMenu()">Înapoi la meniu</button>
            `;
            setTimeout(() => {
                const btn = $('hs-lose-btn');
                if (btn) btn.style.opacity = '1';
            }, 5000);
        }
    }
}

function showJumpScare(killedByBullet, respawnOnly) {
    if (HS.jumpscareActive) return;
    HS.jumpscareActive = true;
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;display:flex;justify-content:center;align-items:center;';
    const img = document.createElement('img');
    img.src = killedByBullet ? 'hetes astro-jumpscare.jpg' : 'hetes jumpscare.jpg';
    img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;';
    ov.appendChild(img);
    document.body.appendChild(ov);
    sndAstroLaugh.currentTime = 0; sndAstroLaugh.play().catch(() => {});
    if (killedByBullet) {
        sndExplosion.currentTime = 0; sndExplosion.play().catch(() => {});
    }
    const delay = respawnOnly ? 1500 : 3000;
    setTimeout(() => {
        ov.remove();
        HS.jumpscareActive = false;
        if (!respawnOnly) {
            hsToMenu();
        } else {
            lockPointer();
        }
    }, delay);
}

// ========== PUZZLE ==========
function openGeneratorPuzzle(gen) {
    if (gen.completed) return;
    gen.puzzleOpen = true;
    const ov = document.createElement('div');
    ov.id = 'hs-puzzle-overlay';
    ov.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.9);display:flex;flex-direction:column;justify-content:center;align-items:center;color:#fff;font-family:sans-serif;';
    ov.innerHTML = `
        <h2 style="color:#00ffcc;margin-bottom:20px;">Generator Puzzle</h2>
        <canvas id="hs-puzzle-canvas" width="600" height="400" style="border:2px solid #00ffcc;border-radius:8px;background:#111;"></canvas>
        <div style="margin-top:20px;">
            <button id="hs-puzzle-close" style="padding:10px 30px;background:#c0392b;color:#fff;border:none;border-radius:6px;font-size:16px;cursor:pointer;margin-right:10px;">Închide</button>
        </div>
        <div id="hs-puzzle-status" style="margin-top:15px;color:#ffcc00;font-size:18px;">Puzzle 1/3</div>
    `;
    document.body.appendChild(ov);
    const pCv = document.getElementById('hs-puzzle-canvas');
    const pCx = pCv.getContext('2d');
    let puzzleIndex = 0;
    const totalPuzzles = 3;
    let currentPuzzle = null;

    function generatePuzzle() {
        const points = [];
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const numPoints = 4 + puzzleIndex;
        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: 60 + Math.random() * 480,
                y: 60 + Math.random() * 280,
                color: colors[i % colors.length]
            });
        }
        currentPuzzle = { points, connections: [], selected: null };
    }

    function drawPuzzle() {
        pCx.fillStyle = '#111';
        pCx.fillRect(0, 0, 600, 400);
        if (!currentPuzzle) return;
        currentPuzzle.connections.forEach(c => {
            pCx.strokeStyle = '#00ffcc';
            pCx.lineWidth = 3;
            pCx.beginPath();
            pCx.moveTo(currentPuzzle.points[c[0]].x, currentPuzzle.points[c[0]].y);
            pCx.lineTo(currentPuzzle.points[c[1]].x, currentPuzzle.points[c[1]].y);
            pCx.stroke();
        });
        currentPuzzle.points.forEach(p => {
            pCx.fillStyle = p.color;
            pCx.beginPath();
            pCx.arc(p.x, p.y, 12, 0, Math.PI * 2);
            pCx.fill();
            pCx.strokeStyle = '#fff';
            pCx.lineWidth = 2;
            pCx.stroke();
        });
        if (currentPuzzle.selected !== null) {
            const sp = currentPuzzle.points[currentPuzzle.selected];
            pCx.strokeStyle = '#ffcc00';
            pCx.lineWidth = 3;
            pCx.beginPath();
            pCx.arc(sp.x, sp.y, 18, 0, Math.PI * 2);
            pCx.stroke();
        }
    }

    function checkComplete() {
        const connected = new Set();
        currentPuzzle.connections.forEach(c => { connected.add(c[0]); connected.add(c[1]); });
        return connected.size === currentPuzzle.points.length;
    }

    function nextPuzzle() {
        puzzleIndex++;
        if (puzzleIndex >= totalPuzzles) {
            gen.completed = true;
            gen.puzzleOpen = false;
            ov.remove();
            HS.extraLives++;
            HS.npcs.forEach(n => { if (!n.dead) n.extraLives = (n.extraLives || 0) + 1; });
            HS.generatorsCompleted++;
            const g = window.gameStats || {};
            g.shooter = g.shooter || { kills: 0, wins: 0, score: 0 };
            g.shooter.score = (g.shooter.score || 0) + 150;
            if (typeof saveStats === 'function') saveStats();
            addKillFeed('Generator completat! +1 viață pentru toți hiderii (inclusiv NPC)! +150 pct');
            return;
        }
        document.getElementById('hs-puzzle-status').textContent = `Puzzle ${puzzleIndex + 1}/${totalPuzzles}`;
        generatePuzzle();
        drawPuzzle();
    }

    pCv.addEventListener('click', e => {
        if (!currentPuzzle) return;
        const rect = pCv.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (600 / rect.width);
        const my = (e.clientY - rect.top) * (400 / rect.height);
        let clicked = -1;
        currentPuzzle.points.forEach((p, i) => {
            if (Math.hypot(p.x - mx, p.y - my) < 20) clicked = i;
        });
        if (clicked >= 0) {
            if (currentPuzzle.selected === null) {
                currentPuzzle.selected = clicked;
            } else if (currentPuzzle.selected !== clicked) {
                const exists = currentPuzzle.connections.some(c =>
                    (c[0] === currentPuzzle.selected && c[1] === clicked) ||
                    (c[1] === currentPuzzle.selected && c[0] === clicked)
                );
                if (!exists) currentPuzzle.connections.push([currentPuzzle.selected, clicked]);
                currentPuzzle.selected = null;
                if (checkComplete()) setTimeout(nextPuzzle, 300);
            } else {
                currentPuzzle.selected = null;
            }
            drawPuzzle();
        }
    });

    document.getElementById('hs-puzzle-close').onclick = () => {
        gen.puzzleOpen = false;
        ov.remove();
    };

    generatePuzzle();
    drawPuzzle();
}

// ========== UPDATE ==========
function updateHS(dt) {
    if (!HS.on) return;
    if (HS.jumpscareActive) return;
    if (HS.mode === 'multi' && MP) {
        updateHSMulti(dt);
        return;
    }
    updateHSSingle(dt);
}

function updateHSSingle(dt) {
    const now = performance.now();
    if (!HS.gameStarted) {
        HS.startCountdown -= dt;
        if (HS.startCountdown <= 0) HS.gameStarted = true;
        return;
    }
    if (now >= HS.roundEndTime) {
        triggerSingleWin(false);
        return;
    }

    HS.cd -= dt; HS.kick = Math.max(0, HS.kick - dt * 6);
    HS.flash -= dt; HS.hm -= dt;
    HS.abilityCd -= dt;
    HS.laserCd -= dt;

    if (HS.rage) { HS.rageTimer -= dt; if (HS.rageTimer <= 0) HS.rage = false; }
    if (HS.nazbolSmokeTimer > 0) { HS.nazbolSmokeTimer -= dt; if (HS.nazbolSmokeTimer <= 0) HS.nazbolInvincible = false; }

    if (HS.lanternOn) {
        HS.lanternTimer -= dt;
        if (HS.lanternTimer <= 0) HS.lanternOn = false;
    }

    let k = window.keys || {};
    let forward = (k['w'] || k['arrowup'] ? 1 : 0) - (k['s'] || k['arrowdown'] ? 1 : 0);
    let strafe = (k['d'] || k['arrowright'] ? 1 : 0) - (k['a'] || k['arrowleft'] ? 1 : 0);
    let cosA = Math.cos(HS.a), sinA = Math.sin(HS.a);
    let mx = forward * cosA - strafe * sinA;
    let my = forward * sinA + strafe * cosA;

    let baseSpd = 3.2;
    if (['gopnik', 'soldat-rus-modern', 'anti-furry-hetes'].includes(HS.skin)) {
        baseSpd = 4.8;
    }
    let spd = HS.rage ? baseSpd * 2 : baseSpd;
    if (HS.nazbolSmokeTimer > 0) spd = 5.5;
    let l = Math.hypot(mx, my);
    if (l) {
        mx = (mx / l) * spd * dt;
        my = (my / l) * spd * dt;
        HS.bob += dt * 9;
        if (!solid(HS.x + mx, HS.y)) HS.x += mx;
        if (!solid(HS.x, HS.y + my)) HS.y += my;
    }

    HS.ammoBoxes.forEach(box => {
        if (box.active) {
            if (Math.hypot(HS.x - box.x, HS.y - box.y) < 0.6) {
                HS.w.forEach(wId => { HS.ammo[wId] += WEAPONS_DEF[wId].give; });
                box.active = false; box.respawnTimer = 60;
                sndJump.currentTime = 0; sndJump.play().catch(() => {});
                addKillFeed('Muniție colectată!');
            }
        } else {
            box.respawnTimer -= dt;
            if (box.respawnTimer <= 0) box.active = true;
        }
    });

    HS.vodkas.forEach(v => {
        if (!v.taken && Math.hypot(HS.x - v.x, HS.y - v.y) < 1.2) {
            v.taken = true;
            HS.hp = Math.min(HS.maxHp, HS.hp + 25);
            sndJump.currentTime = 0; sndJump.play().catch(() => {});
            addKillFeed('Vodka băută! +25 HP');
        }
    });

    HS.droppedItems.forEach(item => {
        if (!item.taken && Math.hypot(HS.x - item.x, HS.y - item.y) < 1.2) {
            item.taken = true;
            if (item.type === 'lantern') {
                addKillFeed('Lanternă colectată!');
            } else if (item.type === 'weapon' && item.weapon) {
                if (!HS.w.includes(item.weapon) && HS.w.length < getMaxWeapons(HS.skin)) {
                    HS.w.push(item.weapon);
                    HS.mag[item.weapon] = WEAPONS_DEF[item.weapon].mag;
                    HS.ammo[item.weapon] = WEAPONS_DEF[item.weapon].maxAmmo;
                    addKillFeed(`Armă NOUĂ colectată: ${WEAPONS_DEF[item.weapon].name}!`);
                } else {
                    HS.ammo[item.weapon] = (HS.ammo[item.weapon] || 0) + WEAPONS_DEF[item.weapon].give;
                    addKillFeed(`Muniție ${WEAPONS_DEF[item.weapon].name} +${WEAPONS_DEF[item.weapon].give}`);
                }
            }
        }
    });

    HS.generators.forEach(gen => {
        if (!gen.completed && Math.hypot(HS.x - gen.x, HS.y - gen.y) < 1.5) {
            if (k['e'] && !gen.puzzleOpen) openGeneratorPuzzle(gen);
        }
    });

    updateHiderNPCs(dt);
    updateSeekerNPC(dt);

    let firePressed = HS.fire || (window.mobileShooterFire || 0) || (k[' '] ? 1 : 0);
    if (firePressed && HS.cd <= 0 && HS.equipped < HS.w.length && !HS.isDead) {
        shootHSWeapon();
    }

    if (HS.hp <= 0 && !HS.isDead) {
        if (HS.extraLives > 0) {
            HS.extraLives--;
            HS.hp = HS.maxHp;
            const safePos = findSafeRespawn();
            HS.x = safePos[0]; HS.y = safePos[1];
            addKillFeed('Viață suplimentară folosită! Respawn în altă zonă.');
            showJumpScare(true, true);
        }
        else { triggerSingleLose(true); }
    }
}

function shootHSWeapon() {
    if (HS.cd > 0) return;
    const id = HS.w[HS.cur];
    const w = WEAPONS_DEF[id];
    if (!w) return;
    if (HS.mag[id] <= 0) { addKillFeed('Încărcător gol! Apasă R.'); return; }
    HS.cd = w.rate;
    HS.mag[id]--;
    HS.kick = 1;
    sndGun.currentTime = 0; sndGun.play().catch(() => {});

    let wd = cast(HS.x, HS.y, HS.a)[0];
    let best = null, bd = 1e9;
    if (HS.seekerNPC && !HS.seekerNPC.dead) {
        const e = HS.seekerNPC;
        const dx = e.x - HS.x, dy = e.y - HS.y, d = Math.hypot(dx, dy);
        let df = Math.atan2(dy, dx) - HS.a; df = Math.atan2(Math.sin(df), Math.cos(df));
        if (Math.abs(df) * d < 0.38 && d < bd && d < wd + 0.3) { best = e; bd = d; }
    }
    let dmg = w.dmg;
    if (HS.skin === 'cernobil-stalker') dmg *= 2;
    if (w.splash && best) {
        const ex = HS.x + Math.cos(HS.a) * bd, ey = HS.y + Math.sin(HS.a) * bd;
        if (HS.seekerNPC && !HS.seekerNPC.dead) {
            const ds = Math.hypot(HS.seekerNPC.x - ex, HS.seekerNPC.y - ey);
            if (ds < w.splash) {
                HS.seekerNPC.hp -= dmg;
                HS.seekerNPC.frozenTimer = 2;
                // ✅ FIX: splash omoară seekerul → boss kill
                if (HS.seekerNPC.hp <= 0 && !HS.seekerNPC.dead) {
                    HS.seekerNPC.dead = true;
                    if (HS.on) triggerSingleWin(true);
                }
            }
        }
        HS.npcs.forEach(n => {
            if (n.dead) return;
            const dn = Math.hypot(n.x - ex, n.y - ey);
            if (dn < w.splash) { n.hp -= dmg; if (n.hp <= 0) { n.dead = true; dropNPCItems(n); } }
        });
    } else if (best) {
        best.hp -= dmg;
        HS.hm = 0.12;
        if (best.hp <= 0 && best === HS.seekerNPC) {
            HS.seekerNPC.dead = true;
            HS.hp = Math.min(HS.maxHp, HS.hp + 200);
            // ✅ FIX: apelează direct victoria (boss kill) când seekerul moare din glonț
            if (HS.on) triggerSingleWin(true);
        }
    }
}

function updateHSMulti(dt) {
    if (!MP.ready) return;
    if (MP.ended || MP.chatOpen) return;
    if (MP.spectating) { mpInterpolate(dt); return; }

    const now = Date.now();
    const roundStart = MP.round ? MP.round.start : now;
    const preEnd = roundStart + MP_PRE_ROUND_MS;

    HS.cd -= dt; HS.kick = Math.max(0, HS.kick - dt * 6);
    HS.flash -= dt; HS.hm -= dt;
    HS.abilityCd -= dt;
    HS.laserCd -= dt;

    if (HS.rage) { HS.rageTimer -= dt; if (HS.rageTimer <= 0) HS.rage = false; }
    if (HS.nazbolSmokeTimer > 0) { HS.nazbolSmokeTimer -= dt; if (HS.nazbolSmokeTimer <= 0) HS.nazbolInvincible = false; }
    if (HS.lanternOn) {
        HS.lanternTimer -= dt;
        if (HS.lanternTimer <= 0) HS.lanternOn = false;
    }

    let k = window.keys || {};
    let forward = (k['w'] || k['arrowup'] ? 1 : 0) - (k['s'] || k['arrowdown'] ? 1 : 0);
    let strafe = (k['d'] || k['arrowright'] ? 1 : 0) - (k['a'] || k['arrowleft'] ? 1 : 0);
    let cosA = Math.cos(HS.a), sinA = Math.sin(HS.a);
    let mx = forward * cosA - strafe * sinA;
    let my = forward * sinA + strafe * cosA;
    let spd = 3.2;
    if (MP.role === 'seeker') spd = 4.0;
    if (['gopnik', 'soldat-rus-modern', 'anti-furry-hetes'].includes(HS.skin) && MP.role === 'hider') spd = 4.8;
    if (HS.rage) spd *= 2;
    let l = Math.hypot(mx, my);
    if (l) {
        mx = (mx / l) * spd * dt; my = (my / l) * spd * dt;
        HS.bob += dt * 9;
        if (!solid(HS.x + mx, HS.y)) HS.x += mx;
        if (!solid(HS.x, HS.y + my)) HS.y += my;
    }

    if (now >= preEnd) {
        let firePressed = HS.fire || (window.mobileShooterFire || 0) || (k[' '] ? 1 : 0);
        if (MP.role === 'seeker') {
            if (firePressed && HS.seekerGunCd <= 0) {
                HS.seekerGunCd = 3;
                sndAstroShoot.currentTime = 0; sndAstroShoot.play().catch(() => {});
                MP.shots++;
                HS.plasmaOrbs.push({
                    x: HS.x, y: HS.y,
                    vx: Math.cos(HS.a) * 12,
                    vy: Math.sin(HS.a) * 12,
                    life: 3
                });
            }
        } else {
            if (firePressed && HS.cd <= 0 && HS.equipped < HS.w.length) {
                const id = HS.w[HS.cur];
                const w = WEAPONS_DEF[id];
                if (w && HS.mag[id] > 0) {
                    HS.cd = w.rate;
                    HS.mag[id]--;
                    HS.kick = 1;
                    sndGun.currentTime = 0; sndGun.play().catch(() => {});
                    let wd = cast(HS.x, HS.y, HS.a)[0];
                    mpShoot(w, id, wd);
                }
            }
        }
    }

    for (let i = HS.plasmaOrbs.length - 1; i >= 0; i--) {
        const orb = HS.plasmaOrbs[i];
        orb.x += orb.vx * dt;
        orb.y += orb.vy * dt;
        orb.life -= dt;
        mpTargets().forEach(p => {
            if (MP.role === 'seeker' && p.role === 'seeker') return;
            if (MP.role === 'hider' && p.role !== 'seeker') return;
            if (Math.hypot(orb.x - p.x, orb.y - p.y) < 0.5) {
                mpDealDamage(p, PLASMA_DMG);
                HS.plasmaOrbs.splice(i, 1);
            }
        });
        if (orb.life <= 0 || solid(orb.x, orb.y)) {
            HS.plasmaOrbs.splice(i, 1);
            sndExplosion.currentTime = 0; sndExplosion.play().catch(() => {});
        }
    }

    mpInterpolate(dt);
}

// ========== RENDER ==========
function renderHS() {
    if (!HS.on) return;
    cx.save();
    cx.fillStyle = '#030306';
    cx.fillRect(0, 0, W, H);

    const isSeeker = HS.role === 'seeker';
    const myLanternOn = HS.lanternOn && (isSeeker || HS.equipped >= HS.w.length);
    const lanternRange = 18;

    for (let i = 0; i < C; i++) {
        let a = HS.a + (i / C - .5) * FOV;
        let [d, t, s, wx] = cast(HS.x, HS.y, a);
        let p = Math.max(.05, d * Math.cos(a - HS.a));
        Z[i] = p;
        let h = H / p, y0 = (H - h) / 2;

        let lightLevel;
        if (isSeeker) {
            lightLevel = 0.85;
        } else {
            lightLevel = 0.22;
            if (myLanternOn && p < lanternRange) {
                lightLevel = Math.max(lightLevel, 0.55 + (1 - p / lanternRange) * 0.45);
            }
        }

        if (HS.seekerNPC && HS.seekerNPC.lanternOn && !HS.seekerNPC.dead) {
            const sLight = getLanternLight(HS.seekerNPC.x, HS.seekerNPC.y, HS.seekerNPC.a, HS.x + Math.cos(a) * p, HS.y + Math.sin(a) * p, 8);
            if (sLight > 0) {
                lightLevel = Math.max(lightLevel, sLight * 0.5);
                cx.fillStyle = `rgb(${Math.min(255, (100 + 80 * sLight)) | 0},${(20 + 30 * sLight) | 0},${(20 + 30 * sLight) | 0})`;
                cx.fillRect(i * 2, y0, 2, h);
                continue;
            }
        }

        let c;
        if (isSeeker) {
            c = [140 * lightLevel + 30, 60 * lightLevel + 10, 50 * lightLevel + 8];
        } else {
            c = [80 * lightLevel + 5, 60 * lightLevel + 3, 40 * lightLevel + 2];
        }
        cx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
        cx.fillRect(i * 2, y0, 2, h);
    }

    const allObjects = [];
    HS.ammoBoxes.forEach(box => { if (box.active) allObjects.push({ type: 'ammo', x: box.x, y: box.y, img: 'ammo' }); });
    HS.vodkas.forEach(v => { if (!v.taken) allObjects.push({ type: 'vodka', x: v.x, y: v.y, img: 'vodka' }); });
    HS.generators.forEach(g => { if (!g.completed) allObjects.push({ type: 'generator', x: g.x, y: g.y, img: 'generator' }); });
    HS.droppedItems.forEach(item => { if (!item.taken) allObjects.push({ type: 'drop', x: item.x, y: item.y, img: item.img }); });
    HS.npcs.forEach(npc => { if (!npc.dead) allObjects.push({ type: 'npc', x: npc.x, y: npc.y, ref: npc }); });
    if (HS.seekerNPC && !HS.seekerNPC.dead) allObjects.push({ type: 'seeker', x: HS.seekerNPC.x, y: HS.seekerNPC.y, ref: HS.seekerNPC });
    HS.plasmaOrbs.forEach(orb => allObjects.push({ type: 'plasma', x: orb.x, y: orb.y }));

    const sorted = allObjects.map(o => ({ ...o, dist: Math.hypot(o.x - HS.x, o.y - HS.y) })).sort((a, b) => b.dist - a.dist);

    sorted.forEach(o => {
        const toT = Math.atan2(o.y - HS.y, o.x - HS.x);
        let df = toT - HS.a; df = Math.atan2(Math.sin(df), Math.cos(df));
        if (Math.abs(df) > FOV / 2 + 0.4) return;
        const pd = o.dist * Math.cos(df);
        if (pd < 0.3) return;

        let lightLevel;
        if (isSeeker) {
            lightLevel = 0.85;
        } else {
            lightLevel = 0.22;
            if (myLanternOn) {
                const ll = getLanternLight(HS.x, HS.y, HS.a, o.x, o.y, lanternRange);
                if (ll > 0) lightLevel = Math.max(lightLevel, 0.55 + ll * 0.45);
            }
            if (o.ref && o.ref.lanternOn) lightLevel = Math.max(lightLevel, 0.75);
            if (HS.seekerNPC && HS.seekerNPC.lanternOn && !HS.seekerNPC.dead) {
                const ll = getLanternLight(HS.seekerNPC.x, HS.seekerNPC.y, HS.seekerNPC.a, o.x, o.y, 8);
                if (ll > 0) lightLevel = Math.max(lightLevel, ll * 0.7);
            }
        }

        const midIdx = Math.min(C - 1, Math.max(0, ((l => l)((0.5 + df / FOV) * W) >> 1)));
        if (Z[midIdx] < pd - 0.1) return;

        const h = H / pd * 0.5, w = h * 0.5;
        const l = (.5 + df / FOV) * W - w / 2, y = (H - h) / 2 + h * 0.2;

        cx.save();
        cx.globalAlpha = Math.min(1, lightLevel * 1.8 + 0.1);

        if (o.type === 'ammo' || o.type === 'vodka' || o.type === 'generator' || o.type === 'drop') {
            const im = IMG[o.img];
            if (im && im.complete && im.naturalWidth) cx.drawImage(im, l, y, w, h);
        } else if (o.type === 'npc') {
            const sk = SKINS_DEF[o.ref.skin] || SKINS_DEF.hetes;
            let rel = o.ref.a - toT; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
            const im = IMG[Math.abs(rel) < Math.PI / 2 ? sk.back : sk.front];
            if (im && im.complete && im.naturalWidth) {
                const hh = H / pd * 0.95, ww = hh * 0.65;
                const ll = (.5 + df / FOV) * W - ww / 2, yy = (H - hh) / 2 + hh * 0.03;
                cx.drawImage(im, ll, yy, ww, hh);
            }
            if (o.ref.lanternOn) {
                const glowX = l + w / 2, glowY = y + h * 0.4;
                const grad = cx.createRadialGradient(glowX, glowY, 5, glowX, glowY, 60);
                grad.addColorStop(0, 'rgba(255,255,200,0.7)');
                grad.addColorStop(1, 'rgba(255,255,200,0)');
                cx.fillStyle = grad;
                cx.fillRect(glowX - 60, glowY - 60, 120, 120);
            }
        } else if (o.type === 'seeker') {
            const s = o.ref;
            const isChase = s.state === 'chase';
            let rel = s.a - toT; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
            const imgName = Math.abs(rel) < Math.PI / 2
                ? (isChase ? 'hetes astro-back-chase' : 'hetes astro-back')
                : (isChase ? 'hetes astro-front-chase' : 'hetes astro-front');
            const im = IMG[imgName];
            if (im && im.complete && im.naturalWidth) {
                const hh = H / pd * 1.0, ww = hh * 0.6;
                const ll = (.5 + df / FOV) * W - ww / 2, yy = (H - hh) / 2 + hh * 0.03;
                cx.drawImage(im, ll, yy, ww, hh);
            }
            if (s.lanternOn) {
                const glowX = l + w / 2, glowY = y + h * 0.4;
                const grad = cx.createRadialGradient(glowX, glowY, 5, glowX, glowY, 100);
                grad.addColorStop(0, 'rgba(255,60,60,0.9)');
                grad.addColorStop(1, 'rgba(255,60,60,0)');
                cx.fillStyle = grad;
                cx.fillRect(glowX - 100, glowY - 100, 200, 200);
            }
        } else if (o.type === 'plasma') {
            const im = IMG['plasma-orb'];
            if (im && im.complete && im.naturalWidth) {
                cx.drawImage(im, l - 10, y - 10, 30, 30);
            } else {
                cx.fillStyle = '#ff4444';
                cx.beginPath(); cx.arc(l + w / 2, y + h / 2, 12, 0, Math.PI * 2); cx.fill();
            }
            cx.save();
            cx.globalAlpha = 0.9;
            const px = l + w / 2, py = y + h / 2;
            const grad = cx.createRadialGradient(px, py, 5, px, py, 60);
            grad.addColorStop(0, 'rgba(255,50,50,1)');
            grad.addColorStop(0.5, 'rgba(255,0,0,0.6)');
            grad.addColorStop(1, 'rgba(255,0,0,0)');
            cx.fillStyle = grad;
            cx.fillRect(px - 60, py - 60, 120, 120);
            cx.restore();
        }
        cx.restore();
    });

    if (HS.mode === 'multi' && MP && MP.ready && !MP.spectating) {
        mpRenderPlayers();
    }

    if (!HS.isDead) {
        if (HS.equipped < HS.w.length) {
            const id = HS.w[HS.cur];
            const wp = WEAPONS_DEF[id];
            const wi = IMG[wp?.img];
            if (wi && wi.complete && wi.naturalWidth) {
                let h = H * .5, ww = h * wi.naturalWidth / wi.naturalHeight;
                cx.drawImage(wi, W * .62 - ww * .35 + Math.sin(HS.bob) * 12 + HS.kick * 14, H - h * .92 + Math.abs(Math.cos(HS.bob)) * 10 + HS.kick * 28, ww, h);
            }
        } else {
            const li = IMG['soviet lantern-player'];
            if (li && li.complete && li.naturalWidth) {
                let h = H * .4, ww = h * li.naturalWidth / li.naturalHeight;
                cx.drawImage(li, W * .62 - ww * .35 + Math.sin(HS.bob) * 12 + HS.kick * 14, H - h * .92 + Math.abs(Math.cos(HS.bob)) * 10 + HS.kick * 28, ww, h);
            }
        }
    }

    if (HS.flash > 0) { cx.fillStyle = `rgba(200,0,0,${HS.flash})`; cx.fillRect(0, 0, W, H); }
    if (HS.skin === 'nazbol' && HS.nazbolSmokeTimer > 0) {
        cx.fillStyle = 'rgba(255, 0, 0, 0.28)';
        cx.fillRect(0, 0, W, H);
    }

    if (isSeeker) {
        cx.fillStyle = 'rgba(80, 0, 0, 0.15)';
        cx.fillRect(0, 0, W, H);
    }

    if (isSeeker && HS.frozenTimer > 0) {
        cx.fillStyle = `rgba(100, 150, 255, ${0.3 + Math.sin(performance.now() / 100) * 0.1})`;
        cx.fillRect(0, 0, W, H);
        cx.fillStyle = '#fff';
        cx.font = 'bold 48px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('ÎNGHEȚAT!', W / 2, H / 2 - 100);
        cx.font = 'bold 24px sans-serif';
        cx.fillText(Math.ceil(HS.frozenTimer) + 's', W / 2, H / 2 - 60);
        cx.textAlign = 'left';
    }

    cx.restore();

    cx.strokeStyle = HS.hm > 0 ? '#f33' : '#fff'; cx.lineWidth = 2; cx.beginPath();
    cx.moveTo(W / 2 - 10, H / 2); cx.lineTo(W / 2 + 10, H / 2);
    cx.moveTo(W / 2, H / 2 - 10); cx.lineTo(W / 2, H / 2 + 10); cx.stroke();

    drawHSHUD();
}

// ========== HUD ==========
function drawHSHUD() {
    cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(20, 20, 260, 26);
    cx.fillStyle = '#d22'; cx.fillRect(20, 20, Math.max(0, HS.hp) * (260 / HS.maxHp), 26);
    cx.strokeStyle = '#fff'; cx.lineWidth = 2; cx.strokeRect(20, 20, 260, 26);
    cx.fillStyle = '#fff'; cx.font = 'bold 16px sans-serif'; cx.textAlign = 'left';
    cx.fillText('HP ' + Math.ceil(Math.max(0, HS.hp)) + '/' + HS.maxHp, 28, 39);

    if (HS.extraLives > 0 && HS.role === 'hider') {
        cx.fillStyle = '#ffcc00'; cx.font = 'bold 16px sans-serif';
        cx.fillText('❤️ Vieți extra: ' + HS.extraLives, 20, 70);
    }

    cx.fillStyle = HS.role === 'seeker' ? '#ff4444' : '#44ff44';
    cx.font = 'bold 18px sans-serif';
    cx.fillText(HS.role === 'seeker' ? '🔫 SEEKER' : '🏃 HIDER', 20, 100);

    let curY = 135;
    cx.font = 'bold 14px sans-serif';

    if (HS.role === 'hider') {
        cx.fillStyle = HS.abilityCd <= 0 ? '#00ffcc' : '#888';
        cx.fillText('G - Abilitate: ' + (HS.abilityCd <= 0 ? '[GATA]' : Math.ceil(HS.abilityCd) + 's'), 20, curY);
        curY += 22;

        if (HS.skin === 'anti-furry-hetes') {
            cx.fillStyle = HS.laserCd <= 0 ? '#00ffcc' : '#888';
            cx.fillText('L - Lasere: ' + (HS.laserCd <= 0 ? '[GATA]' : Math.ceil(HS.laserCd) + 's'), 20, curY);
            curY += 22;
        }

        cx.fillStyle = HS.lanternOn ? '#ffeeaa' : '#aaa';
        cx.fillText('T/SPACE - Lanternă: ' + (HS.lanternOn ? 'APRINSĂ ' + Math.ceil(HS.lanternTimer) + 's' : '[OPRITĂ]'), 20, curY);
        curY += 22;
    }

    if (HS.mode === 'single') {
        const rem = Math.max(0, HS.roundEndTime - performance.now());
        const m = Math.floor(rem / 60000), s = Math.floor(rem / 1000) % 60;
        cx.fillStyle = 'rgba(0,0,0,.7)'; cx.fillRect(W / 2 - 80, 10, 160, 50);
        cx.strokeStyle = '#ffcc00'; cx.lineWidth = 2; cx.strokeRect(W / 2 - 80, 10, 160, 50);
        cx.fillStyle = rem < 30000 ? '#ff4444' : '#fff'; cx.font = 'bold 26px sans-serif';
        cx.textAlign = 'center';
        cx.fillText(`${m}:${s < 10 ? '0' : ''}${s}`, W / 2, 46);
        cx.textAlign = 'left';
    }

    if (HS.mode === 'single' && HS.seekerNPC && !HS.seekerNPC.dead) {
        cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(W - 280, 20, 260, 70);
        cx.strokeStyle = '#ff4444'; cx.lineWidth = 2; cx.strokeRect(W - 280, 20, 260, 70);
        cx.fillStyle = '#ff4444'; cx.font = 'bold 14px sans-serif';
        cx.fillText('🔫 SEEKER', W - 270, 40);
        cx.fillStyle = '#fff'; cx.font = 'bold 13px sans-serif';
        const seekerFrac = Math.max(0, Math.min(1, HS.seekerNPC.hp / HS.seekerNPC.maxHp));
        cx.fillStyle = 'rgba(0,0,0,0.5)'; cx.fillRect(W - 270, 48, 240, 10);
        cx.fillStyle = seekerFrac > 0.5 ? '#2ecc71' : (seekerFrac > 0.25 ? '#f1c40f' : '#e74c3c');
        cx.fillRect(W - 270, 48, 240 * seekerFrac, 10);
        cx.strokeStyle = '#fff'; cx.strokeRect(W - 270, 48, 240, 10);
        cx.fillStyle = '#fff'; cx.font = 'bold 12px sans-serif';
        cx.fillText(Math.ceil(HS.seekerNPC.hp) + '/' + HS.seekerNPC.maxHp + ' HP', W - 270, 75);
        const remaining = HS.npcs.filter(n => !n.dead).length + (HS.hp > 0 ? 1 : 0);
        cx.fillStyle = '#ffcc00';
        cx.fillText('Hideri rămași: ' + remaining, W - 270, 87);
    }

    if (HS.role === 'hider') {
        cx.fillStyle = 'rgba(0,0,0,0.7)';
        cx.fillRect(W - 70, 100, 50, 50);
        cx.strokeStyle = '#ffcc00'; cx.lineWidth = 2;
        cx.strokeRect(W - 70, 100, 50, 50);
        cx.fillStyle = HS.abilityCd <= 0 ? '#ffcc00' : '#666';
        cx.font = 'bold 32px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('G', W - 45, 136);
        cx.textAlign = 'left';
    }

    if (HS.role === 'hider') {
        cx.font = 'bold 14px sans-serif';
        const lanternIdx = HS.w.length;
        cx.fillStyle = HS.equipped === lanternIdx ? '#ffcc00' : '#aaa';
        cx.font = HS.equipped === lanternIdx ? 'bold 16px sans-serif' : '14px sans-serif';
        cx.fillText(`1. Lanternă [T/SPACE] = aprinde (5s)`, 20, H - 140);
        HS.w.forEach((wId, i) => {
            const isEquipped = HS.equipped === i;
            cx.fillStyle = isEquipped ? '#ffcc00' : '#aaa';
            cx.font = isEquipped ? 'bold 16px sans-serif' : '14px sans-serif';
            cx.fillText(`${i + 2}. ${WEAPONS_DEF[wId]?.name || ''}  Mag: ${HS.mag[wId]} / Rez: ${HS.ammo[wId]}`, 20, H - 120 + i * 20);
        });
    }

    if (window._hsKillFeed) {
        const now = performance.now();
        window._hsKillFeed = window._hsKillFeed.filter(kf => kf.time > now);
        window._hsKillFeed.forEach((kf, i) => {
            cx.fillStyle = 'rgba(0,0,0,0.6)';
            cx.fillRect(W - 330, 200 + i * 22, 320, 20);
            cx.fillStyle = '#ffcc00'; cx.font = 'bold 12px sans-serif';
            cx.fillText(kf.text, W - 320, 215 + i * 22);
        });
    }

    if (HS.mode === 'multi' && MP) mpDrawHUD();
}

function addKillFeed(text) {
    window._hsKillFeed = window._hsKillFeed || [];
    window._hsKillFeed.push({ text, time: performance.now() + 4000 });
    if (window._hsKillFeed.length > 5) window._hsKillFeed.shift();
}

// ========== MULTIPLAYER RENDER ==========
function mpDrawHUD() {
    cx.save();
    cx.textAlign = 'center';
    if (!MP.ready) {
        cx.fillStyle = 'rgba(0,0,0,.7)'; cx.fillRect(W / 2 - 170, H / 2 - 30, 340, 60);
        cx.fillStyle = '#fff'; cx.font = 'bold 20px sans-serif';
        cx.fillText('Se conectează la server...', W / 2, H / 2 + 7);
        cx.restore();
        return;
    }
    const now = Date.now();
    const roundStart = MP.round ? MP.round.start : now;
    const preEnd = roundStart + MP_PRE_ROUND_MS;
    const roundEnd = roundStart + MP_PRE_ROUND_MS + ROUND_MS;
    let rem, label;
    if (now < preEnd) {
        rem = Math.max(0, preEnd - now);
        label = `Seeker ales în ${Math.ceil(rem / 1000)}s`;
    } else {
        rem = Math.max(0, roundEnd - now);
        label = 'Timp rămas';
    }
    const m = Math.floor(rem / 60000), s = Math.floor(rem / 1000) % 60;
    cx.fillStyle = 'rgba(0,0,0,.65)'; cx.fillRect(W / 2 - 100, 10, 200, 60);
    cx.strokeStyle = '#ffcc00'; cx.lineWidth = 2; cx.strokeRect(W / 2 - 100, 10, 200, 60);
    cx.fillStyle = rem < 30000 ? '#ff4444' : '#fff'; cx.font = 'bold 22px sans-serif';
    cx.fillText(label, W / 2, 34);
    cx.fillStyle = '#fff'; cx.font = 'bold 20px sans-serif';
    cx.fillText(`${m}:${s < 10 ? '0' : ''}${s}`, W / 2, 60);
    const others = Object.values(MP.players).filter(mpActive);
    cx.fillStyle = '#ccc'; cx.font = '12px sans-serif';
    cx.fillText(`Rol: ${MP.role === 'seeker' ? '🔫 SEEKER' : '🏃 HIDER'} · Jucători: ${others.length + 1} · / = chat`, W / 2, 82);
    cx.restore();
}

function mpRenderPlayers() {
    const list = Object.values(MP.players).filter(mpActive)
        .map(p => (p.d = Math.hypot(p.x - HS.x, p.y - HS.y), p)).sort((a, b) => b.d - a.d);
    list.forEach(p => {
        const toT = Math.atan2(p.y - HS.y, p.x - HS.x);
        let df = toT - HS.a; df = Math.atan2(Math.sin(df), Math.cos(df));
        if (Math.abs(df) > FOV / 2 + 0.4) return;
        const pd = p.d * Math.cos(df); if (pd < 0.3) return;

        let lightLevel;
        if (HS.role === 'seeker') {
            lightLevel = 0.85;
        } else {
            lightLevel = 0.22;
            if (HS.lanternOn && HS.equipped >= HS.w.length) {
                const ll = getLanternLight(HS.x, HS.y, HS.a, p.x, p.y, 18);
                if (ll > 0) lightLevel = Math.max(lightLevel, 0.55 + ll * 0.45);
            }
            if (p.lanternOn) lightLevel = Math.max(lightLevel, 0.75);
        }

        const h = H / pd * 0.95, w = h * 0.65, l = (.5 + df / FOV) * W - w / 2, y = (H - h) / 2 + h * 0.03;
        let rel = p.a - toT; rel = Math.atan2(Math.sin(rel), Math.cos(rel));

        let sk;
        if (p.role === 'seeker') {
            const isChase = p.hp > 0;
            sk = {
                front: isChase ? 'hetes astro-front-chase' : 'hetes astro-front',
                back: isChase ? 'hetes astro-back-chase' : 'hetes astro-back'
            };
        } else {
            sk = SKINS_DEF[p.skin] || SKINS_DEF.hetes;
        }
        const im = IMG[Math.abs(rel) < Math.PI / 2 ? sk.back : sk.front];
        cx.save();
        cx.globalAlpha = Math.min(1, lightLevel * 1.8 + 0.1);
        if (p.inv) cx.globalAlpha *= 0.55;
        if (im && im.complete && im.naturalWidth) {
            cx.drawImage(im, l, y, w, h);
        } else {
            cx.fillStyle = '#3498db'; cx.fillRect(l, y, w, h);
        }
        cx.restore();

        if (p.lanternOn) {
            const glowX = l + w / 2, glowY = y + h * 0.4;
            const grad = cx.createRadialGradient(glowX, glowY, 5, glowX, glowY, 80);
            grad.addColorStop(0, 'rgba(255,255,200,0.7)');
            grad.addColorStop(1, 'rgba(255,255,200,0)');
            cx.fillStyle = grad;
            cx.fillRect(glowX - 80, glowY - 80, 160, 160);
        }

        const mx = l + w / 2, mid = Math.min(W - 1, Math.max(0, mx | 0));
        if (pd < 22 && Z[mid >> 1] >= pd) {
            const ty = Math.max(34, y - 6), bw = Math.max(44, Math.min(90, w));
            const frac = Math.max(0, Math.min(1, (p.hp || 0) / (p.maxHp || 100)));
            cx.save();
            cx.textAlign = 'center'; cx.font = 'bold 14px sans-serif';
            cx.fillStyle = 'rgba(0,0,0,.7)'; cx.fillRect(mx - bw / 2, ty - 4, bw, 6);
            cx.fillStyle = frac > 0.5 ? '#2ecc71' : (frac > 0.25 ? '#f1c40f' : '#e74c3c');
            cx.fillRect(mx - bw / 2, ty - 4, bw * frac, 6);
            cx.lineWidth = 3; cx.strokeStyle = '#000'; cx.strokeText(p.name, mx, ty - 9);
            cx.fillStyle = '#fff'; cx.fillText(p.name, mx, ty - 9);
            cx.restore();
        }
    });
}

// ========== LOOP ==========
function hsLoop(timestamp) {
    if (!HS.on) return;
    let dt = Math.min(.05, (timestamp - HS.t) / 1000 || 0);
    HS.t = timestamp;
    try { updateHS(dt); } catch (err) { console.error('HS update error:', err); }
    try { renderHS(); } catch (err) { console.error('HS render error:', err); }
    if (HS.on) requestAnimationFrame(hsLoop);
}

// ========== MENU / ARSENAL ==========
window.openAscunsMenu = function() {
    window.currentMode = 'HIDE_SEEK';
    stopHSMusic();
    hideAllHSScreens();
    $('sh-arsenal').classList.remove('hidden');
    const arsenalButtons = document.querySelectorAll('#sh-arsenal button');
    arsenalButtons.forEach(btn => {
        if (btn.textContent.includes('Survival Shooter') || btn.textContent.includes('Multiplayer (FFA)')) {
            btn.style.display = 'none';
        }
    });
    buildHSArsenalUI();
};

window.startHideAndSeekMode = function() {
    if (typeof window.openAscunsMenu === 'function') window.openAscunsMenu();
    else console.error('openAscunsMenu lipsește!');
};

function hideAllHSScreens() {
    ['main-menu', 'classic-menu', 'tetris-menu', 'sh-arsenal', 'sh-lose', 'sh-win', 'auth-panel', 'mp-chat-container', 'lose-screen', 'win-screen'].forEach(id => {
        const el = $(id); if (el) el.classList.add('hidden');
    });
}

function stopHSMusic() {
    if (sndHorizon) { sndHorizon.pause(); sndHorizon.currentTime = 0; }
    if (sndWin) { sndWin.pause(); sndWin.currentTime = 0; }
    if (sndGulagLose) { sndGulagLose.pause(); sndGulagLose.currentTime = 0; }
    if (sndGulagWin) { sndGulagWin.pause(); sndGulagWin.currentTime = 0; }
    if (sndAstroLaugh) { sndAstroLaugh.pause(); sndAstroLaugh.currentTime = 0; }
    if (typeof window.stopMenuMusic === 'function') window.stopMenuMusic();
    const menuAudio = document.getElementById('menu-music');
    if (menuAudio) { try { menuAudio.pause(); menuAudio.currentTime = 0; } catch(e) {} }
}

function buildHSArsenalUI() {
    const skinCardsDiv = $('sh-skin-cards');
    const weaponCardsDiv = $('sh-weapon-cards');
    const infoDiv = $('sh-side-info');
    if (!skinCardsDiv || !weaponCardsDiv || !infoDiv) return;

    const header = document.querySelector('#sh-arsenal h1');
    if (header) header.textContent = 'ARSENAL & SKINURI HIDE AND SEEK';

    if (!isSkinUnlocked(HS.skin)) HS.skin = 'hetes';

    skinCardsDiv.innerHTML = '';
    Object.keys(SKINS_DEF).forEach(sKey => {
        let s = SKINS_DEF[sKey];
        let unlocked = isSkinUnlocked(sKey);
        let card = document.createElement('div');
        card.className = `sh-card ${HS.skin === sKey ? 'selected' : ''} ${unlocked ? '' : 'locked'}`;
        card.style.cssText = "width: 120px; height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box; padding: 5px;";
        card.innerHTML = `<img src="${s.front}.png" style="width:50px; height:65px; object-fit:contain; margin-bottom:5px;"><div style="font-weight:bold; font-size:11px; text-align:center; line-height:1.1;">${s.name}</div>`;
        card.onclick = () => {
            if (!unlocked) { alert("Skin blocat! Cerință: " + s.req); return; }
            HS.skin = sKey;
            let maxW = getMaxWeapons(sKey);
            if (HS.weapons.length > maxW) HS.weapons = HS.weapons.slice(0, maxW);
            buildHSArsenalUI();
        };
        skinCardsDiv.appendChild(card);
    });

    let currentSkinObj = SKINS_DEF[HS.skin];
    let startLivesText = currentSkinObj.startLives ? `<p style="font-size:11px; color:#ff6600;"><strong>❤️ Vieți la start:</strong> ${currentSkinObj.startLives}</p>` : '';
    infoDiv.innerHTML = `
        <h3 style="color:#ffcc00; margin-top:0;">${currentSkinObj.name}</h3>
        <p style="font-size:12px; color:#ddd;"><strong>Abilitate:</strong> ${currentSkinObj.desc}</p>
        ${startLivesText}
        <p style="font-size:11px; color:#aaa;"><strong>Cerință:</strong> ${currentSkinObj.req}</p>
        <hr style="border:0; border-top:1px solid #444;">
        <p style="font-size:11px; color:#ffcc00;">Arme echipate: ${HS.weapons.length} / ${getMaxWeapons(HS.skin)}</p>
        <hr style="border:0; border-top:1px solid #444;">
        <div style="margin-top:10px;">
            <button class="btn" style="background:#e74c3c;font-size:14px;padding:10px;width:100%;margin-bottom:10px;" onclick="window.startHSSingle()">🎮 Hide and Seek Singleplayer</button>
            <button class="btn" style="background:#3498db;font-size:14px;padding:10px;width:100%;margin-bottom:10px;" onclick="window.startHSMulti()">🌐 Hide and Seek Multiplayer</button>
        </div>
    `;

    weaponCardsDiv.innerHTML = '';
    Object.keys(WEAPONS_DEF).forEach(wKey => {
        let w = WEAPONS_DEF[wKey];
        let wUnlocked = isWeaponUnlocked(wKey);
        let equipped = HS.weapons.includes(wKey);
        let card = document.createElement('div');
        card.className = `sh-card ${equipped ? 'selected' : ''} ${wUnlocked ? '' : 'locked'}`;
        card.innerHTML = `<img src="${w.img}.png" style="width:65px; height:40px; object-fit:contain;"><div style="font-weight:bold; font-size:10px;">${w.name}</div><div style="font-size:9px; color:${wUnlocked ? '#2ecc71':'#e74c3c'}">${w.reqKills === 0 ? 'Gratis' : w.reqKills + ' kill-uri'}</div>`;
        card.onclick = () => {
            if (!wUnlocked) { alert(`Armă blocată! Necesită ${w.reqKills} victime.`); return; }
            if (equipped) {
                if (HS.weapons.length > 1) HS.weapons = HS.weapons.filter(x => x !== wKey);
            } else {
                if (HS.weapons.length < getMaxWeapons(HS.skin)) HS.weapons.push(wKey);
            }
            buildHSArsenalUI();
        };
        weaponCardsDiv.appendChild(card);
    });
}

window.startHSSingle = function() {
    if (HS.skin && !isSkinUnlocked(HS.skin)) HS.skin = 'hetes';
    HS.weapons = HS.weapons.filter(w => isWeaponUnlocked(w));
    if (HS.weapons.length === 0) HS.weapons = ['mak'];
    mpLeave();
    HS.mode = 'single';
    HS.role = 'hider';
    window.currentMode = 'HIDE_SEEK';
    hideAllHSScreens();
    stopHSMusic();
    if (typeof window.stopMenuMusic === 'function') window.stopMenuMusic();
    const menuAudio = document.getElementById('menu-music');
    if (menuAudio) { menuAudio.pause(); menuAudio.currentTime = 0; }
    HS.on = true;
    hsInitSingle();
    cv.classList.remove('hidden');
    cv.style.display = 'block';
    cv.requestPointerLock && cv.requestPointerLock();
    HS.t = performance.now();
    requestAnimationFrame(hsLoop);
};

window.startHSMulti = function() {
    if (!mpOk()) { alert('Multiplayer necesită conexiunea la server (Firebase).'); return; }
    if (HS.skin && !isSkinUnlocked(HS.skin)) HS.skin = 'hetes';
    HS.weapons = HS.weapons.filter(w => isWeaponUnlocked(w));
    if (HS.weapons.length === 0) HS.weapons = ['mak'];
    HS.mode = 'multi';
    HS.role = 'hider';
    window.currentMode = 'HIDE_SEEK';
    hideAllHSScreens();
    stopHSMusic();
    if (typeof window.stopMenuMusic === 'function') window.stopMenuMusic();
    const menuAudio = document.getElementById('menu-music');
    if (menuAudio) { menuAudio.pause(); menuAudio.currentTime = 0; }
    HS.on = true;
    HS.w = HS.weapons.slice();
    HS.cur = 0;
    HS.equipped = HS.w.length;
    HS.mag = {}; HS.ammo = {};
    HS.w.forEach(wId => {
        HS.mag[wId] = WEAPONS_DEF[wId].mag;
        HS.ammo[wId] = WEAPONS_DEF[wId].maxAmmo;
    });
    HS.maxHp = 100;
    HS.hp = 100;
    HS.extraLives = getStartLives(HS.skin);
    HS.kills = 0;
    HS.generatorsCompleted = 0;
    HS.lanternOn = false;
    HS.lanternTimer = 0;
    HS.isDead = false;
    HS.spectatorTarget = null;
    HS.playerIsSeeker = false;
    HS.frozenTimer = 0;
    cv.classList.remove('hidden');
    cv.style.display = 'block';
    cv.requestPointerLock && cv.requestPointerLock();
    HS.t = performance.now();
    hsInitMulti();
    if (sndHorizon) { sndHorizon.currentTime = 0; sndHorizon.play().catch(() => {}); }
    requestAnimationFrame(hsLoop);
};

window.hsToMenu = function() {
    HS.on = false;
    mpLeave();
    window.currentMode = 'NONE';
    stopHSMusic();
    try { document.exitPointerLock && document.exitPointerLock(); } catch (e) {}
    hideAllHSScreens();
    const mm = $('main-menu'); if (mm) mm.classList.remove('hidden');
    const ap = $('auth-panel'); if (ap) { ap.classList.remove('hidden'); ap.style.display = 'block'; }
    if (cv) { cv.classList.add('hidden'); cv.style.display = 'none'; }
    if (typeof window.playMenuMusic === 'function') window.playMenuMusic();
    setTimeout(() => location.reload(), 500);
};

// ========== INPUT ==========
cv.addEventListener('mousemove', e => {
    if (!HS.on) return;
    if (HS.jumpscareActive) return;
    if (document.pointerLockElement === cv) {
        HS.a += e.movementX * 0.0028;
    }
});

cv.addEventListener('mousedown', () => {
    if (!HS.on) return;
    if (HS.jumpscareActive) return;
    if (MP && MP.chatOpen) mpCloseChat(false);
    if (MP && (MP.ended || !MP.ready)) return;
    HS.fire = 1;
    if (document.pointerLockElement !== cv) cv.requestPointerLock && cv.requestPointerLock();
    if (HS.role === 'hider' && HS.equipped >= HS.w.length) {
        toggleLantern();
    }
});

window.addEventListener('mouseup', () => { HS.fire = 0; });

function toggleLantern() {
    if (HS.lanternOn) {
        HS.lanternTimer = 5;
        addKillFeed('Lanternă resetată (5s)');
    } else {
        HS.lanternOn = true;
        HS.lanternTimer = 5;
        addKillFeed('Lanternă aprinsă! (5s)');
    }
}

window.addEventListener('keydown', e => {
    if (!HS.on) return;
    if (HS.jumpscareActive) return;
    let k = e.key.toLowerCase();
    const mpm = HS.mode === 'multi' && MP;
    if (mpm) {
        if (MP.chatOpen) return;
        if (e.key === '/') { e.preventDefault(); mpOpenChat(); return; }
        if (!MP.ready || MP.ended) return;
    }

    if (k === 'r' && HS.role === 'hider') {
        const id = HS.w[HS.cur];
        const w = WEAPONS_DEF[id];
        if (w && HS.mag[id] < w.mag && HS.ammo[id] > 0) {
            let needed = w.mag - HS.mag[id];
            let transfer = Math.min(needed, HS.ammo[id]);
            HS.ammo[id] -= transfer;
            HS.mag[id] += transfer;
            sndReload.currentTime = 0; sndReload.play().catch(() => {});
            addKillFeed(`Reîncărcat ${w.name}`);
        }
    }

    if (k === 'g' && HS.role === 'hider') triggerHSAbility();

    if (k === 't' || k === ' ') {
        if (HS.role === 'hider' && HS.equipped >= HS.w.length) toggleLantern();
    }

    if (k === 'l' && HS.skin === 'anti-furry-hetes' && HS.role === 'hider') {
        triggerAntiFurryLaser();
    }

    if (HS.role === 'hider') {
        for (let i = 0; i < 9; i++) {
            if (e.key === '' + (i + 1)) {
                if (i === 0) {
                    HS.equipped = HS.w.length;
                } else if (i - 1 < HS.w.length) {
                    HS.cur = i - 1;
                    HS.equipped = i - 1;
                }
            }
        }
    }
});

function triggerHSAbility() {
    if (HS.role === 'seeker') return;
    if (HS.abilityCd > 0) return;

    if (HS.skin === 'nazbol') {
        HS.abilityCd = 20;
        HS.nazbolSmokeTimer = 5;
        HS.nazbolInvincible = true;
        sndJump.currentTime = 0; sndJump.play().catch(() => {});
        addKillFeed('Fum roșu Nazbol activat! (Invulnerabilitate 5s)');
        return;
    }

    if (HS.skin === 'anti-furry-hetes') {
        HS.abilityCd = 45;
        HS.rage = true;
        HS.rageTimer = 20;
        HS.hp = Math.max(HS.hp, 200);
        HS.maxHp = 200;
        sndJump.currentTime = 0; sndJump.play().catch(() => {});
        addKillFeed('Rage Mode activat (20s, viteză x2)!');
        return;
    }

    if (['soldat-sovietic', 'soldat-rus-modern', 'cernobil-stalker', 'hetes'].includes(HS.skin)) {
        HS.abilityCd = HS.skin === 'hetes' ? 10 : 15;
        if (HS.seekerNPC && !HS.seekerNPC.dead) {
            const dist = Math.hypot(HS.seekerNPC.x - HS.x, HS.seekerNPC.y - HS.y);
            if (dist <= 10) {
                HS.seekerNPC.hp -= 100;
                HS.seekerNPC.frozenTimer = 2;
                // ✅ FIX: abilitate player omoară seekerul → boss kill
                if (HS.seekerNPC.hp <= 0 && !HS.seekerNPC.dead) {
                    HS.seekerNPC.dead = true;
                    if (HS.on) triggerSingleWin(true);
                }
            }
        }
        HS.npcs.forEach(n => {
            if (n.dead) return;
            const dist = Math.hypot(n.x - HS.x, n.y - HS.y);
            if (dist <= 10) {
                n.hp -= 100;
                if (n.hp <= 0) { n.dead = true; dropNPCItems(n); }
            }
        });
        sndExplosion.currentTime = 0; sndExplosion.play().catch(() => {});
        addKillFeed(HS.skin === 'hetes' ? 'Lasere activate! (100 dmg + freeze 2s)' : 'Grenadă aruncată! (100 dmg + freeze 2s)');
        return;
    }

    HS.abilityCd = 10;
    if (HS.skin === 'gopnik') {
        HS.hp = Math.min(HS.maxHp, HS.hp + 50);
        sndJump.currentTime = 0; sndJump.play().catch(() => {});
        addKillFeed('Băut Vodka (+50 HP)!');
    } else if (HS.skin === 'proletar') {
        HS.hp = Math.min(HS.maxHp, HS.hp + 25);
        HS.proletarWeaponProgress++;
        sndJump.currentTime = 0; sndJump.play().catch(() => {});
        if (HS.proletarWeaponProgress >= 5) {
            HS.proletarWeaponProgress = 0;
            let allWKeys = Object.keys(WEAPONS_DEF);
            let newW = allWKeys.find(w => !HS.w.includes(w));
            if (newW && HS.w.length < 5) {
                HS.w.push(newW);
                HS.mag[newW] = WEAPONS_DEF[newW].mag;
                HS.ammo[newW] = WEAPONS_DEF[newW].maxAmmo;
                addKillFeed(`Proletar a creat o armă nouă: ${WEAPONS_DEF[newW].name}!`);
            }
        } else {
            addKillFeed(`Proletar regenerare HP (+25) și progres armă (${HS.proletarWeaponProgress}/5)!`);
        }
    } else if (HS.skin === 'catalin') {
        HS.hp = Math.min(HS.maxHp, HS.hp + 50);
        addKillFeed('Aura regenerare (+50 HP)!');
    }
}

function triggerAntiFurryLaser() {
    let currentLaserCd = HS.rage ? 3 : 10;
    if (HS.laserCd > 0) return;
    HS.laserCd = currentLaserCd;
    if (HS.seekerNPC && !HS.seekerNPC.dead) {
        const d = Math.hypot(HS.seekerNPC.x - HS.x, HS.seekerNPC.y - HS.y);
        if (d <= 12) {
            HS.seekerNPC.hp -= 100;
            HS.seekerNPC.frozenTimer = 2;
            // ✅ FIX: laser omoară seekerul → boss kill
            if (HS.seekerNPC.hp <= 0 && !HS.seekerNPC.dead) {
                HS.seekerNPC.dead = true;
                if (HS.on) triggerSingleWin(true);
            }
        }
    }
    HS.npcs.forEach(n => {
        if (n.dead) return;
        const d = Math.hypot(n.x - HS.x, n.y - HS.y);
        if (d <= 12) {
            n.hp -= 100;
            if (n.hp <= 0) { n.dead = true; dropNPCItems(n); }
        }
    });
    sndExplosion.currentTime = 0; sndExplosion.play().catch(() => {});
    addKillFeed(`Laser Anti-Furry tras! (100 dmg + freeze 2s, CD: ${currentLaserCd}s)`);
}

// ========== UTILITY ==========
window.addEventListener('beforeunload', () => {
    if (!MP) return;
    try { mpCredit(); window.fsDeleteDoc(window.fsDoc(window.db, 'hs_players', MP.id)); } catch (e) {}
});

window.hsMenu = window.openAscunsMenu;

})();