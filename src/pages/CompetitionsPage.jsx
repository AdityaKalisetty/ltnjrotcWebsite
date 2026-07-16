import { useMemo, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

function CompetitionsPage({ competitionCatalog = [] }) {
  const { profile, loading, refreshProfile } = useAuth();
  const [savingCompetitionId, setSavingCompetitionId] = useState(null);

  const clearCompletedCompetition = (competitionId) => {
    if (typeof window === 'undefined') return;

    try {
      const rawCompleted = window.localStorage.getItem('cadetCompletedCompetitions') || '[]';
      const parsedCompleted = JSON.parse(rawCompleted);
      if (!Array.isArray(parsedCompleted)) return;

      const nextCompleted = parsedCompleted.filter((item) => item !== competitionId);
      window.localStorage.setItem('cadetCompletedCompetitions', JSON.stringify(nextCompleted));
    } catch (error) {
      console.error('Unable to clear completed competition state', error);
    }
  };

  const competitionSignups = useMemo(() => {
    const rawSignups = profile?.competition_signups;
    if (Array.isArray(rawSignups)) return rawSignups;
    if (typeof rawSignups === 'string') {
      try {
        const parsed = JSON.parse(rawSignups);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    }
    return [];
  }, [profile?.competition_signups]);

  const registeredCompetitionIds = useMemo(() => {
    return new Set(
      competitionSignups
        .map((item) => (typeof item === 'string' ? item : item?.competition_id || item?.id || ''))
        .filter(Boolean)
    );
  }, [competitionSignups]);

  const toggleRegistration = async (competitionId) => {
    if (!profile?.id) {
      return;
    }

    const event = competitionCatalog.find((item) => item.id === competitionId);
    if (!event) {
      return;
    }

    setSavingCompetitionId(competitionId);
    try {
      const currentSignups = [...competitionSignups];
      const isRegistered = registeredCompetitionIds.has(competitionId);
      const updatedSignups = isRegistered
        ? currentSignups.filter((item) => {
            const itemId = typeof item === 'string' ? item : item?.competition_id || item?.id || '';
            return itemId !== competitionId;
          })
        : [
            ...currentSignups,
            {
              competition_id: event.id,
              competition_name: event.name,
              date: event.date,
              location: event.location,
              registration_closes: event.registrationCloses,
              required_forms: event.formRequirements,
            },
          ];

      if (!isRegistered) {
        clearCompletedCompetition(competitionId);
      }

      const { error } = await supabase
        .from('cadet_profiles')
        .update({ competition_signups: updatedSignups })
        .eq('id', profile.id);

      if (error) {
        console.error('Unable to update competition registrations', error);
        return;
      }

      await refreshProfile();
    } finally {
      setSavingCompetitionId(null);
    }
  };

  if (loading) {
    return (
      <section className="page-section">
        <SectionHeader eyebrow="Competitions" title="Loading competitions..." text="Please wait while we load your registration details." />
      </section>
    );
  }

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Competition Registration"
        title="Open events for cadets"
        text="Browse active competitions, review the form requirements, and register so your dashboard shows the forms you need to complete."
      />

      <div className="feature-grid" style={{ gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {competitionCatalog.map((event) => {
          const isRegistered = registeredCompetitionIds.has(event.id);
          return (
            <article key={event.id} className="feature-card">
              <p className="card-tag">{event.types.join(' • ')}</p>
              <h3>{event.name}</h3>
              <p>{event.description}</p>
              <p style={{ margin: '0.8rem 0 0.4rem', color: 'var(--text-muted)' }}>
                {event.date} · {event.location}
              </p>
              <ul style={{ margin: '0.8rem 0 0', paddingLeft: '1rem', color: 'var(--text-soft)' }}>
                {event.formRequirements.map((requirement) => (
                  <li key={requirement.id}>{requirement.label}</li>
                ))}
              </ul>

              <button
                type="button"
                className="join-button"
                style={{ marginTop: '1rem' }}
                disabled={savingCompetitionId === event.id}
                onClick={() => toggleRegistration(event.id)}
              >
                {savingCompetitionId === event.id
                  ? 'Saving...'
                  : isRegistered
                  ? 'Unregister'
                  : 'Register'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default CompetitionsPage;
