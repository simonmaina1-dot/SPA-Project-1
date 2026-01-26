# State and Hooks

## Projects Context (`src/context/ProjectsContext.jsx`)
- Owns the array of projects and loading state.
- Seeds sample data on first run.
- Exposes helper methods:
  - `addProject` to create new projects.
  - `addDonation` to apply a simulated donation.
  - `updateProject` and `removeProject` for edits.
  - `getFeaturedProjects` for highlighted cards.
  - `formatCurrency` for consistent money display.

## Toast Context (`src/context/ToastContext.jsx`)
- Stores transient toast messages.
- `showToast` adds a message and auto-dismisses after a timeout.
- `removeToast` clears a specific toast.

## Auth Context (`src/context/AuthContext.jsx`)
- Stores the current admin session.
- `signIn` validates credentials and starts a session.
- `signOut` clears the session.

## Hooks
- `useProjects` provides a typed access point to `ProjectsContext`.
- `useLocalStorage` persists state to local storage.
- `useForm` centralizes input handling for the Add Project form.
- `useAuth` provides access to the admin session.
