# State and Hooks

## Projects Context (`src/context/ProjectsContext.jsx`)
- Owns the array of projects and loading state.
- Seeds sample data on first run.
- Exposes helper methods:
  - `addProject` to create new projects.
  - `updateProject` and `removeProject` for edits.
  - `getFeaturedProjects` for highlighted cards.
  - `formatCurrency` for consistent money display.

## Toast Context (`src/context/ToastContext.jsx`)
- Stores transient toast messages.
- `showToast` adds a message and auto-dismisses after a timeout.
- `removeToast` clears a specific toast.

## Hooks
- `useProjects` provides a typed access point to `ProjectsContext`.
- `useLocalStorage` persists state to local storage.
- `useForm` centralizes input handling for the Add Project form.
