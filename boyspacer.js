// boyspacer.js - Modul Hetes Anti-furry Spatial (Space Shooter) V10
// 🎯 FIX: boși simultani (SS.bosses array) + grupuri de spawn (pendingBossGroups)
// 🎯 ADD: valuri 10, 15, 20, 25 cu boși
(() => {
    const W = 1280, H = 720;
    const $ = id => document.getElementById(id);
    const cv = $('gameCanvas');
    if (!cv) return;
    const cx = cv.getContext('2d');

    // ========== IMAGES ==========
    const IMG = {};
    const imgNames = [
        'space-hetus',
        'space1', 'space2', 'space3', 'space4',
        'plasma-orb',
        'hetesian-projectile',
        'hetesian-orb',
        'Pisică spațială cu tun energetic',
        'Proiectil energetic neon cyan și roșu',
        'Comandant cosmic vulpe sovietică',
        'Comandantul cosmic cu coadă albă-2',
        'Împăratul cosmic felin sovietic',
        'Pisică stelară sovietică cyberpunk-1',
        'Nava-amirală sovietică Foxfire cotește spre stânga',
        'Comandant felin sovietic futurist',
        'Astro-Boykisser-right',
        'Astro-Boykisser-left',
        'Comandantul cosmic cu armură roșie',
        'boykisser-commander-achiv',
        'Triumf cosmic peste ruinele spațiale',
        'Comandantul Conquistei Galactice',
        'space-hetus2',
        'space-hetus3-left',
        'space-hetus3-right'
    ];
    imgNames.forEach(n => {
        IMG[n] = new Image();
        IMG[n].src = n + '.png';
    });
    IMG['space-boykisser'] = new Image();
    IMG['space-boykisser'].src = 'space-boykisser.jpg';
    IMG['planeta-boykisser'] = new Image();
    IMG['planeta-boykisser'].src = 'planeta-boykisser.jpeg';
    IMG['hetus-total-victory'] = new Image();
    IMG['hetus-total-victory'].src = 'hetus-total-victory.png';
    IMG['hetus-vs-astro'] = new Image();
    IMG['hetus-vs-astro'].src = 'hetus-vs-astro.jpeg';
    IMG['sad-boykissers3'] = new Image();
    IMG['sad-boykissers3'].src = 'sad-boykissers3;.jpeg';

    // ========== SOUND HELPER ==========
    function safePlay(audio, volume) {
        if (!audio) return;
        try {
            audio.pause();
            audio.currentTime = 0;
            if (volume !== undefined) audio.volume = volume;
            audio.load();
            const p = audio.play();
            if (p && p.catch) {
                p.catch(() => {
                    const retry = () => {
                        try { audio.play().catch(() => {}); } catch(e) {}
                        window.removeEventListener('click', retry);
                        window.removeEventListener('keydown', retry);
                    };
                    window.addEventListener('click', retry, { once: true });
                    window.addEventListener('keydown', retry, { once: true });
                });
            }
        } catch(e) {}
    }

    // ========== SOUNDS ==========
    const sndAstroShoot = new Audio('astro-shoot.mp3');
    const sndLaser = new Audio('laser1.mp3');
    const sndExplosion = new Audio('st explosion sound6.mp3');
    const sndWin = new Audio('gimn-sssr.mp3');
    const sndLose = new Audio('tyomnaya-noch.mp3');
    const sndPickup = new Audio('clasic-jump.mp3');
    const sndMeow1 = new Audio('boykisser-meow(1).mp3');
    const sndMeow2 = new Audio('boykisser-meow (2).mp3');

    const sndBgmWave1 = new Audio('И вновь продолжается бой (Lenin is Young Again) 8 Bit (mp3cut.net).mp3');
    const sndBgmWave10 = new Audio('The Battle is Won - Ayden George (Lenin is Young Again Remix).mp3');
    const sndBgmWave20 = new Audio('The Battle Continues _ И вновь продолжается бой _ (Rare Instrumental Version) (mp3cut.net).mp3');
    const sndBgmSecret = new Audio('ivnovpro.mp3');

    const sndVictory = new Audio('boy-burgundy.mp3');
    sndVictory.preload = 'auto';
    sndVictory.loop = false;
    sndVictory.volume = 1.0;

    const sndDefeat = new Audio('sovietwave-gimn.mp3');
    sndDefeat.preload = 'auto';
    sndDefeat.loop = false;
    sndDefeat.volume = 1.0;

    [sndBgmWave1, sndBgmWave10, sndBgmWave20, sndBgmSecret].forEach(bgm => {
        bgm.loop = true;
        bgm.volume = 0.7;
    });

    let currentBgm = null;
    let currentBgmTier = 0;

    // ========== CONSTANTS ==========
    const PLAYER_WIDTH = 90;
    const PLAYER_HEIGHT = 70;
    const PLAYER_SPEED = 5;
    const PLAYER_START_X = 80;

    const ENEMY_CONFIG = {
        1: {
            hp: 30, shootCooldown: 3.0, speed: 1.5, damage: 5, score: 100,
            width: 60, height: 60, projectile: 'plasma', projectileSpeed: 5,
            projectileDamage: 5, projectileRadius: 18, img: 'space1'
        },
        2: {
            hp: 50, shootCooldown: 2.2, speed: 1.8, damage: 7, score: 200,
            width: 65, height: 65, projectile: 'plasma', projectileSpeed: 5,
            projectileDamage: 7, projectileRadius: 18, img: 'space2'
        },
        3: {
            hp: 80, shootCooldown: 1.6, speed: 2.2, damage: 7, score: 350,
            width: 70, height: 70, projectile: 'plasma', projectileSpeed: 5.5,
            projectileDamage: 7, projectileRadius: 18, img: 'space3'
        },
        4: {
            hp: 120, shootCooldown: 1.0, speed: 2.6, damage: 10, score: 500,
            width: 80, height: 80, projectile: 'plasma', projectileSpeed: 6,
            projectileDamage: 10, projectileRadius: 18, img: 'space4'
        },
        pisica: {
            hp: 40, shootCooldown: 1.8, speed: 2.0, damage: 3, score: 150,
            width: 55, height: 55, projectile: 'neon', projectileSpeed: 7,
            projectileDamage: 3, projectileRadius: 12,
            img: 'Pisică spațială cu tun energetic'
        },
        elite: {
            hp: 100, shootCooldown: 1.8, speed: 2.4, damage: 5, score: 400,
            width: 70, height: 70, projectile: 'neon', projectileSpeed: 8,
            projectileDamage: 5, projectileRadius: 15,
            img: 'Pisică spațială cu tun energetic'
        },
        cyberElite: {
            hp: 600, shootCooldown: 1.6, speed: 1.8, damage: 15, score: 1200,
            width: 120, height: 120, projectile: 'plasma', projectileSpeed: 6,
            projectileDamage: 15, projectileRadius: 25,
            img: 'Pisică stelară sovietică cyberpunk-1'
        },
        foxfireElite: {
            hp: 1000, shootCooldown: 1.5, speed: 1.5, damage: 20, score: 2000,
            width: 160, height: 100, projectile: 'both', projectileSpeed: 7,
            projectileDamage: 20, projectileRadius: 22, neonRadius: 16,
            img: 'Nava-amirală sovietică Foxfire cotește spre stânga'
        }
    };

    const BOSS_CONFIG = {
        locotenent: {
            hp: 5000, shootCooldown: 1.2, speed: 1.5, damage: 15, score: 3000,
            width: 220, height: 220,
            img: 'Comandantul cosmic cu coadă albă-2',
            projectile: 'both', projectileSpeed: 6, projectileDamage: 15,
            projectileRadius: 28, neonRadius: 20, meowSound: sndMeow1
        },
        maior: {
            hp: 15000, shootCooldown: 0.9, speed: 1.8, damage: 25, score: 10000,
            width: 320, height: 320,
            img: 'Comandant cosmic vulpe sovietică',
            projectile: 'both', projectileSpeed: 7, projectileDamage: 25,
            projectileRadius: 38, neonRadius: 28, meowSound: sndMeow2
        },
        colonelGeneral: {
            hp: 25000, shootCooldown: 0.8, speed: 2.0, damage: 35, score: 20000,
            width: 360, height: 360,
            img: 'Comandant felin sovietic futurist',
            projectile: 'both', projectileSpeed: 7.5, projectileDamage: 35,
            projectileRadius: 42, neonRadius: 30, meowSound: sndMeow2,
            hasTracingLaser: true,
            extraPlasmaCount: 2
        },
        maresal: {
            hp: 50000, shootCooldown: 0.7, speed: 2.0, damage: 45, score: 40000,
            width: 400, height: 400,
            img: 'Împăratul cosmic felin sovietic',
            projectile: 'both', projectileSpeed: 8, projectileDamage: 45,
            projectileRadius: 45, neonRadius: 32, meowSound: sndMeow2,
            hasTracingLaser: true,
            extraPlasmaCount: 3
        },
        mareataNava: {
            hp: 40000, shootCooldown: 0.8, speed: 1.6, damage: 50, score: 35000,
            width: 400, height: 250,
            img: 'Nava-amirală sovietică Foxfire cotește spre stânga',
            projectile: 'both', projectileSpeed: 8, projectileDamage: 50,
            projectileRadius: 40, neonRadius: 30, meowSound: sndMeow2,
            hasTracingLaser: true,
            extraPlasmaCount: 3
        },
        astroGeneral: {
            hp: 67000, shootCooldown: 0.6, speed: 2.5, damage: 60, score: 60000,
            width: 380, height: 380,
            img: 'Astro-Boykisser-right',
            projectile: 'both', projectileSpeed: 9, projectileDamage: 60,
            projectileRadius: 50, neonRadius: 35, meowSound: sndMeow2,
            hasTracingLaser: true,
            hasDash: true,
            extraPlasmaCount: 3
        },
        astroGeneralFinal: {
            hp: 80000, shootCooldown: 0.5, speed: 2.8, damage: 70, score: 80000,
            width: 380, height: 380,
            img: 'Astro-Boykisser-right',
            projectile: 'both', projectileSpeed: 9.5, projectileDamage: 70,
            projectileRadius: 52, neonRadius: 38, meowSound: sndMeow2,
            hasTracingLaser: true,
            hasDash: true,
            extraPlasmaCount: 4
        },
        secretarGeneral: {
            hp: 125000, shootCooldown: 0.5, speed: 2.2, damage: 80, score: 150000,
            width: 420, height: 420,
            img: 'Comandantul cosmic cu armură roșie',
            projectile: 'both', projectileSpeed: 9, projectileDamage: 80,
            projectileRadius: 55, neonRadius: 40, meowSound: sndMeow2,
            hasTracingLaser: true,
            extraPlasmaCount: 4
        }
    };

    const HETESIAN_PROJECTILE_SPEED = 10;
    const HETESIAN_ORB_SPEED = 7;

    const LASER_MAX_DURATION = 3.0;
    let LASER_COOLDOWN = 10.0;
    const LASER_DAMAGE_PER_SECOND = 150;

    let SPACE_SHOOTER_CD = 15.0;
    let ORB_CD = 2.0;

    let PLAYER_DAMAGE_MULT = 1.0;
    const ROCKET_BASE_DAMAGE = 200;
    const ORB_BASE_DAMAGE = 50;
    const LASER_BASE_DPS = 150;

    const HEALTH_PICKUP_SPAWN_INTERVAL = 8.0;
    let HEALTH_PICKUP_CHANCE = 0.6;
    let HEALTH_PICKUP_HEAL = 75;
    const HEALTH_PICKUP_SPEED = 2.0;
    const HEALTH_PICKUP_RADIUS = 20;

    const BOSS_HEALTH_PICKUP_INTERVAL = 4.0;

    const TEMP_POWERUP_SPAWN_INTERVAL = 12.0;
    const TEMP_POWERUP_DURATION = 6.0;
    const TEMP_POWERUP_SHIELD_RADIUS = 45;

    const BOSS_TARGET_X = W - 280;
    const MAX_ENEMY_BULLETS = 100;

    // ========== STATE ==========
    let SS = {
        on: false, ended: false, victory: false, paused: false,
        t: performance.now(),
        player: {
            x: PLAYER_START_X, y: H / 2, hp: 100, maxHp: 100,
            hitFlash: 0, shieldActive: false, rapidFireActive: false,
            shieldTimer: 0, rapidFireTimer: 0
        },
        enemies: [], enemyBullets: [], playerProjectiles: [],
        hetesianProjectiles: [], hetesianOrbs: [], healthPickups: [], tempPowerups: [],
        bosses: [],
        explosions: [], particles: [], stars: [],
        laserActive: false, laserTimer: 0, laserCooldown: 0, laserUsedTime: 0,
        spaceShooterCd: 0, orbCd: 0,
        kills: 0, boykissersDefeated: 0, score: 0,
        spawnTimer: 0, spawnInterval: 2.5, wave: 0, bgScroll: 0,
        gameStarted: false, startCountdown: 3,
        healthSpawnTimer: 0, tempPowerupTimer: 0,
        bossDefeatedLocotenent: 0,
        bossDefeatedMaior: 0,
        bossDefeatedColonelGeneral: 0,
        bossDefeatedMaresal: 0,
        bossDefeatedMareataNava: 0,
        bossDefeatedAstroGeneral: 0,
        bossDefeatedSecretarGeneral: 0,
        bossWaveActive: false, bossWaveType: null,
        pendingBossGroups: [],
        currentBossGroupIndex: 0,
        bossGroupWaiting: false,
        victoryScreenShown: false,
        bestRun: { score: 0, wave: 0, kills: 0 },
        currentRunStartTime: 0,
        inSecretMode: false,
        secretModeStarted: false,
        currentBackground: 'space',
        playerImage: 'space-hetus',
        playerImageLeft: 'space-hetus',
        playerImageRight: null,
        astroFightActive: false,
        astroFightBoss: null,
        astroFightPhase: 0,
        flameActive: false,
        flameTimer: 0,
        flameCooldown: 0,
        FLAME_MAX_DURATION: 5.0,
        FLAME_COOLDOWN: 15.0,
        flameParticles: [],
        finalBossActive: false,
        finalBoss: null,
        cutscenePlaying: false,
        cutsceneVideo: null,
        waveMilestonesDone: {},
        bossWaveLockWave: -1
    };

    for (let i = 0; i < 150; i++) {
        SS.stars.push({
            x: Math.random() * W, y: Math.random() * H,
            speed: 0.5 + Math.random() * 2, size: 1 + Math.random() * 2
        });
    }

    // ========== MUSIC MANAGEMENT ==========
    function stopAllBgm() {
        [sndBgmWave1, sndBgmWave10, sndBgmWave20, sndBgmSecret].forEach(bgm => {
            bgm.pause();
            bgm.currentTime = 0;
        });
        currentBgm = null;
        currentBgmTier = 0;
    }

    function playBgmTier(tier) {
        if (currentBgmTier === tier && currentBgm && !currentBgm.paused) return;
        if (currentBgm) {
            currentBgm.pause();
            currentBgm.currentTime = 0;
        }
        let newBgm = null;
        if (tier === 1) newBgm = sndBgmWave1;
        else if (tier === 2) newBgm = sndBgmWave10;
        else if (tier === 3) newBgm = sndBgmWave20;
        else if (tier === 4) newBgm = sndBgmSecret;
        if (newBgm) {
            currentBgm = newBgm;
            currentBgmTier = tier;
            newBgm.currentTime = 0;
            newBgm.play().catch(() => {});
        }
    }

    function updateBgmForWave(wave) {
        let tier = 1;
        if (SS.inSecretMode) {
            if (wave >= 50) tier = 4;
            else if (wave >= 40) tier = 3;
            else tier = 2;
        } else {
            if (wave >= 30) tier = 3;
            else if (wave >= 15) tier = 2;
            else tier = 1;
        }
        playBgmTier(tier);
    }

    // ========== INIT ==========
    function ssInit() {
        SS.on = true;
        SS.ended = false;
        SS.victory = false;
        SS.paused = false;
        SS.t = performance.now();
        SS.player = {
            x: PLAYER_START_X, y: H / 2, hp: 100, maxHp: 100,
            hitFlash: 0, shieldActive: false, rapidFireActive: false,
            shieldTimer: 0, rapidFireTimer: 0
        };
        SS.enemies = []; SS.enemyBullets = []; SS.playerProjectiles = [];
        SS.hetesianProjectiles = []; SS.hetesianOrbs = [];
        SS.healthPickups = []; SS.tempPowerups = [];
        SS.bosses = [];
        SS.explosions = []; SS.particles = [];
        SS.laserActive = false; SS.laserTimer = 0; SS.laserCooldown = 0; SS.laserUsedTime = 0;
        SS.spaceShooterCd = 0; SS.orbCd = 0;
        SS.kills = 0; SS.boykissersDefeated = 0; SS.score = 0;
        SS.spawnTimer = 0; SS.spawnInterval = 2.5; SS.wave = 0; SS.bgScroll = 0;
        SS.gameStarted = false; SS.startCountdown = 3;
        SS.healthSpawnTimer = 0; SS.tempPowerupTimer = 0;
        SS.bossDefeatedLocotenent = 0;
        SS.bossDefeatedMaior = 0;
        SS.bossDefeatedColonelGeneral = 0;
        SS.bossDefeatedMaresal = 0;
        SS.bossDefeatedMareataNava = 0;
        SS.bossDefeatedAstroGeneral = 0;
        SS.bossDefeatedSecretarGeneral = 0;
        SS.bossWaveActive = false; SS.bossWaveType = null;
        SS.pendingBossGroups = [];
        SS.currentBossGroupIndex = 0;
        SS.bossGroupWaiting = false;
        SS.victoryScreenShown = false;
        SS.currentRunStartTime = performance.now();
        SS.inSecretMode = false;
        SS.secretModeStarted = false;
        SS.currentBackground = 'space';
        SS.playerImage = 'space-hetus';
        SS.playerImageLeft = 'space-hetus';
        SS.playerImageRight = null;
        SS.astroFightActive = false;
        SS.astroFightBoss = null;
        SS.astroFightPhase = 0;
        SS.flameActive = false;
        SS.flameTimer = 0;
        SS.flameCooldown = 0;
        SS.flameParticles = [];
        SS.finalBossActive = false;
        SS.finalBoss = null;
        SS.cutscenePlaying = false;
        SS.waveMilestonesDone = {};
        SS.bossWaveLockWave = -1;

        LASER_COOLDOWN = 10.0;
        SPACE_SHOOTER_CD = 15.0;
        ORB_CD = 2.0;
        PLAYER_DAMAGE_MULT = 1.0;
        HEALTH_PICKUP_CHANCE = 0.6;
        HEALTH_PICKUP_HEAL = 75;

        if (window.gameStats?.spaceShooter?.bestRun) {
            SS.bestRun = { ...window.gameStats.spaceShooter.bestRun };
        }

        SS.stars.forEach(s => {
            s.x = Math.random() * W;
            s.y = Math.random() * H;
        });

        sndVictory.pause();
        sndVictory.currentTime = 0;
        sndDefeat.pause();
        sndDefeat.currentTime = 0;

        if (typeof window.stopMenuMusic === 'function') window.stopMenuMusic();
        if (typeof stopAllMusic === 'function') stopAllMusic();
        document.querySelectorAll('audio').forEach(a => {
            if (a !== sndAstroShoot && a !== sndLaser && a !== sndExplosion &&
                a !== sndWin && a !== sndLose && a !== sndPickup &&
                a !== sndMeow1 && a !== sndMeow2 &&
                a !== sndBgmWave1 && a !== sndBgmWave10 && a !== sndBgmWave20 && a !== sndBgmSecret &&
                a !== sndVictory && a !== sndDefeat) {
                try { a.pause(); a.currentTime = 0; } catch(e) {}
            }
        });

        stopAllBgm();
        playBgmTier(1);

        requestAnimationFrame(ssLoop);
    }

    // ========== SPAWN ENEMY ==========
    function spawnEnemy() {
        let availableTypes = [1, 'pisica'];
        if (SS.wave >= 1) availableTypes.push(2);
        if (SS.wave >= 2) availableTypes.push(3);
        if (SS.wave >= 4) availableTypes.push(4);
        if (SS.wave >= 5) availableTypes.push('elite');
        if (SS.wave >= 20) availableTypes.push('cyberElite');
        if (SS.wave >= 25) availableTypes.push('foxfireElite');

        let type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        if (SS.wave >= 50 && SS.inSecretMode) {
            const r = Math.random();
            if (r < 0.25) type = 'pisica';
            else if (r < 0.55) type = 'elite';
            else if (r < 0.8) type = 'cyberElite';
            else if (r < 0.92) type = 'foxfireElite';
            else type = 'elite';
        } else if (SS.wave >= 40) {
            const r = Math.random();
            if (r < 0.3) type = 'cyberElite';
            else if (r < 0.5) type = 'foxfireElite';
            else if (r < 0.75) type = 'elite';
            else type = 'pisica';
        } else if (SS.wave >= 25) {
            const r = Math.random();
            if (r < 0.25) type = 'cyberElite';
            else if (r < 0.45) type = 'foxfireElite';
            else if (r < 0.70) type = 'elite';
            else type = 'pisica';
        } else if (SS.wave >= 15 && Math.random() < 0.5) {
            type = 'elite';
        } else if (SS.wave > 3 && Math.random() < 0.3) {
            const strongTypes = availableTypes.filter(t => t !== 'pisica' && t !== 1 && t !== 'elite' && t !== 'cyberElite' && t !== 'foxfireElite');
            if (strongTypes.length > 0) {
                type = strongTypes[Math.floor(Math.random() * strongTypes.length)];
            }
        }

        let isEliteScaled = false;
        if (type === 'elite' && SS.wave >= 15) isEliteScaled = true;
        if (type === 'cyberElite' && SS.wave >= 40) isEliteScaled = true;

        const cfg = ENEMY_CONFIG[type];
        const cfgKey = type;

        let width = cfg.width, height = cfg.height, hp = cfg.hp, damage = cfg.projectileDamage;

        if (isEliteScaled) {
            width *= 1.3; height *= 1.3; hp *= 1.5; damage *= 2;
        }

        SS.enemies.push({
            x: W + 50, y: 80 + Math.random() * (H - 160),
            type: type, typeKey: cfgKey,
            hp: hp, maxHp: hp,
            shootCooldown: cfg.shootCooldown * (0.5 + Math.random() * 0.5),
            speed: cfg.speed, damage: damage, score: cfg.score,
            width: width, height: height,
            projectile: cfg.projectile, projectileSpeed: cfg.projectileSpeed,
            projectileDamage: damage, projectileRadius: cfg.projectileRadius,
            neonRadius: cfg.neonRadius || 15,
            bobOffset: Math.random() * Math.PI * 2,
            bobSpeed: 1 + Math.random() * 2,
            isPisica: type === 'pisica',
            isElite: type === 'elite',
            isCyberElite: type === 'cyberElite',
            isFoxfireElite: type === 'foxfireElite',
            isBossLike: false,
            counted: false
        });
    }

    function spawnEliteEnemy() {
        SS.enemies.push({
            x: W + 50, y: 80 + Math.random() * (H - 160),
            type: 'elite', typeKey: 'elite',
            hp: ENEMY_CONFIG.elite.hp, maxHp: ENEMY_CONFIG.elite.hp,
            shootCooldown: 1.4, speed: 2.4, damage: 5, score: 400,
            width: 70, height: 70,
            projectile: 'neon', projectileSpeed: 8, projectileDamage: 5,
            projectileRadius: 15,
            bobOffset: Math.random() * Math.PI * 2, bobSpeed: 1.5,
            isPisica: false, isElite: true, isCyberElite: false, isFoxfireElite: false,
            isBossLike: false, counted: false
        });
    }

    function spawnFoxfireEnemy() {
        SS.enemies.push({
            x: W + 50, y: 80 + Math.random() * (H - 160),
            type: 'foxfireElite', typeKey: 'foxfireElite',
            hp: ENEMY_CONFIG.foxfireElite.hp, maxHp: ENEMY_CONFIG.foxfireElite.hp,
            shootCooldown: 1.0, speed: 1.5, damage: 20, score: 2000,
            width: 160, height: 100,
            projectile: 'both', projectileSpeed: 7, projectileDamage: 20,
            projectileRadius: 22, neonRadius: 16,
            bobOffset: Math.random() * Math.PI * 2, bobSpeed: 1,
            isPisica: false, isElite: false, isCyberElite: false, isFoxfireElite: true,
            isBossLike: false, counted: false
        });
    }

    function spawnCyberEnemy() {
        SS.enemies.push({
            x: W + 50, y: 80 + Math.random() * (H - 160),
            type: 'cyberElite', typeKey: 'cyberElite',
            hp: ENEMY_CONFIG.cyberElite.hp, maxHp: ENEMY_CONFIG.cyberElite.hp,
            shootCooldown: 1.4, speed: 1.8, damage: 15, score: 1200,
            width: 120, height: 120,
            projectile: 'plasma', projectileSpeed: 6, projectileDamage: 15,
            projectileRadius: 25, neonRadius: 15,
            bobOffset: Math.random() * Math.PI * 2, bobSpeed: 1,
            isPisica: false, isElite: false, isCyberElite: true, isFoxfireElite: false,
            isBossLike: false, counted: false
        });
    }

    // ========== SPAWN BOSS (MULTIPLE) ==========
    function spawnBoss(bossType) {
        const cfg = BOSS_CONFIG[bossType];
        const bossIndex = SS.bosses.length;
        const yOffset = bossIndex === 0 ? 0 : (bossIndex % 2 === 0 ? -1 : 1) * Math.min(150, bossIndex * 50);
        SS.bosses.push({
            type: bossType, x: W + 100 + bossIndex * 80, y: H / 2 + yOffset,
            hp: cfg.hp, maxHp: cfg.hp,
            shootCooldown: cfg.shootCooldown, speed: cfg.speed,
            damage: cfg.damage, score: cfg.score,
            width: cfg.width, height: cfg.height,
            projectile: cfg.projectile, projectileSpeed: cfg.projectileSpeed,
            projectileDamage: cfg.projectileDamage, projectileRadius: cfg.projectileRadius,
            neonRadius: cfg.neonRadius, meowSound: cfg.meowSound,
            hasTracingLaser: cfg.hasTracingLaser || false,
            hasDash: cfg.hasDash || false,
            extraPlasmaCount: cfg.extraPlasmaCount || 0,
            bobOffset: Math.random() * Math.PI * 2, bobSpeed: 1.5,
            targetX: BOSS_TARGET_X + (bossIndex % 3) * 60, enteredScreen: false,
            lastMeowTime: 0, tracingLaserCd: 3 + Math.random() * 3,
            tracingLaserActive: false, tracingLaserAngle: Math.PI,
            tracingLaserDuration: 0,
            dashCooldown: 5.0 + Math.random() * 3,
            dashActive: false,
            dashTargetX: 0,
            dashTargetY: 0,
            dashTimer: 0,
            facing: 'left',
            id: 'boss_' + Date.now() + '_' + Math.random()
        });
        SS.bossWaveActive = true;
        SS.bossWaveType = bossType;
    }

    function spawnCyberEliteBossLike(yPos) {
        const cfg = ENEMY_CONFIG.cyberElite;
        const targetX = W - 150 - Math.random() * 350;
        SS.enemies.push({
            x: W + 50, y: yPos,
            type: 'cyberElite', typeKey: 'cyberElite',
            hp: cfg.hp, maxHp: cfg.hp,
            shootCooldown: 1.0, speed: 2.5,
            damage: 15, score: 1200, width: 120, height: 120,
            projectile: 'plasma', projectileSpeed: 6, projectileDamage: 15,
            projectileRadius: 25, neonRadius: 15,
            bobOffset: Math.random() * Math.PI * 2, bobSpeed: 1,
            isPisica: false, isElite: false, isCyberElite: true, isFoxfireElite: false,
            isBossLike: true, targetX: Math.max(W / 2, targetX),
            counted: false
        });
    }

    // ========== SPAWN HEALTH PICKUP ==========
    function spawnHealthPickup() {
        SS.healthPickups.push({
            x: W + 40, y: 60 + Math.random() * (H - 120),
            vx: -HEALTH_PICKUP_SPEED, vy: 0,
            radius: HEALTH_PICKUP_RADIUS,
            pulse: Math.random() * Math.PI * 2,
            healAmount: HEALTH_PICKUP_HEAL
        });
    }

    function spawnTempPowerup(type) {
        SS.tempPowerups.push({
            x: W + 40, y: 60 + Math.random() * (H - 120),
            vx: -HEALTH_PICKUP_SPEED, vy: 0,
            radius: 22,
            pulse: Math.random() * Math.PI * 2,
            type: type,
            duration: TEMP_POWERUP_DURATION
        });
    }

    function spawnParticles(x, y, color, count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            SS.particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                life: 30 + Math.random() * 20, maxLife: 50,
                color: color, size: 2 + Math.random() * 3
            });
        }
    }

    // ========== WAVE PROGRESSION (MILESTONES) ==========
    function checkWaveMilestones() {
        // Stat upgrades
        if (SS.wave === 5) {
            SS.player.maxHp = 150;
            SS.player.hp = Math.min(SS.player.hp + 25, SS.player.maxHp);
            PLAYER_DAMAGE_MULT = 1.5;
            SPACE_SHOOTER_CD = 1.5;
        }
        if (SS.wave === 10) {
            SS.player.maxHp = 200;
            SS.player.hp = Math.min(SS.player.hp + 25, SS.player.maxHp);
            PLAYER_DAMAGE_MULT = 2.0;
            SPACE_SHOOTER_CD = 1.0;
            LASER_COOLDOWN = 7.0;
            ORB_CD = 1.8;
        }
        if (SS.wave === 15) {
            SS.player.maxHp = 300;
            SS.player.hp = Math.min(SS.player.hp + 25, SS.player.maxHp);
            PLAYER_DAMAGE_MULT = 2.5;
            LASER_COOLDOWN = 5.0;
            ORB_CD = 1.6;
        }
        if (SS.wave === 20) {
            SS.player.maxHp = 350;
            SS.player.hp = Math.min(SS.player.hp + 25, SS.player.maxHp);
            PLAYER_DAMAGE_MULT = 3.0;
            HEALTH_PICKUP_CHANCE = 0.75;
            ORB_CD = 1.4;
        }
        if (SS.wave === 25) {
            SS.player.maxHp = 400;
            SS.player.hp = Math.min(SS.player.hp + 25, SS.player.maxHp);
            PLAYER_DAMAGE_MULT = 3.5;
            HEALTH_PICKUP_CHANCE = 0.8;
            ORB_CD = 1.3;
        }
        if (SS.wave === 30) {
            SS.player.maxHp = 450;
            SS.player.hp = Math.min(SS.player.hp + 25, SS.player.maxHp);
            PLAYER_DAMAGE_MULT = 4.0;
            HEALTH_PICKUP_CHANCE = 0.85;
            ORB_CD = 1.2;
        }
        if (SS.wave === 35) {
            SS.player.maxHp = 500;
            SS.player.hp = Math.min(SS.player.hp + 25, SS.player.maxHp);
            PLAYER_DAMAGE_MULT = 4.5;
            ORB_CD = 1.1;
            HEALTH_PICKUP_HEAL = 125;
        }
        if (SS.wave === 40) {
            SS.player.maxHp = 550;
            SS.player.hp = Math.min(SS.player.hp + 30, SS.player.maxHp);
            PLAYER_DAMAGE_MULT = 5.0;
            ORB_CD = 1.0;
            HEALTH_PICKUP_HEAL = 150;
        }
        if (SS.wave === 45) {
            SS.player.maxHp = 600;
            SS.player.hp = Math.min(SS.player.hp + 30, SS.player.maxHp);
            PLAYER_DAMAGE_MULT = 5.5;
            ORB_CD = 0.9;
            HEALTH_PICKUP_HEAL = 175;
        }
        if (SS.wave === 50) {
            SS.player.maxHp = 700;
            SS.player.hp = Math.min(SS.player.hp + 50, SS.player.maxHp);
            PLAYER_DAMAGE_MULT = 6.0;
            SS.playerImage = 'space-hetus3-left';
            SS.playerImageLeft = 'space-hetus3-left';
            SS.playerImageRight = 'space-hetus3-right';
            ORB_CD = 0.8;
            HEALTH_PICKUP_HEAL = 200;
        }
        if (SS.wave === 55) {
            SS.player.maxHp = 800;
            SS.player.hp = Math.min(SS.player.hp + 50, SS.player.maxHp);
            PLAYER_DAMAGE_MULT = 7.0;
            ORB_CD = 0.7;
            HEALTH_PICKUP_HEAL = 225;
        }
        if (SS.wave === 60) {
            SS.player.maxHp = 1000;
            SS.player.hp = Math.min(SS.player.hp + 100, SS.player.maxHp);
            PLAYER_DAMAGE_MULT = 8.0;
            ORB_CD = 0.6;
            HEALTH_PICKUP_HEAL = 250;
        }

        // 🎯 BOSS WAVE GROUPS
        if (!SS.inSecretMode) {
            // 🎯 ADD: Valul 10 — 1x Locotenent
            if (SS.wave === 10 && !SS.waveMilestonesDone['wave10']) {
                SS.waveMilestonesDone['wave10'] = true;
                SS.pendingBossGroups = [
                    ['locotenent']
                ];
                SS.currentBossGroupIndex = 0;
                SS.bossGroupWaiting = false;
                SS.bossWaveLockWave = 10;
            }
            // 🎯 ADD: Valul 15 — 1x Locotenent (reapare)
            if (SS.wave === 15 && !SS.waveMilestonesDone['wave15']) {
                SS.waveMilestonesDone['wave15'] = true;
                SS.pendingBossGroups = [
                    ['locotenent']
                ];
                SS.currentBossGroupIndex = 0;
                SS.bossGroupWaiting = false;
                SS.bossWaveLockWave = 15;
            }
            // 🎯 ADD: Valul 20 — 1x Maior
            if (SS.wave === 20 && !SS.waveMilestonesDone['wave20']) {
                SS.waveMilestonesDone['wave20'] = true;
                SS.pendingBossGroups = [
                    ['maior']
                ];
                SS.currentBossGroupIndex = 0;
                SS.bossGroupWaiting = false;
                SS.bossWaveLockWave = 20;
            }
            // 🎯 ADD: Valul 25 — 7x Cyber Elite (deodată) → 1x Locotenent → 1x Maior
            if (SS.wave === 25 && !SS.waveMilestonesDone['wave25']) {
                SS.waveMilestonesDone['wave25'] = true;
                SS.pendingBossGroups = [
                    [...Array(7).fill('cyberEliteSpawn')],
                    ['locotenent'],
                    ['maior']
                ];
                SS.currentBossGroupIndex = 0;
                SS.bossGroupWaiting = false;
                SS.bossWaveLockWave = 25;
            }
            if (SS.wave === 30 && !SS.waveMilestonesDone['wave30']) {
                SS.waveMilestonesDone['wave30'] = true;
                SS.pendingBossGroups = [
                    [...Array(7).fill('eliteSpawn'), ...Array(3).fill('foxfireSpawn')],
                    ['locotenent', 'locotenent', 'maior'],
                    ['colonelGeneral']
                ];
                SS.currentBossGroupIndex = 0;
                SS.bossGroupWaiting = false;
                SS.bossWaveLockWave = 30;
            }
            if (SS.wave === 35 && !SS.waveMilestonesDone['wave35']) {
                SS.waveMilestonesDone['wave35'] = true;
                SS.pendingBossGroups = [
                    [...Array(7).fill('eliteSpawn'), ...Array(5).fill('foxfireSpawn')],
                    ['locotenent', 'locotenent', 'locotenent', 'maior'],
                    ['maior', 'maior', 'colonelGeneral'],
                    ['maresal']
                ];
                SS.currentBossGroupIndex = 0;
                SS.bossGroupWaiting = false;
                SS.bossWaveLockWave = 35;
            }
        } else {
            if (SS.wave === 40 && !SS.waveMilestonesDone['secret40']) {
                SS.waveMilestonesDone['secret40'] = true;
                SS.pendingBossGroups = [
                    [...Array(10).fill('eliteSpawn'), ...Array(5).fill('foxfireSpawn')],
                    ['locotenent', 'locotenent', 'locotenent', 'maior', 'maior'],
                    ['colonelGeneral', 'mareataNava']
                ];
                SS.currentBossGroupIndex = 0;
                SS.bossGroupWaiting = false;
                SS.bossWaveLockWave = 40;
            }
            if (SS.wave === 45 && !SS.waveMilestonesDone['secret45']) {
                SS.waveMilestonesDone['secret45'] = true;
                SS.pendingBossGroups = [
                    [...Array(15).fill('eliteSpawn'), ...Array(7).fill('foxfireSpawn')],
                    ['locotenent', 'locotenent', 'locotenent', 'locotenent', 'locotenent', 'maior', ...Array(3).fill('eliteSpawn')],
                    ['colonelGeneral', 'mareataNava', 'maior']
                ];
                SS.currentBossGroupIndex = 0;
                SS.bossGroupWaiting = false;
                SS.bossWaveLockWave = 45;
            }
            if (SS.wave === 50 && !SS.waveMilestonesDone['secret50']) {
                SS.waveMilestonesDone['secret50'] = true;
                SS.pendingBossGroups = [
                    [...Array(20).fill('eliteSpawn'), ...Array(10).fill('foxfireSpawn')],
                    ['locotenent', 'locotenent', 'locotenent', 'maior'],
                    ['mareataNava', 'maior', 'maior'],
                    ['astroGeneralFight']
                ];
                SS.currentBossGroupIndex = 0;
                SS.bossGroupWaiting = false;
                SS.bossWaveLockWave = 50;
            }
            if (SS.wave === 55 && !SS.waveMilestonesDone['secret55']) {
                SS.waveMilestonesDone['secret55'] = true;
                SS.pendingBossGroups = [
                    [...Array(20).fill('eliteSpawn'), ...Array(5).fill('foxfireSpawn')],
                    ['locotenent', 'locotenent', ...Array(10).fill('eliteSpawn')],
                    ['maior', 'maior', 'mareataNava'],
                    ['colonelGeneral'],
                    ['maresal']
                ];
                SS.currentBossGroupIndex = 0;
                SS.bossGroupWaiting = false;
                SS.bossWaveLockWave = 55;
            }
            if (SS.wave === 60 && !SS.waveMilestonesDone['secret60']) {
                SS.waveMilestonesDone['secret60'] = true;
                SS.pendingBossGroups = [
                    [...Array(30).fill('eliteSpawn'), ...Array(10).fill('eliteSpawn')],
                    [...Array(3).fill('eliteSpawn'), 'foxfireSpawn'],
                    [...Array(15).fill('foxfireSpawn'), 'locotenent'],
                    ['maior', 'maior', 'colonelGeneral'],
                    ['mareataNava', 'mareataNava', 'maresal'],
                    ['maior', 'maior', 'astroGeneralFinalFight'],
                    ['secretarGeneral']
                ];
                SS.currentBossGroupIndex = 0;
                SS.bossGroupWaiting = false;
                SS.bossWaveLockWave = 60;
            }
        }
    }

    // ========== BOSS GROUP PROCESSING ==========
    function processBossGroups() {
        if (SS.pendingBossGroups.length === 0) return;
        if (SS.currentBossGroupIndex >= SS.pendingBossGroups.length) {
            SS.pendingBossGroups = [];
            SS.currentBossGroupIndex = 0;
            SS.bossGroupWaiting = false;
            SS.bossWaveActive = false;
            SS.bossWaveType = null;
            SS.bossWaveLockWave = -1;
            return;
        }

        if (SS.bossGroupWaiting) {
            const allDead = SS.bosses.length === 0 &&
                            SS.enemies.length === 0 &&
                            !SS.astroFightActive &&
                            !SS.finalBossActive;
            if (allDead) {
                SS.bossGroupWaiting = false;
                SS.currentBossGroupIndex++;
            }
            return;
        }

        const group = SS.pendingBossGroups[SS.currentBossGroupIndex];
        let hasBoss = false;
        group.forEach(spawnType => {
            if (spawnType === 'eliteSpawn') spawnEliteEnemy();
            else if (spawnType === 'foxfireSpawn') spawnFoxfireEnemy();
            else if (spawnType === 'cyberEliteSpawn') spawnCyberEnemy();
            else if (spawnType === 'locotenent' || spawnType === 'maior' ||
                     spawnType === 'colonelGeneral' || spawnType === 'maresal' ||
                     spawnType === 'mareataNava') {
                spawnBoss(spawnType);
                hasBoss = true;
            } else if (spawnType === 'astroGeneralFight') {
                startAstroFight(false);
                hasBoss = true;
            } else if (spawnType === 'astroGeneralFinalFight') {
                startAstroFight(true);
                hasBoss = true;
            } else if (spawnType === 'secretarGeneral') {
                startFinalBoss();
                hasBoss = true;
            }
        });

        SS.bossGroupWaiting = true;
    }

    // ========== BOSS LASER ==========
    function updateBossTracingLaser(b, dt) {
        if (!b.hasTracingLaser) return;

        if (b.tracingLaserActive) {
            b.tracingLaserDuration -= dt;
            const playerAngle = Math.atan2(SS.player.y - b.y, SS.player.x - b.x);
            const diff = Math.atan2(Math.sin(playerAngle - b.tracingLaserAngle), Math.cos(playerAngle - b.tracingLaserAngle));
            b.tracingLaserAngle += diff * dt * 0.8;

            const laserDir = { x: Math.cos(b.tracingLaserAngle), y: Math.sin(b.tracingLaserAngle) };
            const px = SS.player.x - b.x, py = SS.player.y - b.y;
            const cross = Math.abs(px * laserDir.y - py * laserDir.x);
            const dot = px * laserDir.x + py * laserDir.y;
            if (dot > 0 && cross < 40) {
                SS.player.hp -= 40 * dt;
                SS.player.hitFlash = 0.5;
                if (SS.player.hp <= 0) ssGameOver();
            }

            if (b.tracingLaserDuration <= 0) {
                b.tracingLaserActive = false;
                b.tracingLaserCd = 6.0;
            }
        } else {
            b.tracingLaserCd -= dt;
            if (b.tracingLaserCd <= 0) {
                b.tracingLaserActive = true;
                b.tracingLaserDuration = 2.0;
                b.tracingLaserAngle = Math.atan2(SS.player.y - b.y, SS.player.x - b.x);
            }
        }
    }

    function updateBossDash(b, dt) {
        if (!b.hasDash) return;

        if (b.dashActive) {
            b.dashTimer -= dt;
            const dx = b.dashTargetX - b.x, dy = b.dashTargetY - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 10) {
                b.x += (dx / dist) * 15;
                b.y += (dy / dist) * 15;
            }
            if (Math.hypot(b.x - SS.player.x, b.y - SS.player.y) < b.width / 2) {
                SS.player.hp -= 50 * dt;
                SS.player.hitFlash = 0.5;
                if (SS.player.hp <= 0) ssGameOver();
            }
            if (b.dashTimer <= 0) {
                b.dashActive = false;
                b.dashCooldown = 5.0;
            }
        } else {
            b.dashCooldown -= dt;
            if (b.dashCooldown <= 0) {
                b.dashActive = true;
                b.dashTimer = 0.5;
                b.dashTargetX = SS.player.x + 100;
                b.dashTargetY = SS.player.y;
            }
        }
    }

    // ========== UPDATE ==========
    function updateSS(dt) {
        if (!SS.on || SS.ended || SS.cutscenePlaying) return;
        if (SS.paused) return;

        if (!SS.gameStarted) {
            SS.startCountdown -= dt;
            if (SS.startCountdown <= 0) SS.gameStarted = true;
            return;
        }

        SS.player.hitFlash = Math.max(0, SS.player.hitFlash - dt * 3);

        if (SS.player.shieldActive) {
            SS.player.shieldTimer -= dt;
            if (SS.player.shieldTimer <= 0) SS.player.shieldActive = false;
        }
        if (SS.player.rapidFireActive) {
            SS.player.rapidFireTimer -= dt;
            if (SS.player.rapidFireTimer <= 0) SS.player.rapidFireActive = false;
        }

        let k = window.keys || {};

        if (SS.astroFightActive && SS.astroFightPhase === 1) {
            let dx = 0, dy = 0;
            if (k['w'] || k['arrowup']) dy -= 1;
            if (k['s'] || k['arrowdown']) dy += 1;
            if (k['a'] || k['arrowleft']) dx -= 1;
            if (k['d'] || k['arrowright']) dx += 1;
            if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
            SS.player.x += dx * PLAYER_SPEED * 1.5;
            SS.player.y += dy * PLAYER_SPEED * 1.5;
            SS.player.x = Math.max(PLAYER_WIDTH / 2, Math.min(W - PLAYER_WIDTH / 2, SS.player.x));
            SS.player.y = Math.max(PLAYER_HEIGHT / 2, Math.min(H - PLAYER_HEIGHT / 2, SS.player.y));
            if (dx > 0) {
                SS.playerImage = SS.playerImageLeft;
            } else if (dx < 0) {
                SS.playerImage = SS.playerImageRight || SS.playerImageLeft;
            }
        } else if (!SS.astroFightActive || SS.astroFightPhase === 2) {
            let up = (k['w'] || k['arrowup'] ? 1 : 0);
            let down = (k['s'] || k['arrowdown'] ? 1 : 0);
            if (up) SS.player.y -= PLAYER_SPEED;
            if (down) SS.player.y += PLAYER_SPEED;
            SS.player.y = Math.max(PLAYER_HEIGHT / 2, Math.min(H - PLAYER_HEIGHT / 2, SS.player.y));
            SS.playerImage = SS.playerImageLeft;
        }

        if (SS.laserActive) {
            SS.laserTimer += dt;
            SS.laserUsedTime += dt;

            if (SS.laserTimer >= LASER_MAX_DURATION || !k['l']) {
                SS.laserActive = false;
                const usageRatio = Math.min(1, SS.laserUsedTime / LASER_MAX_DURATION);
                SS.laserCooldown = LASER_COOLDOWN * usageRatio;
                SS.laserUsedTime = 0;
            }
        } else if (SS.laserCooldown > 0) {
            SS.laserCooldown -= dt;
        }

        if (k['l'] && !SS.laserActive && SS.laserCooldown <= 0) {
            SS.laserActive = true;
            SS.laserTimer = 0;
            sndLaser.currentTime = 0;
            sndLaser.play().catch(() => {});
        }

        if (SS.laserActive) {
            const laserDPS = LASER_BASE_DPS * PLAYER_DAMAGE_MULT;
            SS.enemies.forEach(e => {
                if (e.x > SS.player.x && e.x < W) {
                    if (Math.abs(e.y - SS.player.y) < 40) {
                        e.hp -= laserDPS * dt;
                    }
                }
            });
            SS.bosses.forEach(b => {
                if (Math.abs(b.y - SS.player.y) < 60) {
                    b.hp -= laserDPS * dt;
                }
            });
            if (SS.astroFightBoss && SS.astroFightBoss.active && Math.abs(SS.astroFightBoss.y - SS.player.y) < 60) {
                SS.astroFightBoss.hp -= laserDPS * dt;
            }
            if (SS.finalBoss && SS.finalBoss.active && Math.abs(SS.finalBoss.y - SS.player.y) < 60) {
                SS.finalBoss.hp -= laserDPS * dt;
            }
        }

        SS.spaceShooterCd = Math.max(0, SS.spaceShooterCd - dt);
        const shootKey = SS.astroFightActive ? 'e' : 'd';

        if (k[shootKey] && SS.spaceShooterCd <= 0) {
            SS.spaceShooterCd = SPACE_SHOOTER_CD;
            SS.hetesianProjectiles.push({
                x: SS.player.x + PLAYER_WIDTH, y: SS.player.y,
                vx: HETESIAN_PROJECTILE_SPEED, vy: 0,
                width: 50, height: 40
            });
            sndExplosion.currentTime = 0;
            sndExplosion.volume = 0.3;
            sndExplosion.play().catch(() => {});
            setTimeout(() => { sndExplosion.volume = 1; }, 100);
        }

        SS.orbCd = Math.max(0, SS.orbCd - dt);

        if (k['f'] && SS.orbCd <= 0 && !SS.astroFightActive) {
            SS.orbCd = ORB_CD;
            const isHetus3 = SS.playerImage === 'space-hetus3-left' || SS.playerImage === 'space-hetus3-right';
            if (isHetus3) {
                SS.hetesianOrbs.push({ x: SS.player.x + PLAYER_WIDTH, y: SS.player.y - 25, vx: HETESIAN_ORB_SPEED, vy: -0.7 });
                SS.hetesianOrbs.push({ x: SS.player.x + PLAYER_WIDTH, y: SS.player.y, vx: HETESIAN_ORB_SPEED, vy: 0 });
                SS.hetesianOrbs.push({ x: SS.player.x + PLAYER_WIDTH, y: SS.player.y + 25, vx: HETESIAN_ORB_SPEED, vy: 0.7 });
            } else {
                SS.hetesianOrbs.push({ x: SS.player.x + PLAYER_WIDTH, y: SS.player.y - 15, vx: HETESIAN_ORB_SPEED, vy: -0.5 });
                SS.hetesianOrbs.push({ x: SS.player.x + PLAYER_WIDTH, y: SS.player.y + 15, vx: HETESIAN_ORB_SPEED, vy: 0.5 });
            }
        }

        if (SS.playerImage === 'space-hetus3-left' || SS.playerImage === 'space-hetus3-right') {
            if (SS.flameActive) {
                SS.flameTimer += dt;
                const flameDmg = 200 * PLAYER_DAMAGE_MULT * dt;
                SS.enemies.forEach(e => {
                    if (e.x > SS.player.x - 100 && e.x < SS.player.x + 400 &&
                        Math.abs(e.y - SS.player.y) < 80) {
                        e.hp -= flameDmg;
                    }
                });
                SS.bosses.forEach(b => {
                    if (b.enteredScreen && Math.abs(b.y - SS.player.y) < 120) {
                        b.hp -= flameDmg * 1.5;
                    }
                });
                if (SS.astroFightBoss && SS.astroFightBoss.active) {
                    if (Math.abs(SS.astroFightBoss.y - SS.player.y) < 120) {
                        SS.astroFightBoss.hp -= flameDmg * 1.5;
                    }
                }
                if (SS.finalBoss && SS.finalBoss.active) {
                    if (Math.abs(SS.finalBoss.y - SS.player.y) < 120) {
                        SS.finalBoss.hp -= flameDmg * 1.5;
                    }
                }
                for (let i = 0; i < 3; i++) {
                    SS.flameParticles.push({
                        x: SS.player.x + 40, y: SS.player.y + (Math.random() - 0.5) * 40,
                        vx: 8 + Math.random() * 6, vy: (Math.random() - 0.5) * 4,
                        life: 20, maxLife: 20,
                        color: Math.random() < 0.5 ? '#ff4400' : '#ffcc00'
                    });
                }
                if (SS.flameTimer >= SS.FLAME_MAX_DURATION) {
                    SS.flameActive = false;
                    SS.flameCooldown = SS.FLAME_COOLDOWN;
                    SS.flameTimer = 0;
                }
            } else if (SS.flameCooldown > 0) {
                SS.flameCooldown -= dt;
            }

            if (k['c'] && !SS.flameActive && SS.flameCooldown <= 0) {
                SS.flameActive = true;
                SS.flameTimer = 0;
                sndLaser.currentTime = 0;
                sndLaser.play().catch(() => {});
            }
        }

        if (SS.pendingBossGroups.length > 0 && !SS.cutscenePlaying) {
            processBossGroups();
        }

        if (SS.pendingBossGroups.length === 0 && !SS.bossWaveActive &&
            !SS.astroFightActive && !SS.finalBossActive && !SS.cutscenePlaying) {
            SS.spawnTimer += dt;
            const maxEnemies = Math.min(10, 4 + Math.floor(SS.wave * 0.3));

            if (SS.spawnTimer >= SS.spawnInterval && SS.enemies.length < maxEnemies) {
                SS.spawnTimer = 0;
                spawnEnemy();
                if (SS.wave > 2 && Math.random() < 0.15 && SS.enemies.length < maxEnemies) spawnEnemy();
            }
        }

        SS.healthSpawnTimer += dt;
        const healthInterval = SS.bossWaveActive ? BOSS_HEALTH_PICKUP_INTERVAL : HEALTH_PICKUP_SPAWN_INTERVAL;
        if (SS.healthSpawnTimer >= healthInterval) {
            SS.healthSpawnTimer = 0;
            const chance = SS.bossWaveActive ? 0.95 : HEALTH_PICKUP_CHANCE;
            if ((SS.player.hp < SS.player.maxHp && Math.random() < chance) || Math.random() < 0.3) {
                spawnHealthPickup();
            }
        }

        if (SS.bossWaveActive) {
            SS.tempPowerupTimer += dt;
            if (SS.tempPowerupTimer >= TEMP_POWERUP_SPAWN_INTERVAL) {
                SS.tempPowerupTimer = 0;
                const type = Math.random() < 0.5 ? 'shield' : 'rapidFire';
                spawnTempPowerup(type);
            }
        }

        SS.enemies.forEach(e => {
            if (e.isBossLike) {
                if (e.x > e.targetX) e.x -= e.speed;
            } else {
                e.x -= e.speed;
            }
            e.bobOffset += e.bobSpeed * dt;
            e.y = e.y + Math.sin(e.bobOffset) * 0.5;
            e.y = Math.max(e.height / 2, Math.min(H - e.height / 2, e.y));

            if (e.x > SS.player.x + 20 && SS.enemyBullets.length < MAX_ENEMY_BULLETS) {
                e.shootCooldown -= dt;
                if (e.shootCooldown <= 0) {
                    e.shootCooldown = ENEMY_CONFIG[e.typeKey].shootCooldown * (0.8 + Math.random() * 0.4);
                    const dx = SS.player.x - e.x, dy = SS.player.y - e.y;
                    const dist = Math.hypot(dx, dy) || 1;
                    SS.enemyBullets.push({
                        x: e.x, y: e.y,
                        vx: (dx / dist) * e.projectileSpeed,
                        vy: (dy / dist) * e.projectileSpeed,
                        radius: e.projectileRadius,
                        projectileType: e.projectile === 'both' ? 'plasma' : e.projectile,
                        damage: e.projectileDamage
                    });
                    if (e.projectile === 'both' && e.neonRadius) {
                        SS.enemyBullets.push({
                            x: e.x, y: e.y + 20,
                            vx: (dx / dist) * (e.projectileSpeed + 1),
                            vy: (dy / dist) * (e.projectileSpeed + 1),
                            radius: e.neonRadius,
                            projectileType: 'neon',
                            damage: Math.floor(e.projectileDamage * 0.6)
                        });
                    }
                    sndAstroShoot.currentTime = 0;
                    sndAstroShoot.volume = 0.3;
                    sndAstroShoot.play().catch(() => {});
                    setTimeout(() => { sndAstroShoot.volume = 1; }, 100);
                }
            }
        });
        SS.enemies = SS.enemies.filter(e => e.x > -100);

        SS.bosses.forEach(b => {
            if (!b.enteredScreen) {
                b.x -= b.speed;
                if (b.x <= b.targetX) {
                    b.x = b.targetX;
                    b.enteredScreen = true;
                }
            } else {
                b.x = b.targetX;
                b.bobOffset += b.bobSpeed * dt;
                b.y = H / 2 + Math.sin(b.bobOffset) * 150;
            }

            b.shootCooldown -= dt;
            if (b.shootCooldown <= 0 && b.enteredScreen && !b.dashActive && !b.tracingLaserActive &&
                SS.enemyBullets.length < MAX_ENEMY_BULLETS) {
                b.shootCooldown = BOSS_CONFIG[b.type].shootCooldown * (0.8 + Math.random() * 0.4);
                const dx = SS.player.x - b.x, dy = SS.player.y - b.y;
                const dist = Math.hypot(dx, dy) || 1;

                SS.enemyBullets.push({
                    x: b.x, y: b.y - 30,
                    vx: (dx / dist) * b.projectileSpeed,
                    vy: (dy / dist) * b.projectileSpeed,
                    radius: b.projectileRadius,
                    projectileType: 'plasma',
                    damage: b.projectileDamage
                });
                SS.enemyBullets.push({
                    x: b.x, y: b.y + 30,
                    vx: (dx / dist) * (b.projectileSpeed + 1),
                    vy: (dy / dist) * (b.projectileSpeed + 1),
                    radius: b.neonRadius,
                    projectileType: 'neon',
                    damage: Math.floor(b.projectileDamage * 0.6)
                });

                for (let i = 0; i < b.extraPlasmaCount; i++) {
                    const offsetY = (i - b.extraPlasmaCount / 2) * 50;
                    SS.enemyBullets.push({
                        x: b.x, y: b.y + offsetY,
                        vx: (dx / dist) * b.projectileSpeed,
                        vy: (dy / dist) * b.projectileSpeed,
                        radius: b.projectileRadius,
                        projectileType: 'plasma',
                        damage: b.projectileDamage
                    });
                }

                sndAstroShoot.currentTime = 0;
                sndAstroShoot.volume = 0.4;
                sndAstroShoot.play().catch(() => {});
                setTimeout(() => { sndAstroShoot.volume = 1; }, 100);
            }

            if (b.hasTracingLaser && !b.dashActive) updateBossTracingLaser(b, dt);
            if (b.hasDash) updateBossDash(b, dt);
        });

        SS.hetesianProjectiles.forEach(p => { p.x += p.vx; });

        SS.hetesianProjectiles.forEach((p, pi) => {
            let hit = false;
            const rocketDmg = ROCKET_BASE_DAMAGE * PLAYER_DAMAGE_MULT;

            SS.enemies.forEach(e => {
                if (!hit && e.hp > 0 &&
                    p.x + p.width > e.x - e.width / 2 &&
                    p.x < e.x + e.width / 2 &&
                    p.y > e.y - e.height / 2 &&
                    p.y < e.y + e.height / 2) {
                    e.hp -= 999;
                    SS.explosions.push({ x: e.x, y: e.y, duration: 30, maxDuration: 30 });
                    spawnParticles(e.x, e.y, '#ff6600', 20);
                    sndExplosion.currentTime = 0;
                    sndExplosion.play().catch(() => {});
                    SS.hetesianProjectiles.splice(pi, 1);
                    hit = true;
                }
            });
            if (!hit) {
                SS.bosses.forEach(b => {
                    if (!hit && b.enteredScreen && b.hp > 0 &&
                        p.x + p.width > b.x - b.width / 2 &&
                        p.x < b.x + b.width / 2 &&
                        p.y > b.y - b.height / 2 &&
                        p.y < b.y + b.height / 2) {
                        b.hp -= rocketDmg;
                        SS.hetesianProjectiles.splice(pi, 1);
                        SS.explosions.push({ x: b.x, y: b.y, duration: 30, maxDuration: 30 });
                        spawnParticles(b.x, b.y, '#ff6600', 25);
                        if (b.meowSound) {
                            b.meowSound.currentTime = 0;
                            b.meowSound.volume = 0.6;
                            b.meowSound.play().catch(() => {});
                            setTimeout(() => { if (b.meowSound) b.meowSound.volume = 1; }, 100);
                        }
                        hit = true;
                    }
                });
            }
            if (!hit && SS.astroFightBoss && SS.astroFightBoss.active && SS.astroFightBoss.hp > 0 &&
                p.x + p.width > SS.astroFightBoss.x - SS.astroFightBoss.width / 2 &&
                p.x < SS.astroFightBoss.x + SS.astroFightBoss.width / 2 &&
                p.y > SS.astroFightBoss.y - SS.astroFightBoss.height / 2 &&
                p.y < SS.astroFightBoss.y + SS.astroFightBoss.height / 2) {
                SS.astroFightBoss.hp -= rocketDmg;
                SS.hetesianProjectiles.splice(pi, 1);
                SS.explosions.push({ x: SS.astroFightBoss.x, y: SS.astroFightBoss.y, duration: 30, maxDuration: 30 });
                spawnParticles(SS.astroFightBoss.x, SS.astroFightBoss.y, '#ff6600', 25);
                hit = true;
            }
            if (!hit && SS.finalBoss && SS.finalBoss.active && SS.finalBoss.hp > 0 &&
                p.x + p.width > SS.finalBoss.x - SS.finalBoss.width / 2 &&
                p.x < SS.finalBoss.x + SS.finalBoss.width / 2 &&
                p.y > SS.finalBoss.y - SS.finalBoss.height / 2 &&
                p.y < SS.finalBoss.y + SS.finalBoss.height / 2) {
                SS.finalBoss.hp -= rocketDmg;
                SS.hetesianProjectiles.splice(pi, 1);
                SS.explosions.push({ x: SS.finalBoss.x, y: SS.finalBoss.y, duration: 30, maxDuration: 30 });
                spawnParticles(SS.finalBoss.x, SS.finalBoss.y, '#ff6600', 25);
                hit = true;
            }
        });
        SS.hetesianProjectiles = SS.hetesianProjectiles.filter(p => p.x < W + 100);

        SS.hetesianOrbs.forEach(o => { o.x += o.vx; o.y += o.vy; });

        SS.hetesianOrbs.forEach((o, oi) => {
            let hit = false;
            const orbDmg = ORB_BASE_DAMAGE * PLAYER_DAMAGE_MULT;

            SS.enemies.forEach(e => {
                if (!hit && e.hp > 0 && Math.hypot(o.x - e.x, o.y - e.y) < 40) {
                    e.hp -= orbDmg;
                    if (e.hp <= 0) {
                        SS.explosions.push({ x: e.x, y: e.y, duration: 25, maxDuration: 25 });
                        spawnParticles(e.x, e.y, '#00ffcc', 15);
                    }
                    SS.hetesianOrbs.splice(oi, 1);
                    hit = true;
                }
            });
            if (!hit) {
                SS.bosses.forEach(b => {
                    if (!hit && b.enteredScreen && b.hp > 0 &&
                        Math.hypot(o.x - b.x, o.y - b.y) < b.width / 2) {
                        b.hp -= orbDmg * 1.2;
                        SS.hetesianOrbs.splice(oi, 1);
                        if (Math.random() < 0.3 && b.meowSound) {
                            b.meowSound.currentTime = 0;
                            b.meowSound.volume = 0.5;
                            b.meowSound.play().catch(() => {});
                            setTimeout(() => { if (b.meowSound) b.meowSound.volume = 1; }, 100);
                        }
                        hit = true;
                    }
                });
            }
            if (!hit && SS.astroFightBoss && SS.astroFightBoss.active && SS.astroFightBoss.hp > 0 &&
                Math.hypot(o.x - SS.astroFightBoss.x, o.y - SS.astroFightBoss.y) < SS.astroFightBoss.width / 2) {
                SS.astroFightBoss.hp -= orbDmg * 1.2;
                SS.hetesianOrbs.splice(oi, 1);
                hit = true;
            }
            if (!hit && SS.finalBoss && SS.finalBoss.active && SS.finalBoss.hp > 0 &&
                Math.hypot(o.x - SS.finalBoss.x, o.y - SS.finalBoss.y) < SS.finalBoss.width / 2) {
                SS.finalBoss.hp -= orbDmg * 1.2;
                SS.hetesianOrbs.splice(oi, 1);
                hit = true;
            }
        });
        SS.hetesianOrbs = SS.hetesianOrbs.filter(o => o.x < W + 100 && o.y > -50 && o.y < H + 50);

        SS.healthPickups.forEach(hp => { hp.x += hp.vx; hp.pulse += dt * 4; });

        SS.healthPickups.forEach((hp, hpi) => {
            const dist = Math.hypot(hp.x - SS.player.x, hp.y - SS.player.y);
            if (dist < hp.radius + 40) {
                SS.player.hp = Math.min(SS.player.maxHp, SS.player.hp + hp.healAmount);
                SS.healthPickups.splice(hpi, 1);
                sndPickup.currentTime = 0;
                sndPickup.play().catch(() => {});
                SS.explosions.push({ x: SS.player.x, y: SS.player.y, duration: 20, maxDuration: 20, isHeal: true });
            }
        });
        SS.healthPickups = SS.healthPickups.filter(hp => hp.x > -60);

        SS.tempPowerups.forEach(p => { p.x += p.vx; p.pulse += dt * 4; });

        SS.tempPowerups.forEach((p, pi) => {
            const dist = Math.hypot(p.x - SS.player.x, p.y - SS.player.y);
            if (dist < p.radius + 40) {
                if (p.type === 'shield') {
                    SS.player.shieldActive = true;
                    SS.player.shieldTimer = p.duration;
                } else if (p.type === 'rapidFire') {
                    SS.player.rapidFireActive = true;
                    SS.player.rapidFireTimer = p.duration;
                }
                SS.tempPowerups.splice(pi, 1);
                sndPickup.currentTime = 0;
                sndPickup.play().catch(() => {});
                SS.explosions.push({ x: SS.player.x, y: SS.player.y, duration: 25, maxDuration: 25, isHeal: true });
            }
        });
        SS.tempPowerups = SS.tempPowerups.filter(p => p.x > -60);

        SS.enemyBullets.forEach(b => { b.x += b.vx; b.y += b.vy; });

        SS.enemyBullets.forEach((b, bi) => {
            if (Math.hypot(b.x - SS.player.x, b.y - SS.player.y) < 35) {
                if (SS.player.shieldActive) {
                    SS.enemyBullets.splice(bi, 1);
                    spawnParticles(b.x, b.y, '#00ffff', 8);
                    return;
                }
                SS.player.hp -= (b.damage || 5);
                SS.player.hitFlash = 0.5;
                SS.enemyBullets.splice(bi, 1);
                if (SS.player.hp <= 0) ssGameOver();
            }
        });
        SS.enemyBullets = SS.enemyBullets.filter(b => b.x > -50 && b.x < W + 50 && b.y > -50 && b.y < H + 50);

        SS.enemies.forEach(e => {
            if (e.hp <= 0 && !e.counted) {
                e.counted = true;
                SS.kills++;
                SS.boykissersDefeated++;
                SS.score += e.score;

                SS.explosions.push({ x: e.x, y: e.y, duration: 30, maxDuration: 30 });
                spawnParticles(e.x, e.y,
                    e.isElite ? '#ff00ff' : (e.isCyberElite ? '#00ffcc' : (e.isFoxfireElite ? '#ff6600' : '#ffaa00')),
                    20);
                sndExplosion.currentTime = 0;
                sndExplosion.volume = 0.5;
                sndExplosion.play().catch(() => {});
                setTimeout(() => { sndExplosion.volume = 1; }, 100);

                if (SS.kills % 10 === 0 && SS.pendingBossGroups.length === 0 && !SS.bossWaveActive) {
                    SS.wave++;
                    SS.spawnInterval = Math.max(1.2, 2.5 - SS.wave * 0.1);
                    updateBgmForWave(SS.wave);
                    checkWaveMilestones();
                }
            }
        });
        SS.enemies = SS.enemies.filter(e => e.hp > 0);

        SS.bosses = SS.bosses.filter(b => {
            if (b.hp <= 0) {
                SS.score += b.score;
                SS.boykissersDefeated++;

                for (let i = 0; i < 8; i++) {
                    setTimeout(() => {
                        if (!SS.on) return;
                        const ex = b.x + (Math.random() - 0.5) * 100;
                        const ey = b.y + (Math.random() - 0.5) * 100;
                        SS.explosions.push({ x: ex, y: ey, duration: 40, maxDuration: 40 });
                        spawnParticles(ex, ey, '#ff4400', 30);
                        sndExplosion.currentTime = 0;
                        sndExplosion.play().catch(() => {});
                    }, i * 100);
                }

                if (b.type === 'locotenent') {
                    SS.bossDefeatedLocotenent++;
                } else if (b.type === 'maior') {
                    SS.bossDefeatedMaior++;
                    unlockMaiorAchievement();
                } else if (b.type === 'colonelGeneral') {
                    SS.bossDefeatedColonelGeneral++;
                } else if (b.type === 'maresal') {
                    SS.bossDefeatedMaresal++;
                    unlockMaresalAchievement();
                } else if (b.type === 'mareataNava') {
                    SS.bossDefeatedMareataNava++;
                }
                return false;
            }
            return true;
        });

        if (SS.bosses.length === 0 && SS.pendingBossGroups.length === 0) {
            if (!SS.inSecretMode && SS.wave === 35 && SS.waveMilestonesDone['wave35'] &&
                SS.bossDefeatedMaresal > 0 && !SS.waveMilestonesDone['afterMaresal35']) {
                SS.waveMilestonesDone['afterMaresal35'] = true;
                handleAfterMaresal35();
            }
            if (SS.bossWaveActive && SS.pendingBossGroups.length === 0 && SS.bosses.length === 0 &&
                !SS.astroFightActive && !SS.finalBossActive) {
                SS.bossWaveActive = false;
                SS.bossWaveType = null;
                SS.bossWaveLockWave = -1;
            }
        }

        if (SS.astroFightActive && SS.astroFightBoss && SS.astroFightBoss.active) {
            updateAstroFight(dt);
        }

        if (SS.finalBossActive && SS.finalBoss && SS.finalBoss.active) {
            updateFinalBoss(dt);
        }

        SS.flameParticles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.life--;
        });
        SS.flameParticles = SS.flameParticles.filter(p => p.life > 0);

        SS.explosions.forEach(ex => { ex.duration--; });
        SS.explosions = SS.explosions.filter(ex => ex.duration > 0);

        SS.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            p.vx *= 0.95; p.vy *= 0.95;
            p.life--;
        });
        SS.particles = SS.particles.filter(p => p.life > 0);

        SS.stars.forEach(s => {
            s.x -= s.speed;
            if (s.x < -10) { s.x = W + 10; s.y = Math.random() * H; }
        });

        SS.bgScroll += dt * 30;
    }

    // ========== ASTRO FIGHT ==========
    function startAstroFight(isFinal) {
        SS.astroFightActive = true;
        SS.astroFightPhase = 1;
        SS.player.x = W / 2;
        SS.player.y = H / 2;
        SS.playerImage = SS.playerImageLeft;
        const cfg = isFinal ? BOSS_CONFIG.astroGeneralFinal : BOSS_CONFIG.astroGeneral;
        SS.astroFightBoss = {
            x: W - 200, y: H / 2,
            hp: cfg.hp, maxHp: cfg.hp,
            width: cfg.width, height: cfg.height,
            active: true,
            isFinal: isFinal,
            shootCooldown: 1.0,
            dashCooldown: 4.0,
            dashActive: false,
            dashTimer: 0,
            dashTargetX: 0,
            dashTargetY: 0,
            facing: 'left',
            laserCooldown: 8.0,
            laserActive: false,
            laserTimer: 0,
            laserAngle: 0,
            projectileSpeed: cfg.projectileSpeed,
            projectileDamage: cfg.projectileDamage,
            projectileRadius: cfg.projectileRadius,
            neonRadius: cfg.neonRadius,
            extraPlasmaCount: cfg.extraPlasmaCount || 3,
            disappearing: false,
            disappearTimer: 0
        };
    }

    function updateAstroFight(dt) {
        const b = SS.astroFightBoss;
        if (!b || !b.active) return;

        if (b.disappearing) {
            b.disappearTimer -= dt;
            b.x += 25;
            b.facing = 'right';
            if (b.disappearTimer <= 0) {
                b.active = false;
                SS.astroFightActive = false;
                SS.astroFightPhase = 2;
                SS.player.x = PLAYER_START_X;
                SS.player.y = H / 2;
                SS.playerImage = SS.playerImageLeft;
                SS.score += 80000;
                SS.boykissersDefeated += 2;
                unlockAstroGeneralAchievement();
                SS.astroFightBoss = null;
                if (SS.wave >= 50 && SS.currentBackground === 'space') {
                    SS.currentBackground = 'planet';
                }
            }
            return;
        }

        if (b.dashActive) {
            b.dashTimer -= dt;
            const dx = b.dashTargetX - b.x, dy = b.dashTargetY - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 10) {
                b.x += (dx / dist) * 18;
                b.y += (dy / dist) * 18;
            }
            if (Math.hypot(b.x - SS.player.x, b.y - SS.player.y) < b.width / 2) {
                SS.player.hp -= 60 * dt;
                SS.player.hitFlash = 0.5;
                if (SS.player.hp <= 0) { ssGameOver(); return; }
            }
            if (b.dashTimer <= 0) {
                b.dashActive = false;
                b.dashCooldown = 4.0;
                b.facing = b.x > W / 2 ? 'left' : 'right';
            }
        } else {
            b.dashCooldown -= dt;
            if (b.dashCooldown <= 0) {
                b.dashActive = true;
                b.dashTimer = 0.4;
                b.dashTargetX = SS.player.x + 150;
                b.dashTargetY = SS.player.y;
                b.facing = 'left';
            }
        }

        if (b.laserActive) {
            b.laserTimer -= dt;
            const playerAngle = Math.atan2(SS.player.y - b.y, SS.player.x - b.x);
            const diff = Math.atan2(Math.sin(playerAngle - b.laserAngle), Math.cos(playerAngle - b.laserAngle));
            b.laserAngle += diff * dt;
            const laserDir = { x: Math.cos(b.laserAngle), y: Math.sin(b.laserAngle) };
            const px = SS.player.x - b.x, py = SS.player.y - b.y;
            const cross = Math.abs(px * laserDir.y - py * laserDir.x);
            if (px * laserDir.x + py * laserDir.y > 0 && cross < 35) {
                SS.player.hp -= 50 * dt;
                SS.player.hitFlash = 0.5;
                if (SS.player.hp <= 0) { ssGameOver(); return; }
            }
            if (b.laserTimer <= 0) {
                b.laserActive = false;
                b.laserCooldown = 8.0;
            }
        } else {
            b.laserCooldown -= dt;
            if (b.laserCooldown <= 0 && !b.dashActive) {
                b.laserActive = true;
                b.laserTimer = 2.0;
                b.laserAngle = Math.atan2(SS.player.y - b.y, SS.player.x - b.x);
            }
        }

        if (!b.laserActive && !b.dashActive) {
            b.shootCooldown -= dt;
            if (b.shootCooldown <= 0 && SS.enemyBullets.length < MAX_ENEMY_BULLETS) {
                b.shootCooldown = 0.8;
                const dx = SS.player.x - b.x, dy = SS.player.y - b.y;
                const dist = Math.hypot(dx, dy) || 1;
                for (let i = 0; i < b.extraPlasmaCount; i++) {
                    const offsetY = (i - b.extraPlasmaCount / 2) * 40;
                    SS.enemyBullets.push({
                        x: b.x, y: b.y + offsetY,
                        vx: (dx / dist) * b.projectileSpeed,
                        vy: (dy / dist) * b.projectileSpeed,
                        radius: b.projectileRadius,
                        projectileType: 'plasma',
                        damage: b.projectileDamage
                    });
                }
                sndAstroShoot.currentTime = 0;
                sndAstroShoot.volume = 0.5;
                sndAstroShoot.play().catch(() => {});
            }
        }

        if (b.hp <= 0) {
            if (!b.isFinal && !b.disappearing) {
                b.disappearing = true;
                b.disappearTimer = 0.6;
            } else if (b.isFinal) {
                b.active = false;
                SS.astroFightActive = false;
                SS.astroFightPhase = 2;
                SS.player.x = PLAYER_START_X;
                SS.player.y = H / 2;
                SS.playerImage = SS.playerImageLeft;
                SS.score += 100000;
                SS.boykissersDefeated += 3;
                SS.bossDefeatedAstroGeneral++;
                unlockAstroGeneralAchievement();
                SS.astroFightBoss = null;
            }
        }
    }

    // ========== FINAL BOSS ==========
    function startFinalBoss() {
        SS.finalBossActive = true;
        const cfg = BOSS_CONFIG.secretarGeneral;
        SS.finalBoss = {
            x: W - 300, y: H / 2,
            hp: cfg.hp, maxHp: cfg.hp,
            width: cfg.width, height: cfg.height,
            active: true,
            shootCooldown: 1.0,
            laserCooldown: 6.0,
            laserActive: false,
            laserTimer: 0,
            laserAngle: 0,
            projectileSpeed: cfg.projectileSpeed,
            projectileDamage: cfg.projectileDamage,
            projectileRadius: cfg.projectileRadius,
            neonRadius: cfg.neonRadius,
            extraPlasmaCount: cfg.extraPlasmaCount,
            enteredScreen: false,
            targetX: BOSS_TARGET_X,
            bobOffset: 0
        };
        SS.bossWaveActive = true;
        SS.bossWaveType = 'secretarGeneral';
    }

    function updateFinalBoss(dt) {
        const b = SS.finalBoss;
        if (!b || !b.active) return;

        if (!b.enteredScreen) {
            b.x -= 1.5;
            if (b.x <= b.targetX) {
                b.x = b.targetX;
                b.enteredScreen = true;
            }
        } else {
            b.x = b.targetX;
            b.bobOffset += dt * 1.5;
            b.y = H / 2 + Math.sin(b.bobOffset) * 120;
        }

        if (b.laserActive) {
            b.laserTimer -= dt;
            const playerAngle = Math.atan2(SS.player.y - b.y, SS.player.x - b.x);
            const diff = Math.atan2(Math.sin(playerAngle - b.laserAngle), Math.cos(playerAngle - b.laserAngle));
            b.laserAngle += diff * dt * 0.8;
            const laserDir = { x: Math.cos(b.laserAngle), y: Math.sin(b.laserAngle) };
            const px = SS.player.x - b.x, py = SS.player.y - b.y;
            const cross = Math.abs(px * laserDir.y - py * laserDir.x);
            if (px * laserDir.x + py * laserDir.y > 0 && cross < 40) {
                SS.player.hp -= 50 * dt;
                SS.player.hitFlash = 0.5;
                if (SS.player.hp <= 0) { ssGameOver(); return; }
            }
            if (b.laserTimer <= 0) {
                b.laserActive = false;
                b.laserCooldown = 6.0;
            }
        } else {
            b.laserCooldown -= dt;
            if (b.laserCooldown <= 0) {
                b.laserActive = true;
                b.laserTimer = 2.5;
                b.laserAngle = Math.atan2(SS.player.y - b.y, SS.player.x - b.x);
            }
        }

        if (!b.laserActive) {
            b.shootCooldown -= dt;
            if (b.shootCooldown <= 0 && SS.enemyBullets.length < MAX_ENEMY_BULLETS) {
                b.shootCooldown = 0.6;
                const dx = SS.player.x - b.x, dy = SS.player.y - b.y;
                const dist = Math.hypot(dx, dy) || 1;
                for (let i = 0; i < b.extraPlasmaCount; i++) {
                    const offsetY = (i - b.extraPlasmaCount / 2) * 45;
                    SS.enemyBullets.push({
                        x: b.x, y: b.y + offsetY,
                        vx: (dx / dist) * b.projectileSpeed,
                        vy: (dy / dist) * b.projectileSpeed,
                        radius: b.projectileRadius,
                        projectileType: 'plasma',
                        damage: b.projectileDamage
                    });
                }
                SS.enemyBullets.push({
                    x: b.x, y: b.y,
                    vx: (dx / dist) * (b.projectileSpeed + 1),
                    vy: (dy / dist) * (b.projectileSpeed + 1),
                    radius: b.neonRadius,
                    projectileType: 'neon',
                    damage: Math.floor(b.projectileDamage * 0.6)
                });
                sndAstroShoot.currentTime = 0;
                sndAstroShoot.play().catch(() => {});
            }
        }

        if (b.hp <= 0) {
            b.active = false;
            SS.finalBossActive = false;
            SS.bossWaveActive = false;
            SS.bossWaveType = null;
            SS.bossDefeatedSecretarGeneral++;
            SS.score += 150000;
            SS.boykissersDefeated += 5;
            unlockTotalVictoryAchievement();
            unlockSecretarGeneralAchievement();
            triggerVictory();
        }
    }

    // ========== HANDLE AFTER MARESAL 35 ==========
    function handleAfterMaresal35() {
        const totalKills = (window.gameStats?.spaceShooter?.totalBoykissersDefeated || 0) + SS.boykissersDefeated;
        const has5000 = window.gameStats?.spaceShooter?.achievements?.kills5000 || totalKills >= 5000;
        const hasTotalVictory = window.gameStats?.spaceShooter?.achievements?.totalVictory;

        if (hasTotalVictory && has5000) {
            showSecretChoiceScreen();
        } else if (has5000) {
            playCutsceneAndStartSecret();
        } else {
            triggerVictory();
        }
    }

    // ========== CUTSCENE ==========
    function playCutsceneAndStartSecret() {
        SS.cutscenePlaying = true;
        SS.on = false;
        stopAllBgm();

        const video = document.createElement('video');
        video.src = 'Hetus Space Cutscene.mp4';
        video.autoplay = true;
        video.controls = false;
        video.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:99999;';
        video.onended = () => {
            video.remove();
            SS.cutscenePlaying = false;
            SS.cutsceneVideo = null;
            grant5000KillsAchievement();
            startSecretMode();
        };
        video.onerror = () => {
            video.remove();
            SS.cutscenePlaying = false;
            grant5000KillsAchievement();
            startSecretMode();
        };
        document.body.appendChild(video);
        SS.cutsceneVideo = video;
    }

    function grant5000KillsAchievement() {
        if (!window.gameStats.spaceShooter.achievements) window.gameStats.spaceShooter.achievements = {};
        if (!window.gameStats.spaceShooter.achievements.kills5000) {
            window.gameStats.spaceShooter.achievements.kills5000 = true;
            if (typeof saveStats === 'function') saveStats();
            if (typeof window.showAchievementPopup === 'function') {
                window.showAchievementPopup(
                    'Ura Heteseasca Sumprema',
                    'Dmitri Iazov este traumatizat de tine, Hetes...',
                    'Comandantul Conquistei Galactice.png'
                );
            }
        }
    }

    function startSecretMode() {
        SS.inSecretMode = true;
        SS.secretModeStarted = true;
        SS.on = true;
        SS.ended = false;
        SS.cutscenePlaying = false;
        SS.gameStarted = true;
        SS.player.x = PLAYER_START_X;
        SS.player.y = H / 2;
        SS.playerImage = 'space-hetus2';
        SS.playerImageLeft = 'space-hetus2';
        SS.playerImageRight = null;
        SS.wave = 35;
        SS.pendingBossGroups = [];
        SS.currentBossGroupIndex = 0;
        SS.bossGroupWaiting = false;
        SS.bosses = [];
        SS.astroFightActive = false;
        SS.astroFightBoss = null;
        SS.astroFightPhase = 0;
        SS.finalBossActive = false;
        SS.finalBoss = null;
        SS.waveMilestonesDone = {};
        SS.currentBackground = 'space';
        if (HEALTH_PICKUP_HEAL < 125) HEALTH_PICKUP_HEAL = 125;
        updateBgmForWave(SS.wave + 1);
        playBgmTier(2);

        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        if (cv) {
            cv.classList.remove('hidden');
            cv.style.display = 'block';
        }
        requestAnimationFrame(ssLoop);
    }

    function showSecretChoiceScreen() {
        stopAllBgm();
        if (cv) { cv.classList.add('hidden'); cv.style.display = 'none'; }
        const winScr = $('sh-win');
        if (winScr) {
            winScr.classList.remove('hidden');
            winScr.style.background = 'rgba(0, 0, 0, 0.95)';
            winScr.innerHTML = `
                <div class="end-title" style="color: #ffd700; font-size: 50px;">VICTORIE!</div>
                <div style="font-size: 24px; color: #ffcc00; margin-bottom: 20px; text-align: center;">Ai învins Mareșalul Boykisser!</div>
                <div style="font-size: 18px; color: #00ffcc; margin-bottom: 30px;">Scor: ${SS.score} | Boykisseri: ${SS.boykissersDefeated}</div>
                <button id="btn-continue-secret" class="btn" style="background: linear-gradient(135deg, #ff00ff, #ff6600); color: #fff; margin: 10px; font-size: 20px; padding: 15px 30px;">🔥 Continuă Anihilarea Boykisser 🔥</button>
                <button id="btn-back-menu" class="btn btn-back" style="margin: 10px;">Înapoi la meniu</button>
            `;
            document.getElementById('btn-continue-secret').onclick = () => {
                winScr.classList.add('hidden');
                playCutsceneAndStartSecret();
            };
            document.getElementById('btn-back-menu').onclick = () => ssBackToMain();
        }
    }

    // ========== ACHIEVEMENTS (cu imagini corecte) ==========
    function unlockMaiorAchievement() {
        if (!window.gameStats) return;
        window.gameStats.spaceShooter = window.gameStats.spaceShooter || { achievements: {} };
        if (!window.gameStats.spaceShooter.achievements) window.gameStats.spaceShooter.achievements = {};
        if (!window.gameStats.spaceShooter.achievements.maiorDefeated) {
            window.gameStats.spaceShooter.achievements.maiorDefeated = true;
            if (typeof saveStats === 'function') saveStats();
            if (typeof window.showAchievementPopup === 'function') {
                window.showAchievementPopup(
                    'Maiorul Boykisser se intoarce :3',
                    'Good boy dyadya :3',
                    'boykisser-commander-achiv.png'
                );
            }
        }
    }

    function unlockMaresalAchievement() {
        if (!window.gameStats) return;
        window.gameStats.spaceShooter = window.gameStats.spaceShooter || { achievements: {} };
        if (!window.gameStats.spaceShooter.achievements) window.gameStats.spaceShooter.achievements = {};
        if (!window.gameStats.spaceShooter.achievements.maresalDefeated) {
            window.gameStats.spaceShooter.achievements.maresalDefeated = true;
            if (typeof saveStats === 'function') saveStats();
            if (typeof window.showAchievementPopup === 'function') {
                window.showAchievementPopup(
                    'Distrugerea Boykisser - lovitura de stat din URSS',
                    'Good boy dyadya :3',
                    'Triumf cosmic peste ruinele spațiale.png'
                );
            }
        }
    }

    function unlockAstroGeneralAchievement() {
        if (!window.gameStats) return;
        window.gameStats.spaceShooter = window.gameStats.spaceShooter || { achievements: {} };
        if (!window.gameStats.spaceShooter.achievements) window.gameStats.spaceShooter.achievements = {};
        if (!window.gameStats.spaceShooter.achievements.astroGeneralDefeated) {
            window.gameStats.spaceShooter.achievements.astroGeneralDefeated = true;
            window.gameStats.spaceShooter.totalAstroGeneralDefeated = (window.gameStats.spaceShooter.totalAstroGeneralDefeated || 0) + 1;
            if (typeof saveStats === 'function') saveStats();
            if (typeof window.showAchievementPopup === 'function') {
                window.showAchievementPopup(
                    'Astro Generalul Boykisser nu se va intoarce...',
                    'Good boy dyadya :3',
                    'hetus-vs-astro.jpeg'
                );
            }
        }
    }

    function unlockSecretarGeneralAchievement() {
        if (!window.gameStats) return;
        window.gameStats.spaceShooter = window.gameStats.spaceShooter || { achievements: {} };
        if (!window.gameStats.spaceShooter.achievements) window.gameStats.spaceShooter.achievements = {};
        if (!window.gameStats.spaceShooter.achievements.secretarGeneralDefeated) {
            window.gameStats.spaceShooter.achievements.secretarGeneralDefeated = true;
            if (typeof saveStats === 'function') saveStats();
            if (typeof window.showAchievementPopup === 'function') {
                window.showAchievementPopup(
                    'Distrugerea Tovarasiei Boykisser 3:',
                    'Good boy dyadya :3',
                    'sad-boykissers3;.jpeg'
                );
            }
        }
    }

    function unlockTotalVictoryAchievement() {
        if (!window.gameStats) return;
        window.gameStats.spaceShooter = window.gameStats.spaceShooter || { achievements: {} };
        if (!window.gameStats.spaceShooter.achievements) window.gameStats.spaceShooter.achievements = {};
        if (!window.gameStats.spaceShooter.achievements.totalVictory) {
            window.gameStats.spaceShooter.achievements.totalVictory = true;
            window.gameStats.spaceShooter.totalSupremeVictories = (window.gameStats.spaceShooter.totalSupremeVictories || 0) + 1;
            if (typeof saveStats === 'function') saveStats();
            if (typeof window.showAchievementPopup === 'function') {
                window.showAchievementPopup(
                    'Anihilarea Boykisser - destramarea planetara',
                    'Acestea toate Hetes?! Pentru ce?... Iazov nu te va lasa sa scapi... Good boy dyadya :3',
                    'hetus-total-victory.png'
                );
            }
        }
    }

    // ========== VICTORY ==========
    function triggerVictory() {
        if (SS.victoryScreenShown) return;
        SS.victoryScreenShown = true;
        SS.victory = true;
        SS.ended = true;
        SS.on = false;
        SS.paused = false;

        stopAllBgm();
        safePlay(sndVictory, 1.0);

        saveRunStats(true);

        try { document.exitPointerLock && document.exitPointerLock(); } catch(e) {}

        if (cv) {
            cv.classList.add('hidden');
            cv.style.display = 'none';
        }

        const winScr = $('sh-win');
        if (winScr) {
            winScr.classList.remove('hidden');
            winScr.style.background = 'rgba(0, 0, 0, 0.9)';
            winScr.innerHTML = `
                <div class="end-title" style="color: #33ff33; font-size: 60px;">VICTORIE TOTALĂ!</div>
                <div style="font-size: 32px; color: #ffcc00; margin-bottom: 20px; text-align: center;">Hetes i-a invins pe Boykisseri 3:</div>
                <div style="font-size: 22px; color: #00ffcc; margin-bottom: 15px;">Scor Final: ${SS.score}</div>
                <div style="font-size: 18px; color: #ff6b6b; margin-bottom: 30px;">Boykisseri invinsi: ${SS.boykissersDefeated}</div>
            `;
            setTimeout(() => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-back';
                btn.style.marginTop = '20px';
                btn.innerText = 'Înapoi la meniu';
                btn.onclick = () => ssBackToMain();
                winScr.appendChild(btn);
            }, 5000);
        }
    }

    // ========== SAVE RUN STATS ==========
    function saveRunStats(victory) {
        const g = window.gameStats || {};
        g.spaceShooter = g.spaceShooter || { maxScore: 0, totalBoykissersDefeated: 0 };

        if (SS.score > g.spaceShooter.maxScore) g.spaceShooter.maxScore = SS.score;
        g.spaceShooter.totalBoykissersDefeated = (g.spaceShooter.totalBoykissersDefeated || 0) + SS.boykissersDefeated;
        g.spaceShooter.totalLocotenentiDefeated = (g.spaceShooter.totalLocotenentiDefeated || 0) + SS.bossDefeatedLocotenent;
        g.spaceShooter.totalMaioriDefeated = (g.spaceShooter.totalMaioriDefeated || 0) + SS.bossDefeatedMaior;
        g.spaceShooter.totalColoneliInvinsi = (g.spaceShooter.totalColoneliInvinsi || 0) + SS.bossDefeatedColonelGeneral;
        g.spaceShooter.totalMaresaliDefeated = (g.spaceShooter.totalMaresaliDefeated || 0) + SS.bossDefeatedMaresal;
        g.spaceShooter.totalMareataNavaDefeated = (g.spaceShooter.totalMareataNavaDefeated || 0) + SS.bossDefeatedMareataNava;
        g.spaceShooter.totalAstroGeneralDefeated = (g.spaceShooter.totalAstroGeneralDefeated || 0) + SS.bossDefeatedAstroGeneral;
        g.spaceShooter.totalSecretarGeneralDefeated = (g.spaceShooter.totalSecretarGeneralDefeated || 0) + SS.bossDefeatedSecretarGeneral;

        if (!g.spaceShooter.bestRun) {
            g.spaceShooter.bestRun = { score: 0, wave: 0, kills: 0, victory: false };
        }
        if (SS.score > g.spaceShooter.bestRun.score) {
            g.spaceShooter.bestRun = {
                score: SS.score, wave: SS.wave,
                kills: SS.boykissersDefeated,
                victory: victory || g.spaceShooter.bestRun.victory || false
            };
        }

        g.shooter = g.shooter || { kills: 0, wins: 0, score: 0 };
        g.shooter.score = (g.shooter.score || 0) + SS.score;

        if (victory) g.spaceShooter.victories = (g.spaceShooter.victories || 0) + 1;
        if (SS.inSecretMode && victory) {
            g.spaceShooter.totalSupremeVictories = (g.spaceShooter.totalSupremeVictories || 0) + 1;
        }

        if (typeof saveStats === 'function') saveStats();
    }

    // ========== GAME OVER ==========
    function ssGameOver() {
        if (SS.ended) return;
        SS.ended = true;
        SS.on = false;
        SS.paused = false;

        stopAllBgm();
        safePlay(sndDefeat, 1.0);

        saveRunStats(false);

        try { document.exitPointerLock && document.exitPointerLock(); } catch(e) {}

        if (cv) {
            cv.classList.add('hidden');
            cv.style.display = 'none';
        }

        const loseScr = $('sh-lose');
        if (loseScr) {
            loseScr.classList.remove('hidden');
            loseScr.style.background = '#000';
            const isNewRecord = SS.score >= (SS.bestRun?.score || 0);
            loseScr.innerHTML = `
                <div class="end-title" style="color: #ff3333;">Ai fost doborât...</div>
                ${isNewRecord ? '<div style="font-size: 20px; color: #ffcc00; margin-bottom: 10px;">🎉 RECORD NOU! 🎉</div>' : ''}
                <div style="font-size: 24px; color: #ffcc00; margin-bottom: 15px;">Scor Final: ${SS.score}</div>
                <div style="font-size: 18px; color: #ff6b6b; margin-bottom: 15px;">Boykisseri invinsi: ${SS.boykissersDefeated}</div>
                <div style="font-size: 16px; color: #00ffcc; margin-bottom: 30px;">Val maxim: ${SS.wave + 1}${SS.inSecretMode ? ' (SECRET)' : ''}</div>
                <button class="btn btn-back" onclick="ssBackToMain()">Inapoi la meniu</button>
            `;
        }
    }

    // ========== RENDER ==========
    function renderSS() {
        if (!SS.on) return;

        const bgImg = SS.currentBackground === 'planet' ? IMG['planeta-boykisser'] : IMG['space-boykisser'];
        if (bgImg && bgImg.complete && bgImg.naturalWidth) {
            const bgWidth = W * 1.5;
            const offset = -(SS.bgScroll % bgWidth);
            cx.drawImage(bgImg, offset, 0, bgWidth, H);
            cx.drawImage(bgImg, offset + bgWidth, 0, bgWidth, H);
        } else {
            cx.fillStyle = '#0a0a1a';
            cx.fillRect(0, 0, W, H);
        }

        cx.fillStyle = 'rgba(0, 0, 20, 0.5)';
        cx.fillRect(0, 0, W, H);

        SS.stars.forEach(s => {
            cx.fillStyle = `rgba(255, 255, 255, ${0.3 + s.speed * 0.2})`;
            cx.beginPath();
            cx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            cx.fill();
        });

        SS.bosses.forEach(b => {
            if (b.hasTracingLaser && b.tracingLaserActive) {
                cx.save();
                cx.translate(b.x, b.y);
                cx.rotate(b.tracingLaserAngle);
                const laserGrad = cx.createLinearGradient(0, 0, W, 0);
                laserGrad.addColorStop(0, 'rgba(255, 0, 255, 1)');
                laserGrad.addColorStop(0.5, 'rgba(255, 100, 255, 0.7)');
                laserGrad.addColorStop(1, 'rgba(255, 0, 255, 0.2)');
                cx.shadowBlur = 30;
                cx.shadowColor = '#ff00ff';
                cx.strokeStyle = laserGrad;
                cx.lineWidth = 15;
                cx.beginPath();
                cx.moveTo(0, 0);
                cx.lineTo(W, 0);
                cx.stroke();
                cx.restore();
            }
        });

        if (SS.finalBoss && SS.finalBoss.active && SS.finalBoss.laserActive) {
            const b = SS.finalBoss;
            cx.save();
            cx.translate(b.x, b.y);
            cx.rotate(b.laserAngle);
            const laserGrad = cx.createLinearGradient(0, 0, W, 0);
            laserGrad.addColorStop(0, 'rgba(255, 0, 0, 1)');
            laserGrad.addColorStop(0.5, 'rgba(255, 100, 0, 0.8)');
            laserGrad.addColorStop(1, 'rgba(255, 0, 0, 0.2)');
            cx.shadowBlur = 35;
            cx.shadowColor = '#ff0000';
            cx.strokeStyle = laserGrad;
            cx.lineWidth = 20;
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(W, 0);
            cx.stroke();
            cx.restore();
        }

        if (SS.astroFightBoss && SS.astroFightBoss.active && SS.astroFightBoss.laserActive) {
            const b = SS.astroFightBoss;
            cx.save();
            cx.translate(b.x, b.y);
            cx.rotate(b.laserAngle);
            const laserGrad = cx.createLinearGradient(0, 0, W, 0);
            laserGrad.addColorStop(0, 'rgba(255, 0, 255, 1)');
            laserGrad.addColorStop(1, 'rgba(255, 0, 255, 0.1)');
            cx.shadowBlur = 25;
            cx.shadowColor = '#ff00ff';
            cx.strokeStyle = laserGrad;
            cx.lineWidth = 12;
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(W, 0);
            cx.stroke();
            cx.restore();
        }

        if (SS.laserActive) {
            const laserY = SS.player.y;
            const gradient = cx.createLinearGradient(SS.player.x, laserY, W, laserY);
            gradient.addColorStop(0, 'rgba(255, 50, 50, 1)');
            gradient.addColorStop(0.5, 'rgba(255, 100, 100, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0.2)');
            cx.save();
            cx.shadowBlur = 20;
            cx.shadowColor = '#ff0000';
            cx.strokeStyle = gradient;
            cx.lineWidth = 8;
            cx.beginPath();
            cx.moveTo(SS.player.x, laserY);
            cx.lineTo(W, laserY);
            cx.stroke();
            cx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            cx.lineWidth = 3;
            cx.beginPath();
            cx.moveTo(SS.player.x, laserY);
            cx.lineTo(W, laserY);
            cx.stroke();
            cx.restore();
        }

        SS.flameParticles.forEach(p => {
            const alpha = p.life / p.maxLife;
            cx.save();
            cx.globalAlpha = alpha;
            cx.fillStyle = p.color;
            cx.beginPath();
            cx.arc(p.x, p.y, 8 * alpha, 0, Math.PI * 2);
            cx.fill();
            cx.restore();
        });

        SS.healthPickups.forEach(hp => {
            const pulseSize = hp.radius + Math.sin(hp.pulse) * 4;
            cx.save();
            cx.shadowBlur = 25;
            cx.shadowColor = '#2ecc71';
            const grad = cx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, pulseSize);
            grad.addColorStop(0, 'rgba(46, 204, 113, 0.9)');
            grad.addColorStop(0.6, 'rgba(46, 204, 113, 0.5)');
            grad.addColorStop(1, 'rgba(46, 204, 113, 0)');
            cx.fillStyle = grad;
            cx.beginPath();
            cx.arc(hp.x, hp.y, pulseSize, 0, Math.PI * 2);
            cx.fill();
            cx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            cx.beginPath();
            cx.arc(hp.x, hp.y, pulseSize * 0.6, 0, Math.PI * 2);
            cx.fill();
            cx.fillStyle = '#2ecc71';
            cx.font = 'bold 24px sans-serif';
            cx.textAlign = 'center';
            cx.textBaseline = 'middle';
            cx.fillText('+', hp.x, hp.y + 1);
            cx.textAlign = 'left';
            cx.textBaseline = 'alphabetic';
            cx.restore();
        });

        SS.tempPowerups.forEach(p => {
            const pulseSize = p.radius + Math.sin(p.pulse) * 5;
            const color = p.type === 'shield' ? '#00ccff' : '#ff8800';
            const symbol = p.type === 'shield' ? '🛡' : '⚡';
            cx.save();
            cx.shadowBlur = 30;
            cx.shadowColor = color;
            const grad = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseSize);
            grad.addColorStop(0, color);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            cx.fillStyle = grad;
            cx.beginPath();
            cx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
            cx.fill();
            cx.fillStyle = 'white';
            cx.font = 'bold 24px sans-serif';
            cx.textAlign = 'center';
            cx.textBaseline = 'middle';
            cx.fillText(symbol, p.x, p.y + 2);
            cx.textAlign = 'left';
            cx.textBaseline = 'alphabetic';
            cx.restore();
        });

        SS.enemies.forEach(e => {
            const cfg = ENEMY_CONFIG[e.typeKey];
            const img = IMG[cfg.img];
            if (img && img.complete && img.naturalWidth) {
                cx.save();
                if (e.isElite) {
                    cx.shadowBlur = 15;
                    cx.shadowColor = '#ff00ff';
                } else if (e.isCyberElite) {
                    cx.shadowBlur = 20;
                    cx.shadowColor = '#00ffcc';
                } else if (e.isFoxfireElite) {
                    cx.shadowBlur = 20;
                    cx.shadowColor = '#ff6600';
                }
                cx.drawImage(img, e.x - e.width / 2, e.y - e.height / 2, e.width, e.height);
                cx.restore();
            } else {
                if (e.isPisica) cx.fillStyle = '#ffaa00';
                else if (e.isElite) cx.fillStyle = '#ff00ff';
                else if (e.isCyberElite) cx.fillStyle = '#00ffcc';
                else if (e.isFoxfireElite) cx.fillStyle = '#ff6600';
                else cx.fillStyle = ['#ff4444', '#ff8844', '#ff44ff', '#44ffff'][e.type - 1] || '#ff4444';
                cx.fillRect(e.x - e.width / 2, e.y - e.height / 2, e.width, e.height);
            }

            const hpFrac = e.hp / e.maxHp;
            if (hpFrac < 1) {
                cx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                cx.fillRect(e.x - 25, e.y - e.height / 2 - 12, 50, 6);
                cx.fillStyle = hpFrac > 0.5 ? '#2ecc71' : (hpFrac > 0.25 ? '#f1c40f' : '#e74c3c');
                cx.fillRect(e.x - 25, e.y - e.height / 2 - 12, 50 * hpFrac, 6);
            }
        });

        SS.bosses.forEach((b, bi) => {
            const cfg = BOSS_CONFIG[b.type];
            const img = IMG[cfg.img];
            cx.save();
            cx.shadowBlur = 30;
            cx.shadowColor = b.type === 'maresal' ? '#ff00ff' : (b.type === 'colonelGeneral' ? '#ff4400' : '#ff8800');
            if (img && img.complete && img.naturalWidth) {
                cx.drawImage(img, b.x - b.width / 2, b.y - b.height / 2, b.width, b.height);
            } else {
                cx.fillStyle = '#ff8800';
                cx.beginPath();
                cx.arc(b.x, b.y, b.width / 2, 0, Math.PI * 2);
                cx.fill();
            }
            cx.restore();

            const barWidth = 600, barHeight = 28;
            const barX = W / 2 - barWidth / 2;
            const barY = 10 + bi * 34;
            const hpFrac = b.hp / b.maxHp;

            cx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            cx.fillRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);
            cx.fillStyle = '#8b0000';
            cx.fillRect(barX, barY, barWidth, barHeight);
            const grad = cx.createLinearGradient(barX, 0, barX + barWidth * hpFrac, 0);
            grad.addColorStop(0, b.type === 'maresal' ? '#ff00ff' : '#ff8800');
            grad.addColorStop(1, b.type === 'maresal' ? '#cc00cc' : '#cc6600');
            cx.fillStyle = grad;
            cx.fillRect(barX, barY, barWidth * hpFrac, barHeight);
            cx.strokeStyle = '#fff';
            cx.lineWidth = 2;
            cx.strokeRect(barX, barY, barWidth, barHeight);

            cx.fillStyle = '#fff';
            cx.font = 'bold 16px sans-serif';
            cx.textAlign = 'center';
            let bossName = '';
            if (b.type === 'locotenent') bossName = 'LOCOTENENT BOYKISSER';
            else if (b.type === 'maior') bossName = 'MAIOR BOYKISSER';
            else if (b.type === 'colonelGeneral') bossName = 'COLONEL GENERAL BOYKISSER';
            else if (b.type === 'maresal') bossName = 'MAREȘALUL BOYKISSER';
            else if (b.type === 'mareataNava') bossName = 'MĂREAȚA NAVĂ BOYKISSER';
            cx.fillText(`${bossName} - ${Math.ceil(b.hp)}/${b.maxHp}`, W / 2, barY + 20);
            cx.textAlign = 'left';
        });

        if (SS.astroFightBoss && SS.astroFightBoss.active) {
            const b = SS.astroFightBoss;
            const img = IMG[b.facing === 'left' ? 'Astro-Boykisser-left' : 'Astro-Boykisser-right'];
            if (img && img.complete && img.naturalWidth) {
                cx.save();
                cx.shadowBlur = 35;
                cx.shadowColor = '#ff00ff';
                cx.drawImage(img, b.x - b.width / 2, b.y - b.height / 2, b.width, b.height);
                cx.restore();
            } else {
                cx.fillStyle = '#ff00ff';
                cx.beginPath();
                cx.arc(b.x, b.y, b.width / 2, 0, Math.PI * 2);
                cx.fill();
            }
            const barWidth = 600, barHeight = 28;
            const barX = W / 2 - barWidth / 2;
            const barY = 10 + SS.bosses.length * 34;
            const hpFrac = b.hp / b.maxHp;
            cx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            cx.fillRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);
            cx.fillStyle = '#8b0000';
            cx.fillRect(barX, barY, barWidth, barHeight);
            cx.fillStyle = '#ff00ff';
            cx.fillRect(barX, barY, barWidth * hpFrac, barHeight);
            cx.strokeStyle = '#fff';
            cx.lineWidth = 2;
            cx.strokeRect(barX, barY, barWidth, barHeight);
            cx.fillStyle = '#fff';
            cx.font = 'bold 16px sans-serif';
            cx.textAlign = 'center';
            cx.fillText(`ASTRO GENERAL BOYKISSER - ${Math.ceil(b.hp)}/${b.maxHp}`, W / 2, barY + 20);
            cx.textAlign = 'left';
        }

        if (SS.finalBoss && SS.finalBoss.active) {
            const b = SS.finalBoss;
            const img = IMG['Comandantul cosmic cu armură roșie'];
            if (img && img.complete && img.naturalWidth) {
                cx.save();
                cx.shadowBlur = 40;
                cx.shadowColor = '#ff0000';
                cx.drawImage(img, b.x - b.width / 2, b.y - b.height / 2, b.width, b.height);
                cx.restore();
            } else {
                cx.fillStyle = '#ff0000';
                cx.beginPath();
                cx.arc(b.x, b.y, b.width / 2, 0, Math.PI * 2);
                cx.fill();
            }
            const barWidth = 700, barHeight = 32;
            const barX = W / 2 - barWidth / 2;
            const barY = 10 + SS.bosses.length * 34;
            const hpFrac = b.hp / b.maxHp;
            cx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            cx.fillRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);
            cx.fillStyle = '#8b0000';
            cx.fillRect(barX, barY, barWidth, barHeight);
            cx.fillStyle = '#ff0000';
            cx.fillRect(barX, barY, barWidth * hpFrac, barHeight);
            cx.strokeStyle = '#ffd700';
            cx.lineWidth = 3;
            cx.strokeRect(barX, barY, barWidth, barHeight);
            cx.fillStyle = '#fff';
            cx.font = 'bold 18px sans-serif';
            cx.textAlign = 'center';
            cx.fillText(`TOVARĂȘUL SECRETAR GENERAL BOYKISSER - ${Math.ceil(b.hp)}/${b.maxHp}`, W / 2, barY + 22);
            cx.textAlign = 'left';
        }

        const playerImg = IMG[SS.playerImage];
        if (playerImg && playerImg.complete && playerImg.naturalWidth) {
            cx.save();
            if (SS.player.hitFlash > 0) {
                cx.globalAlpha = 0.5 + Math.sin(performance.now() / 50) * 0.3;
            }
            cx.drawImage(playerImg, SS.player.x - PLAYER_WIDTH / 2, SS.player.y - PLAYER_HEIGHT / 2, PLAYER_WIDTH, PLAYER_HEIGHT);
            cx.restore();
        } else {
            cx.fillStyle = '#2ecc71';
            cx.beginPath();
            cx.arc(SS.player.x, SS.player.y, 35, 0, Math.PI * 2);
            cx.fill();
        }

        if (SS.player.shieldActive) {
            cx.save();
            cx.strokeStyle = '#00ccff';
            cx.lineWidth = 4;
            cx.shadowBlur = 20;
            cx.shadowColor = '#00ccff';
            cx.beginPath();
            cx.arc(SS.player.x, SS.player.y, TEMP_POWERUP_SHIELD_RADIUS, 0, Math.PI * 2);
            cx.stroke();
            cx.restore();
        }

        cx.save();
        const glowGrad = cx.createRadialGradient(SS.player.x, SS.player.y, 10, SS.player.x, SS.player.y, 60);
        glowGrad.addColorStop(0, 'rgba(46, 204, 113, 0.3)');
        glowGrad.addColorStop(1, 'rgba(46, 204, 113, 0)');
        cx.fillStyle = glowGrad;
        cx.fillRect(SS.player.x - 60, SS.player.y - 60, 120, 120);
        cx.restore();

        SS.hetesianProjectiles.forEach(p => {
            const img = IMG['hetesian-projectile'];
            if (img && img.complete && img.naturalWidth) {
                cx.save();
                cx.shadowBlur = 15;
                cx.shadowColor = '#ff6600';
                cx.drawImage(img, p.x, p.y - p.height / 2, p.width, p.height);
                cx.restore();
            } else {
                cx.fillStyle = '#ff6600';
                cx.fillRect(p.x, p.y - 5, p.width, 10);
            }
        });

        SS.hetesianOrbs.forEach(o => {
            const img = IMG['hetesian-orb'];
            if (img && img.complete && img.naturalWidth) {
                cx.save();
                cx.shadowBlur = 20;
                cx.shadowColor = '#00ffcc';
                cx.drawImage(img, o.x - 20, o.y - 20, 40, 40);
                cx.restore();
            } else {
                cx.fillStyle = '#00ffcc';
                cx.beginPath();
                cx.arc(o.x, o.y, 15, 0, Math.PI * 2);
                cx.fill();
            }
        });

        SS.enemyBullets.forEach(b => {
            if (b.projectileType === 'neon') {
                const img = IMG['Proiectil energetic neon cyan și roșu'];
                if (img && img.complete && img.naturalWidth) {
                    cx.save();
                    cx.shadowBlur = 20;
                    cx.shadowColor = '#00ffff';
                    cx.drawImage(img, b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2);
                    cx.restore();
                } else {
                    cx.save();
                    cx.shadowBlur = 15;
                    cx.shadowColor = '#00ffff';
                    cx.fillStyle = '#00ffff';
                    cx.beginPath();
                    cx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                    cx.fill();
                    cx.strokeStyle = '#ff0000';
                    cx.lineWidth = 2;
                    cx.stroke();
                    cx.restore();
                }
            } else {
                const img = IMG['plasma-orb'];
                if (img && img.complete && img.naturalWidth) {
                    cx.save();
                    cx.shadowBlur = 15;
                    cx.shadowColor = '#ff00ff';
                    cx.drawImage(img, b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2);
                    cx.restore();
                } else {
                    cx.fillStyle = '#ff00ff';
                    cx.beginPath();
                    cx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                    cx.fill();
                }
            }
        });

        SS.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            cx.save();
            cx.globalAlpha = alpha;
            cx.fillStyle = p.color;
            cx.beginPath();
            cx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            cx.fill();
            cx.restore();
        });

        SS.explosions.forEach(ex => {
            const progress = ex.duration / ex.maxDuration;
            const radius = (1 - progress) * 60 + 20;
            const alpha = progress;
            cx.save();
            cx.globalAlpha = alpha;
            const grad = cx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, radius);
            if (ex.isHeal) {
                grad.addColorStop(0, 'rgba(46, 255, 113, 1)');
                grad.addColorStop(1, 'rgba(46, 204, 113, 0)');
            } else {
                grad.addColorStop(0, 'rgba(255, 255, 0, 1)');
                grad.addColorStop(0.3, 'rgba(255, 150, 0, 0.8)');
                grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
            }
            cx.fillStyle = grad;
            cx.beginPath();
            cx.arc(ex.x, ex.y, radius, 0, Math.PI * 2);
            cx.fill();
            cx.restore();
        });

        // ===== HUD =====
        cx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        cx.fillRect(20, 20, 280, 28);
        const hpFrac = Math.max(0, SS.player.hp / SS.player.maxHp);
        cx.fillStyle = hpFrac > 0.5 ? '#2ecc71' : (hpFrac > 0.25 ? '#f1c40f' : '#e74c3c');
        cx.fillRect(20, 20, 280 * hpFrac, 28);
        cx.strokeStyle = '#fff';
        cx.lineWidth = 2;
        cx.strokeRect(20, 20, 280, 28);
        cx.fillStyle = '#fff';
        cx.font = 'bold 16px sans-serif';
        cx.textAlign = 'left';
        cx.fillText(`HP: ${Math.ceil(SS.player.hp)}/${SS.player.maxHp}`, 30, 40);

        cx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        cx.fillRect(20, 60, 240, 30);
        cx.fillStyle = '#ffcc00';
        cx.font = 'bold 18px sans-serif';
        cx.fillText(`SCOR: ${SS.score}`, 30, 82);

        cx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        cx.fillRect(20, 100, 240, 30);
        cx.fillStyle = '#ff6b6b';
        cx.font = 'bold 16px sans-serif';
        cx.fillText(`Boykisseri invinsi: ${SS.boykissersDefeated}`, 30, 122);

        if (PLAYER_DAMAGE_MULT > 1) {
            cx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            cx.fillRect(20, 140, 240, 30);
            cx.fillStyle = '#ff00ff';
            cx.font = 'bold 16px sans-serif';
            cx.fillText(`DAMAGE x${PLAYER_DAMAGE_MULT.toFixed(1)}`, 30, 162);
        }

        cx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        cx.fillRect(W - 200, 20, 180, 30);
        cx.fillStyle = SS.inSecretMode ? '#ff00ff' : '#00ffcc';
        cx.font = 'bold 16px sans-serif';
        cx.fillText(`VAL: ${SS.wave + 1}${SS.inSecretMode ? ' SECRET' : ''}`, W - 185, 42);

        if (SS.bossWaveActive) {
            cx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            cx.fillRect(W / 2 - 250, 60 + SS.bosses.length * 34, 500, 40);
            cx.fillStyle = '#ffff00';
            cx.font = 'bold 24px sans-serif';
            cx.textAlign = 'center';
            cx.fillText(`⚠ BOSS WAVE (Grup ${SS.currentBossGroupIndex + 1}/${SS.pendingBossGroups.length}) ⚠`, W / 2, 88 + SS.bosses.length * 34);
            cx.textAlign = 'left';
        } else if (SS.pendingBossGroups.length > 0) {
            cx.fillStyle = 'rgba(255, 100, 0, 0.8)';
            cx.fillRect(W / 2 - 250, 60 + SS.bosses.length * 34, 500, 40);
            cx.fillStyle = '#ffff00';
            cx.font = 'bold 22px sans-serif';
            cx.textAlign = 'center';
            cx.fillText(`⚠ GRUP ${SS.currentBossGroupIndex + 1}/${SS.pendingBossGroups.length} ⚠`, W / 2, 86 + SS.bosses.length * 34);
            cx.textAlign = 'left';
        }

        const hudY = H - 140;

        cx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        cx.fillRect(20, hudY, 220, 30);
        const dReady = SS.spaceShooterCd <= 0;
        cx.fillStyle = dReady ? '#ff6600' : '#666';
        cx.font = 'bold 14px sans-serif';
        cx.fillText(`${SS.astroFightActive ? '[E] Plasma' : '[D] Racheta'}: ${dReady ? 'GATA!' : Math.ceil(SS.spaceShooterCd) + 's'}`, 30, hudY + 21);

        cx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        cx.fillRect(20, hudY + 35, 220, 30);
        const fReady = SS.orbCd <= 0;
        cx.fillStyle = fReady ? '#00ffcc' : '#666';
        cx.fillText(`[F] Orb: ${fReady ? 'GATA!' : SS.orbCd.toFixed(1) + 's'}`, 30, hudY + 56);

        cx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        cx.fillRect(20, hudY + 70, 280, 30);
        if (SS.laserActive) {
            cx.fillStyle = '#ff0000';
            const remaining = LASER_MAX_DURATION - SS.laserTimer;
            cx.fillText(`[L] LASER ACTIV! ${remaining.toFixed(1)}s`, 30, hudY + 91);
            cx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            cx.fillRect(30, hudY + 95, 200, 4);
            cx.fillStyle = '#ff0000';
            cx.fillRect(30, hudY + 95, 200 * (1 - SS.laserTimer / LASER_MAX_DURATION), 4);
        } else {
            const lReady = SS.laserCooldown <= 0;
            cx.fillStyle = lReady ? '#ff0000' : '#666';
            cx.fillText(`[L] Laser: ${lReady ? 'GATA!' : SS.laserCooldown.toFixed(1) + 's'}`, 30, hudY + 91);
        }

        if (SS.playerImage === 'space-hetus3-left' || SS.playerImage === 'space-hetus3-right') {
            cx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            cx.fillRect(20, hudY + 105, 280, 30);
            if (SS.flameActive) {
                cx.fillStyle = '#ff4400';
                cx.fillText(`[C] FLĂCĂRI ACTIV! ${(SS.FLAME_MAX_DURATION - SS.flameTimer).toFixed(1)}s`, 30, hudY + 126);
            } else {
                const cReady = SS.flameCooldown <= 0;
                cx.fillStyle = cReady ? '#ff4400' : '#666';
                cx.fillText(`[C] Flăcări: ${cReady ? 'GATA!' : SS.flameCooldown.toFixed(1) + 's'}`, 30, hudY + 126);
            }
        }

        if (SS.player.shieldActive || SS.player.rapidFireActive) {
            let statusText = '';
            if (SS.player.shieldActive) statusText += `🛡 SCUT ${SS.player.shieldTimer.toFixed(1)}s  `;
            if (SS.player.rapidFireActive) statusText += `⚡ RAPID ${SS.player.rapidFireTimer.toFixed(1)}s`;
            cx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            cx.fillRect(W / 2 - 200, H - 40, 400, 30);
            cx.fillStyle = '#00ccff';
            cx.font = 'bold 16px sans-serif';
            cx.textAlign = 'center';
            cx.fillText(statusText, W / 2, H - 18);
            cx.textAlign = 'left';
        }

        if (!SS.gameStarted) {
            cx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            cx.fillRect(0, 0, W, H);
            cx.fillStyle = '#ff6b6b';
            cx.font = 'bold 80px sans-serif';
            cx.textAlign = 'center';
            cx.fillText('HETES ANTI-FURRY', W / 2, H / 2 - 80);
            cx.fillStyle = '#00ffcc';
            cx.font = 'bold 50px sans-serif';
            cx.fillText('SPATIAL', W / 2, H / 2);
            cx.fillStyle = '#fff';
            cx.font = 'bold 120px sans-serif';
            cx.fillText(Math.ceil(SS.startCountdown), W / 2, H / 2 + 130);
            cx.textAlign = 'left';
        }

        if (SS.gameStarted && !SS.paused) {
            cx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            cx.fillRect(W - 400, H - 50, 380, 35);
            cx.fillStyle = '#aaa';
            cx.font = '12px sans-serif';
            cx.fillText(
                SS.astroFightActive
                    ? 'WASD = Mișcare | E = Plasma | F = Orbs | L = Laser | C = Flăcări | ESC = Pauză'
                    : 'W/S = Mișcare | D = Racheta | F = Orbs | L = Laser | C = Flăcări | ESC = Pauză',
                W - 390, H - 28
            );
        }

        if (SS.paused) {
            cx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            cx.fillRect(0, 0, W, H);
            cx.fillStyle = '#ffffff';
            cx.font = 'bold 100px sans-serif';
            cx.textAlign = 'center';
            cx.textBaseline = 'middle';
            cx.fillText('PAUZĂ', W / 2, H / 2 - 40);
            cx.fillStyle = '#ffcc00';
            cx.font = 'bold 28px sans-serif';
            cx.fillText('Apasă ESC pentru a continua', W / 2, H / 2 + 60);
            cx.fillStyle = '#aaa';
            cx.font = '18px sans-serif';
            cx.fillText('BGM oprit temporar', W / 2, H / 2 + 110);
            cx.textAlign = 'left';
            cx.textBaseline = 'alphabetic';
        }
    }

    // ========== LOOP ==========
    function ssLoop(timestamp) {
        if (!SS.on) return;

        let dt = Math.min(0.05, (timestamp - SS.t) / 1000 || 0);
        SS.t = timestamp;

        try { updateSS(dt); } catch (err) { console.error('Space Shooter update error:', err); }
        try { renderSS(); } catch (err) { console.error('Space Shooter render error:', err); }

        if (SS.on) requestAnimationFrame(ssLoop);
    }

    // ========== PAUSE TOGGLE ==========
    function togglePause() {
        if (!SS.on || SS.ended || SS.cutscenePlaying) return;
        SS.paused = !SS.paused;
        if (SS.paused) {
            try { document.exitPointerLock && document.exitPointerLock(); } catch(e) {}
            if (currentBgm) currentBgm.pause();
        } else {
            if (currentBgm) currentBgm.play().catch(() => {});
            if (cv) cv.requestPointerLock && cv.requestPointerLock();
        }
    }

    // ========== MENU ==========
    window.openSpaceShooterMenu = function() {
        if (typeof window.stopMenuMusic === 'function') window.stopMenuMusic();
        if (typeof stopAllMusic === 'function') stopAllMusic();
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        window.startSpaceShooterSession();
    };

    window.startSpaceShooterSession = function() {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        currentMode = 'SPACE_SHOOTER';
        if (cv) {
            cv.classList.remove('hidden');
            cv.style.display = 'block';
            cv.requestPointerLock && cv.requestPointerLock();
        }
        ssInit();
    };

    window.ssBackToMain = function() {
        SS.on = false;
        SS.ended = true;
        SS.paused = false;
        SS.cutscenePlaying = false;
        if (SS.cutsceneVideo) { SS.cutsceneVideo.remove(); SS.cutsceneVideo = null; }
        stopAllBgm();
        sndVictory.pause();
        sndVictory.currentTime = 0;
        sndDefeat.pause();
        sndDefeat.currentTime = 0;
        sndLose.pause();
        sndLose.currentTime = 0;
        sndWin.pause();
        sndWin.currentTime = 0;

        try { document.exitPointerLock && document.exitPointerLock(); } catch(e) {}

        if (cv) {
            cv.classList.add('hidden');
            cv.style.display = 'none';
        }

        if (typeof window.backToMain === 'function') {
            window.backToMain();
        }
    };

    // ========== INPUT ==========
    window.addEventListener('keydown', e => {
        if (!SS.on || SS.ended) return;

        if (e.key === 'Escape' || e.keyCode === 27) {
            e.preventDefault();
            togglePause();
            return;
        }

        const k = e.key.toLowerCase();
        if (e.key === 'F12' || e.keyCode === 123) return;
        if (['w', 's', 'd', 'f', 'l', 'c', 'a', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
            e.preventDefault();
        }
    });

    cv.addEventListener('click', () => {
        if (SS.on && !SS.ended && !SS.paused && document.pointerLockElement !== cv) {
            cv.requestPointerLock && cv.requestPointerLock();
        }
    });

})();