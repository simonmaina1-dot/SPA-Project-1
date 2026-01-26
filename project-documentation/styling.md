# Styling and CSS Breakdown

## Global Design System (`src/index.css`)
- Defines color tokens, shadows, and radii as CSS variables.
- Sets global typography using Space Grotesk.
- Establishes base resets for text, links, buttons, and inputs.
- Provides focus styles and selection colors.

## App Layout and Components (`src/App.css`)
- App shell layout (`.app-shell`, `.main-content`, `.app-footer`).
- Navigation styles (`.navbar`, `.nav-links`, `.nav-link`).
- Hero and stats dashboard styling.
- Card styles for projects, about, and details sections.
- Form layout and field styling.
- Modal and toast styling.
- Responsive breakpoints for tablets and mobile.

## Responsive Notes
- `@media (max-width: 900px)` stacks nav and section headers.
- `@media (max-width: 600px)` tightens padding and stacks form actions.
