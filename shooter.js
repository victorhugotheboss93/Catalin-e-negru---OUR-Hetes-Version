// ===== MODUL SHOOTER & MULTIPLAYER FIREBASE FIRESTORE (V6.0 - CLEAN SHOOTER & TETRIS MENU STYLE) =====
(()=>{
const st=document.createElement('style');
st.textContent=`
#sh-work-in-progress-overlay {
 position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
 background: rgba(0, 0, 0, 0.85); display: flex; flex-direction: column;
 align-items: center; justify-content: center; z-index: 99999;
 font-family: sans-serif; color: #fff; text-align: center; padding: 20px;
}
#sh-work-in-progress-overlay h1 {
 font-size: 32px; color: #e74c3c; margin-bottom: 20px; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;
}
#sh-work-in-progress-overlay p {
 font-size: 18px; color: #ccc; margin-bottom: 30px;
}
#sh-work-in-progress-overlay button {
 padding: 10px 20px; font-size: 16px; background: #c0392b; border: 1px solid #e74c3c;
 color: white; border-radius: 4px; cursor: pointer; font-weight: bold;
}
#sh-work-in-progress-overlay button:hover { background: #e74c3c; }
`;
document.head.appendChild(st);

function showInProgressMessage() {
 let existing = document.getElementById('sh-work-in-progress-overlay');
 if(existing) existing.remove();

 const overlay = document.createElement('div');
 overlay.id = 'sh-work-in-progress-overlay';
 overlay.innerHTML = `
  <div>
   <h1>Modul Shooter</h1>
   <p>Din păcate, acest mod este în lucru și nu este accesibil încă.</p>
   <button onclick="shBackToMain()">Înapoi la meniu</button>
  </div>
 `;
 document.body.appendChild(overlay);
}

window.shMenu = () => {
 showInProgressMessage();
};

window.openShooterMenu = () => {
 showInProgressMessage();
};

window.shArsenal = () => {
 showInProgressMessage();
};

window.shStartGame = () => {
 showInProgressMessage();
};

window.shBackToMain = () => {
 const overlay = document.getElementById('sh-work-in-progress-overlay');
 if(overlay) overlay.remove();

 const mainM = document.getElementById('main-menu'); if(mainM) mainM.classList.remove('hidden');
 const authP = document.getElementById('auth-panel'); 
 if(authP) {
  authP.classList.remove('hidden');
  authP.style.display = 'block';
 }

 if(typeof window.originalBackToMain === 'function') {
  window.originalBackToMain();
 }
};

window.addEventListener('DOMContentLoaded', () => {
 if(typeof window.backToMain === 'function' && window.backToMain !== window.shBackToMain) {
  window.originalBackToMain = window.backToMain;
  window.backToMain = () => {
   window.shBackToMain();
  };
 }
 showInProgressMessage();
});
})();