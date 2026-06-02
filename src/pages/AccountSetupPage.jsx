import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';

function AccountSetupPage() {
  const { authEvent, loading, session, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (message) {
      const timeoutId = window.setTimeout(() => {
        window.location.hash = '#/dashboard';
      }, 1800);

      return () => window.clearTimeout(timeoutId);
    }

    return undefined;
  }, [message]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!password || !confirmPassword) {
      setError('Enter and confirm your new password.');
      return;
    }

    if (password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updateResult = await Promise.race([
        updatePassword(password),
        new Promise((_, reject) => {
          window.setTimeout(() => {
            reject(new Error('Password update timed out. Request a fresh setup link and try again.'));
          }, 15000);
        }),
      ]);

      const { error: updateError } = updateResult;

      if (updateError) {
        setError(updateError.message || 'Unable to update your password.');
        return;
      }

      setMessage('Password updated. Redirecting to login...');
      window.setTimeout(() => {
        window.location.hash = '#/login';
      }, 1200);
    } catch (submitError) {
      setError(submitError.message || 'Unable to update your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Cadet Access"
        title="Set Your Password"
        text="Use the secure link from your email to choose a password for your cadet portal account."
      />

      <div className="content-panel">
        {loading ? (
          <p>Preparing your secure session...</p>
        ) : !session ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <p className="auth-support-copy">This password setup link is missing or expired. Request a new setup email from the login page.</p>
            <a href="#/login" className="ghost-button auth-action-button">
              Back to Login
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {authEvent && <p className="auth-status-chip">Auth state: {authEvent}</p>}

            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-field">
                <span className="auth-label">New password</span>
                <input
                  className="auth-input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Choose a secure password"
                />
              </label>

              <label className="auth-field">
                <span className="auth-label">Confirm password</span>
                <input
                  className="auth-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                />
              </label>

              {error && <p className="auth-message auth-message--error">{error}</p>}
              {message && <p className="auth-message auth-message--success">{message}</p>}

              <button type="submit" className="join-button auth-action-button" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

export default AccountSetupPage;
