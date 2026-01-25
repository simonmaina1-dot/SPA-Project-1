import { useState, useEffect } from "react";
import useProjects from "../hooks/useProjects";
import ProjectCard from "../components/ProjectCard";

export default function Home() {
  const { projects, isLoading } = useProjects();

  const [search, setSearch] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);

  // Update filtered projects when projects or search changes
  useEffect(() => {
    const result = projects.filter((project) =>
      project.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProjects(result);
  }, [projects, search]);

  if (isLoading) {
    return <p>Loading projects...</p>;
  }

  return (
    <div className="home-page">
      <h1>Community Donation Hub</h1>
      <p>Support projects that help your community</p>

      {/* Search */}
      <input
        type="text"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Projects */}
      {filteredProjects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
