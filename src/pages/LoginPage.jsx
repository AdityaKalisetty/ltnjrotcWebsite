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
            <p>
              Only cadets who were preloaded by unit staff can access this portal. If you do not
              already have credentials, contact your instructors or admin team.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="cadet@example.com"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a secure password"
                />
              </label>

              {error && <p style={{ color: '#ffcccb' }}>{error}</p>}

              <button type="submit" className="join-button" disabled={isSubmitting}>
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <form onSubmit={handlePasswordSetupRequest} style={{ display: 'grid', gap: '1rem' }}>
              <h3 style={{ margin: 0 }}>Need to set or reset your password?</h3>
              <p style={{ margin: 0 }}>
                Enter your pre-approved cadet email and we will send you a secure password setup
                link.
              </p>

              <label>
                Cadet email
                <input
                  type="email"
                  value={setupEmail}
                  onChange={(event) => setSetupEmail(event.target.value)}
                  placeholder="cadet@example.com"
                />
              </label>

              {setupError && <p style={{ color: '#ffcccb' }}>{setupError}</p>}
              {setupMessage && <p style={{ color: '#b9dca8' }}>{setupMessage}</p>}

              <button type="submit" className="ghost-button" disabled={isSendingSetup}>
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
