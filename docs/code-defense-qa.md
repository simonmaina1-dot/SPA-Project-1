# Code Defense: Anticipated Questions & Model Answers
Project: Community Donation Hub (React SPA)

This document prepares the team for the Code Defense by listing likely instructor
questions aligned to the rubric, with clear, defensible answers.

---

## 1. Architecture & Routing

### Q: Walk me through the routing structure of this application.
**A:**  
Routing is defined in `App.jsx` using React Router. The app is a true SPA with
distinct routes for core user flows:
- `/` and `/projects` render the Home view for discovery
- `/projects/:id` acts as a fallback for deep-linked project details
- `/donate/:id` handles the donation flow
- `/dashboard` provides admin-style project management

Navigation updates the UI without page reloads, and routing separates concerns
between views cleanly.

---

### Q: Why do you have both a modal and a route for project details?
**A:**  
The modal is optimized for user flow when browsing from the Home page, while the
route fallback (`/projects/:id`) ensures deep links, refreshes, and shared URLs
still work. This balances UX with routing robustness.

---

### Q: What makes this a true Single Page Application?
**A:**  
All navigation is handled client-side via React Router. Page transitions do not
reload the document; instead, React swaps components in response to route changes,
preserving application state where appropriate.

---

## 2. State Management & Context

### Q: Where does global state live, and why?
**A:**  
Global project data lives in `ProjectsContext`. This avoids prop drilling and
centralizes shared state that multiple routes depend on, such as project lists
and donation updates.

---

### Q: Why did you choose Context instead of lifting state?
**A:**  
Lifting state would require passing props through several intermediate components
that don’t directly use the data. Context keeps the data accessible where needed
without bloating component interfaces.

---

### Q: What state is kept locally instead of globally?
**A:**  
UI-specific state such as search queries, filters, modal visibility, and form
inputs is local. These states are tightly scoped to individual views and do not
need to be shared across routes.

---

## 3. Hooks (Standard + Custom)

### Q: Explain the purpose of `useLocalStorageState`.
**A:**  
`useLocalStorageState` abstracts persistence logic. It synchronizes React state
with `localStorage` so components and contexts don’t need to manually handle
serialization, reads, or writes.

---

### Q: What does this custom hook return?
**A:**  
It returns the current value, a setter function, and optionally a reset helper.
This mirrors the `useState` API while adding persistence as an implementation
detail.

---

### Q: Why is `useEffect` used inside the custom hook?
**A:**  
The effect exists solely to persist state changes to `localStorage`. Persistence
is a side-effect and should not occur during render or inside event handlers.

---

### Q: What would happen if the dependency array were incorrect?
**A:**  
If dependencies were missing, state changes might not persist correctly. If
over-inclusive, the effect could run unnecessarily, causing performance issues
or redundant writes.

---

## 4. Side Effects & Lifecycle

### Q: What counts as a side-effect in this app?
**A:**  
Reading from and writing to `localStorage`, syncing persisted data on mount, and
triggering toasts are all side-effects because they interact with systems outside
React’s render cycle.

---

### Q: Why should side-effects be isolated?
**A:**  
Isolating side-effects makes components predictable and easier to reason about.
It prevents bugs caused by effects running during render or in unrelated logic
paths.

---

## 5. Component Design

### Q: Why are components split instead of being large?
**A:**  
Smaller components improve readability, reusability, and testability. Each
component has a single responsibility, which also makes debugging easier.

---

### Q: Which components are “smart” vs “presentational”?
**A:**  
Context providers and route-level pages are smart components. UI elements like
ProjectCard, StatsBar, and Hero are presentational and receive data via props.

---

## 6. Testing

### Q: What parts of this app are most important to test?
**A:**  
Core user flows: project rendering, filtering/search, donation state updates,
routing behavior, and the custom hook’s persistence logic.

---

### Q: How would you test the custom hook?
**A:**  
By rendering it in isolation using a hook-testing utility and asserting that it
reads from `localStorage` on init, writes on state change, and resets correctly.

---

### Q: What does a passing test guarantee?
**A:**  
It guarantees that specific expected behaviors work under tested conditions.
It does not guarantee the absence of all bugs, especially edge cases not covered
by tests.

---

## 7. Git & Collaboration

### Q: Why are feature branches important?
**A:**  
They isolate work, prevent breaking the main branch, and allow code review before
changes are merged. This mirrors professional team workflows.

---

### Q: How do commit messages help in a project like this?
**A:**  
Descriptive commits document intent, make debugging easier, and clearly show each
member’s contribution during evaluation.

---

## 8. Performance & Edge Cases

### Q: What causes unnecessary re-renders in React?
**A:**  
Unstable props, frequent context updates, and effects with broad dependencies can
all trigger unnecessary re-renders.

---

### Q: What happens if `localStorage` is unavailable?
**A:**  
The app would fall back to in-memory state for the session. Persistence would be
lost, but core functionality would still work.

---

## 9. Security & Realism

### Q: Why is the donation flow mocked?
**A:**  
Real payments require backend validation, authentication, and secure processing,
which is out of scope for this assignment. The mock demonstrates state flow and
UX without introducing security risk.

---

## Final Audit Questions (Rapid Fire)

### Q: What would break if we removed this `useEffect`?
**A:**  
State would stop persisting to `localStorage`, causing data loss on refresh.

---

### Q: Explain this file line-by-line.
**A:**  
(Expectation: student explains imports, state setup, hooks, handlers, and render
logic without guessing.)

---

## Defense Readiness Rule
If you can explain *why* every hook, route, and piece of state exists, you pass.
If you only explain *what* it does, you don’t.
