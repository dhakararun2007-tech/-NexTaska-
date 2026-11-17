/* Adds the current demo user and sign-out action to app headers. */
(() => {
  'use strict';
  let session = null;
  try { session = JSON.parse(localStorage.getItem('nextaska-demo-session-v1') || 'null'); } catch {}
  const right = document.querySelector('.topbar-right');
  if (!right || right.querySelector('[data-auth-signout]')) return;
  if (session && session.name) {
    const welcome = right.querySelector('.welcome-user, .workspace-label');
    if (welcome) welcome.textContent = `Hi, ${session.name}`;
    const avatar = right.querySelector('.avatar');
    if (avatar) avatar.textContent = session.name.trim().charAt(0).toUpperCase();
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.authSignout = 'true';
  button.className = 'filter-btn';
  button.textContent = session ? 'Sign out' : 'Sign in';
  button.addEventListener('click', () => {
    if (session) localStorage.removeItem('nextaska-demo-session-v1');
    window.location.href = 'login.html';
  });
  right.appendChild(button);
})();
