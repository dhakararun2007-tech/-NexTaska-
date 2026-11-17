/* Notes manager with localStorage persistence and the existing note-card design. */
(() => {
  'use strict';
  const KEY = 'nextaska-notes-v1';
  const form = document.getElementById('note-form');
  const grid = document.getElementById('notes-grid');
  if (!grid || !form) return;
  const titleInput = document.getElementById('note-title');
  const categoryInput = document.getElementById('note-category');
  const colorInput = document.getElementById('note-color');
  const contentInput = document.getElementById('note-content');
  const searchInput = document.getElementById('notes-search');
  const count = document.getElementById('notes-count');
  let editingId = null;
  let filter = 'all';
  const readNotes = () => { try { const notes = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(notes) ? notes : []; } catch (_) { return []; } };
  const saveNotes = notes => localStorage.setItem(KEY, JSON.stringify(notes));
  const slug = value => String(value || '').toLowerCase();
  const colorClass = color => ({ purple:'note-purple', pink:'note-pink', cyan:'note-cyan', yellow:'note-yellow' }[slug(color)] || 'note-purple');
  const tagClass = color => ({ purple:'purple-tag', pink:'pink-tag', cyan:'cyan-tag', yellow:'yellow-tag' }[slug(color)] || 'purple-tag');
  function render() {
    const notes = readNotes(); const query = slug(searchInput?.value);
    const shown = notes.filter(note => (filter === 'all' || note.category === filter) && (!query || `${note.title} ${note.content} ${note.category}`.toLowerCase().includes(query)));
    grid.replaceChildren(); if (count) count.textContent = `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`;
    if (!shown.length) { const empty = document.createElement('p'); empty.className = 'muted-text'; empty.style.gridColumn = '1 / -1'; empty.textContent = notes.length ? 'No notes match your search or category.' : 'No notes saved yet. Create your first note below.'; grid.appendChild(empty); return; }
    shown.forEach(note => {
      const card = document.createElement('article'); card.className = `note-card ${colorClass(note.color)}`;
      const top = document.createElement('div'); top.className = 'note-card-top';
      const tag = document.createElement('span'); tag.className = `note-category-tag ${tagClass(note.color)}`; tag.textContent = note.category.toUpperCase();
      const pin = document.createElement('span'); pin.className = 'note-pin'; pin.textContent = '✦'; top.append(tag, pin);
      const title = document.createElement('h3'); title.textContent = note.title;
      const content = document.createElement('p'); content.style.whiteSpace = 'pre-wrap'; content.textContent = note.content;
      const footer = document.createElement('div'); footer.className = 'note-card-footer';
      const date = document.createElement('span'); date.textContent = new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, { month:'short', day:'2-digit', year:'numeric' });
      const actions = document.createElement('span'); actions.style.display = 'flex'; actions.style.gap = '10px';
      const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'filter-btn'; edit.textContent = 'Edit'; edit.dataset.action = 'edit'; edit.dataset.id = note.id;
      const del = document.createElement('button'); del.type = 'button'; del.className = 'filter-btn'; del.textContent = 'Delete'; del.dataset.action = 'delete'; del.dataset.id = note.id;
      actions.append(edit, del); footer.append(date, actions); card.append(top, title, content, footer); grid.appendChild(card);
    });
  }
  form.addEventListener('submit', event => {
    event.preventDefault(); const title = titleInput.value.trim(); const content = contentInput.value.trim();
    if (!title) { titleInput.focus(); return; }
    const notes = readNotes(); const now = new Date().toISOString();
    if (editingId) {
      const index = notes.findIndex(note => note.id === editingId);
      if (index >= 0) notes[index] = { ...notes[index], title, content, category: categoryInput.value, color: colorInput.value, updatedAt: now };
    } else notes.unshift({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, title, content, category: categoryInput.value, color: colorInput.value, createdAt: now, updatedAt: now });
    saveNotes(notes); form.reset(); editingId = null; const submit = form.querySelector('button[type="submit"]'); if (submit) submit.textContent = 'Save Note'; render();
  });
  form.addEventListener('reset', () => { editingId = null; const submit = form.querySelector('button[type="submit"]'); if (submit) submit.textContent = 'Save Note'; });
  grid.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]'); if (!button) return;
    const notes = readNotes(); const note = notes.find(item => item.id === button.dataset.id); if (!note) return;
    if (button.dataset.action === 'edit') {
      editingId = note.id; titleInput.value = note.title; categoryInput.value = note.category; colorInput.value = note.color; contentInput.value = note.content;
      const submit = form.querySelector('button[type="submit"]'); if (submit) submit.textContent = 'Update Note';
      document.getElementById('create-note')?.scrollIntoView({ behavior: 'smooth' }); titleInput.focus();
    } else if (button.dataset.action === 'delete' && window.confirm(`Delete "${note.title}"?`)) {
      saveNotes(notes.filter(item => item.id !== note.id)); if (editingId === note.id) { form.reset(); } render();
    }
  });
  document.querySelectorAll('[data-note-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.noteFilter; document.querySelectorAll('[data-note-filter]').forEach(item => item.classList.toggle('selected', item === button)); render();
  }));
  searchInput?.addEventListener('input', render);
  render();
})();
