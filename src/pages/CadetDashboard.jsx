import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';

function CadetDashboard() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <section className="page-section">
        <SectionHeader eyebrow="Dashboard" title="Loading..." text="Please wait while your session is confirmed." />
        <div className="content-panel">
          <p>Loading your dashboard...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page-section">
        <SectionHeader eyebrow="Dashboard" title="Please sign in" text="You must be logged in to see your cadet dashboard." />
        <div className="content-panel">
          <p>
            <a href="#/login" className="ghost-button">
              Go to Login
            </a>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Cadet Dashboard"
        title="Welcome back"
        text="This is your personal space for profile details, upcoming events, and role-specific tools."
      />

      <div className="content-panel">
        <div className="dashboard-grid" style={{ display: 'grid', gap: '1.2rem' }}>
          <div className="feature-card" style={{ padding: '1rem' }}>
            <p className="card-tag">Profile</p>
            <h3>{profile?.name || user.email}</h3>
            {profile?.rank && <p>Rank: {profile.rank}</p>}
            {profile?.platoon && <p>Platoon: {profile.platoon}</p>}
            {profile?.role && <p>Role: {profile.role}</p>}
            <p>Email: {user.email}</p>
          </div>

          <div className="feature-card" style={{ padding: '1rem' }}>
            <p className="card-tag">Quick Links</p>
            <a href="#/photos">Browse Photos</a>
            <a href="#/calendar">View Calendar</a>
            <a href="#/current-month">Current Month</a>
          </div>
          <div className="feature-card" style={{ padding: '1rem' }}>
            <p className="card-tag">Awards</p>
            {profile?.awards && profile.awards.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {profile.awards.map((award, idx) => (
                  <li key={idx}>
                    {typeof award === 'string' ? award : award.name || JSON.stringify(award)}
                    {typeof award !== 'string' && award.type ? ` — ${award.type}` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No ribbons or medals</p>
            )}
          </div>

          <div className="feature-card" style={{ padding: '1rem' }}>
            <p className="card-tag">Session</p>
            <p>Logged in as</p>
            <p>{user.email}</p>
            <button type="button" className="ghost-button" onClick={signOut}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CadetDashboard;
