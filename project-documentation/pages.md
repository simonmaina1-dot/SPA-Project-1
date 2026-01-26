# Pages

## Home (`src/pages/Home.jsx`)
- Displays featured projects, stats, and a searchable grid.
- Uses a modal for quick project details.
- Shows empty and loading states.
- Includes the About/architecture section at the bottom.

## Add Project (`src/pages/AddProject.jsx`)
- Form for creating a new project.
- Validates required fields and posts to context.
- Navigates to the new project detail view on success.

## Project Details (`src/pages/ProjectDetails.jsx`)
- Full view of a single project.
- Highlights funding progress and call-to-action button.

## Donate (`src/pages/Donate.jsx`)
- Demo checkout flow for simulated funding.
- Updates project totals and returns to details view.

## Admin Dashboard (`src/pages/AdminDashboard.jsx`)
- Password-protected admin view with platform metrics.
- Includes a review queue and recent activity feed.
