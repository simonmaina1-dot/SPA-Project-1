import jsonServer from "json-server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "data");
const collectionsDir = path.join(dataDir, "collections");
const projectsDir = path.join(dataDir, "projects");
const dbPath = path.join(__dirname, "db.json");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const readJson = (filePath, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
};

ensureDir(collectionsDir);
ensureDir(projectsDir);

const loadCollections = () => ({
  projects: readJson(path.join(collectionsDir, "projects.json"), []),
  feedback: readJson(path.join(collectionsDir, "feedback.json"), []),
  admins: readJson(path.join(collectionsDir, "admins.json"), []),
});

const loadDonations = () => {
  if (!fs.existsSync(projectsDir)) return [];
  const donations = [];
  const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const donationsFile = path.join(projectsDir, entry.name, "donations.json");
    const projectDonations = readJson(donationsFile, []);
    donations.push(...projectDonations);
  }
  return donations;
};

const collections = loadCollections();
const db = {
  projects: collections.projects,
  donations: loadDonations(),
  feedback: collections.feedback,
  admins: collections.admins,
};

const server = jsonServer.create();
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();

const syncDataToDisk = () => {
  ensureDir(collectionsDir);
  ensureDir(projectsDir);

  const nextProjects = router.db.get("projects").value() || [];
  const nextDonations = router.db.get("donations").value() || [];
  const nextFeedback = router.db.get("feedback").value() || [];
  const nextAdmins = router.db.get("admins").value() || [];

  fs.writeFileSync(
    path.join(collectionsDir, "projects.json"),
    JSON.stringify(nextProjects, null, 2)
  );
  fs.writeFileSync(
    path.join(collectionsDir, "feedback.json"),
    JSON.stringify(nextFeedback, null, 2)
  );
  fs.writeFileSync(
    path.join(collectionsDir, "admins.json"),
    JSON.stringify(nextAdmins, null, 2)
  );

  const projectIds = new Set(nextProjects.map((project) => project.id));
  const donationsByProject = new Map();
  const unassignedDonations = [];

  for (const donation of nextDonations) {
    const projectId = donation.projectId;
    if (!projectId || !projectIds.has(projectId)) {
      unassignedDonations.push(donation);
      continue;
    }
    if (!donationsByProject.has(projectId)) donationsByProject.set(projectId, []);
    donationsByProject.get(projectId).push(donation);
  }

  for (const projectId of projectIds) {
    const projectDir = path.join(projectsDir, projectId);
    ensureDir(projectDir);
    const projectDonations = donationsByProject.get(projectId) || [];
    fs.writeFileSync(
      path.join(projectDir, "donations.json"),
      JSON.stringify(projectDonations, null, 2)
    );
  }

  const orphanDir = path.join(projectsDir, "_unassigned");
  if (unassignedDonations.length > 0) {
    ensureDir(orphanDir);
    fs.writeFileSync(
      path.join(orphanDir, "donations.json"),
      JSON.stringify(unassignedDonations, null, 2)
    );
  } else if (fs.existsSync(orphanDir)) {
    fs.rmSync(orphanDir, { recursive: true, force: true });
  }

  if (fs.existsSync(projectsDir)) {
    for (const entry of fs.readdirSync(projectsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name === "_unassigned") continue;
      if (!projectIds.has(entry.name)) {
        fs.rmSync(path.join(projectsDir, entry.name), {
          recursive: true,
          force: true,
        });
      }
    }
  }

  fs.writeFileSync(
    dbPath,
    JSON.stringify(
      {
        projects: nextProjects,
        donations: nextDonations,
        feedback: nextFeedback,
        admins: nextAdmins,
      },
      null,
      2
    )
  );
};

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
  const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  if (!isWrite) return next();

  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      syncDataToDisk();
    }
  });

  next();
});

server.use(router);

const port = process.env.PORT || 3002;
server.listen(port, () => {
  console.log(`JSON Server running on http://localhost:${port}`);
});
