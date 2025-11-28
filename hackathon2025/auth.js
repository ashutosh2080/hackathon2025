// auth.js - Sign up / Sign in logic (stores one user in localStorage under key 'alertnet_user')

(function(){
  const STORAGE_KEY = 'alertnet_user';

  // elements
  const authContainer = document.getElementById('authContainer');
  const authBtn = document.getElementById('authBtn');
  const authModal = document.getElementById('authModal');
  const closeAuth = document.getElementById('closeAuth');
  const signupForm = document.getElementById('signupForm');
  const signinForm = document.getElementById('signinForm');
  const toSignIn = document.getElementById('toSignIn');
  const toSignUp = document.getElementById('toSignUp');
  const authTitle = document.getElementById('authTitle');

  const SU_NAME = document.getElementById('su_name');
  const SU_LOC = document.getElementById('su_location');
  const SU_PHONE = document.getElementById('su_phone');
  const SI_PHONE = document.getElementById('si_phone');

  const toast = document.getElementById('authToast');
  const toastText = document.getElementById('authToastText');

  // helpers
  function showToast(msg, t=2000){
    toastText.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(()=> toast.classList.add('hidden'), t);
  }

  function saveUser(user){ localStorage.setItem(STORAGE_KEY, JSON.stringify(user)); }
  function loadUser(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)); }catch(e){ return null; } }
  function clearUser(){ localStorage.removeItem(STORAGE_KEY); }

  function escapeHtml(s){ return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

  // auth UI
  function openAuth(mode='signup'){
    authModal.classList.remove('hidden');
    signupForm.classList.toggle('hidden', mode !== 'signup');
    signinForm.classList.toggle('hidden', mode === 'signup');
    authTitle.textContent = mode === 'signup' ? 'Sign up' : 'Sign in';
  }
  function closeAuthModal(){
    authModal.classList.add('hidden');
  }

  // navbar update
  function renderAuthState(){
    const user = loadUser();
    if(user && user.phone){
      authContainer.innerHTML = `
        <div class="auth-hello">Hello, <strong>${escapeHtml(user.name)}</strong></div>
        <button id="logoutBtn" class="auth-logout">Logout</button>
      `;
      const logoutBtn = document.getElementById('logoutBtn');
      logoutBtn.addEventListener('click', ()=>{
        clearUser();
        renderAuthState();
        showToast('Logged out');
      });
    } else {
      authContainer.innerHTML = `<button id="authBtn" class="auth-btn">Sign up / Sign in</button>`;
      document.getElementById('authBtn').addEventListener('click', ()=> openAuth('signup'));
    }
  }

  // initial wire
  try {
    authBtn.addEventListener('click', ()=> openAuth('signup'));
  } catch(e){ /* if authBtn not present - ignore */ }

  closeAuth.addEventListener('click', closeAuthModal);
  toSignIn.addEventListener('click', ()=> openAuth('signin'));
  toSignUp.addEventListener('click', ()=> openAuth('signup'));

  // Sign up handler
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = SU_NAME.value.trim();
    const location = SU_LOC.value.trim();
    const phone = SU_PHONE.value.trim();
    if(!name || !location || !phone){ showToast('Please fill all fields'); return; }
    if(!/^\d{7,15}$/.test(phone)){ showToast('Enter a valid phone number'); return; }
    const user = { name, location, phone };
    saveUser(user);
    closeAuthModal();
    renderAuthState();
    showToast('Account created — signed in');
  });

  // Sign in handler
  signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = SI_PHONE.value.trim();
    if(!phone){ showToast('Enter phone number'); return; }
    const user = loadUser();
    if(user && user.phone === phone){
      closeAuthModal();
      renderAuthState();
      showToast('Signed in');
    } else {
      showToast('No account found for this phone');
    }
  });

  // preload fields when page loads
  window.addEventListener('DOMContentLoaded', ()=>{
    const u = loadUser();
    if(u){
      SU_NAME.value = u.name || '';
      SU_LOC.value = u.location || '';
      SU_PHONE.value = u.phone || '';
    }
    renderAuthState();
  });

})();