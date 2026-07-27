import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const {
    user,
    loading,
    isSupabaseConfigured,
    authUnavailableMessage,
    signInWithEmail,
    signUpWithEmail,
    requestPasswordReset,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [signupMessage, setSignupMessage] = useState('');
  const [signupError, setSignupError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

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
      const { error: logInError } = await signInWithEmail(email, password);
      if (logInError) {
        setError(logInError.message || 'Unable to log in.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    setSignupError('');
    setSignupMessage('');

    if (!fullName || !signupEmail || !signupPassword) {
      setSignupError('Name, email, and password are required.');
      return;
    }

    if (signupPassword.length < 8) {
      setSignupError('Use at least 8 characters for your password.');
      return;
    }

    setIsCreatingAccount(true);

    try {
      const { error: signUpError } = await signUpWithEmail({
        email: signupEmail,
        password: signupPassword,
        name: fullName,
      });

      if (signUpError) {
        setSignupError(signUpError.message || 'Unable to create your account.');
        return;
      }

      setSignupMessage(
        'Account created. Check your email, verify your address, then come back here to log in.'
      );
      setFullName('');
      setSignupEmail('');
      setSignupPassword('');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handlePasswordResetRequest = async (event) => {
    event.preventDefault();
    setResetError('');
    setResetMessage('');

    if (!resetEmail) {
      setResetError('Enter your email first.');
      return;
    }

    setIsSendingReset(true);

    try {
      const { error: requestError } = await requestPasswordReset(resetEmail);

      if (requestError) {
        setResetError(requestError.message || 'Unable to send a password reset email.');
        return;
      }

      setResetMessage('If that email exists, a password reset link has been sent.');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Cadet Access"
        title="Log In"
        text="Cadets can create an account, verify their email, and then log in to manage their own profile."
      />

      <div className="content-panel">
        {loading ? (
          <p>Checking your session...</p>
        ) : user ? (
          <div>
            <p>You are already logged in.</p>
            <a href="#/dashboard" className="ghost-button">
              Go to Dashboard
            </a>
          </div>
        ) : !isSupabaseConfigured ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <p className="auth-message auth-message--error">{authUnavailableMessage}</p>
            <p className="auth-support-copy">
              The public website is still available, but login, account creation, and password
              reset need the missing production Supabase configuration.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <p className="auth-support-copy">
              Create your own account with the email you want to use for NJROTC, verify it from
              your inbox, and then log in here. After that, you can fill out and update your
              dashboard profile at any time.
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
                {isSubmitting ? 'Logging In...' : 'Log In'}
              </button>
            </form>

            <form onSubmit={handleCreateAccount} className="auth-form auth-form--secondary">
              <h3 className="auth-form-title">Create account</h3>
              <p className="auth-support-copy auth-support-copy--tight">
                This creates your cadet portal account. After email verification, your profile will
                be ready for you to complete in the dashboard.
              </p>

              <label className="auth-field">
                <span className="auth-label">Full name</span>
                <input
                  className="auth-input"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Cadet name"
                />
              </label>

              <label className="auth-field">
                <span className="auth-label">Email</span>
                <input
                  className="auth-input"
                  type="email"
                  value={signupEmail}
                  onChange={(event) => setSignupEmail(event.target.value)}
                  placeholder="cadet@example.com"
                />
              </label>

              <label className="auth-field">
                <span className="auth-label">Password</span>
                <input
                  className="auth-input"
                  type="password"
                  value={signupPassword}
                  onChange={(event) => setSignupPassword(event.target.value)}
                  placeholder="Choose a password"
                />
              </label>

              {signupError && <p className="auth-message auth-message--error">{signupError}</p>}
              {signupMessage && <p className="auth-message auth-message--success">{signupMessage}</p>}

              <button type="submit" className="ghost-button auth-action-button" disabled={isCreatingAccount}>
                {isCreatingAccount ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <form onSubmit={handlePasswordResetRequest} className="auth-form auth-form--secondary">
              <h3 className="auth-form-title">Forgot your password?</h3>
              <p className="auth-support-copy auth-support-copy--tight">
                Enter your email and we will send you a secure link to reset your password.
              </p>

              <label className="auth-field">
                <span className="auth-label">Email</span>
                <input
                  className="auth-input"
                  type="email"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  placeholder="cadet@example.com"
                />
              </label>

              {resetError && <p className="auth-message auth-message--error">{resetError}</p>}
              {resetMessage && <p className="auth-message auth-message--success">{resetMessage}</p>}

              <button type="submit" className="ghost-button auth-action-button" disabled={isSendingReset}>
                {isSendingReset ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

export default LoginPage;
