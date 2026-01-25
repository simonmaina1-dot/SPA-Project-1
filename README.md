# Community Donation Hub

A React Single Page Application (SPA) for community fundraising and project management. This application allows users to create projects, make donations, and track funding progress.

## Features

### Core Functionality
- **Project Creation**: Create community projects with titles, descriptions, categories, and funding goals
- **Donation System**: Make donations to support projects with validation
- **Progress Tracking**: Visual progress bars showing funding status
- **Search & Filter**: Find projects by category or search terms
- **Data Persistence**: All data saved to localStorage

### Technical Features (Code Defense Ready)
- **React Router**: 4 distinct views (Home, Add Project, Project Details, About)
- **Context API**: Centralized state management with `ProjectsContext`
- **Custom Hooks**: 
  - `useProjects()` - Project data access and manipulation
  - `useForm()` - Form handling and validation
  - `useLocalStorage()` - localStorage abstraction
- **Advanced Hooks**: `useEffect`, `useMemo`, `useCallback`
- **Responsive Design**: Mobile-friendly with CSS Grid and Flexbox

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Main navigation with active states
│   └── ProjectCard.jsx     # Project display card with progress
├── context/
│   └── ProjectsContext.jsx # Central state management
├── hooks/
│   ├── useProjects.js      # Project data hook
│   ├── useForm.js          # Form handling hook
│   └── useLocalStorage.js  # Storage abstraction hook
├── pages/
│   ├── Home.jsx            # Project listing with search/filter
│   ├── AddProject.jsx      # Create new project form
│   ├── ProjectDetails.jsx  # Full project view with donations
│   └── About.jsx           # Architecture documentation
├── App.jsx                 # Main app with routes
├── main.jsx                # App entry point
├── index.css               # Complete design system
└── App.css                 # App-specific styles
```

##  Technical Architecture

### State Management: Context API

**Why Context over Redux/Prop Drilling?**
- Simpler for this scale of application
- Single source of truth for project data
- Reduces boilerplate compared to Redux
- Easier to understand for Code Defense

```jsx
// ProjectsContext provides:
- projects: Array of all projects
- donations: Array of all donations
- isLoading: Loading state for persistence
- addProject(project): Create new project
- addDonation(projectId, amount, name): Record donation
- getProjectDonations(id): Get donations for a project
```

### Custom Hooks

#### `useProjects()`
Primary hook for all project operations:
- CRUD operations for projects and donations
- Search and filter functionality
- Currency formatting
- Progress calculation

#### `useForm(initialValues, validate)`
Abstracts form state management:
- Manages field values, errors, and touched state
- Built-in validation with custom rules
- Handles form submission

#### `useLocalStorage(key, initialValue)`
Wrapper for localStorage:
- Automatic JSON serialization
- Lazy initialization
- Cross-tab synchronization via storage events

### Routing Strategy

```
Routes:
/           -> Home (project listing with search/filter)
/add        -> AddProject (create new project)
/project/:id -> ProjectDetails (view and donate)
/about      -> About (documentation)
```

**Why React Router?**
- True SPA experience (no page reloads)
- Browser history support
- URL-based navigation
- Active state handling on NavLink

### Performance Optimizations

1. **`useMemo` for filtering**: Prevents recalculation on re-renders
2. **`useCallback` for handlers**: Memoizes event handlers
3. **Lazy initialization**: useState initial functions run once
4. **Conditional rendering**: Loading/error states

## Code Defense Preparation

### Key Questions & Answers

**Q: "Why use Context instead of prop drilling?"**
A: Context provides a single source of truth accessible by any component. Prop drilling becomes unmanageable with deep component trees. Context is perfect for app-wide state like user theme, auth, or in our case, project data.

**Q: "Why use useMemo for filtering?"**
A: Filtering can be expensive with large datasets. useMemo caches the result and only recalculates when dependencies (projects, searchQuery, category) change. This prevents unnecessary computation on every render.

**Q: "What happens if we remove the useEffect dependency?"**
A: The dependency array controls when the effect runs. If we remove `[projects]`, the effect would only run once on mount and not persist new projects. This would cause data loss when projects are added.

**Q: "Why separate the DonationForm component?"**
A: Separation of concerns. The ProjectDetails page handles project display while DonationForm handles form logic. This makes the code more maintainable, testable, and reusable.

**Q: "How does localStorage persistence work?"**
A: 1. On mount, useEffect reads from localStorage
2. When projects change, another useEffect saves to localStorage
3. This creates a sync: Storage ↔ State ↔ UI

### Key Files to Review

1. **ProjectsContext.jsx**: State management architecture
2. **useForm.js**: Form handling pattern
3. **Home.jsx**: Filtering and search logic
4. **ProjectDetails.jsx**: Complex component with multiple features

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Design System

The app uses a comprehensive CSS design system with:
- CSS Variables for theming
- Responsive breakpoints (768px, 1024px)
- Smooth transitions and animations
- Accessible form controls
- Loading states with spinners

## Dependencies

- **React 19** - UI Framework
- **React Router 7** - Client-side routing
- **Vite** - Build tool and dev server
- **ESLint** - Code quality

## Features Implemented

 Advanced State Management (Context API)
Custom Hooks (useProjects, useForm, useLocalStorage)
Client-side Routing (4 distinct views)
Form Validation
 Search and Filtering
 Progress Visualization
localStorage Persistence
 Responsive Design
 Code Documentation
 Code Defense Preparation

---

**Built with React best practices for the Code Defense presentation!**

