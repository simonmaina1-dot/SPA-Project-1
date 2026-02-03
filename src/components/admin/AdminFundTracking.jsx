import { useMemo, useState } from "react";

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

export default function AdminFundTracking({ projects, donations, formatCurrency }) {
  const [selectedSource, setSelectedSource] = useState(null);

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

  const filteredDonations = useMemo(() => {
    if (!selectedSource) return [];
    return donations
      .filter((d) => (d.source || "other") === selectedSource)
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
      .slice(0, 10);
  }, [donations, selectedSource]);

  const recentUsage = useMemo(
    () =>
      [...usageEntries]
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
        .slice(0, 6),
    [usageEntries]
  );

  return (
    <article className="admin-card admin-card-wide">
      <div className="admin-section-header">
        <div>
          <h3>Fund Utilization</h3>
          <p className="admin-card-subtitle">
            Track donation sources and project spending updates from owners.
          </p>
        </div>
      </div>

      <div className="admin-fund-summary">
        <div className="admin-fund-item">
          <div className="admin-fund-value">
            {formatCurrency(usageSummary.totalRaised)}
          </div>
          <div className="admin-fund-label">Total Raised</div>
        </div>
        <div className="admin-fund-item">
          <div className="admin-fund-value">
            {formatCurrency(usageSummary.totalUsed)}
          </div>
          <div className="admin-fund-label">Total Used</div>
        </div>
        <div className="admin-fund-item">
          <div className="admin-fund-value">
            {formatCurrency(usageSummary.remaining)}
          </div>
          <div className="admin-fund-label">Remaining</div>
        </div>
      </div>

      <div className="admin-fund-grid">
        <div className="admin-fund-panel">
          <h4>Project Utilization</h4>
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
          <h4>Donation Sources</h4>
          <div className="admin-source-buttons">
            {sourceSummary.length ? (
              sourceSummary.map((source) => (
                <button
                  key={source.source}
                  type="button"
                  className={`admin-source-btn ${selectedSource === source.source ? "active" : ""}`}
                  onClick={() => setSelectedSource(
                    selectedSource === source.source ? null : source.source
                  )}
                >
                  <span className="admin-source-btn-label">
                    {sourceLabels[source.source] || "Other"}
                  </span>
                  <span className="admin-source-btn-count">
                    {source.count} donations
                  </span>
                  <span className="admin-source-btn-amount">
                    {formatCurrency(source.total)}
                  </span>
                </button>
              ))
            ) : (
              <p className="admin-empty">No donation sources recorded yet.</p>
            )}
          </div>

          {selectedSource && (
            <div className="admin-donor-list">
              <h5>
                {sourceLabels[selectedSource] || "Other"} Donors
                <button
                  type="button"
                  className="admin-close-btn"
                  onClick={() => setSelectedSource(null)}
                >
                  ×
                </button>
              </h5>
              {filteredDonations.length ? (
                filteredDonations.map((donation) => (
                  <div key={donation.id} className="admin-donor-row">
                    <div>
                      <p className="admin-row-title">
                        {donation.donorName || "Anonymous"}
                      </p>
                      <p className="admin-row-meta">
                        {formatDate(donation.createdAt)}
                      </p>
                    </div>
                    <span className="admin-row-amount">
                      {formatCurrency(donation.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="admin-empty">No donations from this source.</p>
              )}
            </div>
          )}

          <h4 className="mt-3">Recent Usage Reports</h4>
          <div className="admin-source-list">
            {recentUsage.length ? (
              recentUsage.map((entry) => (
                <div key={entry.id} className="admin-source-row">
                  <div>
                    <p className="admin-row-title">{entry.projectTitle}</p>
                    <p className="admin-row-meta">
                      {formatDate(entry.date)} · {entry.category || "General"}
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
