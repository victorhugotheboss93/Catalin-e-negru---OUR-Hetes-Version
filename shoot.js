// shoot.js - Modul Shooter (Survival Shooter & Stalingrad Mechanics - V10)
(() => {
const W = 1280, H = 720, N = 32, FOV = 1.15, C = 640;
const $ = id => document.getElementById(id);
const cv = $('gameCanvas');
if (!cv) return;
const cx = cv.getContext('2d');

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
    'anti-furry-hetes-front', 'anti-furry-hetes-back'
];
imgNames.forEach(n => {
    IMG[n] = new Image();
    IMG[n].src = n + '.png';
});

const sndGun = new Audio('gun.mp3');
const sndReload = new Audio('reload.mp3');
const sndExplosion = new Audio('st explosion sound6.mp3');
const sndJump = new Audio('clasic-jump.mp3');
const sndWin = new Audio('gimn-sssr.mp3');
const sndLose = new Audio('tyomnaya-noch.mp3');
const sndStalingradBgm = window.sndStalingradBgm || new Audio('svoina.mp3');
sndStalingradBgm.loop = true;

const GRS_PLAYLIST = [
    { name: "Священная война - Sp00n .exe - 8 bit remix", src: "svoina.mp3" },
    { name: "Наш гимн - Hard Bass School", src: "nashgimn.mp3" },
    { name: "Триполоски - Davay", src: "tripoloski.mp3" },
    { name: "Cheeki Breeki Hardbass Anthem - apartje", src: "cheekibreeki.mp3" },
    { name: "KalinkaHardbass Remix - DJ Bonebreaker", src: "kalinkahardbass.mp3" }
];
let gopnikAudio = null;
let killFeedMessages = [];

function addKillFeed(text) {
    killFeedMessages.push({ text: text, time: performance.now() + 4000 });
    if (killFeedMessages.length > 5) killFeedMessages.shift();
}

const WEAPONS_DEF = {
    mak:   { name: 'Makarov', dmg: 26, rate: 0.33, mag: 8, maxAmmo: 40, give: 16, reqKills: 0, img: 'makarov' },
    mos:   { name: 'Mosin-Nagant', dmg: 100, rate: 1.1, mag: 5, maxAmmo: 25, give: 10, reqKills: 0, img: 'mosin' },
    ppsh:  { name: 'PPSh-41', dmg: 14, rate: 0.075, mag: 71, maxAmmo: 142, give: 71, reqKills: 50, img: 'ppsh' },
    svt:   { name: 'SVT-40', dmg: 45, rate: 0.25, mag: 10, maxAmmo: 50, give: 20, reqKills: 150, img: 'svt40' },
    rpg:   { name: 'RPG-7', dmg: 150, rate: 1.8, mag: 1, maxAmmo: 5, give: 2, splash: 2.5, reqKills: 300, img: 'rpg7' },
    ak:    { name: 'AK-47', dmg: 30, rate: 0.1, mag: 30, maxAmmo: 120, give: 60, reqKills: 500, img: 'ak47' },
    rpk16: { name: 'RPK-16', dmg: 28, rate: 0.09, mag: 45, maxAmmo: 180, give: 90, reqKills: 650, img: 'rpk16' },
    pkm:   { name: 'PKM', dmg: 40, rate: 0.12, mag: 100, maxAmmo: 200, give: 100, reqKills: 800, img: 'pkm' },
    ak12:  { name: 'AK-12', dmg: 34, rate: 0.08, mag: 30, maxAmmo: 150, give: 60, reqKills: 1000, img: 'ak12' }
};

const SKINS_DEF = {
    hetes: { name: 'Hetes', front: 'hetes-front', back: 'hetes-back', desc: 'Lasere din ochi roșii (max 10m pe AI)', req: 'Disponibil din oficiu', abilityKey: '[G]' },
    catalin: { name: 'Catalin', front: 'catalin-front', back: 'catalin-back', desc: 'Aura luminoasă, rezistență la gloanțe și o viață în plus', req: 'Câștigi modul Aura', abilityKey: '[G]' },
    proletar: { name: 'Proletar', front: 'proletar-front', back: 'proletar-back', desc: 'Echipează 2 arme la start, creează armă nouă la fiecare 5 activări', req: 'Câștigi modul sovietic', maxWeapons: 2, dynamicWeapons: 5, abilityKey: '[G]' },
    gopnik: { name: 'Gopnik', front: 'gopnik-front', back: 'gopnik-back', desc: 'Viteză sporită permanent, Player muzical (M, K, L) și Vodka (+50 HP)', req: 'Câștigi modul sovietic și survival', abilityKey: '[G]/[K]' },
    nazbol: { name: 'Nazbol', front: 'nazbol-front', back: 'nazbol-back', desc: 'Ecran roșu și fum vizibil, viteză mare și invulnerabilitate 5s (CD 20s)', req: 'Câștigi modul sovietic, survival și 100 de victime', abilityKey: '[G]/[E]' },
    'soldat-sovietic': { name: 'Soldat Sovietic', front: 'soldat-sovietic-front', back: 'soldat-sovietic-back', desc: 'Până la 5 arme & grenade devastation', req: 'Câștigi 3 sovietic, 3 survival și 500 de victime', maxWeapons: 5, abilityKey: '[G]/[F]' },
    'cernobil-stalker': { name: 'Cernobîl Stalker', front: 'cernobil-stalker-front', back: 'cernobil-stalker-back', desc: 'Gloanțe toxice pasive 15m (daune x2), daune toxice de la grenade', req: 'Câștigi 3 sovietic, 5 survival și 1000 de victime', maxWeapons: 5, abilityKey: '[G]' },
    'soldat-rus-modern': { name: 'Soldat Rus Modern', front: 'soldat-rus-modern-front', back: 'soldat-rus-modern-back', desc: 'Viteză mărită permanent, 125 HP, 5 arme', req: 'Câștigi 5 sovietic, 10 survival și 1500 de victime', maxWeapons: 5, abilityKey: '[G]' },
    'anti-furry-hetes': { name: 'Real Man Anti-Furry Hetes', front: 'anti-furry-hetes-front', back: 'anti-furry-hetes-back', desc: 'Viteză mare permanent, Rage Mode 20s, Laser [L] (CD 3s în Rage)', req: 'Câștigi 5 sovietic, 15 survival și 2500 de victime', maxWeapons: '5' }
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

let SG = {
    on: false,
    mode: 'stalingrad',
    skin: 'hetes',
    weapons: ['mak', 'mos'],
    x: 10.5, y: 10.5, a: 0,
    hp: 100, maxHp: 100,
    kills: 0,
    en: [],
    w: ['mak'], cur: 0,
    mag: {}, ammo: {},
    cd: 0, kick: 0, flash: 0, hm: 0, bob: 0,
    wave: 0, left: 0, nw: 1, sp: 0,
    katcd: 0, abilityCd: 0, laserCd: 0,
    rage: false, rageTimer: 0, extraLife: 0,
    proletarWeaponProgress: 0,
    nazbolSmokeTimer: 0, nazbolInvincible: false,
    gopnikTrack: 0, gopnikPlaying: false,
    fire: 0,
    ammoBoxes: [
        {x: 8.5, y: 8.5, active: true, respawnTimer: 0},
        {x: 22.5, y: 8.5, active: true, respawnTimer: 0},
        {x: 16.5, y: 22.5, active: true, respawnTimer: 0},
        {x: 8.5, y: 22.5, active: true, respawnTimer: 0}
    ],
    t: performance.now()
};

let loseTimer = null;

// =====================================================================
// ===================== MULTIPLAYER (FFA, Firestore) ==================
// =====================================================================
const MP_ROUND_MS = 5 * 60 * 1000;
const MP_TICK_MS = 250;
const MP_HEARTBEAT_MS = 3000;
const MP_TIMEOUT_MS = 12000;
const MP_SPAWNS = [
    [2.5, 2.5], [16.5, 2.5], [29.5, 2.5], [2.5, 14.5], [29.5, 14.5],
    [8.5, 14.5], [23.5, 14.5], [16.5, 10.5], [2.5, 29.5], [16.5, 29.5],
    [29.5, 29.5], [12.5, 24.5], [20.5, 24.5], [12.5, 6.5], [20.5, 6.5]
];
const MP_DMG = {
    ppsh: 1.2, ak: 2, rpk16: 1.8, pkm: 2.5, ak12: 2,
    mak: 6, mos: 25, svt: 7, rpg: 35
};

let MP = null;

const mpOk = () => !!(window.db && window.fsDoc && window.fsSetDoc && window.fsCollection && window.fsOnSnapshot && window.fsDeleteDoc);
const mpActive = p => !!(MP && MP.round && p.round === MP.round.id && (performance.now() - p._seen) < MP_TIMEOUT_MS);
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
        tuned: null, tunedTrack: -1, tunedAt: 0,
        frozen: null, freezeT: null, ui: null, lastShotSnd: 0
    };
    mpEnsureUI();
    const chatBox = $('mp-chat-messages'); if (chatBox) chatBox.innerHTML = '';
    try {
        MP.unsubs.push(window.fsOnSnapshot(window.fsDoc(window.db, 'mp_rooms', 'main'), mpOnRoom, mpFail));
        MP.unsubs.push(window.fsOnSnapshot(window.fsCollection(window.db, 'mp_players'), mpOnPlayers, mpFail));
        MP.unsubs.push(window.fsOnSnapshot(window.fsCollection(window.db, 'mp_chat'), mpOnChat, () => {}));
    } catch (e) { mpFail(e); return; }
    MP.tick = setInterval(mpTick, MP_TICK_MS);
    MP.connTimeout = setTimeout(() => { if (MP && !MP.ready) mpFail({ code: 'timeout' }); }, 10000);
}

function mpFail(err) {
    if (!MP || MP.failed) return;
    MP.failed = true;
    const code = (err && (err.code || err.message)) || 'necunoscut';
    alert('Nu m-am putut conecta la multiplayer (' + code + ').\nVerifică conexiunea la internet și regulile Firestore pentru colecțiile mp_rooms, mp_players și mp_chat.');
    mpToMenu();
}

function mpAdoptRound(d) { MP.round = { id: d.id, start: d.start, joinedAt: Date.now() }; }
function mpCreateRound() {
    const r = { id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), start: Date.now() };
    MP.round = { id: r.id, start: r.start, joinedAt: Date.now() };
    MP.lastRoom = r;
    try { window.fsSetDoc(window.fsDoc(window.db, 'mp_rooms', 'main'), r).catch(mpFail); } catch (e) { mpFail(e); }
}

function mpOnRoom(snap) {
    if (!MP || MP.failed) return;
    if (!MP.ready && snap.metadata && snap.metadata.fromCache) return;
    const d = snap.exists() ? snap.data() : null;
    const now = Date.now();
    if (!MP.ready) {
        MP.lastRoom = d;
        if (d && d.start + MP_ROUND_MS > now) mpAdoptRound(d); else mpCreateRound();
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
}

function mpBegin() {
    MP.ended = false; MP.credited = false; MP.deaths = 0; SG.kills = 0;
    mpSpawn(true);
    mpSend(true);
    addKillFeed('Runda a început! Ține-te de spawn-uri și vânează jucători.');
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
    SG.x = s[0]; SG.y = s[1];
    SG.a = Math.atan2(16 - s[1], 16 - s[0]);
    SG.hp = SG.maxHp;
    SG.cd = 0.3;
    SG.w.forEach(id => { SG.mag[id] = WEAPONS_DEF[id].mag; SG.ammo[id] = WEAPONS_DEF[id].maxAmmo; });
    MP.invUntil = Date.now() + 2500;
}

function mpSend(force) {
    if (!MP || !MP.round) return;
    const now = Date.now();
    const st = {
        name: MP.name, skin: SG.skin,
        x: Math.round(SG.x * 100) / 100, y: Math.round(SG.y * 100) / 100, a: Math.round(SG.a * 100) / 100,
        hp: Math.max(0, Math.round(SG.hp)), maxHp: SG.maxHp,
        kills: SG.kills, deaths: MP.deaths, round: MP.round.id,
        dmgTo: MP.dmgTo, deathSeq: MP.deathSeq, killedBy: MP.killedBy, killedByName: MP.killedByName,
        shots: MP.shots,
        track: (SG.skin === 'gopnik' && SG.gopnikPlaying) ? SG.gopnikTrack : -1,
        trackAt: SG.gopnikTrackAt || 0,
        inv: (SG.nazbolInvincible || SG.nazbolSmokeTimer > 0 || now < MP.invUntil) ? 1 : 0
    };
    const key = JSON.stringify(st);
    if (!force && key === MP.lastSent && now - MP.lastSend < MP_HEARTBEAT_MS) return;
    MP.lastSent = key; MP.lastSend = now;
    st.t = now;
    try { window.fsSetDoc(window.fsDoc(window.db, 'mp_players', MP.id), st).catch(() => {}); } catch (e) {}
}

function mpTick() {
    if (!MP || !MP.ready || MP.failed || !SG.on) return;
    const now = Date.now();
    if (MP.round && !MP.ended && now >= MP.round.start + MP_ROUND_MS) mpEndRound();
    const pn = performance.now();
    for (const id in MP.players) {
        if (pn - MP.players[id]._seen > MP_TIMEOUT_MS) delete MP.players[id];
    }
    if (MP.tuned && !MP.players[MP.tuned]) mpUntune(true);
    mpSend(false);
    mpChatRefresh();
}

function mpOnPlayers(snap) {
    if (!MP || MP.failed) return;
    snap.docChanges().forEach(ch => {
        const id = ch.doc.id;
        if (id === MP.id) return;
        if (ch.type === 'removed') {
            delete MP.players[id];
            if (MP.tuned === id) mpUntune(true);
            return;
        }
        mpApplyRemote(id, ch.doc.data());
    });
}

function mpApplyRemote(id, d) {
    if (!d) return;
    if (Date.now() - (d.t || 0) > 60000) {
        try { window.fsDeleteDoc(window.fsDoc(window.db, 'mp_players', id)).catch(() => {}); } catch (e) {}
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
    p.track = (typeof d.track === 'number') ? d.track : -1; p.trackAt = d.trackAt || 0;
    p.tx = d.x; p.ty = d.y; p.ta = d.a;
    if (Math.hypot(p.tx - p.x, p.ty - p.y) > 3) { p.x = p.tx; p.y = p.ty; }

    const v = (d.dmgTo && d.dmgTo[MP.id]) || 0;
    if (v < p.lastDmg) p.lastDmg = v;
    else if (v > p.lastDmg) { const delta = v - p.lastDmg; p.lastDmg = v; mpTakeDamage(delta, id, p.name); }

    const ds = d.deathSeq || 0;
    if (ds > p.lastDeathSeq) {
        p.lastDeathSeq = ds;
        if (MP.round && d.round === MP.round.id && !MP.ended) {
            if (d.killedBy === MP.id) { SG.kills++; addKillFeed(`Ai eliminat ${p.name}!`); }
            else if (d.killedByName) addKillFeed(`${d.killedByName} l-a eliminat pe ${p.name}`);
        }
    }

    const sh = d.shots || 0;
    if (sh > p.lastShots) { p.lastShots = sh; mpRemoteShot(p); } else if (sh < p.lastShots) p.lastShots = sh;

    if (MP.tuned === id) mpSyncTuned(false);
}

function mpRemoteShot(p) {
    const now = performance.now();
    if (now - MP.lastShotSnd < 90) return;
    const d = Math.hypot(p.x - SG.x, p.y - SG.y);
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
    SG.hm = 0.12;
}

function mpShoot(w, id, wd) {
    MP.shots++;
    const baseDmg = MP_DMG[id] != null ? MP_DMG[id] : 3;
    let dmg = baseDmg;
    
    if (SG.skin === 'cernobil-stalker') {
        dmg *= 2;
    }

    let best = null, bd = 1e9;
    mpTargets().forEach(p => {
        const dx = p.x - SG.x, dy = p.y - SG.y, d = Math.hypot(dx, dy);
        let df = Math.atan2(dy, dx) - SG.a; df = Math.atan2(Math.sin(df), Math.cos(df));
        if (Math.abs(df) * d < 0.38 && d < bd && d < wd + 0.3) { best = p; bd = d; }
    });
    if (w.splash) {
        const dist = best ? bd : Math.max(0, wd - 0.2);
        const ex = SG.x + Math.cos(SG.a) * dist, ey = SG.y + Math.sin(SG.a) * dist;
        mpTargets().forEach(p => { 
            let distToExplosion = Math.hypot(p.x - ex, p.y - ey);
            if (distToExplosion < w.splash) {
                mpDealDamage(p, dmg); 
            } else if (SG.skin === 'cernobil-stalker' && distToExplosion <= w.splash + 3.0) {
                mpDealDamage(p, 15);
            }
        });
        sndExplosion.currentTime = 0; sndExplosion.play().catch(() => {});
    } else if (best) {
        mpDealDamage(best, dmg);
        if (SG.skin === 'cernobil-stalker' && bd <= 15) {
            setTimeout(() => { if (best && best.hp > 0) mpDealDamage(best, 15); }, 300);
            setTimeout(() => { if (best && best.hp > 0) mpDealDamage(best, 15); }, 600);
        }
    }
}

function mpAreaDamage(radius, dmg) {
    if (!MP || !MP.ready || MP.ended) return;
    mpTargets().forEach(p => {
        let dToP = Math.hypot(p.x - SG.x, p.y - SG.y);
        if (dToP <= radius && los(SG.x, SG.y, p.x, p.y)) {
            mpDealDamage(p, dmg);
        } else if (SG.skin === 'cernobil-stalker' && dToP <= radius + 3.0 && los(SG.x, SG.y, p.x, p.y)) {
            mpDealDamage(p, 15);
        }
    });
}

function mpTakeDamage(amount, fromId, fromName) {
    if (!MP || MP.ended || !SG.on) return;
    if (SG.nazbolInvincible || SG.nazbolSmokeTimer > 0 || Date.now() < MP.invUntil) return;
    SG.hp -= amount;
    SG.flash = Math.max(SG.flash, Math.min(0.3, 0.08 + amount * 0.015));
    MP.lastHitBy = fromId; MP.lastHitName = fromName;
    if (SG.hp <= 0) {
        if (SG.extraLife > 0) {
            SG.extraLife = 0; SG.hp = SG.maxHp; addKillFeed('Viață suplimentară folosită!');
            return;
        }
        mpDie();
    }
}

function mpDie() {
    MP.deaths++; MP.deathSeq++;
    MP.killedBy = MP.lastHitBy; MP.killedByName = MP.lastHitName;
    addKillFeed(`${MP.lastHitName || 'Cineva'} te-a eliminat!`);
    mpSpawn(false);
    SG.flash = 0.6;
    mpSend(true);
}

function mpBuildBoard() {
    const rid = MP.round.id;
    const rows = [{ name: MP.name, kills: SG.kills, deaths: MP.deaths, me: true }];
    Object.values(MP.players).forEach(p => {
        if (p.round === rid) rows.push({ name: p.name, kills: p.kills || 0, deaths: p.deaths || 0, me: false });
    });
    rows.sort((a, b) => (b.kills - a.kills) || (a.deaths - b.deaths));
    return rows;
}

function mpCredit() {
    if (!MP || MP.credited || !MP.round) return;
    MP.credited = true;
    const rows = mpBuildBoard();
    const k = SG.kills;
    const maxOther = rows.filter(r => !r.me).reduce((m, r) => Math.max(m, r.kills), 0);
    const winner = MP.ended && rows.length > 1 && k > 0 && k >= maxOther;
    const gain = k * 10 + (winner ? 50 : 0);
    const g = gs();
    g.kills = (g.kills || 0) + k;
    g.score = (g.score || 0) + gain;
    g.survival = g.survival || { kills: 0, wins: 0, completions: 0 };
    g.survival.kills = (g.survival.kills || 0) + k;
    MP.lastGain = gain;
    if (k > 0 || gain > 0) { if (typeof saveStats === 'function') saveStats(); }
}

function mpEndRound() {
    if (!MP || MP.ended) return;
    MP.ended = true;
    SG.fire = 0; window.mobileShooterFire = false;
    mpCloseChat(false);
    try { document.exitPointerLock && document.exitPointerLock(); } catch (e) {}
    mpSend(true);
    MP.frozen = null;
    mpShowBoard();
    clearTimeout(MP.freezeT);
    MP.freezeT = setTimeout(() => {
        if (!MP || !MP.ended) return;
        MP.frozen = mpBuildBoard();
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
    if (d && d.id !== MP.round.id && d.start + MP_ROUND_MS > now) mpAdoptRound(d);
    else mpCreateRound();
    MP.ended = false; MP.credited = false; MP.frozen = null; MP.lastGain = 0;
    MP.deaths = 0; SG.kills = 0;
    mpSpawn(true);
    mpSend(true);
    lockPointer();
    addKillFeed('Runda nouă a început!');
}

function mpShowBoard() {
    mpEnsureUI();
    const ov = MP.ui.board;
    const rows = MP.frozen || mpBuildBoard();
    const medals = ['🥇', '🥈', '🥉'];
    let html = `<div style="font-size:42px;font-weight:bold;color:#ffcc00;margin-bottom:6px;text-shadow:2px 2px #000;">Runda s-a terminat!</div>
        <div style="color:#ddd;margin-bottom:14px;">Clasament victime</div>
        <table style="border-collapse:collapse;min-width:440px;font-size:18px;background:rgba(0,0,0,.55);border-radius:8px;">
        <tr style="color:#aaa;font-size:13px;"><th style="text-align:left;padding:6px 12px;">#</th><th style="text-align:left;padding:6px 12px;">Jucător</th><th style="padding:6px 12px;">Victime</th><th style="padding:6px 12px;">Morți</th></tr>`;
    rows.slice(0, 12).forEach((r, i) => {
        html += `<tr style="${r.me ? 'background:rgba(255,204,0,.25);color:#ffcc00;font-weight:bold;' : ''}">
            <td style="padding:6px 12px;">${medals[i] || (i + 1)}</td>
            <td style="padding:6px 12px;">${mpEsc(r.name)}${r.me ? ' (tu)' : ''}</td>
            <td style="padding:6px 12px;text-align:center;">${r.kills}</td>
            <td style="padding:6px 12px;text-align:center;">${r.deaths}</td></tr>`;
    });
    html += `</table>
        <div style="margin-top:14px;color:#00ffcc;font-weight:bold;min-height:22px;">${MP.credited ? `+${MP.lastGain} puncte adăugate în leaderboard-ul Shooter` : 'Se calculează scorul...'}</div>
        <div style="margin-top:18px;display:flex;gap:14px;">
            <button id="mp-btn-menu" class="btn" style="background:#c0392b;min-width:200px;">Înapoi la meniu</button>
            <button id="mp-btn-cont" class="btn" style="background:#27ae60;min-width:200px;">Continuă jocul</button>
        </div>`;
    ov.innerHTML = html;
    ov.style.display = 'flex';
    ov.querySelector('#mp-btn-menu').onclick = () => mpToMenu();
    ov.querySelector('#mp-btn-cont').onclick = () => mpContinue();
}

function mpHideBoard() {
    if (MP && MP.ui && MP.ui.board) { MP.ui.board.style.display = 'none'; MP.ui.board.innerHTML = ''; }
}

function mpEnsureUI() {
    if (!MP) return;
    if (!MP.ui) {
        const host = $('game-container') || document.body;
        const btn = document.createElement('button');
        btn.id = 'mp-back-btn';
        btn.textContent = '⬅ Înapoi la meniu';
        btn.style.cssText = 'position:absolute;top:10px;left:10px;z-index:140;background:#d11;color:#fff;border:2px solid #fff;border-radius:6px;padding:8px 14px;font-weight:bold;font-size:14px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.6);';
        btn.onclick = () => mpToMenu();
        host.appendChild(btn);

        const board = document.createElement('div');
        board.id = 'mp-board';
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
    SG.fire = 0;
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

function mpTune() {
    if (MP.tuned) { mpUntune(false); return; }
    const g = Object.values(MP.players).find(p => mpActive(p) && p.skin === 'gopnik' && p.track >= 0);
    if (!g) { addKillFeed('Niciun Gopnik nu pune muzică acum.'); return; }
    MP.tuned = g.id; MP.tunedTrack = -1; MP.tunedAt = 0;
    mpSyncTuned(true);
}

function mpSyncTuned(force) {
    const g = MP.players[MP.tuned];
    if (!g || g.skin !== 'gopnik' || g.track < 0 || !GRS_PLAYLIST[g.track]) { mpUntune(true); return; }
    if (!force && MP.tunedTrack === g.track && MP.tunedAt === g.trackAt) return;
    MP.tunedTrack = g.track; MP.tunedAt = g.trackAt;
    SG.gopnikTrack = g.track; SG.gopnikPlaying = true;
    if (sndStalingradBgm) sndStalingradBgm.pause();
    if (gopnikAudio) gopnikAudio.pause();
    const tr = GRS_PLAYLIST[g.track];
    const a = new Audio(tr.src);
    a.loop = true;
    a.addEventListener('loadedmetadata', () => {
        try {
            const el = (Date.now() - g.trackAt) / 1000;
            if (a.duration && el > 0) a.currentTime = el % a.duration;
        } catch (e) {}
    });
    gopnikAudio = a;
    a.play().catch(() => {});
    addKillFeed(`Asculți ce pune ${g.name}: ${tr.name}`);
}

function mpUntune(gone) {
    if (!MP) return;
    MP.tuned = null; MP.tunedTrack = -1;
    if (SG.skin !== 'gopnik') {
        SG.gopnikPlaying = false;
        if (gopnikAudio) { gopnikAudio.pause(); gopnikAudio = null; }
        if (sndStalingradBgm) sndStalingradBgm.play().catch(() => {});
    }
    addKillFeed(gone ? 'Gopnikul a oprit muzica.' : 'Ai oprit muzica Gopnikului.');
}

function mpLeave() {
    if (!MP) return;
    const m = MP;
    try { mpCredit(); } catch (e) {}
    clearInterval(m.tick); clearTimeout(m.freezeT); clearTimeout(m.connTimeout);
    m.unsubs.forEach(u => { try { u(); } catch (e) {} });
    try { window.fsDeleteDoc(window.fsDoc(window.db, 'mp_players', m.id)).catch(() => {}); } catch (e) {}
    const inp = $('mp-chat-input'); if (inp) { inp.blur(); inp.style.display = 'none'; }
    mpRemoveUI();
    MP = null;
}

function mpToMenu() {
    mpLeave();
    SG.on = false;
    stopAllMusic();
    try { document.exitPointerLock && document.exitPointerLock(); } catch (e) {}
    if (cv) { cv.classList.add('hidden'); cv.style.display = 'none'; }
    if (typeof window.backToMain === 'function') window.backToMain(); else window.shBackToMain();
}

window.addEventListener('beforeunload', () => {
    if (!MP) return;
    try { mpCredit(); window.fsDeleteDoc(window.fsDoc(window.db, 'mp_players', MP.id)); } catch (e) {}
});

const gs=()=>{
 window.gameStats = window.gameStats || {};
 const s = window.gameStats.shooter || (window.gameStats.shooter={kills:0,wins:0,score:0,loadout:['mak','mos','ppsh'],skin:'hetes'});
 s.survival = s.survival || { kills: s.kills || 0, wins: s.wins || 0, completions: 0 };
 return s;
};

window.mergeShooterStats = s => {
    const m = gs();
    ['kills','wins','score'].forEach(k => { if (s[k] > m[k]) m[k] = s[k]; });
    if (s.survival) {
        m.survival = m.survival || { kills: 0, wins: 0, completions: 0 };
        m.survival.kills = Math.max(m.survival.kills || 0, s.survival.kills || 0);
        m.survival.wins = Math.max(m.survival.wins || 0, s.survival.wins || 0);
        m.survival.completions = Math.max(m.survival.completions || 0, s.survival.completions || 0);
    }
    if (!s.survival && s.kills) m.survival.kills = Math.max(m.survival.kills, s.kills);
    if (!s.survival && s.wins) m.survival.wins = Math.max(m.survival.wins, s.wins);
    if (s.loadout && !m.kills) m.loadout = s.loadout;
    if (s.skin) m.skin = s.skin;
};

function creditShooterKills() {
    const d = SG.kills - (SG.statKills || 0);
    if (d <= 0) return;
    SG.statKills = SG.kills;
    const g = gs();
    g.kills = (g.kills || 0) + d;
    g.score = (g.score || 0) + d * 50;
    g.survival = g.survival || { kills: 0, wins: 0, completions: 0 };
    g.survival.kills = (g.survival.kills || 0) + d;
    if (typeof saveStats === 'function') saveStats();
}

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
    const rem = Math.max(0, MP.round.start + MP_ROUND_MS - Date.now());
    const m = Math.floor(rem / 60000), s = Math.floor(rem / 1000) % 60;
    cx.fillStyle = 'rgba(0,0,0,.65)'; cx.fillRect(W / 2 - 75, 10, 150, 52);
    cx.strokeStyle = '#ffcc00'; cx.lineWidth = 2; cx.strokeRect(W / 2 - 75, 10, 150, 52);
    cx.fillStyle = rem < 30000 ? '#ff4444' : '#fff'; cx.font = 'bold 26px sans-serif';
    cx.fillText(`${m}:${s < 10 ? '0' : ''}${s}`, W / 2, 38);
    const others = Object.values(MP.players).filter(mpActive);
    cx.fillStyle = '#ccc'; cx.font = '12px sans-serif';
    cx.fillText(`Jucători: ${others.length + 1}  ·  / = chat`, W / 2, 55);

    const rows = mpBuildBoard().slice(0, 3);
    cx.textAlign = 'left'; cx.font = 'bold 12px sans-serif';
    rows.forEach((r, i) => {
        cx.fillStyle = r.me ? '#ffcc00' : '#fff';
        cx.fillText(`${i + 1}. ${r.name.slice(0, 14)} - ${r.kills}`, W / 2 - 70, 80 + i * 16);
    });

    if (SG.skin !== 'gopnik' && !MP.tuned) {
        const g = others.find(p => p.skin === 'gopnik' && p.track >= 0);
        if (g) {
            cx.textAlign = 'center';
            cx.fillStyle = 'rgba(0,0,0,.65)'; cx.fillRect(W / 2 - 190, H - 38, 380, 26);
            cx.fillStyle = '#ffcc00'; cx.font = 'bold 13px sans-serif';
            cx.fillText(`🎵 M - Ascultă ce pune Gopnikul ${g.name.slice(0, 14)}`, W / 2, H - 20);
        }
    }
    cx.restore();
}

function mpRenderPlayers() {
    const list = Object.values(MP.players).filter(mpActive)
        .map(p => (p.d = Math.hypot(p.x - SG.x, p.y - SG.y), p)).sort((a, b) => b.d - a.d);
    list.forEach(p => {
        const toT = Math.atan2(p.y - SG.y, p.x - SG.x);
        let df = toT - SG.a; df = Math.atan2(Math.sin(df), Math.cos(df));
        if (Math.abs(df) > FOV / 2 + 0.4) return;
        const pd = p.d * Math.cos(df); if (pd < 0.3) return;
        const h = H / pd * 0.95, w = h * 0.65, l = (.5 + df / FOV) * W - w / 2, y = (H - h) / 2 + h * 0.03;
        let rel = p.a - toT; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
        const sk = SKINS_DEF[p.skin] || SKINS_DEF.hetes;
        const im = IMG[Math.abs(rel) < Math.PI / 2 ? sk.back : sk.front];
        cx.save();
        if (p.skin === 'nazbol' && p.inv) {
            cx.fillStyle = 'rgba(255, 0, 0, 0.4)';
        }
        if (p.inv) cx.globalAlpha = 0.55;
        for (let x = Math.max(0, l | 0); x < Math.min(W, l + w); x += 2) {
            if (Z[x >> 1] < pd) continue;
            if (im && im.complete && im.naturalWidth) {
                cx.drawImage(im, (x - l) / w * im.naturalWidth, 0, 2 / w * im.naturalWidth, im.naturalHeight, x, y, 2, h);
            } else {
                cx.fillStyle = '#3498db'; cx.fillRect(x, y, 2, h);
            }
        }
        cx.restore();
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

// ✅ FIX: openShootMenu duce la meniul principal shooter (3 butoane)
window.openShootMenu = function() {
    currentMode = 'SHOOTER';
    stopAllMusic();
    hideAllScreens();
    const mainMenu = $('sh-main-menu');
    if (mainMenu) mainMenu.classList.remove('hidden');
};
window.shMenu = window.openShootMenu;

window.shArsenal = function(mode) {
    SG.mode = mode || 'stalingrad';
    window.openShootMenu();
};

function hideAllScreens() {
    ['main-menu', 'classic-menu', 'tetris-menu', 'sh-main-menu', 'sh-soviet-menu', 'sh-survival-diff-menu', 'sh-skibidi-menu', 'sh-astro-menu', 'sh-arsenal', 'sh-lose', 'sh-win', 'auth-panel', 'mp-chat-container'].forEach(id => {
        const el = $(id);
        if (el) el.classList.add('hidden');
    });
}

function stopAllMusic() {
    sndWin.pause(); sndWin.currentTime = 0;
    sndLose.pause(); sndLose.currentTime = 0;
    sndStalingradBgm.pause(); sndStalingradBgm.currentTime = 0;
    if (gopnikAudio) { gopnikAudio.pause(); gopnikAudio = null; }

    if (typeof window.stopMenuMusic === 'function') window.stopMenuMusic();
    const menuAudio = document.getElementById('menu-music') || document.querySelector('audio');
    if (menuAudio && menuAudio !== sndStalingradBgm) {
        menuAudio.pause();
        menuAudio.currentTime = 0;
    }
}

function getMaxWeapons(skinKey) {
    let sk = SKINS_DEF[skinKey];
    if (!sk) return 2;
    return sk.maxWeapons || 2;
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

function buildArsenalUI() {
    const skinCardsDiv = $('sh-skin-cards');
    const weaponCardsDiv = $('sh-weapon-cards');
    const infoDiv = $('sh-side-info');
    if (!skinCardsDiv || !weaponCardsDiv || !infoDiv) return;

    if (!isSkinUnlocked(SG.skin)) {
        SG.skin = 'hetes';
    }

    skinCardsDiv.innerHTML = '';
    Object.keys(SKINS_DEF).forEach(sKey => {
        let s = SKINS_DEF[sKey];
        let unlocked = isSkinUnlocked(sKey);

        let card = document.createElement('div');
        card.className = `sh-card ${SG.skin === sKey ? 'selected' : ''} ${unlocked ? '' : 'locked'}`;
        card.style.cssText = "width: 120px; height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box; padding: 5px;";
        card.innerHTML = `<img src="${s.front}.png" style="width:50px; height:65px; object-fit:contain; margin-bottom:5px;"><div style="font-weight:bold; font-size:11px; text-align:center; line-height:1.1;">${s.name}</div>`;
        card.onclick = () => {
            if (!unlocked) {
                alert("Skin blocat! Cerință: " + s.req);
                return;
            }
            SG.skin = sKey;
            let maxW = getMaxWeapons(sKey);
            if (SG.weapons.length > maxW) SG.weapons = SG.weapons.slice(0, maxW);
            buildArsenalUI();
        };
        skinCardsDiv.appendChild(card);
    });

    let currentSkinObj = SKINS_DEF[SG.skin];
    infoDiv.innerHTML = `
        <h3 style="color:#ffcc00; margin-top:0;">${currentSkinObj.name}</h3>
        <p style="font-size:12px; color:#ddd;"><strong>Abilitate:</strong> ${currentSkinObj.desc}</p>
        <p style="font-size:11px; color:#aaa;"><strong>Cerință:</strong> ${currentSkinObj.req}</p>
        <hr style="border:0; border-top:1px solid #444;">
        <p style="font-size:11px; color:#ffcc00;">Arme echipate: ${SG.weapons.length} / ${getMaxWeapons(SG.skin)}</p>
    `;

    weaponCardsDiv.innerHTML = '';
    Object.keys(WEAPONS_DEF).forEach(wKey => {
        let w = WEAPONS_DEF[wKey];
        let wUnlocked = isWeaponUnlocked(wKey);
        let equipped = SG.weapons.includes(wKey);
        
        let card = document.createElement('div');
        card.className = `sh-card ${equipped ? 'selected' : ''} ${wUnlocked ? '' : 'locked'}`;
        card.innerHTML = `<img src="${w.img}.png" style="width:65px; height:40px; object-fit:contain;"><div style="font-weight:bold; font-size:10px;">${w.name}</div><div style="font-size:9px; color:${wUnlocked ? '#2ecc71':'#e74c3c'}">${w.reqKills === 0 ? 'Gratis' : w.reqKills + ' kill-uri'}</div>`;
        card.onclick = () => {
            if (!wUnlocked) {
                alert(`Armă blocată! Necesită ${w.reqKills} victime (kill-uri).`);
                return;
            }
            if (equipped) {
                if (SG.weapons.length > 1) SG.weapons = SG.weapons.filter(x => x !== wKey);
            } else {
                if (SG.weapons.length < getMaxWeapons(SG.skin)) SG.weapons.push(wKey);
            }
            buildArsenalUI();
        };
        weaponCardsDiv.appendChild(card);
    });
}

window.buildArsenalUI = buildArsenalUI;

window.startShooterSession = function(mode) {
    if (mode === 'multiplayer' && !mpOk()) {
        alert('Multiplayer necesită conexiunea la server (Firebase). Verifică internetul și reîncarcă pagina.');
        return;
    }
    
    if (!isSkinUnlocked(SG.skin)) {
        alert("Skin-ul " + (SKINS_DEF[SG.skin]?.name || '') + " este blocat! A fost resetat la Hetes.");
        SG.skin = 'hetes';
    }

    SG.weapons = SG.weapons.filter(wKey => isWeaponUnlocked(wKey));
    if (SG.weapons.length === 0) SG.weapons = ['mak'];

    mpLeave();
    SG.mode = mode || 'stalingrad';
    currentMode = 'SHOOTER';
    hideAllScreens();
    stopAllMusic();

    if (loseTimer) { clearTimeout(loseTimer); loseTimer = null; }
    let loseBtn = $('sh-lose-btn'); if (loseBtn) loseBtn.style.opacity = '0';

    SG.on = true;
    SG.x = 10.5; SG.y = 10.5; SG.a = 0;
    SG.kills = 0; SG.statKills = 0;
    SG.wave = 1;
    SG.left = SG.mode === 'multiplayer' ? 0 : 5 + 4 * SG.wave;
    SG.en = [];
    SG.w = SG.weapons.slice();
    SG.cur = 0;
    SG.mag = {}; SG.ammo = {};

    SG.w.forEach(wId => {
        SG.mag[wId] = WEAPONS_DEF[wId].mag;
        SG.ammo[wId] = WEAPONS_DEF[wId].maxAmmo;
    });

    SG.extraLife = (SG.skin === 'catalin' ? 1 : 0);
    SG.maxHp = (SG.skin === 'anti-furry-hetes') ? 200 : ((SG.skin === 'soldat-rus-modern') ? 125 : 100);
    SG.hp = SG.maxHp;

    SG.gopnikPlaying = false; SG.gopnikTrack = 0; SG.gopnikTrackAt = 0;
    SG.nazbolInvincible = false; SG.nazbolSmokeTimer = 0;
    SG.rage = false; SG.rageTimer = 0;
    SG.proletarWeaponProgress = 0;
    sndStalingradBgm.currentTime = 0;
    sndStalingradBgm.play().catch(e => {});

    cv.classList.remove('hidden');
    cv.style.display = 'block';
    cv.requestPointerLock && cv.requestPointerLock();
    SG.t = performance.now();
    if (SG.mode === 'multiplayer') mpStart();
    requestAnimationFrame(shooterLoop);
};

window.shBackToMain = function() {
    SG.on = false;
    mpLeave();
    currentMode = 'NONE';
    stopAllMusic();
    try { document.exitPointerLock && document.exitPointerLock(); } catch(e){}
    hideAllScreens();
    $('main-menu').classList.remove('hidden');
    let authP = $('auth-panel');
    if (authP) {
        authP.classList.remove('hidden');
        authP.style.display = 'block';
    }
    if (cv) {
        cv.classList.add('hidden');
        cv.style.display = 'none';
    }
    const menuAudio = document.getElementById('menu-music') || document.querySelector('audio');
    if (menuAudio && typeof menuAudio.play === 'function') {
        menuAudio.play().catch(() => {});
    }
    if (typeof window.startMenuMusic === 'function') {
        window.startMenuMusic();
    }
    if (typeof playMenuMusic === 'function') playMenuMusic();
    setTimeout(() => location.reload(), 500);
};

cv.addEventListener('mousemove', e => {
    if (!SG.on) return;
    if (document.pointerLockElement === cv) {
        SG.a += e.movementX * 0.0028;
    }
});

cv.addEventListener('mousedown', () => {
    if (!SG.on) return;
    if (MP && MP.chatOpen) mpCloseChat(false);
    if (MP && (MP.ended || !MP.ready)) return;
    SG.fire = 1;
    if (document.pointerLockElement !== cv) {
        cv.requestPointerLock && cv.requestPointerLock();
    }
});

window.addEventListener('mouseup', () => {
    SG.fire = 0;
});

window.addEventListener('keydown', e => {
    if (!SG.on) return;
    let k = e.key.toLowerCase();
    const mpm = SG.mode === 'multiplayer' && MP;
    if (mpm) {
        if (MP.chatOpen) return;
        if (e.key === '/') { e.preventDefault(); mpOpenChat(); return; }
        if (!MP.ready || MP.ended) return;
    }

    if (k === 'r') reloadCurrentWeapon();
    if (k === 'g' || (SG.skin === 'anti-furry-hetes' && k === 'g')) triggerSkinAbility();
    if (k === 'l' && SG.skin === 'anti-furry-hetes') triggerAntiFurryLaser();
    if (k === 'f' && SG.mode === 'stalingrad') triggerKatyusha();

    if (SG.skin === 'gopnik') {
        if (k === 'm') { SG.gopnikTrack = 0; playGopnikMusic(); }
        else if (k === 'k') { SG.gopnikTrack = (SG.gopnikTrack - 1 + GRS_PLAYLIST.length) % GRS_PLAYLIST.length; playGopnikMusic(); }
        else if (k === 'l') { SG.gopnikTrack = (SG.gopnikTrack + 1) % GRS_PLAYLIST.length; playGopnikMusic(); }
    } else if (mpm && k === 'm') {
        mpTune();
    }

    for (let i = 0; i < 5; i++) {
        if (e.key === '' + (i + 1) && SG.w[i]) SG.cur = i;
    }
});

function reloadCurrentWeapon() {
    let id = SG.w[SG.cur], w = WEAPONS_DEF[id];
    if (!w || SG.mag[id] >= w.mag) return;
    if (SG.ammo[id] <= 0) {
        addKillFeed(`Fără muniție în rezervă!`);
        return;
    }
    let needed = w.mag - SG.mag[id];
    let transfer = Math.min(needed, SG.ammo[id]);
    SG.ammo[id] -= transfer;
    SG.mag[id] += transfer;
    sndReload.currentTime = 0; sndReload.play().catch(e => {});
    addKillFeed(`Reîncărcat ${w.name} (${SG.mag[id]}/${w.mag})`);
}

function playGopnikMusic() {
    SG.gopnikPlaying = true;
    SG.gopnikTrackAt = Date.now();
    if (sndStalingradBgm) sndStalingradBgm.pause();
    if (gopnikAudio) gopnikAudio.pause();
    let track = GRS_PLAYLIST[SG.gopnikTrack];
    gopnikAudio = new Audio(track.src);
    gopnikAudio.loop = true;
    gopnikAudio.play().catch(e => {});
    addKillFeed(`Gopnik a pus melodia: ${track.name}`);
}

function triggerKatyusha() {
    if (SG.katcd > 0) return;
    SG.katcd = 50;
    sndExplosion.currentTime = 0; sndExplosion.play().catch(e => {});
    SG.flash = 0.5;
    let killed = 0;
    SG.en.forEach(e => {
        if (killed < 4 && !e.dead) {
            e.dead = true;
            SG.kills++;
            killed++;
        }
    });
    SG.en = SG.en.filter(e => !e.dead);
    addKillFeed(`Ai folosit Katyusha!`);
}

function triggerAntiFurryLaser() {
    let currentLaserCd = SG.rage ? 3 : 10;
    if (SG.laserCd > 0) return;
    SG.laserCd = currentLaserCd;
    
    SG.en.forEach(e => {
        if (Math.hypot(e.x - SG.x, e.y - SG.y) <= 12) {
            e.hp -= 120;
            if (e.hp <= 0) { e.dead = true; SG.kills++; }
        }
    });
    SG.en = SG.en.filter(e => !e.dead);
    sndExplosion.currentTime = 0; sndExplosion.play().catch(e => {});
    if (SG.mode === 'multiplayer') mpAreaDamage(12, 40);
    addKillFeed(`Laser Anti-Furry tras! (CD: ${currentLaserCd}s)`);
}

function triggerSkinAbility() {
    if (SG.abilityCd > 0) return;

    if (SG.skin === 'nazbol') {
        SG.abilityCd = 20;
        SG.nazbolSmokeTimer = 5;
        SG.nazbolInvincible = true;
        sndJump.currentTime = 0; sndJump.play().catch(e => {});
        addKillFeed(`Fum roșu Nazbol activat! (Invulnerabilitate 5s)`);
        return;
    }

    if (SG.skin === 'anti-furry-hetes') {
        SG.abilityCd = 45;
        SG.rage = true;
        SG.rageTimer = 20;
        SG.hp = 200;
        sndJump.currentTime = 0; sndJump.play().catch(e => {});
        addKillFeed(`Rage Mode activat (20s, 200 HP)!`);
        return;
    }

    if (['soldat-sovietic', 'soldat-rus-modern', 'cernobil-stalker'].includes(SG.skin)) {
        SG.abilityCd = 15;
        SG.en.forEach(e => {
            let dist = Math.hypot(e.x - SG.x, e.y - SG.y);
            if (dist <= 10) { 
                e.hp -= 999; e.dead = true; SG.kills++; 
            } else if (SG.skin === 'cernobil-stalker' && dist <= 13) {
                e.hp -= 30;
                if (e.hp <= 0) { e.dead = true; SG.kills++; }
            }
        });
        SG.en = SG.en.filter(e => !e.dead);
        sndExplosion.currentTime = 0; sndExplosion.play().catch(e => {});
        if (SG.mode === 'multiplayer') mpAreaDamage(10, 25);
        addKillFeed(`Grenadă aruncată!`);
        return;
    }

    SG.abilityCd = 10;
    if (SG.skin === 'hetes') {
        SG.en.forEach(e => {
            if (Math.hypot(e.x - SG.x, e.y - SG.y) <= 10) { e.hp -= 100; if (e.hp <= 0) { e.dead = true; SG.kills++; } }
        });
        SG.en = SG.en.filter(e => !e.dead);
        sndExplosion.currentTime = 0; sndExplosion.play().catch(e => {});
        if (SG.mode === 'multiplayer') mpAreaDamage(10, 10);
        addKillFeed(`Lasere activate!`);
    } else if (SG.skin === 'gopnik') {
        SG.hp = Math.min(SG.maxHp, SG.hp + 50);
        sndJump.currentTime = 0; sndJump.play().catch(e => {});
        addKillFeed(`Băut Vodka (+50 HP)!`);
    } else if (SG.skin === 'proletar') {
        SG.hp = Math.min(SG.maxHp, SG.hp + 25);
        SG.proletarWeaponProgress++;
        sndJump.currentTime = 0; sndJump.play().catch(e => {});
        if (SG.proletarWeaponProgress >= 5) {
            SG.proletarWeaponProgress = 0;
            let allWKeys = Object.keys(WEAPONS_DEF);
            let newW = allWKeys.find(w => !SG.w.includes(w));
            if (newW && SG.w.length < 5) {
                SG.w.push(newW);
                SG.mag[newW] = WEAPONS_DEF[newW].mag;
                SG.ammo[newW] = WEAPONS_DEF[newW].maxAmmo;
                addKillFeed(`Proletar a creat o armă nouă în joc după 5 activări: ${WEAPONS_DEF[newW].name}!`);
            }
        } else {
            addKillFeed(`Proletar regenerare HP (+25) și progres armă (${SG.proletarWeaponProgress}/5)!`);
        }
    }
}

function shootWeapon() {
    if (SG.cd > 0) return;
    let id = SG.w[SG.cur], w = WEAPONS_DEF[id];

    if (SG.mag[id] <= 0) {
        addKillFeed(`Încărcător gol! Apasă R.`);
        return;
    }

    SG.cd = w.rate;
    SG.mag[id]--;
    SG.kick = 1;
    sndGun.currentTime = 0; sndGun.play().catch(e => {});

    let wd = cast(SG.x, SG.y, SG.a)[0];
    if (SG.mode === 'multiplayer' && MP) { mpShoot(w, id, wd); return; }
    let best = null, bd = 1e9;
    SG.en.forEach(e => {
        let dx = e.x - SG.x, dy = e.y - SG.y, d = Math.hypot(dx, dy);
        let df = Math.atan2(dy, dx) - SG.a; df = Math.atan2(Math.sin(df), Math.cos(df));
        if (Math.abs(df) * d < 0.38 && d < bd && d < wd + 0.3) {
            best = e; bd = d;
        }
    });

    let effectiveDmg = w.dmg;
    if (SG.skin === 'cernobil-stalker') {
        effectiveDmg *= 2;
    }

    if (w.splash && best) {
        let ex = SG.x + Math.cos(SG.a) * bd, ey = SG.y + Math.sin(SG.a) * bd;
        SG.en.forEach(e => {
            let distToSplash = Math.hypot(e.x - ex, e.y - ey);
            if (distToSplash < w.splash) {
                e.hp -= effectiveDmg;
                if (e.hp <= 0) { e.dead = true; SG.kills++; }
            } else if (SG.skin === 'cernobil-stalker' && distToSplash <= w.splash + 3.0) {
                e.hp -= 15;
                if (e.hp <= 0) { e.dead = true; SG.kills++; }
            }
        });
    } else if (best) {
        best.hp -= effectiveDmg;
        SG.hm = 0.12;
        if (best.hp <= 0) { 
            best.dead = true; SG.kills++; 
        } else if (SG.skin === 'cernobil-stalker' && bd <= 15) {
            setTimeout(() => {
                if (best && !best.dead) {
                    best.hp -= 15;
                    if (best.hp <= 0) { best.dead = true; SG.kills++; }
                }
            }, 300);
            setTimeout(() => {
                if (best && !best.dead) {
                    best.hp -= 15;
                    if (best.hp <= 0) { best.dead = true; SG.kills++; }
                }
            }, 600);
        }
    }
    SG.en = SG.en.filter(e => !e.dead);
}

function spawnEnemy() {
    for (let i = 0; i < 60; i++) {
        let x = 1.5 + Math.random() * (N - 3);
        let y = 1.5 + Math.random() * (N - 3);
        if (!MAP_GRID[(y | 0) * N + (x | 0)] && Math.hypot(x - SG.x, y - SG.y) > 7) {
            SG.en.push({ x, y, hp: 60, cd: 1.5, sp: 1 + SG.wave * 0.12, wander: 0, off: 0 });
            SG.left--;
            return;
        }
    }
}

function updateShooter(dt) {
    if (!SG.on) return;
    if (SG.mode !== 'multiplayer') creditShooterKills();

    let k = window.keys || {};
    const mpMode = SG.mode === 'multiplayer' && MP;
    if (mpMode && !MP.ready) return;
    if (mpMode && (MP.ended || MP.chatOpen)) k = {};
    let forward = (k['w'] || k['arrowup'] ? 1 : 0) - (k['s'] || k['arrowdown'] ? 1 : 0);
    let strafe = (k['d'] || k['arrowright'] ? 1 : 0) - (k['a'] || k['arrowleft'] ? 1 : 0);

    let cosA = Math.cos(SG.a), sinA = Math.sin(SG.a);
    let mx = forward * cosA - strafe * sinA;
    let my = forward * sinA + strafe * cosA;
    
    let baseSpd = 3.2;
    if (['gopnik', 'soldat-rus-modern', 'anti-furry-hetes'].includes(SG.skin)) {
        baseSpd = 4.8;
    }
    let spd = SG.rage ? 6.2 : baseSpd;
    if (SG.nazbolSmokeTimer > 0) spd = 5.5;

    let l = Math.hypot(mx, my);
    if (l) {
        mx = (mx / l) * spd * dt;
        my = (my / l) * spd * dt;
        SG.bob += dt * 9;
        if (!solid(SG.x + mx, SG.y)) SG.x += mx;
        if (!solid(SG.x, SG.y + my)) SG.y += my;
    }

    SG.cd -= dt; SG.kick = Math.max(0, SG.kick - dt * 6);
    SG.flash -= dt; SG.hm -= dt; SG.katcd -= dt; SG.abilityCd -= dt; SG.laserCd -= dt;

    if (SG.rage) {
        SG.rageTimer -= dt;
        if (SG.rageTimer <= 0) SG.rage = false;
    }

    let firePressed = SG.fire || (window.mobileShooterFire || 0) || (k[' '] ? 1 : 0);
    if (mpMode && (MP.ended || MP.chatOpen)) firePressed = 0;
    if (firePressed && SG.cd <= 0) {
        shootWeapon();
    }

    SG.ammoBoxes.forEach(box => {
        if (box.active) {
            if (Math.hypot(SG.x - box.x, SG.y - box.y) < 0.6) {
                sndJump.currentTime = 0; sndJump.play().catch(e => {});
                SG.w.forEach(wId => { SG.ammo[wId] += WEAPONS_DEF[wId].give; });
                box.active = false; box.respawnTimer = (SG.mode === 'multiplayer') ? 20 : 60;
                addKillFeed(`Muniție colectată!`);
            }
        } else {
            box.respawnTimer -= dt;
            if (box.respawnTimer <= 0) box.active = true;
        }
    });

    if (SG.nazbolSmokeTimer > 0) {
        SG.nazbolSmokeTimer -= dt;
        if (SG.nazbolSmokeTimer <= 0) SG.nazbolInvincible = false;
    }

    if (mpMode) { mpInterpolate(dt); return; }

    if (!SG.left && !SG.en.length) {
        if (SG.wave === 4) { triggerStalingradWin(); return; }
        if ((SG.nw -= dt) <= 0) {
            SG.wave++; SG.left = 5 + 4 * SG.wave; SG.hp = Math.min(SG.maxHp, SG.hp + 30);
            SG.nw = 3;
        }
    }
    if (SG.left && SG.en.length < 10 && (SG.sp -= dt) <= 0) { SG.sp = 1.2; spawnEnemy(); }

    SG.en.forEach(e => {
        let dx = SG.x - e.x, dy = SG.y - e.y, d = Math.hypot(dx, dy);
        let see = d < 14 && los(e.x, e.y, SG.x, SG.y);
        e.wander = (e.wander || 0) - dt;

        if (!see && Math.random() < dt * 0.4) {
            e.wander = 1;
            e.off = (Math.random() - 0.5) * 4;
        }

        let a = Math.atan2(dy, dx) + (e.wander > 0 ? e.off : 0);
        let nx = e.x + Math.cos(a) * e.sp * dt, ny = e.y + Math.sin(a) * e.sp * dt;

        if (!solid(nx, e.y, 0.25)) e.x = nx; else e.x += Math.sin(a) * e.sp * dt;
        if (!solid(e.x, ny, 0.25)) e.y = ny; else e.y += Math.cos(a) * e.sp * dt;

        if (see && (e.cd -= dt) <= 0) {
            e.cd = 1 + Math.random();
            if (!SG.nazbolInvincible && SG.nazbolSmokeTimer <= 0 && Math.random() < 0.75 - d * 0.035) {
                SG.hp -= (5 + (Math.random() * 4 | 0));
                SG.flash = 0.3;
                if (SG.hp <= 0) {
                    if (SG.extraLife > 0) {
                        SG.extraLife = 0; SG.hp = SG.maxHp; addKillFeed(`Viață suplimentară folosită!`);
                    } else {
                        triggerStalingradLose();
                    }
                }
            }
        }
    });
}

function triggerStalingradLose() {
    creditShooterKills();
    { const g = gs(); g.score = (g.score || 0) + 500; if (typeof saveStats === 'function') saveStats(); }
    SG.on = false;
    stopAllMusic();
    sndLose.currentTime = 0; sndLose.play().catch(e => {});
    try { document.exitPointerLock && document.exitPointerLock(); } catch(e){}

    if (cv) { cv.classList.add('hidden'); cv.style.display = 'none'; }
    let loseScr = $('sh-lose');
    if (loseScr) {
        loseScr.classList.remove('hidden');
        loseScr.style.background = '#000';
        loseTimer = setTimeout(() => {
            let btn = $('sh-lose-btn');
            if (btn) {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
                btn.innerText = "Inapoi la meniu...";
            }
        }, 10000);
    }
}

function triggerStalingradWin() {
    creditShooterKills();
    { const g = gs(); 
      g.wins = (g.wins || 0) + 1; 
      g.stalingradWins = (g.stalingradWins || 0) + 1; 
      g.survival = g.survival || { kills: 0, wins: 0, completions: 0 };
      g.survival.wins = (g.survival.wins || 0) + 1;
      g.survival.completions = (g.survival.completions || 0) + 1;
      g.score = (g.score || 0) + 2000; 
      if (typeof saveStats === 'function') saveStats(); 
    }
    SG.on = false;
    stopAllMusic();
    sndWin.currentTime = 0; sndWin.play().catch(e => {});
    try { document.exitPointerLock && document.exitPointerLock(); } catch(e){}

    if (cv) { cv.classList.add('hidden'); cv.style.display = 'none'; }
    let winScr = $('sh-win');
    if (winScr) {
        winScr.classList.remove('hidden');
        winScr.innerHTML = `
            <div class="end-title" style="color: #33ff33;">Misiune Îndeplinită! ☭</div>
            <div style="font-size:24px; color:#ffff00; font-weight:bold; margin-bottom:20px;">Fasciștii au fost învinși</div>
            <button class="btn btn-back" onclick="shBackToMain()">Inapoi la meniu</button>
        `;
    }
}

function renderShooter() {
    cx.save();
    cx.fillStyle = '#2a2022'; cx.fillRect(0, 0, W, H / 2);
    cx.fillStyle = '#3d342e'; cx.fillRect(0, H / 2, W, H / 2);

    for (let i = 0; i < C; i++) {
        let a = SG.a + (i / C - .5) * FOV;
        let [d, t, s, wx] = cast(SG.x, SG.y, a);
        let p = Math.max(.05, d * Math.cos(a - SG.a));
        Z[i] = p;
        let h = H / p, y0 = (H - h) / 2;
        let sh = Math.max(.1, 1 - p / 15) * (s ? .7 : 1);
        let c = [170, 80, 55];
        cx.fillStyle = `rgb(${c[0] * sh | 0},${c[1] * sh | 0},${c[2] * sh | 0})`;
        cx.fillRect(i * 2, y0, 2, h);
    }

    SG.ammoBoxes.forEach(box => {
        if (!box.active) return;
        let df = Math.atan2(box.y - SG.y, box.x - SG.x) - SG.a;
        df = Math.atan2(Math.sin(df), Math.cos(df));
        if (Math.abs(df) < FOV / 2 + 0.4) {
            let dist = Math.hypot(box.x - SG.x, box.y - SG.y);
            let pDist = Math.max(0.3, dist * Math.cos(df));
            let h = H / pDist * 0.4, w = h;
            let l = (.5 + df / FOV) * W - w / 2, y = (H - h) / 2 + h * 0.3;
            let ammoImg = IMG.ammo;
            for (let x = Math.max(0, l | 0); x < Math.min(W, l + w); x += 2) {
                if (Z[x >> 1] < pDist) continue;
                if (ammoImg && ammoImg.complete && ammoImg.naturalWidth) {
                    cx.drawImage(ammoImg, (x - l) / w * ammoImg.naturalWidth, 0, 2 / w * ammoImg.naturalWidth, ammoImg.naturalHeight, x, y, 2, h);
                }
            }
        }
    });

    SG.en.map(e => (e.d = Math.hypot(e.x - SG.x, e.y - SG.y), e)).sort((a, b) => b.d - a.d).forEach(e => {
        let df = Math.atan2(e.y - SG.y, e.x - SG.x) - SG.a;
        df = Math.atan2(Math.sin(df), Math.cos(df));
        if (Math.abs(df) > FOV / 2 + 0.4) return;
        let p = e.d * Math.cos(df); if (p < 0.3) return;
        let h = H / p * 0.95, w = h * 0.65, l = (.5 + df / FOV) * W - w / 2, y = (H - h) / 2 + h * 0.03;
        let im = IMG.enemy;
        for (let x = Math.max(0, l | 0); x < Math.min(W, l + w); x += 2) {
            if (Z[x >> 1] < p) continue;
            if (im && im.complete && im.naturalWidth) {
                cx.drawImage(im, (x - l) / w * im.naturalWidth, 0, 2 / w * im.naturalWidth, im.naturalHeight, x, y, 2, h);
            } else {
                cx.fillStyle = '#4a5a3a'; cx.fillRect(x, y, 2, h);
            }
        }
    });

    if (SG.mode === 'multiplayer' && MP && MP.ready) mpRenderPlayers();

    let id = SG.w[SG.cur], wp = WEAPONS_DEF[id], wi = IMG[wp?.img];
    if (wi && wi.complete && wi.naturalWidth) {
        let h = H * .5, ww = h * wi.naturalWidth / wi.naturalHeight;
        cx.drawImage(wi, W * .62 - ww * .35 + Math.sin(SG.bob) * 12 + SG.kick * 14, H - h * .92 + Math.abs(Math.cos(SG.bob)) * 10 + SG.kick * 28, ww, h);
    }

    if (SG.flash > 0) { cx.fillStyle = `rgba(200,0,0,${SG.flash})`; cx.fillRect(0, 0, W, H); }
    
    if (SG.skin === 'nazbol' && SG.nazbolSmokeTimer > 0) {
        cx.fillStyle = 'rgba(255, 0, 0, 0.28)';
        cx.fillRect(0, 0, W, H);
    }

    cx.restore();

    cx.strokeStyle = SG.hm > 0 ? '#f33' : '#fff'; cx.lineWidth = 2; cx.beginPath();
    cx.moveTo(W / 2 - 10, H / 2); cx.lineTo(W / 2 + 10, H / 2);
    cx.moveTo(W / 2, H / 2 - 10); cx.lineTo(W / 2, H / 2 + 10); cx.stroke();

    const hudOy = (SG.mode === 'multiplayer') ? 50 : 0;
    cx.save(); cx.translate(0, hudOy);
    let hpBarWidth = Math.min(260, (SG.maxHp / 100) * 260);
    cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(20, 20, hpBarWidth, 26);
    cx.fillStyle = '#d22'; cx.fillRect(20, 20, Math.max(0, SG.hp) * (hpBarWidth / SG.maxHp), 26);
    cx.strokeStyle = '#fff'; cx.strokeRect(20, 20, hpBarWidth, 26);
    cx.fillStyle = '#fff'; cx.font = 'bold 16px sans-serif';
    cx.fillText('HP ' + Math.ceil(Math.max(0, SG.hp)) + '/' + SG.maxHp, 28, 39);

    cx.restore();
    cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(W - 70, 20, 50, 50);
    cx.strokeStyle = '#ffcc00'; cx.lineWidth = 2; cx.strokeRect(W - 70, 20, 50, 50);
    cx.fillStyle = SG.abilityCd <= 0 ? '#ffcc00' : '#666'; cx.font = 'bold 32px sans-serif';
    cx.fillText('G', W - 57, 56);

    cx.save(); cx.translate(0, hudOy);
    cx.fillStyle = '#ffff00'; cx.font = 'bold 16px sans-serif';
    if (SG.mode === 'multiplayer' && MP) cx.fillText(`Victime: ${SG.kills} · Morți: ${MP.deaths}`, 20, 70);
    else cx.fillText(`Victime: ${SG.kills} · Rămași: ${SG.en.length + SG.left}`, 20, 70);

    let currentTextY = 95;
    if (SG.mode !== 'multiplayer') {
        cx.fillStyle = SG.katcd <= 0 ? '#00ffcc' : '#888';
        cx.fillText('F - Katyusha: ' + (SG.katcd <= 0 ? '[GATA]' : Math.ceil(SG.katcd) + 's'), 20, currentTextY);
        currentTextY += 22;
    }

    if (SG.skin === 'anti-furry-hetes') {
        cx.fillStyle = SG.laserCd <= 0 ? '#00ffcc' : '#888';
        cx.fillText('L - Lasere: ' + (SG.laserCd <= 0 ? '[GATA]' : Math.ceil(SG.laserCd) + 's'), 20, currentTextY);
        currentTextY += 22;
        cx.fillStyle = SG.abilityCd <= 0 ? '#00ffcc' : '#888';
        cx.fillText('G - Rage Mode: ' + (SG.abilityCd <= 0 ? '[GATA]' : Math.ceil(SG.abilityCd) + 's'), 20, currentTextY);
    } else {
        cx.fillStyle = SG.abilityCd <= 0 ? '#00ffcc' : '#888';
        cx.fillText('G - Abilitate: ' + (SG.abilityCd <= 0 ? '[GATA]' : Math.ceil(SG.abilityCd) + 's'), 20, currentTextY);
    }

    cx.restore();
    cx.font = 'bold 16px sans-serif';

    if (SG.skin === 'gopnik' || SG.gopnikPlaying) {
        let gopX = W - 320, gopY = 80, gopW = 240, gopH = 50;
        cx.fillStyle='rgba(0,0,0,0.8)'; cx.fillRect(gopX, gopY, gopW, gopH);
        cx.strokeStyle='#ffcc00'; cx.lineWidth=2; cx.strokeRect(gopX, gopY, gopW, gopH);
        cx.fillStyle='#ffcc00'; cx.font='bold 11px sans-serif';
        let gopLabel = '🎵 Hardbass Player (M, K, L)';
        if (MP && MP.tuned && MP.players[MP.tuned]) gopLabel = '🎵 Asculți: ' + MP.players[MP.tuned].name + ' (M - oprește)';
        cx.fillText(gopLabel, gopX + 8, gopY + 16);
        cx.fillStyle='#fff'; cx.font='10px sans-serif';
        let curTrackName = GRS_PLAYLIST[SG.gopnikTrack].name;
        if(curTrackName.length > 32) curTrackName = curTrackName.substring(0, 30) + '...';
        cx.fillText(curTrackName, gopX + 8, gopY + 36);
    }

    SG.w.forEach((i, n) => {
        cx.fillStyle = n == SG.cur ? '#ffcc00' : '#aaa';
        cx.fillText(`${n + 1}. ${WEAPONS_DEF[i]?.name || ''}  Mag: ${SG.mag[i]} / Rez: ${SG.ammo[i]} (R-Reload)`, (SG.mode === 'multiplayer' ? 390 : 20), H - 100 + n * 20);
    });

    let nowTime = performance.now();
    killFeedMessages = killFeedMessages.filter(kf => kf.time > nowTime);
    if (killFeedMessages.length > 0) {
        let kfX = W - 320, kfY = 140;
        cx.fillStyle = 'rgba(0,0,0,0.6)';
        cx.fillRect(kfX - 10, kfY - 5, 310, killFeedMessages.length * 22 + 10);
        cx.font = 'bold 12px sans-serif';
        killFeedMessages.forEach((kf, idx) => {
            let alpha = Math.min(1, (kf.time - nowTime) / 1000);
            cx.fillStyle = `rgba(255, 204, 0, ${alpha})`;
            cx.fillText(kf.text, kfX, kfY + 14 + idx * 22);
        });
    }

    const mmX = W - 170, mmY = 410, mmSz = 140;
    cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(mmX, mmY, mmSz, mmSz);
    cx.strokeStyle = '#ffcc00'; cx.lineWidth = 2; cx.strokeRect(mmX, mmY, mmSz, mmSz);

    let pMmX = mmX + (SG.x / N) * mmSz;
    let pMmY = mmY + (SG.y / N) * mmSz;
    cx.fillStyle = '#2ecc71'; cx.beginPath(); cx.arc(pMmX, pMmY, 4, 0, Math.PI * 2); cx.fill();

    SG.en.forEach(e => {
        let eX = mmX + (e.x / N) * mmSz;
        let eY = mmY + (e.y / N) * mmSz;
        cx.fillStyle = '#e74c3c'; cx.fillRect(eX - 2, eY - 2, 4, 4);
    });

    if (SG.mode === 'multiplayer' && MP && MP.ready) {
        Object.values(MP.players).filter(mpActive).forEach(p => {
            cx.fillStyle = '#3498db';
            cx.fillRect(mmX + (p.x / N) * mmSz - 2, mmY + (p.y / N) * mmSz - 2, 4, 4);
        });
    }
    if (SG.mode === 'multiplayer' && MP) mpDrawHUD();
}

function shooterLoop(timestamp) {
    if (!SG.on) return;
    let dt = Math.min(.05, (timestamp - SG.t) / 1000 || 0);
    SG.t = timestamp;

    updateShooter(dt);
    renderShooter();

    if (SG.on) requestAnimationFrame(shooterLoop);
}

window.addEventListener('load', () => {
    const orig = window.backToMain;
    if (typeof orig !== 'function' || orig._reloads) return;
    const wrapped = function() {
        try { orig.apply(this, arguments); } catch (e) {}
        setTimeout(() => location.reload(), 500);
    };
    wrapped._reloads = true;
    window.backToMain = wrapped;
});

})();