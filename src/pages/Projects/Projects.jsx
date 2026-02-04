import { useState, useMemo } from "react";
import useProjects from "../../hooks/useProjects";
import ProjectCard from "../../components/common/ProjectCard";

export default function Projects() {
  const { projects, isLoading } = useProjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category));
    return ["", ...Array.from(cats)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "" || project.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [projects, searchTerm, categoryFilter]);

  if (isLoading) {
    return (
      <div className="page projects-page">
        <div className="search-section">
          <div className="search-filter-container">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Loading projects..."
                disabled
              />
              <svg className="search-icon-right" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M15 15L19 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div className="filter-wrapper">
                <span className="filter-label">Filter by:</span>
                <select className="filter-select" disabled>
                  <option value="">All</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <section className="projects-section">
          <div className="section-header">
            <h2>All Projects</h2>
            <span className="project-count">Loading...</span>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page projects-page">
      <div className="search-section">
        <div className="search-filter-container">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="search-icon-right" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M15 15L19 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div className="filter-wrapper">
              <span className="filter-label">Filter by:</span>
              <select
                className="filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All</option>
                {categories.filter(cat => cat !== "").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <section className="projects-section" id="all-projects">
        <div className="section-header">
          <h2>All Projects</h2>
          <span className="project-count">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="projects-empty">
            <h3>No projects found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </section>
    </div>
  );
}
