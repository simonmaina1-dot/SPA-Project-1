export default function AdminTopDonorsTable({ donorMetrics, formatCurrency }) {
  return (
    <article className="admin-card admin-card-wide">
      <div className="admin-section-header">
        <div>
          <h3>Top Donors</h3>
          <p className="admin-card-subtitle">
            {donorMetrics.uniqueDonorCount} unique donors •{" "}
            {donorMetrics.repeatDonorCount} repeat donors
          </p>
        </div>
      </div>
      {donorMetrics.topDonors.length === 0 ? (
        <p className="admin-empty">No donor data yet.</p>
      ) : (
        <div className="donor-list">
          {donorMetrics.topDonors.map((donor, index) => (
            <div key={donor.email} className="admin-donor-row">
              <div className="admin-donor-info">
                <span className="admin-donor-name">
                  <span style={{ marginRight: '8px', color: '#1db954' }}>#{index + 1}</span>
                  {donor.name}
                </span>
                <span className="admin-donor-count">{donor.email}</span>
              </div>
              <span className="admin-donor-amount">
                {formatCurrency(donor.totalAmount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
