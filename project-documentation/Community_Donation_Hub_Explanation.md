# Community Donation Hub – Project Explanation & Architecture

PROJECT GOAL
The Community Donation Hub is a scalable React Single Page Application designed to connect donors with community-driven projects. The application allows users to browse projects, filter and search them, view detailed information, and receive immediate feedback through UI interactions such as modals and toast notifications.The primary goal is to demonstrate strong understanding of React fundamentals, advanced hooks, state management, routing, and architectural decision-making suitable for a code defense.
APPLICATION REQUIREMENTS- Display a list of community projects- Allow searching and filtering by category- Show featured projects and funding statistics- Provide feedback using toast notifications- Display project details inside a modal- Maintain clean, reusable, and scalable code- Use React Router to support multiple views- Abstract logic using custom hooks and contextARCHITECTURE OVERVIEWApp- Router (Home, AddProject, About)- Context (ToastContext)- Hooks (useProjects)- Components (ProjectCard, Modal, Toast)STATE MANAGEMENT STRATEGYGlobal State:- Toast messages via Context- Project data via custom hookLocal State:- Search query- Selected category- Modal state- Selected projectCUSTOM HOOK: useProjectsCentralizes project data fetching, loading state, featured logic, and formatting helpers.CONTEXT: ToastContextProvides application-wide feedback messages without prop drilling.HOME PAGE RESPONSIBILITIES- Fetch and display projects- Show statistics- Filter and search projects- Display featured projects- Handle modals and empty statesHOOK USAGEuseState: Manages UI stateuseEffect: Handles side effectsuseMemo: Optimizes performanceMODAL COMPONENTControlled by parent, reusable, and predictable.PROJECTCARD COMPONENTPure presentational component for displaying project data.ROUTING STRATEGYReact Router enables SPA navigation without page reloads.USER FLOWUser loads app, browses projects, opens modal, performs actions, and receives feedback.

coding should start with data logic/hooks then pages then the components

# Entry Point: main.jsx

### What it does

Mounts the React app

Wraps the app in providers (Context, Router)

App Shell: App.jsx

What it does

Defines routes

Renders global layout (Navbar)

Custom Hook: useProjects.js

What it exports

export default function useProjects() { ... }

What it does

Fetches projects

Stores them in state

Exposes helper functions

Css – I think u can just do centralized theming, consistent UI and make the app look professional. Can make the navbar remain visible as one scrolls down. Toast is on you guys
