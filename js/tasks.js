/* NexTaska task manager: shared browser-local storage. */
(() => {
  'use strict';
  const TASKS_KEY = 'nextaska-tasks-v1';
  const readTasks = () => {
    try {
      const value = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (error) { return []; }
  };
  const saveTasks = (tasks) => localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  const escapeDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const priorityClass = (priority) => ({ high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }[(priority || 'medium').toLowerCase()] || 'badge-medium');
  const normalize = (value) => String(value || '').trim();

  function renderTasks(filter = document.querySelector('[data-filter].selected')?.dataset.filter || 'all') {
    const container = document.getElementById('tasks-container');
    if (!container) return;
    const tasks = readTasks();
    const allCount = document.getElementById('all-task-count');
    const pendingCount = document.getElementById('pending-task-count');
    const completedCount = document.getElementById('completed-task-count');
    const listCount = document.getElementById('task-list-count');
    if (allCount) allCount.textContent = tasks.length;
    if (pendingCount) pendingCount.textContent = tasks.filter(t => !t.completed).length;
    if (completedCount) completedCount.textContent = tasks.filter(t => t.completed).length;
    if (listCount) listCount.textContent = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;

    const visible = tasks.filter(task => {
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      if (filter === 'high') return !task.completed && (task.priority || '').toLowerCase() === 'high';
      return true;
    });
    container.replaceChildren();
    if (!visible.length) {
      const empty = document.createElement('p');
      empty.className = 'muted-text';
      empty.style.padding = '20px 0';
      empty.textContent = tasks.length ? 'No tasks match this filter.' : 'No tasks yet. Add your first task below or use Add New Task.';
      container.appendChild(empty);
      return;
    }
    visible.forEach(task => {
      const row = document.createElement('div'); row.className = 'task-row';
      const toggle = document.createElement('button');
      toggle.type = 'button'; toggle.className = `task-check${task.completed ? ' done' : ''}`;
      toggle.textContent = task.completed ? '✓' : ''; toggle.setAttribute('aria-label', task.completed ? 'Mark task pending' : 'Mark task completed');
      toggle.dataset.action = 'toggle'; toggle.dataset.id = task.id;
      const details = document.createElement('div'); details.className = 'task-details';
      const title = document.createElement('strong'); title.textContent = task.title;
      if (task.completed) title.className = 'task-finished';
      const meta = document.createElement('span');
      const bits = [task.category || 'General'];
      if (task.dueDate) bits.push(`Due: ${escapeDate(task.dueDate)}`);
      if (task.completed) bits.push('Completed');
      meta.textContent = bits.join(' · ');
      details.append(title, meta);
      const priority = document.createElement('span'); priority.className = `badge ${task.completed ? 'badge-done' : priorityClass(task.priority)}`;
      priority.textContent = task.completed ? 'Completed' : (task.priority || 'Medium');
      const del = document.createElement('button'); del.type = 'button'; del.className = 'filter-btn'; del.textContent = 'Delete'; del.dataset.action = 'delete'; del.dataset.id = task.id;
      row.append(toggle, details, priority, del); container.appendChild(row);
    });
  }

  function addTask(task) {
    const tasks = readTasks();
    tasks.unshift({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, title: task.title, description: task.description || '', priority: task.priority || 'Medium', category: task.category || 'General', dueDate: task.dueDate || '', reminder: task.reminder || '', completed: false, createdAt: new Date().toISOString() });
    saveTasks(tasks);
  }

  const taskForm = document.getElementById('task-form');
  if (taskForm) {
    taskForm.addEventListener('submit', event => {
      event.preventDefault();
      const title = normalize(document.getElementById('task-title')?.value);
      const priority = document.getElementById('task-priority')?.value;
      if (!title || !priority) return;
      addTask({ title, priority, category: 'General' });
      taskForm.reset(); renderTasks();
      document.getElementById('task-title')?.focus();
    });
  }

  const addForm = document.getElementById('add-task-form');
  if (addForm) {
    addForm.addEventListener('submit', event => {
      event.preventDefault();
      const title = normalize(document.getElementById('title')?.value);
      if (!title) return;
      addTask({ title, description: normalize(document.getElementById('description')?.value), dueDate: document.getElementById('due-date')?.value, priority: document.getElementById('priority')?.selectedOptions[0]?.textContent || 'Medium', category: document.getElementById('category')?.selectedOptions[0]?.textContent || 'General', reminder: document.getElementById('reminder')?.value });
      window.location.href = 'tasks.html';
    });
  }

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(item => item.classList.toggle('selected', item === button));
      renderTasks(button.dataset.filter);
    });
  });
  const taskContainer = document.getElementById('tasks-container');
  if (taskContainer) taskContainer.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]'); if (!button) return;
    const tasks = readTasks(); const task = tasks.find(item => String(item.id) === button.dataset.id); if (!task) return;
    if (button.dataset.action === 'toggle') task.completed = !task.completed;
    if (button.dataset.action === 'delete') {
      if (!window.confirm(`Delete "${task.title}"?`)) return;
      saveTasks(tasks.filter(item => String(item.id) !== button.dataset.id));
    } else saveTasks(tasks);
    renderTasks();
  });
  renderTasks();
  window.NexTaskaTasks = { readTasks, saveTasks, renderTasks, addTask };
})();
