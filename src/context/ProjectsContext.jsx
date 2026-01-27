import { createContext, useCallback, useMemo, useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const seedProjects = [
  {
    id: "p-1001",
    title: "Neighborhood Learning Lab",
    description:
      "A pop-up classroom with devices, tutors, and weekend workshops for local youth.",
    category: "education",
    imageUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80",
    ],
    goal: 12000,
    currentAmount: 6800,
    donorCount: 42,
    status: "active",
  },
  {
    id: "p-1002",
    title: "Community Solar Garden",
    description:
      "Shared solar panels for residents who cannot install their own rooftop systems.",
    category: "environment",
    imageUrl:
      "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=900&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=900&q=80",
    ],
    goal: 30000,
    currentAmount: 21400,
    donorCount: 96,
    status: "active",
  },
  {
    id: "p-1003",
    title: "Mobile Health Clinic",
    description:
      "Monthly wellness visits and screenings for underserved blocks.",
    category: "health",
    imageUrl:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80",
    galleryUrls: [],
    goal: 18000,
    currentAmount: 18000,
    donorCount: 73,
    status: "funded",
  },
  {
    id: "p-1004",
    title: "After-School Arts Collective",
    description:
      "Studio space, supplies, and mentorship for emerging community artists.",
    category: "arts",
    imageUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80",
    galleryUrls: [],
    goal: 9500,
    currentAmount: 4100,
    donorCount: 28,
    status: "active",
  },
  {
    id: "p-1005",
    title: "Clean Water Refill Station",
    description:
      "Install a public water refill kiosk to cut plastic waste and improve access.",
    category: "community",
    imageUrl:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
    galleryUrls: [],
    goal: 15000,
    currentAmount: 5200,
    donorCount: 31,
    status: "active",
  },
  {
    id: "p-1006",
    title: "Neighborhood Food Pantry Fridge",
    description:
      "A solar-powered community fridge stocked weekly with fresh groceries.",
    category: "community",
    imageUrl:
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80",
    galleryUrls: [],
    goal: 8000,
    currentAmount: 7600,
    donorCount: 54,
    status: "active",
  },
  {
    id: "p-1007",
    title: "Girls in Tech Kit Drive",
    description:
      "Starter kits and mentorship sessions for girls exploring coding and robotics.",
    category: "technology",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    galleryUrls: [],
    goal: 14000,
    currentAmount: 9300,
    donorCount: 61,
    status: "active",
  },
  {
    id: "p-1008",
    title: "Youth Soccer Equipment Drive",
    description:
      "Uniforms, cones, and balls for weekly practice in neighborhood parks.",
    category: "sports",
    imageUrl:
      "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=900&q=80",
    galleryUrls: [],
    goal: 6000,
    currentAmount: 2500,
    donorCount: 19,
    status: "active",
  },
];

export const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useLocalStorage("cdh-projects-v4", seedProjects);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

 const addProject = useCallback(
  (project) => {
    const id = `p-${Date.now()}`;
    const goal = Number(project.goal) || 0;
    const imageUrl = project.imageUrl ? project.imageUrl.trim() : "";
    const galleryUrls = Array.isArray(project.galleryUrls)
      ? project.galleryUrls.filter(Boolean)
      : (project.galleryUrls || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
    
    const newProject = {
      id,
      title: project.title.trim(),
      description: project.description.trim(),
      category: project.category || "community",
      imageUrl,
      galleryUrls,
      galleryCount: Number(project.galleryCount) || 0, // ADD THIS LINE
      goal,
      currentAmount: Number(project.currentAmount) || 0,
      donorCount: Number(project.donorCount) || 0,
      status: goal > 0 ? "active" : "draft",
    };

    setProjects((prev) => [newProject, ...prev]);
    return id;
  },
  [setProjects]
);


  const updateProject = useCallback(
    (id, updates) => {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === id ? { ...project, ...updates } : project
        )
      );
    },
    [setProjects]
  );

  const removeProject = useCallback(
    (id) => {
      setProjects((prev) => prev.filter((project) => project.id !== id));
    },
    [setProjects]
  );

  const addDonation = useCallback(
    (id, amount) => {
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== id) {
            return project;
          }

          const currentAmount = Number(project.currentAmount) || 0;
          const donorCount = Number(project.donorCount) || 0;
          const nextAmount = currentAmount + amount;
          const isFunded = project.goal && nextAmount >= project.goal;
          const nextStatus =
            project.status === "review" ? "review" : isFunded ? "funded" : "active";

          return {
            ...project,
            currentAmount: nextAmount,
            donorCount: donorCount + 1,
            status: nextStatus,
          };
        })
      );
    },
    [setProjects]
  );

  const getFeaturedProjects = useCallback(() => {
    const sorted = [...projects].sort((a, b) => {
      const aProgress = a.goal ? a.currentAmount / a.goal : 0;
      const bProgress = b.goal ? b.currentAmount / b.goal : 0;
      return bProgress - aProgress;
    });

    return sorted.slice(0, 3);
  }, [projects]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }, []);

  const value = useMemo(
    () => ({
      projects,
      isLoading,
      addProject,
      updateProject,
      removeProject,
      addDonation,
      getFeaturedProjects,
      formatCurrency,
    }),
    [
      projects,
      isLoading,
      addProject,
      updateProject,
      removeProject,
      addDonation,
      getFeaturedProjects,
      formatCurrency,
    ]
  );

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}
