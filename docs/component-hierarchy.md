# Component Hierarchy

App
- Providers
  - ProjectsProvider
  - ToastProvider
- Layout
  - Navbar
  - ToastStack
- Routes
  - HomePage
    - HeroSection
    - FeaturedProjects
      - ProjectCard
  - ProjectsPage
    - FilterBar
    - ProjectGrid
      - ProjectCard
    - ProjectModal
      - DonationForm
  - AboutPage
  - DashboardPage
    - ProjectForm
    - ProjectManager
      - ProjectRow
  - NotFoundPage

