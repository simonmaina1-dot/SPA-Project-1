export default function About() {
  return (
    <div className="page about-page">
      <section className="page-header">
        <h1>About the Architecture</h1>
        <p>
          Community Donation Hub is built with React and a lightweight context
          layer to keep project and toast state in sync.
        </p>
      </section>

      <section className="about-grid">
        <article className="about-card">
          <h3>State flow</h3>
          <p>
            Projects live in a central context and are persisted to local
            storage. Hooks provide a clean API for pages and components.
          </p>
        </article>
        <article className="about-card">
          <h3>Reusable UI</h3>
          <p>
            Core UI blocks like cards, modals, and toasts are shared across
            pages to keep the experience consistent.
          </p>
        </article>
        <article className="about-card">
          <h3>Routing</h3>
          <p>
            Vite powers the build system, while React Router keeps routes and
            page transitions organized.
          </p>
        </article>
      </section>
    </div>
  );
}
