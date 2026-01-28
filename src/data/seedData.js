import db from "../../db.json";

const buildImageUrl = (projectId, file) =>
  file ? `/project-images/${projectId}/${file}` : "";

export const seedProjects = (db.projects || []).map((project) => {
  const imageUrl =
    project.imageUrl ||
    buildImageUrl(project.id, project.imageFile);
  const galleryUrls = Array.isArray(project.galleryUrls)
    ? project.galleryUrls.filter(Boolean)
    : (project.galleryFiles || []).map((file) =>
        buildImageUrl(project.id, file)
      );

  return {
    ...project,
    imageUrl,
    galleryUrls,
    galleryCount:
      Number(project.galleryCount) ||
      (Array.isArray(project.galleryFiles) ? project.galleryFiles.length : 0) ||
      galleryUrls.length,
  };
});

export const seedAdmins = db.admins || [];
export const seedDonations = db.donations || [];
export const seedFeedback = db.feedback || [];
