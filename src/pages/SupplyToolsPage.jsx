import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

function SupplyToolsPage() {
  const { user, profile, loading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loadingRequests, setLoadingRequests] = useState(false);

  const canManageSupply = Boolean(profile?.is_admin || profile?.role?.toLowerCase().includes('supply'));

  const loadRequests = async () => {
    setLoadingRequests(true);
    setError('');
    const { data, error: loadError } = await supabase
      .from('supply_requests')
      .select('id, item_description, status, created_at, cadet:cadet_profiles!supply_requests_cadet_id_fkey(name, rank, platoon)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (loadError) {
      setError(loadError.message || 'Unable to load supply requests.');
    } else {
      setRequests(data || []);
    }
    setLoadingRequests(false);
  };

  useEffect(() => {
    if (!canManageSupply) return undefined;

    const timer = window.setTimeout(() => {
      void loadRequests();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [canManageSupply]);

  const resolveRequest = async (requestId) => {
    const { error: updateError } = await supabase
      .from('supply_requests')
      .update({ status: 'resolved', resolved_at: new Date().toISOString(), resolved_by: profile.id })
      .eq('id', requestId);

    if (updateError) {
      setError(updateError.message || 'Unable to resolve the request.');
      return;
    }
    await loadRequests();
  };

  if (loading) return null;
  if (!user || !canManageSupply) {
    return (
      <section className="page-section"><SectionHeader eyebrow="Supply" title="Access restricted" text="Supply Tools is available to the Supply Officer and admins." /></section>
    );
  }

  const pendingRequests = requests.filter((request) => request.status === 'pending');

  return (
    <section className="page-section">
      <SectionHeader eyebrow="Supply" title="Supply requests" text="Mark a request resolved after the item has been handed to the cadet in person." />
      <div className="content-panel supply-tools-panel">
        <div className="admin-roster-toolbar"><span className="admin-status-pill">{pendingRequests.length} pending</span><button type="button" className="ghost-button" onClick={() => void loadRequests()} disabled={loadingRequests}>Refresh</button></div>
        {error && <p className="auth-message auth-message--error">{error}</p>}
        <div className="supply-tools-list">
          {requests.map((request) => (
            <article key={request.id} className="supply-tools-request">
              <div><strong>{request.cadet?.name || 'Cadet'}</strong><span>{[request.cadet?.rank, request.cadet?.platoon].filter(Boolean).join(' · ')}</span><p>{request.item_description}</p></div>
              {request.status === 'pending' ? <button type="button" className="join-button" onClick={() => void resolveRequest(request.id)}>Mark Resolved</button> : <span className="supply-status supply-status--resolved">Resolved</span>}
            </article>
          ))}
          {!loadingRequests && requests.length === 0 && <p className="admin-empty-copy">No supply requests yet.</p>}
        </div>
      </div>
    </section>
  );
}

export default SupplyToolsPage;
