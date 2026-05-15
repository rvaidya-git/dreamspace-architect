import { useState } from 'react';
import * as db from '../utils/db';

export default function AuthScreen({ onAnonymous, onProfileCreated, onLogin, onLeaderboard }) {
  const [mode, setMode] = useState('home'); // 'home' | 'create' | 'login' | 'forgot'

  // Create form
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null); // null|'checking'|'available'|'taken'|'invalid'

  // Login form
  const [loginUsername, setLoginUsername] = useState('');

  // Forgot form
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotAction, setForgotAction] = useState(null); // null|'show'|'email' — which button is loading
  // null = idle, { type:'found', username } | { type:'emailed' } | { type:'not-found' } | { type:'error', message }
  const [forgotResult, setForgotResult] = useState(null);

  // Shared
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Create helpers ────────────────────────────────

  async function handleUsernameBlur() {
    const val = username.trim();
    if (!val) { setUsernameStatus(null); return; }
    if (db.validateUsername(val)) { setUsernameStatus('invalid'); return; }
    setUsernameStatus('checking');
    try {
      const available = await db.isUsernameAvailable(val);
      setUsernameStatus(available ? 'available' : 'taken');
    } catch {
      setUsernameStatus(null);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    const validErr = db.validateUsername(username);
    if (validErr) { setError(validErr); return; }
    if (usernameStatus === 'taken') { setError('That username is already taken.'); return; }
    setLoading(true);
    try {
      const profile = await db.createProfile(username, email);
      onProfileCreated(profile);
    } catch (ex) {
      setError(ex.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Login helper ──────────────────────────────────

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    const validErr = db.validateUsername(loginUsername);
    if (validErr) { setError('Please enter a valid username.'); return; }
    setLoading(true);
    try {
      const profile = await db.loginWithUsername(loginUsername);
      if (!profile) {
        setError("We couldn't find that username. Check your spelling!");
        return;
      }
      onLogin(profile);
    } catch (ex) {
      setError(ex.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Forgot helpers ────────────────────────────────

  async function handleShowUsername() {
    if (!forgotEmail.trim()) return;
    setForgotAction('show');
    setForgotResult(null);
    try {
      const found = await db.lookupUsernameByEmail(forgotEmail);
      if (found) {
        setForgotResult({ type: 'found', username: found });
      } else {
        setForgotResult({ type: 'not-found' });
      }
    } catch {
      setForgotResult({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setForgotAction(null);
    }
  }

  async function handleEmailUsername() {
    if (!forgotEmail.trim()) return;
    setForgotAction('email');
    setForgotResult(null);
    try {
      await db.emailUsernameRecovery(forgotEmail);
      setForgotResult({ type: 'emailed' });
    } catch {
      setForgotResult({ type: 'error', message: 'Failed to send email. Please try again.' });
    } finally {
      setForgotAction(null);
    }
  }

  function goToLoginWithUsername(u) {
    setLoginUsername(u);
    setMode('login');
    setForgotEmail('');
    setForgotResult(null);
    setError('');
  }

  // ── Reset ─────────────────────────────────────────

  function resetToHome() {
    setMode('home');
    setUsername(''); setEmail(''); setUsernameStatus(null);
    setLoginUsername('');
    setForgotEmail(''); setForgotAction(null); setForgotResult(null);
    setError('');
  }

  // ── Home ──────────────────────────────────────────
  if (mode === 'home') {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-logo">🏗️</div>
          <h1 className="auth-title">DreamSpace Architect</h1>
          <p className="auth-subtitle">Design the perfect room!</p>
          <div className="auth-options">
            <button className="btn-primary auth-option-btn" onClick={() => setMode('create')}>
              ✨ Create a Username
              <span className="auth-option-desc">Save your scores and resume on any device</span>
            </button>
            <button className="btn-secondary auth-option-btn" onClick={() => setMode('login')}>
              🔑 Log In With Username
              <span className="auth-option-desc">Continue where you left off</span>
            </button>
            <button className="btn-ghost auth-option-btn" onClick={onAnonymous}>
              🎮 Play Anonymously
              <span className="auth-option-desc">Play now — no saving</span>
            </button>
          </div>
          <button className="auth-leaderboard-link" onClick={onLeaderboard}>
            🏆 See the leaderboard
          </button>
        </div>
      </div>
    );
  }

  // ── Create account ────────────────────────────────
  if (mode === 'create') {
    const blocked = loading || usernameStatus === 'taken' || usernameStatus === 'invalid';
    const statusIcon =
      usernameStatus === 'checking'  ? '⏳' :
      usernameStatus === 'available' ? '✅' :
      usernameStatus === 'taken'     ? '❌' : null;

    return (
      <div className="auth-screen">
        <div className="auth-card">
          <button className="auth-back-btn" onClick={resetToHome}>← Back</button>
          <div className="auth-logo">✨</div>
          <h2 className="auth-title">Create Your Account</h2>
          <form className="auth-form" onSubmit={handleCreate}>
            <div className="auth-field">
              <label className="auth-label">Username</label>
              <div className="auth-input-wrap">
                <input
                  className={`auth-input${usernameStatus === 'taken' || usernameStatus === 'invalid' ? ' auth-input--error' : usernameStatus === 'available' ? ' auth-input--ok' : ''}`}
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setUsernameStatus(null); setError(''); }}
                  onBlur={handleUsernameBlur}
                  placeholder="e.g. cooldesigner42"
                  maxLength={20}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  required
                />
                {statusIcon && <span className="auth-input-status">{statusIcon}</span>}
              </div>
              {usernameStatus === 'taken'    && <p className="auth-field-msg auth-field-msg--error">That username is taken — try another!</p>}
              {usernameStatus === 'invalid'  && <p className="auth-field-msg auth-field-msg--error">3–20 chars: letters, numbers, _ or -</p>}
              {usernameStatus === 'available' && <p className="auth-field-msg auth-field-msg--ok">That username is available!</p>}
              {!usernameStatus && <p className="auth-field-hint">Letters, numbers, _ and - only. 3–20 characters.</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Email <span className="auth-optional">(optional)</span>
              </label>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <p className="auth-field-hint">
                Add your email so you can recover your username if you forget it.
              </p>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="btn-primary" type="submit" disabled={blocked}>
              {loading ? 'Creating account…' : '🚀 Create Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Login ─────────────────────────────────────────
  if (mode === 'login') {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <button className="auth-back-btn" onClick={resetToHome}>← Back</button>
          <div className="auth-logo">🔑</div>
          <h2 className="auth-title">Log In With Username</h2>
          <p className="auth-subtitle-small">
            Enter your username to pick up where you left off!
          </p>
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label className="auth-label">Your Username</label>
              <input
                className="auth-input"
                type="text"
                value={loginUsername}
                onChange={e => { setLoginUsername(e.target.value); setError(''); }}
                placeholder="e.g. cooldesigner42"
                maxLength={20}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                autoFocus
                required
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Finding your account…' : '🔑 Log In'}
            </button>
            <button
              type="button"
              className="auth-forgot-link"
              onClick={() => { setMode('forgot'); setError(''); }}
            >
              Forgot your username?
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Forgot username ───────────────────────────────
  const forgotBusy = forgotAction !== null;

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <button className="auth-back-btn" onClick={() => { setMode('login'); setForgotEmail(''); setForgotResult(null); }}>← Back</button>
        <div className="auth-logo">🔍</div>
        <h2 className="auth-title">Find Your Username</h2>
        <p className="auth-subtitle-small">
          Enter the email you used when you signed up.
        </p>

        {/* Result: found — show on screen */}
        {forgotResult?.type === 'found' && (
          <>
            <div className="auth-found-box">
              <p className="auth-found-label">Your username is:</p>
              <p className="auth-found-username">{forgotResult.username}</p>
            </div>
            <button
              className="btn-primary"
              onClick={() => goToLoginWithUsername(forgotResult.username)}
            >
              Log In With This Username →
            </button>
          </>
        )}

        {/* Result: email sent */}
        {forgotResult?.type === 'emailed' && (
          <>
            <div className="auth-success-box">
              <div className="auth-success-icon">📧</div>
              <p className="auth-success-text">
                We've sent your username to <strong>{forgotEmail}</strong>. Check your inbox, then come back and log in!
              </p>
            </div>
            <button className="btn-primary" onClick={() => setMode('login')}>
              Go to Login →
            </button>
          </>
        )}

        {/* Result: not found */}
        {forgotResult?.type === 'not-found' && (
          <p className="auth-error">
            We couldn't find an account with that email. Double-check what you entered when you signed up!
          </p>
        )}

        {/* Result: error */}
        {forgotResult?.type === 'error' && (
          <p className="auth-error">{forgotResult.message}</p>
        )}

        {/* Email form — always visible unless we have a found/emailed result */}
        {forgotResult?.type !== 'found' && forgotResult?.type !== 'emailed' && (
          <div className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Your Email</label>
              <input
                className="auth-input"
                type="email"
                value={forgotEmail}
                onChange={e => { setForgotEmail(e.target.value); setForgotResult(null); }}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                required
              />
            </div>
            <div className="auth-btn-row">
              <button
                className="btn-secondary"
                type="button"
                disabled={forgotBusy || !forgotEmail.trim()}
                onClick={handleShowUsername}
              >
                {forgotAction === 'show' ? 'Looking…' : '👀 Show My Username'}
              </button>
              <button
                className="btn-primary"
                type="button"
                disabled={forgotBusy || !forgotEmail.trim()}
                onClick={handleEmailUsername}
              >
                {forgotAction === 'email' ? 'Sending…' : '📧 Email My Username'}
              </button>
            </div>
          </div>
        )}

        {/* Allow trying a different email after not-found or error */}
        {(forgotResult?.type === 'not-found' || forgotResult?.type === 'error') && (
          <button
            className="btn-ghost"
            type="button"
            onClick={() => { setForgotResult(null); setForgotEmail(''); }}
          >
            Try a different email
          </button>
        )}
      </div>
    </div>
  );
}
