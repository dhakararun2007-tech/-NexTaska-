
/* NexTaska - Add Task Manager */
(() => {
  'use strict';

  const TASKS_KEY = 'nextaska-tasks-v1';

  const form = document.getElementById('task-form');

  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Get form values
    const title = document.getElementById('title')?.value.trim();
    const description =
      document.getElementById('description')?.value.trim() || '';

    const dueDate =
      document.getElementById('due-date')?.value || '';

    const priority =
      document.getElementById('priority')?.value || 'medium';

    const category =
      document.getElementById('category')?.value || 'other';

    const reminder =
      document.getElementById('reminder')?.value || '';

    // Validate task title
    if (!title) {
      alert('Please enter a task title.');
      return;
    }

    // Validate due date
    if (!dueDate) {
      alert('Please select a due date.');
      return;
    }

    try {
      // Read existing tasks
      const storedTasks = JSON.parse(
        localStorage.getItem(TASKS_KEY) || '[]'
      );

      const tasks = Array.isArray(storedTasks)
        ? storedTasks
        : [];

      // Create new task
      const newTask = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title,
        description,
        priority,
        category,
        dueDate,
        reminder,
        completed: false,
        createdAt: new Date().toISOString()
      };

      // Add new task at the beginning
      tasks.unshift(newTask);

      // Save tasks
      localStorage.setItem(
        TASKS_KEY,
        JSON.stringify(tasks)
      );

      alert('Task created successfully!');

      // Redirect to My Tasks
      window.location.href = 'tasks.html';

    } catch (error) {
      console.error('Error saving task:', error);
      alert('Unable to save task. Please try again.');
    }
  });

})();
