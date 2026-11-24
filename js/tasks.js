/* NexTaska task manager: task details, editing and browser-local persistence. */
(() => {
  'use strict';
  const TASKS_KEY = 'nextaska-tasks-v1';
  const readTasks = () => {
    try { const value = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]'); return Array.isArray(value) ? value : []; }
    catch (_) { return []; }
  };
  const saveTasks = tasks => localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  const normalize = value => String(value || '').trim();
  const escapeDate = value => {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' });
  };
  const priorityClass = priority => ({ high:'badge-high', medium:'badge-medium', low:'badge-low' }[(priority || 'medium').toLowerCase()] || 'badge-medium');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  let activeTaskId = null;
  let modalMode = 'view';
  let currentFilter = 'all';

  function ensureModal() {
    if (document.getElementById('task-details-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'task-details-modal';
    modal.className = 'nt-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="nt-modal-backdrop" data-close-modal></div>
      <section class="nt-modal-panel" role="dialog" aria-modal="true" aria-labelledby="task-modal-heading">
        <button type="button" class="nt-modal-close" aria-label="Close" data-close-modal>×</button>
        <p class="eyebrow" id="task-modal-eyebrow">TASK DETAILS</p>
        <h2 id="task-modal-heading">Task Details</h2>
        <div id="task-modal-body"></div>
      </section>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', event => {
      if (event.target.closest('[data-close-modal]')) closeModal();
      const action = event.target.closest('[data-modal-action]')?.dataset.modalAction;
      if (action === 'edit') openTask(activeTaskId, 'edit');
      if (action === 'delete') deleteTask(activeTaskId);
      if (action === 'cancel-edit') openTask(activeTaskId, 'view');
    });
    modal.addEventListener('submit', event => {
      if (event.target.id !== 'task-edit-form') return;
      event.preventDefault();
      const tasks = readTasks();
      const task = tasks.find(item => String(item.id) === String(activeTaskId));
      if (!task) return;
      task.title = normalize(modal.querySelector('#edit-task-title').value);
      task.description = normalize(modal.querySelector('#edit-task-description').value);
      task.priority = modal.querySelector('#edit-task-priority').value;
      task.category = modal.querySelector('#edit-task-category').value;
      task.dueDate = modal.querySelector('#edit-task-due').value;
      task.reminder = modal.querySelector('#edit-task-reminder').value;
      task.updatedAt = new Date().toISOString();
      if (!task.title) { modal.querySelector('#edit-task-title').focus(); return; }
      saveTasks(tasks); renderTasks(); openTask(activeTaskId, 'view');
    });
  }
  function closeModal() {
    const modal = document.getElementById('task-details-modal');
    if (modal) { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); }
    activeTaskId = null;
  }
  function openTask(id, mode='view') {
    const task = readTasks().find(item => String(item.id) === String(id));
    if (!task) return;
    ensureModal(); activeTaskId = task.id; modalMode = mode;
    const modal = document.getElementById('task-details-modal');
    const heading = modal.querySelector('#task-modal-heading');
    const eyebrow = modal.querySelector('#task-modal-eyebrow');
    const body = modal.querySelector('#task-modal-body');
    if (mode === 'edit') {
      eyebrow.textContent = 'UPDATE YOUR TASK'; heading.textContent = 'Edit Task';
      body.innerHTML = `
        <form id="task-edit-form" class="nt-edit-form">
          <label for="edit-task-title">Task Title *</label><input id="edit-task-title" required value="${esc(task.title)}">
          <label for="edit-task-description">Description</label><textarea id="edit-task-description" rows="5" placeholder="Add details about this task...">${esc(task.description || '')}</textarea>
          <div class="nt-edit-grid">
            <div><label for="edit-task-priority">Priority</label><select id="edit-task-priority">
              ${['low','medium','high'].map(v=>`<option value="${v}" ${(task.priority||'medium').toLowerCase()===v?'selected':''}>${v[0].toUpperCase()+v.slice(1)}</option>`).join('')}
            </select></div>
            <div><label for="edit-task-category">Category</label><input id="edit-task-category" value="${esc(task.category || 'General')}"></div>
            <div><label for="edit-task-due">Due Date</label><input id="edit-task-due" type="date" value="${esc(task.dueDate || '')}"></div>
            <div><label for="edit-task-reminder">Reminder</label><input id="edit-task-reminder" type="datetime-local" value="${esc(task.reminder || '')}"></div>
          </div>
          <div class="nt-modal-actions"><button class="btn btn-outline" type="button" data-modal-action="cancel-edit">Cancel</button><button class="btn" type="submit">Save Changes</button></div>
        </form>`;
      body.querySelector('#edit-task-title').focus();
    } else {
      eyebrow.textContent = 'TASK DETAILS'; heading.textContent = task.title;
      body.innerHTML = `
        <div class="nt-task-meta">
          <span class="badge ${task.completed?'badge-done':priorityClass(task.priority)}">${task.completed?'Completed':esc(task.priority||'Medium')}</span>
          <span>${esc(task.category||'General')}</span>
          ${task.dueDate?`<span>Due: ${esc(escapeDate(task.dueDate))}</span>`:''}
          ${task.reminder?`<span>Reminder: ${esc(task.reminder.replace('T',' '))}</span>`:''}
        </div>
        <h3 class="nt-description-heading">Description</h3>
        <p class="nt-full-description">${esc(task.description || 'No description added for this task.')}</p>
        <div class="nt-modal-actions"><button class="btn btn-outline" type="button" data-modal-action="delete">Delete Task</button><button class="btn" type="button" data-modal-action="edit">Edit Task</button></div>`;
    }
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false');
  }
  function deleteTask(id) {
    const tasks = readTasks(); const task = tasks.find(item=>String(item.id)===String(id));
    if (!task || !window.confirm(`Delete "${task.title}"?`)) return;
    saveTasks(tasks.filter(item=>String(item.id)!==String(id))); closeModal(); renderTasks();
  }

  function renderTasks(filter = document.querySelector('[data-filter].selected')?.dataset.filter || currentFilter) {
    currentFilter = filter;
    const container = document.getElementById('tasks-container');
    if (!container) return;
    const tasks = readTasks();
    const allCount = document.getElementById('all-task-count');
    const pendingCount = document.getElementById('pending-task-count');
    const completedCount = document.getElementById('completed-task-count');
    const listCount = document.getElementById('task-list-count');
    if (allCount) allCount.textContent = tasks.length;
    if (pendingCount) pendingCount.textContent = tasks.filter(t=>!t.completed).length;
    if (completedCount) completedCount.textContent = tasks.filter(t=>t.completed).length;
    if (listCount) listCount.textContent = `${tasks.length} ${tasks.length===1?'task':'tasks'}`;
    const visible = tasks.filter(task => filter==='pending'?!task.completed:filter==='completed'?task.completed:filter==='high'?!task.completed&&(task.priority||'').toLowerCase()==='high':true);
    container.replaceChildren();
    if (!visible.length) {
      const empty=document.createElement('p'); empty.className='muted-text'; empty.style.padding='20px 0';
      empty.textContent=tasks.length?'No tasks match this filter.':'No tasks yet. Add your first task below or use Add New Task.';
      container.appendChild(empty); return;
    }
    visible.forEach(task => {
      const row=document.createElement('div'); row.className='task-row nt-task-clickable'; row.dataset.taskId=task.id; row.tabIndex=0; row.setAttribute('role','button'); row.setAttribute('aria-label',`Open details for ${task.title}`);
      const toggle=document.createElement('button'); toggle.type='button'; toggle.className=`task-check${task.completed?' done':''}`; toggle.textContent=task.completed?'✓':''; toggle.setAttribute('aria-label',task.completed?'Mark task pending':'Mark task completed'); toggle.dataset.action='toggle'; toggle.dataset.id=task.id;
      const details=document.createElement('div'); details.className='task-details';
      const title=document.createElement('strong'); title.textContent=task.title; if(task.completed) title.className='task-finished';
      const meta=document.createElement('span'); const bits=[task.category||'General']; if(task.dueDate)bits.push(`Due: ${escapeDate(task.dueDate)}`); if(task.completed)bits.push('Completed'); meta.textContent=bits.join(' · ');
      const preview=document.createElement('span'); preview.className='nt-task-preview'; preview.textContent=task.description||'Tap to view task details'; details.append(title,meta,preview);
      const priority=document.createElement('span'); priority.className=`badge ${task.completed?'badge-done':priorityClass(task.priority)}`; priority.textContent=task.completed?'Completed':(task.priority||'Medium');
      const del=document.createElement('button'); del.type='button'; del.className='filter-btn'; del.textContent='Delete'; del.dataset.action='delete'; del.dataset.id=task.id;
      const edit=document.createElement('button'); edit.type='button'; edit.className='filter-btn'; edit.textContent='Edit'; edit.dataset.action='edit'; edit.dataset.id=task.id;
      row.append(toggle,details,priority,edit,del); container.appendChild(row);
    });
  }
  function addTask(task) {
    const tasks=readTasks();
    tasks.unshift({id:`${Date.now()}-${Math.random().toString(16).slice(2)}`,title:task.title,description:task.description||'',priority:task.priority||'Medium',category:task.category||'General',dueDate:task.dueDate||'',reminder:task.reminder||'',completed:false,createdAt:new Date().toISOString()});
    saveTasks(tasks);
  }
  const taskForm=document.getElementById('task-form');
  if(taskForm) taskForm.addEventListener('submit',event=>{
    event.preventDefault(); const title=normalize(document.getElementById('task-title')?.value); const priority=document.getElementById('task-priority')?.value;
    if(!title||!priority)return; addTask({title,priority,category:'General'}); taskForm.reset(); renderTasks(); document.getElementById('task-title')?.focus();
  });
  const addForm=document.getElementById('add-task-form');
  if(addForm) addForm.addEventListener('submit',event=>{
    event.preventDefault(); const title=normalize(document.getElementById('title')?.value); if(!title)return;
    addTask({title,description:normalize(document.getElementById('description')?.value),dueDate:document.getElementById('due-date')?.value,priority:document.getElementById('priority')?.selectedOptions[0]?.textContent||'Medium',category:document.getElementById('category')?.selectedOptions[0]?.textContent||'General',reminder:document.getElementById('reminder')?.value});
    window.location.href='tasks.html';
  });
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(item=>item.classList.toggle('selected',item===button));renderTasks(button.dataset.filter);}));
  const taskContainer=document.getElementById('tasks-container');
  if(taskContainer) {
    taskContainer.addEventListener('click',event=>{
      const button=event.target.closest('button[data-action]');
      if(button) {
        const tasks=readTasks(); const task=tasks.find(item=>String(item.id)===button.dataset.id); if(!task)return;
        if(button.dataset.action==='toggle'){task.completed=!task.completed;saveTasks(tasks);renderTasks();return;}
        if(button.dataset.action==='delete'){if(!window.confirm(`Delete "${task.title}"?`))return;saveTasks(tasks.filter(item=>String(item.id)!==button.dataset.id));renderTasks();return;}
        if(button.dataset.action==='edit'){openTask(task.id,'edit');return;}
      }
      const row=event.target.closest('.nt-task-clickable'); if(row)openTask(row.dataset.taskId,'view');
    });
    taskContainer.addEventListener('keydown',event=>{
      if((event.key==='Enter'||event.key===' ')&&event.target.classList.contains('nt-task-clickable')){event.preventDefault();openTask(event.target.dataset.taskId,'view');}
    });
  }
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal();});
  ensureModal(); renderTasks();
  window.NexTaskaTasks={readTasks,saveTasks,renderTasks,addTask,openTask};
})();
