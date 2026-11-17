/* NexTaska demo authentication. Browser-only; not production security. */
(() => {
  'use strict';
  const USERS_KEY = 'nextaska-demo-users-v1';
  const SESSION_KEY = 'nextaska-demo-session-v1';
  const form = document.getElementById('auth-form');
  if (!form) return;

  const $ = id => document.getElementById(id);
  let mode = 'login';

  const readUsers = () => {
    try {
      const data = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  };
  const setMessage = message => { $('auth-message').textContent = message; };

  function setMode(nextMode) {
    mode = nextMode;
    const signup = mode === 'signup';
    $('name-field').hidden = !signup;
    $('auth-name').required = signup;
    $('auth-eyebrow').textContent = signup ? 'START YOUR JOURNEY' : 'WELCOME BACK';
    $('auth-heading').textContent = signup ? 'Create your account' : 'Sign in to NexTaska';
    $('auth-subtitle').textContent = signup ? 'Set up your personal workspace.' : 'Continue where you left off.';
    $('auth-submit').textContent = signup ? 'Create account' : 'Sign in';
    $('auth-switch-text').textContent = signup ? 'Already have an account?' : 'New to NexTaska?';
    $('auth-switch').textContent = signup ? 'Sign in' : 'Create account';
    $('auth-password').autocomplete = signup ? 'new-password' : 'current-password';
    setMessage('');
  }

  $('auth-switch').addEventListener('click', () => setMode(mode === 'login' ? 'signup' : 'login'));

  form.addEventListener('submit', event => {
    event.preventDefault();
    const email = $('auth-email').value.trim().toLowerCase();
    const password = $('auth-password').value;
    const name = $('auth-name').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMessage('Please enter a valid email address.');
    if (password.length < 6) return setMessage('Password must be at least 6 characters.');

    const users = readUsers();
    if (mode === 'signup') {
      if (name.length < 2) return setMessage('Please enter your name.');
      if (users.some(user => user.email === email)) return setMessage('An account with this email already exists.');
      users.push({ id: `${Date.now()}`, name, email, password });
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(SESSION_KEY, JSON.stringify({ name, email, signedInAt: new Date().toISOString() }));
      window.location.href = 'dashboard.html';
      return;
    }

    const user = users.find(item => item.email === email && item.password === password);
    if (!user) return setMessage('Email or password is incorrect. Create an account if this is your first visit.');
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email, signedInAt: new Date().toISOString() }));
    window.location.href = 'dashboard.html';
  });

  setMode('login');
})();
