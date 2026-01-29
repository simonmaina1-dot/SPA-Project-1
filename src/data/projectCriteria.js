export const projectCriteria = [
  { key: "communityImpact", label: "Clear community impact" },
  { key: "budgetClarity", label: "Budget and funding plan included" },
  { key: "timelineReady", label: "Timeline and milestones defined" },
  { key: "stakeholderSupport", label: "Local stakeholder support confirmed" },
];

export const defaultCriteriaMet = projectCriteria.reduce((acc, item) => {
  acc[item.key] = false;
  return acc;
}, {});
