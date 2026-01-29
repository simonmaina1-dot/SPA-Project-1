# Wireframes Notes

## Global layout
- App shell: top nav with active states, main content area, toast area fixed bottom-right.
- Consistent card grid for projects with progress bar and quick actions.
- Modal overlay for project detail + donation.

## Home / Projects
- Hero banner with short value prop + CTA to browse projects.
- Filters row:
  - Search input (debounced).
  - Category dropdown.
  - Status dropdown (Active/Completed).
  - Sort dropdown (Newest, Goal, Progress).
- Project grid:
  - Card: image, title, short description, category tag, progress bar, stats.
  - Primary action: View details (opens modal).

## Project Detail Modal
- Header: project title, category, status badge.
- Body: description, timeline/progress notes, funding stats.
- Donation form: amount input, quick amount buttons, submit.
- Footer: close button, donation status message.

## Dashboard
- Two panels:
  - Create project (form).
  - Edit project list with inline status toggle + image URL preview.
- Minimal admin UX, no auth.

## About
- Explains mission, how donations work, and transparency promise.

