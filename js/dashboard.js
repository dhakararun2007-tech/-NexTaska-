/* Dashboard values are derived from the same tasks saved by tasks.js. */
(() => {
  'use strict';
  const KEY = 'nextaska-tasks-v1';
  let tasks = [];
  try { const data = JSON.parse(localStorage.getItem(KEY) || '[]'); tasks = Array.isArray(data) ? data : []; } catch (_) { tasks = []; }
  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  setText('dashboard-total', tasks.length); setText('dashboard-pending', pending); setText('dashboard-completed', completed);
  setText('dashboard-progress-label', `${percent}%`);
  setText('dashboard-progress-text', `${completed} out of ${tasks.length} tasks completed.`);
  const bar = document.getElementById('dashboard-progress-fill'); if (bar) bar.style.width = `${percent}%`;
  const list = document.getElementById('dashboard-recent-tasks');
  if (list) {
    list.replaceChildren();
    const recent = tasks.slice(0, 4);
    if (!recent.length) { const empty = document.createElement('p'); empty.className = 'muted-text'; empty.textContent = 'No tasks yet. Add a task to see it here.'; list.appendChild(empty); }
    recent.forEach(task => {
      const row = document.createElement('div'); row.className = 'task-row';
      const check = document.createElement('span'); check.className = `task-check${task.completed ? ' done' : ''}`; check.textContent = task.completed ? '✓' : '';
      const details = document.createElement('div'); details.className = 'task-details';
      const title = document.createElement('strong'); title.textContent = task.title; if (task.completed) title.className = 'task-finished';
      const meta = document.createElement('span'); meta.textContent = task.category || 'General'; details.append(title, meta);
      const badge = document.createElement('span');
      const priority = (task.priority || 'Medium').toLowerCase(); badge.className = `badge ${task.completed ? 'badge-done' : ({high:'badge-high',low:'badge-low',medium:'badge-medium'}[priority] || 'badge-medium')}`;
      badge.textContent = task.completed ? 'Completed' : (task.priority || 'Medium'); row.append(check, details, badge); list.appendChild(row);
    });
  }
})();
