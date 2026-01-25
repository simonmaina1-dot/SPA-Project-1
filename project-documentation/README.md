# Community Donation Hub Documentation

## Overview
Community Donation Hub is a Vite + React single-page app that showcases
community fundraising projects. It uses React Router for navigation and
React Context for shared state (projects and toast notifications).

## How the App Works
- The app bootstraps in `src/main.jsx`, where providers and routing are set up.
- `ProjectsContext` holds project data, helpers, and CRUD-like actions.
- `ToastContext` manages transient UI messages.
- Pages and shared components consume context via custom hooks.

## Data Flow
1. `ProjectsProvider` seeds data from local storage (or defaults).
2. Pages call `useProjects()` to read or update project data.
3. UI components format and render project data.
4. `ToastProvider` exposes `showToast()` for feedback across pages.

## Routes
- `/` Home page with search, filtering, and featured projects.
- `/add` Add Project form.
- `/projects/:projectId` Project details view.
- `/about` Architecture overview.

## Running the App
```bash
npm install
npm run dev
```

## Key Files
- `src/main.jsx` app entry point with providers and routing.
- `src/App.jsx` route definitions and app shell.
- `src/context/ProjectsContext.jsx` project state and helpers.
- `src/context/ToastContext.jsx` toast notification state.
- `src/index.css` global design system.
- `src/App.css` component and layout styling.
