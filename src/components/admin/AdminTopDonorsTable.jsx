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
      <div className="admin-table-container">
        {donorMetrics.topDonors.length === 0 ? (
          <p className="admin-empty">No donor data yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Total Donated</th>
                <th>Donations</th>
                <th>Last Donation</th>
              </tr>
            </thead>
            <tbody>
              {donorMetrics.topDonors.map((donor) => (
                <tr key={donor.email}>
                  <td className="admin-table-title">
                    <div>
                      <p>{donor.name}</p>
                      <span className="admin-row-meta">{donor.email}</span>
                    </div>
                  </td>
                  <td>
                    <strong>{formatCurrency(donor.totalAmount)}</strong>
                  </td>
                  <td>
                    {donor.donationCount > 1 ? (
                      <span className="admin-pill">{donor.donationCount}x</span>
                    ) : (
                      donor.donationCount
                    )}
                  </td>
                  <td className="admin-row-meta">
                    {new Date(donor.lastDonation).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </article>
  );
}
