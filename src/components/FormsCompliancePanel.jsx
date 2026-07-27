import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function parseJson(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try { return JSON.parse(value); } catch { return []; }
}

function eventKey(event) {
  return `competition:${event.competition_id || event.id || event.competition_name || event.name}`;
}

function eventName(event) {
  return event.competition_name || event.name || 'Competition / event';
}

function FormsCompliancePanel({ cadets }) {
  const [forms, setForms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [assignmentFormTitle, setAssignmentFormTitle] = useState('');
  const [assignedCadetId, setAssignedCadetId] = useState('all');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentEventName, setAssignmentEventName] = useState('');
  const [expandedCadetId, setExpandedCadetId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const [{ data: formData, error: formError }, { data: assignmentData, error: assignmentError }, { data: overrideData, error: overrideError }] = await Promise.all([
      supabase.from('cadet_form_documents').select('id, title, description, file_url, storage_path').order('title'),
      supabase.from('cadet_form_assignments').select('id, cadet_id, form_title, event_name, due_date, status'),
      supabase.from('cadet_form_overrides').select('cadet_id, requirement_key'),
    ]);
    if (formError || assignmentError || overrideError) setError(formError?.message || assignmentError?.message || overrideError?.message || 'Unable to load form tools. Run the forms and supply SQL setup, then refresh.');
    else { setForms(formData || []); setAssignments(assignmentData || []); setOverrides(overrideData || []); }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadData(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const dismissedKeys = useMemo(() => new Set(overrides.map((item) => `${item.cadet_id}:${item.requirement_key}`)), [overrides]);
  const overdueCadets = useMemo(() => cadets.map((cadet) => {
    const competitionRequirements = parseJson(cadet.competition_signups).flatMap((event) => {
      const dueDate = event.due_date || event.date;
      const dueTime = Date.parse(dueDate || '');
      const key = eventKey(event);
      if (event.completed || Number.isNaN(dueTime) || dueTime >= Date.now() || dismissedKeys.has(`${cadet.id}:${key}`)) return [];
      return [{ key, title: eventName(event), dueDate, type: 'Competition / event' }];
    });
    const assignmentRequirements = assignments.filter((item) => {
      const dueTime = Date.parse(item.due_date || '');
      return item.cadet_id === cadet.id && item.status === 'active' && !Number.isNaN(dueTime) && dueTime < Date.now();
    }).map((item) => ({ key: `assignment:${item.id}`, assignmentId: item.id, title: item.form_title, dueDate: item.due_date, type: item.event_name || 'Assigned form' }));
    return { ...cadet, requirements: [...competitionRequirements, ...assignmentRequirements] };
  }).filter((cadet) => cadet.requirements.length > 0), [assignments, cadets, dismissedKeys]);

  const assignForm = async (event) => {
    event.preventDefault(); setMessage(''); setError('');
    const targets = assignedCadetId === 'all' ? cadets : cadets.filter((cadet) => cadet.id === assignedCadetId);
    if (!assignmentFormTitle.trim() || !assignmentDueDate || targets.length === 0) { setError('Enter a form name, a due date, and at least one cadet.'); return; }
    setSaving(true);
    const { error: assignError } = await supabase.from('cadet_form_assignments').insert(targets.map((cadet) => ({ cadet_id: cadet.id, form_title: assignmentFormTitle.trim(), event_name: assignmentEventName.trim(), due_date: assignmentDueDate })));
    if (assignError) setError(assignError.message || 'Unable to assign the form.');
    else { setAssignmentFormTitle(''); setAssignmentDueDate(''); setAssignmentEventName(''); setMessage(`Assigned ${assignmentFormTitle.trim()} to ${assignedCadetId === 'all' ? 'all cadets' : 'the selected cadet'}.`); await loadData(); }
    setSaving(false);
  };

  const dismissRequirement = async (cadetId, requirement) => {
    setError('');
    if (requirement.assignmentId) {
      const { error: updateError } = await supabase.from('cadet_form_assignments').update({ status: 'dismissed' }).eq('id', requirement.assignmentId);
      if (updateError) { setError(updateError.message || 'Unable to dismiss the assigned form.'); return; }
    } else {
      const { error: overrideError } = await supabase.from('cadet_form_overrides').upsert({ cadet_id: cadetId, requirement_key: requirement.key, status: 'dismissed' }, { onConflict: 'cadet_id,requirement_key' });
      if (overrideError) { setError(overrideError.message || 'Unable to dismiss the requirement.'); return; }
    }
    await loadData();
  };

  const deleteForm = async (form) => {
    setError('');
    const { error: deleteError } = await supabase.from('cadet_form_documents').delete().eq('id', form.id);
    if (deleteError) { setError(deleteError.message || 'Unable to remove the form.'); return; }
    await loadData();
  };

  return (
    <section className="admin-tab-section admin-section">
      <div className="modal-section-heading"><p className="card-tag">Forms & Compliance</p><h4>Cadet downloads, assignments, and overdue requirements</h4></div>
      <form className="admin-editor-card admin-stack-form" onSubmit={assignForm}><strong>Assign a form</strong><label className="auth-field"><span className="auth-label">Form name</span><input className="auth-input" value={assignmentFormTitle} onChange={(event) => setAssignmentFormTitle(event.target.value)} placeholder="Example: Medical Release" /></label><label className="auth-field"><span className="auth-label">Assign to</span><select className="auth-input" value={assignedCadetId} onChange={(event) => setAssignedCadetId(event.target.value)}><option value="all">All cadets</option>{cadets.map((cadet) => <option key={cadet.id} value={cadet.id}>{cadet.name || cadet.email}</option>)}</select></label><label className="auth-field"><span className="auth-label">Due date</span><input className="auth-input" type="date" value={assignmentDueDate} onChange={(event) => setAssignmentDueDate(event.target.value)} /></label><label className="auth-field"><span className="auth-label">Event / note (optional)</span><input className="auth-input" value={assignmentEventName} onChange={(event) => setAssignmentEventName(event.target.value)} /></label><button className="join-button" type="submit" disabled={saving}>Assign Form</button></form>
      <div className="admin-editor-card"><strong>Cadet download library</strong><div className="admin-mini-list">{forms.map((form) => <div className="admin-photo-row" key={form.id}><div className="admin-photo-meta"><strong>{form.title}</strong><span>{form.description || 'No description'}</span></div><a className="ghost-button" href={form.file_url} download>Download</a><button className="ghost-button" type="button" onClick={() => void deleteForm(form)}>Remove</button></div>)}{forms.length === 0 && <p className="admin-empty-copy">No forms are available yet.</p>}</div></div>
      <div className="admin-editor-card admin-compliance-card"><div className="admin-editor-card-header"><strong>Overdue cadets</strong><span className="admin-status-pill">{overdueCadets.length} cadets</span></div>{error && <p className="auth-message auth-message--error">{error}</p>}{message && <p className="auth-message auth-message--success">{message}</p>}<div className="admin-mini-list">{overdueCadets.map((cadet) => <div key={cadet.id} className="admin-overdue-cadet"><button type="button" className="admin-cadet-list-item" onClick={() => setExpandedCadetId((current) => current === cadet.id ? '' : cadet.id)}><strong>{cadet.name || cadet.email}</strong><span>{expandedCadetId === cadet.id ? 'Hide overdue forms' : 'View overdue forms'}</span></button>{expandedCadetId === cadet.id && <div className="admin-overdue-details">{cadet.requirements.map((requirement) => <div key={requirement.key} className="admin-compliance-row"><span>{requirement.title}</span><span>{requirement.type}</span><span>Due {requirement.dueDate}</span><button type="button" className="ghost-button" onClick={() => void dismissRequirement(cadet.id, requirement)}>Dismiss</button></div>)}</div>}</div>)}{overdueCadets.length === 0 && <p className="admin-empty-copy">No cadets currently have overdue requirements.</p>}</div></div>
    </section>
  );
}

export default FormsCompliancePanel;
