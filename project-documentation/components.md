# Components

## Navbar (`src/components/Navbar.jsx`)
- Main navigation across pages.
- Uses `NavLink` to show active state.
- Includes a primary call-to-action button.

## ProjectCard (`src/components/ProjectCard.jsx`)
- Displays a project summary with progress and donor stats.
- Supports a featured layout.
- Clickable as a link or button based on props.

## Modal (`src/components/Modal.jsx`)
- Reusable dialog with header/body/footer slots.
- Closes on backdrop click or Escape key.

## Toast (`src/components/Toast.jsx`)
- Renders a stack of notifications.
- Reads from `ToastContext` and supports manual dismiss.
