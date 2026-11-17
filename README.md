# NexTaska

Your Next Task Starts Here.

## Run the project

1. Extract this folder to your computer.
2. Open the `NexTask  git` folder in VS Code.
3. Install/use the **Live Server** extension if needed.
4. Right-click `index.html` and choose **Open with Live Server**.
5. Use the navigation to open Dashboard, My Tasks, or Notes & Ideas.

## What works

- Create tasks from My Tasks or Add New Task.
- Mark tasks complete/undo and delete tasks.
- Filter tasks by all, pending, completed, and high priority.
- Dashboard counts and progress update from saved tasks.
- Create, search, filter, edit, and delete notes.
- Tasks and notes persist with browser `localStorage`.

## Storage note

This is a front-end project. `localStorage` saves data in the browser for this website/origin; it does not write directly into arbitrary files on your computer and does not sync across browsers/devices. Run it using the same Live Server address/port to access the same saved data.

## Project structure

- `index.html`
- `login.html`
- `dashboard.html`
- `tasks.html`
- `add-task.html`
- `notes.html`
- `style.css`
- `js/auth.js`
- `js/auth-shell.js`
- `js/tasks.js`
- `js/dashboard.js`
- `js/notes.js`


## Login demo

Open `login.html` to create a demo account or sign in. This is intentionally a browser-only demonstration using localStorage. It stores passwords in the browser and is **not secure for real users or production**. For real authentication, use a backend authentication provider and never store raw passwords in localStorage.

## Updated visual theme

The CSS theme now uses the supplied palette: `#0B132B`, `#1C2541`, `#3A506B`, `#5BC0DE`, `#F4D6B0`, and `#D97706`. Existing page structure and content have been retained as much as possible.
