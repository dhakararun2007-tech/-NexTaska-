/* NexTaska Notes: open full notes, edit and persist them in Local Storage. */
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
  let editingId=null,filter='all',activeNoteId=null;

  const readNotes = () => { try { const notes = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(notes) ? notes : []; } catch (_) { return []; } };
  const saveNotes = notes => localStorage.setItem(KEY, JSON.stringify(notes));
  const slug = value => String(value || '').toLowerCase();
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const colorClass = color => ({ purple:'note-purple', pink:'note-pink', cyan:'note-cyan', yellow:'note-yellow' }[slug(color)] || 'note-purple');
  const tagClass = color => ({ purple:'purple-tag', pink:'pink-tag', cyan:'cyan-tag', yellow:'yellow-tag' }[slug(color)] || 'purple-tag');
  
  function ensureModal(){
    if(document.getElementById('note-details-modal'))return;
    const modal=document.createElement('div');modal.id='note-details-modal';modal.className='nt-modal';modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`<div class="nt-modal-backdrop" data-note-close></div><section class="nt-modal-panel" role="dialog" aria-modal="true" aria-labelledby="note-modal-heading"><button type="button" class="nt-modal-close" aria-label="Close" data-note-close>×</button><p class="eyebrow">YOUR NOTE</p><h2 id="note-modal-heading">Note Details</h2><div id="note-modal-body"></div></section>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',event=>{
      if(event.target.closest('[data-note-close]'))closeModal();
      const action=event.target.closest('[data-note-action]')?.dataset.noteAction;
      if(action==='edit')startEdit(activeNoteId);
      if(action==='delete')deleteNote(activeNoteId);
    });
  }
  
   function closeModal(){const modal=document.getElementById('note-details-modal');if(modal){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');}activeNoteId=null;}
  function openNote(id){
    const note=readNotes().find(item=>String(item.id)===String(id));if(!note)return;
    ensureModal();activeNoteId=note.id;
    const modal=document.getElementById('note-details-modal'),body=modal.querySelector('#note-modal-body');
    modal.querySelector('#note-modal-heading').textContent=note.title;
    body.innerHTML=`<div class="nt-task-meta"><span class="note-category-tag ${tagClass(note.color)}">${esc(note.category||'Quick Note')}</span><span>Updated ${esc(new Date(note.updatedAt||note.createdAt||Date.now()).toLocaleDateString())}</span></div><p class="nt-full-description nt-note-full">${esc(note.content||'This note is empty.')}</p><div class="nt-modal-actions"><button type="button" class="btn btn-outline" data-note-action="delete">Delete Note</button><button type="button" class="btn" data-note-action="edit">Edit Note</button></div>`;
    modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');
  }
  function startEdit(id){
    const note=readNotes().find(item=>String(item.id)===String(id));if(!note)return;
    closeModal();editingId=note.id;titleInput.value=note.title||'';categoryInput.value=note.category||'Quick Note';colorInput.value=note.color||'Purple';contentInput.value=note.content||'';
    const submit=form.querySelector('button[type="submit"]');if(submit)submit.textContent='Update Note';
    const heading=document.querySelector('#create-note .section-heading h2');if(heading)heading.innerHTML='Edit <span class="gradient-text">Your Note.</span>';
    document.getElementById('create-note')?.scrollIntoView({behavior:'smooth'});titleInput.focus();
  }
  function resetEditor(){
    editingId=null;const submit=form.querySelector('button[type="submit"]');if(submit)submit.textContent='Save Note';
    const heading=document.querySelector('#create-note .section-heading h2');if(heading)heading.innerHTML='Create a <span class="gradient-text">New Note.</span>';
  }
  
  
  
  function render() {
    const notes = readNotes(); const query = slug(searchInput?.value);
    const shown = notes.filter(note => (filter === 'all' || note.category === filter) && (!query || `${note.title} ${note.content} ${note.category}`.toLowerCase().includes(query)));
    grid.replaceChildren(); if (count) count.textContent = `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`;
    if (!shown.length) { const empty = document.createElement('p'); empty.className = 'muted-text'; empty.style.gridColumn = '1 / -1'; empty.textContent = notes.length ? 'No notes match your search or category.' : 'No notes saved yet. Create your first note below.'; grid.appendChild(empty); return; }
    shown.forEach(note => {
      const card = document.createElement('article'); card.className = `note-card ${colorClass(note.color)}`;
      const top = document.createElement('div'); top.className = 'note-card-top';
      // const tag = document.createElement('span'); tag.className = `note-category-tag ${tagClass(note.color)}`; tag.textContent = note.category.toUpperCase();
      // const pin = document.createElement('span'); pin.className = 'note-pin'; pin.textContent = '✦'; top.append(tag, pin);
      // const title = document.createElement('h3'); title.textContent = note.title;
      // const content = document.createElement('p'); content.style.whiteSpace = 'pre-wrap'; content.textContent = note.content;
      const footer = document.createElement('div'); footer.className = 'note-card-footer';
      // const date = document.createElement('span'); date.textContent = new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, { month:'short', day:'2-digit', year:'numeric' });
      const actions = document.createElement('span'); actions.style.display = 'flex'; actions.style.gap = '10px';
      // const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'filter-btn'; edit.textContent = 'Edit'; edit.dataset.action = 'edit'; edit.dataset.id = note.id;
      // const del = document.createElement('button'); del.type = 'button'; del.className = 'filter-btn'; del.textContent = 'Delete'; del.dataset.action = 'delete'; del.dataset.id = note.id;
      // actions.append(edit, del); footer.append(date, actions); card.append(top, title, content, footer); grid.appendChild(card);
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
  // form.addEventListener('reset', () => { editingId = null; const submit = form.querySelector('button[type="submit"]'); if (submit) submit.textContent = 'Save Note'; });
  // grid.addEventListener('click', event => {
  //   const button = event.target.closest('button[data-action]'); if (!button) return;
  //   const notes = readNotes(); const note = notes.find(item => item.id === button.dataset.id); if (!note) return;
  //   if (button.dataset.action === 'edit') {
  //     editingId = note.id; titleInput.value = note.title; categoryInput.value = note.category; colorInput.value = note.color; contentInput.value = note.content;
  //     const submit = form.querySelector('button[type="submit"]'); if (submit) submit.textContent = 'Update Note';
  //     document.getElementById('create-note')?.scrollIntoView({ behavior: 'smooth' }); titleInput.focus();
  //   } else if (button.dataset.action === 'delete' && window.confirm(`Delete "${note.title}"?`)) {
  //     saveNotes(notes.filter(item => item.id !== note.id)); if (editingId === note.id) { form.reset(); } render();
  //   }
  // });
    form.addEventListener('reset',()=>{resetEditor();});
  function deleteNote(id){const notes=readNotes(),note=notes.find(item=>String(item.id)===String(id));if(!note||!window.confirm(`Delete "${note.title}"?`))return;saveNotes(notes.filter(item=>String(item.id)!==String(id)));closeModal();if(String(editingId)===String(id)){form.reset();}render();}
  grid.addEventListener('click',event=>{
    const button=event.target.closest('button[data-action]');
    if(button){event.stopPropagation();const note=readNotes().find(item=>String(item.id)===String(button.dataset.id));if(!note)return;if(button.dataset.action==='edit')startEdit(note.id);else if(button.dataset.action==='delete')deleteNote(note.id);return;}
    const card=event.target.closest('.nt-note-clickable');if(card)openNote(card.dataset.noteId);
  });
  
  grid.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.classList.contains('nt-note-clickable')){event.preventDefault();openNote(event.target.dataset.noteId);}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal();});
  document.querySelectorAll('[data-note-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.noteFilter; document.querySelectorAll('[data-note-filter]').forEach(item => item.classList.toggle('selected', item === button)); render();
  }));
  searchInput?.addEventListener('input', render);
  render();
})();
