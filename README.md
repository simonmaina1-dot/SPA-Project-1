# Community Donation Hub

A React Single Page Application (SPA) for community fundraising and project
management. Users can create projects, explore active campaigns, and simulate
support through a demo checkout flow.

## Features

- Project creation with title, goal, category, and description
- Search, filter, and featured project discovery
- Funding progress tracking with live stats
- Demo donation checkout that updates totals
- Admin dashboard with analytics and review queue (client-side gated)
- Toast feedback and reusable modal UI
- Local storage persistence for project data
- Responsive layout for desktop, tablet, and mobile

## Routes

- `/` or `/projects` - Project listing with search, stats, and About section
- `/projects/:projectId` - Project details
- `/add` - Add Project (draggable modal form)
- `/donate/:projectId` - Demo checkout
- `/admin` - Admin dashboard (password protected in UI)

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── ProjectCard.jsx
│   ├── Modal.jsx
│   ├── DraggableModal.jsx
│   └── Toast.jsx
├── context/
│   ├── ProjectsContext.jsx
│   ├── ToastContext.jsx
│   └── AuthContext.jsx
├── hooks/
│   ├── useProjects.js
│   ├── useForm.js
│   ├── useLocalStorage.js
│   └── useAuth.js
├── pages/
│   ├── Home.jsx
│   ├── AddProject.jsx
│   ├── ProjectDetails.jsx
│   ├── Donate.jsx
│   └── AdminDashboard.jsx
├── App.jsx
├── main.jsx
├── index.css
└── App.css
```

## State Management

- `ProjectsContext` stores project data and exposes helpers like `addProject`
  and `addDonation`.
- `ToastContext` handles user feedback messages.
- `AuthContext` gates admin views (client-side only).

Custom hooks provide clean access patterns:
- `useProjects`, `useForm`, `useLocalStorage`, `useAuth`

## Getting Started

```bash
npm install
npm run dev
```

## Testing

```bash
npm run test
npm run test:run
```

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run lint` - lint
- `npm run test` - watch tests
- `npm run test:run` - run tests once

## Notes for Code Defense

The About section lives inside the Projects page so the architecture details are
part of the primary user flow. The admin experience is a demo gate (no real
backend). For deeper documentation, see `project-documentation/`.

## Data and Assets

- Reset local data by clearing the `cdh-projects` key in local storage.
- Project image folders live in `public/project-images/<project-slug>/` for
  teammate uploads.

## Heads-up

- Heads-up: `src/context/AuthContext.jsx` currently has a malformed admin entry
  (admin-george) which will break parsing. If you want it fixed, tell me the
  exact details to keep.
