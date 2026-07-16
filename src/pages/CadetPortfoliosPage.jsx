import { useEffect, useMemo, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import CadetDashboard from './CadetDashboard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

function formatRosterName(name) {
  const normalizedName = name?.trim();

  if (!normalizedName) {
    return 'Unnamed cadet';
  }

  const nameParts = normalizedName.split(/\s+/).filter(Boolean);

  if (nameParts.length === 1) {
    return nameParts[0];
  }

  const lastName = nameParts.at(-1);
  const firstNames = nameParts.slice(0, -1).join(' ');
  return `${lastName}, ${firstNames}`;
}

function CadetPortfoliosPage({ competitionCatalog = [] }) {
  const { user, loading } = useAuth();
  const [cadets, setCadets] = useState([]);
  const [cadetsLoading, setCadetsLoading] = useState(false);
  const [cadetsError, setCadetsError] = useState('');
  const [portfolioSearch, setPortfolioSearch] = useState('');
  const [selectedCadetId, setSelectedCadetId] = useState('');
  const [selectedCadetProfile, setSelectedCadetProfile] = useState(null);
  const [selectedCadetLoading, setSelectedCadetLoading] = useState(false);
  const [selectedCadetError, setSelectedCadetError] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadCadets = async () => {
      setCadetsLoading(true);
      setCadetsError('');

      const { data, error } = await supabase
        .from('cadet_profiles')
        .select('id, name, email, rank, platoon, role')
        .order('name', { ascending: true });

      if (error) {
        setCadetsError(error.message || 'Unable to load cadet portfolios.');
        setCadetsLoading(false);
        return;
      }

      setCadets(data || []);
      setCadetsLoading(false);
    };

    void loadCadets();
  }, [user]);

  const filteredCadets = useMemo(() => {
    const searchTerm = portfolioSearch.trim().toLowerCase();
    const matchingCadets = cadets.filter((cadet) =>
      [cadet.name, cadet.email, cadet.rank, cadet.platoon, cadet.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm))
    );

    return matchingCadets.sort((first, second) =>
      formatRosterName(first.name).localeCompare(formatRosterName(second.name))
    );
  }, [cadets, portfolioSearch]);

  const selectedCadetSummary = useMemo(
    () => cadets.find((item) => item.id === selectedCadetId) || null,
    [cadets, selectedCadetId]
  );

  const loadCadetProfile = async (cadetId) => {
    if (!cadetId) {
      setSelectedCadetId('');
      setSelectedCadetProfile(null);
      setSelectedCadetError('');
      return;
    }

    setSelectedCadetId(cadetId);
    setSelectedCadetProfile(null);
    setSelectedCadetLoading(true);
    setSelectedCadetError('');

    const { data, error } = await supabase
      .from('cadet_profiles')
      .select(
        'id, auth_user_id, name, email, rank, ns_level, platoon, role, is_admin, profile_photo_url, ribbons, competition_signups, overdue_forms, awards'
      )
      .eq('id', cadetId)
      .maybeSingle();

    if (error || !data) {
      setSelectedCadetError(error?.message || 'Unable to open that cadet portfolio.');
      setSelectedCadetLoading(false);
      return;
    }

    setSelectedCadetProfile(data);
    setSelectedCadetLoading(false);
  };

  if (loading) {
    return (
      <section className="page-section">
        <SectionHeader eyebrow="Cadet Tools" title="Loading..." text="Preparing cadet portfolios." />
        <div className="content-panel">
          <p>Loading cadet portfolios...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page-section">
        <SectionHeader
          eyebrow="Cadet Tools"
          title="Please log in"
          text="You need to be logged in before you can browse cadet portfolios."
        />
        <div className="content-panel">
          <p>
            <a href="#/login" className="ghost-button">
              Go to Log In
            </a>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Cadet Tools"
        title="Cadet portfolios"
        text="Choose a cadet to view their dashboard in read-only portfolio mode."
      />

      {(cadetsError || selectedCadetError) && (
        <div className="content-panel admin-alert-panel">
          {cadetsError && <p>{cadetsError}</p>}
          {selectedCadetError && <p>{selectedCadetError}</p>}
        </div>
      )}

      {!selectedCadetId ? (
        <div className="content-panel">
          <div className="admin-roster-toolbar">
            <label className="auth-field">
              <span className="auth-label">Search cadets</span>
              <input
                className="auth-input"
                type="search"
                value={portfolioSearch}
                onChange={(event) => setPortfolioSearch(event.target.value)}
                placeholder="Search by name, email, rank, platoon, or role"
              />
            </label>
            <div className="admin-roster-stats">
              <span className="admin-status-pill">{filteredCadets.length} shown</span>
              {cadetsLoading ? <span className="admin-status-pill">Loading roster...</span> : null}
            </div>
          </div>

          <div className="admin-cadet-list admin-cadet-list--roster">
            {filteredCadets.map((cadet) => (
              <button
                key={cadet.id}
                type="button"
                className="admin-cadet-list-item"
                onClick={() => void loadCadetProfile(cadet.id)}
              >
                <strong>{formatRosterName(cadet.name)}</strong>
                <span>{cadet.rank || 'No rank yet'}</span>
              </button>
            ))}
            {filteredCadets.length === 0 && (
              <p className="admin-empty-copy">No cadets matched that search.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="admin-dashboard-shell">
          <div className="admin-dashboard-toolbar">
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setSelectedCadetId('');
                setSelectedCadetProfile(null);
                setSelectedCadetError('');
              }}
            >
              Back to roster
            </button>
            <div className="admin-dashboard-meta">
              <p className="card-tag">Viewing portfolio</p>
              <h5>{formatRosterName(selectedCadetSummary?.name || selectedCadetProfile?.name)}</h5>
            </div>
          </div>

          {selectedCadetLoading && <p className="admin-helper-copy">Opening cadet portfolio...</p>}

          {selectedCadetProfile && !selectedCadetLoading ? (
            <CadetDashboard
              competitionCatalog={competitionCatalog}
              managedProfile={selectedCadetProfile}
              managedEmail={selectedCadetProfile.email || ''}
              readOnly
            />
          ) : null}
        </div>
      )}
    </section>
  );
}

export default CadetPortfoliosPage;
