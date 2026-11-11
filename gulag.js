// ===== MODUL GULAG ESCAPE (V6.0 - CLEAN ARCADE CHASE, WHITE FAILURE BACKGROUND & STABLE CAMOUFLAGE) =====
(()=>{
const W=1280,H=720,N=32,FOV=1.15,C=640,$=id=>document.getElementById(id),cv=$('gameCanvas'),cx=cv.getContext('2d');

const IMG={};
[
 'nkvd1-patrol-front','nkvd1-patrol-back','nkvd1-chase-front','nkvd1-chase-back',
 'nkvd2-patrol-front','nkvd2-patrol-back','nkvd2-chase-front','nkvd2-chase-back',
 'nkvdcommander-front','nkvdcommander-back','nkvdcommander-chase-front','nkvdcommander-chase-back',
 'detinut-front','detinut-back','key','gaz-m1','vodka','tarnacop','ore',
 'brad1','brad2','brad3','nkvd-auto-front','nkvd-auto-side','interior-gaz-m1',
 'gaz-m1-camuflata','bustean','bolovan'
].forEach(n=>{
 IMG[n]=new Image(); 
 if(['interior-gaz-m1','nkvd-auto-front'].includes(n)) IMG[n].src=n+'.jpg';
 else IMG[n].src=n+'.png';
});

// Sunete joc și Muzică de fundal
const sndGulagLose = new Audio('gulag-sssr-gimn.mp3');
const sndGulagWin = new Audio('patiot-pesnya-sovietwave.mp3');
const sndGun = new Audio('gun.mp3');
const sndNaziRifle = new Audio('nazi rifle.mp3');
const sndJump = new Audio('clasic-jump.mp3');
const sndExplosion = new Audio('st explosion sound6.mp3');
const sndMinat = new Audio('minat.mp3');

const sndBgm = new Audio('tyomnaya-noch-ayden.mp3');
sndBgm.loop = true;

// Matricea 32x32 pentru Gulag (Zona principală)
const M_GRID = [
 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,
 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
];

const M=new Uint8Array(N*N);

const Z=new Float32Array(C);
const solid=(x,y,r=.2)=>{
 if(x<0||x>=N||y<0||y>=N) return 1;
 return M[((y-r)|0)*N+((x-r)|0)]||M[((y-r)|0)*N+((x+r)|0)]||M[((y+r)|0)*N+((x-r)|0)]||M[((y+r)|0)*N+((x+r)|0)];
};

const cast=(px,py,a)=>{
 let dx=Math.cos(a)||1e-9,dy=Math.sin(a)||1e-9,mx=px|0,my=py|0,ax=Math.abs(1/dx),ay=Math.abs(1/dy),
 sx=dx<0?-1:1,sy=dy<0?-1:1,tx=(dx<0?px-mx:mx+1-px)*ax,ty=(dy<0?py-my:my+1-py)*ay,s=0,t=0;
 for(let i=0;i<70;i++){
  if(tx<ty){tx+=ax;mx+=sx;s=0}else{ty+=ay;my+=sy;s=1}
  if(mx<0||mx>=N||my<0||my>=N){t=1;break;}
  t=M[my*N+mx];if(t)break;
 }
 const d=s?ty-ay:tx-ax,w=s?px+d*dx:py+d*dy;
 return [d,t,s,w-Math.floor(w)];
};

const los=(x1,y1,x2,y2)=>cast(x1,y1,Math.atan2(y2-y1,x2-x1))[0]>Math.hypot(x2-x1,y2-y1);

let G={on:false, state:'playing', mode:'gulag', subState:'', fadeAlpha:0, loseStep:0, winStep:0};

cv.addEventListener('mousemove', e=>{
 if(!G.on || G.state!=='playing') return;
 if(G.mode === 'gulag' && document.pointerLockElement === cv){
  G.a += e.movementX * 0.003;
 }
});

cv.addEventListener('click', ()=>{
 if(G.on && G.state === 'playing' && document.pointerLockElement !== cv && G.mode === 'gulag'){
  cv.requestPointerLock && cv.requestPointerLock();
 }
});

window.startGulagSession=function(){
 ['main-menu','classic-menu','sh-menu','sh-arsenal','sh-lose','sh-win','auth-panel'].forEach(id=>{
  const el=$(id); if(el) el.classList.add('hidden');
 });
 
 for(let i=0; i<N*N; i++) M[i] = M_GRID[i];

 if(typeof stopMenuMusic === 'function') stopMenuMusic();
 if(window.sndStalingradBgm){ window.sndStalingradBgm.pause(); }
 sndGulagLose.pause(); sndGulagLose.currentTime = 0;
 sndGulagWin.pause(); sndGulagWin.currentTime = 0;
 sndExplosion.pause(); sndExplosion.currentTime = 0;

 sndBgm.currentTime = 0;
 sndBgm.play().catch(e=>{});

 currentMode = 'GULAG';
 gameActive = false;

 G={
  on:true, state:'playing', mode:'gulag', subState:'',
  x:1.5, y:29.5, 
  a:0, 
  hp:100, maxHp:100,
  energy:100, maxEnergy:100,
  hunger:100, maxHunger:100,
  hasKey:false, 
  escortPhase: 'guiding', 
  workCountdown: 10.0, 
  workState: 'initial_grace',
  vodkaTimer: 0,
  hasWorkedOnce: false, 
  oreObj:{x:24.5, y:24.5}, 
  keyObj:{x:26.5, y:28.5, taken:false}, 
  carObj:{x:29.5, y:2.5}, 
  vodkaObjs:[
   {x:1.5, y:15.5, taken:false},
   {x:12.5, y:2.5, taken:false},
   {x:22.5, y:20.5, taken:false},
   {x:28.5, y:29.5, taken:false}
  ],
  guards:[
   {x:1.5, y:28.5, type:'nkvd1', state:'escort', a:0, hp:40, hasFlashlight:true, weapon:'korovin', hitCooldown:0, pathIdx:0, workZone:true},
   {x:5.5, y:2.5, type:'nkvd1', state:'patrol', a:0, hp:40, hasFlashlight:true, weapon:'korovin', hitCooldown:0},
   {x:15.5, y:2.5, type:'nkvd2', state:'patrol', a:3.14, hp:40, hasFlashlight:true, weapon:'korovin', hitCooldown:0},
   {x:27.5, y:2.5, type:'nkvdcommander', state:'patrol', a:3.14, hp:80, hasFlashlight:false, weapon:'ppsh', hitCooldown:0},
   {x:22.5, y:22.5, type:'nkvd1', state:'patrol', a:0, hp:40, hasFlashlight:true, weapon:'korovin', hitCooldown:0, workZone:true},
   {x:27.5, y:21.5, type:'nkvd2', state:'patrol', a:3.14, hp:40, hasFlashlight:true, weapon:'korovin', hitCooldown:0, workZone:true},
   {x:21.5, y:27.5, type:'detinut', state:'work', a:1.5},
   {x:25.5, y:26.5, type:'detinut', state:'work', a:3.14},
   {x:28.5, y:28.5, type:'detinut', state:'work', a:0}
  ],
  playerLane: 1,
  arcadeObstacles: [],
  hitObstacleType: 'bolovan',
  roadScroll: 0,
  pressCount: 0,
  lastPressTime: 0,
  passbyProgress: 0,
  caughtReason: '',
  t:performance.now(), flash:0, prompt:'', fadeAlpha:0, loseStep:0, winStep:0, timer:0
 };

 cv.requestPointerLock&&cv.requestPointerLock();
 requestAnimationFrame(gulagLoop);
};

function initChaseSequence(){
 G.mode = 'chase';
 G.subState = 'chase';
 G.playerLane = 1;
 G.roadScroll = 0;
 
 G.arcadeObstacles = [];
 let startY = -400;
 for(let i = 0; i < 25; i++){
  startY -= 220;
  let lane = Math.floor(Math.random() * 3);
  let type = Math.random() > 0.5 ? 'bolovan' : 'bustean';
  G.arcadeObstacles.push({lane: lane, y: startY, type: type, passed: false});
 }
 G.prompt = '';
}

addEventListener('keydown',e=>{
 if(!G.on) return;
 const key = e.key.toLowerCase();

 if(G.mode === 'gulag' && G.state === 'playing'){
  if((key === 'e' || key === ' ') && Math.hypot(G.x - G.oreObj.x, G.y - G.oreObj.y) < 2.5){
   if(G.hunger > 10 && G.energy > 5){
    G.energy = Math.max(0, G.energy - 8);
    G.hasWorkedOnce = true;
    sndMinat.currentTime = 0; sndMinat.play().catch(e=>{});
    if(G.escortPhase === 'working'){
     G.workCountdown = 5.0; 
     G.workState = 'active_cycle';
    }
    G.prompt = 'Ai dat cu târnacopul în minereu! Muncă înregistrată.';
    setTimeout(()=>G.prompt='', 2000);
   } else {
    G.prompt = 'Ești prea epuizat sau înfometat! Bea vodcă!';
    setTimeout(()=>G.prompt='', 2500);
   }
  }

  if((key === 'e' || key === ' ') && Math.hypot(G.x-G.carObj.x, G.y-G.carObj.y)<3.0){
   if(G.hasKey){
    initChaseSequence();
   } else {
    G.prompt = 'Ai nevoie de cheie pentru a porni mașina!';
    setTimeout(()=>G.prompt='', 3000);
   }
  }
 }
 else if(G.mode === 'chase' && G.state === 'playing'){
  if(G.subState === 'chase'){
   if(key === 'a' || key === 'arrowleft'){
    G.playerLane = Math.max(0, G.playerLane - 1);
   } else if(key === 'd' || key === 'arrowright'){
    G.playerLane = Math.min(2, G.playerLane + 1);
   }
  }
  else if(G.subState === 'pull_right'){
   if(key === 'd' || key === 'arrowright' || key === 'e' || key === ' '){
    G.subState = 'outside_car';
    G.pressCount = 0;
   }
  }
  else if(G.subState === 'outside_car'){
   if(key === 'e' || key === ' '){
    G.subState = 'camouflaging';
    G.pressCount = 1;
    G.lastPressTime = performance.now();
    sndJump.currentTime = 0; sndJump.play().catch(e=>{});
   }
  }
  else if(G.subState === 'camouflaging'){
   if(key === 'e' || key === ' '){
    const now = performance.now();
    if(now - G.lastPressTime <= 3000){
     G.pressCount++;
     G.lastPressTime = now;
     sndJump.currentTime = 0; sndJump.play().catch(e=>{});
     if(G.pressCount >= 3){
      G.subState = 'hiding';
      G.passbyProgress = 0;
     }
    } else {
     triggerChaseLose('Ai ezitat prea mult și ai fost prins!', 'bolovan');
    }
   }
  }
 }
});

function triggerChaseLose(reason, hitType){
 G.state = 'lose';
 G.subState = 'chase_lose_anim';
 G.hitObstacleType = hitType || 'bolovan';
 G.loseStep = 0;
 G.timer = 0;
 G.fadeAlpha = 0;
 G.caughtReason = reason || '';
 document.exitPointerLock && document.exitPointerLock();
 sndBgm.pause();
 sndGun.currentTime = 0; sndGun.play().catch(e=>{});
}

function updateGulag(dt){
 if(G.state==='win'){
  G.timer += dt;
  if(G.timer >= 3.0 && G.winStep === 0) G.winStep = 1;
  if(G.timer >= 7.0 && G.winStep === 1) G.winStep = 2;
  if(G.timer >= 9.0 && G.winStep === 2) G.winStep = 3;
  return;
 }

 if(G.state==='lose'){
  G.timer += dt;
  if(G.subState === 'chase_lose_anim'){
   // Cronologie exactă:
   // 0s - 0.5s: Impact cu obstacolul mărit pe tot ecranul
   // 0.5s - 2.0s: Fundal ALB curat (fără mașina ta sau obstacole)
   // 2.0s: Apare mașina NKVD side (loseStep = 1)
   // 3.0s: Iese agentul NKVD + armă (loseStep = 2)
   // 4.0s: Ecran roșu și se întunecă complet în negru (loseStep = 3)
   // 7.0s (+3s): "Ai fost prins." (loseStep = 4)
   // 9.0s (+2s): "NKVD te găsește mereu." (loseStep = 5)
   // 11.0s (+2s): "Stalin poate fi liniștit." (loseStep = 6)
   // 13.0s (+2s): Butonul meniu (loseStep = 7)

   if(G.timer >= 2.0 && G.loseStep === 0) G.loseStep = 1;
   if(G.timer >= 3.0 && G.loseStep === 1) { G.loseStep = 2; sndNaziRifle.currentTime=0; sndNaziRifle.play().catch(e=>{}); }
   if(G.timer >= 4.0 && G.loseStep === 2) G.loseStep = 3;
   if(G.timer >= 7.0 && G.loseStep === 3) G.loseStep = 4;
   if(G.timer >= 9.0 && G.loseStep === 4) G.loseStep = 5;
   if(G.timer >= 11.0 && G.loseStep === 5) G.loseStep = 6;
   if(G.timer >= 13.0 && G.loseStep === 6) G.loseStep = 7;

   G.fadeAlpha = G.loseStep >= 3 ? Math.min(1, G.fadeAlpha + dt * 2.0) : 0;
  } else {
   G.fadeAlpha = Math.min(1, G.fadeAlpha + dt * 0.8);
   if(G.timer >= 3.0 && G.loseStep === 0) G.loseStep = 1;
   if(G.timer >= 7.0 && G.loseStep === 1) G.loseStep = 2;
   if(G.timer >= 9.0 && G.loseStep === 2) G.loseStep = 3;
  }
  // Melodia de înfrângere pornește DOAR după ce ecranul s-a făcut complet negru (oriunde pierzi)
  if(!G.loseMusic && G.fadeAlpha >= 1){
   G.loseMusic = true;
   sndGulagLose.currentTime = 0; sndGulagLose.play().catch(e=>{});
  }
  return;
 }

 if(G.mode === 'chase'){
  updateChase(dt);
  return;
 }

 G.hunger = Math.max(0, G.hunger - dt * 0.8);
 if(G.vodkaTimer > 0) G.vodkaTimer -= dt;

 if(G.hunger <= 5) {
  G.hp -= dt * 3.0;
  G.energy = Math.max(0, G.energy - dt * 5.0);
  if(G.hp <= 0 && G.state === 'playing'){
   G.state = 'lose'; G.loseStep = 0; G.timer = 0;
   sndBgm.pause(); document.exitPointerLock && document.exitPointerLock();
   sndExplosion.currentTime = 0; sndExplosion.play().catch(e=>{});
   return;
  }
 }

 const k=n=>(window.keys||{})[n];
 let forward=(k('w')||k('arrowup')?1:0)-(k('s')||k('arrowdown')?1:0);
 let strafe=(k('d')||k('arrowright')?1:0)-(k('a')||k('arrowleft')?1:0);

 let c=Math.cos(G.a), s=Math.sin(G.a);
 let mx=forward*c - strafe*s;
 let my=forward*s + strafe*c;
 let spd = G.vodkaTimer > 0 ? 7.5 : 3.8;

 if(k('q')) G.a -= 2.2 * dt;
 if(k('e')) G.a += 2.2 * dt;

 const l=Math.hypot(mx,my);
 if(l){
  mx=(mx/l)*spd*dt; my=(my/l)*spd*dt;
  if(!solid(G.x+mx, G.y)) G.x+=mx;
  if(!solid(G.x, G.y+my)) G.y+=my;
  G.energy = Math.max(0, G.energy - dt * 0.5);
 }

 G.vodkaObjs.forEach(v=>{
  if(!v.taken && Math.hypot(G.x-v.x, G.y-v.y) < 1.2){
   v.taken = true;
   G.hp = Math.min(G.maxHp, G.hp + 25);
   G.energy = Math.min(G.maxEnergy, G.energy + 40);
   G.hunger = Math.min(G.maxHunger, G.hunger + 35);
   G.vodkaTimer = 4.0;
   sndJump.currentTime = 0; sndJump.play().catch(e=>{});
   G.prompt = 'Ai băut Vodka! +25 HP, Energie și Foame refăcute!';
   setTimeout(()=>G.prompt='', 3000);
  }
 });

 if(!G.hasKey && !G.keyObj.taken && Math.hypot(G.x-G.keyObj.x, G.y-G.keyObj.y)<1.2){
  G.hasKey=true;
  G.keyObj.taken=true;
  G.escortPhase='escaped';
  sndJump.currentTime = 0; sndJump.play().catch(e=>{});
  G.prompt='Ai luat cheia! Gardienii te atacă, fugi la mașină!';
  setTimeout(()=>G.prompt='', 4000);
 }

 let guideGuard = G.guards[0];
 if(G.escortPhase === 'guiding'){
  const waypoints = [
   {x: 10.0, y: 29.5},
   {x: 18.0, y: 29.5},
   {x: 24.5, y: 24.5}
  ];
  if(!guideGuard.arrived){
   let wp = waypoints[Math.min(guideGuard.pathIdx || 0, waypoints.length - 1)];
   let angleToWp = Math.atan2(wp.y - guideGuard.y, wp.x - guideGuard.x);
   guideGuard.a = angleToWp;
   guideGuard.x += Math.cos(angleToWp) * 1.5 * dt;
   guideGuard.y += Math.sin(angleToWp) * 1.5 * dt;

   if(Math.hypot(wp.x - guideGuard.x, wp.y - guideGuard.y) < 1.5){
    guideGuard.pathIdx = (guideGuard.pathIdx || 0) + 1;
    if(guideGuard.pathIdx >= waypoints.length) {
     guideGuard.arrived = true;
     guideGuard.state = 'patrol';
    }
   }
  }

  if(!G.prompt) G.prompt = 'Urmează gardianul NKVD spre zona de muncă!';

  if(Math.hypot(G.x - 24.5, G.y - 24.5) < 4.0){
   G.escortPhase = 'working';
   G.workCountdown = 10.0;
   G.workState = 'initial_grace';
   G.prompt = 'Ai ajuns la muncă! Ai 10 secunde de grație până începi.';
  }
 }
 else if(G.escortPhase === 'working'){
  let targetX = 24.5, targetY = 24.5;
  if(!guideGuard.arrived && Math.hypot(targetX - guideGuard.x, targetY - guideGuard.y) > 1.5){
   let angleToTarget = Math.atan2(targetY - guideGuard.y, targetX - guideGuard.x);
   guideGuard.a = angleToTarget;
   guideGuard.x += Math.cos(angleToTarget) * 1.5 * dt;
   guideGuard.y += Math.sin(angleToTarget) * 1.5 * dt;
  } else {
   guideGuard.arrived = true;
   guideGuard.state = 'patrol';
  }

  if(G.x > 17 && G.y > 17){
   G.workCountdown -= dt;
   if(G.workState === 'initial_grace'){
    if(G.workCountdown <= 0){
     G.workState = 'active_cycle';
     G.workCountdown = 5.0;
    }
   } else {
    if(G.workCountdown <= 0 && !G.hasKey){
     G.hp -= 15 * dt;
     G.flash = 0.2;
     G.prompt = 'Nu ai lucrat în cele 5 secunde! Gardienii te atacă!';
     if(G.hp <= 0 && G.state === 'playing'){
      G.state = 'lose'; G.loseStep = 0; G.timer = 0;
      sndBgm.pause(); document.exitPointerLock && document.exitPointerLock();
      sndExplosion.currentTime = 0; sndExplosion.play().catch(e=>{});
     }
    }
   }
  } else {
   G.escortPhase = 'escaped';
   G.prompt = 'Ai părăsit zona de muncă! Alarma s-a declanșat!';
  }
 }

 G.guards.forEach((g, idx)=>{
  if(g.type === 'detinut') return; 
  if(idx === 0 && G.escortPhase === 'guiding' && !g.arrived) return;
  if(g.hitCooldown > 0) g.hitCooldown -= dt;

  let dx=G.x-g.x, dy=G.y-g.y, d=Math.hypot(dx,dy);
  let angleToPlayer = Math.atan2(dy, dx);
  let angleDiff = Math.abs(Math.atan2(Math.sin(g.a - angleToPlayer), Math.cos(g.a - angleToPlayer)));
  
  let topTunnelIntrusion = (g.y < 10 && G.y < 10);
  let workZoneCompliant = (G.escortPhase === 'working' && G.x > 17 && G.y > 17 && !G.hasKey && (G.workState === 'initial_grace' || (G.workState === 'active_cycle' && G.workCountdown > 0)));

  let workFailed = (G.escortPhase === 'working' && G.workState === 'active_cycle' && G.workCountdown <= 0);

  // TOȚI gardienii din zona de muncă se comportă la fel:
  //  - condiții respectate -> patrulează prin zonă (se mișcă, nu atacă)
  //  - ai luat cheia / ai părăsit zona / nu ai lucrat la timp -> te urmăresc și trag
  let zoneHostile = false;
  if(g.workZone){
   zoneHostile = (G.hasKey || G.escortPhase === 'escaped' || workFailed);
   if(!zoneHostile){
    g.state = 'patrol';
    zoneGuardPatrol(g, idx, dt);
    return;
   }
  }

  let see = false;
  if(workZoneCompliant){
   see = false;
  } else if(topTunnelIntrusion && !G.hasKey && G.escortPhase !== 'escaped'){
   see = (d < 8 && angleDiff < 0.95 && los(g.x, g.y, G.x, G.y));
  } else {
   see = (d < 8 && angleDiff < 0.95 && los(g.x, g.y, G.x, G.y)) || G.escortPhase === 'escaped';
  }

  if(zoneHostile) see = true;

  if(see || g.state === 'chase'){
   g.state = 'chase';
   g.a = angleToPlayer;
   let nx = g.x + Math.cos(g.a) * 2.5 * dt;
   let ny = g.y + Math.sin(g.a) * 2.5 * dt;
   if(!solid(nx, g.y)) g.x = nx;
   if(!solid(g.x, ny)) g.y = ny;

   if(d < 6.0 && g.hitCooldown <= 0){
    G.hp -= (g.type === 'nkvdcommander' ? 20 : 5);
    G.flash = 0.2;
    g.hitCooldown = 1.5;

    if(g.type === 'nkvdcommander'){
     sndNaziRifle.currentTime = 0; sndNaziRifle.play().catch(e=>{});
    } else {
     sndGun.currentTime = 0; sndGun.play().catch(e=>{});
    }

    if(G.hp <= 0 && G.state === 'playing'){
     G.state = 'lose'; G.loseStep = 0; G.timer = 0;
     sndBgm.pause(); document.exitPointerLock && document.exitPointerLock();
     sndExplosion.currentTime = 0; sndExplosion.play().catch(e=>{});
    }
   }
  }
 });

 if(G.flash>0) G.flash -= dt;
}

const ZONE_PATROL = {
 0:[{x:22.5,y:26.0},{x:27.0,y:26.0},{x:27.0,y:23.0},{x:22.5,y:23.0}],
 4:[{x:19.5,y:19.5},{x:29.0,y:19.5},{x:29.0,y:22.0},{x:19.5,y:22.0}],
 5:[{x:28.5,y:25.0},{x:20.0,y:25.0},{x:20.0,y:28.5},{x:28.5,y:28.5}]
};

function zoneGuardPatrol(g, idx, dt){
 const pts = ZONE_PATROL[idx];
 if(!pts) return;
 g.pIdx = g.pIdx || 0;
 let p = pts[g.pIdx % pts.length];
 let dx = p.x - g.x, dy = p.y - g.y, d = Math.hypot(dx, dy);
 if(d < 0.4){ g.pIdx = (g.pIdx + 1) % pts.length; return; }
 let a = Math.atan2(dy, dx);
 g.a = a;
 let nx = g.x + Math.cos(a) * 1.3 * dt;
 let ny = g.y + Math.sin(a) * 1.3 * dt;
 let moved = false;
 if(!solid(nx, g.y)){ g.x = nx; moved = true; }
 if(!solid(g.x, ny)){ g.y = ny; moved = true; }
 if(!moved) g.pIdx = (g.pIdx + 1) % pts.length;
}

function updateChase(dt){
 if(G.subState === 'chase'){
  G.roadScroll += 400 * dt;

  let allPassed = true;
  G.arcadeObstacles.forEach(ob => {
   ob.y += 400 * dt;
   if(ob.y < H + 100) allPassed = false;

   let playerY = 520;
   if(!ob.passed && Math.abs(ob.y - playerY) < 40 && ob.lane === G.playerLane){
    triggerChaseLose('Ai lovit un obstacol!', ob.type);
   }
   if(ob.y > playerY + 50) ob.passed = true;
  });

  if(allPassed || G.arcadeObstacles[G.arcadeObstacles.length - 1].y > H + 200){
   G.subState = 'pull_right';
  }
 }
 else if(G.subState === 'camouflaging'){
  if(performance.now() - G.lastPressTime > 3000){
   triggerChaseLose('Ai ezitat prea mult și ai fost prins!', 'bolovan');
  }
 }
 else if(G.subState === 'hiding'){
  G.passbyProgress += dt * 0.4;
  if(G.passbyProgress >= 1.2){
   G.state = 'win';
   G.winStep = 0;
   G.timer = 0;
   sndBgm.pause();
   sndGulagWin.currentTime = 0; sndGulagWin.play().catch(e=>{});
   if(window.gameStats) { window.gameStats.gulagEscapes = (window.gameStats.gulagEscapes || 0) + 1; }
   if(typeof saveStats === 'function') saveStats();
  }
 }
}

function renderGulag(){
 cx.clearRect(0,0,W,H);

 if(G.mode === 'chase' && G.state === 'playing'){
  renderChaseArcade();
  return;
 }

 cx.save();
 cx.fillStyle='#111'; cx.fillRect(0,0,W,H/2);
 cx.fillStyle='#1a1715'; cx.fillRect(0,H/2,W,H/2);

 for(let i=0;i<C;i++){
  const a=G.a+(i/C-.5)*FOV;
  const [d,t,s,wx]=cast(G.x,G.y,a);
  const p=Math.max(.05,d*Math.cos(a-G.a));
  Z[i]=p;
  const h=H/p, y0=(H-h)/2;
  const sh=Math.max(.05, 1-p/12)*(s?.6:1);
  
  let r=50, g=45, b=35;
  cx.fillStyle=`rgb(${r*sh|0},${g*sh|0},${b*sh|0})`;
  cx.fillRect(i*2,y0,2,h);
 }

 let sprites = [];

 {
  let obj = G.oreObj;
  let df=Math.atan2(obj.y-G.y, obj.x-G.x)-G.a;
  df=Math.atan2(Math.sin(df),Math.cos(df));
  if(Math.abs(df)<FOV/2+.5){
   let dist=Math.hypot(obj.x-G.x, obj.y-G.y);
   let pDist=Math.max(0.3, dist*Math.cos(df));
   let h=H/pDist*0.8, w=h;
   let l=(.5+df/FOV)*W-w/2, y=(H-h)/2;
   sprites.push({pDist, draw: ()=>{
    if(Z[(l+w/2)>>1] > pDist && IMG.ore.complete && IMG.ore.naturalWidth){
     cx.drawImage(IMG.ore, l, y, w, h);
    }
   }});
  }
 }

 if(!G.keyObj.taken){
  let obj = G.keyObj;
  let df=Math.atan2(obj.y-G.y, obj.x-G.x)-G.a;
  df=Math.atan2(Math.sin(df),Math.cos(df));
  if(Math.abs(df)<FOV/2+.4){
   let dist=Math.hypot(obj.x-G.x, obj.y-G.y);
   let pDist=Math.max(0.2, dist*Math.cos(df));
   let h=H/pDist*0.45, w=h;
   let l=(.5+df/FOV)*W-w/2, y=(H-h)/2;
   sprites.push({pDist, draw: ()=>{
    if(Z[(l+w/2)>>1] > pDist && IMG.key.complete && IMG.key.naturalWidth){
     cx.drawImage(IMG.key, l, y, w, h);
    }
   }});
  }
 }

 G.vodkaObjs.forEach(v=>{
  if(!v.taken){
   let df=Math.atan2(v.y-G.y, v.x-G.x)-G.a;
   df=Math.atan2(Math.sin(df),Math.cos(df));
   if(Math.abs(df)<FOV/2+.4){
    let dist=Math.hypot(v.x-G.x, v.y-G.y);
    let pDist=Math.max(0.2, dist*Math.cos(df));
    let h=H/pDist*0.45, w=h*0.7;
    let l=(.5+df/FOV)*W-w/2, y=(H-h)/2;
    sprites.push({pDist, draw: ()=>{
     if(Z[(l+w/2)>>1] > pDist && IMG.vodka.complete && IMG.vodka.naturalWidth){
      cx.drawImage(IMG.vodka, l, y, w, h);
     }
    }});
   }
  }
 });

 {
  let obj = G.carObj;
  let df=Math.atan2(obj.y-G.y, obj.x-G.x)-G.a;
  df=Math.atan2(Math.sin(df),Math.cos(df));
  if(Math.abs(df)<FOV/2+.5){
   let dist=Math.hypot(obj.x-G.x, obj.y-G.y);
   let pDist=Math.max(0.3, dist*Math.cos(df));
   let h=H/pDist*1.3, w=h*1.4;
   let l=(.5+df/FOV)*W-w/2, y=(H-h)/2;
   sprites.push({pDist, draw: ()=>{
    if(Z[(l+w/2)>>1] > pDist && IMG['gaz-m1'].complete && IMG['gaz-m1'].naturalWidth){
     cx.drawImage(IMG['gaz-m1'], l, y, w, h);
    }
   }});
  }
 }

 G.guards.forEach(g=>{
  let df=Math.atan2(g.y-G.y, g.x-G.x)-G.a;
  df=Math.atan2(Math.sin(df),Math.cos(df));
  if(Math.abs(df)<=FOV/2+.6){
   let dist=Math.hypot(g.x-G.x, g.y-G.y);
   let pDist=Math.max(0.3, dist*Math.cos(df));
   let h=H/pDist*1.0, w=h*0.6;
   let l=(.5+df/FOV)*W-w/2, y=(H-h)/2;

   let angleToPlayer = Math.atan2(G.y - g.y, G.x - g.x);
   let relativeAngle = g.a - angleToPlayer;
   let isFront = Math.cos(relativeAngle) > 0;
   
   let spriteKey;
   if(g.type === 'detinut'){
    spriteKey = isFront ? 'detinut-front' : 'detinut-back';
   } else if(g.type === 'nkvdcommander'){
    spriteKey = (g.state === 'chase' ? 'nkvdcommander-chase-' : 'nkvdcommander-') + (isFront ? 'front' : 'back');
   } else {
    let currentActionState = (g.state === 'patrol' || g.state === 'escort') ? 'patrol' : g.state;
    spriteKey = `${g.type}-${currentActionState}-${isFront ? 'front' : 'back'}`;
   }
   
   let img=IMG[spriteKey] || IMG[`${g.type}-patrol-front`] || IMG['detinut-front'];

   sprites.push({pDist, draw: ()=>{
    if(Z[(l+w/2)>>1] > pDist){
     if(img && img.complete && img.naturalWidth){
      cx.drawImage(img, l, y, w, h);
     } else {
      cx.fillStyle='#c0392b'; cx.fillRect(l,y,w,h);
     }
    }
   }});
  }
 });

 sprites.sort((a, b) => b.pDist - a.pDist);
 sprites.forEach(s => s.draw());

 if(G.flash>0){ 
  cx.fillStyle=`rgba(255,0,0,${G.flash})`; 
  cx.fillRect(0,0,W,H); 
 }
 cx.restore();

 if(G.state==='playing'){
  cx.fillStyle='rgba(0,0,0,0.7)'; cx.fillRect(15, 15, 310, 135);
  cx.fillStyle='#fff'; cx.font='bold 15px sans-serif';
  cx.fillText(`HP Gulag: ${Math.ceil(Math.max(0,G.hp))}/100`, 25, 38);
  cx.fillText(`Energie: ${Math.ceil(Math.max(0,G.energy))}/100`, 25, 60);
  cx.fillText(`Foame (Hunger): ${Math.ceil(Math.max(0,G.hunger))}/100`, 25, 82);
  cx.fillText(`Cheie: ${G.hasKey?'OBȚINUTĂ':'LIPSEȘTE'}`, 25, 104);

  if(G.escortPhase === 'working'){
   cx.fillStyle='#ffcc00';
   let timerDisplay = G.workState === 'initial_grace'
    ? `Timp grație: ${Math.max(0, G.workCountdown).toFixed(1)}s`
    : `Timp lucru: ${Math.max(0, G.workCountdown).toFixed(1)}s`;
   cx.fillText(timerDisplay, 25, 128);
  }

  if(G.vodkaTimer > 0) {
   cx.fillStyle='#00ffcc';
   cx.fillText(`Viteză Vodka: ${G.vodkaTimer.toFixed(1)}s`, 25, 150);
  }

  if(G.escortPhase === 'working' && G.hasWorkedOnce && !G.hasKey){
   cx.fillStyle='rgba(0, 0, 0, 0.75)';
   cx.fillRect(W - 270, 15, 255, 40);
   cx.strokeStyle='#ffcc00'; cx.lineWidth=2;
   cx.strokeRect(W - 270, 15, 255, 40);
   cx.fillStyle='#ffcc00'; cx.font='bold 16px sans-serif';
   cx.fillText("Încearcă să iei cheia", W - 255, 41);
  }

  if(Math.hypot(G.x - G.oreObj.x, G.y - G.oreObj.y) < 2.5){
   cx.fillStyle='rgba(0,0,0,0.85)'; cx.fillRect(W/2 - 270, H - 140, 540, 45);
   cx.fillStyle='#ffcc00'; cx.font='bold 18px sans-serif'; cx.textAlign='center';
   cx.fillText("Apasă [E] sau [Spațiu] pentru a lucra cu târnacopul!", W/2, H - 112);
   cx.textAlign='left';
  }

  if(Math.hypot(G.x - G.carObj.x, G.y - G.carObj.y) < 3.0){
   cx.fillStyle='rgba(0,0,0,0.85)'; cx.fillRect(W/2 - 250, H - 140, 500, 45);
   cx.fillStyle = G.hasKey ? '#33ff33' : '#ff3333';
   cx.font='bold 18px sans-serif'; cx.textAlign='center';
   cx.fillText(G.hasKey ? "Apasă [E] sau [Spațiu] pentru a evada cu mașina!" : "Ai nevoie de cheie pentru mașină!", W/2, H - 112);
   cx.textAlign='left';
  }

  if(IMG['tarnacop'].complete && IMG['tarnacop'].naturalWidth){
   cx.drawImage(IMG['tarnacop'], W - 70, 70, 50, 50);
  }

  if(G.prompt){
   cx.fillStyle='rgba(0,0,0,0.85)'; cx.fillRect(W/2 - 300, H - 90, 600, 45);
   cx.fillStyle='#ffcc00'; cx.font='bold 18px sans-serif';
   cx.textAlign='center'; cx.fillText(G.prompt, W/2, H - 60);
   cx.textAlign='left';
  }
 }

 if(G.state==='lose'){
  renderLoseScreen();
 }

 if(G.state==='win'){
  cx.fillStyle='rgba(10, 10, 15, 0.9)';
  cx.fillRect(0, 0, W, H);
  if(G.winStep >= 1){
   cx.fillStyle='#33ff33'; cx.font='bold 48px sans-serif'; cx.textAlign='center';
   cx.fillText("Ai evadat", W/2, H/2 - 60);
  }
  if(G.winStep >= 2){
   cx.fillStyle='#ff3333'; cx.font='bold 28px sans-serif'; cx.fillText("Stalin nu este fericit >:(", W/2, H/2);
  }
  if(G.winStep >= 3){
   drawMenuButton("Înapoi la meniu...");
  }
  cx.textAlign='left';
 }
}

function renderChaseArcade(){
 if(G.subState === 'chase'){
  cx.fillStyle='#0f172a'; cx.fillRect(0,0,W,H/2);
  cx.fillStyle='#f1f5f9'; cx.fillRect(0,H/2,W,H/2);

  let roadW = 500;
  let roadX = W/2 - roadW/2;
  cx.fillStyle='#cbd5e1'; cx.fillRect(roadX, 0, roadW, H);

  cx.strokeStyle='#94a3b8'; cx.lineWidth=6; cx.setLineDash([30, 30]);
  cx.lineDashOffset = -G.roadScroll;
  cx.beginPath(); cx.moveTo(roadX + roadW/3, 0); cx.lineTo(roadX + roadW/3, H); cx.stroke();
  cx.beginPath(); cx.moveTo(roadX + (roadW/3)*2, 0); cx.lineTo(roadX + (roadW/3)*2, H); cx.stroke();
  cx.setLineDash([]);

  let treeOffset = (G.roadScroll * 0.8) % 200;
  for(let ty = -100 + treeOffset; ty < H + 200; ty += 180){
   if(IMG['brad1'].complete && IMG['brad1'].naturalWidth){
    cx.drawImage(IMG['brad1'], roadX - 140, ty, 100, 150);
    cx.drawImage(IMG['brad2'], roadX + roadW + 40, ty, 100, 150);
   }
  }

  let laneXCoords = [roadX + roadW/6 - 40, roadX + roadW/2 - 40, roadX + (roadW/6)*5 - 40];

  G.arcadeObstacles.forEach(ob => {
   let ox = laneXCoords[ob.lane];
   let img = IMG[ob.type] || IMG['bolovan'];
   if(img && img.complete && img.naturalWidth){
    cx.drawImage(img, ox, ob.y - 40, 80, 80);
   }
  });

  let px = laneXCoords[G.playerLane];
  let py = 520;
  if(IMG['gaz-m1'].complete && IMG['gaz-m1'].naturalWidth){
   cx.drawImage(IMG['gaz-m1'], px - 20, py, 120, 140);
  }

  cx.fillStyle='rgba(0,0,0,0.7)'; cx.fillRect(W/2 - 240, H - 60, 480, 40);
  cx.fillStyle='#ffcc00'; cx.font='bold 16px sans-serif'; cx.textAlign='center';
  cx.fillText("Folosește [A] / [D] sau Săgețile pentru a schimba banda!", W/2, H - 34);
  cx.textAlign='left';
 }
 else if(G.subState === 'pull_right'){
  cx.fillStyle='#f1f5f9'; cx.fillRect(0,0,W,H);
  if(IMG['brad3'].complete && IMG['brad3'].naturalWidth){
   cx.drawImage(IMG['brad3'], 80, H/2 - 200, 260, 400);
   cx.drawImage(IMG['brad1'], W - 340, H/2 - 200, 260, 400);
  }
  if(IMG['gaz-m1'].complete && IMG['gaz-m1'].naturalWidth){
   cx.drawImage(IMG['gaz-m1'], W/2 - 180, H/2 - 70, 360, 200);
  }
  cx.fillStyle='rgba(0,0,0,0.85)'; cx.fillRect(W/2 - 320, H - 130, 640, 70);
  cx.fillStyle='#ffcc00'; cx.font='bold 18px sans-serif'; cx.textAlign='center';
  cx.fillText("Ai tras pe dreapta cu succes!", W/2, H - 98);
  cx.fillStyle='#ffffff'; cx.font='15px sans-serif';
  cx.fillText("Apasă [D] sau [E] pentru a ieși din mașină!", W/2, H - 74);
  cx.textAlign='left';
 }
 else if(G.subState === 'outside_car' || G.subState === 'camouflaging'){
  cx.fillStyle='#f1f5f9'; cx.fillRect(0,0,W,H);

  // Brazii rămân ficși și stabili
  if(IMG['brad1'].complete && IMG['brad1'].naturalWidth){
   cx.drawImage(IMG['brad1'], 100, H/2 - 200, 250, 400);
   cx.drawImage(IMG['brad2'], W - 350, H/2 - 200, 250, 400);
  }

  if(IMG['gaz-m1'].complete && IMG['gaz-m1'].naturalWidth){
   cx.drawImage(IMG['gaz-m1'], W/2 - 180, H/2 - 80, 360, 200);
  }

  cx.fillStyle='rgba(0,0,0,0.85)'; cx.fillRect(W/2 - 320, H - 130, 640, 70);
  cx.fillStyle='#ffcc00'; cx.font='bold 18px sans-serif'; cx.textAlign='center';
  if(G.subState === 'outside_car'){
   cx.fillText("Ai ieșit din mașină în zăpadă!", W/2, H - 98);
   cx.fillStyle='#ffffff'; cx.font='15px sans-serif';
   cx.fillText("Apasă de 3 ori pe [E] sau [Spațiu] pentru a camufla mașina!", W/2, H - 74);
  } else {
   cx.fillText(`Camuflezi mașina... Apasări: (${G.pressCount}/3)`, W/2, H - 98);
   cx.fillStyle='#33ff33'; cx.font='15px sans-serif';
   cx.fillText("Apasă din nou [E] sau [Spațiu] (max 3 secunde între apăsări)!", W/2, H - 74);
  }
  cx.textAlign='left';
 }
 else if(G.subState === 'hiding'){
  cx.fillStyle='#f1f5f9'; cx.fillRect(0,0,W,H);

  if(IMG['brad3'].complete && IMG['brad3'].naturalWidth){
   cx.drawImage(IMG['brad3'], 50, H/2 - 220, 300, 450);
  }

  if(IMG['gaz-m1-camuflata'].complete && IMG['gaz-m1-camuflata'].naturalWidth){
   cx.drawImage(IMG['gaz-m1-camuflata'], W/2 - 180, H/2 - 70, 360, 200);
  }

  let sideX = -400 + G.passbyProgress * (W + 500);
  if(IMG['nkvd-auto-side'].complete && IMG['nkvd-auto-side'].naturalWidth){
   cx.drawImage(IMG['nkvd-auto-side'], sideX, H - 260, 380, 180);
  }

  cx.fillStyle='rgba(0,0,0,0.85)'; cx.fillRect(W/2 - 280, 40, 560, 45);
  cx.fillStyle='#33ff33'; cx.font='bold 18px sans-serif'; cx.textAlign='center';
  cx.fillText("Ești ascuns... NKVD trece pe lângă tine!", W/2, 68);
  cx.textAlign='left';
 }
}

function renderLoseScreen(){
 if(G.subState === 'chase_lose_anim'){
  // Pasul 0: Fundal alb cu obstacolul atins mărit pe tot ecranul
  if(G.loseStep === 0){
   cx.fillStyle='#ffffff'; cx.fillRect(0, 0, W, H);
   let img = IMG[G.hitObstacleType] || IMG['bolovan'];
   if(img && img.complete && img.naturalWidth){
    cx.drawImage(img, W/2 - 250, H/2 - 250, 500, 500);
   }
  } 
  // Pasul 1 & 2: Fundal ALB curat + mașina NKVD și agentul NKVD (fără mașina ta!)
  else if(G.loseStep === 1 || G.loseStep === 2){
   cx.fillStyle='#ffffff'; cx.fillRect(0, 0, W, H);
   if(G.loseStep >= 1 && IMG['nkvd-auto-side'].complete && IMG['nkvd-auto-side'].naturalWidth){
    cx.drawImage(IMG['nkvd-auto-side'], W/2 - 250, H/2 - 120, 300, 150);
   }
   if(G.loseStep >= 2 && IMG['nkvd1-chase-front'].complete && IMG['nkvd1-chase-front'].naturalWidth){
    cx.drawImage(IMG['nkvd1-chase-front'], W/2 - 90, H/2 - 140, 180, 240);
   }
  }

  // Ecran roșu la împușcătură, apoi se întunecă complet în negru
  if(G.loseStep >= 3){
   cx.fillStyle=`rgba(255, 0, 0, ${Math.max(0, 1.0 - G.fadeAlpha)})`;
   cx.fillRect(0, 0, W, H);
   cx.fillStyle=`rgba(0, 0, 0, ${G.fadeAlpha})`;
   cx.fillRect(0, 0, W, H);
  }

  // Textul apare rând pe rând după întunecare completă
  if(G.loseStep >= 4){
   cx.fillStyle='#ff3333'; cx.font='bold 48px sans-serif'; cx.textAlign='center';
   cx.fillText("Ai fost prins.", W/2, H/2 - 80);
  }
  if(G.loseStep >= 5){
   cx.fillStyle='#ff9900'; cx.font='bold 26px sans-serif'; cx.textAlign='center';
   cx.fillText("NKVD te găsește mereu.", W/2, H/2 - 20);
  }
  if(G.loseStep >= 6){
   cx.fillStyle='#ffcc00'; cx.font='bold 26px sans-serif'; cx.textAlign='center';
   cx.fillText("Stalin poate fi liniștit.", W/2, H/2 + 30);
  }
  if(G.loseStep >= 7){
   drawMenuButton("Înapoi la meniu...");
  }
 } else {
  cx.fillStyle=`rgba(0, 0, 0, ${G.fadeAlpha})`;
  cx.fillRect(0, 0, W, H);
  if(G.loseStep >= 1){
   cx.fillStyle='#ff3333'; cx.font='bold 48px sans-serif'; cx.textAlign='center';
   cx.fillText("Ai fost prins.", W/2, H/2 - 60);
  }
  if(G.loseStep >= 2){
   cx.fillStyle='#ffcc00'; cx.font='bold 28px sans-serif'; cx.textAlign='center';
   cx.fillText("Stalin poate fi liniștit.", W/2, H/2);
  }
  if(G.loseStep >= 3){
   drawMenuButton("Înapoi la meniu...");
  }
 }
 cx.textAlign='left';
}

function drawMenuButton(text){
 let btnX = W/2 - 140, btnY = H/2 + 90, btnW = 280, btnH = 60;
 cx.fillStyle = '#cc0000';
 cx.fillRect(btnX, btnY, btnW, btnH);
 cx.strokeStyle = '#ffff00'; cx.lineWidth = 3;
 cx.strokeRect(btnX, btnY, btnW, btnH);
 cx.fillStyle = '#ffff00'; cx.font = 'bold 22px sans-serif';
 cx.textAlign='center';
 cx.fillText(text, W/2, btnY + 37);
}

cv.addEventListener('click', e=>{
 if(!G.on || (G.state !== 'win' && G.state !== 'lose')) return;

 // Butonul poate fi apăsat DOAR după ce a apărut vizual pe ecran
 let buttonVisible = false;
 if(G.state === 'lose'){
  if(G.subState === 'chase_lose_anim'){
   buttonVisible = (G.loseStep >= 7);
  } else {
   buttonVisible = (G.loseStep >= 3);
  }
 } else if(G.state === 'win'){
  buttonVisible = (G.winStep >= 3);
 }
 if(!buttonVisible) return;

 let btnX = W/2 - 140, btnY = H/2 + 90, btnW = 280, btnH = 60;
 let rect = cv.getBoundingClientRect();
 let mouseX = (e.clientX - rect.left) * (W / rect.width);
 let mouseY = (e.clientY - rect.top) * (H / rect.height);
 if(mouseX >= btnX && mouseX <= btnX+btnW && mouseY >= btnY && mouseY <= btnY+btnH){
  G.on = false;
  sndBgm.pause(); sndBgm.currentTime = 0;
  sndGulagLose.pause(); sndGulagLose.currentTime = 0;
  sndGulagWin.pause(); sndGulagWin.currentTime = 0;
  sndExplosion.pause(); sndExplosion.currentTime = 0;
  if(window.backToMain) window.backToMain();
 }
});

function gulagLoop(t){
 if(!G.on) return;
 const dt=Math.min(.05,(t-G.t)/1000||0); G.t=t;
 try{ updateGulag(dt); }catch(err){ console.error('Gulag update error:', err); }
 try{ renderGulag(); }catch(err){ console.error('Gulag render error:', err); }
 if(G.on) requestAnimationFrame(gulagLoop);
}
})();