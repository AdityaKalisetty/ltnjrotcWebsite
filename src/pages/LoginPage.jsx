import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { user, loading, signInWithEmail, requestPasswordSetup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupMessage, setSetupMessage] = useState('');
  const [setupError, setSetupError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingSetup, setIsSendingSetup] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      window.location.hash = '#/dashboard';
    }
  }, [loading, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: signInError } = await signInWithEmail(email, password);
      if (signInError) {
        setError(signInError.message || 'Unable to sign in.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSetupRequest = async (event) => {
    event.preventDefault();
    setSetupError('');
    setSetupMessage('');

    if (!setupEmail) {
      setSetupError('Enter your school email address first.');
      return;
    }

    setIsSendingSetup(true);

    try {
      const { error: requestError } = await requestPasswordSetup(setupEmail);

      if (requestError) {
        setSetupError(requestError.message || 'Unable to send a password setup email.');
        return;
      }

      setSetupMessage(
        'If that email belongs to an approved cadet account, a password setup link has been sent.'
      );
    } finally {
      setIsSendingSetup(false);
    }
  };

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Cadet Access"
        title="Sign In"
        text="Sign in with the email and password assigned to your pre-approved cadet account."
      />

      <div className="content-panel">
        {loading ? (
          <p>Checking your session...</p>
        ) : user ? (
          <div>
            <p>You are already signed in.</p>
            <a href="#/dashboard" className="ghost-button">
              Go to Dashboard
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <p className="auth-support-copy">
              Only cadets who were preloaded by unit staff can access this portal. If you do not
              already have credentials, contact your instructors or admin team.
            </p>
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-field">
                <span className="auth-label">Email</span>
                <input
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="cadet@example.com"
                />
              </label>

              <label className="auth-field">
                <span className="auth-label">Password</span>
                <input
                  className="auth-input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                />
              </label>

              {error && <p className="auth-message auth-message--error">{error}</p>}

              <button type="submit" className="join-button auth-action-button" disabled={isSubmitting}>
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <form onSubmit={handlePasswordSetupRequest} className="auth-form auth-form--secondary">
              <h3 className="auth-form-title">Need to set or reset your password?</h3>
              <p className="auth-support-copy auth-support-copy--tight">
                Enter your pre-approved cadet email and we will send you a secure password setup
                link.
              </p>

              <label className="auth-field">
                <span className="auth-label">Cadet email</span>
                <input
                  className="auth-input"
                  type="email"
                  value={setupEmail}
                  onChange={(event) => setSetupEmail(event.target.value)}
                  placeholder="cadet@example.com"
                />
              </label>

              {setupError && <p className="auth-message auth-message--error">{setupError}</p>}
              {setupMessage && <p className="auth-message auth-message--success">{setupMessage}</p>}

              <button type="submit" className="ghost-button auth-action-button" disabled={isSendingSetup}>
                {isSendingSetup ? 'Sending...' : 'Email Me a Setup Link'}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

export default LoginPage;
