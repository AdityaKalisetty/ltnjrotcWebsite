import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function CadetSupportPanel({ cadetId, canRequest = true }) {
  const [forms, setForms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [itemDescription, setItemDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const [{ data: formData, error: formError }, { data: requestData, error: requestError }, { data: assignmentData, error: assignmentError }] = await Promise.all([
      supabase.from('cadet_form_documents').select('id, title, description, file_url').order('title'),
      cadetId
        ? supabase.from('supply_requests').select('id, item_description, status, created_at').eq('cadet_id', cadetId).eq('status', 'pending').order('created_at', { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      cadetId
        ? supabase.from('cadet_form_assignments').select('id, form_title, event_name, due_date, status').eq('cadet_id', cadetId).eq('status', 'active').order('due_date')
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (!formError) setForms(formData || []);
    if (!requestError) setRequests(requestData || []);
    if (!assignmentError) setAssignments(assignmentData || []);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [cadetId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const requestedItem = itemDescription.trim();
    setMessage('');
    setError('');

    if (!requestedItem || !cadetId) {
      setError('Enter the uniform item you need.');
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase
      .from('supply_requests')
      .insert({ cadet_id: cadetId, item_description: requestedItem });

    if (insertError) {
      setError(insertError.message || 'Unable to send your request.');
    } else {
      setItemDescription('');
      setMessage('Your request was sent to Supply.');
      await loadData();
    }
    setSubmitting(false);
  };

  return (
    <div className="dashboard-summary-row cadet-support-row">
      <section className="dashboard-card">
        <p className="card-tag">Cadet Forms</p>
        {assignments.length > 0 && (
          <ul className="forms-list assigned-forms-list">
            {assignments.map((assignment) => {
              const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();

              return (
                <li key={assignment.id}>
                  <div className={`forms-list-item${isOverdue ? ' is-overdue' : ''}`}>
                    <span>{assignment.form_title}<small>{[assignment.event_name, assignment.due_date && `Due ${assignment.due_date}`].filter(Boolean).join(' · ')}</small></span>
                    <span>{isOverdue ? 'Overdue' : 'Assigned'}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {forms.length > 0 ? (
          <ul className="forms-list">
            {forms.map((form) => (
              <li key={form.id}>
                <a className="forms-list-item" href={form.file_url} download>
                  <span>
                    {form.title}
                    {form.description && <small>{form.description}</small>}
                  </span>
                  <span>Download</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No downloadable forms have been posted yet.</p>
        )}
      </section>

      {canRequest && (
        <section className="dashboard-card">
          <p className="card-tag">Uniform Request</p>
          <p className="supply-request-copy">Request a uniform item from Supply. You will be notified in person when it is ready.</p>
          <form className="supply-request-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span className="auth-label">Item needed</span>
              <input className="auth-input" value={itemDescription} onChange={(event) => setItemDescription(event.target.value)} placeholder="Example: NSU trousers, size 32R" maxLength="500" />
            </label>
            <button type="submit" className="join-button" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Request'}
            </button>
          </form>
          {error && <p className="auth-message auth-message--error">{error}</p>}
          {message && <p className="auth-message auth-message--success">{message}</p>}
          {requests.length > 0 && (
            <ul className="supply-request-list">
              {requests.slice(0, 4).map((request) => (
                <li key={request.id}>
                  <span>{request.item_description}</span>
                  <strong className={`supply-status supply-status--${request.status}`}>{request.status}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export default CadetSupportPanel;
