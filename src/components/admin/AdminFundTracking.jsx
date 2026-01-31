import { useMemo } from "react";

const sourceLabels = {
  card: "Card",
  mpesa: "M-Pesa",
  bank: "Bank transfer",
  cash: "Cash",
  other: "Other",
};

const formatDate = (value) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const toTitleCase = (value) => {
  if (!value) return "General";
  return value
    .toString()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function AdminFundTracking({ projects, donations, formatCurrency }) {
  const usageEntries = useMemo(
    () =>
      projects.flatMap((project) =>
        (project.fundUsage || []).map((entry) => ({
          ...entry,
          projectId: project.id,
          projectTitle: project.title,
        }))
      ),
    [projects]
  );

  const usageSummary = useMemo(() => {
    const totalRaised = projects.reduce(
      (sum, project) => sum + (project.currentAmount || 0),
      0
    );
    const totalUsed = usageEntries.reduce(
      (sum, entry) => sum + (entry.amount || 0),
      0
    );
    const remaining = Math.max(0, totalRaised - totalUsed);

    const projectRows = projects.map((project) => {
      const used = (project.fundUsage || []).reduce(
        (sum, entry) => sum + (entry.amount || 0),
        0
      );
      return {
        id: project.id,
        title: project.title,
        raised: project.currentAmount || 0,
        used,
        remaining: Math.max(0, (project.currentAmount || 0) - used),
      };
    });

    return { totalRaised, totalUsed, remaining, projectRows };
  }, [projects, usageEntries]);

  const sourceSummary = useMemo(() => {
    const sourceMap = donations.reduce((acc, donation) => {
      const key = donation.source || "other";
      if (!acc[key]) {
        acc[key] = { source: key, count: 0, total: 0 };
      }
      acc[key].count += 1;
      acc[key].total += donation.amount || 0;
      return acc;
    }, {});

    return Object.values(sourceMap).sort((a, b) => b.total - a.total);
  }, [donations]);

  const recentUsage = useMemo(
    () =>
      [...usageEntries]
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
        .slice(0, 6),
    [usageEntries]
  );

  return (
    <article className="admin-card admin-card-wide admin-fund-tracking">
      <div className="admin-section-header">
        <div>
          <h3>Fund utilization</h3>
          <p className="admin-card-subtitle">
            Track donation sources and project spending updates from owners.
          </p>
        </div>
      </div>

      <div className="admin-fund-summary">
        <div className="admin-stat">
          <span className="admin-stat-value">
            {formatCurrency(usageSummary.totalRaised)}
          </span>
          <span className="admin-stat-label">Total raised</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">
            {formatCurrency(usageSummary.totalUsed)}
          </span>
          <span className="admin-stat-label">Total reported usage</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">
            {formatCurrency(usageSummary.remaining)}
          </span>
          <span className="admin-stat-label">Remaining balance</span>
        </div>
      </div>

      <div className="admin-fund-grid">
        <div className="admin-fund-panel">
          <h4>Project utilization</h4>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Raised</th>
                  <th>Used</th>
                  <th>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {usageSummary.projectRows.map((row) => (
                  <tr key={row.id}>
                    <td className="admin-table-title">{row.title}</td>
                    <td>{formatCurrency(row.raised)}</td>
                    <td>{formatCurrency(row.used)}</td>
                    <td>{formatCurrency(row.remaining)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-fund-panel">
          <h4>Donation sources</h4>
          <div className="admin-source-grid">
            {sourceSummary.length ? (
              sourceSummary.map((source) => (
                <div key={source.source} className="admin-source-row">
                  <div>
                    <p className="admin-row-title">
                      {sourceLabels[source.source] || "Other"}
                    </p>
                    <p className="admin-row-meta">{source.count} donations</p>
                  </div>
                  <span className="admin-row-amount">
                    {formatCurrency(source.total)}
                  </span>
                </div>
              ))
            ) : (
              <p className="admin-empty">No donation sources recorded yet.</p>
            )}
          </div>

          <div className="admin-divider" />

          <h4>Recent usage reports</h4>
          <div className="admin-source-list">
            {recentUsage.length ? (
              recentUsage.map((entry) => (
                <div key={entry.id} className="admin-source-row">
                  <div>
                    <p className="admin-row-title">{entry.projectTitle}</p>
                    <p className="admin-row-meta">
                      {formatDate(entry.date)} · {toTitleCase(entry.category)}
                    </p>
                  </div>
                  <span className="admin-row-amount">
                    {formatCurrency(entry.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="admin-empty">No fund usage updates yet.</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
